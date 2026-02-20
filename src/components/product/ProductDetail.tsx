"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Heart, Share2, Award, Shield, Package, Star, CircleCheck as CheckCircle2, Minus, Plus, Weight, Ruler, Box, Check, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  code: string
  name: string
  description?: string
  price: number
  regularPrice?: number
  length?: number
  breadth?: number
  height?: number
  weight?: number
  tax: number
  mainImage?: string
  images: string[]
  inStock: boolean
  stockCount?: number
  category: {
    id: string
    name: string
  }
  weightDiscounts?: Array<{
    id: string
    minWeight: number
    price: number
  }>
  discountPrices?: Array<{
    id: string
    discountPrice: number
    discount: {
      id: string
      minWeight: number
    }
  }>
}

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const productImages = Array.isArray(product.images) ? product.images : []
  const allImages = product.mainImage
    ? [product.mainImage, ...productImages.filter(img => img && img !== product.mainImage)]
    : productImages.filter(Boolean)
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { cart, addToCart, increaseQuantity, decreaseQuantity } = useCart()
  const router = useRouter()
  
  // Touch/swipe handlers
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  
  const isInCart = cart[product.id] !== undefined
  const cartQuantity = cart[product.id]?.quantity || 0

  const selectedImage = allImages[currentImageIndex] || ""

  const discountPercentage = product.regularPrice && product.regularPrice > product.price
    ? Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)
    : 0

  const savings = product.regularPrice ? (product.regularPrice - product.price) * quantity : 0

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (!product.inStock || isAdding) {
      console.log("Cannot add: inStock=", product.inStock, "isAdding=", isAdding)
      return
    }
    
    console.log("Adding to cart:", product.id, "quantity:", quantity)
    setIsAdding(true)
    
    try {
      const result = await addToCart(product.id, quantity)
      console.log("Add to cart result:", result)
      
      if (result.success) {
        setJustAdded(true)
        toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart!`)
        setTimeout(() => setJustAdded(false), 2000)
        setQuantity(1)
      } else {
        if (result.error?.includes("Login")) {
          router.push("/auth/login")
        } else if (result.error?.includes("only have")) {
          toast.error(result.error)
        } else {
          toast.error(result.error || "Failed to add to cart")
        }
      }
    } catch (error) {
      console.error("Error in add to cart:", error)
      toast.error("Failed to add to cart. Please try again.")
    } finally {
      setIsAdding(false)
    }
  }
  
  const handleIncreaseQuantity = async () => {
    if (isInCart) {
      const result = await increaseQuantity(product.id)
      if (!result.success) {
        toast.error(result.error || "Failed to update quantity")
      }
    } else {
      setQuantity(prev => {
        const newQty = prev + 1
        if (product.stockCount && newQty > product.stockCount) {
          toast.error(`Only ${product.stockCount} units available`)
          return prev
        }
        return newQty
      })
    }
  }
  
  const handleDecreaseQuantity = async () => {
    if (isInCart) {
      const result = await decreaseQuantity(product.id)
      if (!result.success) {
        toast.error(result.error || "Failed to update quantity")
      }
    } else {
      setQuantity(prev => Math.max(1, prev - 1))
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} from AOAC`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    }
  }

  const formatWeight = (weightInGrams: number) => {
    if (weightInGrams >= 1000) {
      return `${Math.round(weightInGrams / 1000)}kg`
    }
    return `${weightInGrams}g`
  }

  // Navigation functions
  const goToNextImage = () => {
    if (!allImages.length) return
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const goToPreviousImage = () => {
    if (!allImages.length) return
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  // Touch event handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50 // Minimum distance for a swipe

    if (distance > minSwipeDistance) {
      // Swipe left - go to next image
      goToNextImage()
    } else if (distance < -minSwipeDistance) {
      // Swipe right - go to previous image
      goToPreviousImage()
    }

    // Reset touch positions
    touchStartX.current = null
    touchEndX.current = null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-[#168e2d] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/?category=${product.category.id}`}
            className="hover:text-[#168e2d] transition-colors"
          >
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div 
              ref={imageContainerRef}
              className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group max-w-md mx-auto"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 select-none"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized={selectedImage.includes('admin.aoac.in')}
                  draggable={false}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-24 w-24 text-gray-300" />
                </div>
              )}

              {discountPercentage > 0 && (
                <Badge className="absolute top-3 right-3 bg-red-500 text-white text-sm px-2 py-1 z-10">
                  -{discountPercentage}% OFF
                </Badge>
              )}

              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  
                  {/* Mobile: Always show arrows on touch devices */}
                  <button
                    onClick={goToPreviousImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-all hover:scale-110 z-10 md:hidden"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-all hover:scale-110 z-10 md:hidden"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Image Indicator Dots */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "w-6 bg-white"
                          : "w-2 bg-white/60 hover:bg-white/80"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-[#168e2d] ring-2 ring-[#168e2d]/30"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="150px"
                      unoptimized={image.includes('admin.aoac.in')}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <Badge className="mb-3 bg-[#168e2d]/10 text-[#168e2d] border-[#168e2d]/20">
                {product.category.name}
              </Badge>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                {product.name}
              </h1>
              <p className="text-gray-600 text-xs">Product Code: {product.code}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">(4.8 out of 5 - 24 reviews)</span>
            </div>

            {/* Price */}
            <Card className="border-2 border-[#168e2d]/20 bg-gradient-to-br from-[#168e2d]/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{product.price.toFixed(2)}
                  </span>
                  {product.regularPrice && product.regularPrice > product.price && (
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.regularPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-xs text-[#168e2d] font-medium">
                    You save ₹{savings.toFixed(2)} ({discountPercentage}%)
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-600">
                    Inclusive of all taxes • GST {product.tax}%
                  </p>
                  {product.weight && (
                    <div className="flex items-center gap-1 text-gray-700">
                      <Weight className="h-3 w-3" />
                      <span className="text-xs font-medium">
                        {formatWeight(product.weight)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">In Stock</span>
                  {product.stockCount && (
                    <span className="text-gray-600 text-sm">
                      ({product.stockCount} available)
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div className="h-5 w-5 rounded-full bg-red-500" />
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Quantity</label>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border-2 border-gray-200 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDecreaseQuantity}
                    disabled={isInCart ? cartQuantity <= 1 : quantity <= 1}
                    className="h-10 w-10"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-12 text-center font-semibold text-base">
                    {isInCart ? cartQuantity : quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleIncreaseQuantity}
                    disabled={!product.inStock || (!!product.stockCount && (isInCart ? cartQuantity >= product.stockCount : quantity >= product.stockCount))}
                    className="h-10 w-10"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-base font-semibold text-gray-900">
                  Total: ₹{(product.price * (isInCart ? cartQuantity : quantity)).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isInCart ? (
                <Button
                  onClick={() => router.push("/cart")}
                  className="flex-1 bg-[#168e2d] hover:bg-[#137a26] text-white h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Check className="mr-2 h-4 w-4" />
                  View Cart ({cartQuantity})
                </Button>
              ) : (
                <Button
                  onClick={(e) => handleAddToCart(e)}
                  disabled={!product.inStock || isAdding}
                  className="flex-1 bg-[#168e2d] hover:bg-[#137a26] text-white h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all relative overflow-hidden z-50 pointer-events-auto"
                  type="button"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : justAdded ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Added!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`h-11 w-11 ${isWishlisted ? "text-red-500 border-red-500" : ""}`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500" : ""}`} />
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="h-11 w-11"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 pt-4">
              <div className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <Award className="h-5 w-5 mx-auto mb-1 text-[#168e2d]" />
                <p className="text-[10px] font-medium text-gray-900">Premium Quality</p>
                <p className="text-[9px] text-gray-600">Guaranteed</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <Shield className="h-5 w-5 mx-auto mb-1 text-[#168e2d]" />
                <p className="text-[10px] font-medium text-gray-900">100% Organic<sup className="text-[0.4em] leading-none">*</sup></p>
                <p className="text-[9px] text-gray-600">Certified</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <Package className="h-5 w-5 mx-auto mb-1 text-[#168e2d]" />
                <p className="text-[10px] font-medium text-gray-900">Safe Packaging</p>
                <p className="text-[9px] text-gray-600">Secure delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <Tabs defaultValue="description" className="w-full">
              <div className="overflow-x-auto">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0 min-w-max sm:min-w-0">
                  <TabsTrigger
                    value="description"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#168e2d] data-[state=active]:bg-transparent px-4 py-3 text-sm sm:px-6 sm:py-4 sm:text-base whitespace-nowrap"
                  >
                    Description
                  </TabsTrigger>
                  <TabsTrigger
                    value="specifications"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#168e2d] data-[state=active]:bg-transparent px-4 py-3 text-sm sm:px-6 sm:py-4 sm:text-base whitespace-nowrap"
                  >
                    Specifications
                  </TabsTrigger>
                  <TabsTrigger
                    value="discounts"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#168e2d] data-[state=active]:bg-transparent px-4 py-3 text-sm sm:px-6 sm:py-4 sm:text-base whitespace-nowrap"
                  >
                    Bulk Discounts
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="description" className="p-4 sm:p-6">
                <div className="prose max-w-none">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">About this product</h3>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {product.description || "No description available for this product."}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 sm:py-3 border-b">
                        <span className="text-xs sm:text-sm text-gray-600">Product Code</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 text-right ml-2 break-words">{product.code}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 sm:py-3 border-b">
                        <span className="text-xs sm:text-sm text-gray-600">Category</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 text-right ml-2 break-words">{product.category.name}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 sm:py-3 border-b">
                        <span className="text-xs sm:text-sm text-gray-600">Tax Rate</span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">{product.tax}%</span>
                      </div>
                    </div>
                  </div>

                  {(product.weight || product.length || product.breadth || product.height) && (
                    <div className="space-y-3">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Dimensions</h3>
                      <div className="space-y-3">
                        {product.weight && (
                          <div className="flex items-center justify-between py-2 sm:py-3 border-b">
                            <div className="flex items-center gap-2">
                              <Weight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                              <span className="text-xs sm:text-sm text-gray-600">Weight</span>
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">{formatWeight(product.weight)}</span>
                          </div>
                        )}
                        {product.length && (
                          <div className="flex items-center justify-between py-2 sm:py-3 border-b">
                            <div className="flex items-center gap-2">
                              <Ruler className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                              <span className="text-xs sm:text-sm text-gray-600">Length</span>
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">{product.length} cm</span>
                          </div>
                        )}
                        {product.breadth && (
                          <div className="flex items-center justify-between py-2 sm:py-3 border-b">
                            <div className="flex items-center gap-2">
                              <Ruler className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                              <span className="text-xs sm:text-sm text-gray-600">Breadth</span>
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">{product.breadth} cm</span>
                          </div>
                        )}
                        {product.height && (
                          <div className="flex items-center justify-between py-2 sm:py-3 border-b">
                            <div className="flex items-center gap-2">
                              <Box className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                              <span className="text-xs sm:text-sm text-gray-600">Height</span>
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-900">{product.height} cm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="discounts" className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Bulk Purchase Discounts</h3>
                {(product.weightDiscounts && product.weightDiscounts.length > 0) ||
                 (product.discountPrices && product.discountPrices.length > 0) ? (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-gray-600 mb-4">
                      Get better prices when you order in bulk! Here are the available discounts:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {product.weightDiscounts?.map((discount) => (
                        <Card key={discount.id} className="border-2 border-[#168e2d]/20 hover:border-[#168e2d]/40 transition-colors">
                          <CardContent className="p-4 sm:p-6">
                            <div className="text-center">
                              <Weight className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-[#168e2d]" />
                              <p className="text-xs sm:text-sm text-gray-600 mb-2">Order {formatWeight(discount.minWeight)} or more</p>
                              <p className="text-xl sm:text-2xl font-bold text-[#168e2d]">₹{discount.price.toFixed(2)}</p>
                              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">per unit</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {product.discountPrices?.map((discount) => (
                        <Card key={discount.id} className="border-2 border-[#168e2d]/20 hover:border-[#168e2d]/40 transition-colors">
                          <CardContent className="p-4 sm:p-6">
                            <div className="text-center">
                              <Weight className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-[#168e2d]" />
                              <p className="text-xs sm:text-sm text-gray-600 mb-2">Order {formatWeight(discount.discount.minWeight)} or more</p>
                              <p className="text-xl sm:text-2xl font-bold text-[#168e2d]">₹{discount.discountPrice.toFixed(2)}</p>
                              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">per unit</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-600">No bulk discounts available for this product.</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
