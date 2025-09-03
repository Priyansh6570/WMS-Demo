import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json({ message: 'File path is required.' }, { status: 400 });
    }

    // Basic security check to prevent directory traversal attacks
    if (!filePath.startsWith('/images/monuments/')) {
        return NextResponse.json({ message: 'Invalid file path.' }, { status: 403 });
    }

    const fullPath = path.join(process.cwd(), 'public', filePath);

    // Check if file exists before attempting to delete
    try {
        await fs.access(fullPath);
        await fs.unlink(fullPath);
        return NextResponse.json({ message: 'File deleted successfully.' });
    } catch (error) {
        // If file doesn't exist, it's not a critical error, just inform the client
        if (error.code === 'ENOENT') {
            return NextResponse.json({ message: 'File not found on server.' }, { status: 404 });
        }
        throw error; // Re-throw other errors
    }

  } catch (error) {
    console.error('Delete API Error:', error);
    return NextResponse.json({ message: 'Failed to delete file.' }, { status: 500 });
  }
}