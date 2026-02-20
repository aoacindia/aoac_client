"use client"

import { useCallback, useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Package, 
  IndianRupee, 
  MapPin, 
  CreditCard, 
  Truck, 
  Calendar,
  User,
  Phone,
  Mail,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Box,
  Receipt
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Product {
  id: string
  code: string
  name: string
  description?: string | null
  mainImage?: string | null
  price: number
  regularPrice?: number | null
  weight?: number | null
  category?: {
    name: string
  }
}

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  discount: number
  product?: Product | null
}

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
  country: string
  pincode: string
}

interface UserInfo {
  name: string
  email: string
  phone: string
  isBusinessAccount?: boolean | null
  businessName?: string | null
  gstNumber?: string | null
}

interface Order {
  id: string
  orderDate: string
  status: string
  totalAmount: number
  discountAmount?: number | null
  paidAmount?: number | null
  packed: boolean
  refund: boolean
  customOrder: boolean
  
  // Payment Details
  r_orderId?: string | null
  r_paymentId?: string | null
  paymentLinkUrl?: string | null
  paymentMethod?: string | null
  paymentBank?: string | null
  paymentVpa?: string | null
  
  // Shipping Details
  courierId?: number | null
  shippingId?: string | null
  shippingOrderId?: string | null
  shippingAmount?: number | null
  awsCode?: string | null
  shippingInvoiceNumber?: string | null
  shippingCourierName?: string | null
  estimatedDeliveryDate?: string | null
  pickupScheduled?: string | null
  deliveredAt?: string | null
  
  // Documentation
  manifestGenerated?: boolean | null
  InvoiceNumber?: string | null
  
  // Refund Details
  refundId?: string | null
  refundReceipt?: string | null
  refundArn?: string | null
  refundCreatedAt?: string | null
  
  // Relations
  orderItems: OrderItem[]
  shippingAddress?: Address | null
  user: UserInfo
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ORDER_READY: 'bg-blue-100 text-blue-800 border-blue-300',
  PAYMENT_PENDING: 'bg-orange-100 text-orange-800 border-orange-300',
  PAID: 'bg-green-100 text-green-800 border-green-300',
  PROCESSING: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-300',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300',
  REFUNDED: 'bg-gray-100 text-gray-800 border-gray-300',
}

