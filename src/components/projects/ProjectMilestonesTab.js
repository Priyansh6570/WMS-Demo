'use client'
import { useState } from 'react';
import { Target, Calendar, IndianRupee, CheckCircle2, Clock, AlertTriangle, TrendingUp, Plus } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

const getMilestoneStatusConfig = (status) => {
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
    case 'delayed':
      return { 
        icon: AlertTriangle, 
        color: 'bg-red-100 text-red-700 border-red-200',
        label: 'Delayed'
      };
    default:
      return { 
        icon: Clock, 
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        label: status
      };
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'bg-red-50 border-l-red-500';
    case 'medium': return 'bg-yellow-50 border-l-yellow-500';
    case 'low': return 'bg-green-50 border-l-green-500';
    default: return 'bg-gray-50 border-l-gray-500';
  }
};

export default function ProjectMilestonesTab({ project, onUpdate }) {
  const { user } = useAuth();
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  
  const canEdit = user?.role === 'super_admin' || user?.role === 'admin';
  const milestones = project.milestones || [];

  // Sort milestones by due date
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const handleAddMilestone = () => {
    // TODO: Implement add milestone functionality
    console.log('Add milestone clicked');
  };

  const handleEditMilestone = (milestone) => {
    // TODO: Implement edit milestone functionality
    console.log('Edit milestone:', milestone);
  };

  if (milestones.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">No Milestones Set</h3>
          <p className="mb-6 text-gray-500">
            This project doesn't have any milestones yet. Milestones help track key deliverables and progress checkpoints.
          </p>
          {canEdit && (
            <Button onClick={handleAddMilestone} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
              <Plus className="w-4 h-4 mr-2" />
              Add First Milestone
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Milestones Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Project Milestones</h3>
          <p className="mt-1 text-gray-600">{milestones.length} milestone(s) defined for this project</p>
        </div>
        {canEdit && (
          <Button onClick={handleAddMilestone} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Milestone
          </Button>
        )}
      </div>

      {/* Milestones Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Scheduled</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-blue-900">
            {milestones.filter(m => m.status === 'scheduled').length}
          </p>
        </div>
        
        <div className="p-4 border border-green-200 rounded-lg bg-green-50">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            <span className="text-sm font-medium text-green-700">Active</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-green-900">
            {milestones.filter(m => m.status === 'active').length}
          </p>
        </div>
        
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Completed</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {milestones.filter(m => m.status === 'completed').length}
          </p>
        </div>
        
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            <span className="text-sm font-medium text-red-700">Delayed</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-red-900">
            {milestones.filter(m => m.status === 'delayed').length}
          </p>
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Milestone Timeline</h4>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-6">
            {sortedMilestones.map((milestone, index) => {
              const statusConfig = getMilestoneStatusConfig(milestone.status);
              const StatusIcon = statusConfig.icon;
              const isOverdue = milestone.dueDate && new Date(milestone.dueDate) < new Date() && milestone.status !== 'completed';
              
              return (
                <div key={milestone.id || index} className="relative flex items-start">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                    milestone.status === 'completed' 
                      ? 'bg-green-100 border-green-500' 
                      : milestone.status === 'active'
                        ? 'bg-blue-100 border-blue-500'
                        : isOverdue
                          ? 'bg-red-100 border-red-500'
                          : 'bg-gray-100 border-gray-300'
                  }`}>
                    <StatusIcon className={`w-6 h-6 ${
                      milestone.status === 'completed' 
                        ? 'text-green-600' 
                        : milestone.status === 'active'
                          ? 'text-blue-600'
                          : isOverdue
                            ? 'text-red-600'
                            : 'text-gray-500'
                    }`} />
                  </div>
                  
                  {/* Milestone content */}
                  <div className={`flex-1 ml-6 p-6 bg-white border-l-4 rounded-lg shadow-sm ${getPriorityColor(milestone.priority)} ${
                    selectedMilestone?.id === milestone.id ? 'ring-2 ring-blue-500' : ''
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2 space-x-3">
                          <h5 className="text-lg font-semibold text-gray-900">{milestone.title}</h5>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                          {isOverdue && (
                            <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded-full">
                              Overdue
                            </span>
                          )}
                        </div>
                        
                        {milestone.description && (
                          <p className="mb-3 text-gray-600">{milestone.description}</p>
                        )}
                        
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                          {milestone.dueDate && (
                            <div className="flex items-center text-sm">
                              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                              <span className="text-gray-500">Due:</span>
                              <span className={`font-medium ml-1 ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                {formatDate(milestone.dueDate)}
                              </span>
                            </div>
                          )}
                          
                          {milestone.budget && (
                            <div className="flex items-center text-sm">
                              <IndianRupee className="w-4 h-4 mr-2 text-green-600" />
                              <span className="text-gray-500">Budget:</span>
                              <span className="ml-1 font-medium text-gray-900">
                                {formatCurrency(milestone.budget)}
                              </span>
                            </div>
                          )}
                          
                          {milestone.completedAt && (
                            <div className="flex items-center text-sm">
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                              <span className="text-gray-500">Completed:</span>
                              <span className="ml-1 font-medium text-gray-900">
                                {formatDate(milestone.completedAt)}
                              </span>
                            </div>
                          )}
                          
                          {milestone.progress !== undefined && milestone.status !== 'completed' && (
                            <div className="flex items-center text-sm">
                              <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="text-gray-500">Progress:</span>
                              <span className="ml-1 font-medium text-gray-900">{milestone.progress}%</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Progress bar for active milestones */}
                        {milestone.status === 'active' && milestone.progress !== undefined && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1 text-sm">
                              <span className="text-gray-600">Completion Progress</span>
                              <span className="font-medium text-blue-600">{milestone.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 transition-all duration-300 bg-blue-500 rounded-full"
                                style={{ width: `${milestone.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Deliverables */}
                        {milestone.deliverables && milestone.deliverables.length > 0 && (
                          <div className="mt-4">
                            <h6 className="mb-2 text-sm font-medium text-gray-700">Deliverables:</h6>
                            <ul className="space-y-1">
                              {milestone.deliverables.map((deliverable, idx) => (
                                <li key={idx} className="flex items-center text-sm">
                                  <CheckCircle2 className={`w-3 h-3 mr-2 ${
                                    deliverable.completed ? 'text-green-500' : 'text-gray-300'
                                  }`} />
                                  <span className={deliverable.completed ? 'text-gray-600 line-through' : 'text-gray-700'}>
                                    {deliverable.name}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      {canEdit && (
                        <button
                          onClick={() => handleEditMilestone(milestone)}
                          className="px-3 py-1 text-sm text-blue-600 transition-colors border border-blue-200 rounded-lg hover:text-blue-800 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Milestone Details Modal/Sidebar (placeholder for future implementation) */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setSelectedMilestone(null)}></div>
            
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                <h3 className="mb-4 text-lg font-medium text-gray-900">Milestone Details</h3>
                <p className="text-gray-600">Detailed milestone view will be implemented here.</p>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}