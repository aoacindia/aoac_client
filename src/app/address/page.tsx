"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { indianStates } from "@/lib/state-codes"
import { ArrowLeft, Loader2, MapPin, Edit2, Save, X, Plus } from "lucide-react"

interface Address {
  id: string
  type: string
  name: string
  phone: string
  houseNo: string
  line1: string
  line2?: string | null
  city: string
  district: string
  state: string
  stateCode?: string | null
  pincode: string
  isDefault: boolean
}

interface AddressFormData {
  type: string
  name: string
  phone: string
  houseNo: string
  line1: string
  line2: string
  city: string
  district: string
  state: string
  stateCode: string
  pincode: string
  isDefault: boolean
}

const emptyAddress: AddressFormData = {
  type: "Home",
  name: "",
  phone: "",
  houseNo: "",
  line1: "",
  line2: "",
  city: "",
  district: "",
  state: "",
  stateCode: "",
  pincode: "",
  isDefault: false,
}

function validateAddress(formData: AddressFormData) {
  if (
    !formData.name ||
    !formData.phone ||
    !formData.houseNo ||
    !formData.line1 ||
    !formData.city ||
    !formData.district ||
    !formData.state ||
    !formData.pincode
  ) {
    return "Please fill all required fields"
  }

  const pincodeRegex = /^[0-9]{6}$/
  if (!pincodeRegex.test(formData.pincode)) {
    return "Please enter a valid 6-digit pincode"
  }

  return null
}

