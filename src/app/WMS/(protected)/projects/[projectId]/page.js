'use client'
import { useState, useEffect, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dataManager } from '@/lib/data-manager';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import ProjectDetailTabs from '@/components/projects/ProjectDetailTabs';
import { ArrowLeft, Edit, Plus, Target, Loader2, AlertTriangle } from 'lucide-react';

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const { projectId } = params;
  const [project, setProject] = useState(null);
  const [monument, setMonument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const canEdit = user?.role === 'super_admin' || user?.role === 'admin';
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const projectData = await dataManager.getProjectById(projectId);
      setProject(projectData);

      if (projectData.monumentId) {
        const monumentData = await dataManager.getMonumentById(projectData.monumentId);
        setMonument(monumentData);
      }
    } catch (err) {
      setError('Failed to load project details.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const handleProjectUpdate = useCallback(async () => {
  await fetchData();
}, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-xl font-medium text-gray-700">Loading project details...</p>
          <p className="mt-2 text-gray-500">Please wait while we fetch the information</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        <div className="max-w-md p-8 mx-auto text-center bg-white shadow-lg rounded-xl">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Error Loading Project</h3>
          <p className="mb-4 text-red-600">{error}</p>
          <Link href="/WMS/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (!project) return notFound();

  const hasMilestones = project.milestones && project.milestones.length > 0;
  
  return (
    <div className="min-h-screen text-gray-700 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-6 mx-auto max-w-7xl">
          <div className="flex items-center mb-4">
            <Link 
              href="/WMS/projects"
              className="flex items-center mr-4 text-blue-600 transition-colors hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Projects
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">{project.name}</h1>
              <div className="flex flex-col gap-2 text-gray-600 sm:flex-row sm:items-center">
                {/* <span>Project ID: {project.id}</span> */}
                <span className="hidden sm:inline">•</span>
                <span>Monument: 
                  <Link 
                    href={`/WMS/monuments/${monument?.id}`}
                    className="ml-1 font-medium text-blue-600 hover:text-blue-800"
                  >
                    {monument?.name || 'Unknown'}
                  </Link>
                </span>
                <span className="hidden sm:inline">•</span>
                <span>Contractor: {project.contractorName}</span>
              </div>
            </div>
            
            <div className="flex flex-shrink-0 ml-4 space-x-3">
              {canEdit && (
                <>
                  <Button variant="outline" className="border-gray-300 hover:bg-gray-50 hover:text-gray-800">
                    <Edit className="w-4 h-4 mr-2" /> 
                    Edit Project
                  </Button>
                  
                  {/* Add/Update Milestones Button */}
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                    {hasMilestones ? (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        Update Milestones
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Milestones
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 mx-auto max-w-7xl">
        <ProjectDetailTabs project={project} monument={monument} onUpdate={handleProjectUpdate} />
      </div>
    </div>
  );
}