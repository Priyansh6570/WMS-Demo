'use client'
import { useState } from 'react';
import Button from '../ui/Button';
import { Calendar, IndianRupee, User, FileText, ExternalLink, Play, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { dataManager } from '@/lib/data-manager';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getDaysUntilStart = (startDate) => {
  if (!startDate) return null;
  const today = new Date();
  const start = new Date(startDate);
  const diffTime = start - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function ScheduledProjectsTab({ projects, monumentId, onUpdate, totalProjects, isFiltered }) {
  const [actionLoading, setActionLoading] = useState({});

  const handleStartProject = async (projectId) => {
    setActionLoading(prev => ({ ...prev, [projectId]: true }));
    
    try {
      await dataManager.updateProject(projectId, { 
        status: 'active',
        actualStartDate: new Date().toISOString()
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to start project:', error);
      // Could add a toast notification here
    } finally {
      setActionLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handlePostponeProject = async (projectId, newStartDate) => {
    setActionLoading(prev => ({ ...prev, [projectId]: true }));
    
    try {
      await dataManager.updateProject(projectId, { 
        'timeline.start': newStartDate,
        postponed: true,
        postponedAt: new Date().toISOString()
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to postpone project:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  if (projects.length === 0) {
    return (
      <div className="py-12 text-center text-gray-700 border-2 border-gray-200 border-dashed bg-gray-50 rounded-xl">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {isFiltered ? 'No Matching Scheduled Projects' : 'No Scheduled Projects'}
          </h3>
          <p className="text-gray-500">
            {isFiltered 
              ? 'No scheduled projects match your search criteria.'
              : 'Projects will appear here once they are created and before they begin.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Scheduled Projects</h3>
          <p className="text-sm text-gray-600">
            {isFiltered 
              ? `${projects.length} of ${totalProjects} scheduled projects shown`
              : `${totalProjects} project${totalProjects !== 1 ? 's' : ''} awaiting start`
            }
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {projects.map(project => {
          const daysUntilStart = getDaysUntilStart(project.timeline?.start);
          const isStartingSoon = daysUntilStart !== null && daysUntilStart <= 7 && daysUntilStart >= 0;
          const isOverdue = daysUntilStart !== null && daysUntilStart < 0;
          const isLoading = actionLoading[project.id];

          return (
            <div key={project.id} className="transition-shadow duration-200 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
              {/* Project Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="mb-2 text-lg font-semibold text-gray-900">{project.name}</h4>
                    <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end ml-4 space-y-2">
                    {/* Priority Badge */}
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(project.priority)}`}>
                      {project.priority ? project.priority.charAt(0).toUpperCase() + project.priority.slice(1) : 'Medium'} Priority
                    </span>
                    
                    {/* Status Badge */}
                    {isOverdue ? (
                      <span className="flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded-full">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Overdue
                      </span>
                    ) : isStartingSoon ? (
                      <span className="flex items-center px-3 py-1 text-xs font-medium border rounded-full bg-amber-100 text-amber-700 border-amber-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Starting Soon
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-full">
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>

                {/* Timeline Alert */}
                {daysUntilStart !== null && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    isOverdue 
                      ? 'bg-red-50 border border-red-200' 
                      : isStartingSoon 
                        ? 'bg-amber-50 border border-amber-200'
                        : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      isOverdue 
                        ? 'text-red-700' 
                        : isStartingSoon 
                          ? 'text-amber-700'
                          : 'text-blue-700'
                    }`}>
                      {isOverdue 
                        ? `Start date was ${Math.abs(daysUntilStart)} day${Math.abs(daysUntilStart) !== 1 ? 's' : ''} ago`
                        : daysUntilStart === 0
                          ? 'Scheduled to start today'
                          : `Starts in ${daysUntilStart} day${daysUntilStart !== 1 ? 's' : ''}`
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Project Details */}
              <div className="p-6 space-y-4">
                {/* Budget */}
                {project.budget && (
                  <div className="flex items-center text-sm">
                    <div className="flex items-center justify-center w-8 h-8 mr-3 bg-green-100 rounded-lg">
                      <IndianRupee className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <span className="text-gray-500">Budget:</span>
                      <span className="ml-2 font-medium text-gray-900">{formatCurrency(project.budget)}</span>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {project.timeline?.start && (
                  <div className="flex items-center text-sm">
                    <div className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-gray-500">Scheduled:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {formatDate(project.timeline.start)}
                        {project.timeline.end && ` - ${formatDate(project.timeline.end)}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Contractor */}
                {project.contractorName && (
                  <div className="flex items-center text-sm">
                    <div className="flex items-center justify-center w-8 h-8 mr-3 bg-purple-100 rounded-lg">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-gray-500">Contractor:</span>
                      <span className="ml-2 font-medium text-gray-900">{project.contractorName}</span>
                    </div>
                  </div>
                )}

                {/* Documents */}
                {project.documents && project.documents.length > 0 && (
                  <div className="flex items-start text-sm">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mr-3 mt-0.5">
                      <FileText className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-500">Documents:</span>
                      <div className="mt-1 space-y-1">
                        {project.documents.slice(0, 2).map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                            <span className="text-xs font-medium text-gray-700 truncate">
                              {doc.name}
                            </span>
                            <a 
                              href={doc.path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-shrink-0 ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                        {project.documents.length > 2 && (
                          <p className="mt-2 text-xs text-gray-500">
                            +{project.documents.length - 2} more document{project.documents.length - 2 !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Created {formatDate(project.createdAt)}
                  </div>
                  <div className="flex space-x-2">
                    {/* Start Project Button */}
                    {/* <Button
                      size="sm"
                      onClick={() => handleStartProject(project.id)}
                      loading={isLoading}
                      disabled={isLoading}
                      className="text-white bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start Project
                    </Button> */}
                    
                    {/* Edit/Postpone Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isLoading}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Edit Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}