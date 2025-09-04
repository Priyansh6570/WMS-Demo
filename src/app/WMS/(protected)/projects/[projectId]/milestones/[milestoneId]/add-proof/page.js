'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dataManager } from '@/lib/data-manager';
import Loading from '@/components/ui/Loading';
import ProofOfWorkForm from '@/components/milestones/ProofOfWorkForm';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AddProofPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { projectId, milestoneId } = useParams();

    const [milestone, setMilestone] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Security check
    useEffect(() => {
        if (user && user.role !== 'worker' && user.role !== 'contractor') {
            router.replace(`/WMS/projects/${projectId}/milestones/${milestoneId}`);
        }
    }, [user, router, projectId, milestoneId]);

    useEffect(() => {
        const fetchMilestone = async () => {
            try {
                const data = await dataManager.getMilestoneById(projectId, milestoneId);
                setMilestone(data);
            } catch (err) {
                setError('Failed to load milestone details.');
            } finally {
                setLoading(false);
            }
        };
        fetchMilestone();
    }, [projectId, milestoneId]);

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        setError('');
        try {
            const uploadFile = async (file) => {
                const form = new FormData();
                form.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: form });
                if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
                return await res.json();
            };

            const processPhotos = async (photos) => {
                return Promise.all(photos.map(async (p) => {
                    const { path } = await uploadFile(p.file);
                    return { id: `photo_${Date.now()}`, path, about: p.about };
                }));
            };

            const payload = {
                photos: {
                    before: await processPhotos(formData.photos.before),
                    during: await processPhotos(formData.photos.during),
                    after: await processPhotos(formData.photos.after),
                },
                documents: await Promise.all(formData.documents.map(async (d) => {
                    const { path } = await uploadFile(d.file);
                    return { id: `doc_${Date.now()}`, name: d.name, path };
                })),
                submittedBy: user.name,
            };

            const response = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}/proof`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proofOfWork: payload }),
            });

            if (!response.ok) throw new Error('Failed to submit proof.');

            router.push(`/WMS/projects/${projectId}/milestones/${milestoneId}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <Loading />;
    if (!user || (user.role !== 'worker' && user.role !== 'contractor')) {
        return (
            <div className="p-8 text-center">
                <ShieldAlert className="w-16 h-16 mx-auto text-red-500" />
                <h1 className="mt-4 text-2xl font-bold">Access Denied</h1>
            </div>
        );
    }

    return (
        <div className="max-w-4xl px-6 py-8 mx-auto">
            <header className="p-6 mb-8 bg-white border shadow-sm rounded-xl">
                <Link href={`/WMS/projects/${projectId}/milestones/${milestoneId}`} className="flex items-center text-sm text-blue-600 hover:underline">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Milestone
                </Link>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">Add Proof of Work</h1>
                <p className="mt-1 text-gray-600">For milestone: <span className="font-medium">{milestone?.name}</span></p>
            </header>
            <ProofOfWorkForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            {error && <p className="mt-4 font-medium text-center text-red-600">{error}</p>}
        </div>
    );
}