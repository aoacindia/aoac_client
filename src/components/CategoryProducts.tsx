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
  const [headerHeight, setHeaderHeight] = useState(0)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)

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

  // Track header visibility and height
  useEffect(() => {
    const header = document.querySelector("header") as HTMLElement | null
    if (!header) return

    const updateHeaderInfo = () => {
      const rect = header.getBoundingClientRect()
      // Header is visible if it's at the top or slightly above (within its height)
      // When header is hidden, it's translated up by its full height
      const isVisible = rect.top >= -rect.height && rect.top <= 10
      
      // Calculate the bottom position of the header (including mobile search bar if visible)
      let headerBottom = rect.bottom
      
      // Check if mobile search bar exists and is visible
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

    // Check header visibility on scroll
    const handleScroll = () => {
      requestAnimationFrame(updateHeaderInfo)
    }

    // Initial update
    updateHeaderInfo()

    // Use ResizeObserver to track header size changes
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


  // Calculate sticky top position based on header visibility
  const stickyTop = isHeaderVisible ? headerHeight : 0

  return (
    <div className="max-w-[1400px] mx-auto relative -mt-12 sm:-mt-16 bg-white rounded-t-3xl shadow-xl">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            {isLoading && selectedCategory ? (
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

        {/* Category List - Independent Sticky */}
        <div
          className="sticky z-40 w-full border-b bg-white/95 backdrop-blur shadow-sm transition-all duration-300 px-4 mb-2"
          style={{ top: `${stickyTop}px` }}
        >
          <div className="py-3">
            {isLoadingCategories ? (
              <>
                <div className="md:hidden">
                  <Skeleton className="h-10 w-full rounded" />
                </div>
                <div className="hidden md:flex flex-wrap gap-2">
                  <Skeleton className="h-9 w-24 rounded" />
                  <Skeleton className="h-9 w-24 rounded" />
                  <Skeleton className="h-9 w-24 rounded" />
                  <Skeleton className="h-9 w-24 rounded" />
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
