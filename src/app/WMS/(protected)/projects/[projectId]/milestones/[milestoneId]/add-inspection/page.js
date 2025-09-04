'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { dataManager } from '@/lib/data-manager';
import Loading from '@/components/ui/Loading';
import InspectionRecordForm from '@/components/milestones/InspectionRecordForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddInspectionPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { projectId, milestoneId } = useParams();
    const [milestone, setMilestone] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dataManager.getMilestoneById(projectId, milestoneId)
            .then(setMilestone)
            .finally(() => setLoading(false));
    }, [projectId, milestoneId]);

    const handleSubmit = async (formData) => {
        try {
            const uploadFile = async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) throw new Error('File upload failed');
                return response.json();
            };
            const uploadedDocs = await Promise.all(formData.documents.map(async (doc) => {
                const { path } = await uploadFile(doc.file);
                return { name: doc.name, path };
            }));

            const payload = {
                feedback: formData.feedback,
                documents: uploadedDocs,
                visitDate: formData.visitDate,
                submittedBy: user.name,
            };

            await dataManager.addInspectionRecord(projectId, milestoneId, payload);
            router.push(`/WMS/projects/${projectId}/milestones/${milestoneId}`);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="max-w-4xl px-6 py-8 mx-auto">
             <header className="p-6 mb-8 bg-white border shadow-sm rounded-xl">
                 <Link href={`/WMS/projects/${projectId}/milestones/${milestoneId}`} className="flex items-center text-sm text-blue-600 hover:underline">
                     <ArrowLeft className="w-4 h-4 mr-1" /> Back to Milestone
                 </Link>
                 <h1 className="mt-2 text-3xl font-bold text-gray-900">Add Inspection Record</h1>
                 <p className="mt-1 text-gray-600">For milestone: <span className="font-medium">{milestone?.name}</span></p>
             </header>
            <InspectionRecordForm onSubmit={handleSubmit} />
        </div>
    );
}
