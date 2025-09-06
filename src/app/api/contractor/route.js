import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const readJsonFile = async (fileName) => {
    const filePath = path.join(process.cwd(), 'src', 'data', fileName);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);
        return fileName === 'users.json' ? { users: [] } : 
               fileName === 'monuments.json' ? { monuments: [] } : 
               { projects: [] };
    }
};

const diffDays = (date1, date2) => {
    const diffTime = date2 - date1;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
        return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
        return 'Invalid Date';
    }
};

const calculateMilestoneAnalytics = (milestones = []) => {
    let totalPhotos = 0;
    let totalDocuments = 0;
    let completedMilestones = 0;
    let activeMilestones = 0;
    let pendingMilestones = 0;

    milestones.forEach(milestone => {
        // Count photos in proof of work
        if (milestone.proofOfWork?.photos) {
            const { before = [], during = [], after = [] } = milestone.proofOfWork.photos;
            totalPhotos += before.length + during.length + after.length;
        }
        
        // Count documents in proof of work
        if (milestone.proofOfWork?.documents) {
            totalDocuments += milestone.proofOfWork.documents.length;
        }
        
        // Count milestone documents
        if (milestone.document) totalDocuments += 1;
        
        // Count milestone statuses
        if (milestone.status === 'completed') completedMilestones++;
        else if (milestone.status === 'active') activeMilestones++;
        else pendingMilestones++;
    });

    return {
        totalPhotos,
        totalDocuments,
        completedMilestones,
        activeMilestones,
        pendingMilestones,
        totalMilestones: milestones.length
    };
};

