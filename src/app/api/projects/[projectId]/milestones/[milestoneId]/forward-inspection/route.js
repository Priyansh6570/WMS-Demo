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
        const project = projectData.projects.find(p => p.id === projectId);
        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        const milestone = project.milestones.find(m => m.id === milestoneId);
        if (!milestone) return NextResponse.json({ message: 'Milestone not found' }, { status: 404 });

        milestone.admin_review = "submitted";

        const historyEntry = {
            id: `edit_${Date.now()}`,
            editedAt: new Date().toISOString(),
            editedBy: userName,
            changes: [{ field: 'Inspection', oldValue: 'In Review', newValue: 'Forwarded to Admin' }],
        };
        milestone.editHistory = [historyEntry, ...(milestone.editHistory || [])];

        await writeData(projectData);
        return NextResponse.json({ message: 'Milestone forwarded to admin.', milestone });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}