import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// Helper to read a specific JSON file
const readDb = async (fileName) => {
  const filePath = path.join(process.cwd(), 'src', 'data', fileName);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If a file doesn't exist, return a default structure to avoid crashing
    console.warn(`Could not read ${fileName}, returning default empty structure.`);
    if (fileName.includes('users')) return { users: [] };
    if (fileName.includes('monuments')) return { monuments: [] };
    if (fileName.includes('projects')) return { projects: [] };
    if (fileName.includes('milestones')) return { milestones: [] };
    return {};
  }
};

// GET /api/stats - Returns dashboard statistics
export async function GET() {
  try {
    // Read all data sources in parallel for efficiency
    const [usersDb, monumentsDb, projectsDb, milestonesDb] = await Promise.all([
      readDb('users.json'),
      readDb('monuments.json'),
      readDb('projects.json'),
      readDb('milestones.json')
    ]);

    const stats = {
      totalUsers: usersDb.users?.length || 0,
      totalMonuments: monumentsDb.monuments?.length || 0,
      totalProjects: projectsDb.projects?.length || 0,
      activeProjects: projectsDb.projects?.filter(p => p.status === 'active').length || 0,
      totalMilestones: milestonesDb.milestones?.length || 0,
      pendingMilestones: milestonesDb.milestones?.filter(m => ['pending', 'under_review'].includes(m.status)).length || 0,
      completedMilestones: milestonesDb.milestones?.filter(m => ['completed', 'approved'].includes(m.status)).length || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('API Stats Error:', error);
    return NextResponse.json({ message: "Failed to calculate statistics." }, { status: 500 });
  }
}