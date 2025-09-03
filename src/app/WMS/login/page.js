'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Building2, Smartphone, KeyRound } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Form/Input'
import { useAuth } from '@/context/AuthContext'
import { validateMobile, validateOTP } from '@/lib/utils'
import Loading from '@/components/ui/Loading' // <-- Import the Loading component

export default function LoginPage() {
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1)
  const [formLoading, setFormLoading] = useState(false) // Renamed to avoid conflicts
  const [error, setError] = useState('')
  
  // *** KEY CHANGE 1: Destructure 'loading' from useAuth as 'authLoading' ***
  const { login, isAuthenticated, loading: authLoading } = useAuth() 
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const mobileParam = searchParams.get('mobile')
    if (mobileParam) {
      setMobile(mobileParam)
    }
  }, [searchParams])

  // *** KEY CHANGE 2: The redirect logic is now simpler and more robust ***
  useEffect(() => {
    // Only attempt to redirect if auth is no longer loading AND the user is authenticated.
    if (!authLoading && isAuthenticated()) {
      router.push('/WMS/dashboard')
    }
  }, [authLoading, isAuthenticated, router])

  const handleMobileSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!validateMobile(mobile)) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    setStep(2)
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFormLoading(true)
    if (!validateOTP(otp)) {
      setError('Please enter a valid 6-digit OTP')
      setFormLoading(false)
      return
    }
    const result = await login(mobile, otp)
    // The useEffect hook above will now handle the successful redirect
    // We only need to handle the error case here
    if (!result.success) {
      setError(result.error)
      setFormLoading(false)
    }
  }
  
  const handleBack = () => {
    setStep(1)
    setOtp('')
    setError('')
  }
  
  // *** KEY CHANGE 3: The component now decides whether to show the loader or the form ***
  // If the global auth state is still loading, or if we know the user is authenticated 
  // and are just waiting for the redirect, show the main page loader.
  if (authLoading || isAuthenticated()) {
    return <Loading />;
  }

  // Otherwise, render the full login page.
  return (
    <div className="flex items-center justify-center min-h-screen p-4 text-gray-700 bg-gradient-to-br from-primary-50 to-blue-100">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white rounded-full shadow-lg">
              <Building2 className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">WMS Portal</h1>
          <p className="mt-1 text-gray-600">Directorate of Archaeology, MP</p>
        </div>

        <div className="p-6 card">
          {step === 1 ? (
            <form onSubmit={handleMobileSubmit} className="space-y-4">
              <Input
                label="Mobile Number"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                maxLength={10}
              />
              {error && <p className="form-error">{error}</p>}
              <Button type="submit" className="w-full" disabled={!mobile}>
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <Input
                label="6-digit OTP"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
              />
              {error && <p className="form-error">{error}</p>}
              <div className="p-3 text-sm text-blue-600 rounded-md bg-blue-50">
                <strong>Demo Mode:</strong> Use OTP: <strong>123456</strong>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1" loading={formLoading} disabled={!otp}>
                  Verify & Login
                </Button>
              </div>
            </form>
          )}
          {/* Demo Users Info */}
        <div className="p-4 mt-6 card">
          <h3 className="mb-3 font-medium text-gray-900">Demo Users</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className='text-gray-700'>Super Admin:</span>
              <span className="font-medium text-primary-600">9876543210</span>
            </div>
            <div className="flex justify-between">
              <span className='text-gray-700'>Admin:</span>
              <span className="font-medium text-primary-600">9876543211</span>
            </div>
            <div className="flex justify-between">
              <span className='text-gray-700'>Contractor:</span>
              <span className="font-medium text-primary-600">9876543212</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}