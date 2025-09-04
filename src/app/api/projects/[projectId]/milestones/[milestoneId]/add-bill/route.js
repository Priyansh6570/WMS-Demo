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
    const billData = await request.json();

    try {
        const projectData = await readData();
        const project = projectData.projects.find(p => p.id === projectId);
        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        const milestone = project.milestones.find(m => m.id === milestoneId);
        if (!milestone) return NextResponse.json({ message: 'Milestone not found' }, { status: 404 });

        // Set the financial_record field
        milestone.financial_record = {
            ...billData,
            submittedAt: new Date().toISOString(),
        };

        await writeData(projectData);
        return NextResponse.json({ message: 'Bill record added successfully.', milestone });
    } catch (error) {
        console.error("Failed to add bill record:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}