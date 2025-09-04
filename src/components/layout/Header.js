'use client'
import { Bell, Search, Settings, HelpCircle } from 'lucide-react'
import Image from 'next/image'

export default function Header({ user }) {
  return (
    <header className="flex items-center justify-between flex-shrink-0 h-16 px-6 bg-white border-b border-gray-200 shadow-sm">
      {/* Left Section - Empty for flexibility */}
      <div className="flex items-center">
        {/* You can add a page title here later */}
      </div>

      {/* Right Section - Actions & User */}
      <div className="flex items-center space-x-3">
        {/* Search Button */}
        <button className="group relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200">
          <Search className="w-5 h-5" />
        </button>

        {/* Help Button */}
        <button className="group relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Settings Button */}
        <button className="group relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200">
          <Settings className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="group relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200">
          <Bell className="w-5 h-5" />
          {/* Static Notification Badge */}
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-2">
          <div className="relative">
            <div className="w-9 h-9 relative rounded-full ring-2 ring-blue-200 ring-offset-2">
              <Image
                src={user.profileImage || "/images/avatars/default-avatar.png"}
                alt="User Avatar"
                fill
                className="object-cover rounded-full"
              />
              {/* Online Status Indicator */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
          </div>
          
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500">Online now</p>
          </div>
        </div>
      </div>
    </header>
  )
}