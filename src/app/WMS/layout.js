'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import Loading from '@/components/ui/Loading'

function WmsLayoutContent({ children }) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push('/WMS/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading || !isAuthenticated()) {
    return <Loading />
  }

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

export default function WMSLayout({ children }) {
  return (
    <AuthProvider>
      <WmsLayoutContent>{children}</WmsLayoutContent>
    </AuthProvider>
  )
}