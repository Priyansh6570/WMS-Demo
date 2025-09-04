'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataManager } from '@/lib/data-manager';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { CheckCircle, Clock, FileText, MessageSquare, Send, ShieldCheck, UserCheck, Calendar, PlusCircle, ThumbsUp, Hourglass } from 'lucide-react';
import Link from 'next/link';

export default function InspectionRecordTab({ milestone, projectId, onUpdate }) {
    const { user } = useAuth();
    const [isConfirming, setIsConfirming] = useState(false);
    const [modalAction, setModalAction] = useState(null); // 'forward' or 'approve'

    const handleConfirm = async () => {
        if (!modalAction) return;
        setIsConfirming(true);
        try {
            if (modalAction === 'forward') {
                await dataManager.forwardInspectionToAdmin(projectId, milestone.id, user.name);
            } else if (modalAction === 'approve') {
                await dataManager.approveMilestoneInspection(projectId, milestone.id, user.name);
            }
            onUpdate();
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsConfirming(false);
            setModalAction(null);
        }
    };

    // Create a reversed copy of the records to show newest first
    const qualityRecords = [...(milestone.quality_manager_review || [])].reverse();
    
    const canAddRecord = user?.role === 'quality_manager';
    const canForward = canAddRecord && qualityRecords.length > 0 && milestone.admin_review !== 'submitted' && milestone.admin_review !== 'approved';
    const canApprove = user?.role === 'admin' && milestone.admin_review === 'submitted';

    return (
        <div>
            {/* --- Quality Manager Section --- */}
            <div className="mb-12">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b">
                    <h3 className="flex items-center text-2xl font-bold text-gray-800"><UserCheck className="w-6 h-6 mr-3 text-blue-500"/> Quality Manager Updates</h3>
                    {canAddRecord && (
                        <Link href={`/WMS/projects/${projectId}/milestones/${milestone.id}/add-inspection`} passHref>
                            <Button><PlusCircle className="w-4 h-4 mr-2" /> Add Inspection Record</Button>
                        </Link>
                    )}
                </div>

                {milestone.inspectionVisitDate && (
                    <div className="flex items-center p-3 mb-6 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg">
                        <Calendar className="w-4 h-4 mr-2" /> Latest Inspection Visit: {formatDate(milestone.inspectionVisitDate, { includeTime: true })}
                    </div>
                )}
                
                {qualityRecords.length === 0 ? (
                     <div className="py-12 text-center border-2 border-dashed rounded-lg bg-gray-50/70">
                        <UserCheck className="w-12 h-12 mx-auto text-gray-300" />
                        <h4 className="mt-4 text-lg font-medium text-gray-900">No Records Submitted</h4>
                        <p className="mt-1 text-sm text-gray-500">
                           The Quality Manager has not added any inspection records yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {qualityRecords.map(record => {
                            const hasFeedback = record.feedback && record.feedback.length > 0;
                            const hasDocuments = record.documents && record.documents.length > 0;
                            return (
                                <div key={record.id} className="overflow-hidden border shadow-sm rounded-xl">
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 border-b">
                                        <p>Submitted on: {formatDate(record.submittedAt, { includeTime: true })} by {record.submittedBy}</p>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {hasFeedback && (
                                            <div>
                                                <h4 className="flex items-center mb-2 font-medium"><MessageSquare className="w-4 h-4 mr-2 text-gray-500"/>Feedback:</h4>
                                                <ul className="pl-6 space-y-1 list-disc text-gray-700">
                                                    {record.feedback.map((fb, i) => <li key={i}>{fb}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        {hasDocuments && (
                                            <div>
                                                <h4 className="flex items-center mb-2 font-medium"><FileText className="w-4 h-4 mr-2 text-gray-500"/>Documents:</h4>
                                                <ul className="space-y-2">
                                                    {record.documents.map((doc, i) => <li key={i}><a href={doc.path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:underline"><FileText className="w-3 h-3 mr-1.5"/>{doc.name}</a></li>)}
                                                </ul>
                                            </div>
                                        )}
                                        {!hasFeedback && !hasDocuments && (
                                            <p className="text-sm italic text-gray-500">No feedback or documents were included in this submission.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                {canForward && (
                    <div className="mt-6 text-right">
                        <Button onClick={() => setModalAction('forward')} className="bg-purple-600 hover:bg-purple-700">
                            <Send className="w-4 h-4 mr-2"/> Forward to Admin
                        </Button>
                    </div>
                )}
            </div>

            {/* --- Admin Section --- */}
            <div>
                <h3 className="flex items-center text-2xl font-bold text-gray-800 border-b pb-4 mb-6"><ShieldCheck className="w-6 h-6 mr-3 text-green-500"/> Admin Approval</h3>
                <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                    <div className="font-medium text-gray-700">Final Approval Status:</div>
                    <div>
                        {!milestone.admin_review && <span className="flex items-center font-bold text-yellow-600">Pending</span>}
                        {milestone.admin_review === 'submitted' && <span className="flex items-center font-bold text-blue-600"><Send className="w-4 h-4 mr-1.5"/> Submitted for Approval</span>}
                        {milestone.admin_review === 'approved' && <span className="flex items-center font-bold text-green-600"><ThumbsUp className="w-4 h-4 mr-1.5"/> Approved for Billing</span>}
                    </div>
                </div>
                 {canApprove && (
                    <div className="mt-6 text-right">
                        <Button onClick={() => setModalAction('approve')} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-2"/> Approve Milestone
                        </Button>
                    </div>
                )}
            </div>

            <ConfirmationModal 
                isOpen={!!modalAction}
                onClose={() => setModalAction(null)}
                onConfirm={handleConfirm}
                isConfirming={isConfirming}
                title={modalAction === 'forward' ? "Forward to Admin?" : "Approve Milestone?"}
                message={
                    modalAction === 'forward' 
                    ? "This will lock the record and send it for final approval by the admin. Are you sure?" 
                    : "This will mark the milestone as complete and approved. This action is final and cannot be undone."
                }
                confirmText={modalAction === 'forward' ? "Yes, Forward" : "Yes, Approve"}
            />
        </div>
    );
}

