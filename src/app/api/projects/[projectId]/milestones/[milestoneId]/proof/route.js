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
    const { proofOfWork } = await request.json();

    if (!proofOfWork) {
        return NextResponse.json({ message: 'Invalid proof of work data.' }, { status: 400 });
    }

    try {
        const projectData = await readData();
        const projectIndex = projectData.projects.findIndex(p => p.id === projectId);

        if (projectIndex === -1) {
            return NextResponse.json({ message: 'Project not found' }, { status: 404 });
        }

        const project = projectData.projects[projectIndex];
        const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);

        if (milestoneIndex === -1) {
            return NextResponse.json({ message: 'Milestone not found' }, { status: 404 });
        }

        const milestone = project.milestones[milestoneIndex];

        if (!milestone.proofOfWork) {
            milestone.proofOfWork = { photos: { before: [], during: [], after: [] }, documents: [] };
        }

        milestone.proofOfWork.photos.before.push(...(proofOfWork.photos?.before || []));
        milestone.proofOfWork.photos.during.push(...(proofOfWork.photos?.during || []));
        milestone.proofOfWork.photos.after.push(...(proofOfWork.photos?.after || []));
        milestone.proofOfWork.documents.push(...(proofOfWork.documents || []));

        const historyEntry = {
            id: `edit_${Date.now()}`,
            editedAt: new Date().toISOString(),
            editedBy: proofOfWork.submittedBy || 'System',
            changes: [{
                field: 'Proof of Work',
                oldValue: 'N/A',
                newValue: 'New proofs were added.',
            }],
        };
        milestone.editHistory = [historyEntry, ...(milestone.editHistory || [])];


        await writeData(projectData);

        return NextResponse.json({ message: 'Proof of work added successfully.', milestone });

    } catch (error) {
        console.error("Failed to add proof of work:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}