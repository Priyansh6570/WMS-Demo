"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataManager } from "@/lib/data-manager";
import {
  FolderOpen,
  DollarSign,
  Users,
  TrendingUp,
  Activity,
  Search,
  ChevronDown,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  BarChart3,
  Download,
  RefreshCw,
  Target,
  Award,
  Clock,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line, Legend } from "recharts";
import Link from "next/link";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

// Clickable Stat Card Component
const ClickableStatCard = ({ icon: Icon, title, value, subtitle, color, onClick, trend, trendValue, isLoading, route_url }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="w-16 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="w-24 h-8 bg-gray-300 rounded mb-2"></div>
        <div className="w-32 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <Link href={route_url} className="group">
      <div onClick={onClick} className="group cursor-pointer p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-4 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-sm font-semibold ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
        <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
        <div className="mt-3 text-xs text-blue-600 group-hover:text-blue-800 font-medium">Click to view →</div>
      </div>
    </Link>
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

// Project Analysis Section for Contractor
const ContractorProjectAnalysisSection = ({ stats }) => {
  const [selectedProject, setSelectedProject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showSelectDropdown, setShowSelectDropdown] = useState(false);
  const searchRef = useRef(null);
  const selectRef = useRef(null);

  const allProjects = stats?.contractorProjects || [];
  const filteredProjects = allProjects.filter((p) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.monumentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProjectData = allProjects.find((p) => p.id === selectedProject);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setShowSelectDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSearchDropdown(e.target.value.length > 0);
  };

  const handleSearchSelect = (project) => {
    setSearchTerm(project.name);
    setSelectedProject(project.id);
    setShowSearchDropdown(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active': return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'scheduled': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'on_hold': return <PauseCircle className="w-5 h-5 text-orange-500" />;
      default: return <PauseCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
      <SectionHeader 
        icon={FolderOpen} 
        title="My Projects Analysis" 
        description="Detailed analysis of your assigned projects" 
      />

      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          {/* Search Input with Dropdown */}
          <div ref={searchRef} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search your projects..." 
              value={searchTerm} 
              onChange={handleSearchChange} 
              onFocus={() => searchTerm && setShowSearchDropdown(true)} 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <div 
                      key={project.id} 
                      onClick={() => handleSearchSelect(project)} 
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-600">{project.monumentName}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-center">No project with this name exists</div>
                )}
              </div>
            )}
          </div>

          {/* Select Dropdown */}
          <div ref={selectRef} className="relative">
            <button 
              onClick={() => setShowSelectDropdown(!showSelectDropdown)} 
              className="flex items-center justify-between bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-48"
            >
              <span className="truncate">
                {selectedProject ? allProjects.find((p) => p.id === selectedProject)?.name || "Select Project" : "Select Project"}
              </span>
              <ChevronDown className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
            </button>

            {/* Select Dropdown List */}
            {showSelectDropdown && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto min-w-80">
                <div
                  onClick={() => {
                    setSelectedProject("");
                    setShowSelectDropdown(false);
                  }}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 text-gray-500"
                >
                  Select Project
                </div>
                {allProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project.id);
                      setShowSelectDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-600">{project.monumentName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProjectData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Project Overview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Project Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monument:</span>
                <span className="font-semibold text-gray-900">{selectedProjectData.monumentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Budget:</span>
                <span className="font-semibold text-green-600">₹{selectedProjectData.budget?.toLocaleString("en-IN") || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Earned:</span>
                <span className="font-semibold text-blue-600">₹{selectedProjectData.spentBudget?.toLocaleString("en-IN") || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Remaining:</span>
                <span className="font-semibold text-purple-600">₹{selectedProjectData.remainingBudget?.toLocaleString("en-IN") || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold text-gray-900">{selectedProjectData.durationDays || 0} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold px-2 py-1 rounded-full text-sm ${getStatusColor(selectedProjectData.status)}`}>
                  {selectedProjectData.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Priority:</span>
                <span className={`font-semibold px-2 py-1 rounded-full text-sm ${
                  selectedProjectData.priority === 'high' ? 'bg-red-100 text-red-800' :
                  selectedProjectData.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedProjectData.priority || 'normal'}
                </span>
              </div>
            </div>
          </div>

          {/* Milestone Status */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Milestone Progress</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(selectedProjectData.milestones || []).map((milestone, index) => (
                <Link href={`/WMS/projects/${selectedProjectData.id}/milestones/${milestone.id}`} key={milestone.id}>
                  <div className="flex items-center justify-between p-3 mb-2 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{milestone.name}</p>
                      <p className="text-sm text-gray-600">₹{milestone.budget?.toLocaleString("en-IN") || 0}</p>
                      {milestone.timeline && (
                        <p className="text-xs text-gray-500">
                          {new Date(milestone.timeline.start).toLocaleDateString('en-IN')} - 
                          {new Date(milestone.timeline.end).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      {getStatusIcon(milestone.status)}
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(milestone.status)}`}>
                        {milestone.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {!selectedProjectData.milestones?.length && 
                <p className="text-gray-500 text-center py-4">No milestones available</p>
              }
            </div>
          </div>

          {/* Performance Analytics */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Performance Analytics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Milestones:</span>
                <span className="font-semibold text-gray-900">{selectedProjectData.totalMilestones || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed:</span>
                <span className="font-semibold text-green-600">{selectedProjectData.completedMilestones || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active:</span>
                <span className="font-semibold text-blue-600">{selectedProjectData.activeMilestones || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Progress:</span>
                <span className="font-semibold text-blue-600">{selectedProjectData.progressPercentage || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Budget Utilized:</span>
                <span className="font-semibold text-orange-600">{selectedProjectData.budgetUtilization || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Documents:</span>
                <span className="font-semibold text-indigo-600">{selectedProjectData.totalDocuments || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Photos:</span>
                <span className="font-semibold text-pink-600">{selectedProjectData.totalPhotos || 0}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Select a project to view detailed analysis</p>
        </div>
      )}
    </div>
  );
};

// User Activity Section for Contractor
const ContractorActivitySection = ({ stats }) => {
  const recentActivity = stats?.recentActivity || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
      <SectionHeader 
        icon={Activity} 
        title="My Team Activity" 
        description="Recent activity from you and your workers" 
      />

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {recentActivity.map((activity, index) => (
            <Link href={activity.link} key={index}>
              <div className="flex items-start space-x-3 p-3 mb-2 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${
                  activity.type === "Project Update" ? "bg-blue-500" : 
                  activity.type === "Milestone Update" ? "bg-green-500" : 
                  "bg-purple-500"
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.text}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.importance === 'high' ? 'bg-red-100 text-red-600' :
                      activity.importance === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {activity.importance}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {!recentActivity.length && 
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          }
        </div>
      </div>
    </div>
  );
};

// Team Overview Section
const TeamOverviewSection = ({ stats }) => {
  const workers = stats?.contractorWorkers || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
      <SectionHeader 
        icon={Users} 
        title="My Team Overview" 
        description="Manage your workers and their assignments" 
      />

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Team Members</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((worker) => (
            <Link href={`/WMS/users/${worker.id}`} key={worker.id}>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {worker.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{worker.name}</h4>
                    <p className="text-sm text-gray-600">{worker.mobile}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Projects:</span>
                    <span className="font-semibold ml-1">{worker.projectsCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Login:</span>
                    <span className="font-semibold ml-1 text-xs">{worker.lastLoginFormatted}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    worker.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {worker.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {!workers.length && 
            <div className="col-span-full text-center py-8">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No team members found</p>
              <Link href="/WMS/users" className="text-blue-600 hover:text-blue-800 text-sm">
                Add team members
              </Link>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

// Main Contractor Dashboard Component
export default function ContractorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const statsData = await dataManager.getContractorDashboardStats(user.id);
        setStats(statsData);
      } catch (err) {
        setError("Could not load dashboard data.");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.id]);

  const handleStatClick = (type) => {
    console.log(`Navigate to ${type} page`);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "projects", label: "My Projects", icon: FolderOpen },
    { id: "team", label: "My Team", icon: Users },
    { id: "activity", label: "Team Activity", icon: Activity },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="p-4 text-red-600 bg-red-100 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Track your projects and team performance</p>
              
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id 
                    ? "border-blue-500 text-blue-600" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Overall Statistics */}
            <div>
              <SectionHeader 
                icon={TrendingUp} 
                title="Your Performance Overview" 
                description="Key performance indicators for your projects and team" 
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ClickableStatCard 
                  icon={FolderOpen} 
                  title="Total Projects" 
                  value={stats?.totalProjects || 0} 
                  subtitle="Projects assigned to you" 
                  color="blue" 
                  onClick={() => handleStatClick("projects")} 
                  isLoading={loading} 
                  route_url="/WMS/projects" 
                />
                <ClickableStatCard
                  icon={Target}
                  title="Active Projects"
                  value={stats?.activeProjects || 0}
                  subtitle="Currently in progress"
                  color="green"
                  trend="up"
                  trendValue={stats?.projectGrowthRate || "0%"}
                  onClick={() => handleStatClick("projects")}
                  isLoading={loading}
                  route_url="/WMS/projects"
                />
                <ClickableStatCard 
                  icon={Users} 
                  title="Team Members" 
                  value={stats?.totalWorkers || 0} 
                  subtitle="Workers under you" 
                  color="purple" 
                  onClick={() => handleStatClick("workers")} 
                  isLoading={loading} 
                  route_url="/WMS/users" 
                />
                <ClickableStatCard 
                  icon={Award} 
                  title="Total Earnings" 
                  value={`₹${((stats?.totalEarnings || 0) / 100000).toFixed(1)}L`} 
                  subtitle="From completed milestones" 
                  color="yellow" 
                  onClick={() => handleStatClick("earnings")} 
                  isLoading={loading} 
                  route_url="/WMS/projects" 
                />
              </div>
            </div>

            {/* Performance Chart */}
            {stats?.monthlyProgress && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <SectionHeader 
                  icon={BarChart3} 
                  title="Monthly Progress" 
                  description="Track your project completion and earnings over time" 
                />
                <div style={{ width: "100%", height: 400 }}>
                  <ResponsiveContainer>
                    <BarChart data={stats.monthlyProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#10B981" name="Completed Projects" />
                      <Bar dataKey="earnings" fill="#3B82F6" name="Earnings (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "projects" && <ContractorProjectAnalysisSection stats={stats} />}
        {activeTab === "team" && <TeamOverviewSection stats={stats} />}
        {activeTab === "activity" && <ContractorActivitySection stats={stats} />}
      </div>
    </div>
  );
}