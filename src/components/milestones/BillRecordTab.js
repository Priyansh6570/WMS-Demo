"use client";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { Banknote, FileText, Info, PlusCircle, UserCircle, Calendar, Download, ExternalLink, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function BillRecordTab({ milestone, projectId }) {
  const { user } = useAuth();
  const financialRecord = milestone.financial_record;
  const canUploadBill = user?.role === "financial_officer" && milestone.status === "completed";
  const hasData = (data) => {
    if (Array.isArray(data)) return data.length > 0;
    return data && data.toString().trim() !== "";
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Banknote className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Bill Records</h3>
            <p className="text-sm text-gray-600 mt-1">Financial documentation and billing information</p>
          </div>
        </div>

        {canUploadBill && !financialRecord && (
          <Link href={`/WMS/projects/${projectId}/milestones/${milestone.id}/add-bill`} passHref>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200">
              <PlusCircle className="w-4 h-4 mr-2" />
              Upload Bill Data
            </Button>
          </Link>
        )}
      </div>

      {!financialRecord ? (
        /* Empty State */
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          <div className="py-16 px-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                <Banknote className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-6">
                  <Info className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">No Bill Record Found</h4>
                <div className="max-w-md mx-auto">
                  {milestone.status === "completed" ? (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Pending Upload</span>
                      </div>
                      <p className="text-sm text-amber-600">The financial officer has not uploaded the bill data for this completed milestone yet.</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-center gap-2 text-blue-700 mb-2">
                        <Info className="w-4 h-4" />
                        <span className="font-medium">Milestone Not Complete</span>
                      </div>
                      <p className="text-sm text-blue-600">Bill records can only be uploaded after the milestone is marked as complete.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
            <div className="flex items-center gap-3 text-white">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Bill Record Submitted</span>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Submission Info */}
            {(hasData(financialRecord.submittedBy) || hasData(financialRecord.submittedAt)) && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                    {hasData(financialRecord.submittedBy) && <span className="font-semibold text-gray-900">Submitted by {financialRecord.submittedBy}</span>}
                    {hasData(financialRecord.submittedAt) && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(financialRecord.submittedAt, { includeTime: true })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bill Details */}
            {hasData(financialRecord.billDetails) && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">Bill Details</h4>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{financialRecord.billDetails}</p>
                </div>
              </div>
            )}

            {/* Associated Documents */}
            {hasData(financialRecord.documents) && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    Associated Documents
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({financialRecord.documents.length} {financialRecord.documents.length === 1 ? "file" : "files"})
                    </span>
                  </h4>
                </div>
                <div className="grid gap-3">
                  {financialRecord.documents.map((doc, i) => (
                    <div key={i} className="group">
                      <a href={doc.path} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group-hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 group-hover:text-blue-700">{doc.name}</span>
                            <p className="text-xs text-gray-500 mt-0.5">Click to view document</p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!hasData(financialRecord.billDetails) && !hasData(financialRecord.documents) && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                  <Info className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No additional content available for this bill record.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
