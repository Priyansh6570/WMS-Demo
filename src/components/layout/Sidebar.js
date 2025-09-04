'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, LogOut, ChevronRight } from 'lucide-react'
import * as Icons from 'lucide-react'
import { getNavigationItems, getRoleInfo } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export default function Sidebar({ user }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const navigationItems = getNavigationItems(user.role)
  const roleInfo = getRoleInfo(user.role)

  const Icon = ({ name }) => {
    const LucideIcon = Icons[name]
    return LucideIcon ? <LucideIcon className="h-5 w-5 mr-3 text-current" /> : null
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header Section */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">WMS</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-3">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out relative',
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
              )}
            >
              <Icon name={item.icon} />
              <span className="flex-1">{item.name}</span>
              {pathname === item.href && (
                <ChevronRight className="h-4 w-4 text-blue-600" />
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <span className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mt-1.5',
                roleInfo.color
              )}>
                {roleInfo.label}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="group flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 ease-in-out border border-transparent hover:border-red-200"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}