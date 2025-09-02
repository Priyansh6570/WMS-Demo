'use client'

import { useAuth } from '@/context/AuthContext'
import { dataManager } from '@/lib/data-manager'
import StatCard from '@/components/dashboard/StatCard'
import { Users, Building, FolderOpen, CheckCircle, Clock } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const stats = dataManager.getStats() // Fetch stats from your data manager

  const renderAdminDashboard = () => (
    <>
      <StatCard icon={Users} title="Total Users" value={stats.totalUsers} color="blue" />
      <StatCard icon={Building} title="Total Monuments" value={stats.totalMonuments} color="purple" />
      <StatCard icon={FolderOpen} title="Active Projects" value={stats.activeProjects} color="green" />
      <StatCard icon={Clock} title="Pending Milestones" value={stats.pendingMilestones} color="yellow" />
    </>
  )
  
  const renderContractorDashboard = () => {
    // In a real app, you'd filter projects for the current contractor
    const contractorProjects = dataManager.getByField('projects', 'contractorId', user.id)
    const activeProjects = contractorProjects.filter(p => p.status === 'active').length

    return (
      <>
        <StatCard icon={FolderOpen} title="Assigned Projects" value={contractorProjects.length} color="green" />
        <StatCard icon={FolderOpen} title="Active Projects" value={activeProjects} color="blue" />
        {/* Add more contractor-specific stats here */}
      </>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {user?.name}!</h1>
      
      <div className="dashboard-grid">
        {(user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'quality_manager' || user?.role === 'financial_officer') && renderAdminDashboard()}
        {user?.role === 'contractor' && renderContractorDashboard()}
        {/* Add dashboards for other roles as needed */}
      </div>

      {/* You can add more components like charts or recent activity lists here */}
    </div>
  )
}