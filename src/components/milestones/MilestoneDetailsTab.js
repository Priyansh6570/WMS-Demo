"use client";
import { 
  ShieldCheck, 
  Banknote, 
  FileText, 
  Check, 
  Calendar, 
  Target, 
  Clock, 
  CheckCircle,
  Circle,
  ExternalLink,
  Info,
  TrendingUp,
  MapPin
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function MilestoneDetailsTab({ milestone }) {
  const completedItems = milestone.clearanceChecklist?.filter(item => item.completed) || [];
  const totalItems = milestone.clearanceChecklist?.length || 0;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems.length / totalItems) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden mb-8">
        <div className=" px-6 py-4">
          <div className="flex gap-3 items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Milestone Overview</h3>
              <p className="text-sm text-blue-100">Detailed information and progress tracking</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">Description</h4>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {milestone.description || "No description provided for this milestone."}
                  </p>
                </div>
              </div>

              {/* Clearance Checklist */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">Clearance Checklist</h4>
                    <p className="text-sm text-gray-600">Requirements and compliance tracking</p>
                  </div>
                </div>

                {milestone.clearanceChecklist && milestone.clearanceChecklist.length > 0 ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <div className="space-y-3">
                      {milestone.clearanceChecklist.map((item) => (
                        <div 
                          key={item.id} 
                          className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
                            item.completed 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full mt-0.5 ${
                            item.completed 
                              ? "bg-green-500 text-white shadow-sm" 
                              : "border-2 border-gray-300 bg-white"
                          }`}>
                            {item.completed ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Circle className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className={`block text-sm font-medium ${
                              item.completed 
                                ? "line-through text-gray-500" 
                                : "text-gray-800"
                            }`}>
                              {item.text}
                            </span>
                            {item.completed && (
                              <span className="text-xs text-green-600 mt-1 block font-medium">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-700 mb-2">No Checklist Items</h4>
                    <p className="text-sm text-gray-500">No clearance requirements have been defined for this milestone.</p>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              {/* <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Info className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">Additional Details</h4>
                    <p className="text-sm text-gray-600">Extra information and metadata</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-700">Priority Level:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          milestone.priority === 'high' 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : milestone.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {milestone.priority ? milestone.priority.toUpperCase() : 'MEDIUM'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-700">Type:</span>
                        <span className="text-sm text-purple-600 font-medium">
                          {milestone.type || 'Standard Milestone'}
                        </span>
                      </div>

                      {milestone.estimatedDuration && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-purple-700">Duration:</span>
                          <span className="text-sm text-purple-600 font-medium">
                            {milestone.estimatedDuration} days
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-700">Progress:</span>
                        <span className="text-sm text-purple-600 font-medium">
                          {milestone.progress || 0}%
                        </span>
                      </div>

                      {milestone.assignedTo && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-purple-700">Assigned to:</span>
                          <span className="text-sm text-purple-600 font-medium truncate ml-2">
                            {milestone.assignedTo}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-700">Last Updated:</span>
                        <span className="text-sm text-purple-600 font-medium">
                          {milestone.updatedAt ? formatDate(milestone.updatedAt) : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Sidebar - Right Section */}
            <div className="space-y-6">
              {/* Budget Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-emerald-500 rounded-xl shadow-lg">
                    <Banknote className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-900">Allocated Budget</h4>
                    <p className="text-sm text-emerald-600">Financial allocation</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-emerald-800 mb-2">
                  ₹{milestone.budget?.toLocaleString("en-IN") || "0"}
                </div>
                <div className="flex items-center gap-1 text-sm text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Budget allocated for this milestone</span>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Timeline</h4>
                    <p className="text-sm text-blue-600">Key dates and schedule</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {milestone.timeline?.start && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Start Date</p>
                        <p className="text-sm text-blue-700">{formatDate(milestone.timeline.start)}</p>
                      </div>
                    </div>
                  )}
                  
                  {milestone.timeline?.end && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">End Date</p>
                        <p className="text-sm text-blue-700">{formatDate(milestone.timeline.end)}</p>
                      </div>
                    </div>
                  )}
                  
                  {milestone.createdAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Created</p>
                        <p className="text-sm text-blue-700">{formatDate(milestone.createdAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Card */}
              {milestone.document && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900">Attached Document</h4>
                      <p className="text-sm text-purple-600">Reference materials</p>
                    </div>
                  </div>
                  
                  <a 
                    href={milestone.document.path} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group flex items-center justify-between p-4 bg-white border border-purple-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <span className="font-medium text-purple-900 group-hover:text-purple-700 block">
                          {milestone.document.name}
                        </span>
                        <p className="text-xs text-purple-600 mt-0.5">Click to view document</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-purple-400 group-hover:text-purple-500 transition-colors" />
                  </a>
                </div>
              )}

              {/* Status Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gray-600 rounded-xl shadow-lg">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Milestone Status</h4>
                    <p className="text-sm text-gray-600">Current progress state</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      milestone.status === 'completed' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : milestone.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {milestone.status ? milestone.status.replace('_', ' ').toUpperCase() : 'PENDING'}
                    </span>
                  </div>
                  
                  {milestone.id && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">ID:</span>
                      <span className="text-xs font-mono text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {milestone.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}