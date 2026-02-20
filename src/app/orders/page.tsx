"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {  ShoppingBag, Package, Calendar, IndianRupee, Eye, ArrowLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Product {
  id: string
  code: string
  name: string
  mainImage?: string | null
  price: number
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
  name: string
  phone: string
  houseNo: string
  line1: string
  line2?: string
  city: string
  district: string
  state: string
  country: string
  pincode: string
}

interface Order {
  id: string
  orderDate: string
  status: string
  totalAmount: number
  discountAmount?: number
  paidAmount?: number
  packed: boolean
  refund: boolean
  customOrder: boolean
  paymentMethod?: string
  shippingCourierName?: string
  estimatedDeliveryDate?: string
  deliveredAt?: string
  orderItems: OrderItem[]
  shippingAddress?: Address
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

export default function OrdersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()

      if (data.success) {
        setOrders(data.orders)
      } else {
        toast.error(data.message || 'Failed to load orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
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
            <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-[#168e2d]" />
            My Orders
          </h1>
          <p className="text-gray-600 mt-2">View and track all your orders</p>
        </div>

        {orders.length === 0 ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="pt-12 pb-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">You haven&apos;t placed any orders yet. Start shopping!</p>
              <Button
                onClick={() => router.push('/')}
                className="bg-[#168e2d] hover:bg-[#137a26]"
              >
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order.id.toUpperCase()}
                            </h3>
                            {order.customOrder && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                                Custom
                              </Badge>
                            )}
                            {order.refund && (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                                Refunded
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(order.orderDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-300'} whitespace-nowrap`}
                        >
                          {formatStatus(order.status)}
                        </Badge>
                      </div>

                      {/* Price Info */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-2xl font-bold text-gray-900">
                          <IndianRupee className="h-5 w-5" />
                          {order.paidAmount?.toFixed(2) || order.totalAmount.toFixed(2)}
                        </div>
                        {order.discountAmount && order.discountAmount > 0 && (
                          <span className="text-sm text-green-600">
                            (₹{order.discountAmount.toFixed(2)} saved)
                          </span>
                        )}
                      </div>

                      {/* Additional Info */}
                      <div className="flex flex-wrap gap-3 text-sm">
                        {order.paymentMethod && (
                          <div className="text-gray-600">
                            Payment: <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                          </div>
                        )}
                        {order.shippingCourierName && (
                          <div className="text-gray-600">
                            Courier: <span className="font-medium text-gray-900">{order.shippingCourierName}</span>
                          </div>
                        )}
                        {order.packed && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                            Packed
                          </Badge>
                        )}
                      </div>

                      {/* Delivery Info */}
                      {order.estimatedDeliveryDate && !order.deliveredAt && (
                        <div className="text-sm text-gray-600">
                          Expected delivery: <span className="font-medium text-gray-900">{order.estimatedDeliveryDate}</span>
                        </div>
                      )}
                      {order.deliveredAt && (
                        <div className="text-sm text-green-600">
                          Delivered on: <span className="font-medium">{formatDate(order.deliveredAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="bg-[#168e2d] hover:bg-[#137a26] w-full lg:w-auto"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

