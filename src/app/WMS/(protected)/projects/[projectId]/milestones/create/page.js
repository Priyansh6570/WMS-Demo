'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dataManager } from '@/lib/data-manager';
import Loading from '@/components/ui/Loading';
import MilestoneEditorCard from '@/components/projects/MilestoneEditorCard';
import { ArrowLeft, Edit, Plus, Save, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/common/StatusBadge';

// Helper to compare old and new milestone data to find changes
const trackMilestoneChanges = (oldMilestone, newMilestone) => {
    const changes = [];
    const fieldsToCompare = ['name', 'description', 'budget', 'timeline', 'clearanceChecklist', 'document'];

    fieldsToCompare.forEach(field => {
        // Deep comparison for objects and arrays using JSON.stringify
        const oldValString = JSON.stringify(oldMilestone[field] ?? null);
        const newValString = JSON.stringify(newMilestone[field] ?? null);

        if (oldValString !== newValString) {
            changes.push({
                field: field,
                oldValue: oldMilestone[field] ?? 'Not set',
                newValue: newMilestone[field] ?? 'Not set',
            });
        }
    });

    return changes;
};


// A simple, local component for displaying milestone data.
const MilestoneDisplayCard = ({ milestone, number, onEdit }) => (
  <div className="p-4 transition-shadow border rounded-lg bg-gray-50 hover:shadow-md">
    <div className="flex items-start justify-between">
      <div className="flex items-start">
        <span className="mr-3 text-lg font-bold text-blue-600">{number}.</span>
        <div>
          <h4 className="font-semibold text-gray-800">{milestone.name}</h4>
          <p className="mt-1 text-sm text-gray-600">{milestone.description}</p>
        </div>
      </div>
      <div className='flex flex-col items-end gap-2'>
        <StatusBadge status={milestone.status} />
        {milestone.status !== "completed" && (
  <Button variant="outline" size="sm" onClick={() => onEdit(milestone.id)}>
    <Edit className="w-3 h-3 mr-1" /> Edit
  </Button>
)}
      </div>
    </div>
  </div>
);

export default function ManageMilestonesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { projectId } = useParams();
  
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialMilestones, setInitialMilestones] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Security check and initial data fetch
  useEffect(() => {
    if (user && user.role !== 'super_admin' && user.role !== 'admin') {
      router.replace('/WMS/dashboard');
      return;
    }
    const fetchProject = async () => {
      try {
        const data = await dataManager.getProjectById(projectId);
        setProject(data);
        const fetchedMilestones = data.milestones?.map(m => ({...m, timeline: m.timeline || {}})) || [];
        setMilestones(fetchedMilestones);
        setInitialMilestones(JSON.parse(JSON.stringify(fetchedMilestones)));
      } catch (err) {
        setError('Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
        fetchProject();
    }
  }, [projectId, user, router]);

    useEffect(() => {
    const originalState = JSON.stringify(initialMilestones);
    const currentState = JSON.stringify(milestones);
    setHasUnsavedChanges(originalState !== currentState);
  }, [milestones, initialMilestones]);

  const handleAddNew = () => {
    const newMilestone = {
      id: `new_${Date.now()}`,
      name: '',
      description: '',
      budget: 0,
      timeline: { start: '', end: '' },
      clearanceChecklist: [],
      document: null,
      documentName: '',
      documentFile: null,
      status: 'pending',
      editHistory: [], // Initialize edit history
    };
    setMilestones(prev => [...prev, newMilestone]);
    setEditingMilestoneId(newMilestone.id);
  };
  
  const handleSaveMilestone = (updatedMilestone) => {
    setMilestones(prev => prev.map(m => m.id === updatedMilestone.id ? updatedMilestone : m));
    setEditingMilestoneId(null);
  };

  const handleCancelEdit = (milestoneId) => {
      if (milestoneId.startsWith('new_')) {
          setMilestones(prev => prev.filter(m => m.id !== milestoneId));
      } else {
          // Revert changes from initial state if editing is cancelled
          setMilestones(prev => prev.map(m => m.id === milestoneId ? initialMilestones.find(im => im.id === milestoneId) : m));
      }
      setEditingMilestoneId(null);
  }
  
  const handleRemoveMilestone = (idToRemove) => {
      if (confirm('Are you sure you want to permanently delete this milestone?')) {
          setMilestones(prev => prev.filter(m => m.id !== idToRemove));
          if(editingMilestoneId === idToRemove) {
            setEditingMilestoneId(null);
          }
      }
  };

  const handleSaveAllChanges = async () => {
    setIsSubmitting(true);
    setError('');
    try {
        const finalMilestones = await Promise.all(
            milestones.map(async m => {
                let milestoneWithDoc = { ...m };
                // Upload new document if it exists
                if (m.documentFile) {
                    const formData = new FormData();
                    formData.append('file', m.documentFile);
                    formData.append('type', 'document');
                    const res = await fetch('/api/upload', { method: 'POST', body: formData });
                    if (!res.ok) throw new Error(`Upload failed for ${m.documentFile.name}`);
                    const { path } = await res.json();
                    milestoneWithDoc.document = { name: m.documentName || m.documentFile.name, path };
                }

                // Find the original state of this milestone
                const originalMilestone = initialMilestones.find(im => im.id === m.id);
                
                // If it's an existing milestone, check for changes
                if (originalMilestone) {
                    const changes = trackMilestoneChanges(originalMilestone, milestoneWithDoc);
                    if (changes.length > 0) {
                        const historyEntry = {
                            id: `edit_${Date.now()}`,
                            editedAt: new Date().toISOString(),
                            editedBy: user?.name || 'Unknown',
                            changes: changes,
                        };
                        milestoneWithDoc.editHistory = [historyEntry, ...(milestoneWithDoc.editHistory || [])];
                    }
                }
                
                // Clean up temporary form-only properties
                const { documentFile, documentName, ...finalMilestone } = milestoneWithDoc;
                return finalMilestone;
            })
        );

        const response = await fetch(`/api/projects/${projectId}/milestones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ milestones: finalMilestones }),
        });

        if (!response.ok) throw new Error((await response.json()).message || 'Failed to save milestones.');
        
        router.push(`/WMS/projects/${projectId}`);
    } catch (err) {
        setError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
    return <div className="p-8 text-center"><ShieldAlert className="w-16 h-16 mx-auto text-red-500" /> <h1 className="mt-4 text-2xl font-bold">Access Denied</h1></div>;
  }

  return (
    <div className="max-w-4xl px-6 py-8 mx-auto">
      <header className="p-6 mb-8 bg-white border shadow-sm rounded-xl">
          <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Milestones</h1>
                <p className="mt-1 text-gray-600">For project: <span className="font-medium">{project?.name}</span></p>
              </div>
              <Link href={`/WMS/projects/${projectId}`} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Project
              </Link>
          </div>
      </header>
      
      <div className="space-y-4">
        {milestones.map((m, i) => (
          <div key={m.id}>
            {editingMilestoneId === m.id ? (
              <MilestoneEditorCard 
                milestone={m}
                onSave={handleSaveMilestone}
                onCancel={() => handleCancelEdit(m.id)}
                onRemove={() => handleRemoveMilestone(m.id)}
              />
            ) : (
              <MilestoneDisplayCard 
                milestone={m}
                number={i + 1}
                onEdit={setEditingMilestoneId}
              />
            )}
          </div>
        ))}
      </div>

      <div className="pt-6 mt-6 space-y-4 text-center border-t">
          <Button variant="outline" onClick={handleAddNew} disabled={!!editingMilestoneId} className="w-full max-w-sm mx-auto border-dashed">
              <Plus className="w-4 h-4 mr-2" />
              Add New Milestone
          </Button>
          <Button size="lg" onClick={handleSaveAllChanges} loading={isSubmitting} disabled={!!editingMilestoneId || milestones.length === 0 || !hasUnsavedChanges}  className="w-full max-w-sm mx-auto">
              <Save className="w-5 h-5 mr-2" />
              Save All Changes to Project
          </Button>
          {editingMilestoneId && <p className="mt-2 text-sm text-yellow-700">Please save or cancel your current edit to proceed.</p>}
      </div>

       {error && <p className="mt-4 font-medium text-center text-red-600">{error}</p>}
    </div>
  );
}