"use client";

import { useState, useEffect } from 'react';
import { dataManager } from '@/lib/data-manager';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Form/Input';
import CurrencyInput from '@/components/ui/Form/CurrencyInput';
import { PlusCircle, X, Paperclip, User, Phone, FileText, Calendar, DollarSign, Flag, Clock, Upload, CheckCircle2 } from 'lucide-react';

// Enhanced FileInput component with better visual feedback
const FileInput = ({ file, onFileChange, existingFileName }) => {
    const [dragOver, setDragOver] = useState(false);
    
    let displayName = 'Click to select or drag & drop file';
    let hasFile = false;
    
    if (file) {
        displayName = file.name;
        hasFile = true;
    } else if (existingFileName) {
        displayName = existingFileName;
        hasFile = true;
    }

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) onFileChange(droppedFile);
    };

    return (
        <div 
            className={`relative flex items-center p-4 border-2 border-dashed rounded-xl transition-all duration-200 ${
                dragOver 
                    ? 'border-blue-400 bg-blue-50' 
                    : hasFile 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
        >
            {hasFile ? <CheckCircle2 className="flex-shrink-0 w-5 h-5 mr-3 text-green-600" /> : <Upload className="flex-shrink-0 w-5 h-5 mr-3 text-gray-500" />}
            <span className={`text-sm truncate ${hasFile ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                {displayName}
            </span>
            <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => onFileChange(e.target.files[0])}
            />
        </div>
    );
};

// Helper function to track changes (keeping the same logic)
const trackChanges = (oldData, newData, excludeFields = ['id', 'createdAt', 'updatedAt', 'editHistory', 'workers', 'contractorId', 'contractorName']) => {
  const changes = [];
  
  const compareValues = (key, oldVal, newVal, path = key) => {
    if (excludeFields.includes(key)) return;
    
    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      const oldDocs = oldVal.map(d => ({name: d.name, path: d.path}));
      const newDocs = newVal.map(d => ({name: d.name, path: d.path}));
      if (JSON.stringify(oldDocs) !== JSON.stringify(newDocs)) {
        changes.push({ 
          field: path, 
          oldValue: `${oldVal.length} doc(s)`, 
          newValue: `${newVal.length} doc(s)` 
        });
      }
      return;
    }
    
    if (typeof oldVal === 'object' && typeof newVal === 'object' && oldVal !== null && newVal !== null) {
      Object.keys({...oldVal, ...newVal}).forEach(subKey => {
        compareValues(subKey, oldVal[subKey], newVal[subKey], `${path}.${subKey}`);
      });
      return;
    }
    
    const oldStr = oldVal === null || oldVal === undefined ? '' : String(oldVal);
    const newStr = newVal === null || newVal === undefined ? '' : String(newVal);
    
    if (oldStr !== newStr) {
      changes.push({ field: path, oldValue: oldVal, newValue: newVal });
    }
  };
  
  Object.keys(newData).forEach(key => {
    compareValues(key, oldData[key], newData[key]);
  });
  
  return changes;
};

