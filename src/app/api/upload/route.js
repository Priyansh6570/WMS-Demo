import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { stat } from 'fs/promises';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    // Check for an optional 'type' field to direct the upload
    const type = formData.get('type') || 'monuments'; // Default to monuments

    if (!file) {
      return NextResponse.json({ message: 'No file found.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    
    // *** CHANGE: Determine upload directory based on type ***
    const uploadDir = path.join(process.cwd(), 'public', 'images', type === 'document' ? 'documents' : 'monuments');

    try {
        await stat(uploadDir);
    } catch (e) {
        if (e.code === 'ENOENT') {
            await fs.mkdir(uploadDir, { recursive: true });
        } else {
            throw e;
        }
    }

    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const publicPath = `/images/${type === 'document' ? 'documents' : 'monuments'}/${filename}`;
    return NextResponse.json({ message: 'File uploaded successfully.', path: publicPath }, { status: 201 });

  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ message: 'File upload failed.' }, { status: 500 });
  }
}