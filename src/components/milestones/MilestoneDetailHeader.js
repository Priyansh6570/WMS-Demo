'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';
import { dataManager } from '@/lib/data-manager';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ArrowLeft, Edit, Target, Calendar, PlayCircle, Send } from 'lucide-react';

const calculateDateBadge = (startDate, endDate) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = (date1, date2) => Math.abs(date2 - date1);
    const diffDays = (time) => Math.ceil(time / (1000 * 60 * 60 * 24));
    if (now < start) {
        const days = diffDays(diffTime(now, start));
        return { text: `${days} day${days > 1 ? 's' : ''} until start`, color: 'bg-blue-100 text-blue-800' };
    } else if (now >= start && now <= end) {
        const days = diffDays(diffTime(now, end));
        return { text: `${days} day${days > 1 ? 's' : ''} left`, color: 'bg-green-100 text-green-800' };
    } else {
        const days = diffDays(diffTime(now, end));
        return { text: `${days} day${days > 1 ? 's' : ''} overdue`, color: 'bg-red-100 text-red-800' };
    }
};

export default function MilestoneDetailHeader({ milestone, projectId, canEdit, onUpdate }) {
    const { user } = useAuth();
    const [modalState, setModalState] = useState({ isOpen: false, action: null });
    const [isConfirming, setIsConfirming] = useState(false);

    if (!milestone) return null;
    const dateBadge = calculateDateBadge(milestone.timeline.start, milestone.timeline.end);
    
    const canSubmitForInspection = (user?.role === 'worker' || user?.role === 'contractor') && milestone.status === 'active' && milestone.submit_for_review !== 'submitted';

    const handleActionConfirm = async () => {
        if (!modalState.action) return;
        setIsConfirming(true);
        try {
            if (modalState.action === 'start') {
                await dataManager.startMilestone(projectId, milestone.id, user.name);
            } else if (modalState.action === 'submit') {
                await dataManager.submitMilestoneForInspection(projectId, milestone.id, user.name);
            }
            setModalState({ isOpen: false, action: null });
            onUpdate();
        } catch (error) {
            console.error(`Failed to ${modalState.action} milestone:`, error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <>
            <div className="flex items-start justify-between ">
                <div className="flex items-start space-x-6 text-gray-700">
                    <div className="flex items-center justify-center w-20 h-20 shadow-sm rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                        <Target className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Link href={`/WMS/projects/${projectId}`} className="flex items-center text-sm text-blue-600 hover:underline">
                            <ArrowLeft className="w-3 h-3 mr-1" /> Back to Project
                        </Link>
                        <h1 className="mt-1 text-4xl font-bold leading-tight text-gray-900">{milestone.name}</h1>
                        <div className="flex items-center mt-3 space-x-4 text-gray-600">
                            <div className="flex items-center text-sm"><Calendar className="w-4 h-4 mr-1.5 text-gray-400" /><span>{formatDate(milestone.timeline.start)} to {formatDate(milestone.timeline.end)}</span></div>
                            <span className={`px-4 py-1 rounded-full text-xs font-medium ${dateBadge.color}`}>{dateBadge.text}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-shrink-0 space-x-3">
                     <div className='flex items-center gap-3'>
                         <StatusBadge status={milestone.status} />
                         {milestone.submit_for_review === 'submitted' && milestone.status !== 'completed' && (
                             <span className="inline-flex items-center px-5 py-3 rounded-full text-xs font-bold text-teal-800 bg-teal-100">
                                 Submitted for Inspection
                             </span>
                         )}
                         {user?.role === 'contractor' && milestone.status === 'pending' && (
                              <Button onClick={() => setModalState({ isOpen: true, action: 'start' })} className="bg-green-600 hover:bg-green-700">
                                 <PlayCircle className="w-4 h-4 mr-2" /> Start Milestone
                             </Button>
                         )}
                         {canSubmitForInspection && (
                             <Button onClick={() => setModalState({ isOpen: true, action: 'submit' })} className="bg-blue-600 hover:bg-blue-700">
                                 <Send className="w-4 h-4 mr-2" /> Submit for Inspection
                             </Button>
                         )}
                         {canEdit && milestone.status !== "completed" && (
                             <Link href={`/WMS/projects/${projectId}/milestones/create`} passHref>
                                 <Button variant="outline"><Edit className="w-4 h-4 mr-2" /> Manage Milestones</Button>
                             </Link>
                         )}
                     </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, action: null })}
                onConfirm={handleActionConfirm}
                isConfirming={isConfirming}
                title={modalState.action === 'start' ? "Confirm Milestone Start" : "Confirm Submission"}
                message={
                    modalState.action === 'start' 
                    ? "Are you sure you want to officially start this milestone? This action cannot be undone."
                    : "You are about to submit this milestone for inspection. The quality inspector will review the work completed. Do you want to proceed?"
                }
                confirmText={modalState.action === 'start' ? "Yes, Start Milestone" : "Yes, Submit"}
            />
        </>
    );
}