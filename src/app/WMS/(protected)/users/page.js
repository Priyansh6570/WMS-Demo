'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { dataManager } from '@/lib/data-manager'
import UserTable from '@/components/users/UserTable'
import UserForm from '@/components/users/UserForm'
import Button from '@/components/ui/Button'
import { PlusCircle, Search } from 'lucide-react'
import { ROLES } from '@/lib/constants'

const getVisibleUsers = (allUsers, currentUser) => {
  if (!allUsers || !currentUser) return [];
  if (currentUser.role === 'super_admin') {
    return allUsers.filter(u => u.id !== currentUser.id)
  }
  if (currentUser.role === 'admin') {
    const visibleRoles = ['admin', 'contractor', 'quality_manager', 'financial_officer']
    return allUsers.filter(u => u.id !== currentUser.id && visibleRoles.includes(u.role))
  }
  if (currentUser.role === 'contractor') {
    return allUsers.filter(u => u.role === 'worker' && u.createdBy === currentUser.id)
  }
  return []
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const usersData = await dataManager.getUsers();
      setAllUsers(usersData);
    } catch (err) {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  const visibleUsers = useMemo(() => getVisibleUsers(allUsers, currentUser), [allUsers, currentUser]);

  const handleOpenModal = (user = null) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const filteredUsers = useMemo(() => {
    return visibleUsers
      .filter(user => roleFilter ? user.role === roleFilter : true)
      .filter(user => {
        const lowerSearchTerm = searchTerm.toLowerCase()
        return (
          user.name.toLowerCase().includes(lowerSearchTerm) ||
          user.mobile.toLowerCase().includes(lowerSearchTerm)
        )
      })
  }, [visibleUsers, searchTerm, roleFilter]);

  const availableRoles = useMemo(() => {
    const roles = new Set(visibleUsers.map(u => u.role));
    return Object.entries(ROLES).filter(([key]) => roles.has(key));
  }, [visibleUsers]);

  return (
    <div className='text-gray-700'>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="w-5 h-5 mr-2" /> Add User
        </Button>
      </div>

      <div className="p-4 mb-6 card">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search by name or mobile..."
              className="pl-10 input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            {availableRoles.map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="p-8 text-center">Loading users...</div>}
      {error && <div className="p-4 text-red-600 bg-red-100 rounded-md">{error}</div>}
      
      {!loading && !error && (
        <div className="card">
          <UserTable
            users={filteredUsers}
            currentUser={currentUser}
            onEdit={handleOpenModal}
          />
        </div>
      )}

      {isModalOpen && (
        <UserForm
          user={editingUser}
          currentUser={currentUser}
          onClose={handleCloseModal}
          onSave={fetchUsers}
        />
      )}
    </div>
  )
}