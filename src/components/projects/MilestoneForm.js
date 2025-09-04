'use client';
import { useState } from 'react';
import { Plus, Trash2, Paperclip, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Form/Input';
import CurrencyInput from '@/components/ui/Form/CurrencyInput';

// Single Milestone Form Card
const MilestoneFormCard = ({ milestone, updateMilestone, removeMilestone }) => {
  const [checklistInput, setChecklistInput] = useState('');

  const handleChecklistAdd = () => {
    if (checklistInput.trim()) {
      const newItem = { id: `item_${Date.now()}`, text: checklistInput.trim(), completed: false };
      updateMilestone('clearanceChecklist', [...milestone.clearanceChecklist, newItem]);
      setChecklistInput('');
    }
  };
  
  const handleChecklistRemove = (itemId) => {
    updateMilestone('clearanceChecklist', milestone.clearanceChecklist.filter(item => item.id !== itemId));
  };

  return (
    <div className="p-6 space-y-6 text-gray-700 bg-white border border-gray-200 shadow-sm rounded-xl">
      <div className="flex items-center justify-between pb-3 border-b">
        <h3 className="text-xl font-semibold text-gray-800">New Milestone</h3>
        <Button variant="ghost" size="sm" onClick={removeMilestone} className="text-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input label="Milestone Name" value={milestone.name} onChange={(e) => updateMilestone('name', e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
          <textarea value={milestone.description} onChange={(e) => updateMilestone('description', e.target.value)} className="w-full h-24 p-2 border rounded-lg textarea-bordered border-slate-300" required />
        </div>
        <CurrencyInput label="Milestone Budget" value={milestone.budget} onValueChange={(val) => updateMilestone('budget', val)} required />
        <Input label="Start Date" type="date" value={milestone.startDate} onChange={(e) => updateMilestone('startDate', e.target.value)} required />
        <Input label="End Date" type="date" value={milestone.endDate} onChange={(e) => updateMilestone('endDate', e.target.value)} required />
      </div>

      <div>
        <h4 className="mb-2 font-medium text-gray-800">Clearance Checklist</h4>
        <div className="flex gap-2 mb-3">
          <Input value={checklistInput} onChange={(e) => setChecklistInput(e.target.value)} placeholder="Add a checklist item..." />
          <Button type="button" onClick={handleChecklistAdd}>Add</Button>
        </div>
        <ul className="space-y-2">
          {milestone.clearanceChecklist.map(item => (
            <li key={item.id} className="flex items-center justify-between p-2 text-sm rounded-md bg-gray-50">
              <span>{item.text}</span>
              <button onClick={() => handleChecklistRemove(item.id)} className="text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="mb-2 font-medium text-gray-800">Document</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input placeholder="Document Name" value={milestone.documentName} onChange={(e) => updateMilestone('documentName', e.target.value)} />
          </div>
          <div className="relative w-48 p-2 border rounded-md">
            <Paperclip className="absolute w-5 h-5 text-gray-400 left-2 top-2" />
            <span className="pl-6 text-sm truncate">{milestone.documentFile?.name || 'Upload File'}</span>
            <input type="file" className="absolute inset-0 opacity-0" onChange={(e) => updateMilestone('documentFile', e.target.files[0])} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function MilestoneManager({ onSubmit, isSubmitting }) {
  const [milestones, setMilestones] = useState([]);

  const addNewMilestone = () => {
    setMilestones([...milestones, {
      id: `new_${Date.now()}`,
      name: '',
      description: '',
      budget: null,
      startDate: '',
      endDate: '',
      clearanceChecklist: [],
      documentName: '',
      documentFile: null,
    }]);
  };

  const updateMilestone = (id, field, value) => {
    setMilestones(milestones.map(m => m.id === id ? { ...m, [field]: value } : m));
  };
  
  const removeMilestone = (id) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(milestones);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8 text-gray-700">
      {milestones.length === 0 && (
        <div className="py-12 text-center">
            <Button type="button" onClick={addNewMilestone} size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <Plus className="w-6 h-6 mr-2" />
                Add New Milestone
            </Button>
        </div>
      )}

      {milestones.map(milestone => (
        <MilestoneFormCard
          key={milestone.id}
          milestone={milestone}
          updateMilestone={(field, value) => updateMilestone(milestone.id, field, value)}
          removeMilestone={() => removeMilestone(milestone.id)}
        />
      ))}

      {milestones.length > 0 && (
        <div className="pt-6 space-y-4 text-center border-t">
          <Button type="button" onClick={addNewMilestone} variant="outline" className="w-full max-w-sm mx-auto border-dashed">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Milestone
          </Button>
          <Button type="submit" size="lg" loading={isSubmitting} disabled={isSubmitting || milestones.length === 0} className="w-full max-w-sm mx-auto">
            Save All Milestones
          </Button>
        </div>
      )}
    </form>
  );
}