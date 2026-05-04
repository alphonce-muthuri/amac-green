"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, ShoppingCart, User, LogOut, X, ChevronDown, LayoutDashboard, Package } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Packages", href: "/packages" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { getItemCount } = useCart()
  const { user, loading, signOut } = useAuth()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isDarkHeroPage = pathname === "/"
  const onDarkHero = isDarkHeroPage && !scrolled
  const useLightHeaderStyles = !onDarkHero

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      // Handle sign out error silently
    }
  }

  const getUserDashboardPath = () => {
    const role = user?.user_metadata?.role

    switch (role) {
      case "vendor":
        return "/vendor"
      case "professional":
        return "/professional"
      case "delivery":
        return "/delivery"
      case "admin":
      case "super_admin":
        return "/admin"
      default:
        return "/dashboard"
    }
  }

  const getUserInitials = () => {
    if (!user) return "U"

    const firstName = user.user_metadata?.first_name
    const lastName = user.user_metadata?.last_name

    if (firstName || lastName) {
      return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
    }

    return user.email?.[0]?.toUpperCase() || "U"
  }

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          onDarkHero
            ? "bg-transparent border-b border-transparent shadow-none"
            : `bg-white/80 backdrop-blur-xl border-b border-gray-200/50 ${scrolled ? "shadow-lg" : "shadow-none"}`
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo Section */}
            <Link 
              href="/" 
              className="group relative z-10 transition-all duration-300 hover:scale-105"
            >
              <Image
                src="/images/logo/AMAC-Green-logo.png"
                alt="AMAC Green & Renewable Energy logo"
                width={120}
                height={60}
                priority
                className={`h-12 w-auto object-contain transition-all duration-300 ${!useLightHeaderStyles ? "brightness-0 invert" : ""}`}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${
                    isActive(item.href) ? "font-semibold" : "font-medium"
                  } ${
                    useLightHeaderStyles
                      ? isActive(item.href)
                        ? "text-emerald-600"
                        : "text-gray-600 hover:text-emerald-600"
                      : isActive(item.href)
                        ? "text-white"
                        : "text-white/80 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Section - Cart & Auth */}
            <div className="flex items-center space-x-4">
              {/* Shopping Cart */}
              <Link 
                href="/cart" 
                className="relative group"
                aria-label="View cart"
              >
                <div className="relative p-2.5 rounded-xl transition-all duration-300 group-hover:scale-105 bg-transparent">
                  <ShoppingCart className={`w-5 h-5 transition-colors ${useLightHeaderStyles ? "text-gray-700 group-hover:text-emerald-600" : "text-white group-hover:text-white"}`} />
                  {getItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                      {getItemCount()}
                    </span>
                  )}
                </div>
              </Link>

              {/* Auth Buttons — avatar always visible when logged in, Login/Register only on desktop */}
              <div className="flex items-center space-x-3">
                {loading ? (
                  <div className="h-9 w-9 rounded-full animate-pulse bg-gray-200/60" />
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`flex items-center gap-2 rounded-full pl-1 pr-3 py-1 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          useLightHeaderStyles
                            ? "hover:bg-gray-100 text-gray-700"
                            : "hover:bg-white/10 text-white"
                        }`}
                      >
                        <Avatar className="h-8 w-8 ring-2 ring-emerald-400/60">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback className="text-xs font-bold bg-emerald-700 text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden xl:block max-w-[110px] truncate text-sm font-medium">
                          {user.user_metadata?.first_name || user.email?.split("@")[0] || "Account"}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-0 overflow-hidden">
                      {/* User info header */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-emerald-50 to-white border-b border-gray-100">
                        <Avatar className="h-10 w-10 ring-2 ring-emerald-200">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback className="text-sm font-bold bg-emerald-700 text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {user.user_metadata?.first_name
                              ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`.trim()
                              : "Account"}
                          </span>
                          <span className="text-[11px] text-gray-400 truncate">{user.email}</span>
                        </div>
                      </div>
                      <div className="py-1">
                        <DropdownMenuItem asChild>
                          <Link href={getUserDashboardPath()} className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer">
                            <LayoutDashboard className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm">Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/orders" className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer">
                            <Package className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm">My Orders</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer">
                            <User className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm">Profile</span>
                          </Link>
                        </DropdownMenuItem>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="py-1">
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm">Sign Out</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="hidden lg:flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={useLightHeaderStyles ? "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50" : "text-white/90 hover:text-white hover:bg-white/10"}
                      asChild
                    >
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button
                      size="sm"
                      className={useLightHeaderStyles ? "bg-emerald-800 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-8 " : "bg-white text-gray-900 hover:bg-white/90 shadow-md border border-white/20 rounded-full px-8 "}
                      asChild
                    >
                      <Link href="/register">Get started</Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`lg:hidden p-2.5 rounded-xl ${useLightHeaderStyles ? "hover:bg-emerald-50" : "hover:bg-white/10"}`}
                  >
                    {isOpen ? (
                      <X className={`h-6 w-6 ${useLightHeaderStyles ? "text-gray-700" : "text-white"}`} />
                    ) : (
                      <Menu className={`h-6 w-6 ${useLightHeaderStyles ? "text-gray-700" : "text-white"}`} />
                    )}
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-full sm:w-96 p-0 bg-gradient-to-br from-white to-gray-50"
                >
                  {/* Mobile Menu Header */}
                  <div className="p-6 border-b border-gray-200 bg-emerald-700 flex justify-center">
                    <Image
                      src="/images/logo/AMAC-Green-logo.png"
                      alt="AMAC Green & Renewable Energy logo"
                      width={100}
                      height={50}
                      className="h-10 w-auto object-contain"
                    />
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex flex-col p-6 space-y-8">
                    <nav className="flex flex-col space-y-2">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 ${
                            isActive(item.href)
                              ? "font-bold tracking-tight text-emerald-600"
                              : "font-medium text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-base">{item.name}</span>
                          {isActive(item.href) && (
                            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                          )}
                        </Link>
                      ))}
                    </nav>

                    {/* Mobile Auth Section */}
                    <div className="flex flex-col space-y-3 pt-6 border-t border-gray-200">
                      {loading ? (
                        <div className="h-12 w-full rounded-xl animate-pulse bg-gray-200/60" />
                      ) : user ? (
                        <>
                          {/* Mobile user info card */}
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-1">
                            <Avatar className="h-10 w-10 ring-2 ring-emerald-300">
                              <AvatarImage src={user.user_metadata?.avatar_url} />
                              <AvatarFallback className="text-sm font-bold bg-emerald-700 text-white">
                                {getUserInitials()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-semibold text-gray-900 truncate">
                                {user.user_metadata?.first_name
                                  ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`.trim()
                                  : "Account"}
                              </span>
                              <span className="text-[11px] text-gray-400 truncate">{user.email}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full justify-start border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                            asChild
                            onClick={() => setIsOpen(false)}
                          >
                            <Link href={getUserDashboardPath()}>
                              <LayoutDashboard className="h-4 w-4 mr-3 text-emerald-600" />
                              Dashboard
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                            asChild
                            onClick={() => setIsOpen(false)}
                          >
                            <Link href="/dashboard/orders">
                              <Package className="h-4 w-4 mr-3 text-emerald-600" />
                              My Orders
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start border border-gray-200 text-red-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                            onClick={() => { handleSignOut(); setIsOpen(false) }}
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sign Out
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            className="w-full border-2 hover:border-emerald-300 hover:bg-emerald-50"
                            asChild 
                            onClick={() => setIsOpen(false)}
                          >
                            <Link href="/login">
                              <User className="h-5 w-5 mr-3" />
                              Login to Account
                            </Link>
                          </Button>
                          <Button 
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                            asChild 
                            onClick={() => setIsOpen(false)}
                          >
                            <Link href="/register">
                              Get Started Free
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Mobile Quick Links */}
                    <div className="pt-6 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Quick Links
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href="/products"
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300 text-center"
                        >
                          Browse Products
                        </Link>
                        <Link
                          href="/supplier/register"
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300 text-center"
                        >
                          Become Supplier
                        </Link>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      
      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-20"></div>
    </>
  )
}