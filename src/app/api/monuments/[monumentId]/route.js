import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// Generic DB helpers (no changes here)
const getDbPath = () => path.join(process.cwd(), 'src', 'data', 'monuments.json');

const readDb = async () => {
    const filePath = getDbPath();
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return data ? JSON.parse(data) : { monuments: [] };
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { monuments: [] };
        }
        throw error;
    }
};

const writeDb = async (data) => {
    const filePath = getDbPath();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// GET /api/monuments/[monumentId]
export async function GET(request, context) {
  try {
    const { monumentId } = await context.params; // <-- FIX: Await context.params
    const db = await readDb();
    const monument = db.monuments.find(m => m.id === monumentId);

    if (!monument) {
      return NextResponse.json({ message: "Monument not found." }, { status: 404 });
    }
    return NextResponse.json(monument);
  } catch (error) {
    return NextResponse.json({ message: "Failed to read monument data." }, { status: 500 });
  }
}

// PUT (update) a single monument
export async function PUT(request, context) {
  try {
    const { monumentId } = await context.params; // <-- FIX: Await context.params
    const updates = await request.json();
    const db = await readDb();
    const index = db.monuments.findIndex(m => m.id === monumentId);
    if (index === -1) {
      return NextResponse.json({ message: "Monument not found." }, { status: 404 });
    }
    db.monuments[index] = { ...db.monuments[index], ...updates, updatedAt: new Date().toISOString() };
    await writeDb(db);
    return NextResponse.json(db.monuments[index]);
  } catch (error) {
    return NextResponse.json({ message: "Failed to update monument." }, { status: 500 });
  }
}