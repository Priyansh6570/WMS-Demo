import Link from 'next/link'
import { Folder } from 'lucide-react'
import { getStatusInfo } from '@/lib/constants'

export default function AssignedProjectsList({ projects }) {
  return (
    <div className="text-gray-700 divide-y divide-gray-200">
      {projects.length > 0 ? projects.map(project => {
        const statusInfo = getStatusInfo(project.status)
        return (
          <Link href={`/WMS/projects/${project.id}`} key={project.id} className="block p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full"><Folder className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <p className="font-medium text-gray-900">{project.name}</p>
                  <p className="text-sm text-gray-500">Monument: {project.monumentName || 'N/A'}</p>
                </div>
              </div>
              <span className={`status-badge ${statusInfo.color}`}>{statusInfo.label}</span>
            </div>
          </Link>
        )
      }) : (
        <p className="p-4 text-sm text-center text-gray-500">No projects assigned.</p>
      )}
    </div>
  )
}