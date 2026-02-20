"use client"

import { HeroSlides } from "@/components/HeroSlides"
import { CategoryProducts } from "@/components/CategoryProducts"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

const heroSlides = [
  {
    id: "2",
    image: "https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg",
    title: "100% Organic* Products",
    subtitle: "Supporting rural communities through sustainable agriculture and quality organic* farming",
    badge: "Certified Organic*",
    backgroundColor: "rgba(46, 125, 50, 0.15)"
  }
]

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)

  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  const handleCategoryChange = (categoryId: string | undefined) => {
    setSelectedCategory(categoryId)
    
    // Update URL query parameter
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="min-h-screen">
      <HeroSlides slides={heroSlides} />
      <CategoryProducts
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <HeroSlides slides={heroSlides} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}

