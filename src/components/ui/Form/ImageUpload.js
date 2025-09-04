'use client'

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function ImageUpload({ onUploadComplete, initialFiles = [] }) {
  const [files, setFiles] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    setError('');
    setUploading(true);
    const uploadedPaths = [...files];

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        uploadedPaths.push(result.path);

      } catch (err) {
        setError(`Failed to upload ${file.name}. Please try again.`);
        break; // Stop on first error
      }
    }
    
    setFiles(uploadedPaths);
    onUploadComplete(uploadedPaths);
    setUploading(false);
  }, [files, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif'] }
  });

const removeFile = async (pathToRemove) => {
    try {
        await fetch('/api/upload/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath: pathToRemove }),
        });
    } catch (err) {
        console.error("Failed to delete file from server:", err);
    }

    const updatedFiles = files.filter(path => path !== pathToRemove);
    setFiles(updatedFiles);
    onUploadComplete(updatedFiles);
  };

  return (
    <div className="text-gray-700 form-group">
      <label className="form-label">Monument Photos</label>
      <div {...getRootProps()} className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary-600 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <UploadCloud className="w-10 h-10 mb-2 text-gray-400" />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag & drop some files here, or click to select files</p>
          )}
          <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>
      
      {uploading && <div className="flex items-center mt-2 text-sm text-primary-600"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</div>}
      {error && <p className="mt-2 form-error">{error}</p>}
      
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {files.map((path, index) => (
            <div key={index} className="relative group">
              <Image
  src={path}
  alt={`upload preview ${index}`}
  width={96}   // h-24 → 24 × 4 = 96px
  height={96}
  className="object-cover rounded-md"
/>

              <button
                type="button"
                onClick={() => removeFile(path)}
                className="absolute p-1 text-white transition-opacity bg-red-600 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}