'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, LogOut } from 'lucide-react'
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
    return LucideIcon ? <LucideIcon className="h-5 w-5 mr-3" /> : null
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
        <Building2 className="h-7 w-7 text-primary-600 mr-2" />
        <h1 className="text-xl font-bold text-gray-900">WMS</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'nav-link',
              pathname === item.href && 'nav-link-active'
            )}
          >
            <Icon name={item.icon} />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
         <div className="p-3 bg-gray-50 rounded-lg text-center mb-4">
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <span className={`status-badge mt-1 ${roleInfo.color}`}>{roleInfo.label}</span>
         </div>
        <button
          onClick={logout}
          className="nav-link w-full text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  )
}