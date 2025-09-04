'use client'
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Target, Calendar, IndianRupee, CheckCircle2, Clock, AlertTriangle, TrendingUp, Plus, ChevronRight, Timer, CalendarDays } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

const getMilestoneStatusConfig = (status) => {
  switch (status) {
    case 'pending':
      return { 
        icon: Calendar, 
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        label: 'Pending',
        bgClass: 'bg-blue-50 border-blue-200'
      };
    case 'active':
      return { 
        icon: TrendingUp, 
        color: 'bg-green-100 text-green-700 border-green-200',
        label: 'Active',
        bgClass: 'bg-green-50 border-green-200'
      };
    case 'completed':
      return { 
        icon: CheckCircle2, 
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        label: 'Completed',
        bgClass: 'bg-emerald-50 border-emerald-200'
      };
    case 'delayed':
      return { 
        icon: AlertTriangle, 
        color: 'bg-red-100 text-red-700 border-red-200',
        label: 'Delayed',
        bgClass: 'bg-red-50 border-red-200'
      };
    default:
      return { 
        icon: Clock, 
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        label: status,
        bgClass: 'bg-gray-50 border-gray-200'
      };
  }
};

const getPriorityConfig = (priority) => {
  switch (priority) {
    case 'high': 
      return { 
        color: 'bg-red-50 border-l-red-500 border-red-200', 
        badge: 'bg-red-100 text-red-700 border-red-200',
        label: 'High Priority'
      };
    case 'medium': 
      return { 
        color: 'bg-yellow-50 border-l-yellow-500 border-yellow-200', 
        badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        label: 'Medium Priority'
      };
    case 'low': 
      return { 
        color: 'bg-green-50 border-l-green-500 border-green-200', 
        badge: 'bg-green-100 text-green-700 border-green-200',
        label: 'Low Priority'
      };
    default: 
      return { 
        color: 'bg-gray-50 border-l-gray-500 border-gray-200', 
        badge: 'bg-gray-100 text-gray-700 border-gray-200',
        label: 'Standard'
      };
  }
};

