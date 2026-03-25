"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Hammer, 
  Target, 
  Award, 
  Settings, 
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/professional", icon: LayoutDashboard },
  { name: "Available Jobs", href: "/professional/jobs", icon: Hammer },
  { name: "My Bids", href: "/professional/bids", icon: Target },
  { name: "Assigned Jobs", href: "/professional/assigned", icon: Award },
  { name: "Settings", href: "/professional/settings", icon: Settings },
]

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname() || ""

  const getApplicationStatus = useCallback(async (user: any) => {
    try {
      const { data } = await supabase
        .from("professional_applications")
        .select("*")
        .eq("user_id", user.id)
        .single()

      setApplicationStatus(data)
    } catch (error) {
      console.error("Error fetching application:", error)
    }
  }, [])

  const checkUser = useCallback(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Auth error:", error)
        router.push("/login")
        return
      }

      if (!user) {
        router.push("/login")
        return
      }

      const userRole = user.user_metadata?.role
      if (userRole !== "professional") {
        switch (userRole) {
          case "admin":
            router.push("/admin")
            break
          case "vendor":
            router.push("/vendor")
            break
          case "customer":
          default:
            router.push("/dashboard")
            break
        }
        return
      }

      setUser(user)
      await getApplicationStatus(user)
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router, getApplicationStatus])

  useEffect(() => {
    void checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login")
      } else if (event === "SIGNED_IN" && session) {
        await checkUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [router, checkUser])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isApproved = applicationStatus?.status === "approved"

  const navActive = (href: string) => {
    if (href === "/professional") return pathname === "/professional"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-full bg-white border-r border-teal-200 shadow-sm flex flex-col">
          <div className="bg-teal-900 px-6 py-5 flex flex-col relative min-h-[160px]">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-12 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/logo/AMAC-Green-logo.png"
                  alt="AMAC Green logo"
                  width={160}
                  height={80}
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
              </div>
            </Link>
            <div className="h-px bg-teal-400/70 mb-4" />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-6 right-4 text-white hover:bg-white/20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-50 border border-teal-200 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-teal-800" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate tracking-tight">
                  {user?.user_metadata?.contact_person || "Professional"}
                </p>
                <p className="text-xs text-teal-100">Professional Portal</p>
                <Badge 
                  className={cn(
                    "mt-1 text-xs font-semibold border",
                    isApproved 
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-50" 
                      : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-50"
                  )}
                >
                  {isApproved ? "Active" : "Pending"}
                </Badge>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const active = navActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 tracking-tight",
                    active
                      ? "bg-teal-100 text-teal-950 border border-teal-200"
                      : "text-gray-700 hover:bg-teal-50"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      active ? "text-teal-800" : "text-gray-400 group-hover:text-teal-600"
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-teal-200">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start gap-3 border border-red-200 text-red-700 hover:bg-red-50 font-semibold"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 lg:hidden bg-white border-b border-teal-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-teal-50"
            >
              <Menu className="h-6 w-6 text-teal-800" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-700 border border-teal-800 rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-base font-bold text-teal-950 tracking-tight">Professional</h1>
            </div>
            <div className="w-10" />
          </div>
        </header>

        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
