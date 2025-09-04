import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

function getDbPath() {
  return path.join(process.cwd(), 'src', 'data', 'users.json');
}

async function readDb() {
  const filePath = getDbPath();
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function writeDb(data) {
  const filePath = getDbPath();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function PUT(request, { params }) {
  try {
    const { userId } = await params;
    const updates = await request.json();
    const db = await readDb();

    const userIndex = db.users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (updates.mobile && db.users.some(u => u.mobile === updates.mobile && u.id !== userId)) {
        return NextResponse.json({ message: "Another user with this mobile number already exists." }, { status: 409 });
    }
    
    const updatedUser = {
      ...db.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    db.users[userIndex] = updatedUser;
    await writeDb(db);

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ message: "Failed to update user." }, { status: 500 });
  }
}