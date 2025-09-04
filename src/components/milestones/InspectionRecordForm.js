'use client';
import { useState } from 'react';
import { PlusCircle, Trash2, File, Send, Calendar, Clock, FileText, MessageSquare } from 'lucide-react';

// Simple Time Picker Component (since we can't import external libraries in this environment)
const TimePicker = ({ value, onChange, className, required }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hours, setHours] = useState(value ? value.split(':')[0] : '09');
    const [minutes, setMinutes] = useState(value ? value.split(':')[1] : '00');

    const updateTime = (newHours, newMinutes) => {
        const timeString = `${newHours.padStart(2, '0')}:${newMinutes.padStart(2, '0')}`;
        onChange(timeString);
    };

    const handleHourChange = (newHours) => {
        setHours(newHours);
        updateTime(newHours, minutes);
    };

    const handleMinuteChange = (newMinutes) => {
        setMinutes(newMinutes);
        updateTime(hours, newMinutes);
    };

    return (
        <div className="relative">
            <div
                className={`${className} cursor-pointer flex items-center justify-between`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={value ? 'text-gray-700' : 'text-gray-400'}>
                    {value || 'Select time'}
                </span>
                <Clock className="w-4 h-4 text-gray-400" />
            </div>
            
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-20 p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hour</label>
                                <select
                                    value={hours}
                                    onChange={(e) => handleHourChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                >
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i.toString().padStart(2, '0')}>
                                            {i.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Minute</label>
                                <select
                                    value={minutes}
                                    onChange={(e) => handleMinuteChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                >
                                    {Array.from({ length: 60 }, (_, i) => (
                                        <option key={i} value={i.toString().padStart(2, '0')}>
                                            {i.toString().padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4 gap-2">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default function InspectionRecordForm({ onSubmit, isSubmitting }) {
    const [formData, setFormData] = useState({
        feedback: [''],
        documents: [{ file: null, name: '' }],
        visitDate: '',
        visitTime: '',
    });

    // --- Feedback Handlers ---
    const handleFeedbackChange = (index, value) => {
        const newFeedback = [...formData.feedback];
        newFeedback[index] = value;
        setFormData(p => ({ ...p, feedback: newFeedback }));
    };
    const addFeedbackField = () => {
        setFormData(p => ({ ...p, feedback: [...p.feedback, ''] }));
    };
    const removeFeedbackField = (index) => {
        if (formData.feedback.length <= 1) return;
        setFormData(p => ({ ...p, feedback: p.feedback.filter((_, i) => i !== index) }));
    };

    // --- Document Handlers ---
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

    const handleSubmit = () => {
        // Filter out empty entries before submission
        const finalData = {
            ...formData,
            feedback: formData.feedback.filter(f => f.trim() !== ''),
            documents: formData.documents.filter(d => d.file && d.name.trim() !== ''),
        };
        onSubmit(finalData);
    };

    return (
        <div className="min-h-screen text-gray-700">
            <div className="mx-auto">
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                    {/* Feedback Section */}
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex items-center mb-6">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mr-4">
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Inspection Feedback</h3>
                        </div>
                        <div className="space-y-4">
                            {formData.feedback.map((fb, index) => (
                                <div key={index} className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Feedback Item {index + 1}
                                    </label>
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 relative">
                                            <textarea
                                                value={fb}
                                                onChange={(e) => handleFeedbackChange(index, e.target.value)}
                                                className="w-full h-28 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none text-gray-700 placeholder-gray-400"
                                                placeholder="Enter detailed feedback, observations, or recommendations..."
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFeedbackField(index)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                            disabled={formData.feedback.length <= 1}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addFeedbackField}
                            className="mt-4 flex items-center px-4 py-3 text-blue-600 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 group"
                        >
                            <PlusCircle className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                            Add Another Feedback Item
                        </button>
                    </div>
                    
                    {/* Document Section */}
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center mb-6">
                            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mr-4">
                                <File className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Supporting Documents</h3>
                        </div>
                        <div className="space-y-4">
                            {formData.documents.map((doc, index) => (
                                <div key={index} className="group bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-gray-300 transition-all duration-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Document {index + 1}
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Document name or description..."
                                                value={doc.name}
                                                onChange={(e) => handleDocumentChange(index, 'name', e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleDocumentChange(index, 'file', e.target.files[0])}
                                                    className="w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 file:cursor-pointer cursor-pointer border-2 border-gray-200 rounded-lg focus:border-green-500 transition-all duration-200"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeDocumentField(index)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                                disabled={formData.documents.length <= 1}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addDocumentField}
                            className="mt-4 flex items-center px-4 py-3 text-green-600 border-2 border-dashed border-green-300 rounded-xl hover:bg-green-50 hover:border-green-400 transition-all duration-200 group"
                        >
                            <PlusCircle className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                            Add Another Document
                        </button>
                    </div>

                    {/* Date & Time Section */}
                    <div className="p-8">
                        <div className="flex items-center mb-6">
                            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mr-4">
                                <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Inspection Date & Time</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    Inspection Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.visitDate}
                                    onChange={e => setFormData(p => ({ ...p, visitDate: e.target.value }))}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Clock className="w-4 h-4 inline mr-2" />
                                    Inspection Time
                                </label>
                                <TimePicker
                                    value={formData.visitTime}
                                    onChange={(time) => setFormData(p => ({ ...p, visitTime: time }))}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Submit Section */}
                    <div className="p-8 border-t">
                        <div className="flex-row flex justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-3" />
                                        Submit Inspection Record
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}