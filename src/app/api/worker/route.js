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

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const workerId = searchParams.get('workerId');
        
        if (!workerId) {
            return NextResponse.json({ 
                message: 'Worker ID is required' 
            }, { status: 400 });
        }

        const usersData = await readJsonFile('users.json');
        const monumentsData = await readJsonFile('monuments.json');
        const projectsData = await readJsonFile('projects.json');

        const users = usersData.users || [];
        const monuments = monumentsData.monuments || [];
        const projects = projectsData.projects || [];

        // Get worker info
        const worker = users.find(u => u.id === workerId && u.role === 'worker');
        if (!worker) {
            return NextResponse.json({ 
                message: 'Worker not found' 
            }, { status: 404 });
        }

        // Get projects where this worker is assigned
        const workerProjects = projects.filter(project => 
            project.workers?.some(w => w.id === workerId)
        );

        // Calculate worker statistics
        const totalProjects = workerProjects.length;
        const activeProjects = workerProjects.filter(p => p.status === 'active').length;
        const completedProjects = workerProjects.filter(p => p.status === 'completed').length;

        // Calculate milestone statistics
        const allMilestones = workerProjects.reduce((acc, project) => {
            if (project.milestones) {
                return [...acc, ...project.milestones.map(m => ({ 
                    ...m, 
                    projectName: project.name, 
                    projectId: project.id,
                    monumentName: monuments.find(mon => mon.id === project.monumentId)?.name || 'Unknown'
                }))];
            }
            return acc;
        }, []);

        const totalMilestones = allMilestones.length;
        const activeMilestones = allMilestones.filter(m => m.status === 'active').length;
        const completedMilestones = allMilestones.filter(m => m.status === 'completed').length;
        const pendingMilestones = allMilestones.filter(m => m.status === 'pending').length;

        // Generate recent activity for worker
        let recentActivity = [];
        
        workerProjects.forEach(p => {
            // Milestone updates by this worker
            if (p.milestones) {
                p.milestones.forEach(m => {
                    if (m.editHistory) {
                        m.editHistory.forEach(h => {
                            if (h.editedBy === worker.name) {
                                recentActivity.push({
                                    type: 'Milestone Update',
                                    text: `You updated milestone: ${m.name} in ${p.name}`,
                                    date: h.editedAt,
                                    link: `/WMS/projects/${p.id}/milestones/${m.id}`,
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

        // Find contractor who created this worker
        const contractor = users.find(u => u.id === worker.createdBy && u.role === 'contractor');

        const stats = {
            totalProjects,
            activeProjects,
            completedProjects,
            totalMilestones,
            activeMilestones,
            completedMilestones,
            pendingMilestones,
            
            // Worker info
            workerInfo: {
                id: worker.id,
                name: worker.name,
                mobile: worker.mobile,
                joiningDate: worker.createdAt,
                lastLogin: worker.lastLogin,
                contractor: contractor ? {
                    id: contractor.id,
                    name: contractor.name,
                    mobile: contractor.mobile
                } : null
            },
            
            // Projects with details
            workerProjects: workerProjects.map(project => ({
                ...project,
                monumentName: monuments.find(m => m.id === project.monumentId)?.name || 'Unknown Monument'
            })),
            
            // All milestones
            allMilestones,
            
            // Recent activity
            recentActivity,
            
            // Performance metrics
            performance: {
                completionRate: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
                activeTasksCount: activeMilestones,
                projectInvolvementRate: totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0
            }
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Failed to generate worker dashboard stats:", error);
        return NextResponse.json({ 
            message: 'Internal Server Error',
            error: error.message 
        }, { status: 500 });
    }
}