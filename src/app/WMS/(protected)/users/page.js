'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { dataManager } from '@/lib/data-manager'
import UserTable from '@/components/users/UserTable'
import UserForm from '@/components/users/UserForm'
import Button from '@/components/ui/Button'
import { PlusCircle, Search, Users, UserCheck, Filter, RefreshCw, Download } from 'lucide-react'
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

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

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

  // Calculate user statistics
  const userStats = useMemo(() => {
    const roleCount = visibleUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return {
      total: visibleUsers.length,
      contractors: roleCount.contractor || 0,
      workers: roleCount.worker || 0,
      admins: (roleCount.admin || 0) + (roleCount.super_admin || 0),
      qualityManagers: roleCount.quality_manager || 0,
      financialOfficers: roleCount.financial_officer || 0
    };
  }, [visibleUsers]);

  // Role-based stat cards configuration
  const statCards = useMemo(() => {
    if (!currentUser) return [];

    const baseCards = [
      {
        icon: Users,
        title: "Total Users",
        value: userStats.total,
        subtitle: "All registered users",
        color: "blue"
      }
    ];

    if (currentUser.role === 'super_admin') {
      return [
        ...baseCards,
        {
          icon: UserCheck,
          title: "Admins",
          value: userStats.admins,
          subtitle: "System administrators",
          color: "purple"
        },
        {
          icon: Users,
          title: "Contractors",
          value: userStats.contractors,
          subtitle: "Project contractors",
          color: "green"
        },
        {
          icon: Users,
          title: "Workers",
          value: userStats.workers,
          subtitle: "Field workers",
          color: "orange"
        }
      ];
    }

    if (currentUser.role === 'admin') {
      return [
        ...baseCards,
        {
          icon: UserCheck,
          title: "Quality Managers",
          value: userStats.qualityManagers,
          subtitle: "Quality assurance",
          color: "green"
        },
        {
          icon: Users,
          title: "Financial Officers",
          value: userStats.financialOfficers,
          subtitle: "Financial management",
          color: "purple"
        },
        {
          icon: Users,
          title: "Contractors",
          value: userStats.contractors,
          subtitle: "Project contractors",
          color: "orange"
        }
      ];
    }

    if (currentUser.role === 'contractor') {
      return [
        {
          icon: Users,
          title: "Workers",
          value: userStats.workers,
          subtitle: "Your assigned workers",
          color: "blue"
        }
      ];
    }

    return baseCards;
  }, [currentUser, userStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-700">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage team members, contractors, and system access</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Users</span>
              </button>
              <button 
                onClick={fetchUsers}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button 
                onClick={() => handleOpenModal()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className={`grid gap-6 mb-8 ${
          currentUser?.role === 'contractor' 
            ? 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1 max-w-sm' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {statCards.map((card, index) => (
            <StatsCard
              key={index}
              icon={card.icon}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              color={card.color}
            />
          ))}
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Filter & Search</h2>
              <p className="text-sm text-gray-600">Find specific users by name, mobile, or role</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or mobile..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                {availableRoles.map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-center">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                }}
                className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
              <div className="ml-4 text-sm text-gray-600">
                Showing {filteredUsers.length} of {visibleUsers.length} users
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-semibold">!</span>
              </div>
              <div>
                <h3 className="text-red-800 font-semibold">Error Loading Users</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        {!error && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Users Directory</h2>
                  <p className="text-sm text-gray-600">Complete list of system users and their details</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <UserTable
                users={filteredUsers}
                currentUser={currentUser}
                onEdit={handleOpenModal}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!error && filteredUsers.length === 0 && !loading && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || roleFilter 
                ? "No users match your current filters. Try adjusting your search criteria."
                : "Get started by adding your first user to the system."
              }
            </p>
            {!searchTerm && !roleFilter && (
              <button 
                onClick={() => handleOpenModal()}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add First User</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Form Modal */}
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