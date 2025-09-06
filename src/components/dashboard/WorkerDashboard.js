"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataManager } from "@/lib/data-manager";
import {
  FolderOpen,
  CheckCircle,
  PlayCircle,
  Clock,
  Activity,
  Target,
  Award,
  AlertCircle,
  Camera,
  FileText,
  Calendar,
  User,
  TrendingUp,
  BarChart3,
  RefreshCw,
  PauseCircle,
  Users,
  Building,
  Phone,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import Link from "next/link";

const COLORS = ["#10B981", "#3B82F6", "#6B7280", "#F59E0B", "#8B5CF6", "#EC4899"];

// Clickable Stat Card Component
const ClickableStatCard = ({ icon: Icon, title, value, subtitle, color, route_url, isLoading }) => {
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
        </div>
        <div className="w-24 h-8 bg-gray-300 rounded mb-2"></div>
        <div className="w-32 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <Link href={route_url} className="group">
      <div className="group cursor-pointer p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-4 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
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

// Recent Activity Section
const RecentActivitySection = ({ stats }) => {
  const recentActivity = stats?.recentActivity || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
      <SectionHeader 
        icon={Activity} 
        title="My Recent Activity" 
        description="Your recent milestone and project updates" 
      />

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Updates</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {recentActivity.map((activity, index) => (
            <Link href={activity.link} key={index}>
              <div className="flex items-start space-x-3 p-3 mb-2 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${
                  activity.type === "Milestone Update" ? "bg-green-500" : "bg-blue-500"
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

// Worker Dashboard Component
export default function WorkerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const statsData = await dataManager.getWorkerDashboardStats(user.id);
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

  const projects = stats?.workerProjects || [];
  const allMilestones = stats?.allMilestones || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active': return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'scheduled': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-gray-500" />;
      default: return <PauseCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "projects", label: "My Projects", icon: FolderOpen },
    { id: "milestones", label: "My Tasks", icon: Target },
    { id: "activity", label: "Activity", icon: Activity },
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
              <h1 className="text-3xl font-bold text-gray-900">Worker Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Track your assigned projects and tasks</p>
              {stats?.workerInfo?.contractor && (
                <p className="text-sm text-gray-500 mt-1">
                  Under contractor: {stats.workerInfo.contractor.name} | {stats.workerInfo.contractor.mobile}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
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
                title="Your Work Overview" 
                description="Track your assigned projects and milestone progress" 
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ClickableStatCard 
                  icon={FolderOpen} 
                  title="Assigned Projects" 
                  value={stats?.totalProjects || 0} 
                  subtitle="Projects you're working on" 
                  color="blue" 
                  route_url="/WMS/projects" 
                  isLoading={loading}
                />
                <ClickableStatCard
                  icon={PlayCircle}
                  title="Active Projects"
                  value={stats?.activeProjects || 0}
                  subtitle="Currently in progress"
                  color="green"
                  route_url="/WMS/projects"
                  isLoading={loading}
                />
                <ClickableStatCard 
                  icon={Target} 
                  title="Active Tasks" 
                  value={stats?.activeMilestones || 0} 
                  subtitle="Milestones to complete" 
                  color="yellow" 
                  route_url="/WMS/projects" 
                  isLoading={loading}
                />
                <ClickableStatCard 
                  icon={Award} 
                  title="Completed Tasks" 
                  value={stats?.completedMilestones || 0} 
                  subtitle="Milestones finished" 
                  color="purple" 
                  route_url="/WMS/projects" 
                  isLoading={loading}
                />
              </div>
            </div>

            {/* Task Status Chart */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <SectionHeader 
                icon={BarChart3} 
                title="Task Status Overview" 
                description="Visual breakdown of your milestone progress" 
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Milestone Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: stats?.completedMilestones || 0, fill: '#10B981' },
                          { name: 'Active', value: stats?.activeMilestones || 0, fill: '#3B82F6' },
                          { name: 'Pending', value: stats?.pendingMilestones || 0, fill: '#6B7280' },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[0, 1, 2].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#10B981', '#3B82F6', '#6B7280'][index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800 font-medium">Completion Rate</span>
                      <span className="text-green-600 font-bold">
                        {stats?.performance?.completionRate || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-800 font-medium">Active Tasks</span>
                      <span className="text-blue-600 font-bold">{stats?.activeMilestones || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-800 font-medium">Total Projects</span>
                      <span className="text-purple-600 font-bold">{stats?.totalProjects || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-yellow-800 font-medium">Project Involvement</span>
                      <span className="text-yellow-600 font-bold">{stats?.performance?.projectInvolvementRate || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-6">
            <SectionHeader 
              icon={FolderOpen} 
              title="My Assigned Projects" 
              description="Projects you're currently working on" 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link href={`/WMS/projects/${project.id}`} key={project.id}>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow p-6 cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Monument:</span>
                        <span className="font-medium text-xs">{project.monumentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Budget:</span>
                        <span className="font-medium">₹{project.budget?.toLocaleString('en-IN') || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Milestones:</span>
                        <span className="font-medium">{project.milestones?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Timeline:</span>
                        <span className="font-medium text-xs">
                          {project.timeline?.start ? new Date(project.timeline.start).toLocaleDateString('en-IN') : 'N/A'}
                        </span>
                      </div>
                      {project.priority && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Priority:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.priority === 'high' ? 'bg-red-100 text-red-800' :
                            project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.priority}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {projects.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No projects assigned to you yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "milestones" && (
          <div className="space-y-6">
            <SectionHeader 
              icon={Target} 
              title="My Tasks (Milestones)" 
              description="All milestones from your assigned projects" 
            />
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Task Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Project</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Monument</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Budget</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Timeline</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allMilestones.map((milestone) => (
                      <tr key={milestone.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{milestone.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{milestone.description}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{milestone.projectName}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{milestone.monumentName}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ₹{milestone.budget?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {milestone.timeline?.start && milestone.timeline?.end ? (
                            <div>
                              <div>{new Date(milestone.timeline.start).toLocaleDateString('en-IN')}</div>
                              <div className="text-xs">to {new Date(milestone.timeline.end).toLocaleDateString('en-IN')}</div>
                            </div>
                          ) : 'Not set'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(milestone.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                              {milestone.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link 
                            href={`/WMS/projects/${milestone.projectId}/milestones/${milestone.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allMilestones.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No milestones assigned to you yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && <RecentActivitySection stats={stats} />}
      </div>
    </div>
  );
}