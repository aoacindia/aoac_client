"use client"

import Link from "next/link"
import { ProductCard } from "@/components/ProductCard"
import { ChevronRight } from "lucide-react"

interface Product {
  id: string
  code: string
  name: string
  description?: string
  price: number
  regularPrice?: number
  mainImage?: string
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

interface RelatedProductsProps {
  products: Product[]
  categoryName: string
}

export function RelatedProducts({ products, categoryName }: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
              More from {categoryName}
            </h2>
            <p className="text-sm text-gray-600">
              You might also like these products
            </p>
          </div>
          <Link
            href={`/?category=${products[0]?.category.id}`}
            className="hidden md:flex items-center text-[#168e2d] hover:text-[#137a26] font-medium transition-colors text-sm"
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <ProductCard product={product} />
            </Link>
          ))}
        </div>

        <div className="md:hidden mt-4 text-center">
          <Link
            href={`/?category=${products[0]?.category.id}`}
            className="inline-flex items-center text-[#168e2d] hover:text-[#137a26] font-medium transition-colors text-sm"
          >
            View All {categoryName} Products
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
