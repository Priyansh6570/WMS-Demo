'use client'

import { Bell, Search } from 'lucide-react'

export default function Header({ user }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center">
        {/* You can add a page title here later */}
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-gray-900">
          <Search className="h-5 w-5" />
        </button>
        <button className="text-gray-500 hover:text-gray-900 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </button>
        <div className="flex items-center space-x-2">
           <img src={user.profileImage} alt="User Avatar" className="h-8 w-8 rounded-full" />
          <div>
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
          </div>
        </div>
      </div>
    </header>
  )
}