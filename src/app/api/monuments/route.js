import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { generateId } from '@/lib/utils';

// Generic DB helpers
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

// GET all monuments
export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json(db.monuments || []);
  } catch (error) {
    return NextResponse.json({ message: "Failed to read monuments." }, { status: 500 });
  }
}

// POST a new monument
export async function POST(request) {
  try {
    const monumentData = await request.json();
    const db = await readDb();
    const newMonument = { ...monumentData, id: generateId('monument'), createdAt: new Date().toISOString() };
    
    // Ensure the monuments array exists before pushing
    if (!db.monuments) {
        db.monuments = [];
    }
    
    db.monuments.push(newMonument);
    await writeDb(db);
    return NextResponse.json(newMonument, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create monument." }, { status: 500 });
  }
}