'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Building2, Smartphone, KeyRound } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Form/Input'
import { useAuth } from '@/context/AuthContext'
import { validateMobile, validateOTP } from '@/lib/utils'

export default function LoginPage() {
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1) // 1: mobile, 2: otp
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pre-fill mobile if provided in URL params
  useEffect(() => {
    const mobileParam = searchParams.get('mobile')
    if (mobileParam) {
      setMobile(mobileParam)
    }
  }, [searchParams])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/WMS/dashboard')
    }
  }, [isAuthenticated, router])

  const handleMobileSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateMobile(mobile)) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    
    // In demo, we'll show OTP step immediately
    setStep(2)
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (!validateOTP(otp)) {
      setError('Please enter a valid 6-digit OTP')
      setLoading(false)
      return
    }
    
    const result = await login(mobile, otp)
    
    if (result.success) {
      router.push('/WMS/dashboard')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep(1)
    setOtp('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-lg">
              <Building2 className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">WMS Portal</h1>
          <p className="text-gray-600 mt-1">Directorate of Archaeology, MP</p>
        </div>

        {/* Login Form */}
        <div className="card p-6">
          {step === 1 ? (
            <>
              <div className="text-center mb-6">
                <Smartphone className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Enter Mobile Number</h2>
                <p className="text-gray-600 text-sm mt-1">We'll send you an OTP to verify your identity</p>
              </div>

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
                
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!mobile}
                >
                  Send OTP
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <KeyRound className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Enter OTP</h2>
                <p className="text-gray-600 text-sm mt-1">
                  OTP sent to +91 {mobile}
                </p>
              </div>

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
                
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Demo Info */}
                <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                  <strong>Demo Mode:</strong> Use OTP: <strong>123456</strong> for all users
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    loading={loading}
                    disabled={!otp}
                  >
                    Verify & Login
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Demo Users Info */}
        <div className="mt-6 card p-4">
          <h3 className="font-medium text-gray-900 mb-3">Demo Users</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Super Admin:</span>
              <span className="text-primary-600 font-medium">9876543210</span>
            </div>
            <div className="flex justify-between">
              <span>Admin:</span>
              <span className="text-primary-600 font-medium">9876543211</span>
            </div>
            <div className="flex justify-between">
              <span>Contractor:</span>
              <span className="text-primary-600 font-medium">9876543212</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>&copy; 2025 Directorate of Archaeology, MP</p>
        </div>
      </div>
    </div>
  )
}