'use client'
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataManager } from '@/lib/data-manager';
import { Search, Filter, X, Calendar, IndianRupee, User, MapPin, Clock, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

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

export default function ProjectsListingPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [monuments, setMonuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsData, monumentsData] = await Promise.all([
          dataManager.getProjects(),
          dataManager.getMonuments()
        ]);
        
        // Filter projects based on user role
        let filteredProjects = projectsData;
        
        if (user?.role === 'contractor') {
          // Show only projects assigned to this contractor
          filteredProjects = projectsData.filter(project => 
            project.contractorId === user.id
          );
        } else if (user?.role === 'worker') {
          // Show only projects where this worker is assigned
          filteredProjects = projectsData.filter(project => 
            project.workers && project.workers.some(worker => worker.id === user.id)
          );
        }
        // For super_admin, admin, quality_manager, financial_officer - show all projects
        
        // Sort by latest first
        filteredProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setProjects(filteredProjects);
        setMonuments(monumentsData);
      } catch (err) {
        setError('Failed to load projects.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term) ||
        project.contractorName?.toLowerCase().includes(term) ||
        monuments.find(m => m.id === project.monumentId)?.name.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    return filtered;
  }, [projects, monuments, searchTerm, statusFilter, priorityFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-xl font-medium text-gray-700">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md p-8 mx-auto text-center bg-white shadow-lg rounded-xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Error Loading Projects</h3>
            <p className="mb-4 text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-700 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="px-6 py-8 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">
            {user?.role === 'contractor' 
              ? `Manage projects assigned to you (${projects.length} total)`
              : user?.role === 'worker'
                ? `View projects you're working on (${projects.length} total)`
                : `Manage all projects across monuments (${projects.length} total)`
            }
          </p>
        </div>

        {/* Search and Filters */}
        <div className="p-6 mb-8 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects, monuments, contractors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full py-3 pl-10 pr-10 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <div className="relative">
                <Filter className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full py-3 pl-10 pr-4 text-base bg-white border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Priority Filter */}
            <div className="lg:w-48">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="block w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 text-gray-600 transition-colors border border-gray-300 rounded-lg hover:text-gray-800 hover:bg-gray-50 whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Count */}
          {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map(project => {
              const monument = monuments.find(m => m.id === project.monumentId);
              const statusConfig = getStatusConfig(project.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Link 
                  key={project.id} 
                  href={`/WMS/projects/${project.id}`}
                  className="block transition-transform duration-200 hover:scale-[1.02]"
                >
                  <div className="h-full transition-shadow duration-200 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                    {/* Project Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="mb-1 text-lg font-semibold text-gray-900 truncate">
                            {project.name}
                          </h3>
                          <p className="flex items-center text-sm text-gray-600">
                            <MapPin className="flex-shrink-0 w-4 h-4 mr-1" />
                            {monument?.name || 'Unknown Monument'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0 ml-4 space-y-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(project.priority)}`}>
                            {project.priority ? project.priority.charAt(0).toUpperCase() + project.priority.slice(1) : 'Medium'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {project.description || 'No description available'}
                      </p>
                    </div>

                    {/* Project Details */}
                    <div className="p-6 space-y-3">
                      {/* Budget */}
                      {project.budget && (
                        <div className="flex items-center text-sm">
                          <IndianRupee className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-gray-500">Budget:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {formatCurrency(project.budget)}
                          </span>
                        </div>
                      )}

                      {/* Timeline */}
                      {project.timeline?.start && (
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="text-gray-500">Timeline:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {formatDate(project.timeline.start)}
                            {project.timeline.end && ` - ${formatDate(project.timeline.end)}`}
                          </span>
                        </div>
                      )}

                      {/* Contractor */}
                      {project.contractorName && (
                        <div className="flex items-center text-sm">
                          <User className="w-4 h-4 mr-2 text-purple-600" />
                          <span className="text-gray-500">Contractor:</span>
                          <span className="ml-1 font-medium text-gray-900 truncate">
                            {project.contractorName}
                          </span>
                        </div>
                      )}

                      {/* Progress (for active projects) */}
                      {project.status === 'active' && typeof project.progress === 'number' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Progress:</span>
                            <span className="font-medium text-gray-900">{project.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 transition-all duration-300 bg-green-500 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created {formatDate(project.createdAt)}</span>
                        <span>ID: {project.id.slice(-8).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-white border-2 border-gray-200 border-dashed rounded-xl">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No Projects Found'
                  : 'No Projects Yet'
                }
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : user?.role === 'contractor'
                    ? 'Projects assigned to you will appear here.'
                    : user?.role === 'worker' 
                      ? 'Projects you\'re assigned to will appear here.'
                      : 'Create new projects to get started with monument management.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}