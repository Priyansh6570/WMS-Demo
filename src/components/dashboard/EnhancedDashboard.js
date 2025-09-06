"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataManager } from "@/lib/data-manager";
import {
  Building,
  FolderOpen,
  AlertTriangle,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  Activity,
  Eye,
  ChevronDown,
  Search,
  FileText,
  Camera,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  Target,
  Award,
  BrainCircuit,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Filter,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, LineChart as RechartsLineChart, Line, Legend, RadialBarChart, RadialBar } from "recharts";
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

// Project Analysis Section
const ProjectAnalysisSection = ({ stats }) => {
  const [selectedProject, setSelectedProject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showSelectDropdown, setShowSelectDropdown] = useState(false);
  const searchRef = useRef(null);
  const selectRef = useRef(null);

  const allProjects = stats?.detailedProjectsList || [];
  const filteredProjects = allProjects.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.monumentName.toLowerCase().includes(searchTerm.toLowerCase()));

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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
      <SectionHeader icon={FolderOpen} title="Project-wise Analysis" description="Detailed analysis of individual projects" />

      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          {/* Search Input with Dropdown */}
          <div ref={searchRef} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search projects..." value={searchTerm} onChange={handleSearchChange} onFocus={() => searchTerm && setShowSearchDropdown(true)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <div key={project.id} onClick={() => handleSearchSelect(project)} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
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
            <button onClick={() => setShowSelectDropdown(!showSelectDropdown)} className="flex items-center justify-between bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-48">
              <span className="truncate">{selectedProject ? allProjects.find((p) => p.id === selectedProject)?.name || "Select Project" : "Select Project"}</span>
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
                <span className="text-gray-600">Spent:</span>
                <span className="font-semibold text-red-600">₹{selectedProjectData.spentBudget?.toLocaleString("en-IN") || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Remaining:</span>
                <span className="font-semibold text-blue-600">₹{selectedProjectData.remainingBudget?.toLocaleString("en-IN") || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold text-gray-900">{selectedProjectData.durationDays || 0} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Contractor:</span>
                <span className="font-semibold text-purple-600">{selectedProjectData.contractorName}</span>
              </div>
            </div>
          </div>

          {/* Milestone Status */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Milestone Status</h3>
            <div className="space-y-3">
              {(selectedProjectData.milestones || []).slice(0, 5).map((milestone, index) => (
                <Link href={`/WMS/projects/${selectedProjectData.id}/milestones/${milestone.id}`} key={milestone.id}>
                  <div key={milestone.id} className="flex items-center justify-between p-3 mb-2 bg-white rounded-lg shadow-sm">
                    <div>
                      <p className="font-medium text-gray-900">{milestone.name}</p>
                      <p className="text-sm text-gray-600">₹{milestone.budget?.toLocaleString("en-IN") || 0}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {milestone.status === "completed" ? <CheckCircle className="w-5 h-5 text-green-500" /> : milestone.status === "active" ? <PlayCircle className="w-5 h-5 text-blue-500" /> : <PauseCircle className="w-5 h-5 text-gray-400" />}
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${milestone.status === "completed" ? "bg-green-100 text-green-800" : milestone.status === "active" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>{milestone.status}</span>
                    </div>
                  </div>
                </Link>
              ))}
              {!selectedProjectData.milestones?.length && <p className="text-gray-500 text-center py-4">No milestones available</p>}
            </div>
          </div>

          {/* Project Analytics */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Analytics</h3>
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
                <span className="text-gray-600">Progress:</span>
                <span className="font-semibold text-blue-600">{selectedProjectData.progressPercentage || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Budget Used:</span>
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

// Monument Details Section
const MonumentDetailsSection = ({ stats }) => {
  const monuments = stats?.monumentAnalytics || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
      <SectionHeader icon={Building} title="Monument-wise Details" description="Comprehensive monument analysis and project progress" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monument Progress Chart */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">Project Completion by Monument</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={monuments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} label={{ value: "Completion %", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, "Completion Rate"]} />
                <Bar dataKey="completionRate" fill="#8B5CF6" name="Completion %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monument Investment */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">Investment by Monument</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <RechartsPieChart>
                <Pie data={monuments} dataKey="totalInvestment" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ₹${(value / 100000).toFixed(1)}L`}>
                  {monuments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Investment"]} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monument Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monuments.map((monument, index) => (
          <Link href={`/WMS/monuments/${monument.id}`} key={monument.id}>
            <div key={monument.id} className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{monument.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{monument.location}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <PlayCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">{monument.activeProjects} Active</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">{monument.completedProjects} Completed</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`px-1 py-2 rounded-lg text-center text-xs font-medium ${
                      monument.condition === "excellent" ? "bg-green-100 text-green-800" : monument.condition === "good" ? "bg-blue-100 text-blue-800" : monument.condition === "fair" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {monument.condition?.charAt(0).toUpperCase() + monument.condition?.slice(1) || "Unknown"}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">₹{((monument.totalInvestment || 0) / 100000).toFixed(1)}L invested</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// User Activity Section
const UserActivitySection = ({ stats }) => {
  const allUsers = stats?.userAnalytics || [];
  const recentActivity = stats?.recentActivity || [];

  // Create contractor-worker hierarchy
  const contractors = allUsers.filter((user) => user.role === "contractor");
  const workers = allUsers.filter((user) => user.role === "worker");

  const contractorHierarchy = contractors.map((contractor) => {
    const contractorWorkers = workers.filter((worker) => worker.createdBy === contractor.id);
    return {
      contractor,
      workers: contractorWorkers,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
      <SectionHeader icon={Users} title="User Information & Activity" description="Team activity and user engagement tracking" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivity.map((activity, index) => (
              <Link href={activity.link} key={index}>
                <div key={index} className="flex items-start space-x-3 p-3 mb-2 bg-white rounded-lg shadow-sm">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${activity.type === "Project Update" ? "bg-blue-500" : activity.type === "Milestone Update" ? "bg-green-500" : "bg-purple-500"}`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.text}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {" "}
                        {new Date(activity.date).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {!recentActivity.length && <p className="text-gray-500 text-center py-4">No recent activity</p>}
          </div>
        </div>

        {/* Contractor-Worker Hierarchy */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Team Overview</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {contractorHierarchy.map(({ contractor, workers }, index) => (
              <div key={contractor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Contractor Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-medium text-sm">{contractor.name?.charAt(0) || "C"}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{contractor.name}</p>
                        <p className="text-xs text-blue-600 font-medium">Contractor</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-900">{contractor.projectsCount || 0} projects</p>
                      <p className="text-xs text-gray-500">Last: {contractor.lastLoginFormatted || "Never"}</p>
                    </div>
                  </div>
                </div>

                {/* Workers under this contractor */}
                {workers.length > 0 && (
                  <div className="p-3">
                    {workers.map((worker, workerIndex) => (
                      <div key={worker.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center ml-4">
                            <span className="text-green-700 font-medium text-xs">{worker.name?.charAt(0) || "W"}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{worker.name}</p>
                            <p className="text-xs text-green-600 font-medium">Worker</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-700">{worker.projectsCount || 0} projects</p>
                          <p className="text-xs text-gray-500">Last: {worker.lastLoginFormatted || "Never"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No workers message */}
                {workers.length === 0 && <div className="p-3 text-center text-gray-500 text-sm bg-gray-50">No workers added by this contractor</div>}
              </div>
            ))}

            {contractorHierarchy.length === 0 && <p className="text-gray-500 text-center py-4">No contractors found</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function EnhancedDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const statsData = await dataManager.getDashboardStats();
        setStats(statsData);
      } catch (err) {
        setError("Could not load dashboard data.");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleStatClick = (type) => {
    console.log(`Navigate to ${type} page`);
    // Add navigation logic here based on type
    // Example: router.push(`/WMS/${type}`)
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "monuments", label: "Monuments", icon: Building },
    { id: "users", label: "Users", icon: Users },
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
          <div className="p-4 text-red-600 bg-red-100 rounded-lg">{error}</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Archaeological Heritage Management</h1>
              <p className="text-gray-600 mt-1">Madhya Pradesh Archaeological Department - Professional Dashboard</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
              <button onClick={() => window.location.reload()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
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
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
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
              <SectionHeader icon={TrendingUp} title="Overall Statistics" description="Key performance indicators and system overview" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ClickableStatCard icon={Building} title="Heritage Sites" value={stats?.totalMonuments || 0} subtitle="Total monuments" color="purple" onClick={() => handleStatClick("monuments")} isLoading={loading} route_url="/WMS/monuments" />
                <ClickableStatCard
                  icon={FolderOpen}
                  title="Active Projects"
                  value={stats?.activeProjectsCount || 0}
                  subtitle="Currently in progress"
                  color="green"
                  trend="up"
                  trendValue={stats?.projectGrowthRate || "0%"}
                  onClick={() => handleStatClick("projects")}
                  isLoading={loading}
                  route_url="/WMS/projects"
                />
                <ClickableStatCard icon={Users} title="Team Members" value={stats?.totalUsers || 0} subtitle="Total registered users" color="blue" onClick={() => handleStatClick("users")} isLoading={loading} route_url="/WMS/users" />
                <ClickableStatCard icon={DollarSign} title="Total Investment" value={`₹${((stats?.totalBudget || 0) / 100000).toFixed(1)}L`} subtitle="Allocated across all projects" color="yellow" onClick={() => handleStatClick("budget")} isLoading={loading} route_url="/WMS/projects" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "projects" && <ProjectAnalysisSection stats={stats} />}
        {activeTab === "monuments" && <MonumentDetailsSection stats={stats} />}
        {activeTab === "users" && <UserActivitySection stats={stats} />}
      </div>
    </div>
  );
}
