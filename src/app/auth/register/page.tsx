"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Mail, ArrowLeft, Shield, CheckCircle2 } from 'lucide-react'
import { indianStates } from '@/lib/state-codes'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    agreedToTerms: false,
    isBusinessAccount: false,
    businessName: '',
    gstNumber: '',
    hasAdditionalTradeName: false,
    additionalTradeName: '',
    // Billing Address fields
    billingHouseNo: '',
    billingLine1: '',
    billingLine2: '',
    billingCity: '',
    billingDistrict: '',
    billingState: '',
    billingStateCode: '',
    billingPincode: '',
  })
  const [otp, setOtp] = useState('')
  const [otpToken, setOtpToken] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, agreedToTerms: checked }))
  }

  const handleBusinessCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      isBusinessAccount: checked,
      // Clear business fields if unchecked
      businessName: checked ? prev.businessName : '',
      gstNumber: checked ? prev.gstNumber : '',
      hasAdditionalTradeName: checked ? prev.hasAdditionalTradeName : false,
      additionalTradeName: checked ? prev.additionalTradeName : '',
      // Clear billing address if unchecked
      billingHouseNo: checked ? prev.billingHouseNo : '',
      billingLine1: checked ? prev.billingLine1 : '',
      billingLine2: checked ? prev.billingLine2 : '',
      billingCity: checked ? prev.billingCity : '',
      billingDistrict: checked ? prev.billingDistrict : '',
      billingState: checked ? prev.billingState : '',
      billingStateCode: checked ? prev.billingStateCode : '',
      billingPincode: checked ? prev.billingPincode : '',
    }))
  }

  const handleAdditionalTradeNameChange = (checked: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      hasAdditionalTradeName: checked,
      additionalTradeName: checked ? prev.additionalTradeName : '',
    }))
  }

  const handleStateSelectChange = (value: string) => {
    const selectedState = indianStates.find((state) => state.name === value);
    setFormData(prev => ({
      ...prev,
      billingState: value,
      billingStateCode: selectedState ? selectedState.code : '',
    }));
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your name')
      return false
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return false
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number')
      return false
    }
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number')
      return false
    }
    if (!formData.agreedToTerms) {
      toast.error('Please agree to the Terms & Conditions')
      return false
    }
    // Validate business fields if business account is selected
    if (formData.isBusinessAccount) {
      if (!formData.businessName.trim()) {
        toast.error('Please enter your business name')
        return false
      }
      if (!formData.gstNumber.trim()) {
        toast.error('Please enter your GST number')
        return false
      }
      // Basic GST number validation (15 characters, alphanumeric)
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
      if (!gstRegex.test(formData.gstNumber.toUpperCase())) {
        toast.error('Please enter a valid GST number (15 characters, format: 00AAAAA0000A0Z0)')
        return false
      }
      // Validate additional trade name if checked
      if (formData.hasAdditionalTradeName && !formData.additionalTradeName.trim()) {
        toast.error('Please enter your additional trade name')
        return false
      }
      // Validate billing address fields
      if (!formData.billingHouseNo.trim()) {
        toast.error('Please enter billing address house number')
        return false
      }
      if (!formData.billingLine1.trim()) {
        toast.error('Please enter billing address line 1')
        return false
      }
      if (!formData.billingCity.trim()) {
        toast.error('Please enter billing city')
        return false
      }
      if (!formData.billingDistrict.trim()) {
        toast.error('Please enter billing district')
        return false
      }
      if (!formData.billingState.trim()) {
        toast.error('Please select billing state')
        return false
      }
      if (!formData.billingPincode.trim()) {
        toast.error('Please enter billing pincode')
        return false
      }
      const pincodeRegex = /^[0-9]{6}$/
      if (!pincodeRegex.test(formData.billingPincode)) {
        toast.error('Please enter a valid 6-digit pincode')
        return false
      }
    }
    return true
  }

  const handleSendOTP = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          purpose: 'registration',
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

      // Then register the user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          token: otpToken,
          isBusinessAccount: formData.isBusinessAccount,
          businessName: formData.isBusinessAccount ? formData.businessName : undefined,
          gstNumber: formData.isBusinessAccount ? formData.gstNumber.toUpperCase() : undefined,
          hasAdditionalTradeName: formData.isBusinessAccount ? formData.hasAdditionalTradeName : undefined,
          additionalTradeName: formData.isBusinessAccount && formData.hasAdditionalTradeName ? formData.additionalTradeName : undefined,
          billingAddress: formData.isBusinessAccount ? {
            houseNo: formData.billingHouseNo,
            line1: formData.billingLine1,
            line2: formData.billingLine2 || undefined,
            city: formData.billingCity,
            district: formData.billingDistrict,
            state: formData.billingState,
            stateCode: formData.billingStateCode,
            pincode: formData.billingPincode,
          } : undefined,
        }),
      })

      const registerData = await registerResponse.json()

      if (registerData.success) {
        toast.success('Registration successful! Redirecting to login...')
        setTimeout(() => {
          router.push('/auth/login')
        }, 1500)
      } else {
        toast.error(registerData.message || 'Registration failed')
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
          email: formData.email,
          purpose: 'registration',
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
              <Shield className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
              Create Account
            </CardTitle>
            <CardDescription className="text-base">
              {step === 'details' 
                ? 'Enter your details to get started'
                : 'Enter the OTP sent to your email'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 'details' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">Enter 10-digit phone number</p>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="business"
                    checked={formData.isBusinessAccount}
                    onCheckedChange={handleBusinessCheckboxChange}
                    disabled={loading}
                    className="mt-1"
                  />
                  <label
                    htmlFor="business"
                    className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                  >
                    Are you registering as a business?
                  </label>
                </div>

                {formData.isBusinessAccount && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        type="text"
                        placeholder="ABC Enterprises Pvt. Ltd."
                        value={formData.businessName}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        name="gstNumber"
                        type="text"
                        placeholder="00AAAAA0000A0Z0"
                        value={formData.gstNumber}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '')
                          setFormData(prev => ({ ...prev, gstNumber: value }))
                        }}
                        disabled={loading}
                        maxLength={15}
                        className="h-11"
                      />
                      <p className="text-xs text-gray-500">Enter 15-character GST number</p>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="additionalTradeName"
                        checked={formData.hasAdditionalTradeName}
                        onCheckedChange={handleAdditionalTradeNameChange}
                        disabled={loading}
                        className="mt-1"
                      />
                      <label
                        htmlFor="additionalTradeName"
                        className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                      >
                        Do you have an additional trade name?
                      </label>
                    </div>

                    {formData.hasAdditionalTradeName && (
                      <div className="space-y-2">
                        <Label htmlFor="additionalTradeName">Additional Trade Name</Label>
                        <Input
                          id="additionalTradeName"
                          name="additionalTradeName"
                          type="text"
                          placeholder="Enter additional trade name"
                          value={formData.additionalTradeName}
                          onChange={handleInputChange}
                          disabled={loading}
                          className="h-11"
                        />
                      </div>
                    )}

                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Billing Address</h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingHouseNo">House/Building No.</Label>
                          <Input
                            id="billingHouseNo"
                            name="billingHouseNo"
                            type="text"
                            placeholder="123"
                            value={formData.billingHouseNo}
                            onChange={handleInputChange}
                            disabled={loading}
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="billingLine1">Address Line 1</Label>
                          <Input
                            id="billingLine1"
                            name="billingLine1"
                            type="text"
                            placeholder="Street, Area"
                            value={formData.billingLine1}
                            onChange={handleInputChange}
                            disabled={loading}
                            className="h-11"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="billingLine2">Address Line 2 (Optional)</Label>
                          <Input
                            id="billingLine2"
                            name="billingLine2"
                            type="text"
                            placeholder="Landmark, etc."
                            value={formData.billingLine2}
                            onChange={handleInputChange}
                            disabled={loading}
                            className="h-11"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="billingCity">City</Label>
                            <Input
                              id="billingCity"
                              name="billingCity"
                              type="text"
                              placeholder="City"
                              value={formData.billingCity}
                              onChange={handleInputChange}
                              disabled={loading}
                              className="h-11"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="billingDistrict">District</Label>
                            <Input
                              id="billingDistrict"
                              name="billingDistrict"
                              type="text"
                              placeholder="District"
                              value={formData.billingDistrict}
                              onChange={handleInputChange}
                              disabled={loading}
                              className="h-11"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="billingState">State</Label>
                            <Select
                              value={formData.billingState}
                              onValueChange={handleStateSelectChange}
                              disabled={loading}
                            >
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                {indianStates.map((state) => (
                                  <SelectItem key={state.code} value={state.name}>
                                    {state.name} ({state.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="billingPincode">Pincode</Label>
                            <Input
                              id="billingPincode"
                              name="billingPincode"
                              type="text"
                              placeholder="123456"
                              value={formData.billingPincode}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                                setFormData(prev => ({ ...prev, billingPincode: value }))
                              }}
                              disabled={loading}
                              maxLength={6}
                              className="h-11"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreedToTerms}
                    onCheckedChange={handleCheckboxChange}
                    disabled={loading}
                    className="mt-1"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                  >
                    I agree with Terms & Conditions of this Company
                  </label>
                </div>

                <Button
                  onClick={handleSendOTP}
                  disabled={loading}
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
                      OTP sent to <strong>{formData.email}</strong>
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
                      'Verify & Register'
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
                    setStep('details')
                    setOtp('')
                    setEmailSent(false)
                  }}
                  variant="ghost"
                  className="w-full"
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Details
                </Button>
              </>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Already have an account?</span>
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

