"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { User, ShoppingCart, Package, Settings, LogOut, Home, Menu, X, TrendingUp, CreditCard, Bell, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname() || ""

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/login")
                return
            }
            setUser(user)
            setLoading(false)
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                router.push("/login")
            }
        })

        return () => subscription.unsubscribe()
    }, [router])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/")
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        )
    }

    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "Orders", href: "/dashboard/orders", icon: Package },
        { name: "Installations", href: "/dashboard/installations", icon: Settings },
        { name: "Profile", href: "/dashboard/profile", icon: User },
        ...(process.env.NEXT_PUBLIC_ENABLE_DEMAND_PROFILE === "true"
            ? [{ name: "Energy programme", href: "/dashboard/profile/energy", icon: Leaf }]
            : []),
    ]

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard"
        }
        if (href === "/dashboard/profile") {
            return pathname === "/dashboard/profile" || (pathname.startsWith("/dashboard/profile/") && !pathname.startsWith("/dashboard/profile/energy"))
        }
        if (href === "/dashboard/profile/energy") {
            return pathname.startsWith("/dashboard/profile/energy")
        }
        return pathname.startsWith(href)
    }

        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
            {/* Mobile sidebar overlay */}
            <div className={cn(
                "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
                sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
                    onClick={() => setSidebarOpen(false)} 
                />
                <div className={cn(
                    "relative flex w-72 flex-col bg-white shadow-2xl transition-transform duration-300",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    {/* Mobile Sidebar Header */}
                    <div className="bg-emerald-900 px-6 py-5 flex flex-col relative min-h-[190px]">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSidebarOpen(false)}
                            className="absolute top-6 right-6 text-white hover:bg-white/20"
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        <Link
                            href="/"
                            onClick={() => setSidebarOpen(false)}
                            className="flex-1 flex items-center justify-left"
                        >
                            <div className="w-28 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
                                <Image
                                    src="/images/logo/AMAC-Green-logo.png"
                                    alt="AMAC Green logo"
                                    width={320}
                                    height={160}
                                    className="h-24 w-auto object-contain brightness-0 invert"
                                />
                            </div>
                        </Link>

                        {/* Separator between brand and user */}
                        <div className="h-px bg-emerald-400/70 mb-4" />

                        {/* User Info in Mobile */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-white to-emerald-100 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-emerald-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">
                                    {user?.user_metadata?.first_name || "Customer"}
                                </p>
                                <p className="text-xs text-emerald-100">Customer Account</p>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="flex-1 pr-4 py-6 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "group w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200",
                                        active
                                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-l-none rounded-r-full"
                                            : "text-gray-700 hover:bg-emerald-50"
                                    )}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className={cn("h-5 w-5", active ? "text-emerald-700" : "text-gray-400")} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Mobile Sign Out */}
                    <div className="border-t p-4">
                        <Button
                            variant="outline"
                            className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            onClick={handleSignOut}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
                <div className="flex flex-col flex-grow bg-white border-r-2 border-gray-200 shadow-xl">
                    {/* Desktop Header */}
                    <div className="bg-emerald-900 px-6 py-5 flex flex-col relative min-h-[190px]">
                        <Link href="/" className="flex-1 flex items-center justify-left">
                            <div className="w-28 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
                                <Image
                                    src="/images/logo/AMAC-Green-logo.png"
                                    alt="AMAC Green logo"
                                    width={320}
                                    height={160}
                                    className="h-24 w-auto object-contain brightness-0 invert"
                                />
                            </div>
                        </Link>

                        {/* Separator between brand and user */}
                        <div className="h-px bg-emerald-400/70 mb-4" />

                        {/* User Info */}
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-white to-emerald-100 rounded-full flex items-center justify-center">
                                <User className="h-7 w-7 text-emerald-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">
                                    {user?.user_metadata?.first_name || "Customer"}
                                </p>
                                <p className="text-xs text-emerald-100">Customer Account</p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="flex-1 pr-4 py-6 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "group w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200",
                                        active
                                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-l-none rounded-r-full"
                                            : "text-gray-700 hover:bg-emerald-50"
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5", active ? "text-emerald-700" : "text-gray-400 group-hover:text-emerald-500")} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Desktop Sign Out */}
                    <div className="border-t p-4">
                        <Button
                            variant="outline"
                                className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold"
                            onClick={handleSignOut}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>

                {/* Main content */}
            <div className="lg:pl-72">
                {/* Mobile header */}
                <div className="sticky top-0 z-40 flex h-16 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200 lg:hidden">
                    <Button
                        variant="ghost"
                        className="px-4"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                    <div className="flex flex-1 items-center justify-center px-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                                <Image
                                    src="/images/logo/AMAC-Green-logo.png"
                                    alt="AMAC Green logo"
                                    width={160}
                                    height={80}
                                    className="h-10 w-auto object-contain brightness-0 invert"
                                />
                            </div>
                            <span className="text-base font-bold bg-gradient-to-r from-green-500 via-emerald-800 to-emerald-900 bg-clip-text text-transparent">
                                AMAC Green
                            </span>
                        </Link>
                    </div>
                    <Button
                        variant="ghost"
                        className="px-4"
                        onClick={handleSignOut}
                    >
                        <LogOut className="h-5 w-5 text-gray-600" />
                        <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Sign Out</span>
                    </Button>
                </div>

                {/* Page content */}
                <main className="flex-1 min-h-screen">
                    <div className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}