import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const jsonFilePath = path.join(process.cwd(), 'src', 'data', 'projects.json');

async function readData() {
    try {
        const data = await fs.readFile(jsonFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return { projects: [] };
        throw error;
    }
}

async function writeData(data) {
    await fs.writeFile(jsonFilePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function POST(request, { params }) {
    const { projectId, milestoneId } = await params;
    const { userName } = await request.json(); // Get user name for history log

    try {
        const projectData = await readData();
        const projectIndex = projectData.projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        const project = projectData.projects[projectIndex];
        const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
        if (milestoneIndex === -1) return NextResponse.json({ message: 'Milestone not found' }, { status: 404 });

        const milestone = project.milestones[milestoneIndex];

        if (milestone.status !== 'pending') {
            return NextResponse.json({ message: 'Milestone has already been started or is completed.' }, { status: 400 });
        }

        // Update milestone status and add start date
        milestone.status = 'active';
        milestone.actualStartDate = new Date().toISOString();

        // Create an edit history entry for this action
        const historyEntry = {
            id: `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            editedAt: new Date().toISOString(),
            editedBy: userName || 'Contractor',
            changes: [{
                field: 'status',
                oldValue: 'pending',
                newValue: 'active'
            }],
        };
        
        milestone.editHistory = [historyEntry, ...(milestone.editHistory || [])];

        await writeData(projectData);

        return NextResponse.json({ message: 'Milestone started successfully.', milestone });

    } catch (error) {
        console.error("Failed to start milestone:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}