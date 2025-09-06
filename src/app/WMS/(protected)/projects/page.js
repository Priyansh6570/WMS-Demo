'use client'
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataManager } from '@/lib/data-manager';
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  IndianRupee, 
  User, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2,
  PlusCircle,
  RefreshCw,
  Download,
  FolderOpen,
  Activity,
  Target,
  Users
} from 'lucide-react';
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
        color: 'bg-purple-100 text-purple-700 border-purple-200',
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

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

// Section Header Component
const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center space-x-4 mb-6">
    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

export default function ProjectsListingPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [monuments, setMonuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [projectsData, monumentsData] = await Promise.all([
        dataManager.getProjects(),
        dataManager.getMonuments()
      ]);
      let filteredProjects = projectsData;
      
      if (user?.role === 'contractor') {
        filteredProjects = projectsData.filter(project => 
          project.contractorId === user.id
        );
      } else if (user?.role === 'worker') {
        filteredProjects = projectsData.filter(project => 
          project.workers && project.workers.some(worker => worker.id === user.id)
        );
      }
      filteredProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setProjects(filteredProjects);
      setMonuments(monumentsData);
    } catch (err) {
      setError('Failed to load projects. Please try again.');
      console.error('Projects fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const filteredProjects = useMemo(() => {
    let filtered = projects;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term) ||
        project.contractorName?.toLowerCase().includes(term) ||
        monuments.find(m => m.id === project.monumentId)?.name.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    return filtered;
  }, [projects, monuments, searchTerm, statusFilter, priorityFilter]);

  // Calculate project statistics
  const projectStats = useMemo(() => {
    const statusCount = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});

    const priorityCount = projects.reduce((acc, project) => {
      const priority = project.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    return {
      total: projects.length,
      active: statusCount.active || 0,
      scheduled: statusCount.scheduled || 0,
      completed: statusCount.completed || 0,
      paused: statusCount.paused || 0,
      urgent: priorityCount.urgent || 0,
      high: priorityCount.high || 0,
    };
  }, [projects]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const canCreateProject = user?.role === 'super_admin' || user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-red-800 font-semibold">Error Loading Projects</h3>
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={fetchData}
                  className="mt-2 text-red-700 hover:text-red-900 font-medium text-sm"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-700">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
              <p className="text-gray-600 mt-1">
                {user?.role === 'contractor' 
                  ? `Monitor and manage your assigned heritage projects (${projects.length} total)`
                  : user?.role === 'worker'
                    ? `Track progress on projects you're working on (${projects.length} total)`
                    : `Oversee all heritage conservation projects across monuments (${projects.length} total)`
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Projects</span>
              </button>
              <button 
                onClick={fetchData}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              {canCreateProject && (
                <Link href="/WMS/projects/create">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                    <PlusCircle className="w-4 h-4" />
                    <span>New Project</span>
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={FolderOpen}
            title="Total Projects"
            value={projectStats.total}
            subtitle="All registered projects"
            color="blue"
          />
          <StatsCard
            icon={Activity}
            title="Active Projects"
            value={projectStats.active}
            subtitle="Currently in progress"
            color="green"
          />
          <StatsCard
            icon={Target}
            title="High Priority"
            value={projectStats.urgent + projectStats.high}
            subtitle="Urgent & high"
            color="red"
          />
          <StatsCard
            icon={CheckCircle2}
            title="Completed"
            value={projectStats.completed}
            subtitle="Successfully finished"
            color="purple"
          />
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Filter & Search</h2>
              <p className="text-sm text-gray-600">Find projects by name, monument, contractor, or status</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, monuments, contractors..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4">
            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
            <div className="text-sm text-gray-600 ml-auto">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <SectionHeader 
              icon={FolderOpen} 
              title="Projects Directory" 
              description="Complete overview of all heritage conservation projects"
            />
          </div>
          
          {filteredProjects.length > 0 ? (
            <div className="p-6">
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {filteredProjects.map(project => {
                  const monument = monuments.find(m => m.id === project.monumentId);
                  const statusConfig = getStatusConfig(project.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <Link 
                      key={project.id} 
                      href={`/WMS/projects/${project.id}`}
                      className="block group"
                    >
                      <div className="h-full bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                        {/* Project Header */}
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                                {project.name}
                              </h3>
                              <p className="flex items-center text-sm text-gray-600">
                                <MapPin className="flex-shrink-0 w-4 h-4 mr-1.5" />
                                {monument?.name || 'Unknown Monument'}
                              </p>
                            </div>
                            <div className="flex flex-col items-end flex-shrink-0 ml-4 space-y-2">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center ${statusConfig.color}`}>
                                <StatusIcon className="w-3 h-3 mr-1.5" />
                                {statusConfig.label}
                              </span>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(project.priority)}`}>
                                {project.priority ? project.priority.charAt(0).toUpperCase() + project.priority.slice(1) : 'Medium'}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {project.description || 'No description available'}
                          </p>
                        </div>

                        {/* Project Details */}
                        <div className="p-6 space-y-4">
                          {/* Budget */}
                          {project.budget && (
                            <div className="flex items-center text-sm">
                              <div className="p-2 bg-green-100 rounded-lg mr-3">
                                <IndianRupee className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <span className="text-gray-500 text-xs block">Budget</span>
                                <span className="font-semibold text-gray-900">
                                  {formatCurrency(project.budget)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Timeline */}
                          {project.timeline?.start && (
                            <div className="flex items-center text-sm">
                              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <Calendar className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <span className="text-gray-500 text-xs block">Timeline</span>
                                <span className="font-semibold text-gray-900">
                                  {formatDate(project.timeline.start)}
                                  {project.timeline.end && ` - ${formatDate(project.timeline.end)}`}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Contractor */}
                          {project.contractorName && (
                            <div className="flex items-center text-sm">
                              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                <User className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-gray-500 text-xs block">Contractor</span>
                                <span className="font-semibold text-gray-900 truncate block">
                                  {project.contractorName}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Progress (for active projects) */}
                          {project.status === 'active' && typeof project.progress === 'number' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-semibold text-gray-900">{project.progress}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full transition-all duration-500 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Created {formatDate(project.createdAt)}</span>
                            </div>
                            <span className="font-mono">ID: {project.id.slice(-8).toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No Projects Found'
                  : 'No Projects Yet'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No projects match your current filters. Try adjusting your search criteria.'
                  : user?.role === 'contractor'
                    ? 'Projects assigned to you will appear here once available.'
                    : user?.role === 'worker' 
                      ? 'Projects you\'re assigned to will appear here when available.'
                      : 'Get started by creating your first heritage conservation project.'
                }
              </p>
              {!searchTerm && !statusFilter !== 'all' && !priorityFilter !== 'all' && canCreateProject && (
                <Link href="/WMS/projects/create">
                  <button className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto">
                    <PlusCircle className="w-4 h-4" />
                    <span>Create First Project</span>
                  </button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}