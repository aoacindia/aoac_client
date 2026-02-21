"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { logoutAction } from "@/lib/actions/auth"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Leaf,
  Package,
  LogIn,
  MapPin
} from "lucide-react"

interface SearchSuggestion {
  id: string
  name: string
  code: string
  price: number
  mainImage?: string
}

export function Header() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data.success) {
          setIsLoggedIn(data.isLoggedIn)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsLoggedIn(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])


  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length >= 3) {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&autocomplete=true&limit=5`)
          const data = await res.json()
          if (data.success) {
            setSuggestions(data.data)
            setShowSuggestions(true)
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      // Always show header when mobile menu is open
      if (isMobileMenuOpen) {
        setIsHeaderVisible(true)
        return
      }

      const currentScrollY = window.scrollY

      // Show header when scrolling up (even a little bit)
      if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true)
      }
      // Hide header when scrolling down
      else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsHeaderVisible(false)
      }
      // Always show header at the top
      else if (currentScrollY <= 10) {
        setIsHeaderVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isMobileMenuOpen])

  // Keep header visible when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsHeaderVisible(true)
    }
  }, [isMobileMenuOpen])

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (searchQuery.trim().length >= 3) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
      setShowSuggestions(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoggedIn(false)
      const result = await logoutAction()
      if (result?.success) {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Error logging out:', error)
      // Still redirect on error
      setIsLoggedIn(false)
      router.push('/')
      router.refresh()
    }
  }

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-sm transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-2 text-sm text-gray-600 border-b">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-1">
              <Leaf className="h-4 w-4 text-[#168e2d]" />
              <span className="hidden sm:inline">100% Organic<sup className="text-[0.5em] leading-none">*</sup> Products</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/about" className="hover:text-[#168e2d] transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-[#168e2d] transition-colors">Contact</Link>
            <Link href="/track-order" className="hover:text-[#168e2d] transition-colors hidden sm:inline">Track Order</Link>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src="/logo/logo.png"
                alt="AOAC Logo"
                fill
                className="object-contain group-hover:scale-105 transition-transform"
                sizes="48px"
              />
            </div>
            <div className="h-10 w-px bg-gray-300 flex-shrink-0"></div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-[#168e2d] leading-tight">Allahabad Organic</span>
              <span className="text-sm text-gray-700 leading-tight">Agricultural Company</span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for organic* products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="pl-10 pr-4 h-12 border-gray-300 focus:border-[#168e2d] focus:ring-[#168e2d] rounded-full"
              />
              {searchQuery.length >= 3 && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {suggestions.map((suggestion) => (
                  <Link
                    key={suggestion.id}
                    href={`/product/${suggestion.id}`}
                    onClick={() => {
                      setShowSuggestions(false)
                      setSearchQuery('')
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded">
                      {suggestion.mainImage ? (
                        <Image
                          src={suggestion.mainImage}
                          alt={suggestion.name}
                          fill
                          className="object-cover rounded"
                          sizes="48px"
                          unoptimized={suggestion.mainImage.includes('admin.aoac.in')}
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{suggestion.name}</p>
                      <p className="text-xs text-gray-500">Code: {suggestion.code}</p>
                    </div>
                    <div className="text-sm font-semibold text-[#168e2d]">
                      ₹{suggestion.price.toFixed(2)}
                    </div>
                  </Link>
                ))}
                <button
                  onClick={handleSearch}
                  className="w-full p-3 text-center text-sm text-[#168e2d] hover:bg-gray-50 font-medium"
                >
                  View all results for &quot;{searchQuery}&quot;
                </button>
              </div>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* User Account */}
            {isCheckingAuth ? (
              <div className="hidden md:flex items-center space-x-1">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-16 rounded hidden lg:block" />
              </div>
            ) : (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="hidden md:flex items-center space-x-1 hover:text-[#168e2d] bg-transparent">
                      <User className="h-5 w-5" />
                      <span className="hidden lg:inline">Account</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-48 p-2">
                        {isLoggedIn ? (
                          <>
                            <NavigationMenuLink asChild>
                              <Link href="/profile" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                                <div className="text-sm font-medium leading-none">My Profile</div>
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link href="/address" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                                <div className="text-sm font-medium leading-none">My Addresses</div>
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link href="/orders" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                                <div className="text-sm font-medium leading-none">My Orders</div>
                              </Link>
                            </NavigationMenuLink>
                            <div className="border-t my-1"></div>
                            <NavigationMenuLink asChild>
                              <button 
                                onClick={handleLogout}
                                className="w-full text-left select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-red-600"
                              >
                                <div className="text-sm font-medium leading-none">Logout</div>
                              </button>
                            </NavigationMenuLink>
                          </>
                        ) : (
                          <NavigationMenuLink asChild>
                            <Link href="/auth/login" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <div className="text-sm font-medium leading-none flex items-center gap-2">
                                <LogIn className="h-4 w-4" />
                                Login
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        )}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            )}

            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="sm"
                className="bg-[#168e2d] text-white hover:bg-[#137a26] hover:text-white"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar - Always Visible on Mobile */}
        <div className="md:hidden border-t bg-white py-3 px-4" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for organic* products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="pl-10 pr-4 h-12 border-gray-300 focus:border-[#168e2d] focus:ring-[#168e2d] rounded-full"
            />
            {searchQuery.length >= 3 && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Mobile Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-4 right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {suggestions.map((suggestion) => (
                <Link
                  key={suggestion.id}
                  href={`/product/${suggestion.id}`}
                  onClick={() => {
                    setShowSuggestions(false)
                    setSearchQuery('')
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                >
                  <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded">
                    {suggestion.mainImage ? (
                      <Image
                        src={suggestion.mainImage}
                        alt={suggestion.name}
                        fill
                        className="object-cover rounded"
                        sizes="48px"
                        unoptimized={suggestion.mainImage.includes('admin.aoac.in')}
                      />
                    ) : (
                      <Package className="h-6 w-6 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{suggestion.name}</p>
                    <p className="text-xs text-gray-500">Code: {suggestion.code}</p>
                  </div>
                  <div className="text-sm font-semibold text-[#168e2d]">
                    ₹{suggestion.price.toFixed(2)}
                  </div>
                </Link>
              ))}
              <button
                onClick={handleSearch}
                className="w-full p-3 text-center text-sm text-[#168e2d] hover:bg-gray-50 font-medium"
              >
                View all results for &quot;{searchQuery}&quot;
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white py-4">
            <div className="space-y-4">
              {/* Mobile Navigation */}
              <div className="px-4 space-y-2">
                {isCheckingAuth ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded" />
                    <Skeleton className="h-12 w-full rounded" />
                  </div>
                ) : isLoggedIn ? (
                  <>
                    <Link
                      href="/profile"
                      className="flex items-center py-3 text-gray-700 hover:text-[#168e2d] font-medium transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Link>
                    <Link
                      href="/address"
                      className="flex items-center py-3 text-gray-700 hover:text-[#168e2d] font-medium transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      My Addresses
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center py-3 text-gray-700 hover:text-[#168e2d] font-medium transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      className="flex items-center py-3 text-red-600 hover:text-red-700 font-medium transition-colors w-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleLogout()
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center py-3 text-gray-700 hover:text-[#168e2d] font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
