"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { toast } from 'sonner'
import { Loader2, User, Mail, Phone, Building2, FileText, Edit2, Save, X, ArrowLeft, CheckCircle2, Shield } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  isBusinessAccount: boolean | null
  businessName: string | null
  gstNumber: string | null
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [editingField, setEditingField] = useState<'name' | 'phone' | 'email' | 'businessName' | 'gstNumber' | 'businessAccount' | null>(null)
  const [emailStep, setEmailStep] = useState<'idle' | 'request' | 'verify'>('idle')
  const [emailOtp, setEmailOtp] = useState('')
  const [emailToken, setEmailToken] = useState<string | null>(null)
  const [newEmail, setNewEmail] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    isBusinessAccount: false,
    businessName: '',
    gstNumber: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setFormData({
          name: data.user.name,
          phone: data.user.phone,
          isBusinessAccount: data.user.isBusinessAccount || false,
          businessName: data.user.businessName || '',
          gstNumber: data.user.gstNumber || '',
        })
      } else {
        toast.error(data.message || 'Failed to load profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBusinessCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isBusinessAccount: checked,
      businessName: checked ? prev.businessName : '',
      gstNumber: checked ? prev.gstNumber : '',
    }))
  }

  const handleGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '')
    setFormData(prev => ({ ...prev, gstNumber: value }))
  }

  const handleRequestEmailChange = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter a new email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/profile/verify-email-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newEmail: newEmail.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setEmailToken(data.token)
        setEmailStep('verify')
        toast.success('OTP sent to your new email address!')
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Error requesting email change:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyEmailChange = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    if (!emailToken || !newEmail) {
      toast.error('Email change session expired. Please start over.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/profile/verify-email-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: emailToken,
          otp: emailOtp,
          newEmail: newEmail.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Email updated successfully!')
        setEmailStep('idle')
        setNewEmail('')
        setEmailOtp('')
        setEmailToken(null)
        setEditingField(null)
        fetchProfile() // Refresh profile
      } else {
        toast.error(data.message || 'Failed to verify email change')
      }
    } catch (error) {
      console.error('Error verifying email change:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveField = async (field: 'name' | 'phone' | 'businessName' | 'gstNumber' | 'businessAccount') => {
    // Validate based on field
    if (field === 'name' && !formData.name.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (field === 'phone') {
      if (!formData.phone.trim()) {
        toast.error('Please enter your phone number')
        return
      }
      const phoneRegex = /^[0-9]{10}$/
      if (!phoneRegex.test(formData.phone)) {
        toast.error('Please enter a valid 10-digit phone number')
        return
      }
    }

    if (field === 'businessName' && !formData.businessName.trim()) {
      toast.error('Please enter your business name')
      return
    }

    if (field === 'gstNumber') {
      if (!formData.gstNumber.trim()) {
        toast.error('Please enter your GST number')
        return
      }
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
      if (!gstRegex.test(formData.gstNumber.toUpperCase())) {
        toast.error('Please enter a valid GST number (15 characters)')
        return
      }
    }

    if (field === 'businessAccount' && formData.isBusinessAccount) {
      if (!formData.businessName.trim()) {
        toast.error('Please enter your business name')
        return
      }
      if (!formData.gstNumber.trim()) {
        toast.error('Please enter your GST number')
        return
      }
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
      if (!gstRegex.test(formData.gstNumber.toUpperCase())) {
        toast.error('Please enter a valid GST number (15 characters)')
        return
      }
    }

    setSaving(true)
    try {
      const updatePayload: {
        name?: string
        phone?: string
        isBusinessAccount?: boolean
        businessName?: string
        gstNumber?: string
      } = {}
      
      if (field === 'name') updatePayload.name = formData.name.trim()
      if (field === 'phone') updatePayload.phone = formData.phone.trim()
      if (field === 'businessAccount') {
        updatePayload.isBusinessAccount = formData.isBusinessAccount
        if (formData.isBusinessAccount) {
          updatePayload.businessName = formData.businessName.trim()
          updatePayload.gstNumber = formData.gstNumber.toUpperCase().trim()
        }
      }
      if (field === 'businessName') {
        updatePayload.isBusinessAccount = formData.isBusinessAccount
        updatePayload.businessName = formData.businessName.trim()
        if (formData.gstNumber) {
          updatePayload.gstNumber = formData.gstNumber.toUpperCase().trim()
        }
      }
      if (field === 'gstNumber') {
        updatePayload.isBusinessAccount = formData.isBusinessAccount
        updatePayload.gstNumber = formData.gstNumber.toUpperCase().trim()
        if (formData.businessName) {
          updatePayload.businessName = formData.businessName.trim()
        }
      }

      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`${field === 'name' ? 'Name' : field === 'phone' ? 'Phone' : field === 'businessName' ? 'Business name' : field === 'gstNumber' ? 'GST number' : 'Business account'} updated successfully!`)
        setUser(data.user)
        setEditingField(null)
        // Update form data with server response
        setFormData({
          name: data.user.name,
          phone: data.user.phone,
          isBusinessAccount: data.user.isBusinessAccount || false,
          businessName: data.user.businessName || '',
          gstNumber: data.user.gstNumber || '',
        })
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelField = (field: 'name' | 'phone' | 'email' | 'businessName' | 'gstNumber' | 'businessAccount') => {
    if (user) {
      if (field === 'name') {
        setFormData(prev => ({ ...prev, name: user.name }))
      } else if (field === 'phone') {
        setFormData(prev => ({ ...prev, phone: user.phone }))
      } else if (field === 'businessName') {
        setFormData(prev => ({ ...prev, businessName: user.businessName || '' }))
      } else if (field === 'gstNumber') {
        setFormData(prev => ({ ...prev, gstNumber: user.gstNumber || '' }))
      } else if (field === 'businessAccount') {
        setFormData(prev => ({
          ...prev,
          isBusinessAccount: user.isBusinessAccount || false,
          businessName: user.businessName || '',
          gstNumber: user.gstNumber || '',
        }))
      } else if (field === 'email') {
        setEmailStep('idle')
        setNewEmail('')
        setEmailOtp('')
        setEmailToken(null)
      }
    }
    setEditingField(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-64 mb-6" />
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <Card className="border-0 shadow-xl max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Failed to load profile. Please try again.</p>
            <Button
              onClick={() => router.push('/')}
              className="w-full mt-4 bg-[#168e2d] hover:bg-[#137a26]"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="mb-4 md:mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6 md:h-8 md:w-8 text-[#168e2d]" />
            My Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Personal Information Card */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#168e2d]" />
                Personal Information
              </CardTitle>
              <CardDescription className="mt-2">
                Your basic account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    Full Name
                  </Label>
                  {editingField !== 'name' && (
                    <Button
                      onClick={() => setEditingField('name')}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {editingField === 'name' ? (
                  <div className="space-y-2">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={saving}
                      className="h-11"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSaveField('name')}
                        disabled={saving}
                        size="sm"
                        className="bg-[#168e2d] hover:bg-[#137a26]"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleCancelField('name')}
                        variant="outline"
                        size="sm"
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-11 px-3 flex items-center bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    Email Address
                  </Label>
                  {editingField !== 'email' && emailStep === 'idle' && (
                    <Button
                      onClick={() => {
                        setEditingField('email')
                        setEmailStep('request')
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {editingField === 'email' && emailStep === 'request' ? (
                  <div className="space-y-3">
                    <Input
                      id="newEmail"
                      type="email"
                      placeholder="Enter new email address"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={saving}
                      className="h-11"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={handleRequestEmailChange}
                        disabled={saving || !newEmail.trim()}
                        className="flex-1 bg-[#168e2d] hover:bg-[#137a26]"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          'Send OTP to New Email'
                        )}
                      </Button>
                      <Button
                        onClick={() => handleCancelField('email')}
                        variant="outline"
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : editingField === 'email' && emailStep === 'verify' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-green-800">
                        OTP sent to <strong>{newEmail}</strong>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailOtp">Enter OTP</Label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={emailOtp}
                          onChange={setEmailOtp}
                          disabled={saving}
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
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={handleVerifyEmailChange}
                        disabled={saving || emailOtp.length !== 6}
                        className="flex-1 bg-[#168e2d] hover:bg-[#137a26]"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Verify & Update Email'
                        )}
                      </Button>
                      <Button
                        onClick={() => handleCancelField('email')}
                        variant="outline"
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-11 px-3 flex items-center bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    Phone Number
                  </Label>
                  {editingField !== 'phone' && (
                    <Button
                      onClick={() => setEditingField('phone')}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {editingField === 'phone' ? (
                  <div className="space-y-2">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={saving}
                      maxLength={10}
                      className="h-11"
                    />
                    <p className="text-xs text-gray-500">Enter 10-digit phone number</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSaveField('phone')}
                        disabled={saving}
                        size="sm"
                        className="bg-[#168e2d] hover:bg-[#137a26]"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleCancelField('phone')}
                        variant="outline"
                        size="sm"
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-11 px-3 flex items-center bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-gray-900">{user.phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Business Information Card */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#168e2d]" />
                Business Information
              </CardTitle>
              <CardDescription className="mt-2">
                {user.isBusinessAccount
                  ? 'Your business account details'
                  : 'Add business information to enable business account features'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Business Account Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="business" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    Business Account
                  </Label>
                  {editingField !== 'businessAccount' && (
                    <Button
                      onClick={() => setEditingField('businessAccount')}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {editingField === 'businessAccount' ? (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="business"
                        checked={formData.isBusinessAccount}
                        onCheckedChange={handleBusinessCheckboxChange}
                        disabled={saving}
                        className="mt-1"
                      />
                      <label
                        htmlFor="business"
                        className="text-sm text-gray-700 leading-relaxed cursor-pointer flex-1"
                      >
                        Register as a business account
                      </label>
                    </div>
                    {formData.isBusinessAccount && (
                      <>
                        <Input
                          id="businessName"
                          name="businessName"
                          type="text"
                          placeholder="ABC Enterprises Pvt. Ltd."
                          value={formData.businessName}
                          onChange={handleInputChange}
                          disabled={saving}
                          className="h-11"
                        />
                        <div>
                          <Input
                            id="gstNumber"
                            name="gstNumber"
                            type="text"
                            placeholder="00AAAAA0000A0Z0"
                            value={formData.gstNumber}
                            onChange={handleGstChange}
                            disabled={saving}
                            maxLength={15}
                            className="h-11"
                          />
                          <p className="text-xs text-gray-500 mt-1">Enter 15-character GST number</p>
                        </div>
                      </>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSaveField('businessAccount')}
                        disabled={saving}
                        size="sm"
                        className="bg-[#168e2d] hover:bg-[#137a26]"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleCancelField('businessAccount')}
                        variant="outline"
                        size="sm"
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="business-display"
                      checked={user.isBusinessAccount || false}
                      disabled
                      className="mt-1"
                    />
                    <label
                      htmlFor="business-display"
                      className="text-sm text-gray-700 leading-relaxed flex-1"
                    >
                      {user.isBusinessAccount ? 'Registered as business account' : 'Not registered as business account'}
                    </label>
                  </div>
                )}
              </div>

              {/* Business Name */}
              {user.isBusinessAccount && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="businessName" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      Business Name
                    </Label>
                    {editingField !== 'businessName' && (
                      <Button
                        onClick={() => setEditingField('businessName')}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {editingField === 'businessName' ? (
                    <div className="space-y-2">
                      <Input
                        id="businessName"
                        name="businessName"
                        type="text"
                        placeholder="ABC Enterprises Pvt. Ltd."
                        value={formData.businessName}
                        onChange={handleInputChange}
                        disabled={saving}
                        className="h-11"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveField('businessName')}
                          disabled={saving}
                          size="sm"
                          className="bg-[#168e2d] hover:bg-[#137a26]"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleCancelField('businessName')}
                          variant="outline"
                          size="sm"
                          disabled={saving}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-11 px-3 flex items-center bg-gray-50 rounded-md border border-gray-200">
                      <p className="text-gray-900">{user.businessName || 'Not provided'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* GST Number */}
              {user.isBusinessAccount && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gstNumber" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      GST Number
                    </Label>
                    {editingField !== 'gstNumber' && (
                      <Button
                        onClick={() => setEditingField('gstNumber')}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {editingField === 'gstNumber' ? (
                    <div className="space-y-2">
                      <Input
                        id="gstNumber"
                        name="gstNumber"
                        type="text"
                        placeholder="00AAAAA0000A0Z0"
                        value={formData.gstNumber}
                        onChange={handleGstChange}
                        disabled={saving}
                        maxLength={15}
                        className="h-11"
                      />
                      <p className="text-xs text-gray-500">Enter 15-character GST number</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveField('gstNumber')}
                          disabled={saving}
                          size="sm"
                          className="bg-[#168e2d] hover:bg-[#137a26]"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleCancelField('gstNumber')}
                          variant="outline"
                          size="sm"
                          disabled={saving}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-11 px-3 flex items-center bg-gray-50 rounded-md border border-gray-200">
                      <p className="text-gray-900">{user.gstNumber || 'Not provided'}</p>
                    </div>
                  )}
                </div>
              )}

              {!user.isBusinessAccount && editingField !== 'businessAccount' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Enable business account to add business name and GST number.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information Card */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Account Information</CardTitle>
              <CardDescription className="mt-2">
                Account creation and update details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b">
                <span className="text-sm font-medium text-gray-500">Member Since</span>
                <span className="text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b">
                <span className="text-sm font-medium text-gray-500">Last Updated</span>
                <span className="text-sm text-gray-900">
                  {new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2">
                <span className="text-sm font-medium text-gray-500">User ID</span>
                <span className="text-sm text-gray-900 font-mono">{user.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

