import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { generateId } from '@/lib/utils'; // We'll use our existing utility

// Helper function to get the full path to users.json
function getDbPath() {
  // process.cwd() gives the root of your project
  return path.join(process.cwd(), 'src', 'data', 'users.json');
}

// Helper function to read the user data
async function readDb() {
  const filePath = getDbPath();
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist or is empty, return a default structure
    if (error.code === 'ENOENT') {
      return { users: [] };
    }
    throw error;
  }
}

// Helper function to write to the user data
async function writeDb(data) {
  const filePath = getDbPath();
  // The 'null, 2' argument formats the JSON nicely in the file
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}


// --- API Functions ---

// GET /api/users
// Returns all users
export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json(db.users);
  } catch (error) {
    return NextResponse.json({ message: "Failed to read users data." }, { status: 500 });
  }
}

// POST /api/users
// Creates a new user
export async function POST(request) {
  try {
    const newUserRequest = await request.json();
    const db = await readDb();

    // Basic validation
    if (!newUserRequest.name || !newUserRequest.mobile || !newUserRequest.role) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // Check for existing user
    if (db.users.some(user => user.mobile === newUserRequest.mobile)) {
      return NextResponse.json({ message: "User with this mobile number already exists." }, { status: 409 });
    }

    const newUser = {
      ...newUserRequest,
      id: generateId('user'),
      createdAt: new Date().toISOString(),
      otp: "123456", // Default for demo
      isActive: true,
      profileImage: "/images/avatars/default-avatar.png",
    };

    db.users.push(newUser);
    await writeDb(db);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create user." }, { status: 500 });
  }
}