'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dataManager } from '@/lib/data-manager';
import Loading from '@/components/ui/Loading';
import MilestoneDetailHeader from '@/components/milestones/MilestoneDetailHeader';
import MilestoneTabs from '@/components/milestones/MilestoneTabs';

export default function MilestoneDetailPage() {
    const { user } = useAuth();
    const { projectId, milestoneId } = useParams();
    
    const [milestone, setMilestone] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMilestone = async () => {
        if (!projectId || !milestoneId) return;
        setLoading(true);
        try {
            const data = await dataManager.getMilestoneById(projectId, milestoneId);
            setMilestone(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load milestone data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMilestone();
    }, [projectId, milestoneId]);
    
    const canEdit = user?.role === 'super_admin' || user?.role === 'admin';

    if (loading) return <Loading />;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!milestone) return notFound();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="bg-white border-b shadow-sm">
                <div className="px-6 py-8 mx-auto max-w-7xl">
                    <MilestoneDetailHeader 
                        milestone={milestone} 
                        projectId={projectId} 
                        canEdit={canEdit}
                        onUpdate={fetchMilestone}
                    />
                </div>
            </div>
            <div className="px-6 py-8 mx-auto max-w-7xl">
                <MilestoneTabs milestone={milestone} projectId={projectId} onUpdate={fetchMilestone} />
            </div>
        </div>
    );
}