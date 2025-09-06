"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataManager } from "@/lib/data-manager";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  UserCheck, 
  Calendar, 
  PlusCircle, 
  ThumbsUp, 
  Info,
  ExternalLink,
  AlertCircle,
  User,
  Zap,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function InspectionRecordTab({ milestone, projectId, onUpdate }) {
  const { user } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);
  const [modalAction, setModalAction] = useState(null);

  const handleConfirm = async () => {
    if (!modalAction) return;
    setIsConfirming(true);
    try {
      if (modalAction === "forward") {
        await dataManager.forwardInspectionToAdmin(projectId, milestone.id, user.name);
      } else if (modalAction === "approve") {
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

  const qualityRecords = [...(milestone.quality_manager_review || [])].reverse();

  const canAddRecord = user?.role === "quality_manager";
  const canForward = canAddRecord && qualityRecords.length > 0 && milestone.admin_review !== "submitted" && milestone.admin_review !== "approved";
  const canApprove = user?.role === "admin" && milestone.admin_review === "submitted";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Quality Manager Section */}
      <div className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
        {/* Header */}
        <div className=" px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Quality Manager Inspection</h3>
                <p className="text-sm text-blue-100">Technical review and quality assessment</p>
              </div>
            </div>
            {canAddRecord && (
              <Link href={`/WMS/projects/${projectId}/milestones/${milestone.id}/add-inspection`} passHref>
                <Button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Inspection Record
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Latest Inspection Visit Info */}
          {milestone.inspectionVisitDate && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                  <span className="font-semibold text-blue-900">Latest Inspection Visit</span>
                  <span className="text-blue-700">{formatDate(milestone.inspectionVisitDate, { includeTime: true })}</span>
                </div>
              </div>
            </div>
          )}

          {/* Records Display */}
          {qualityRecords.length === 0 ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
              <div className="py-16 px-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-5">
                    <UserCheck className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-6">
                      <Info className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">No Inspection Records</h4>
                    <div className="max-w-md mx-auto">
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">Pending Inspection</span>
                        </div>
                        <p className="text-sm text-amber-600">The Quality Manager has not submitted any inspection records for this milestone yet.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {qualityRecords.map((record, index) => {
                const hasFeedback = record.feedback && record.feedback.length > 0;
                const hasDocuments = record.documents && record.documents.length > 0;
                const isLatest = index === 0;
                
                return (
                  <div key={record.id} className={`border rounded-2xl overflow-hidden ${isLatest ? 'border-green-200 shadow-lg' : 'border-gray-200 shadow-sm'}`}>
                    {/* Record Header */}
                    <div className={`px-6 py-4 ${isLatest ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100' : 'bg-gray-50 border-b border-gray-100'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isLatest ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <User className={`w-5 h-5 ${isLatest ? 'text-green-600' : 'text-gray-500'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold text-gray-900">Submitted by {record.submittedBy}</span>
                              {isLatest && (
                                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                  Latest
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(record.submittedAt, { includeTime: true })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Feedback Section */}
                      {hasFeedback && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <MessageSquare className="w-5 h-5 text-purple-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900">Inspection Feedback</h4>
                          </div>
                          <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                            <ul className="space-y-3">
                              {record.feedback.map((fb, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-700 leading-relaxed">{fb}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Documents Section */}
                      {hasDocuments && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <FileText className="w-5 h-5 text-green-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              Inspection Documents
                              <span className="ml-2 text-sm font-normal text-gray-500">
                                ({record.documents.length} {record.documents.length === 1 ? "file" : "files"})
                              </span>
                            </h4>
                          </div>
                          <div className="grid gap-3">
                            {record.documents.map((doc, i) => (
                              <div key={i} className="group">
                                <a href={doc.path} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50/50 transition-all duration-200 group-hover:shadow-md">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                      <FileText className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-900 group-hover:text-green-700">{doc.name}</span>
                                      <p className="text-xs text-gray-500 mt-0.5">Click to view document</p>
                                    </div>
                                  </div>
                                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Empty Record State */}
                      {!hasFeedback && !hasDocuments && (
                        <div className="text-center py-8">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                            <Info className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500">No feedback or documents were included in this submission.</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Forward Action */}
          {canForward && (
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button 
                onClick={() => setModalAction("forward")} 
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                <Send className="w-4 h-4 mr-2" />
                Forward to Admin
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Approval Section */}
      <div className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Admin Final Approval</h3>
              <p className="text-sm text-gray-600 mt-1">Executive review and milestone completion</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Status Display */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Zap className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Final Approval Status</h4>
                  <p className="text-sm text-gray-600 mt-1">Current milestone approval state</p>
                </div>
              </div>
              
              <div className="text-right">
                {!milestone.admin_review && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="font-bold text-yellow-600">Pending Review</span>
                  </div>
                )}
                {milestone.admin_review === "submitted" && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-bold text-blue-600 flex items-center gap-1">
                      <Send className="w-4 h-4" />
                      Submitted for Approval
                    </span>
                  </div>
                )}
                {milestone.admin_review === "approved" && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-bold text-green-600 flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      Approved for Billing
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admin Action */}
          {canApprove && (
            <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
              <Button 
                onClick={() => setModalAction("approve")} 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Milestone
                <ThumbsUp className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Admin Approval Info */}
          {milestone.admin_review === "submitted" && !canApprove && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Waiting for Admin Review</p>
                  <p className="text-sm text-blue-700 mt-1">This milestone has been submitted for final administrative approval.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!modalAction}
        onClose={() => setModalAction(null)}
        onConfirm={handleConfirm}
        isConfirming={isConfirming}
        title={modalAction === "forward" ? "Forward to Admin?" : "Approve Milestone?"}
        message={modalAction === "forward" 
          ? "This will lock the inspection record and send it for final approval by the admin. This action cannot be undone." 
          : "This will mark the milestone as complete and approved for billing. This action is final and cannot be undone."
        }
        confirmText={modalAction === "forward" ? "Yes, Forward" : "Yes, Approve"}
      />
    </div>
  );
}