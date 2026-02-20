"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./ProductCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Grid, List } from "lucide-react"

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
  selectedCategory?: string
  onAddToCart?: (product: Product) => void
  onCategoryChange?: (categoryId: string | undefined) => void
}

export function CategoryProducts({ selectedCategory, onAddToCart, onCategoryChange }: CategoryProductsProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [headerOffset, setHeaderOffset] = useState(0)

  const CATEGORY_LIMIT = 12
  const FEATURED_INITIAL_LIMIT = 10
  const FEATURED_LOAD_MORE_LIMIT = 5

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setIsLoadingCategories(true)
      setOffset(0)

      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetch('/api/categories'),
          selectedCategory
            ? fetch(`/api/products?categoryId=${selectedCategory}&limit=${CATEGORY_LIMIT}&offset=0`)
            : fetch(`/api/products/featured?limit=${FEATURED_INITIAL_LIMIT}&offset=0`)
        ])

        const [categoriesData, productsData] = await Promise.all([
          categoriesResponse.json(),
          productsResponse.json()
        ])

        console.log(categoriesData)
        console.log(productsData.data)

        if (categoriesData.success) {
          setCategories(categoriesData.data)
        }
        setIsLoadingCategories(false)

        if (productsData.success) {
          setProducts(productsData.data)
          setHasMore(productsData.pagination?.hasMore || false)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setCategories([])
        setProducts([])
        setIsLoadingCategories(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedCategory])

  useEffect(() => {
    const header = document.querySelector("header") as HTMLElement | null
    if (!header) {
      return
    }

    let rafId: number | null = null
    const updateOffset = () => {
      const rect = header.getBoundingClientRect()
      const nextOffset = Math.max(0, Math.round(rect.bottom))
      setHeaderOffset(nextOffset)
    }

    const scheduleUpdate = () => {
      if (rafId !== null) {
        return
      }
      rafId = window.requestAnimationFrame(() => {
        rafId = null
        updateOffset()
      })
    }

    updateOffset()
    window.addEventListener("resize", scheduleUpdate)
    window.addEventListener("scroll", scheduleUpdate, { passive: true })

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => scheduleUpdate())
      resizeObserver.observe(header)
    }

    return () => {
      window.removeEventListener("resize", scheduleUpdate)
      window.removeEventListener("scroll", scheduleUpdate)
      resizeObserver?.disconnect()
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [])

  const loadMore = async () => {
    setIsLoadingMore(true)
    const newOffset = selectedCategory ? offset + CATEGORY_LIMIT : products.length
    const limit = selectedCategory ? CATEGORY_LIMIT : FEATURED_LOAD_MORE_LIMIT

    try {
      const response = await fetch(
        selectedCategory
          ? `/api/products?categoryId=${selectedCategory}&limit=${limit}&offset=${newOffset}`
          : `/api/products/featured?limit=${limit}&offset=${newOffset}`
      )

      const data = await response.json()

      if (data.success) {
        setProducts(prev => [...prev, ...data.data])
        if (selectedCategory) {
          setOffset(newOffset)
        }
        setHasMore(data.pagination?.hasMore || false)
      }
    } catch (error) {
      console.error('Error loading more products:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const filteredProducts = products

  const ProductSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )

  const CategorySkeleton = () => (
    <Skeleton className="h-9 w-24 rounded-md" />
  )

  const SelectSkeleton = () => (
    <Skeleton className="h-10 w-full rounded-md" />
  )

  return (
    <div className="max-w-[1400px] mx-auto relative -mt-12 sm:-mt-16 bg-white rounded-t-3xl shadow-xl">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            {isLoadingCategories && selectedCategory ? (
              <>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </>
            ) : (
              <>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {selectedCategory
                    ? categories.find(cat => cat.id === selectedCategory)?.name + " Products"
                    : "Featured Products"
                  }
                </h2>
                <p className="text-gray-600">
                  Discover amazing organic<sup className="text-[0.5em] leading-none">*</sup> products at unbeatable prices
                </p>
              </>
            )}
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
          className="sticky z-40 -mx-4 mb-8 border-b bg-white/95 px-4 py-3 backdrop-blur"
          style={{ top: headerOffset }}
        >
          {isLoadingCategories ? (
            <>
              <div className="md:hidden">
                <SelectSkeleton />
              </div>
              <div className="hidden md:flex flex-wrap gap-2">
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
              </div>
            </>
          ) : (
            <>
              <div className="md:hidden">
                <Select
                  value={selectedCategory ?? "all"}
                  onValueChange={(value) =>
                    onCategoryChange?.(value === "all" ? undefined : value)
                  }
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden md:flex flex-wrap gap-2">
                <Button
                  variant={!selectedCategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange?.(undefined)}
                  className={!selectedCategory ? "bg-[#168e2d] hover:bg-[#137a26] shadow-md" : "hover:border-[#168e2d]"}
                >
                  All Products
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => onCategoryChange?.(category.id)}
                    className={selectedCategory === category.id ? "bg-[#168e2d] hover:bg-[#137a26] shadow-md" : "hover:border-[#168e2d]"}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>

        {isLoading ? (
          <div className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
              : "grid-cols-1"
          }`}>
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                : "grid-cols-1"
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="border-[#168e2d] text-[#168e2d] hover:bg-[#168e2d] hover:text-white shadow-md"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More Products'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {!isLoading && filteredProducts.length === 0 && (
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
