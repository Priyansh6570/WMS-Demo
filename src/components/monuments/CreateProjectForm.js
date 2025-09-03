'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { dataManager } from '@/lib/data-manager';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Form/Input';
import CurrencyInput from '@/components/ui/Form/CurrencyInput';
import ContractorSelector from '@/components/monuments/ContractorSelector';
import { PlusCircle, X, Paperclip, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// File Input component
const FileInput = ({ file, onFileChange }) => {
  return (
    <div className="relative flex items-center p-2 border rounded-md bg-gray-50">
      <Paperclip className="flex-shrink-0 w-5 h-5 mr-2 text-gray-500" />
      <span className="text-sm text-gray-700 truncate">
        {file ? file.name : 'Select a file...'}
      </span>
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => onFileChange(e.target.files[0])}
      />
    </div>
  )
};

export default function CreateProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monumentId = searchParams.get('monumentId');
  
  const [monument, setMonument] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: null,
    startDate: '',
    endDate: '',
    contractor: null,
    documents: [{ id: 1, name: '', file: null }],
    priority: 'medium',
    expectedDuration: '6', // months
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonument = async () => {
      if (monumentId) {
        try {
          const monumentData = await dataManager.getMonumentById(monumentId);
          setMonument(monumentData);
        } catch (err) {
          setError('Failed to load monument details.');
        }
      }
      setLoading(false);
    };

    fetchMonument();
  }, [monumentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDocumentChange = (index, field, value) => {
    const newDocuments = [...formData.documents];
    newDocuments[index][field] = value;
    setFormData(prev => ({...prev, documents: newDocuments}));
  };

  const addDocumentField = () => {
    setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, { id: Date.now(), name: '', file: null }]
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
    
    if (!monumentId) {
      setError('Monument ID is required.');
      return;
    }
    
    if (!formData.contractor) {
      setError('Please select or add a contractor.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);

    try {
      console.log("[CREATE PROJECT] Starting project creation...");
      
      // Handle document uploads
      const uploadedDocuments = await Promise.all(
        formData.documents.map(async (doc) => {
          if (!doc.file) return null;

          const fileFormData = new FormData();
          fileFormData.append('file', doc.file);
          fileFormData.append('type', 'document'); 
          
          const response = await fetch('/api/upload', { 
            method: 'POST', 
            body: fileFormData 
          });
          
          if (!response.ok) {
            throw new Error(`Failed to upload ${doc.file.name}`);
          }
          
          const result = await response.json();
          return { name: doc.name || doc.file.name, path: result.path };
        })
      );
      
      // Prepare project payload
      const payload = {
        monumentId,
        name: formData.name,
        description: formData.description,
        budget: formData.budget,
        timeline: { 
          start: formData.startDate, 
          end: formData.endDate,
          expectedDuration: parseInt(formData.expectedDuration)
        },
        contractorId: formData.contractor.id,
        contractorName: formData.contractor.name,
        status: 'scheduled',
        priority: formData.priority,
        documents: uploadedDocuments.filter(Boolean),
        milestones: [],
        progress: 0,
      };
      
      console.log("[CREATE PROJECT] Submitting payload:", payload);
      
      const result = await dataManager.addProject(payload);
      console.log("[CREATE PROJECT] Project created successfully:", result);
      
      // Redirect to monument detail page
      router.push(`/WMS/monuments/${monumentId}`);
      
    } catch (err) {
      console.error("[CREATE PROJECT] Error:", err);
      setError(err.message || 'Failed to create project.');
      setIsSubmitting(false); 
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p>Loading monument details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 text-gray-700 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl px-6 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link 
              href={monumentId ? `/WMS/monuments/${monumentId}` : '/WMS/monuments'}
              className="flex items-center mr-4 text-blue-600 transition-colors hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Monument
            </Link>
          </div>
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Create New Project</h1>
            {monument && (
              <div className="flex items-center text-gray-600">
                <span>For: </span>
                <span className="ml-1 font-medium text-gray-900">{monument.name}</span>
                <span className="mx-2">•</span>
                <span className="text-sm">{monument.location?.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="pb-2 text-xl font-semibold text-gray-900 border-b">
                Project Information
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input 
                    label="Project Title" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="e.g., Monument Restoration Phase 1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Project Description
                  </label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="Describe the project scope, objectives, and expected outcomes..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Priority Level
                  </label>
                  <select 
                    name="priority" 
                    value={formData.priority} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Expected Duration (Months)
                  </label>
                  <select 
                    name="expectedDuration" 
                    value={formData.expectedDuration} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="space-y-6">
              <h2 className="pb-2 text-xl font-semibold text-gray-900 border-b">
                Budget & Timeline
              </h2>
              
              <div className="grid gap-6 md:grid-cols-3">
                <CurrencyInput 
                  label="Project Budget" 
                  value={formData.budget} 
                  onValueChange={(val) => setFormData(p => ({...p, budget: val}))} 
                  placeholder="e.g. ₹ 25,00,000"
                  required
                />
                <Input 
                  label="Start Date" 
                  name="startDate" 
                  type="date" 
                  value={formData.startDate} 
                  onChange={handleChange} 
                  required
                />
                <Input 
                  label="Expected End Date" 
                  name="endDate" 
                  type="date" 
                  value={formData.endDate} 
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Contractor Selection */}
            <div className="space-y-6">
              <h2 className="pb-2 text-xl font-semibold text-gray-900 border-b">
                Contractor Information
              </h2>
              <ContractorSelector onContractorSelect={(c) => setFormData(p => ({...p, contractor: c}))} />
            </div>
            
            {/* Documents */}
            <div className="space-y-6">
              <h2 className="pb-2 text-xl font-semibold text-gray-900 border-b">
                Project Documents
              </h2>
              <div className="space-y-4">
                {formData.documents.map((doc, index) => (
                    <div key={doc.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <Input 
                            placeholder="Document Name (e.g., Project Proposal, Approval Letter)" 
                            value={doc.name} 
                            onChange={(e) => handleDocumentChange(index, 'name', e.target.value)} 
                          />
                        </div>
                        <div className="w-64">
                          <FileInput 
                            file={doc.file} 
                            onFileChange={(file) => handleDocumentChange(index, 'file', file)} 
                          />
                        </div>
                        {formData.documents.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeDocumentField(doc.id)} 
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addDocumentField} 
                  className="w-full border-gray-300 border-dashed hover:border-gray-400 hover:bg-gray-50"
                >
                    <PlusCircle className="w-4 h-4 mr-2" /> 
                    Add Another Document
                </Button>
              </div>
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Link 
                href={monumentId ? `/WMS/monuments/${monumentId}` : '/WMS/monuments'}
                className="px-6 py-2 font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </Link>
              <Button 
                type="submit" 
                loading={isSubmitting} 
                disabled={isSubmitting}
                className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? 'Creating Project...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}