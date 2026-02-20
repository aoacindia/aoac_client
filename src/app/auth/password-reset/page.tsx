"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react'

export default function PasswordResetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [otp, setOtp] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const resetToken = sessionStorage.getItem('resetToken')
      const resetEmail = sessionStorage.getItem('resetEmail')
      const resetOtp = sessionStorage.getItem('resetOtp')
      
      if (!resetToken || !resetEmail || !resetOtp) {
        toast.error('Invalid reset session. Please start again.')
        router.push('/auth/forgot-password')
        return
      }
      
      setToken(resetToken)
      setEmail(resetEmail)
      setOtp(resetOtp) // Pre-fill verified OTP
    }
  }, [router])

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error('Please enter both password fields')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!token || !otp) {
      toast.error('Invalid reset session. Please start again.')
      router.push('/auth/forgot-password')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          otp,
          newPassword: password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Password reset successful! Redirecting to login...')
        // Clear session storage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('resetToken')
          sessionStorage.removeItem('resetEmail')
          sessionStorage.removeItem('resetOtp')
        }
        setTimeout(() => {
          router.push('/auth/login')
        }, 1500)
      } else {
        toast.error(data.message || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center text-sm text-gray-600 hover:text-[#168e2d] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#168e2d]/10 text-[#168e2d] mb-4 mx-auto">
              <KeyRound className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
              Reset Password
            </CardTitle>
            <CardDescription className="text-base">
              Enter your new password and verify with OTP
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {email && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Resetting password for: <strong>{email}</strong>
                </p>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                OTP verified. You can now set your new password.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleResetPassword()
                    }
                  }}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={handleResetPassword}
              disabled={loading || !password || !confirmPassword}
              className="w-full h-11 bg-[#168e2d] hover:bg-[#137a26] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Remember your password?</span>
              </div>
            </div>

            <Button
              onClick={() => router.push('/auth/login')}
              variant="outline"
              className="w-full h-11"
              disabled={loading}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

