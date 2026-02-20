"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Slide {
  id: string
  image: string
  title: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
  badge?: string
  backgroundColor?: string
}

interface HeroSlidesProps {
  slides: Slide[]
}

export function HeroSlides({ slides }: HeroSlidesProps) {
  // Get the second slide (index 1) - if not available, fallback to first slide
  const heroData = slides && slides.length > 1 ? slides[1] : slides?.[0]

  if (!heroData) {
    return null
  }

  return (
    <div className="relative -z-10">
      <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] overflow-hidden bg-gray-900">
        {/* Background Image */}
        <Image
          src={heroData.image}
          alt={heroData.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60 z-20" />

        {/* Content - Centered */}
        <div className="absolute inset-0 flex z-30">
          <div className="container mx-auto px-4 mt-6 md:mt-14">
            <div className="max-w-3xl mx-auto text-center">
              {heroData.badge && (
                <Badge className="mb-4 bg-[#168e2d] hover:bg-[#137a26] text-white border-0 text-sm sm:text-base px-4 py-1.5 shadow-lg">
                  {heroData.badge}
                </Badge>
              )}

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight drop-shadow-lg">
                {heroData.title}
              </h1>

              {heroData.subtitle && (
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 mb-6 sm:mb-8 leading-relaxed drop-shadow-md px-4">
                  {heroData.subtitle}
                </p>
              )}

              {heroData.buttonText && heroData.buttonLink && (
                <Button
                  size="lg"
                  className="bg-[#168e2d] hover:bg-[#137a26] text-white border-0 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                  onClick={() => window.location.href = heroData.buttonLink!}
                >
                  {heroData.buttonText}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop gradient that fades down */}
      <div
        className="absolute w-full h-32 sm:h-40 md:h-48 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${heroData.backgroundColor || 'rgba(46, 125, 50, 0.15)'}, transparent)`,
          top: '300px',
        }}
      />
    </div>
  )
}
