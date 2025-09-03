'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { dataManager } from '@/lib/data-manager'
import { DEMO_OTP } from '@/lib/constants'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On initial load, check if a user session exists in local storage
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      try {
        setUser(JSON.parse(currentUser))
      } catch (error) {
        // If stored data is corrupt, clear it
        localStorage.removeItem('currentUser')
      }
    }
    setLoading(false)
  }, [])

  const login = async (mobile, otp) => {
    try {
      // 1. Fetch the up-to-date user list from the API backend
      const users = await dataManager.getUsers();
      
      // 2. Find the user in the fetched data
      const foundUser = users.find(u => u.mobile === mobile && u.isActive)
      
      if (!foundUser) {
        throw new Error('User not found or inactive')
      }
      
      // 3. Verify the demo OTP
      if (otp !== DEMO_OTP) {
        throw new Error('Invalid OTP')
      }
      
      // 4. Update the user's last login time via the API
      // This makes the change persistent in your users.json file
      const updatedUser = await dataManager.updateUser(foundUser.id, {
        lastLogin: new Date().toISOString()
      });
      
      // 5. Store the complete, updated user object in localStorage and state
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      return { success: true, user: updatedUser }
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error.message }
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem('currentUser')
    setUser(null)
  }, []);

  const isAuthenticated = useCallback(() => {
    // This robust check ensures authentication status is always correct
    if (user) return true;
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('currentUser');
    }
    return false;
  }, [user]);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
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