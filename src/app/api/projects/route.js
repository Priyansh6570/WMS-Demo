import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { generateId } from '@/lib/utils';

const getDbPath = () => path.join(process.cwd(), 'src', 'data', 'projects.json');

const readDb = async () => {
    const filePath = getDbPath();
    console.log("[DEBUG] Attempting to read file from:", filePath);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        console.log("[DEBUG] File read successfully, data length:", data.length);
        const parsed = data ? JSON.parse(data) : { projects: [] };
        console.log("[DEBUG] Parsed JSON, projects count:", parsed.projects?.length || 0);
        return parsed;
    } catch (error) {
        console.log("[DEBUG] Error reading file:", error.message);
        if (error.code === 'ENOENT') {
            console.log("[DEBUG] File doesn't exist, returning empty structure");
            return { projects: [] };
        }
        throw error;
    }
};

const writeDb = async (data) => {
    const filePath = getDbPath();
    console.log("[DEBUG] Attempting to write to:", filePath);
    console.log("[DEBUG] Data to write:", JSON.stringify(data, null, 2));
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log("[DEBUG] File written successfully");
        
        // Verify the write by reading it back
        const verification = await fs.readFile(filePath, 'utf-8');
        const verifiedData = JSON.parse(verification);
        console.log("[DEBUG] Verification read - projects count:", verifiedData.projects?.length || 0);
    } catch (error) {
        console.error("[DEBUG] Error writing file:", error);
        throw error;
    }
};

// GET all projects
export async function GET() {
  try {
    console.log("\n--- [GET /api/projects] Request received ---");
    const db = await readDb();
    console.log("[GET] Returning projects count:", db.projects?.length || 0);
    return NextResponse.json(db.projects || []);
  } catch (error) {
    console.error("[GET] Error:", error);
    return NextResponse.json({ message: "Failed to read projects." }, { status: 500 });
  }
}

export async function POST(request) {
  console.log("\n--- [POST /api/projects] Received a new request ---");
  
  try {
    // Check if the data directory exists
    const dataDir = path.join(process.cwd(), 'src', 'data');
    console.log("[0] Checking data directory:", dataDir);
    try {
      await fs.access(dataDir);
      console.log("[0] Data directory exists");
    } catch {
      console.log("[0] Data directory doesn't exist, creating it");
      await fs.mkdir(dataDir, { recursive: true });
    }

    const projectData = await request.json();
    console.log("[1] Request body parsed successfully:");
    console.log(JSON.stringify(projectData, null, 2));

    const db = await readDb();
    console.log("[2] Read projects.json file. Current project count:", db.projects?.length || 0);

    const newProject = { 
      ...projectData, 
      id: generateId('project'), 
      createdAt: new Date().toISOString() 
    };
    console.log("[3] Created new project object with ID:", newProject.id);
   
    if (!db.projects) {
        console.log("[3.5] Initializing projects array");
        db.projects = [];
    }
   
    db.projects.push(newProject);
    console.log("[4] Pushed new project to in-memory array. New count:", db.projects.length);

    await writeDb(db);
    console.log("✅ [5] Successfully wrote updated data to projects.json");
   
    return NextResponse.json(newProject, { status: 201 });

  } catch (error) {
    console.error("❌ [ERROR] An error occurred in POST /api/projects:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ 
      message: "Failed to create project.", 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}