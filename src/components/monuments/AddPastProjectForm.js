'use client'

import { useState } from 'react';
import { dataManager } from '@/lib/data-manager';
import Button from '../ui/Button';
import Input from '../ui/Form/Input';
import CurrencyInput from '../ui/Form/CurrencyInput';
import ContractorSelector from './ContractorSelector';
import { PlusCircle, X, Paperclip } from 'lucide-react';

// A simple, self-contained File Input component for this form
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

export default function AddPastProjectForm({ monumentId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: null,
    startDate: '',
    endDate: '',
    contractor: null,
    documents: [{ id: 1, name: '', file: null }],
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  console.log("\n--- [FORM SUBMISSION] Starting form submission ---");
  
  if (!formData.contractor) {
    console.log("[FORM] Validation failed: No contractor selected");
    setError('Please select or add a contractor.');
    return;
  }
  
  setError('');
  setIsSubmitting(true);

  try {
    console.log("[FORM] Form data before submission:", formData);
    
    // Handle document uploads
    console.log("[FORM] Processing document uploads...");
    const uploadedDocuments = await Promise.all(
      formData.documents.map(async (doc, index) => {
        if (!doc.file) {
          console.log(`[FORM] Document ${index + 1}: No file selected`);
          return null;
        }

        console.log(`[FORM] Uploading document ${index + 1}:`, doc.file.name);
        const fileFormData = new FormData();
        fileFormData.append('file', doc.file);
        fileFormData.append('type', 'document'); 
        
        const response = await fetch('/api/upload', { 
          method: 'POST', 
          body: fileFormData 
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[FORM] Upload failed for ${doc.file.name}:`, errorText);
          throw new Error(`Failed to upload ${doc.file.name}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log(`[FORM] Upload successful for ${doc.file.name}:`, result);
        
        return { name: doc.name || doc.file.name, path: result.path };
      })
    );
    
    console.log("[FORM] Document uploads completed:", uploadedDocuments.filter(Boolean));
    
    // Prepare project payload
    const payload = {
      monumentId,
      name: formData.name,
      description: formData.description,
      budget: formData.budget,
      timeline: { start: formData.startDate, end: formData.endDate },
      contractorId: formData.contractor.id,
      contractorName: formData.contractor.name,
      status: 'completed',
      documents: uploadedDocuments.filter(Boolean),
    };
    
    console.log("[FORM] Project payload prepared:");
    console.log(JSON.stringify(payload, null, 2));
    
    // Submit to API
    console.log("[FORM] Calling dataManager.addProject...");
    const result = await dataManager.addProject(payload);
    console.log("[FORM] API call successful:", result);
    
    console.log("✅ [FORM] Project archived successfully!");
    onSave();
    
  } catch (err) {
    console.error("❌ [FORM] Error during form submission:");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Error object:", err);
    
    setError(err.message || 'Failed to archive project.');
    setIsSubmitting(false); 
  }
};

  return (
    <div className="text-gray-700 modal-overlay">
      <div className="max-w-lg text-gray-700 modal-content">
        <h2 className="mb-6 card-title">Archive a Past Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Project Title" name="name" value={formData.name} onChange={handleChange} required />
          <textarea name="description" value={formData.description} onChange={handleChange} className="h-24 input" placeholder="Project details..." />
          <CurrencyInput label="Final Budget" value={formData.budget} onValueChange={(val) => setFormData(p => ({...p, budget: val}))} placeholder="e.g. ₹ 5,00,000" />
          <div className="form-grid">
            <Input label="Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
            <Input label="End Date" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
          </div>
          <ContractorSelector onContractorSelect={(c) => setFormData(p => ({...p, contractor: c}))} />
          
          <div className="space-y-2 form-group">
            <label className="form-label">Attach Documents</label>
            {formData.documents.map((doc, index) => (
                <div key={doc.id} className="flex items-center gap-2">
                    <Input placeholder="Document Name (e.g., Completion Certificate)" value={doc.name} onChange={(e) => handleDocumentChange(index, 'name', e.target.value)} />
                    <div className="flex-shrink-0 w-2/5">
                      <FileInput file={doc.file} onFileChange={(file) => handleDocumentChange(index, 'file', file)} />
                    </div>
                    {formData.documents.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeDocumentField(doc.id)} className="text-red-600">
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addDocumentField} className="w-full">
                <PlusCircle className="w-4 h-4 mr-2" /> Add Another Document
            </Button>
          </div>
          
          {error && <p className="form-error">{error}</p>}
          <div className="flex justify-end gap-2 pt-4 mt-6 border-t">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>Archive Project</Button>
          </div>
        </form>
      </div>
    </div>
  );
}