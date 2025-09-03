import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

// Generic DB helpers
const getDbPath = (fileName) => path.join(process.cwd(), "src", "data", fileName);

const readDb = async (fileName) => {
  try {
    const data = await fs.readFile(getDbPath(fileName), "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // File doesn't exist, return empty structure
      return { projects: [] };
    }
    throw error;
  }
};

const writeDb = async (fileName, data) => fs.writeFile(getDbPath(fileName), JSON.stringify(data, null, 2), "utf-8");

// GET a single project by ID
export async function GET(request, { params }) {
  try {
    
    const { projectId } = await params;
    console.log(`[GET /api/projects/${params.projectId}] Request received`);
    const db = await readDb("projects.json");

    console.log(`[GET] Searching for project with ID: ${projectId}`);
    console.log(`[GET] Total projects in database: ${db.projects?.length || 0}`);

    const project = db.projects?.find((p) => p.id === projectId);

    if (!project) {
      console.log(`[GET] Project not found: ${projectId}`);
      return NextResponse.json({ message: "Project not found." }, { status: 404 });
    }

    console.log(`[GET] Project found: ${project.name}`);
    return NextResponse.json(project);
  } catch (error) {
    console.error(`[GET] Error fetching project:`, error);
    return NextResponse.json(
      {
        message: "Failed to fetch project.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT (update) a single project
export async function PUT(request, { params }) {
  try {
    
    const { projectId } = await params;
    console.log(`[PUT /api/projects/${params.projectId}] Request received`);
    const updates = await request.json();

    console.log(`[PUT] Updating project ${projectId} with:`, updates);

    const db = await readDb("projects.json");
    const index = db.projects?.findIndex((p) => p.id === projectId);

    if (index === -1 || index === undefined) {
      console.log(`[PUT] Project not found: ${projectId}`);
      return NextResponse.json({ message: "Project not found." }, { status: 404 });
    }

    // Add updatedAt timestamp to the updates
    const updatedProject = {
      ...db.projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    db.projects[index] = updatedProject;
    await writeDb("projects.json", db);

    console.log(`[PUT] Project updated successfully: ${projectId}`);
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error(`[PUT] Error updating project:`, error);
    return NextResponse.json(
      {
        message: "Failed to update project.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
