"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ProductCard } from "@/components/ProductCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Search as SearchIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

export function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(query)

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 3) {
        setProducts([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=50`)
        const data = await res.json()

        if (data.success) {
          setProducts(data.data)
        }
      } catch (error) {
        console.error('Error fetching search results:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query])

  const handleSearch = () => {
    if (searchInput.trim().length >= 3) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Search Results
          </h1>

          {/* Search Input */}
          <div className="max-w-2xl">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-10 h-12 text-base"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <Button
                onClick={handleSearch}
                className="bg-[#168e2d] hover:bg-[#137a26] h-12 px-8"
              >
                Search
              </Button>
            </div>
          </div>

          {query && (
            <div className="mt-4 text-gray-600">
              {!isLoading && (
                <p>
                  {products.length > 0 ? (
                    <>
                      Found <span className="font-semibold text-gray-900">{products.length}</span> results for{' '}
                      <span className="font-semibold text-gray-900">&quot;{query}&quot;</span>
                    </>
                  ) : (
                    <>No results found for <span className="font-semibold text-gray-900">&quot;{query}&quot;</span></>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {query.length < 3 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <SearchIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start searching
              </h3>
              <p className="text-gray-600">
                Enter at least 3 characters to search for products
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <ProductCard product={product} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <SearchIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                We couldn&apos;t find any products matching &quot;{query}&quot;. Try different keywords or browse our categories.
              </p>
              <Link href="/">
                <Button className="bg-[#168e2d] hover:bg-[#137a26]">
                  Browse All Products
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
