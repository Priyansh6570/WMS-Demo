'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { dataManager } from '@/lib/data-manager'
import StatCard from '@/components/dashboard/StatCard'
import { Users, Building, FolderOpen, Clock } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const statsData = await dataManager.getDashboardStats()
        setStats(statsData)
      } catch (err) {
        setError('Could not load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const renderAdminDashboard = () => (
    <>
      <StatCard icon={Users} title="Total Users" value={stats?.totalUsers} isLoading={loading} color="blue" />
      <StatCard icon={Building} title="Total Monuments" value={stats?.totalMonuments} isLoading={loading} color="purple" />
      <StatCard icon={FolderOpen} title="Active Projects" value={stats?.activeProjects} isLoading={loading} color="green" />
      <StatCard icon={Clock} title="Pending Milestones" value={stats?.pendingMilestones} isLoading={loading} color="yellow" />
    </>
  )
  
  const renderContractorDashboard = () => {
    // For a contractor, you might need a separate API endpoint 
    // or fetch their specific project data here.
    // For now, we'll show some general stats.
    return (
      <>
        <StatCard icon={FolderOpen} title="Active Projects" value={stats?.activeProjects} isLoading={loading} color="green" />
        <StatCard icon={Clock} title="Pending Milestones" value={stats?.pendingMilestones} isLoading={loading} color="yellow" />
      </>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
      
      {error && <div className="p-4 text-red-600 bg-red-100 rounded-md">{error}</div>}

      <div className="dashboard-grid">
        {(user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'quality_manager' || user?.role === 'financial_officer') && renderAdminDashboard()}
        {user?.role === 'contractor' && renderContractorDashboard()}
      </div>
    </div>
  )
}