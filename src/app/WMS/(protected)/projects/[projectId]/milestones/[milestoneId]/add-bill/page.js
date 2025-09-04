'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dataManager } from '@/lib/data-manager';
import Loading from '@/components/ui/Loading';
import BillRecordForm from '@/components/milestones/BillRecordForm';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AddBillPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { projectId, milestoneId } = useParams();
    const [milestone, setMilestone] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Security check
        if (user && user.role !== 'financial_officer') {
            router.replace(`/WMS/projects/${projectId}/milestones/${milestoneId}`);
            return;
        }
        dataManager.getMilestoneById(projectId, milestoneId)
            .then(setMilestone)
            .finally(() => setLoading(false));
    }, [projectId, milestoneId, user, router]);

    const handleSubmit = async (formData) => {
        try {
            const uploadFile = async (file) => {
                const form = new FormData();
                form.append('file', file);
                const res = await fetch('/api/upload', { method: 'POST', body: form });
                if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
                return res.json();
            };
            const uploadedDocs = await Promise.all(formData.documents.map(async (doc) => {
                const { path } = await uploadFile(doc.file);
                return { name: doc.name, path };
            }));

            const payload = {
                billDetails: formData.billDetails,
                documents: uploadedDocs,
                submittedBy: user.name,
            };

            await dataManager.addBillRecord(projectId, milestoneId, payload);
            router.push(`/WMS/projects/${projectId}/milestones/${milestoneId}`);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    if (loading) return <Loading />;
    if (!milestone || user?.role !== 'financial_officer') {
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
                 <h1 className="mt-2 text-3xl font-bold text-gray-900">Upload Bill Data</h1>
                 <p className="mt-1 text-gray-600">For milestone: <span className="font-medium">{milestone.name}</span></p>
             </header>
            <BillRecordForm onSubmit={handleSubmit} />
        </div>
    );
}
