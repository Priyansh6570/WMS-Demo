'use client';
import { useState, useMemo } from 'react';
import { PlusCircle, Trash2, File, Send, Upload, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Form/Input';

export default function BillRecordForm({ onSubmit }) {
    const [formData, setFormData] = useState({
        billDetails: '',
        documents: [{ file: null, name: '' }],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDocumentChange = (index, field, value) => {
        const newDocuments = [...formData.documents];
        newDocuments[index][field] = value;
        setFormData(p => ({ ...p, documents: newDocuments }));
    };

    const addDocumentField = () => {
        setFormData(p => ({ ...p, documents: [...p.documents, { file: null, name: '' }] }));
    };

    const removeDocumentField = (index) => {
        if (formData.documents.length <= 1) return;
        setFormData(p => ({ ...p, documents: p.documents.filter((_, i) => i !== index) }));
    };

    const isSubmitDisabled = useMemo(() => {
        const hasDetails = formData.billDetails.trim() !== '';
        const hasValidDoc = formData.documents.some(d => d.file && d.name.trim() !== '');
        return !hasDetails || !hasValidDoc || isSubmitting;
    }, [formData, isSubmitting]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const cleanData = {
            ...formData,
            documents: formData.documents.filter(d => d.file && d.name.trim() !== ''),
        };
        await onSubmit(cleanData);
        setIsSubmitting(false);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="max-w-4xl mx-auto text-gray-700">
            <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white border border-gray-200 shadow-lg rounded-2xl">
                

                {/* Bill Details Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <File className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Bill Details</h3>
                    </div>
                    <div className="relative">
                        <textarea
                            value={formData.billDetails}
                            onChange={(e) => setFormData(p => ({...p, billDetails: e.target.value}))}
                            className="w-full h-32 px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter details about the bill, invoice numbers, payment references, etc."
                            required
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                            {formData.billDetails.length} characters
                        </div>
                    </div>
                </div>
                
                {/* Document Upload Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Upload className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Upload Documents</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.documents.map((doc, index) => (
                            <div key={index} className="p-6 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100/50 transition-colors duration-200">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    {/* Document Name Input */}
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Document Name
                                        </label>
                                        <Input
                                            placeholder="e.g., Final Invoice, Receipt, Payment Proof"
                                            value={doc.name}
                                            onChange={(e) => handleDocumentChange(index, 'name', e.target.value)}
                                            className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    {/* File Upload */}
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Choose File
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                id={`file-${index}`}
                                                required 
                                                onChange={(e) => handleDocumentChange(index, 'file', e.target.files[0])} 
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            />
                                            <label 
                                                htmlFor={`file-${index}`}
                                                className="flex items-center justify-center w-full h-12 px-4 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                                            >
                                                {doc.file ? (
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <File className="w-4 h-4" />
                                                        <span className="truncate max-w-32">{doc.file.name}</span>
                                                        <span className="text-xs text-gray-500">
                                                            ({formatFileSize(doc.file.size)})
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Upload className="w-4 h-4" />
                                                        <span>Choose file</span>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                                        </p>
                                    </div>
                                    
                                    {/* Remove Button */}
                                    <div className="flex lg:flex-col justify-end">
                                        {formData.documents.length > 1 && (
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => removeDocumentField(index)} 
                                                className="text-red-500 hover:bg-red-50 hover:text-red-700 p-2 rounded-full"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Add Document Button */}
                        <button
                            type="button"
                            onClick={addDocumentField}
                            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-400 transition-colors duration-200 group"
                        >
                            <div className="flex items-center justify-center gap-2 text-gray-600 group-hover:text-gray-700">
                                <PlusCircle className="w-5 h-5" />
                                <span className="font-medium">Add Another Document</span>
                            </div>
                        </button>
                    </div>
                </div>
                
                {/* Submit Section */}
                <div className="pt-6 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            <p>• Ensure all required fields are filled</p>
                            <p>• Double-check document names and files</p>
                        </div>
                        <Button 
                            type="submit" 
                            size="lg" 
                            loading={isSubmitting} 
                            disabled={isSubmitDisabled}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            {isSubmitting ? (
                                <>
                                    {/* <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" /> */}
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5 mr-2" />
                                    Submit Bill Record
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}