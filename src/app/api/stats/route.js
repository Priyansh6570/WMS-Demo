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
        return fileName === 'users.json' ? { users: [] } : fileName === 'monuments.json' ? { monuments: [] } : { projects: [] };
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

const calculateProjectAnalytics = (project, monument) => {
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

const analyzeUserActivity = (users, projects) => {
    return users.map(user => {
        // Count user's projects
        const userProjects = projects.filter(p => 
            p.contractorId === user.id || 
            (p.workers && p.workers.some(w => w.id === user.id))
        );

        // Calculate activity metrics
        let editCount = 0;
        let lastActivityDate = user.lastLogin;

        projects.forEach(project => {
            if (project.editHistory) {
                const userEdits = project.editHistory.filter(edit => edit.userId === user.id);
                editCount += userEdits.length;
                
                // Find most recent activity
                userEdits.forEach(edit => {
                    if (!lastActivityDate || new Date(edit.editedAt) > new Date(lastActivityDate)) {
                        lastActivityDate = edit.editedAt;
                    }
                });
            }
            
            // Check milestone activities
            if (project.milestones) {
                project.milestones.forEach(milestone => {
                    if (milestone.editHistory) {
                        const milestoneEdits = milestone.editHistory.filter(edit => 
                            edit.editedBy === user.name
                        );
                        editCount += milestoneEdits.length;
                    }
                });
            }
        });

        return {
            ...user,
            projectsCount: userProjects.length,
            editCount,
            lastActivityDate,
            lastLoginFormatted: formatDate(user.lastLogin),
            activityScore: editCount + userProjects.length // Simple scoring
        };
    });
};

const analyzeMonuments = (monuments, projects) => {
    return monuments.map(monument => {
        const monumentProjects = projects.filter(p => p.monumentId === monument.id);
        
        const activeProjects = monumentProjects.filter(p => 
            p.status === 'active' || (p.milestones && p.milestones.some(m => m.status === 'active'))
        ).length;
        
        const completedProjects = monumentProjects.filter(p => p.status === 'completed').length;
        const totalProjects = monumentProjects.length;
        
        const totalInvestment = monumentProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const totalSpent = monumentProjects.reduce((sum, p) => {
            const spent = p.milestones?.reduce((mSum, m) => 
                m.status === 'completed' ? mSum + (m.budget || 0) : mSum, 0) || 0;
            return sum + spent;
        }, 0);
        
        const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
        
        // Count total milestones across all projects
        const allMilestones = monumentProjects.reduce((acc, p) => acc + (p.milestones?.length || 0), 0);
        const completedMilestones = monumentProjects.reduce((acc, p) => {
            return acc + (p.milestones?.filter(m => m.status === 'completed').length || 0);
        }, 0);
        
        return {
            id: monument.id,
            name: monument.name,
            condition: monument.currentStatus?.condition || 'unknown',
            location: monument.location?.text || 'Unknown location',
            activeProjects,
            completedProjects,
            totalProjects,
            totalInvestment,
            totalSpent,
            completionRate,
            allMilestones,
            completedMilestones,
            geoFenceRadius: monument.geoFenceRadius || 0,
            photosCount: monument.photos?.length || 0,
            lastUpdated: monument.updatedAt
        };
    });
};

const generateContractorPerformance = (projects, users) => {
    const contractors = users.filter(u => u.role === 'contractor');
    
    return contractors.map(contractor => {
        const contractorProjects = projects.filter(p => p.contractorId === contractor.id);
        
        const totalBudget = contractorProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const totalSpent = contractorProjects.reduce((sum, p) => {
            const spent = p.milestones?.reduce((mSum, m) => 
                m.status === 'completed' ? mSum + (m.budget || 0) : mSum, 0) || 0;
            return sum + spent;
        }, 0);
        
        const completedProjects = contractorProjects.filter(p => p.status === 'completed').length;
        const overdueProjects = contractorProjects.filter(p => {
            const endDate = new Date(p.timeline?.end || Date.now());
            return endDate < new Date() && p.status !== 'completed';
        }).length;
        
        const onTimeDelivery = contractorProjects.length > 0 
            ? ((contractorProjects.length - overdueProjects) / contractorProjects.length) * 100 
            : 0;
        
        return {
            id: contractor.id,
            name: contractor.name,
            totalProjects: contractorProjects.length,
            completedProjects,
            overdueProjects,
            totalBudget,
            totalSpent,
            budgetEfficiency: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
            onTimeDelivery: Math.round(onTimeDelivery),
            performanceScore: Math.round((onTimeDelivery + (completedProjects * 10)) / 2) // Custom scoring
        };
    });
};

export async function GET() {
    try {
        const usersData = await readJsonFile('users.json');
        const monumentsData = await readJsonFile('monuments.json');
        const projectsData = await readJsonFile('projects.json');

        const users = usersData.users || [];
        const monuments = monumentsData.monuments || [];
        const projects = projectsData.projects || [];
        const now = new Date();

        // Enhanced project analysis
        const detailedProjectsList = projects.map(project => {
            const monument = monuments.find(m => m.id === project.monumentId);
            return calculateProjectAnalytics(project, monument);
        });

        // Basic statistics
        const activeProjectsList = detailedProjectsList.filter(p => 
            p.status === 'active' || p.milestones?.some(m => m.status === 'active')
        );
        
        const completedProjectsList = detailedProjectsList.filter(p => p.status === 'completed');
        const overdueProjectsList = detailedProjectsList.filter(p => p.isOverdue);
        const upcomingProjectsList = detailedProjectsList.filter(p => p.isUpcoming)
            .sort((a, b) => a.daysUntilStart - b.daysUntilStart)
            .slice(0, 10);

        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const totalSpent = detailedProjectsList.reduce((sum, p) => sum + p.spentBudget, 0);
        const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

        // Monument analytics
        const monumentAnalytics = analyzeMonuments(monuments, detailedProjectsList);

        // User analytics
        const userAnalytics = analyzeUserActivity(users, projects);

        // Contractor performance
        const contractorPerformance = generateContractorPerformance(detailedProjectsList, users);

        // Quality and inspection analytics
        const qualityMetrics = {
            totalInspections: 0,
            approvedInspections: 0,
            rejectedInspections: 0,
            pendingInspections: 0
        };

        detailedProjectsList.forEach(project => {
            project.milestones?.forEach(milestone => {
                if (milestone.quality_manager_review) {
                    qualityMetrics.totalInspections += milestone.quality_manager_review.length;
                }
                
                if (milestone.admin_review === 'approved') {
                    qualityMetrics.approvedInspections++;
                } else if (milestone.admin_review === 'rejected') {
                    qualityMetrics.rejectedInspections++;
                } else if (milestone.submit_for_review === 'submitted') {
                    qualityMetrics.pendingInspections++;
                }
            });
        });

        // Financial analytics
        const financialMetrics = {
            totalBudgetAllocated: totalBudget,
            totalSpent: totalSpent,
            pendingPayments: 0,
            approvedPayments: 0,
            totalSavings: totalBudget - totalSpent
        };

        detailedProjectsList.forEach(project => {
            project.milestones?.forEach(milestone => {
                if (milestone.financial_record) {
                    financialMetrics.approvedPayments += milestone.budget || 0;
                } else if (milestone.status === 'completed') {
                    financialMetrics.pendingPayments += milestone.budget || 0;
                }
            });
        });

        // Timeline analytics
        const timelineAnalytics = {
            averageProjectDuration: detailedProjectsList.length > 0 
                ? Math.round(detailedProjectsList.reduce((sum, p) => sum + p.durationDays, 0) / detailedProjectsList.length)
                : 0,
            shortestProject: detailedProjectsList.length > 0 
                ? Math.min(...detailedProjectsList.map(p => p.durationDays))
                : 0,
            longestProject: detailedProjectsList.length > 0 
                ? Math.max(...detailedProjectsList.map(p => p.durationDays))
                : 0,
            onTimeProjects: detailedProjectsList.filter(p => !p.isOverdue && p.status === 'completed').length,
            delayedProjects: overdueProjectsList.length
        };

        // Recent activity with enhanced details
        let recentActivity = [];
        
        projects.forEach(p => {
            // Project updates
            p.editHistory?.forEach(h => {
                const user = users.find(u => u.id === h.userId);
                recentActivity.push({
                    type: 'Project Update',
                    text: `${h.editedBy} updated project: ${p.name}`,
                    date: h.editedAt,
                    link: `/WMS/projects/${p.id}`,
                    user: user?.name || h.editedBy,
                    userRole: user?.role || 'unknown',
                    importance: 'medium'
                });
            });
            
            // Milestone updates
            p.milestones?.forEach(m => {
                m.editHistory?.forEach(h => {
                    const user = users.find(u => u.name === h.editedBy);
                    recentActivity.push({
                        type: 'Milestone Update',
                        text: `${h.editedBy} updated milestone: ${m.name} in ${p.name}`,
                        date: h.editedAt,
                        link: `/WMS/projects/${p.id}/milestones/${m.id}`,
                        user: h.editedBy,
                        userRole: user?.role || 'unknown',
                        importance: m.status === 'completed' ? 'high' : 'medium'
                    });
                });
            });
        });

        // Sort by date and take recent ones
        recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
        recentActivity = recentActivity.slice(0, 15);

        // Growth rate calculation (dummy for now - you can implement based on historical data)
        const projectGrowthRate = activeProjectsList.length > 0 ? "12%" : "0%";

        // Risk analysis
        const riskAnalysis = {
            highRiskProjects: overdueProjectsList.length,
            budgetRiskProjects: detailedProjectsList.filter(p => p.budgetUtilization > 90).length,
            timelineRiskProjects: detailedProjectsList.filter(p => {
                const daysLeft = diffDays(new Date(), new Date(p.timeline?.end || Date.now()));
                return daysLeft < 7 && p.status === 'active';
            }).length
        };

        const stats = {
            // Basic stats
            totalUsers: users.length,
            totalMonuments: monuments.length,
            totalProjects: projects.length,
            totalBudget,
            totalSpent,
            budgetUtilization,
            
            // Project stats
            activeProjectsCount: activeProjectsList.length,
            completedProjectsCount: completedProjectsList.length,
            overdueProjectsCount: overdueProjectsList.length,
            upcomingProjectsCount: upcomingProjectsList.length,
            projectGrowthRate,
            
            // Detailed lists
            activeProjectsList,
            completedProjectsList,
            overdueProjectsList,
            upcomingProjectsList,
            detailedProjectsList,
            
            // Analytics
            monumentAnalytics,
            userAnalytics,
            contractorPerformance,
            qualityMetrics,
            financialMetrics,
            timelineAnalytics,
            riskAnalysis,
            
            // Activity
            recentActivity,
            
            // Additional insights
            insights: {
                mostActiveContractor: contractorPerformance.length > 0 
                    ? contractorPerformance.reduce((prev, current) => 
                        prev.performanceScore > current.performanceScore ? prev : current
                    ).name
                    : 'None',
                mostInvestedMonument: monumentAnalytics.length > 0
                    ? monumentAnalytics.reduce((prev, current) =>
                        prev.totalInvestment > current.totalInvestment ? prev : current
                    ).name
                    : 'None',
                avgBudgetPerProject: projects.length > 0 
                    ? Math.round(totalBudget / projects.length)
                    : 0,
                totalPhotosUploaded: detailedProjectsList.reduce((sum, p) => sum + p.totalPhotos, 0),
                totalDocumentsUploaded: detailedProjectsList.reduce((sum, p) => sum + p.totalDocuments, 0)
            }
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Failed to generate comprehensive dashboard stats:", error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error.message 
        }, { status: 500 });
    }
}