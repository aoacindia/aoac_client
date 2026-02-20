"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingCart, Star, Package, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  code: string
  name: string
  description?: string
  price: number
  regularPrice?: number
  mainImage?: string
  weight?: number
  images: string[]
  inStock: boolean                                                                
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

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [uptoPrice, setUptoPrice] = useState<number | null>(null)
  const [isLoadingUptoPrice, setIsLoadingUptoPrice] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const router = useRouter()

  const discountPercentage = product.regularPrice && product.regularPrice > product.price
    ? Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)
    : 0

  useEffect(() => {
    setIsLoadingUptoPrice(true)
    
    let lowestPrice = product.price

    if (product.discountPrices && product.discountPrices.length > 0) {
      for (const productDiscount of product.discountPrices) {
        if (productDiscount.discountPrice < lowestPrice) {
          lowestPrice = productDiscount.discountPrice
        }
      }
    }

    if (product.weightDiscounts && product.weightDiscounts.length > 0) {
      for (const weightDiscount of product.weightDiscounts) {
        if (weightDiscount.price < lowestPrice) {
          lowestPrice = weightDiscount.price
        }
      }
    }

    if (lowestPrice < product.price) {
      setUptoPrice(lowestPrice)
    } else {
      setUptoPrice(null)
    }

    setIsLoadingUptoPrice(false)
  }, [product])

  const truncateName = (name: string, maxLength: number = 60) => {
    return name.length > maxLength ? name.substring(0, maxLength) + "..." : name
  }

  const formatWeight = (weight?: number) => {
    if (!weight) return null
    
    if (weight < 1000) {
      return `${weight}g`
    } else {
      const kg = weight / 1000
      return `${Math.round(kg)}kg`
    }
  }

  return (
    <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 bg-white h-full flex flex-col" onClick={(e) => {
      // Only prevent navigation if clicking on the card itself (not on links or buttons)
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a')) {
        return; // Let button/link handle the click
      }
    }}>
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer">
          {product.mainImage && !imageError ? (
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImageError(true)}
              unoptimized={product.mainImage.includes('admin.aoac.in')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-300" />
            </div>
          )}

          {discountPercentage > 0 && (
            <Badge className="absolute top-3 right-3 bg-red-500 text-white text-sm px-2 py-1 shadow-lg">
              -{discountPercentage}%
            </Badge>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
      </Link>

      <CardContent className="pt-3 px-4 pb-4 flex-1 flex flex-col">
        <div className="flex-1">
          <Link href={`/product/${product.id}`} className="block">
            <Badge className="bg-[#168e2d]/10 text-[#168e2d] border-[#168e2d]/20 text-xs">
              {product.category.name}
            </Badge>

            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mt-1.5 cursor-pointer hover:text-[#168e2d] transition-colors">
              {truncateName(product.name)}
            </h3>
          </Link>

          <div className="flex items-center gap-1 mt-1.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">(4.8)</span>
          </div>

          {product.weight && (
            <div className="flex items-center gap-1 mt-1">
              <Package className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-600 font-medium">
                {formatWeight(product.weight)}
              </span>
            </div>
          )}

          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                ₹{product.price.toFixed(2)}
              </span>
              {product.regularPrice && product.regularPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.regularPrice.toFixed(2)}
                </span>
              )}
            </div>

            {uptoPrice && uptoPrice < product.price && !isLoadingUptoPrice && (
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-0.5">
                Bulk: ₹{uptoPrice.toFixed(2)}
              </Badge>
            )}
            {isLoadingUptoPrice && (
              <Skeleton className="h-5 w-24 bg-green-100" />
            )}
          </div>
        </div>

        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          <Button
            className="w-full bg-[#168e2d] hover:bg-[#137a26] text-white border-0 group-hover:shadow-lg transition-all h-12 relative overflow-hidden z-0 pointer-events-auto"
            onClick={async (e) => {
              e.preventDefault()
              e.stopPropagation()
              e.nativeEvent.stopImmediatePropagation()
              
              if (!product.inStock || isAdding) {
                return
              }
              
              setIsAdding(true)
              
              try {
                const response = await fetch("/api/cart", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ productId: product.id, quantity: 1 }),
                })

                if (response.status === 401) {
                  router.push("/auth/login")
                  return
                }

                const data = await response.json()

                if (!response.ok) {
                  toast.error(data.error || "Failed to add to cart")
                  return
                }

                setJustAdded(true)
                toast.success("Added to cart!")
                setTimeout(() => setJustAdded(false), 2000)
                onAddToCart?.(product)
              } catch (error) {
                console.error("Error in add to cart:", error)
                toast.error("Failed to add to cart. Please try again.")
              } finally {
                setIsAdding(false)
              }
            }}
            disabled={!product.inStock || isAdding}
            type="button"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : justAdded ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