export default function ProjectForm({ project, onSubmit }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        budget: null,
        startDate: '',
        endDate: '',
        documents: [],
        priority: 'medium',
        expectedDuration: '6',
    });
    const [contractorDetails, setContractorDetails] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                budget: project.budget || null,
                startDate: project.timeline?.start ? new Date(project.timeline.start).toISOString().split('T')[0] : '',
                endDate: project.timeline?.end ? new Date(project.timeline.end).toISOString().split('T')[0] : '',
                documents: project.documents ? project.documents.map((doc, index) => ({ id: index, name: doc.name, path: doc.path, file: null })) : [],
                priority: project.priority || 'medium',
                expectedDuration: project.timeline?.expectedDuration?.toString() || '6',
            });

            const fetchContractor = async () => {
                if (project.contractorId) {
                    try {
                        const contractorData = await dataManager.getUserById(project.contractorId);
                        setContractorDetails(contractorData);
                    } catch (err) {
                        console.error("Failed to fetch contractor details:", err);
                        setContractorDetails({ name: project.contractorName, mobile: 'N/A' });
                    }
                }
            };
            fetchContractor();
        }
    }, [project]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDocumentChange = (index, field, value) => {
        const newDocuments = [...formData.documents];
        newDocuments[index][field] = value;
        setFormData(prev => ({ ...prev, documents: newDocuments }));
    };

    const addDocumentField = () => {
        setFormData(prev => ({
            ...prev,
            documents: [...prev.documents, { id: Date.now(), name: '', file: null, path: '' }]
        }));
    };

    const removeDocumentField = (id) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter(doc => doc.id !== id)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const uploadedDocuments = await Promise.all(
                formData.documents.map(async (doc) => {
                    if (doc.file) {
                        const fileFormData = new FormData();
                        fileFormData.append('file', doc.file);
                        fileFormData.append('type', 'document');
                        
                        const response = await fetch('/api/upload', { method: 'POST', body: fileFormData });
                        if (!response.ok) throw new Error(`Failed to upload ${doc.file.name}`);
                        
                        const result = await response.json();
                        return { name: doc.name || doc.file.name, path: result.path };
                    }
                    if (doc.path) {
                        return { name: doc.name, path: doc.path };
                    }
                    return null;
                })
            );

            const finalPayload = {
                name: formData.name,
                description: formData.description,
                budget: formData.budget,
                timeline: {
                    start: formData.startDate,
                    end: formData.endDate,
                    expectedDuration: parseInt(formData.expectedDuration),
                },
                priority: formData.priority,
                documents: uploadedDocuments.filter(Boolean),
            };
            
            if (project) {
                const changes = trackChanges(project, finalPayload);
                
                if (changes.length > 0) {
                    const editHistoryEntry = {
                        id: `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        editedAt: new Date().toISOString(),
                        editedBy: user?.name || 'Unknown User',
                        userId: user?.id,
                        changes: changes
                    };

                    const existingHistory = project.editHistory || [];
                    finalPayload.editHistory = [editHistoryEntry, ...existingHistory];
                } else {
                    finalPayload.editHistory = project.editHistory || [];
                }
            }

            await onSubmit(finalPayload);

        } catch (err) {
            setError(err.message || 'Failed to update project.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const priorityOptions = [
        { value: 'low', label: 'Low Priority', color: 'text-green-600', bgColor: 'bg-green-50' },
        { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
        { value: 'high', label: 'High Priority', color: 'text-orange-600', bgColor: 'bg-orange-50' },
        { value: 'urgent', label: 'Urgent Priority', color: 'text-red-600', bgColor: 'bg-red-50' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <div className="max-w-5xl px-4 py-12 mx-auto">
                <div className="overflow-hidden bg-white border border-gray-200 rounded-3xl">
                    {/* Header */}
                    {/* <div className="px-8 py-8 bg-gradient-to-r from-blue-600 to-indigo-700">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-white/20 rounded-2xl">
                                <FileText className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">
                                    {project ? 'Edit Project' : 'Create New Project'}
                                </h1>
                                <p className="mt-1 text-blue-100">
                                    {project ? 'Update project details and timeline' : 'Fill in the details to create your new project'}
                                </p>
                            </div>
                        </div>
                    </div> */}

                    <form onSubmit={handleSubmit} className="p-10 space-y-12">
                        {/* Project Information */}
                        <div className="space-y-8">
                            <div className="flex items-center mb-8 space-x-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Project Information</h2>
                                    <p className="text-gray-600">Basic details about your project</p>
                                </div>
                            </div>
                            
                            <div className="grid gap-8 lg:grid-cols-2">
                                <div className="lg:col-span-2">
                                    <Input 
                                        label="Project Title" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        required 
                                        className="text-lg"
                                        placeholder="Enter a descriptive project name"
                                    />
                                </div>
                                
                                <div className="lg:col-span-2">
                                    <label className="block mb-3 text-base font-semibold text-gray-800">Project Description</label>
                                    <textarea 
                                        name="description" 
                                        value={formData.description} 
                                        onChange={handleChange} 
                                        className="w-full h-40 px-5 py-4 text-base transition-all duration-200 border-2 border-gray-200 resize-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                        required 
                                        placeholder="Provide a detailed description of the project scope, objectives, and key deliverables..."
                                    />
                                </div>
                                
                                <div>
                                    <label className="flex items-center mb-3 text-base font-semibold text-gray-800">
                                        <Flag className="w-5 h-5 mr-2 text-gray-600" />
                                        Priority Level
                                    </label>
                                    <div className="relative">
                                        <select 
                                            name="priority" 
                                            value={formData.priority} 
                                            onChange={handleChange} 
                                            className="w-full px-5 py-4 text-base font-medium bg-white border-2 border-gray-200 appearance-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {priorityOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                            <div className={`w-3 h-3 rounded-full ${priorityOptions.find(o => o.value === formData.priority)?.bgColor || 'bg-gray-200'}`}></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="flex items-center mb-3 text-base font-semibold text-gray-800">
                                        <Clock className="w-5 h-5 mr-2 text-gray-600" />
                                        Expected Duration
                                    </label>
                                    <select 
                                        name="expectedDuration" 
                                        value={formData.expectedDuration} 
                                        onChange={handleChange} 
                                        className="w-full px-5 py-4 text-base bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="1">1 Month</option>
                                        <option value="3">3 Months</option>
                                        <option value="6">6 Months</option>
                                        <option value="12">1 Year</option>
                                        <option value="18">1.5 Years</option>
                                        <option value="24">2 Years</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Budget & Timeline */}
                        <div className="space-y-8">
                            <div className="flex items-center mb-8 space-x-4">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Budget & Timeline</h2>
                                    <p className="text-gray-600">Financial planning and project scheduling</p>
                                </div>
                            </div>
                            
                            <div className="grid gap-8 lg:grid-cols-3">
                                <div className="lg:col-span-1">
                                    <CurrencyInput 
                                        label="Project Budget" 
                                        value={formData.budget} 
                                        onValueChange={(val) => setFormData(p => ({ ...p, budget: val }))} 
                                        required 
                                        className="text-lg font-semibold"
                                    />
                                </div>
                                <div>
                                    <Input 
                                        label="Start Date" 
                                        name="startDate" 
                                        type="date" 
                                        value={formData.startDate} 
                                        onChange={handleChange} 
                                        required 
                                        Icon={Calendar}
                                    />
                                </div>
                                <div>
                                    <Input 
                                        label="Expected End Date" 
                                        name="endDate" 
                                        type="date" 
                                        value={formData.endDate} 
                                        onChange={handleChange} 
                                        required 
                                        Icon={Calendar}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contractor Information */}
                        <div className="space-y-8">
                            <div className="flex items-center mb-8 space-x-4">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <User className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Contractor Information</h2>
                                    <p className="text-gray-600">Assigned contractor details</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                                <div className="p-6 border-2 border-gray-200 bg-gray-50 rounded-xl">
                                    <Input
                                        label="Contractor Name"
                                        value={contractorDetails?.name || 'Loading...'}
                                        disabled
                                        Icon={User}
                                        className="bg-white"
                                    />
                                </div>
                                {/* <div className="p-6 border-2 border-gray-200 bg-gray-50 rounded-xl">
                                    <Input
                                        label="Contact Number"
                                        value={contractorDetails?.mobile || 'Loading...'}
                                        disabled
                                        Icon={Phone}
                                        className="bg-white"
                                    />
                                </div> */}
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="space-y-8">
                            <div className="flex items-center mb-8 space-x-4">
                                <div className="p-3 bg-orange-100 rounded-xl">
                                    <FileText className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Project Documents</h2>
                                    <p className="text-gray-600">Upload relevant project files and documentation</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                {formData.documents.map((doc, index) => (
                                    <div key={doc.id} className="p-6 transition-colors duration-200 border-2 border-gray-200 bg-gray-50 rounded-2xl hover:border-gray-300">
                                        <div className="flex items-center gap-6">
                                            <div className="flex-1">
                                                <Input 
                                                    placeholder="Document Name (e.g., Project Proposal, Technical Specs)" 
                                                    value={doc.name} 
                                                    onChange={(e) => handleDocumentChange(index, 'name', e.target.value)}
                                                    className="bg-white border-2"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <FileInput 
                                                    file={doc.file} 
                                                    onFileChange={(file) => handleDocumentChange(index, 'file', file)} 
                                                    existingFileName={doc.path ? doc.name : null} 
                                                />
                                            </div>
                                            {formData.documents.length > 1 && (
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => removeDocumentField(doc.id)} 
                                                    className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl"
                                                >
                                                    <X className="w-5 h-5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={addDocumentField} 
                                    className="w-full h-16 text-base font-medium transition-all duration-200 border-gray-300 border-dashed border-3 hover:border-blue-400 hover:bg-blue-50 rounded-2xl"
                                >
                                    <PlusCircle className="w-6 h-6 mr-3" /> 
                                    Add Another Document
                                </Button>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="p-6 border-2 border-red-200 rounded-2xl bg-red-50">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-red-100 rounded-full">
                                        <X className="w-5 h-5 text-red-600" />
                                    </div>
                                    <p className="text-lg font-semibold text-red-800">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Submit Section */}
                        <div className="pt-8 border-t-2 border-gray-100">
                            <div className="flex justify-end">
                                <Button 
                                    type="submit" 
                                    loading={isSubmitting} 
                                    disabled={isSubmitting} 
                                    className="px-12 py-5 font-semibold transition-all duration-200 transform text-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
                                >
                                    {isSubmitting ? 'Saving Changes...' : project ? 'Update Project' : 'Create Project'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}