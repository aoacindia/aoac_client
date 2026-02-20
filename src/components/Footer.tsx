"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Shield,
  Leaf,
  Award,
  Heart
} from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: "About AOAC", href: "/about" },
      { name: "Our Story", href: "/about#story" },
      { name: "Sustainability", href: "/about#sustainability" },
      { name: "Certifications", href: "/about#certifications" },
    ],
    customer: [
      { name: "Contact Us", href: "/contact" },
      { name: "Track Your Order", href: "/track-order" },
      { name: "Shipping Information", href: "/shipping" },
      { name: "Returns & Refunds", href: "/returns" },
    ],
    policies: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Payment Methods", href: "/payment" },
      { name: "FAQ", href: "/faq" },
    ],
  }

  const features = [
    {
      icon: <Leaf className="h-6 w-6" />,
      title: "100% Organic",
      description: "Certified organic products*"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Premium Quality",
      description: "Handpicked products"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Payment",
      description: "100% secure transactions"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Sustainable",
      description: "Eco-friendly farming"
    }
  ]

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {/* Features Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 text-center group">
                <div className="text-[#168e2d] group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4 group">
              <div className="relative w-14 h-14 flex-shrink-0">
                <Image
                  src="/logo/logo.png"
                  alt="AOAC Logo"
                  fill
                  className="object-contain group-hover:scale-105 transition-transform"
                  sizes="56px"
                />
              </div>
              <div className="h-12 w-px bg-gray-700 flex-shrink-0"></div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-[#168e2d] leading-tight">
                  Allahabad Organic
                </span>
                <span className="text-sm text-gray-400 leading-tight">Agricultural Company</span>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              Promoting sustainable rural development in Patna, Bihar, through organic<sup className="text-[0.5em] leading-none">*</sup> farming.
              We&apos;re committed to creating rural employment opportunities, especially for women,
              while delivering high-quality organic<sup className="text-[0.5em] leading-none">*</sup> products using integrated farming approaches.
            </p>

            {/* Newsletter Signup */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#168e2d]" />
                Subscribe to our newsletter
              </h3>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-[#168e2d] focus:ring-[#168e2d]"
                />
                <Button className="bg-[#168e2d] hover:bg-[#137a26] text-white border-0 whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Get updates on new products and special offers</p>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#168e2d] hover:bg-gray-800 transition-colors">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#168e2d] hover:bg-gray-800 transition-colors">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#168e2d] hover:bg-gray-800 transition-colors">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#168e2d] hover:bg-gray-800 transition-colors">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">About Us</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#168e2d] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-[#168e2d] transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Customer Service</h3>
            <ul className="space-y-2">
              {footerLinks.customer.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#168e2d] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-[#168e2d] transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Policies</h3>
            <ul className="space-y-2">
              {footerLinks.policies.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#168e2d] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-[#168e2d] transition-colors"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="border-t border-gray-800 bg-gray-900/50">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-3 group">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#168e2d]/10 flex items-center justify-center group-hover:bg-[#168e2d]/20 transition-colors">
                <Mail className="h-5 w-5 text-[#168e2d]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <a href="mailto:support@aoac.in" className="text-gray-300 hover:text-[#168e2d] transition-colors">
                  support@aoac.in
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#168e2d]/10 flex items-center justify-center group-hover:bg-[#168e2d]/20 transition-colors">
                <Phone className="h-5 w-5 text-[#168e2d]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <a href="tel:+918252945156" className="text-gray-300 hover:text-[#168e2d] transition-colors">
                  (+91) 8252945156
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#168e2d]/10 flex items-center justify-center group-hover:bg-[#168e2d]/20 transition-colors">
                <MapPin className="h-5 w-5 text-[#168e2d]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <span className="text-gray-300">Patna, Bihar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 gap-3">
            <div className="flex items-center gap-2">
              <span>&copy; {currentYear} Allahabad Organic Agricultural Company Private Limited.</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for sustainable farming
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/privacy" className="hover:text-[#168e2d] transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-[#168e2d] transition-colors">
                Terms
              </Link>
              <span>•</span>
              <div className="flex items-center gap-1 text-[#168e2d]">
                <Award className="h-4 w-4" />
                <span className="text-xs">Certified Organic<sup className="text-[0.4em] leading-none">*</sup></span>
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-800">
            <p className="text-[0.65rem] text-gray-500 text-center">
              <sup className="text-[0.7em] leading-none">*</sup>T & C applied
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
