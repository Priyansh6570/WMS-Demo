'use client'
import { Calendar, IndianRupee, User, MapPin, Clock, AlertTriangle, TrendingUp, CheckCircle2, Target, FileText, ExternalLink, Users, Play, Pause, Square } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import AssignWorkerView from './AssignWorkerView';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusConfig = (status) => {
  switch (status) {
    case 'scheduled':
      return { 
        icon: Calendar, 
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        label: 'Scheduled'
      };
    case 'active':
      return { 
        icon: TrendingUp, 
        color: 'bg-green-100 text-green-700 border-green-200',
        label: 'Active'
      };
    case 'completed':
      return { 
        icon: CheckCircle2, 
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        label: 'Completed'
      };
    case 'paused':
      return { 
        icon: Clock, 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        label: 'Paused'
      };
    default:
      return { 
        icon: Clock, 
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        label: status
      };
  }
};

export default function ProjectDetailView({ project, monument, onUpdate }) {
  const statusConfig = getStatusConfig(project.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-8">
      {/* Project Overview Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <div className="p-6 border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full border flex items-center ${statusConfig.color}`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {statusConfig.label}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(project.priority)}`}>
                {project.priority ? project.priority.charAt(0).toUpperCase() + project.priority.slice(1) : 'Medium'}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Project Name</label>
              <p className="text-base font-medium text-gray-900">{project.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-base text-gray-700">
                {project.description || 'No description provided'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Monument</label>
              <div className="flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                {monument ? (
                  <Link 
                    href={`/WMS/monuments/${monument.id}`}
                    className="flex items-center font-medium text-blue-600 hover:text-blue-800"
                  >
                    {monument.name}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                ) : (
                  <span className="text-gray-700">Unknown Monument</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Financial & Timeline */}
        <div className="p-6 border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Financial & Timeline</h3>
          
          <div className="space-y-4">
            {project.budget && (
              <div>
                <label className="text-sm font-medium text-gray-500">Budget</label>
                <div className="flex items-center mt-1">
                  <IndianRupee className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-xl font-bold text-green-700">
                    {formatCurrency(project.budget)}
                  </span>
                </div>
              </div>
            )}
            
            {project.timeline && (
              <div>
                <label className="text-sm font-medium text-gray-500">Timeline</label>
                <div className="mt-2 space-y-2">
                  {project.timeline.start && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-sm text-gray-600">Start:</span>
                      <span className="ml-1 font-medium text-gray-900">
                        {formatDate(project.timeline.start)}
                      </span>
                    </div>
                  )}
                  
                  {project.timeline.end && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-sm text-gray-600">End:</span>
                      <span className="ml-1 font-medium text-gray-900">
                        {formatDate(project.timeline.end)}
                      </span>
                    </div>
                  )}
                  
                  {project.timeline.expectedDuration && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-purple-600" />
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="ml-1 font-medium text-gray-900">
                        {project.timeline.expectedDuration} months
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Progress (for active projects) */}
            {project.status === 'active' && typeof project.progress === 'number' && (
              <div>
                <label className="text-sm font-medium text-gray-500">Progress</label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completion:</span>
                    <span className="text-lg font-bold text-green-600">{project.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div 
                      className="h-3 transition-all duration-300 rounded-full bg-gradient-to-r from-green-500 to-green-600"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Information */}
      <div className="p-6 border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-700">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          Team Information
        </h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Contractor */}
          <div>
            <label className="text-sm font-medium text-gray-500">Contractor</label>
            <div className="flex items-center mt-2">
              <User className="w-5 h-5 mr-3 text-purple-600" />
              <div>
                <p className="font-medium text-gray-700">{project.contractorName || 'Not assigned'}</p>
              </div>
            </div>
          </div>
          <AssignWorkerView project={project} onUpdate={onUpdate} />

        </div>
      </div>

      {/* Project Status Timeline */}
      {/* {(project.actualStartDate || project.pausedAt || project.completedAt) && (
        <div className="p-6 border bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 rounded-xl">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
            <Clock className="w-5 h-5 mr-2 text-amber-600" />
            Status Timeline
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-3 text-blue-600" />
              <span className="w-24 text-sm text-gray-600">Created:</span>
              <span className="font-medium text-gray-900">{formatDate(project.createdAt)}</span>
            </div>
            
            {project.actualStartDate && (
              <div className="flex items-center">
                <Play className="w-4 h-4 mr-3 text-green-600" />
                <span className="w-24 text-sm text-gray-600">Started:</span>
                <span className="font-medium text-gray-900">{formatDate(project.actualStartDate)}</span>
              </div>
            )}
            
            {project.pausedAt && (
              <div className="flex items-center">
                <Pause className="w-4 h-4 mr-3 text-yellow-600" />
                <span className="w-24 text-sm text-gray-600">Paused:</span>
                <span className="font-medium text-gray-900">{formatDate(project.pausedAt)}</span>
              </div>
            )}
            
            {project.completedAt && (
              <div className="flex items-center">
                <Square className="w-4 h-4 mr-3 text-gray-600" />
                <span className="w-24 text-sm text-gray-600">Completed:</span>
                <span className="font-medium text-gray-900">{formatDate(project.completedAt)}</span>
              </div>
            )}
          </div>
        </div>
      )} */}

      {/* Documents */}
      {project.documents && project.documents.length > 0 && (
        <div className="p-6 border border-gray-100 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl">
          <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
            <FileText className="w-5 h-5 mr-2 text-gray-600" />
            Project Documents ({project.documents.length})
          </h3>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {project.documents.map((doc, index) => (
              <div key={index} className="flex items-center p-3 transition-colors bg-white border border-gray-200 rounded-lg hover:border-blue-300">
                <FileText className="flex-shrink-0 w-8 h-8 mr-3 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                  <p className="text-sm text-gray-500 truncate">{doc.path}</p>
                </div>
                <a
                  href={doc.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 transition-colors hover:text-blue-600"
                  title="Open document"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones Overview */}
      <div className="p-6 border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
          <Target className="w-5 h-5 mr-2 text-teal-600" />
          Milestones Overview
        </h3>
        
        {project.milestones && project.milestones.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Milestones:</span>
              <span className="font-medium text-gray-900">{project.milestones.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium text-green-600">
                {project.milestones.filter(m => m.status === 'completed').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">In Progress:</span>
              <span className="font-medium text-blue-600">
                {project.milestones.filter(m => m.status === 'active').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium text-yellow-600">
                {project.milestones.filter(m => m.status === 'scheduled').length}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              View detailed milestone information in the "Milestones" tab above.
            </p>
          </div>
        ) : (
          <div className="py-4 text-center">
            <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500">No milestones have been set for this project yet.</p>
            <p className="mt-1 text-sm text-gray-400">
              Milestones help track project progress and key deliverables.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}