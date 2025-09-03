'use client'

import { useMemo } from 'react'
import { useParams, notFound } from 'next/navigation'
import { dataManager } from '@/lib/data-manager'
import UserDetailCard from '@/components/users/UserDetailCard'
import WorkerList from '@/components/users/WorkerList'
import AssignedProjectsList from '@/components/users/AssignedProjectsList'

export default function UserDetailPage() {
  const params = useParams()
  const { userId } = params

  const allUsers = dataManager.getAll('users');
  const allProjects = dataManager.getAll('projects');
  
  const contractor = useMemo(() => {
    return allUsers.find(u => u.id === userId && u.role === 'contractor')
  }, [userId, allUsers])

  const workers = useMemo(() => {
    return allUsers.filter(u => u.role === 'worker' && u.createdBy === userId)
  }, [userId, allUsers])

  const assignedProjects = useMemo(() => {
    // Assuming projects have a `contractorId` field
    // You'll need to add this field to your projects.json data
    return allProjects.filter(p => p.contractorId === userId)
  }, [userId, allProjects])

  if (!contractor) {
    // This is a simple way to handle not found for client components in app router
    // In a real app you might use a more sophisticated not-found UI
    notFound()
    return null
  }

  return (
    <div className="space-y-6 text-gray-700">
      <UserDetailCard user={contractor} />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Assigned Workers ({workers.length})</h2>
          </div>
          <WorkerList workers={workers} />
        </div>
        <div className="card">
           <div className="card-header">
            <h2 className="card-title">Assigned Projects ({assignedProjects.length})</h2>
          </div>
          <AssignedProjectsList projects={assignedProjects} />
        </div>
      </div>
    </div>
  )
}