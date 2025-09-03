"use client";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import PastProjectsTab from "./PastProjectsTab";
import { useAuth } from "@/context/AuthContext";
import ScheduledProjectsTab from "./ScheduledProjectsTab";
import ActiveProjectsTab from "./ActiveProjectsTab";
import MonumentDetailView from "./MonumentDetailView";
import EditHistoryTab from "./EditHistoryTab";
import { Info, Briefcase, Clock, History, Search, Filter, X, Calendar } from "lucide-react";

export default function MonumentTabs({ monument, projects, onUpdate }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  const scheduledProjects = projects.filter((p) => p.status === "scheduled");
  const activeProjects = projects.filter((p) => p.status === "active");
  const pastProjects = projects.filter((p) => p.status === "completed");

  const canViewProjectTabs = user && (user?.role === "admin" || user?.role === "super_admin" || user?.role === "quality_manager" || user?.role === "financial_officer");
  
  // Filter and search logic for scheduled projects
  const filteredScheduledProjects = useMemo(() => {
    let filtered = scheduledProjects;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((project) => project.name.toLowerCase().includes(term) || project.description?.toLowerCase().includes(term) || project.contractorName?.toLowerCase().includes(term) || project.documents?.some((doc) => doc.name.toLowerCase().includes(term)));
    }

    // Apply category filter
    if (filterBy !== "all") {
      switch (filterBy) {
        case "high-budget":
          filtered = filtered.filter((p) => p.budget && p.budget > 1000000);
          break;
        case "starting-soon":
          const oneMonthFromNow = new Date();
          oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
          filtered = filtered.filter((p) => new Date(p.timeline?.start || p.createdAt) <= oneMonthFromNow);
          break;
        case "high-priority":
          filtered = filtered.filter((p) => p.priority === "high" || p.priority === "urgent");
          break;
        case "with-docs":
          filtered = filtered.filter((p) => p.documents && p.documents.length > 0);
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [scheduledProjects, searchTerm, filterBy]);

  // Filter and search logic for active projects
  const filteredActiveProjects = useMemo(() => {
    let filtered = activeProjects;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((project) => project.name.toLowerCase().includes(term) || project.description?.toLowerCase().includes(term) || project.contractorName?.toLowerCase().includes(term) || project.documents?.some((doc) => doc.name.toLowerCase().includes(term)));
    }

    if (filterBy !== "all") {
      switch (filterBy) {
        case "high-budget":
          filtered = filtered.filter((p) => p.budget && p.budget > 1000000);
          break;
        case "behind-schedule":
          // Projects that should have ended by now but are still active
          const today = new Date();
          filtered = filtered.filter((p) => new Date(p.timeline?.end || "2099-12-31") < today);
          break;
        case "high-priority":
          filtered = filtered.filter((p) => p.priority === "high" || p.priority === "urgent");
          break;
        case "with-docs":
          filtered = filtered.filter((p) => p.documents && p.documents.length > 0);
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [activeProjects, searchTerm, filterBy]);

  // Filter and search logic for past projects
  const filteredPastProjects = useMemo(() => {
    let filtered = pastProjects;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((project) => project.name.toLowerCase().includes(term) || project.description?.toLowerCase().includes(term) || project.contractorName?.toLowerCase().includes(term) || project.documents?.some((doc) => doc.name.toLowerCase().includes(term)));
    }

    if (filterBy !== "all") {
      switch (filterBy) {
        case "high-budget":
          filtered = filtered.filter((p) => p.budget && p.budget > 1000000);
          break;
        case "recent":
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          filtered = filtered.filter((p) => new Date(p.timeline?.end || p.createdAt) > sixMonthsAgo);
          break;
        case "with-docs":
          filtered = filtered.filter((p) => p.documents && p.documents.length > 0);
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [pastProjects, searchTerm, filterBy]);

  // Filter edit history
  const filteredHistory = useMemo(() => {
    if (!monument.editHistory || !Array.isArray(monument.editHistory)) return [];

    let filtered = monument.editHistory;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.changes?.some(
            (change) =>
              change.field.toLowerCase().includes(term) ||
              String(change.oldValue || "")
                .toLowerCase()
                .includes(term) ||
              String(change.newValue || "")
                .toLowerCase()
                .includes(term)
          ) || entry.editedBy?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [monument.editHistory, searchTerm]);

  const tabs = useMemo(() => {
    const baseTabs = [
      { id: "details", label: "Details", icon: Info, count: null },
    ];
    
    if (canViewProjectTabs) {
      baseTabs.push(
        { id: "scheduled", label: "Scheduled Projects", icon: Calendar, count: scheduledProjects.length },
        { id: "active", label: "Active Projects", icon: Briefcase, count: activeProjects.length },
        { id: "past", label: "Past Projects", icon: Clock, count: pastProjects.length },
        { id: "history", label: "Edit History", icon: History, count: monument.editHistory?.length || 0 }
      );
    }
    
    return baseTabs;
  }, [canViewProjectTabs, scheduledProjects.length, activeProjects.length, pastProjects.length, monument.editHistory]);


  const clearFilters = () => {
    setSearchTerm("");
    setFilterBy("all");
  };

  const showSearchAndFilter = ["scheduled", "active", "past", "history"].includes(activeTab);

  // Get filter options based on active tab
  const getFilterOptions = () => {
    switch (activeTab) {
      case "scheduled":
        return [
          { value: "all", label: "All Projects" },
          { value: "starting-soon", label: "Starting Soon (1 month)" },
          { value: "high-priority", label: "High Priority" },
          { value: "high-budget", label: "High Budget (₹10L+)" },
          { value: "with-docs", label: "With Documents" },
        ];
      case "active":
        return [
          { value: "all", label: "All Projects" },
          { value: "behind-schedule", label: "Behind Schedule" },
          { value: "high-priority", label: "High Priority" },
          { value: "high-budget", label: "High Budget (₹10L+)" },
          { value: "with-docs", label: "With Documents" },
        ];
      case "past":
        return [
          { value: "all", label: "All Projects" },
          { value: "recent", label: "Recent (6 months)" },
          { value: "high-budget", label: "High Budget (₹10L+)" },
          { value: "with-docs", label: "With Documents" },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="overflow-hidden text-gray-700 bg-white border border-gray-100 shadow-xl rounded-2xl">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <nav className="flex px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  clearFilters(); // Clear filters when switching tabs
                }}
                className={cn("flex items-center space-x-2 py-4 px-6 border-b-3 font-medium text-sm transition-all duration-200", activeTab === tab.id ? "border-blue-600 text-blue-600 bg-white/50" : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-white/30")}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== null && <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600")}>{tab.count}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filter Bar */}
      {showSearchAndFilter && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={`Search ${activeTab === "history" ? "edit history" : "projects"}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full py-2 pl-10 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Filter Dropdown - Only for Project tabs */}
            {["scheduled", "active", "past"].includes(activeTab) && (
              <div className="sm:w-48">
                <div className="relative">
                  <Filter className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)} className="block w-full py-2 pl-10 pr-10 text-sm bg-white border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500">
                    {getFilterOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {(searchTerm || filterBy !== "all") && (
              <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-600 transition-colors border border-gray-300 rounded-lg hover:text-gray-800 hover:bg-gray-50">
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Count */}
          {(searchTerm || filterBy !== "all") && (
            <div className="mt-3 text-sm text-gray-600">
              {activeTab === "scheduled" && (
                <span>
                  Showing {filteredScheduledProjects.length} of {scheduledProjects.length} scheduled projects
                </span>
              )}
              {activeTab === "active" && (
                <span>
                  Showing {filteredActiveProjects.length} of {activeProjects.length} active projects
                </span>
              )}
              {activeTab === "past" && (
                <span>
                  Showing {filteredPastProjects.length} of {pastProjects.length} past projects
                </span>
              )}
              {activeTab === "history" && (
                <span>
                  Showing {filteredHistory.length} of {monument.editHistory?.length || 0} history entries
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Content */}
      <div className="p-8 text-gray-700">
        {activeTab === "details" && <MonumentDetailView monument={monument} />}

        {user && (user?.role === "admin" || user?.role === "super_admin" || user?.role === "quality_manager" || user?.role === "financial_officer") && (
          <>
            {activeTab === "scheduled" && <ScheduledProjectsTab projects={filteredScheduledProjects} monumentId={monument.id} onUpdate={onUpdate} totalProjects={scheduledProjects.length} isFiltered={searchTerm || filterBy !== "all"} />}

            {activeTab === "active" && <ActiveProjectsTab projects={filteredActiveProjects} monumentId={monument.id} onUpdate={onUpdate} totalProjects={activeProjects.length} isFiltered={searchTerm || filterBy !== "all"} />}

            {activeTab === "past" && <PastProjectsTab projects={filteredPastProjects} monumentId={monument.id} onUpdate={onUpdate} totalProjects={pastProjects.length} isFiltered={searchTerm || filterBy !== "all"} />}

            {activeTab === "history" && <EditHistoryTab history={filteredHistory} monument={monument} totalEntries={monument.editHistory?.length || 0} isFiltered={searchTerm !== ""} />}
          </>
        )}
      </div>
    </div>
  );
}