export default function OrderDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)

  const fetchOrderDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      const data = await response.json()

      if (data.success) {
        setOrder(data.order)
      } else {
        toast.error(data.message || 'Failed to load order details')
        router.push('/orders')
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast.error('An error occurred. Please try again.')
      router.push('/orders')
    } finally {
      setLoading(false)
    }
  }, [orderId, router])

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId, fetchOrderDetails])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <Card className="border-0 shadow-xl max-w-md w-full">
          <CardContent className="pt-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-center text-gray-600 mb-4">Order not found or you don&apos;t have access to this order.</p>
            <Button
              onClick={() => router.push('/orders')}
              className="w-full bg-[#168e2d] hover:bg-[#137a26]"
            >
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Button
            onClick={() => router.push('/orders')}
            variant="ghost"
            className="mb-4 md:mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-6 w-6 md:h-8 md:w-8 text-[#168e2d]" />
                Order Details
              </h1>
              <p className="text-gray-600 mt-2">Order #{order.id.toUpperCase()}</p>
            </div>
            <Badge 
              variant="outline" 
              className={`${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-300'} text-base px-4 py-2`}
            >
              {formatStatus(order.status)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-[#168e2d]" />
                  Order Summary
                </CardTitle>
                <CardDescription>Order placed on {formatDate(order.orderDate)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-medium text-gray-900">{formatDateTime(order.orderDate)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Total Items</span>
                  <span className="font-medium text-gray-900">{order.orderItems.length}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <div className="flex items-center font-medium text-gray-900">
                    <IndianRupee className="h-4 w-4" />
                    {order.totalAmount.toFixed(2)}
                  </div>
                </div>
                {order.discountAmount && order.discountAmount > 0 && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Discount</span>
                      <div className="flex items-center font-medium text-green-600">
                        - <IndianRupee className="h-4 w-4" />
                        {order.discountAmount.toFixed(2)}
                      </div>
                    </div>
                  </>
                )}
                {order.shippingAmount && order.shippingAmount > 0 && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Shipping</span>
                      <div className="flex items-center font-medium text-gray-900">
                        <IndianRupee className="h-4 w-4" />
                        {order.shippingAmount.toFixed(2)}
                      </div>
                    </div>
                  </>
                )}
                <Separator className="border-t-2" />
                <div className="flex items-center justify-between py-2">
                  <span className="text-lg font-semibold text-gray-900">Total Paid</span>
                  <div className="flex items-center text-2xl font-bold text-[#168e2d]">
                    <IndianRupee className="h-6 w-6" />
                    {(order.paidAmount || order.totalAmount).toFixed(2)}
                  </div>
                </div>

                {/* Order Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {order.customOrder && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                      <Box className="h-3 w-3 mr-1" />
                      Custom Order
                    </Badge>
                  )}
                  {order.packed && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Packed
                    </Badge>
                  )}
                  {order.manifestGenerated && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                      <FileText className="h-3 w-3 mr-1" />
                      Manifest Generated
                    </Badge>
                  )}
                  {order.refund && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Refunded
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Box className="h-5 w-5 text-[#168e2d]" />
                  Order Items
                </CardTitle>
                <CardDescription>Items in this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">Image</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">Product Name</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">Code</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">Category</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">Weight</th>
                        <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">Quantity</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">Unit Price</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">Discount</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700 whitespace-nowrap">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-3">
                            {item.product?.mainImage ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image
                                  src={item.product.mainImage}
                                  alt={item.product.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-gray-900 whitespace-nowrap text-xs">
                              {item.product?.name || `Product ID: ${item.productId}`}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-xs text-gray-600 whitespace-nowrap">
                              {item.product?.code || '-'}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-xs text-gray-600 whitespace-nowrap">
                              {item.product?.category?.name || '-'}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-xs text-gray-600 whitespace-nowrap">
                              {item.product?.weight ? `${item.product.weight} kg` : '-'}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="font-medium text-gray-900 whitespace-nowrap text-xs">
                              {item.quantity}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end font-medium text-gray-900 whitespace-nowrap text-xs">
                              <IndianRupee className="h-3 w-3 mr-0.5" />
                              {item.price.toFixed(2)}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {item.discount > 0 ? (
                              <div className="flex items-center justify-end text-green-600 whitespace-nowrap text-xs">
                                <IndianRupee className="h-3 w-3 mr-0.5" />
                                {item.discount.toFixed(2)}
                              </div>
                            ) : (
                              <div className="text-gray-400 whitespace-nowrap text-xs">-</div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end font-semibold text-gray-900 whitespace-nowrap text-xs">
                              <IndianRupee className="h-3 w-3 mr-0.5" />
                              {(item.price * item.quantity - item.discount).toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#168e2d]" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{order.shippingAddress.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{order.shippingAddress.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 mt-3">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      <div className="text-gray-700">
                        <p>{order.shippingAddress.houseNo}, {order.shippingAddress.line1}</p>
                        {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                        <p>{order.shippingAddress.city}, {order.shippingAddress.district}</p>
                        <p>{order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="mt-2 bg-gray-50">
                      {order.shippingAddress.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-[#168e2d]" />
                  Customer Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Name</div>
                  <div className="font-medium text-gray-900">{order.user.name}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </div>
                  <div className="font-medium text-gray-900 text-sm break-all">{order.user.email}</div>
                </div>
                <Separator />
                <div>
                  <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </div>
                  <div className="font-medium text-gray-900">{order.user.phone}</div>
                </div>
                {order.user.isBusinessAccount && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        Business Account
                      </div>
                      <div className="font-medium text-gray-900">{order.user.businessName}</div>
                      {order.user.gstNumber && (
                        <div className="text-sm text-gray-600 mt-1">GST: {order.user.gstNumber}</div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#168e2d]" />
                  Payment Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.paymentMethod && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Payment Method</div>
                    <div className="font-medium text-gray-900">{order.paymentMethod}</div>
                  </div>
                )}
                {order.r_paymentId && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Payment ID</div>
                      <div className="font-mono text-xs text-gray-900 break-all">{order.r_paymentId}</div>
                    </div>
                  </>
                )}
                {order.r_orderId && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Razorpay Order ID</div>
                      <div className="font-mono text-xs text-gray-900 break-all">{order.r_orderId}</div>
                    </div>
                  </>
                )}
                {order.paymentBank && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Bank</div>
                      <div className="font-medium text-gray-900">{order.paymentBank}</div>
                    </div>
                  </>
                )}
                {order.paymentVpa && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">UPI ID</div>
                      <div className="font-medium text-gray-900">{order.paymentVpa}</div>
                    </div>
                  </>
                )}
                {!order.paymentMethod && !order.r_paymentId && (
                  <div className="text-sm text-gray-500 italic">No payment information available</div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[#168e2d]" />
                  Shipping Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.shippingCourierName && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Courier Service</div>
                    <div className="font-medium text-gray-900">{order.shippingCourierName}</div>
                  </div>
                )}
                {order.shippingOrderId && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Tracking ID</div>
                      <div className="font-mono text-xs text-gray-900 break-all">{order.shippingOrderId}</div>
                    </div>
                  </>
                )}
                {order.awsCode && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">AWB Code</div>
                      <div className="font-mono text-sm text-gray-900">{order.awsCode}</div>
                    </div>
                  </>
                )}
                {order.shippingInvoiceNumber && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Shipping Invoice</div>
                      <div className="font-medium text-gray-900">{order.shippingInvoiceNumber}</div>
                    </div>
                  </>
                )}
                {order.estimatedDeliveryDate && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Estimated Delivery
                      </div>
                      <div className="font-medium text-gray-900">{order.estimatedDeliveryDate}</div>
                    </div>
                  </>
                )}
                {order.pickupScheduled && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Pickup Scheduled</div>
                      <div className="font-medium text-gray-900">{formatDateTime(order.pickupScheduled)}</div>
                    </div>
                  </>
                )}
                {order.deliveredAt && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        Delivered On
                      </div>
                      <div className="font-medium text-green-600">{formatDateTime(order.deliveredAt)}</div>
                    </div>
                  </>
                )}
                {!order.shippingCourierName && !order.shippingOrderId && (
                  <div className="text-sm text-gray-500 italic">Shipping not yet scheduled</div>
                )}
              </CardContent>
            </Card>

            {/* Documentation */}
            {(order.InvoiceNumber || order.manifestGenerated) && (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#168e2d]" />
                    Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.InvoiceNumber && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Invoice Number</div>
                      <div className="font-medium text-gray-900">{order.InvoiceNumber}</div>
                    </div>
                  )}
                  {order.manifestGenerated && (
                    <>
                      {order.InvoiceNumber && <Separator />}
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-900">Manifest Generated</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Refund Information */}
            {order.refund && (
              <Card className="border-0 shadow-xl border-red-200">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    Refund Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.refundId && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Refund ID</div>
                      <div className="font-mono text-xs text-gray-900 break-all">{order.refundId}</div>
                    </div>
                  )}
                  {order.refundReceipt && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Receipt Number</div>
                        <div className="font-medium text-gray-900">{order.refundReceipt}</div>
                      </div>
                    </>
                  )}
                  {order.refundArn && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm text-gray-600 mb-1">ARN</div>
                        <div className="font-mono text-xs text-gray-900">{order.refundArn}</div>
                      </div>
                    </>
                  )}
                  {order.refundCreatedAt && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Refund Processed</div>
                        <div className="font-medium text-gray-900">{formatDateTime(order.refundCreatedAt)}</div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

