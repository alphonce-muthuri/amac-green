"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  TrendingUp,
  DollarSign,
  Briefcase
} from "lucide-react"
import Link from "next/link"
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

  useEffect(() => {
    checkUser()

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
  }, [router])

  const checkUser = async () => {
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
  }

  const getApplicationStatus = async (user: any) => {
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
  }

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isApproved = applicationStatus?.status === "approved"

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile & Desktop */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-full bg-white border-r-2 border-emerald-200 shadow-2xl flex flex-col">
          {/* Header with gradient */}
          <div className="relative overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient-x"></div>
            
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">Professional</h2>
                    <p className="text-xs text-gray-600">Portal</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* User info card */}
              <div className="bg-white p-3 rounded-xl border-2 border-emerald-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {user?.user_metadata?.contact_person?.charAt(0) || "P"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user?.user_metadata?.contact_person || "Professional"}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {applicationStatus?.company_name || "Professional Account"}
                    </p>
                    <Badge 
                      className={cn(
                        "mt-1 text-xs",
                        isApproved 
                          ? "bg-green-100 text-green-700 border-green-300" 
                          : "bg-amber-100 text-amber-700 border-amber-300"
                      )}
                    >
                      {isApproved ? "Active" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = typeof window !== 'undefined' && window.location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                      isActive ? "text-white" : "text-emerald-600"
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer - Logout */}
          <div className="p-4 border-t-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start gap-3 border-2 border-emerald-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:border-red-300 hover:text-red-700 transition-all font-semibold"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-72">
        {/* Top mobile header */}
        <header className="sticky top-0 z-30 lg:hidden bg-white border-b-2 border-emerald-200 shadow-lg">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-emerald-100"
            >
              <Menu className="h-6 w-6 text-emerald-700" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-extrabold text-gray-900">Professional Portal</h1>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  )
}