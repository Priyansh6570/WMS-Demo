import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const jsonFilePath = path.join(process.cwd(), "src", "data", "projects.json");

async function readData() {
  try {
    const data = await fs.readFile(jsonFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") return { projects: [] };
    throw error;
  }
}

async function writeData(data) {
  await fs.writeFile(jsonFilePath, JSON.stringify(data, null, 2), "utf8");
}

export async function POST(request, { params }) {
  const { projectId } = await params;
  const { milestones } = await request.json();

  if (!milestones || !Array.isArray(milestones)) {
    return NextResponse.json({ message: "Invalid milestones data provided." }, { status: 400 });
  }

  try {
    const projectData = await readData();
    const projectIndex = projectData.projects.findIndex((p) => p.id === projectId);

    if (projectIndex === -1) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const project = projectData.projects[projectIndex];

    const processedMilestones = milestones.map((m) => {
      if (!m.id || m.id.startsWith("new_")) {
        return {
          ...m,
          id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: m.status || "pending",
          createdAt: new Date().toISOString(),
        };
      }
      return m;
    });

    project.milestones = processedMilestones;
    project.updatedAt = new Date().toISOString();

    await writeData(projectData);

    return NextResponse.json({ message: "Milestones updated successfully", project });
  } catch (error) {
    console.error("Failed to update milestones:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
