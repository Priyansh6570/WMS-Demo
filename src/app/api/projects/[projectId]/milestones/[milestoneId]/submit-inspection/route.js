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
    const { userName } = await request.json();

    try {
        const projectData = await readData();
        const projectIndex = projectData.projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        const project = projectData.projects[projectIndex];
        const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
        if (milestoneIndex === -1) return NextResponse.json({ message: 'Milestone not found' }, { status: 404 });

        const milestone = project.milestones[milestoneIndex];

        milestone.submit_for_review = "submitted";

        const historyEntry = {
            id: `edit_${Date.now()}`,
            editedAt: new Date().toISOString(),
            editedBy: userName || 'User',
            changes: [{
                field: 'Inspection',
                oldValue: 'Not Submitted',
                newValue: 'Submitted for Inspection'
            }],
        };
        
        milestone.editHistory = [historyEntry, ...(milestone.editHistory || [])];

        await writeData(projectData);

        return NextResponse.json({ message: 'Milestone submitted for inspection.', milestone });

    } catch (error) {
        console.error("Failed to submit for inspection:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}