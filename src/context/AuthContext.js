'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { dataManager } from '@/lib/data-manager'
import { DEMO_OTP } from '@/lib/constants'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      try {
        setUser(JSON.parse(currentUser))
      } catch (error) {
        localStorage.removeItem('currentUser')
      }
    }
    setLoading(false)
  }, [])

  const login = async (mobile, otp) => {
    try {
      // Find user by mobile number
      const users = dataManager.getAll('users')
      const foundUser = users.find(u => u.mobile === mobile && u.isActive)
      
      if (!foundUser) {
        throw new Error('User not found or inactive')
      }
      
      // Verify OTP (in demo, we use DEMO_OTP for all users)
      if (otp !== DEMO_OTP) {
        throw new Error('Invalid OTP')
      }
      
      // Update user's last login
      dataManager.update('users', foundUser.id, {
        lastLogin: new Date().toISOString()
      })
      
      // Store user in localStorage and state
      localStorage.setItem('currentUser', JSON.stringify(foundUser))
      setUser(foundUser)
      
      return { success: true, user: foundUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('currentUser')
    setUser(null)
  }

  const isAuthenticated = () => {
    return !!user
  }

  const hasRole = (role) => {
    return user?.role === role
  }

  const hasPermission = (permission) => {
    if (!user) return false
    if (user.role === 'super_admin') return true
    
    const rolePermissions = {
      admin: ['project_management', 'user_management', 'final_approval'],
      quality_manager: ['milestone_review', 'quality_assessment'], 
      financial_officer: ['payment_processing', 'bill_verification'],
      contractor: ['project_execution', 'team_management'],
      worker: ['documentation', 'progress_update']
    }
    
    return rolePermissions[user.role]?.includes(permission) || false
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    hasRole,
    hasPermission,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}