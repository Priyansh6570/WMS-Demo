'use client';

import { useState } from 'react';
import { PlusCircle, Trash2, Camera, File, UploadCloud, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Form/Input';

const FileUploadField = ({ onFileChange, file, onRemove, children, accept }) => (
    <div className="relative">
        {file ? (
            <div className="relative group">
                {file.type?.startsWith('image/') ? (
                    <div className="relative">
                        <img 
                            src={URL.createObjectURL(file)} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button 
                            onClick={onRemove} 
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <File className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                            </div>
                            <button 
                                onClick={onRemove} 
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="relative p-6 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors group cursor-pointer">
                {children}
                <input 
                    type="file" 
                    onChange={(e) => onFileChange(e.target.files[0])} 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept={accept}
                />
            </div>
        )}
    </div>
);

const PhotoSection = ({ title, photos, onPhotoChange }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">{title}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => (
                <div key={index} className="space-y-3">
                    <FileUploadField
                        file={photo.file}
                        onFileChange={(file) => onPhotoChange(index, 'file', file)}
                        onRemove={() => onPhotoChange(index, 'remove')}
                        accept="image/*"
                    >
                        <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Click to add photo</p>
                        <p className="text-xs text-gray-400">JPG, PNG, GIF up to 10MB</p>
                    </FileUploadField>
                    <Input
                        placeholder="Describe this photo..."
                        value={photo.about}
                        onChange={(e) => onPhotoChange(index, 'about', e.target.value)}
                        className="text-sm"
                    />
                </div>
            ))}
            <button 
                type="button" 
                onClick={() => onPhotoChange(null, 'add')} 
                className="flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors min-h-[120px]"
            >
                <PlusCircle className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Add Photo</span>
            </button>
        </div>
    </div>
);

export default function ProofOfWorkForm({ onSubmit, isSubmitting }) {
    const [formData, setFormData] = useState({
        photos: { 
            before: [{ file: null, about: '' }], 
            during: [{ file: null, about: '' }], 
            after: [{ file: null, about: '' }] 
        },
        documents: [{ file: null, name: '' }],
    });

    const handlePhotoChange = (category, index, field, value) => {
        const newPhotos = [...formData.photos[category]];
        if (field === 'add') {
            newPhotos.push({ file: null, about: '' });
        } else if (field === 'remove') {
            newPhotos.splice(index, 1);
            // Keep at least one empty slot
            if (newPhotos.length === 0) {
                newPhotos.push({ file: null, about: '' });
            }
        } else {
            newPhotos[index][field] = value;
        }
        setFormData(prev => ({ ...prev, photos: { ...prev.photos, [category]: newPhotos } }));
    };

    const handleDocumentChange = (index, field, value) => {
        const newDocuments = [...formData.documents];
        if (field === 'add') {
            newDocuments.push({ file: null, name: '' });
        } else if (field === 'remove') {
            newDocuments.splice(index, 1);
            // Keep at least one empty slot
            if (newDocuments.length === 0) {
                newDocuments.push({ file: null, name: '' });
            }
        } else {
            newDocuments[index][field] = value;
        }
        setFormData(prev => ({ ...prev, documents: newDocuments }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Filter out empty entries and use file name if description is empty
        const cleanData = {
            photos: {
                before: formData.photos.before.filter(p => p.file).map(p => ({
                    ...p,
                    about: p.about.trim() || p.file.name
                })),
                during: formData.photos.during.filter(p => p.file).map(p => ({
                    ...p,
                    about: p.about.trim() || p.file.name
                })),
                after: formData.photos.after.filter(p => p.file).map(p => ({
                    ...p,
                    about: p.about.trim() || p.file.name
                })),
            },
            documents: formData.documents.filter(d => d.file).map(d => ({
                ...d,
                name: d.name.trim() || d.file.name
            })),
        };
        
        onSubmit(cleanData);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 text-gray-700">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Proof of Work Submission</h2>
                    <p className="text-gray-600">Upload photos and documents to verify your completed work</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <PhotoSection 
                        title="Before Work Photos" 
                        photos={formData.photos.before} 
                        onPhotoChange={(index, field, value) => handlePhotoChange('before', index, field, value)} 
                    />
                    
                    <PhotoSection 
                        title="During Work Photos" 
                        photos={formData.photos.during} 
                        onPhotoChange={(index, field, value) => handlePhotoChange('during', index, field, value)} 
                    />
                    
                    <PhotoSection 
                        title="After Work Photos" 
                        photos={formData.photos.after} 
                        onPhotoChange={(index, field, value) => handlePhotoChange('after', index, field, value)} 
                    />

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Supporting Documents</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {formData.documents.map((doc, index) => (
                                <div key={index} className="space-y-3">
                                    <FileUploadField
                                        file={doc.file}
                                        onFileChange={(file) => handleDocumentChange(index, 'file', file)}
                                        onRemove={() => handleDocumentChange(index, 'remove')}
                                    >
                                        <File className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500 font-medium">Click to add document</p>
                                        <p className="text-xs text-gray-400">PDF, DOC, XLS, TXT up to 10MB</p>
                                    </FileUploadField>
                                    <Input 
                                        placeholder="Document description..." 
                                        value={doc.name} 
                                        onChange={(e) => handleDocumentChange(index, 'name', e.target.value)}
                                        className="text-sm"
                                    />
                                </div>
                            ))}
                            <button 
                                type="button" 
                                onClick={() => handleDocumentChange(null, 'add')} 
                                className="flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors min-h-[120px]"
                            >
                                <PlusCircle className="w-5 h-5 mb-1" />
                                <span className="text-xs font-medium">Add Document</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-200 flex justify-end">
                        <Button type="submit" size="lg" loading={isSubmitting} className="min-w-[180px]">
                            <UploadCloud className="w-5 h-5 mr-2" />
                            Submit All Proofs
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}