const calculateDaysBetween = (date1, date2) => {
  const diffTime = Math.abs(new Date(date2) - new Date(date1));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function ProjectMilestonesTab({ project, onUpdate }) {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { projectId } = params;
  
  const canEdit = user?.role === 'super_admin' || user?.role === 'admin';
  const milestones = project.milestones || [];

  const isCompleted = project.status === "completed";

  // Sort milestones by start date (chronological order)
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (!a.timeline?.start) return 1;
    if (!b.timeline?.start) return -1;
    return new Date(a.timeline.start) - new Date(b.timeline.start);
  });

  // Calculate milestone statistics
  const now = new Date();
  
  // Next milestone (first pending milestone based on start date)
  const nextMilestone = sortedMilestones.find(m => 
    m.status === 'pending' && 
    m.timeline?.start && 
    new Date(m.timeline.start) >= now
  );
  const daysUntilNext = nextMilestone ? calculateDaysBetween(now, new Date(nextMilestone.timeline.start)) : null;
  
  // Active milestone count (should typically be 1)
  const activeMilestones = milestones.filter(m => m.status === 'active');
  
  // Completed milestones
  const completedMilestones = milestones.filter(m => m.status === 'completed');
  
  // Delayed milestones (active or pending with end date passed)
  const delayedMilestones = milestones.filter(m => 
    (m.status === 'active' || m.status === 'pending') && 
    m.timeline?.end && 
    new Date(m.timeline.end) < now
  );

  const handleMilestoneClick = (milestone) => {
    router.push(`/WMS/projects/${projectId}/milestones/${milestone.id}`);
  };

  if (milestones.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
            <Target className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="mb-3 text-xl font-semibold text-gray-900">No Milestones Defined</h3>
          <p className="mb-8 text-gray-500 leading-relaxed">
            Project milestones help track key deliverables, deadlines, and progress checkpoints. 
            Set up milestones to monitor project success effectively.
          </p>
          {canEdit && !isCompleted && (
            <Link href={`/WMS/projects/${projectId}/milestones/create`} passHref>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Create First Milestone
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Project Milestones</h3>
          <p className="mt-2 text-gray-600">
            Track progress through {milestones.length} key project milestone{milestones.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canEdit && !isCompleted && (
          <Link href={`/WMS/projects/${projectId}/milestones/create`} passHref>
            <Button variant="outline" className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Update Milestones
            </Button>
          </Link>
        )}
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Next Milestone */}
        <div className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Timer className="w-5 h-5 text-blue-600" />
              </div>
              <span className="ml-3 text-sm font-medium text-blue-700">Next Milestone</span>
            </div>
          </div>
          {nextMilestone ? (
            <div>
              <p className="text-2xl font-bold text-blue-900 mb-1">
                {daysUntilNext} {daysUntilNext === 1 ? 'day' : 'days'}
              </p>
              <p className="text-sm text-blue-600 mb-2">until next milestone starts</p>
              <p className="text-xs text-blue-800 font-medium truncate">
                {nextMilestone.name}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Starts: {formatDate(nextMilestone.timeline.start)}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-2xl font-bold text-blue-900">All Set</p>
              <p className="text-sm text-blue-600">No pending milestones</p>
            </div>
          )}
        </div>

        {/* Active Milestone */}
        <div className="relative p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="ml-3 text-sm font-medium text-green-700">Currently Active</span>
            </div>
          </div>
          {activeMilestones.length > 0 ? (
            <div>
              <p className="text-2xl font-bold text-green-900 mb-1">
                {activeMilestones.length}
              </p>
              <p className="text-sm text-green-600 mb-2">active milestone{activeMilestones.length > 1 ? 's' : ''}</p>
              <p className="text-xs text-green-800 font-medium truncate">
                {activeMilestones[0].name}
              </p>
              {activeMilestones[0].timeline?.end && (
                <p className="text-xs text-green-600 mt-1">
                  Ends: {formatDate(activeMilestones[0].timeline.end)}
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-2xl font-bold text-green-900">None</p>
              <p className="text-sm text-green-600">No active milestone</p>
            </div>
          )}
        </div>

        {/* Completed Milestones */}
        <div className="relative p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="ml-3 text-sm font-medium text-emerald-700">Completed</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-900 mb-1">
              {completedMilestones.length}
            </p>
            <p className="text-sm text-emerald-600 mb-2">
              of {milestones.length} milestone{milestones.length !== 1 ? 's' : ''}
            </p>
            {completedMilestones.length > 0 && (
              <div>
                <p className="text-xs text-emerald-800 font-medium">Latest:</p>
                <p className="text-xs text-emerald-700 truncate">
                  {completedMilestones[completedMilestones.length - 1]?.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Delayed Milestones */}
        <div className="relative p-6 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <span className="ml-3 text-sm font-medium text-red-700">Delayed</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-900 mb-1">
              {delayedMilestones.length}
            </p>
            <p className="text-sm text-red-600 mb-2">overdue milestone{delayedMilestones.length !== 1 ? 's' : ''}</p>
            {delayedMilestones.length > 0 && (
              <div>
                <p className="text-xs text-red-800 font-medium">Most Overdue:</p>
                <p className="text-xs text-red-700 truncate">
                  {delayedMilestones[0]?.name}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {calculateDaysBetween(now, new Date(delayedMilestones[0]?.timeline?.end))} days late
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">Milestone Timeline</h4>
          <p className="text-sm text-gray-500">{sortedMilestones.length} milestone{sortedMilestones.length !== 1 ? 's' : ''} chronologically ordered</p>
        </div>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-gray-200 to-gray-200"></div>
          
          <div className="space-y-8">
            {sortedMilestones.map((milestone, index) => {
              const statusConfig = getMilestoneStatusConfig(milestone.status);
              const priorityConfig = getPriorityConfig(milestone.priority);
              const StatusIcon = statusConfig.icon;
              const isOverdue = milestone.timeline?.end && new Date(milestone.timeline.end) < now && milestone.status !== 'completed';
              const daysFromStart = milestone.timeline?.start ? calculateDaysBetween(now, new Date(milestone.timeline.start)) : null;
              
              return (
                <div key={milestone.id || index} className="relative flex items-start">
                  {/* Enhanced Timeline dot */}
                  <div className={`relative z-10 flex items-center justify-center w-20 h-20 rounded-full border-4 shadow-lg ${
                    milestone.status === 'completed' 
                      ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 border-emerald-500' 
                      : milestone.status === 'active'
                        ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-500'
                        : isOverdue
                          ? 'bg-gradient-to-br from-red-100 to-red-200 border-red-500'
                          : milestone.status === 'pending'
                            ? 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-500'
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300'
                  }`}>
                    <StatusIcon className={`w-8 h-8 ${
                      milestone.status === 'completed' 
                        ? 'text-emerald-700' 
                        : milestone.status === 'active'
                          ? 'text-green-700'
                          : isOverdue
                            ? 'text-red-700'
                            : milestone.status === 'pending'
                              ? 'text-blue-700'
                              : 'text-gray-600'
                    }`} />
                  </div>
                  
                  {/* Enhanced Milestone content */}
                  <div 
                    className={`flex-1 ml-8 p-8 bg-white border-l-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:-translate-y-1 ${priorityConfig.color}`}
                    onClick={() => handleMilestoneClick(milestone)}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center mb-3 space-x-3">
                          <h5 className="text-xl font-bold text-gray-900">{milestone.name}</h5>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                          {milestone.priority && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityConfig.badge}`}>
                              {priorityConfig.label}
                            </span>
                          )}
                          {isOverdue && (
                            <span className="px-2 py-1 text-xs font-bold text-red-800 bg-red-200 border border-red-300 rounded-full animate-pulse">
                              {calculateDaysBetween(now, new Date(milestone.timeline.end))} DAYS OVERDUE
                            </span>
                          )}
                        </div>
                        
                        {milestone.description && (
                          <p className="mb-6 text-gray-700 leading-relaxed">{milestone.description}</p>
                        )}
                        
                        {/* Enhanced Details Grid */}
                        <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
                          {milestone.timeline?.start && (
                            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                              <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                              <div>
                                <span className="block text-xs text-blue-600 font-medium">Start Date</span>
                                <span className="block text-sm font-semibold text-blue-900">
                                  {formatDate(milestone.timeline.start)}
                                </span>
                                {milestone.status === 'pending' && daysFromStart && (
                                  <span className="text-xs text-blue-500">
                                    {new Date(milestone.timeline.start) > now ? `${daysFromStart} days to start` : 'Started'}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {milestone.timeline?.end && (
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                              <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                              <div>
                                <span className="block text-xs text-gray-500 font-medium">End Date</span>
                                <span className={`block text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                  {formatDate(milestone.timeline.end)}
                                </span>
                                {milestone.timeline.end && (
                                  <span className={`text-xs ${isOverdue ? 'text-red-500' : new Date(milestone.timeline.end) > now ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {isOverdue ? `${calculateDaysBetween(now, new Date(milestone.timeline.end))} days overdue` : 
                                     new Date(milestone.timeline.end) > now ? `${calculateDaysBetween(now, new Date(milestone.timeline.end))} days remaining` : 'Completed'}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {milestone.budget && (
                            <div className="flex items-center p-3 bg-green-50 rounded-lg">
                              <IndianRupee className="w-5 h-5 mr-3 text-green-600" />
                              <div>
                                <span className="block text-xs text-green-600 font-medium">Budget Allocated</span>
                                <span className="block text-sm font-semibold text-green-900">
                                  {formatCurrency(milestone.budget)}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {milestone.completedAt && (
                            <div className="flex items-center p-3 bg-emerald-50 rounded-lg">
                              <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-600" />
                              <div>
                                <span className="block text-xs text-emerald-600 font-medium">Completed On</span>
                                <span className="block text-sm font-semibold text-emerald-900">
                                  {formatDate(milestone.completedAt)}
                                </span>
                              </div>
                            </div>
                          )}

                          {milestone.clearanceChecklist && milestone.clearanceChecklist.length > 0 && (
                            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                              <Target className="w-5 h-5 mr-3 text-purple-600" />
                              <div>
                                <span className="block text-xs text-purple-600 font-medium">Clearance Items</span>
                                <span className="block text-sm font-semibold text-purple-900">
                                  {milestone.clearanceChecklist.filter(item => item.completed).length}/{milestone.clearanceChecklist.length} completed
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Clearance Checklist */}
                        {milestone.clearanceChecklist && milestone.clearanceChecklist.length > 0 && (
                          <div className="p-4  rounded-lg">
                            <h6 className="mb-3 text-sm font-semibold text-gray-800 flex items-center">
                              <Target className="w-4 h-4 mr-2" />
                              Clearance Checklist ({milestone.clearanceChecklist.filter(d => d.completed).length}/{milestone.clearanceChecklist.length})
                            </h6>
                            <div className="space-y-2">
                              {milestone.clearanceChecklist.map((item, idx) => (
                                <div key={item.id || idx} className="flex items-center p-2 bg-white rounded">
                                  <CheckCircle2 className={`w-4 h-4 mr-3 flex-shrink-0 ${
                                    item.completed ? 'text-emerald-500' : 'text-gray-300'
                                  }`} />
                                  <span className={`text-sm ${
                                    item.completed 
                                      ? 'text-gray-600 line-through' 
                                      : 'text-gray-800 font-medium'
                                  }`}>
                                    {item.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Click indicator */}
                      <div className="ml-4 flex items-center text-gray-400">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}