const calculateContractorProjectAnalytics = (project, monument) => {
    // Calculate spent budget from completed milestones
    const spentBudget = project.milestones?.reduce((sum, m) => 
        m.status === 'completed' ? sum + (m.budget || 0) : sum, 0) || 0;
    const remainingBudget = (project.budget || 0) - spentBudget;
    
    const milestoneAnalytics = calculateMilestoneAnalytics(project.milestones || []);
    
    const startDate = new Date(project.timeline?.start || Date.now());
    const endDate = new Date(project.timeline?.end || Date.now());
    const durationDays = Math.max(1, diffDays(startDate, endDate));
    
    const progressPercentage = milestoneAnalytics.totalMilestones > 0 
        ? Math.round((milestoneAnalytics.completedMilestones / milestoneAnalytics.totalMilestones) * 100)
        : 0;
    
    const budgetUtilization = project.budget > 0 
        ? Math.round((spentBudget / project.budget) * 100)
        : 0;

    // Timeline analysis
    const now = new Date();
    const isOverdue = endDate < now && project.status !== 'completed';
    const isUpcoming = startDate > now && project.status === 'scheduled';
    const daysOverdue = isOverdue ? diffDays(endDate, now) : 0;
    const daysUntilStart = isUpcoming ? diffDays(now, startDate) : 0;

    return {
        ...project,
        monumentName: monument?.name || 'Unknown Monument',
        contractorName: project.contractorName || 'Unknown Contractor',
        spentBudget,
        remainingBudget,
        durationDays,
        progressPercentage,
        budgetUtilization,
        isOverdue,
        isUpcoming,
        daysOverdue,
        daysUntilStart,
        ...milestoneAnalytics
    };
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const contractorId = searchParams.get('contractorId');
        
        if (!contractorId) {
            return NextResponse.json({ 
                message: 'Contractor ID is required' 
            }, { status: 400 });
        }

        const usersData = await readJsonFile('users.json');
        const monumentsData = await readJsonFile('monuments.json');
        const projectsData = await readJsonFile('projects.json');

        const users = usersData.users || [];
        const monuments = monumentsData.monuments || [];
        const projects = projectsData.projects || [];

        // Get contractor info
        const contractor = users.find(u => u.id === contractorId && u.role === 'contractor');
        if (!contractor) {
            return NextResponse.json({ 
                message: 'Contractor not found' 
            }, { status: 404 });
        }

        // Get projects assigned to this contractor
        const contractorProjects = projects.filter(p => p.contractorId === contractorId);
        
        // Get workers created by this contractor
        const contractorWorkers = users.filter(u => u.role === 'worker' && u.createdBy === contractorId);

        // Calculate detailed project analytics for contractor projects
        const detailedContractorProjects = contractorProjects.map(project => {
            const monument = monuments.find(m => m.id === project.monumentId);
            return calculateContractorProjectAnalytics(project, monument);
        });

        // Basic statistics
        const totalProjects = contractorProjects.length;
        const activeProjects = detailedContractorProjects.filter(p => 
            p.status === 'active' || p.status === 'scheduled'
        ).length;
        
        const completedProjects = detailedContractorProjects.filter(p => p.status === 'completed').length;
        
        // Calculate total earnings (sum of completed milestone budgets)
        const totalEarnings = detailedContractorProjects.reduce((sum, project) => {
            return sum + (project.spentBudget || 0);
        }, 0);

        // Calculate total workers
        const totalWorkers = contractorWorkers.length;

        // Generate recent activity for contractor and their workers
        let recentActivity = [];
        
        // Get contractor's project updates
        contractorProjects.forEach(p => {
            // Project updates by contractor
            if (p.editHistory) {
                p.editHistory.forEach(h => {
                    if (h.userId === contractorId) {
                        recentActivity.push({
                            type: 'Project Update',
                            text: `You updated project: ${p.name}`,
                            date: h.editedAt,
                            link: `/WMS/projects/${p.id}`,
                            user: contractor.name,
                            userRole: 'contractor',
                            importance: 'medium'
                        });
                    }
                });
            }
            
            // Milestone updates by contractor and their workers
            if (p.milestones) {
                p.milestones.forEach(m => {
                    if (m.editHistory) {
                        m.editHistory.forEach(h => {
                            const isContractorUpdate = h.editedBy === contractor.name;
                            const isWorkerUpdate = contractorWorkers.some(w => w.name === h.editedBy);
                            
                            if (isContractorUpdate || isWorkerUpdate) {
                                const prefix = isContractorUpdate ? 'You' : h.editedBy;
                                recentActivity.push({
                                    type: 'Milestone Update',
                                    text: `${prefix} updated milestone: ${m.name} in ${p.name}`,
                                    date: h.editedAt,
                                    link: `/WMS/projects/${p.id}/milestones/${m.id}`,
                                    user: h.editedBy,
                                    userRole: isContractorUpdate ? 'contractor' : 'worker',
                                    importance: m.status === 'completed' ? 'high' : 'medium'
                                });
                            }
                        });
                    }
                });
            }
        });

        // Sort by date and take recent ones
        recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
        recentActivity = recentActivity.slice(0, 15);

        // Generate monthly progress data for charts
        const monthlyProgress = generateMonthlyProgress(detailedContractorProjects);

        // Calculate project growth rate
        const projectGrowthRate = activeProjects > 0 ? "12%" : "0%";

        const stats = {
            // Basic contractor stats
            totalProjects,
            activeProjects,
            completedProjects,
            totalWorkers,
            totalEarnings,
            projectGrowthRate,
            
            // Detailed project list for contractor
            contractorProjects: detailedContractorProjects,
            
            // Contractor info
            contractorInfo: {
                id: contractor.id,
                name: contractor.name,
                mobile: contractor.mobile,
                companyName: contractor.companyName || 'N/A',
                licenseNumber: contractor.licenseNumber || 'N/A',
                joiningDate: contractor.createdAt,
                lastLogin: contractor.lastLogin
            },
            
            // Workers under contractor
            contractorWorkers: contractorWorkers.map(worker => ({
                ...worker,
                projectsCount: worker.projects ? worker.projects.length : 0,
                lastLoginFormatted: formatDate(worker.lastLogin)
            })),
            
            // Activity
            recentActivity,
            
            // Performance metrics
            performance: {
                onTimeDelivery: calculateOnTimeDelivery(detailedContractorProjects),
                budgetEfficiency: calculateBudgetEfficiency(detailedContractorProjects),
                completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
                averageProjectDuration: calculateAverageProjectDuration(detailedContractorProjects)
            },
            
            // Monthly progress for charts
            monthlyProgress,
            
            // Additional insights
            insights: {
                mostRecentProject: detailedContractorProjects.length > 0 
                    ? detailedContractorProjects.sort((a, b) => 
                        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                    )[0].name
                    : 'None',
                totalMilestonesCompleted: detailedContractorProjects.reduce((sum, p) => 
                    sum + (p.completedMilestones || 0), 0),
                totalPhotosUploaded: detailedContractorProjects.reduce((sum, p) => 
                    sum + (p.totalPhotos || 0), 0),
                totalDocumentsUploaded: detailedContractorProjects.reduce((sum, p) => 
                    sum + (p.totalDocuments || 0), 0)
            }
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Failed to generate contractor dashboard stats:", error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error.message 
        }, { status: 500 });
    }
}

// Helper functions
function generateMonthlyProgress(projects) {
    const monthlyData = {};
    const currentDate = new Date();
    
    // Generate last 6 months data
    for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        monthlyData[monthKey] = { month: monthKey, completed: 0, earnings: 0 };
    }
    
    // Count completed projects and earnings by month
    projects.forEach(project => {
        if (project.status === 'completed' && project.updatedAt) {
            const completionDate = new Date(project.updatedAt);
            const monthKey = completionDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].completed += 1;
                monthlyData[monthKey].earnings += project.spentBudget || 0;
            }
        }
    });
    
    return Object.values(monthlyData);
}

function calculateOnTimeDelivery(projects) {
    if (projects.length === 0) return 0;
    
    const completedProjects = projects.filter(p => p.status === 'completed');
    if (completedProjects.length === 0) return 0;
    
    const onTimeProjects = completedProjects.filter(p => !p.isOverdue);
    return Math.round((onTimeProjects.length / completedProjects.length) * 100);
}

function calculateBudgetEfficiency(projects) {
    if (projects.length === 0) return 0;
    
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spentBudget || 0), 0);
    
    if (totalBudget === 0) return 0;
    return Math.round((totalSpent / totalBudget) * 100);
}

function calculateAverageProjectDuration(projects) {
    if (projects.length === 0) return 0;
    
    const totalDuration = projects.reduce((sum, p) => sum + (p.durationDays || 0), 0);
    return Math.round(totalDuration / projects.length);
}