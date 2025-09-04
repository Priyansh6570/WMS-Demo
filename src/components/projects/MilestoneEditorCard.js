'use client';
import { useState } from 'react';
import { Trash2, Paperclip, X, Save, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Form/Input';
import CurrencyInput from '@/components/ui/Form/CurrencyInput';

export default function MilestoneEditorCard({
  milestone,
  onSave,
  onCancel,
  onRemove,
}) {
  const [formData, setFormData] = useState({ ...milestone });
  const [checklistInput, setChecklistInput] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChecklistAdd = () => {
    if (checklistInput.trim()) {
      const newItem = { id: `item_${Date.now()}`, text: checklistInput.trim(), completed: false };
      const newChecklist = [...(formData.clearanceChecklist || []), newItem];
      handleChange('clearanceChecklist', newChecklist);
      setChecklistInput('');
    }
  };

  const handleChecklistRemove = (itemId) => {
    const newChecklist = formData.clearanceChecklist.filter(item => item.id !== itemId);
    handleChange('clearanceChecklist', newChecklist);
  };
  
  const handleFileChange = (file) => {
    handleChange('documentFile', file);
    if (!formData.documentName) {
      handleChange('documentName', file.name);
    }
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="p-6 space-y-6 bg-white border-2 border-blue-500 shadow-lg rounded-xl text-gray-700">
      <div className="flex items-center justify-between pb-3 border-b">
        <h3 className="text-xl font-semibold text-gray-800">
          {milestone.id.startsWith('new_') ? 'Add New Milestone' : 'Edit Milestone'}
        </h3>
        <div>
          <Button variant="ghost" size="sm" onClick={onCancel} className="mr-2 text-gray-600 hover:bg-gray-200 bg-gray-100">
            <XCircle className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={onRemove} className={"mr-2"}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
       <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
                <Input label="Milestone Name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
            </div>
            <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
                <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className="w-full h-24 textarea textarea-bordered" required />
            </div>
            <CurrencyInput label="Milestone Budget" value={formData.budget} onValueChange={(val) => handleChange('budget', val)} required />
            <Input label="Start Date" type="date" value={formData.timeline?.start?.split('T')[0] || ''} onChange={(e) => handleChange('timeline', {...formData.timeline, start: e.target.value})} required />
            <Input label="End Date" type="date" value={formData.timeline?.end?.split('T')[0] || ''} onChange={(e) => handleChange('timeline', {...formData.timeline, end: e.target.value})} required />
        </div>

      <div>
        <h4 className="mb-2 font-medium text-gray-800">Clearance Checklist</h4>
        <div className="flex gap-2 mb-3">
          <Input value={checklistInput} onChange={(e) => setChecklistInput(e.target.value)} placeholder="Add a checklist item..." />
          <Button type="button" onClick={handleChecklistAdd}>Add</Button>
        </div>
        <ul className="space-y-2">
          {formData.clearanceChecklist?.map(item => (
            <li key={item.id} className="flex items-center justify-between p-2 text-sm bg-gray-50 rounded-md">
              <span>{item.text}</span>
              <button onClick={() => handleChecklistRemove(item.id)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="mb-2 font-medium text-gray-800">Document</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input placeholder="Document Name" value={formData.documentName || ''} onChange={(e) => handleChange('documentName', e.target.value)} />
          </div>
          <div className="relative w-48 p-2 border rounded-md">
            <Paperclip className="absolute w-5 h-5 text-gray-400 left-2 top-2" />
            <span className="pl-6 text-sm truncate">{formData.documentFile?.name || formData.document?.name || 'Upload File'}</span>
            <input type="file" className="absolute inset-0 opacity-0" onChange={(e) => handleFileChange(e.target.files[0])} />
          </div>
        </div>
      </div>

       <div className="pt-4 mt-4 text-right border-t">
          <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
             <Save className="w-4 h-4 mr-1" /> Save
          </Button>
      </div>
    </div>
  );
}