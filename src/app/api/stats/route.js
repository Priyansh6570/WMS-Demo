import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const readJsonFile = async (fileName) => {
    const filePath = path.join(process.cwd(), 'src', 'data', fileName);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const diffDays = (date1, date2) => {
    const diffTime = date2 - date1;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

        const detailedProjects = projects.map(p => {
            const monument = monuments.find(m => m.id === p.monumentId);
            const spentBudget = p.milestones?.reduce((sum, m) => m.status === 'completed' ? sum + m.budget : sum, 0) || 0;
            const remainingBudget = p.budget - spentBudget;
            
            const isActive = p.status === 'active' || p.milestones?.some(m => m.status === 'active');

            let timelineAlert = null;
            if (p.status === 'scheduled' && new Date(p.timeline.start) > now) {
                timelineAlert = { type: 'upcoming', days: diffDays(now, new Date(p.timeline.start)) };
            } else if (isActive && new Date(p.timeline.end) < now) {
                timelineAlert = { type: 'overdue', days: diffDays(new Date(p.timeline.end), now) };
            }

            return {
                ...p,
                monumentName: monument?.name || 'Unknown Monument',
                spentBudget,
                remainingBudget,
                isActive,
                timelineAlert,
            };
        });

        const activeProjectsList = detailedProjects.filter(p => p.status === 'active' || p.milestones?.some(m => m.status === 'active'));
        const overdueProjectsList = detailedProjects.filter(p => p.timelineAlert?.type === 'overdue');
        const upcomingProjectsList = detailedProjects.filter(p => p.timelineAlert?.type === 'upcoming').sort((a,b) => a.timelineAlert.days - b.timelineAlert.days).slice(0, 5);
        
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const totalSpent = detailedProjects.reduce((sum, p) => sum + p.spentBudget, 0);
        const budgetBreakdownData = [
            { name: 'Total Spent', value: totalSpent },
            { name: 'Remaining Budget', value: totalBudget - totalSpent }
        ];

        let recentActivity = [];
        projects.forEach(p => {
            p.editHistory?.forEach(h => recentActivity.push({
                type: 'Project Update',
                text: `${h.editedBy} updated project: ${p.name}`,
                date: h.editedAt,
                link: `/WMS/projects/${p.id}`
            }));
            p.milestones?.forEach(m => {
                m.editHistory?.forEach(h => recentActivity.push({
                    type: 'Milestone Update',
                    text: `${h.editedBy} updated milestone: ${m.name}`,
                    date: h.editedAt,
                    link: `/WMS/projects/${p.id}/milestones/${m.id}`
                }));
            });
        });
        recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const stats = {
            totalUsers: users.length,
            totalMonuments: monuments.length,
            totalProjects: projects.length,
            totalBudget,
            activeProjectsCount: activeProjectsList.length,
            overdueProjectsCount: overdueProjectsList.length,
            activeProjectsList,
            upcomingProjectsList,
            overdueProjectsList,
            budgetBreakdownData,
            recentActivity: recentActivity.slice(0, 7),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Failed to generate dashboard stats:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}