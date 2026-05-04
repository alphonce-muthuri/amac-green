"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { User, Package, Settings, LogOut, Home, Leaf } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname() || ""

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      const role = user.user_metadata?.role
      if (role === "vendor") { router.push("/vendor"); return }
      if (role === "professional") { router.push("/professional"); return }
      if (role === "admin") { router.push("/admin"); return }
      if (role === "delivery") { router.push("/delivery"); return }
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-72 rounded-2xl" />
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
    if (href === "/dashboard") return pathname === "/dashboard"
    if (href === "/dashboard/profile") {
      return (
        pathname === "/dashboard/profile" ||
        (pathname.startsWith("/dashboard/profile/") &&
          !pathname.startsWith("/dashboard/profile/energy"))
      )
    }
    if (href === "/dashboard/profile/energy") return pathname.startsWith("/dashboard/profile/energy")
    return pathname.startsWith(href)
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {/* Header: logo + toggle */}
        <SidebarHeader className="bg-emerald-900 p-0">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="group-data-[collapsible=icon]:hidden">
              <div className="w-24 h-10 flex items-center overflow-hidden">
                <Image
                  src="/images/logo/AMAC-Green-logo.png"
                  alt="AMAC Green logo"
                  width={320}
                  height={160}
                  className="h-20 w-auto object-contain brightness-0 invert"
                />
              </div>
            </Link>
            <SidebarTrigger className="text-white/70 hover:text-white hover:bg-emerald-800" />
          </div>
        </SidebarHeader>

        {/* Navigation */}
        <SidebarContent className="bg-gray-50">
          <SidebarGroup className="pr-4 py-4">
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0.5">
                {navigation.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={cn(
                          "h-9 rounded-md font-semibold transition-all duration-200",
                          active
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200 group-data-[collapsible=icon]:rounded-md rounded-l-none rounded-r-md"
                            : "text-gray-600 hover:bg-gray-200/60 hover:text-gray-900"
                        )}
                      >
                        <Link href={item.href}>
                          <item.icon
                            className={cn(
                              "h-5 w-5",
                              active ? "text-emerald-700" : "text-gray-400"
                            )}
                          />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer: compact user button */}
        <SidebarFooter className="bg-gray-50 border-t p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-gray-200/60 transition-colors group-data-[collapsible=icon]:justify-center">
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-[11px] font-bold text-emerald-700 shrink-0 select-none">
                  {(user?.user_metadata?.first_name?.[0] || "") + (user?.user_metadata?.last_name?.[0] || "") || <User className="h-3.5 w-3.5" />}
                </div>
                {/* Name + role */}
                <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                  <p className="text-xs font-semibold text-gray-800 truncate leading-none mb-0.5">
                    {user?.user_metadata?.first_name || "Customer"}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-none">Customer Account</p>
                </div>
                {/* Sign out icon */}
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="group-data-[collapsible=icon]:hidden text-gray-400 hover:text-red-500 transition-colors shrink-0 p-0.5 rounded"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Mobile-only top bar to open the sidebar when it's closed */}
        <header className="flex h-12 items-center gap-3 border-b bg-white px-3 md:hidden">
          <SidebarTrigger />
          <span className="text-sm font-semibold text-emerald-900">AMAC Green</span>
        </header>

        <main className="flex-1 min-h-screen bg-gray-50">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
