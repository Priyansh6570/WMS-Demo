"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProjectForm from '@/components/projects/ProjectForm';
import Loading from '@/components/ui/Loading';
import { dataManager } from '@/lib/data-manager';
import { useAuth } from '@/context/AuthContext';

export default function EditProjectPage() {
    const { projectId } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (projectId) {
            const fetchProject = async () => {
                try {
                    setLoading(true);
                    const data = await dataManager.getProjectById(projectId);
                    setProject(data);
                    setError(null);
                } catch (err) {
                    setError('Failed to fetch project data.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchProject();
        }
    }, [projectId]);

    const handleSubmit = async (formData) => {
        if (!user) {
            alert('You must be logged in to edit a project.');
            return;
        }
        try {
            const updatedData = {
                ...formData,
                updatedBy: user.id,
            };
            await dataManager.updateProject(projectId, updatedData);
            router.push(`/WMS/projects/${projectId}`);
        } catch (error) {
            console.error('Failed to update project:', error);
            alert('Error updating project. Please try again.');
        }
    };

    if (loading) return <Loading />;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!project) return <p>Project not found.</p>;

    return (
        <div className="container p-4 mx-auto text-gray-700 md:p-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Edit Project</h1>
                <p className="text-gray-500">Update the details for project: {project.name}</p>
            </header>
            <ProjectForm project={project} onSubmit={handleSubmit} />
        </div>
    );
}