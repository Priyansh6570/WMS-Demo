'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { dataManager } from '@/lib/data-manager';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Form/Input';
import CurrencyInput from '@/components/ui/Form/CurrencyInput';
import ContractorSelector from '@/components/monuments/ContractorSelector';
import { 
  PlusCircle, 
  X, 
  Paperclip, 
  ArrowLeft, 
  FileText, 
  Calendar, 
  IndianRupee, 
  Target, 
  User, 
  Clock, 
  Info,
  CheckCircle,
  Upload,
  Building2
} from 'lucide-react';
import Link from 'next/link';

// Enhanced File Input component
const FileInput = ({ file, onFileChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileChange(files[0]);
    }
  };

  return (
    <div 
      className={`relative flex items-center p-3 border-2 border-dashed rounded-lg transition-all ${
        isDragOver 
          ? 'border-blue-400 bg-blue-50' 
          : file 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`flex-shrink-0 p-2 rounded-lg mr-3 ${
        file ? 'bg-green-100' : 'bg-gray-100'
      }`}>
        {file ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <Upload className="w-4 h-4 text-gray-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">
          {file ? file.name : 'Click to upload or drag & drop'}
        </p>
        <p className="text-xs text-gray-500">
          {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, DOC, DOCX up to 10MB'}
        </p>
      </div>
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => onFileChange(e.target.files[0])}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
    </div>
  );
};

// Section Header Component
const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center space-x-4 mb-6">
    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

// Info Card Component
const InfoCard = ({ title, children, className = "" }) => (
  <div className={`bg-blue-50 border border-blue-200 rounded-xl p-4 ${className}`}>
    <div className="flex items-start space-x-3">
      <div className="p-1 bg-blue-100 rounded-lg">
        <Info className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-blue-900 mb-1">{title}</h4>
        <div className="text-sm text-blue-800">{children}</div>
      </div>
    </div>
  </div>
);

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
    expectedDuration: '6',
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="space-y-6">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                  <div className="h-12 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-700">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              href={monumentId ? `/WMS/monuments/${monumentId}` : '/WMS/monuments'}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Monument
            </Link>
          </div>
          
          <div className="flex items-start space-x-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Project</h1>
              {monument && (
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">For:</span>
                    <span className="font-semibold text-gray-900">{monument.name}</span>
                  </div>
                  {monument.location?.text && (
                    <>
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <span className="text-sm">{monument.location.text}</span>
                    </>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Set up a new heritage conservation project with detailed planning and documentation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <SectionHeader 
                icon={FileText} 
                title="Project Information" 
                description="Define the core details and scope of your heritage project"
              />
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input 
                    label="Project Title" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="e.g., Monument Restoration Phase 1"
                    className="text-lg font-medium"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block mb-3 text-sm font-semibold text-gray-700">
                    Project Description *
                  </label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="w-full h-36 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    placeholder="Provide a detailed description of the project scope, objectives, expected outcomes, and any special considerations for this heritage site..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Include project objectives, scope of work, and expected deliverables
                  </p>
                </div>
                
                <div>
                  <label className="flex items-center mb-3 text-sm font-semibold text-gray-700">
                    <Target className="w-4 h-4 mr-2" />
                    Priority Level
                  </label>
                  <select 
                    name="priority" 
                    value={formData.priority} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🟠 High Priority</option>
                    <option value="urgent">🔴 Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="flex items-center mb-3 text-sm font-semibold text-gray-700">
                    <Clock className="w-4 h-4 mr-2" />
                    Expected Duration
                  </label>
                  <select 
                    name="expectedDuration" 
                    value={formData.expectedDuration} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="1">1 Month</option>
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                    <option value="12">1 Year</option>
                    <option value="18">1.5 Years</option>
                    <option value="24">2 Years</option>
                    <option value="36">3 Years</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Budget & Timeline Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <SectionHeader 
                icon={Calendar} 
                title="Budget & Timeline" 
                description="Set the financial parameters and project schedule"
              />
            </div>
            
            <div className="p-6 space-y-6">
              {/* <InfoCard title="Planning Guidelines">
                <p>Ensure adequate budget allocation for heritage-specific requirements like specialized materials, expert consultations, and compliance documentation.</p>
              </InfoCard> */}
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="relative">
                  <div className="absolute top-0 left-0 p-3 bg-green-100 rounded-lg">
                    <IndianRupee className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="pt-16">
                    <CurrencyInput 
                      label="Project Budget" 
                      value={formData.budget} 
                      onValueChange={(val) => setFormData(p => ({...p, budget: val}))} 
                      placeholder="e.g. ₹ 25,00,000"
                      required
                      className="text-lg font-semibold"
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute top-0 left-0 p-3 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="pt-16">
                    <Input 
                      label="Start Date" 
                      name="startDate" 
                      type="date" 
                      value={formData.startDate} 
                      onChange={handleChange} 
                      required
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute top-0 left-0 p-3 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="pt-16">
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
              </div>
            </div>
          </div>

          {/* Contractor Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <SectionHeader 
                icon={User} 
                title="Contractor Assignment" 
                description="Select or add the contractor responsible for this project"
              />
            </div>
            
            <div className="p-6 pb-30 pt-12">
              <ContractorSelector 
                onContractorSelect={(c) => setFormData(p => ({...p, contractor: c}))}
                selectedContractor={formData.contractor}
              />
            </div>
          </div>
          
          {/* Documents Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <SectionHeader 
                icon={Paperclip} 
                title="Project Documents" 
                description="Upload relevant project documents, approvals, and references"
              />
            </div>
            
            <div className="p-6 space-y-6">
              <InfoCard title="Document Guidelines">
                <p>Upload project proposals, technical drawings, approval letters, environmental assessments, or any other relevant documentation. Accepted formats: PDF, DOC, DOCX, JPG, PNG (max 10MB each).</p>
              </InfoCard>
              
              <div className="space-y-4">
                {formData.documents.map((doc, index) => (
                  <div key={doc.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <Input 
                          placeholder="Document name (e.g., Project Proposal, Approval Letter, Technical Drawings)" 
                          value={doc.name} 
                          onChange={(e) => handleDocumentChange(index, 'name', e.target.value)}
                          className="bg-white"
                        />
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
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 mt-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addDocumentField} 
                  className="w-full border-2 border-gray-300 border-dashed hover:border-blue-400 hover:bg-blue-50 transition-colors py-4 text-gray-700"
                >
                  <PlusCircle className="w-5 h-5 mr-2" /> 
                  Add Another Document
                </Button>
              </div>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-800">Error Creating Project</h4>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <Link 
                href={monumentId ? `/WMS/monuments/${monumentId}` : '/WMS/monuments'}
                className="px-6 py-2 font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-center"
              >
                Cancel
              </Link>
              <Button 
                type="submit" 
                loading={isSubmitting} 
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl  hover:shadow-sm transition-all transform"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Project...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Create Project</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}