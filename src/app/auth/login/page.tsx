"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { toast } from 'sonner'
import { Loader2, Mail, ArrowLeft, LogIn, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpToken, setOtpToken] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const handleSendOTP = async () => {
    if (!emailOrPhone.trim()) {
      toast.error('Please enter your email or phone number')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailOrPhone, // API will handle both email and phone
          purpose: 'login',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOtpToken(data.token)
        setEmailSent(true)
        setStep('otp')
        toast.success('OTP sent to your email!')
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }
    if (!otpToken) {
      toast.error('OTP token missing. Please request a new OTP.')
      return
    }

    setLoading(true)
    try {
      // First verify OTP
      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: otpToken,
          otp,
        }),
      })

      const verifyData = await verifyResponse.json()

      if (!verifyData.success) {
        toast.error(verifyData.message || 'Invalid OTP')
        return
      }

      // Then login the user
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrPhone,
          token: otpToken,
        }),
      })

      const loginData = await loginResponse.json()

      if (loginData.success) {
        toast.success('Login successful! Redirecting...')
        // Reload the page to trigger middleware and update session
        setTimeout(() => {
          window.location.href = '/'
        }, 500)
      } else {
        toast.error(loginData.message || 'Login failed')
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailOrPhone,
          purpose: 'login',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOtpToken(data.token)
        setOtp('')
        toast.success('New OTP sent to your email!')
      } else {
        toast.error(data.message || 'Failed to resend OTP')
      }
    } catch (error) {
      console.error('Error resending OTP:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-[#168e2d] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#168e2d]/10 text-[#168e2d] mb-4 mx-auto">
              <LogIn className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
              Sign In
            </CardTitle>
            <CardDescription className="text-base">
              {step === 'email' 
                ? 'Enter your email or phone number to continue'
                : 'Enter the OTP sent to your email'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 'email' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="emailOrPhone">Email or Phone Number</Label>
                  <Input
                    id="emailOrPhone"
                    type="text"
                    placeholder="john@example.com or 9876543210"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendOTP()
                      }
                    }}
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">
                    OTP will be sent to your registered email address
                  </p>
                </div>

                <Button
                  onClick={handleSendOTP}
                  disabled={loading || !emailOrPhone.trim()}
                  className="w-full h-11 bg-[#168e2d] hover:bg-[#137a26] text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send OTP
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                {emailSent && (
                  <div className="flex items-center justify-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-800">
                      OTP sent to your registered email
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      disabled={loading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-center text-gray-500">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="flex-1 h-11 bg-[#168e2d] hover:bg-[#137a26] text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </Button>
                  <Button
                    onClick={handleResendOTP}
                    disabled={loading}
                    variant="outline"
                    className="h-11"
                  >
                    Resend OTP
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    setStep('email')
                    setOtp('')
                    setEmailSent(false)
                  }}
                  variant="ghost"
                  className="w-full"
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">New to AOAC?</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push('/auth/register')}
                variant="outline"
                className="flex-1 h-11"
                disabled={loading}
              >
                Create Account
              </Button>
              <Button
                onClick={() => router.push('/auth/forgot-password')}
                variant="ghost"
                className="h-11"
                disabled={loading}
              >
                Forgot Password?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