export default function AddressPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [newAddress, setNewAddress] = useState<AddressFormData>(emptyAddress)
  const [editAddress, setEditAddress] = useState<AddressFormData>(emptyAddress)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/address")
      if (response.status === 401) {
        router.push("/auth/login")
        return
      }
      const data = await response.json()
      if (data.success) {
        setAddresses(data.addresses)
      } else {
        toast.error(data.message || "Failed to load addresses")
      }
    } catch (error) {
      console.error("Error fetching addresses:", error)
      toast.error("Failed to load addresses")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const handleStateSelect = (stateName: string, setForm: (value: AddressFormData) => void, form: AddressFormData) => {
    const selectedState = indianStates.find((state) => state.name === stateName)
    setForm({
      ...form,
      state: stateName,
      stateCode: selectedState ? selectedState.code : "",
    })
  }

  const handleStartEdit = (address: Address) => {
    setEditingAddressId(address.id)
    setEditAddress({
      type: address.type || "Home",
      name: address.name,
      phone: address.phone,
      houseNo: address.houseNo,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      district: address.district,
      state: address.state,
      stateCode: address.stateCode || "",
      pincode: address.pincode,
      isDefault: address.isDefault,
    })
  }

  const handleCancelEdit = () => {
    setEditingAddressId(null)
    setEditAddress(emptyAddress)
  }

  const handleSaveNewAddress = async () => {
    const validationError = validateAddress(newAddress)
    if (validationError) {
      toast.error(validationError)
      return
    }

    try {
      setSaving(true)
      const response = await fetch("/api/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAddress),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Address saved successfully")
        await fetchAddresses()
        setNewAddress(emptyAddress)
        setIsAddDialogOpen(false)
      } else {
        toast.error(data.message || "Failed to save address")
      }
    } catch (error) {
      console.error("Error saving address:", error)
      toast.error("Failed to save address")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateAddress = async () => {
    if (!editingAddressId) return

    const validationError = validateAddress(editAddress)
    if (validationError) {
      toast.error(validationError)
      return
    }

    try {
      setSaving(true)
      const response = await fetch("/api/address", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingAddressId,
          ...editAddress,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Address updated successfully")
        await fetchAddresses()
        handleCancelEdit()
      } else {
        toast.error(data.message || "Failed to update address")
      }
    } catch (error) {
      console.error("Error updating address:", error)
      toast.error("Failed to update address")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-12 w-64 mb-6" />
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Button onClick={() => router.push("/")} variant="ghost" className="mb-4 md:mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-6 w-6 md:h-8 md:w-8 text-[#168e2d]" />
            My Addresses
          </h1>
          <p className="text-gray-600 mt-2">
            Add new delivery addresses or update your existing ones
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#168e2d]" />
                    Saved Addresses
                  </CardTitle>
                  <CardDescription className="mt-2">Manage your delivery locations</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#168e2d] hover:bg-[#137a26]">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type">Address Type</Label>
                          <Select
                            value={newAddress.type}
                            onValueChange={(value) => setNewAddress({ ...newAddress, type: value })}
                          >
                            <SelectTrigger id="type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Home">Home</SelectItem>
                              <SelectItem value="Work">Work</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={newAddress.name}
                            onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={newAddress.phone}
                            maxLength={10}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="houseNo">House/Flat No *</Label>
                          <Input
                            id="houseNo"
                            value={newAddress.houseNo}
                            onChange={(e) => setNewAddress({ ...newAddress, houseNo: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="line1">Address Line 1 *</Label>
                          <Input
                            id="line1"
                            value={newAddress.line1}
                            onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="line2">Address Line 2</Label>
                          <Input
                            id="line2"
                            value={newAddress.line2}
                            onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="district">District *</Label>
                          <Input
                            id="district"
                            value={newAddress.district}
                            onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Select
                            value={newAddress.state}
                            onValueChange={(value) => handleStateSelect(value, setNewAddress, newAddress)}
                          >
                            <SelectTrigger id="state">
                              <SelectValue placeholder="Select a state" />
                            </SelectTrigger>
                            <SelectContent>
                              {indianStates.map((state) => (
                                <SelectItem key={state.code} value={state.name}>
                                  {state.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="pincode">Pincode *</Label>
                          <Input
                            id="pincode"
                            value={newAddress.pincode}
                            maxLength={6}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                pincode: e.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={newAddress.isDefault}
                          onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="isDefault" className="cursor-pointer">
                          Set as default address
                        </Label>
                      </div>
                      <Button onClick={handleSaveNewAddress} disabled={saving} className="bg-[#168e2d] hover:bg-[#137a26]">
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Address"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-600 mb-4">No addresses found. Add your first address below.</p>
                </div>
              ) : (
                addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-4 md:p-5 bg-white">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">{address.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{address.type}</span>
                          {address.isDefault && (
                            <span className="text-xs bg-[#168e2d] text-white px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{address.phone}</p>
                        <p className="text-sm text-gray-700">
                          {address.houseNo}, {address.line1}
                        </p>
                        {address.line2 && <p className="text-sm text-gray-700">{address.line2}</p>}
                        <p className="text-sm text-gray-700">
                          {address.city}, {address.district}, {address.state} - {address.pincode}
                        </p>
                      </div>
                      {editingAddressId !== address.id && (
                        <Button
                          onClick={() => handleStartEdit(address)}
                          variant="outline"
                          size="sm"
                          className="self-start"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>

                    {editingAddressId === address.id && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`edit-type-${address.id}`}>Address Type</Label>
                              <Select
                                value={editAddress.type}
                                onValueChange={(value) =>
                                  setEditAddress({ ...editAddress, type: value })
                                }
                              >
                                <SelectTrigger id={`edit-type-${address.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Home">Home</SelectItem>
                                  <SelectItem value="Work">Work</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor={`edit-name-${address.id}`}>Full Name *</Label>
                              <Input
                                id={`edit-name-${address.id}`}
                                value={editAddress.name}
                                onChange={(e) => setEditAddress({ ...editAddress, name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit-phone-${address.id}`}>Phone Number *</Label>
                              <Input
                                id={`edit-phone-${address.id}`}
                                value={editAddress.phone}
                                maxLength={10}
                                onChange={(e) =>
                                  setEditAddress({
                                    ...editAddress,
                                    phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit-houseNo-${address.id}`}>House/Flat No *</Label>
                              <Input
                                id={`edit-houseNo-${address.id}`}
                                value={editAddress.houseNo}
                                onChange={(e) => setEditAddress({ ...editAddress, houseNo: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit-line1-${address.id}`}>Address Line 1 *</Label>
                              <Input
                                id={`edit-line1-${address.id}`}
                                value={editAddress.line1}
                                onChange={(e) => setEditAddress({ ...editAddress, line1: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit-line2-${address.id}`}>Address Line 2</Label>
                              <Input
                                id={`edit-line2-${address.id}`}
                                value={editAddress.line2}
                                onChange={(e) => setEditAddress({ ...editAddress, line2: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit-city-${address.id}`}>City *</Label>
                              <Input
                                id={`edit-city-${address.id}`}
                                value={editAddress.city}
                                onChange={(e) => setEditAddress({ ...editAddress, city: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit-district-${address.id}`}>District *</Label>
                              <Input
                                id={`edit-district-${address.id}`}
                                value={editAddress.district}
                                onChange={(e) => setEditAddress({ ...editAddress, district: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit-state-${address.id}`}>State *</Label>
                              <Select
                                value={editAddress.state}
                                onValueChange={(value) => handleStateSelect(value, setEditAddress, editAddress)}
                              >
                                <SelectTrigger id={`edit-state-${address.id}`}>
                                  <SelectValue placeholder="Select a state" />
                                </SelectTrigger>
                                <SelectContent>
                                  {indianStates.map((state) => (
                                    <SelectItem key={state.code} value={state.name}>
                                      {state.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor={`edit-pincode-${address.id}`}>Pincode *</Label>
                              <Input
                                id={`edit-pincode-${address.id}`}
                                value={editAddress.pincode}
                                maxLength={6}
                                onChange={(e) =>
                                  setEditAddress({
                                    ...editAddress,
                                    pincode: e.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`edit-isDefault-${address.id}`}
                              checked={editAddress.isDefault}
                              onChange={(e) =>
                                setEditAddress({ ...editAddress, isDefault: e.target.checked })
                              }
                              className="rounded"
                            />
                            <Label htmlFor={`edit-isDefault-${address.id}`} className="cursor-pointer">
                              Set as default address
                            </Label>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              onClick={handleUpdateAddress}
                              disabled={saving}
                              className="bg-[#168e2d] hover:bg-[#137a26]"
                            >
                              {saving ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                            <Button onClick={handleCancelEdit} variant="outline" disabled={saving}>
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

