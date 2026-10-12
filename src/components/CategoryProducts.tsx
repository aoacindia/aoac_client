"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ProductCard } from "./ProductCard"
import { Button } from "@/components/ui/button"
import { Grid, List } from "lucide-react"

interface Category {
  id: string
  name: string
}

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

interface CategoryProductsProps {
  categories: Category[]
  products: Product[]
  selectedCategory?: string
}

export function CategoryProducts({ categories, products, selectedCategory }: CategoryProductsProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [headerHeight, setHeaderHeight] = useState(0)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)

  useEffect(() => {
    const header = document.querySelector("header") as HTMLElement | null
    if (!header) return

    const updateHeaderInfo = () => {
      const rect = header.getBoundingClientRect()
      const isVisible = rect.top >= -rect.height && rect.top <= 10

      let headerBottom = rect.bottom

      const mobileSearch = document.querySelector('.md\\:hidden.border-t.bg-white') as HTMLElement | null
      if (mobileSearch && window.innerWidth < 768) {
        const searchRect = mobileSearch.getBoundingClientRect()
        if (searchRect.top >= 0 && searchRect.top < window.innerHeight) {
          headerBottom = searchRect.bottom
        }
      }

      setIsHeaderVisible(isVisible)
      setHeaderHeight(Math.max(0, headerBottom))
    }

    const handleScroll = () => {
      requestAnimationFrame(updateHeaderInfo)
    }

    updateHeaderInfo()

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateHeaderInfo)
    })
    resizeObserver.observe(header)

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateHeaderInfo)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateHeaderInfo)
      resizeObserver.disconnect()
    }
  }, [])

  const stickyTop = isHeaderVisible ? headerHeight : 0
  const selectedName = categories.find((category) => category.id === selectedCategory)?.name

  return (
    <div className="max-w-[1400px] mx-auto relative -mt-12 sm:-mt-16 bg-white rounded-t-3xl shadow-xl">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {selectedName ? `${selectedName} Products` : "Our Products"}
            </h2>
            <p className="text-gray-600">
              Discover amazing organic<sup className="text-[0.5em] leading-none">*</sup> products at unbeatable prices
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 border rounded-lg p-1 bg-gray-50">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-[#168e2d] hover:bg-[#137a26]" : ""}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-[#168e2d] hover:bg-[#137a26]" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          className="sticky z-40 w-full border-b bg-white/95 backdrop-blur shadow-sm transition-all duration-300 px-4 mb-2"
          style={{ top: `${stickyTop}px` }}
        >
          <nav className="py-3" aria-label="Product categories">
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                variant={!selectedCategory ? "default" : "outline"}
                size="sm"
                className={!selectedCategory ? "bg-[#168e2d] hover:bg-[#137a26] shadow-md" : "hover:border-[#168e2d]"}
              >
                <Link href="/" scroll={false}>All Products</Link>
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  asChild
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  className={selectedCategory === category.id ? "bg-[#168e2d] hover:bg-[#137a26] shadow-md" : "hover:border-[#168e2d]"}
                >
                  <Link href={`/?category=${category.id}`} scroll={false}>
                    {category.name}
                  </Link>
                </Button>
              ))}
            </div>
          </nav>
        </div>

        {products.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
              : "grid-cols-1"
          }`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Grid className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try selecting a different category or check back later for new products.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
