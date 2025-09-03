import { getRoleInfo } from '@/lib/constants'
import { User, Phone, Building } from 'lucide-react'

export default function UserDetailCard({ user }) {
  const roleInfo = getRoleInfo(user.role)
  
  return (
    <div className="p-6 text-gray-700 card">
        <div className="flex items-start space-x-4">
            <img src={user.profileImage} alt={user.name} className="w-16 h-16 border rounded-full" />
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <span className={`status-badge mt-1 ${roleInfo.color}`}>{roleInfo.label}</span>
                <div className="flex flex-col mt-2 space-y-1 text-sm text-gray-600">
                    <div className="flex items-center"><Phone className="w-4 h-4 mr-2" />{user.mobile}</div>
                    {user.companyName && <div className="flex items-center"><Building className="w-4 h-4 mr-2" />{user.companyName}</div>}
                </div>
            </div>
        </div>
    </div>
  )
}