'use client'

import Link from 'next/link'
import { getRoleInfo } from '@/lib/constants'
import { Pencil } from 'lucide-react'
import Button from '../ui/Button'

export default function UserTable({ users, currentUser, onEdit }) {

  const canEditUser = (targetUser) => {
    if (currentUser.role === 'super_admin') return true
    if (currentUser.role === 'admin') {
      const editableRoles = ['contractor', 'quality_manager', 'financial_officer']
      return editableRoles.includes(targetUser.role)
    }
    if (currentUser.role === 'contractor') {
      return targetUser.role === 'worker'
    }
    return false
  }

  return (
    <div className="overflow-x-auto text-gray-700">
      <table className="table">
        <thead className="table-header">
          <tr>
            <th className="table-header-cell">Name</th>
            <th className="table-header-cell">Mobile</th>
            <th className="table-header-cell">Role</th>
            <th className="text-right table-header-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const roleInfo = getRoleInfo(user.role)
            const isContractor = user.role === 'contractor'

            return (
              <tr key={user.id} className="table-row">
                <td className="table-cell font-medium">
                  {isContractor ? (
                    <Link href={`/WMS/users/${user.id}`} className="text-primary-600 hover:underline">
                      {user.name}
                    </Link>
                  ) : (
                    user.name
                  )}
                </td>
                <td className="table-cell">{user.mobile}</td>
                <td className="table-cell">
                  <span className={`status-badge ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                </td>
                <td className="table-cell text-right">
                  {canEditUser(user) && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                      <Pencil className="w-4 h-4 text-gray-700" />
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No users found.
        </div>
      )}
    </div>
  )
}