"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Package,
  CreditCard,
  Percent,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { indianStates } from "@/lib/state-codes";
import PaymentHandler from "@/components/payments/PaymentHandler";

interface Address {
  id: string;
  type: string;
  name: string;
  phone: string;
  houseNo: string;
  line1: string;
  line2?: string | null;
  city: string;
  district: string;
  state: string;
  stateCode?: string | null;
  pincode: string;
  isDefault: boolean;
}

interface CartItem {
  productId: string;
  quantity: number;
  originalPrice: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  mainImage: string;
  price: number;
  weight: number;
}

interface CheckoutData {
  items: CartItem[];
  totalRegularPrice: number;
  totalSavings: number;
  totalDiscountedPrice: number;
  totalWeight: number;
}

interface ShippingDetails {
  courier_name: string;
  freight_charge: number;
  estimated_delivery_days?: number | string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null);
  const [totalWeightWithPackaging, setTotalWeightWithPackaging] = useState<number>(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New address form state
  const [newAddress, setNewAddress] = useState({
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
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Fetch addresses
  useEffect(() => {
    async function fetchAddresses() {
      try {
        setLoadingAddresses(true);
        const response = await fetch("/api/address");
        if (response.status === 401) {
          router.push("/auth/login");
          return;
        }
        if (!response.ok) throw new Error("Failed to fetch addresses");
        const data = await response.json();
        if (data.success) {
          setAddresses(data.addresses);
          // Select default address if available
          const defaultAddress = data.addresses.find((a: Address) => a.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else if (data.addresses.length > 0) {
            setSelectedAddressId(data.addresses[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        toast.error("Failed to load addresses");
      } finally {
        setLoadingAddresses(false);
      }
    }
    fetchAddresses();
  }, [router]);

  // Fetch checkout data and products
  useEffect(() => {
    async function fetchCheckoutData() {
      try {
        setLoading(true);
        // Get checkout data from sessionStorage
        const storedData = sessionStorage.getItem("checkoutData");
        if (!storedData) {
          toast.error("No items in cart. Redirecting to cart page...");
          router.push("/cart");
          return;
        }

        const data: CheckoutData = JSON.parse(storedData);
        setCheckoutData(data);
        console.log("[CHECKOUT] checkoutData:", data);

        // Fetch product details for all items
        const productPromises = data.items.map((item) =>
          fetch(`/api/products/get-products/${item.productId}`).then((res) => {
            if (!res.ok) throw new Error("Failed to fetch product");
            return res.json();
          })
        );

        const productData = await Promise.all(productPromises);
        const productsMap: Record<string, Product> = {};
        productData.forEach((product) => {
          productsMap[product.id] = product;
        });
        setProducts(productsMap);
      } catch (error) {
        console.error("Error fetching checkout data:", error);
        toast.error("Failed to load checkout data");
        router.push("/cart");
      } finally {
        setLoading(false);
      }
    }
    fetchCheckoutData();
  }, [router]);

  const calculateShipping = useCallback(async () => {
    if (!selectedAddressId || !checkoutData) return;

    try {
      setCalculatingShipping(true);
      
      const weightResponse = await fetch("/api/weight/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: checkoutData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!weightResponse.ok) throw new Error("Failed to calculate weight");
      const weightData = await weightResponse.json();
      setTotalWeightWithPackaging(weightData.totalWeightWithPackaging || 0);

      const shippingResponse = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          totalWeightWithPackaging: weightData.totalWeightWithPackaging || 0,
        }),
      });

      if (!shippingResponse.ok) throw new Error("Failed to calculate shipping");
      const data = await shippingResponse.json();
      console.log("[CHECKOUT] shipping API response:", data);
      
      if (data.success && data.status === 'success') {
        setShippingCost(data.delivery_charges.freight_charge);
        setShippingDetails(data.delivery_charges);
      } else {
        throw new Error(data.message || "Failed to calculate shipping");
      }

    } catch (error) {
      console.error("Error calculating shipping:", error);
      toast.error("Failed to calculate shipping cost");
      setShippingCost(null);
      setShippingDetails(null);
    } finally {
      setCalculatingShipping(false);
    }
  }, [checkoutData, selectedAddressId]);

  // Calculate shipping when address is selected
  useEffect(() => {
    if (selectedAddressId && checkoutData) {
      calculateShipping();
    }
  }, [selectedAddressId, checkoutData, calculateShipping]);

  useEffect(() => {
    console.log("[CHECKOUT] totalWeightWithPackaging:", totalWeightWithPackaging);
  }, [totalWeightWithPackaging]);

  const handleStateSelect = (stateName: string) => {
    const selectedState = indianStates.find((s) => s.name === stateName);
    setNewAddress({
      ...newAddress,
      state: stateName,
      stateCode: selectedState ? selectedState.code : "",
    });
  };

  const handleSaveAddress = async () => {
    // Validate form
    if (
      !newAddress.name ||
      !newAddress.phone ||
      !newAddress.houseNo ||
      !newAddress.line1 ||
      !newAddress.city ||
      !newAddress.district ||
      !newAddress.state ||
      !newAddress.pincode
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate pincode
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(newAddress.pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    try {
      setSavingAddress(true);
      const response = await fetch("/api/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAddress),
      });

      if (!response.ok) throw new Error("Failed to save address");
      const data = await response.json();
      if (data.success) {
        toast.success("Address saved successfully");
        // Refresh addresses
        const addressesResponse = await fetch("/api/address");
        const addressesData = await addressesResponse.json();
        if (addressesData.success) {
          setAddresses(addressesData.addresses);
          setSelectedAddressId(data.address.id);
        }
        // Reset form
        setNewAddress({
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
        });
        setIsDialogOpen(false);
      } else {
        throw new Error(data.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  // Create order when address and shipping are ready
  useEffect(() => {
    const createOrderIfReady = async () => {
      if (!selectedAddressId || !checkoutData || shippingCost === null || orderId) return;
      if (creatingOrder) return;

      try {
        setCreatingOrder(true);
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: checkoutData.items,
            totalAmount: checkoutData.totalRegularPrice,
            discountAmount: checkoutData.totalSavings,
            addressId: selectedAddressId,
            deliveryCharge: shippingCost,
          }),
        });

        if (!response.ok) throw new Error("Failed to create order");
        const data = await response.json();
        if (data.success) {
          setOrderId(data.id);
        } else {
          throw new Error(data.message || "Failed to create order");
        }
      } catch (error) {
        console.error("Error creating order:", error);
        toast.error("Failed to create order. Please try again.");
      } finally {
        setCreatingOrder(false);
      }
    };

    createOrderIfReady();
  }, [selectedAddressId, checkoutData, shippingCost, orderId, creatingOrder]);

  const grandTotal =
    checkoutData && shippingCost !== null
      ? checkoutData.totalDiscountedPrice + shippingCost
      : checkoutData?.totalDiscountedPrice || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-96 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!checkoutData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-[#168e2d]" />
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Addresses and Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingAddresses ? (
                  <Skeleton className="h-32" />
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No addresses found. Please add a delivery address.
                    </p>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-[#168e2d] hover:bg-[#137a26]">
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="type">Address Type</Label>
                              <Select
                                value={newAddress.type}
                                onValueChange={(value) =>
                                  setNewAddress({ ...newAddress, type: value })
                                }
                              >
                                <SelectTrigger>
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
                              <Label htmlFor="name">Name *</Label>
                              <Input
                                id="name"
                                value={newAddress.name}
                                onChange={(e) =>
                                  setNewAddress({ ...newAddress, name: e.target.value })
                                }
                                placeholder="Full Name"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                              id="phone"
                              value={newAddress.phone}
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                                })
                              }
                              placeholder="10-digit phone number"
                              maxLength={10}
                            />
                          </div>
                          <div>
                            <Label htmlFor="houseNo">House/Building No. *</Label>
                            <Input
                              id="houseNo"
                              value={newAddress.houseNo}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, houseNo: e.target.value })
                              }
                              placeholder="123"
                            />
                          </div>
                          <div>
                            <Label htmlFor="line1">Address Line 1 *</Label>
                            <Input
                              id="line1"
                              value={newAddress.line1}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, line1: e.target.value })
                              }
                              placeholder="Street, Area"
                            />
                          </div>
                          <div>
                            <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                            <Input
                              id="line2"
                              value={newAddress.line2}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, line2: e.target.value })
                              }
                              placeholder="Landmark, etc."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="city">City *</Label>
                              <Input
                                id="city"
                                value={newAddress.city}
                                onChange={(e) =>
                                  setNewAddress({ ...newAddress, city: e.target.value })
                                }
                                placeholder="City"
                              />
                            </div>
                            <div>
                              <Label htmlFor="district">District *</Label>
                              <Input
                                id="district"
                                value={newAddress.district}
                                onChange={(e) =>
                                  setNewAddress({ ...newAddress, district: e.target.value })
                                }
                                placeholder="District"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="state">State *</Label>
                              <Select
                                value={newAddress.state}
                                onValueChange={handleStateSelect}
                              >
                                <SelectTrigger>
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
                            <div>
                              <Label htmlFor="pincode">Pincode *</Label>
                              <Input
                                id="pincode"
                                value={newAddress.pincode}
                                onChange={(e) =>
                                  setNewAddress({
                                    ...newAddress,
                                    pincode: e.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                                  })
                                }
                                placeholder="123456"
                                maxLength={6}
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isDefault"
                              checked={newAddress.isDefault}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, isDefault: e.target.checked })
                              }
                              className="rounded"
                            />
                            <Label htmlFor="isDefault" className="cursor-pointer">
                              Set as default address
                            </Label>
                          </div>
                          <Button
                            onClick={handleSaveAddress}
                            disabled={savingAddress}
                            className="w-full bg-[#168e2d] hover:bg-[#137a26]"
                          >
                            {savingAddress ? (
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
                ) : (
                  <>
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedAddressId === address.id
                              ? "border-[#168e2d] bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedAddressId(address.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">{address.name}</span>
                                {address.isDefault && (
                                  <span className="text-xs bg-[#168e2d] text-white px-2 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                                <span className="text-sm text-muted-foreground">
                                  ({address.type})
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">
                                {address.houseNo}, {address.line1}
                                {address.line2 && `, ${address.line2}`}
                              </p>
                              <p className="text-sm text-gray-700">
                                {address.city}, {address.district}, {address.state} - {address.pincode}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                            </div>
                            {selectedAddressId === address.id && (
                              <CheckCircle2 className="h-5 w-5 text-[#168e2d] flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="type">Address Type</Label>
                              <Select
                                value={newAddress.type}
                                onValueChange={(value) =>
                                  setNewAddress({ ...newAddress, type: value })
                                }
                              >
                                <SelectTrigger>
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
                              <Label htmlFor="name">Name *</Label>
                              <Input
                                id="name"
                                value={newAddress.name}
                                onChange={(e) =>
                                  setNewAddress({ ...newAddress, name: e.target.value })
                                }
                                placeholder="Full Name"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                              id="phone"
                              value={newAddress.phone}
                              onChange={(e) =>
                                setNewAddress({
                                  ...newAddress,
                                  phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                                })
                              }
                              placeholder="10-digit phone number"
                              maxLength={10}
                            />
                          </div>
                          <div>
                            <Label htmlFor="houseNo">House/Building No. *</Label>
                            <Input
                              id="houseNo"
                              value={newAddress.houseNo}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, houseNo: e.target.value })
                              }
                              placeholder="123"
                            />
                          </div>
                          <div>
                            <Label htmlFor="line1">Address Line 1 *</Label>
                            <Input
                              id="line1"
                              value={newAddress.line1}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, line1: e.target.value })
                              }
                              placeholder="Street, Area"
                            />
                          </div>
                          <div>
                            <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                            <Input
                              id="line2"
                              value={newAddress.line2}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, line2: e.target.value })
                              }
                              placeholder="Landmark, etc."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="city">City *</Label>
                              <Input
                                id="city"
                                value={newAddress.city}
                                onChange={(e) =>
                                  setNewAddress({ ...newAddress, city: e.target.value })
                                }
                                placeholder="City"
                              />
                            </div>
                            <div>
                              <Label htmlFor="district">District *</Label>
                              <Input
                                id="district"
                                value={newAddress.district}
                                onChange={(e) =>
                                  setNewAddress({ ...newAddress, district: e.target.value })
                                }
                                placeholder="District"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="state">State *</Label>
                              <Select
                                value={newAddress.state}
                                onValueChange={handleStateSelect}
                              >
                                <SelectTrigger>
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
                            <div>
                              <Label htmlFor="pincode">Pincode *</Label>
                              <Input
                                id="pincode"
                                value={newAddress.pincode}
                                onChange={(e) =>
                                  setNewAddress({
                                    ...newAddress,
                                    pincode: e.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                                  })
                                }
                                placeholder="123456"
                                maxLength={6}
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isDefault"
                              checked={newAddress.isDefault}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, isDefault: e.target.checked })
                              }
                              className="rounded"
                            />
                            <Label htmlFor="isDefault" className="cursor-pointer">
                              Set as default address
                            </Label>
                          </div>
                          <Button
                            onClick={handleSaveAddress}
                            disabled={savingAddress}
                            className="w-full bg-[#168e2d] hover:bg-[#137a26]"
                          >
                            {savingAddress ? (
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
                  </>
                )}
              </CardContent>
            </Card>

            {/* Order Items Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {checkoutData.items.map((item) => {
                    const product = products[item.productId];
                    if (!product) return null;

                    const itemTotal = item.price * item.quantity;
                    const originalTotal = item.originalPrice * item.quantity;
                    const discount = originalTotal - itemTotal;

                    return (
                      <div key={item.productId} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.mainImage ? (
                            <Image
                              src={product.mainImage}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="96px"
                              unoptimized={product.mainImage.includes('admin.aoac.in')}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                          {discount > 0 && (
                            <p className="text-sm text-green-600 mt-1">
                              You saved ₹{discount.toFixed(2)}!
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">₹{itemTotal.toFixed(2)}</p>
                          {discount > 0 && (
                            <p className="text-sm text-muted-foreground line-through">
                              ₹{originalTotal.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-36">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">
                    ₹{checkoutData.totalRegularPrice.toFixed(2)}
                  </span>
                </div>
                {checkoutData.totalSavings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Total Savings
                    </span>
                    <span className="font-semibold">
                      -₹{checkoutData.totalSavings.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Total Weight
                    </span>
                    <span className="font-semibold">
                      {(totalWeightWithPackaging / 1000).toFixed(2)} kg
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Shipping</span>
                  {calculatingShipping ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : shippingCost !== null ? (
                    <div className="text-right">
                      <span className="font-semibold">₹{shippingCost.toFixed(2)}</span>
                      {shippingDetails && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <p>via {shippingDetails.courier_name}</p>
                          {shippingDetails.estimated_delivery_days && (
                            <p className="text-green-600">
                              Est. delivery: {shippingDetails.estimated_delivery_days} days
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not calculated</span>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Grand Total</span>
                  <span className="text-[#168e2d]">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
                {creatingOrder ? (
                  <Button
                    disabled
                    className="w-full bg-[#168e2d] hover:bg-[#137a26] text-white"
                    size="lg"
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Order...
                  </Button>
                ) : orderId && selectedAddressId ? (
                  <PaymentHandler
                    orderId={orderId}
                    totalAmount={grandTotal}
                    discountAmount={checkoutData.totalSavings}
                    shippingCharge={shippingCost || 0}
                    courierName={shippingDetails?.courier_name}
                    estimatedDeliveryDays={shippingDetails?.estimated_delivery_days}
                    selectedAddress={addresses.find(a => a.id === selectedAddressId) || null}
                    orderItems={checkoutData.items}
                    onProcessingChange={setIsPaymentProcessing}
                    disabled={
                      !selectedAddressId ||
                      calculatingShipping ||
                      shippingCost === null ||
                      !orderId
                    }
                  />
                ) : (
                  <Button
                    disabled
                    className="w-full bg-[#168e2d] hover:bg-[#137a26] text-white"
                    size="lg"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Preparing Payment...
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/cart")}
                  disabled={isPaymentProcessing}
                >
                  Back to Cart
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


