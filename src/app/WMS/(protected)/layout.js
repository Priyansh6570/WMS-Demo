'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import Loading from '@/components/ui/Loading'

export default function ProtectedLayout({ children }) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If auth is not loading and the user is not authenticated, redirect to login.
    if (!loading && !isAuthenticated()) {
      router.push('/WMS/login')
    }
  }, [loading, isAuthenticated, router])

  // While loading or if not authenticated, show the loading screen.
  if (loading || !isAuthenticated()) {
    return <Loading />
  }

  // Once authenticated, show the dashboard layout with the page content.
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}