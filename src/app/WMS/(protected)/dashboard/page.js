"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import EnhancedDashboard from "@/components/dashboard/EnhancedDashboard";
import ContractorDashboard from "@/components/dashboard/ContractorDashboard";
import WorkerDashboard from "@/components/dashboard/WorkerDashboard";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to access the dashboard</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  switch (user.role) {
    case 'contractor':
      return <ContractorDashboard />;
    
    case 'worker':
      return <WorkerDashboard />;
    
    case 'super_admin':
    case 'admin':
    case 'quality_manager':
    case 'financial_officer':
      return <EnhancedDashboard />;
    
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Invalid user role: {user.role}</p>
            <p className="text-gray-500 text-sm">Please contact administrator for access</p>
          </div>
        </div>
      );
  }
}