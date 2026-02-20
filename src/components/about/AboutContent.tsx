"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Leaf,
  Users,
  Target,
  Heart,
  Award,
  Globe,
  Sprout,
  Factory,
  Shield,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"

export function AboutContent() {
  const values = [
    {
      icon: <Leaf className="h-8 w-8" />,
      title: "100% Organic*",
      description: "We are committed to organic* farming practices that protect the environment and promote sustainable agriculture."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community First",
      description: "Creating employment opportunities for rural communities, with a special focus on empowering women."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Quality Assurance",
      description: "Every product undergoes rigorous quality checks to ensure we deliver only the best to our customers."
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Sustainable Practices",
      description: "We employ integrated farming approaches that maintain ecological balance and promote biodiversity."
    }
  ]

  const products = [
    {
      name: "Sushi Rice",
      description: "Premium quality rice perfect for Japanese cuisine, grown using traditional organic methods.",
      icon: <Sprout className="h-6 w-6" />
    },
    {
      name: "Miso",
      description: "Authentic fermented soybean paste, rich in probiotics and traditional Japanese flavor.",
      icon: <Factory className="h-6 w-6" />
    },
    {
      name: "Soy Sauce",
      description: "Naturally brewed soy sauce with no artificial additives, perfect for all your culinary needs.",
      icon: <Factory className="h-6 w-6" />
    },
    {
      name: "Moringa Powder",
      description: "Nutrient-rich superfood powder from organically* grown moringa leaves.",
      icon: <Leaf className="h-6 w-6" />
    }
  ]

  const milestones = [
    { year: "Founded", title: "Establishment", description: "AOAC was established in Patna to promote organic* farming" },
    { year: "Growing", title: "Community Impact", description: "Empowering hundreds of rural families, especially women farmers" },
    { year: "Today", title: "Sustainable Future", description: "Leading the way in integrated organic* farming practices" }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#168e2d] via-[#137a26] to-[#0f6b1f] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('/patterns/organic-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-lg px-6 py-2">
              About AOAC
            </Badge>
            <h1 className="text-lg md:text-xl font-bold mb-6 leading-tight">
              Allahabad Organic Agricultural<br />Company Private Limited
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Promoting sustainable rural development in Patna, Bihar, through organic<sup className="text-[0.5em] leading-none">*</sup> farming
              and integrated agricultural practices.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <Leaf className="h-5 w-5" />
                <span>100% Organic<sup className="text-[0.5em] leading-none">*</sup></span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <Users className="h-5 w-5" />
                <span>Community Driven</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <Globe className="h-5 w-5" />
                <span>Sustainable Future</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Target className="h-12 w-12 text-[#168e2d] mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <div className="w-24 h-1 bg-[#168e2d] mx-auto mb-6"></div>
            </div>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 md:p-12">
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-center">
                  At AOAC, we are dedicated to transforming rural agriculture through sustainable organic<sup className="text-[0.5em] leading-none">*</sup> farming practices.
                  Our mission is to create meaningful employment opportunities for rural communities, particularly women,
                  while promoting environmental conservation and delivering high-quality organic<sup className="text-[0.5em] leading-none">*</sup> products to consumers.
                  Through integrated farming approaches like Rice and Duck Farming, we demonstrate that profitability
                  and sustainability can go hand in hand.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16" id="sustainability">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <div className="w-24 h-1 bg-[#168e2d] mx-auto mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do, from farming to product delivery
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#168e2d]/10 text-[#168e2d] mb-4 group-hover:scale-110 transition-transform">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-white py-16" id="story">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-[#168e2d]/10 text-[#168e2d] border-[#168e2d]/20">
                  Our Journey
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Growing Together,<br />Sustainably
                </h2>
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p>
                    Allahabad Organic Agricultural Company Private Limited (AOAC) was born from a vision
                    to transform rural agriculture in Patna through organic<sup className="text-[0.5em] leading-none">*</sup> farming practices that benefit
                    both people and the planet.
                  </p>
                  <p>
                    We pioneered the use of Integrated Rice and Duck Farming in our region, demonstrating
                    that traditional wisdom combined with modern organic<sup className="text-[0.5em] leading-none">*</sup> practices can create sustainable
                    livelihoods while protecting our environment.
                  </p>
                  <p>
                    Today, we&apos;re proud to support hundreds of farming families, with a special focus on
                    empowering women in agriculture. Our products—from premium sushi rice to nutrient-rich
                    moringa powder—represent the dedication and hard work of our farming community.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <Card key={index} className="border-l-4 border-[#168e2d] shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-[#168e2d]/10 flex items-center justify-center text-[#168e2d] font-bold">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                        </div>
                        <div>
                          <Badge className="mb-2 bg-[#168e2d]/10 text-[#168e2d] border-0">
                            {milestone.year}
                          </Badge>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {milestone.title}
                          </h3>
                          <p className="text-gray-600">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Products
            </h2>
            <div className="w-24 h-1 bg-[#168e2d] mx-auto mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              High-quality organic<sup className="text-[0.5em] leading-none">*</sup> products crafted with care and dedication
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {products.map((product, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#168e2d]/10 text-[#168e2d] mb-4">
                    {product.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications Section */}
      <div className="bg-white py-16" id="certifications">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Award className="h-12 w-12 text-[#168e2d] mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Quality & Certifications
              </h2>
              <div className="w-24 h-1 bg-[#168e2d] mx-auto mb-6"></div>
            </div>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 md:p-12">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-[#168e2d] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Organic Certification
                      </h3>
                      <p className="text-gray-600">
                        All our products are certified organic<sup className="text-[0.5em] leading-none">*</sup>, meeting the highest standards for sustainable agriculture.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-[#168e2d] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Quality Assurance
                      </h3>
                      <p className="text-gray-600">
                        Every product undergoes rigorous quality testing to ensure we deliver excellence to your table.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-[#168e2d] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Sustainable Practices
                      </h3>
                      <p className="text-gray-600">
                        We follow integrated farming methods that protect biodiversity and promote ecological balance.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-[#168e2d] to-[#0f6b1f] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join Us in Our Journey
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Experience the difference of truly organic<sup className="text-[0.5em] leading-none">*</sup> products while supporting sustainable rural development
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#168e2d] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Shop Our Products
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
