"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, notFound } from "next/navigation";
import { dataManager } from "@/lib/data-manager";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Button from "@/components/ui/Button";
import MonumentHeader from "@/components/monuments/MonumentHeader";
import MonumentTabs from "@/components/monuments/MonumentTabs";
import MonumentForm from "@/components/monuments/MonumentForm";
import { FilePlus, Edit, Loader2 } from "lucide-react";

export default function MonumentDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const { monumentId } = params;
  const [monument, setMonument] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const canEdit = user?.role === "super_admin" || user?.role === "admin";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [monumentData, projectsData] = await Promise.all([dataManager.getMonumentById(monumentId), dataManager.getProjects()]);
      setMonument(monumentData);
      setProjects(projectsData.filter((p) => p.monumentId === monumentId));
    } catch (err) {
      setError("Failed to load monument details.");
    } finally {
      setLoading(false);
    }
  }, [monumentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-xl font-medium text-gray-700">Loading monument details...</p>
          <p className="mt-2 text-gray-500">Please wait while we fetch the information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
        <div className="max-w-md p-8 mx-auto text-center bg-white shadow-lg rounded-xl">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Error Loading Monument</h3>
          <p className="mb-4 text-red-600">{error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!monument) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-8 mx-auto max-w-7xl">
          <div className="flex items-start justify-between">
            <MonumentHeader monument={monument} />
            <div className="flex flex-shrink-0 space-x-3">
              {canEdit && (
                <>
                  <Link href={`/WMS/monuments/${monument.id}/edit`} className="inline-flex items-center px-4 py-2 font-medium text-gray-700 transition-all duration-200 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Monument
                  </Link>
                  <Link href={`/WMS/projects/create?monumentId=${monument.id}`} className="inline-flex items-center px-6 py-2 font-medium text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <FilePlus className="w-4 h-4 mr-2" />
                    New Project
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 mx-auto max-w-7xl">
        <MonumentTabs monument={monument} projects={projects} onUpdate={fetchData} />
      </div>

      {isEditModalOpen && <MonumentForm monument={monument} onClose={() => setIsEditModalOpen(false)} onSave={fetchData} />}
    </div>
  );
}
