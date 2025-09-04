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
    const inspectionData = await request.json();

    try {
        const projectData = await readData();
        const project = projectData.projects.find(p => p.id === projectId);
        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        const milestone = project.milestones.find(m => m.id === milestoneId);
        if (!milestone) return NextResponse.json({ message: 'Milestone not found' }, { status: 404 });
        
        // Initialize the review array if it doesn't exist
        if (!milestone.quality_manager_review) {
            milestone.quality_manager_review = [];
        }

        // Add the new inspection record
        milestone.quality_manager_review.push({
            id: `insp_${Date.now()}`,
            submittedAt: new Date().toISOString(),
            ...inspectionData
        });
        
        milestone.inspectionVisitDate = inspectionData.visitDate;

        await writeData(projectData);
        return NextResponse.json({ message: 'Inspection record added successfully.', milestone });
    } catch (error) {
        console.error("Failed to add inspection record:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}