"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  WarehouseIcon as Inventory,
  Truck,
  Store,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/vendor", icon: LayoutDashboard },
  { name: "Products", href: "/vendor/products", icon: Package },
  { name: "Packages", href: "/vendor/packages", icon: Layers },
  { name: "Add Product", href: "/vendor/products/add", icon: Plus },
  { name: "Orders", href: "/vendor/orders", icon: ShoppingCart },
  { name: "Deliveries", href: "/vendor/deliveries", icon: Truck },
  { name: "Inventory", href: "/vendor/inventory", icon: Inventory },
  { name: "Analytics", href: "/vendor/analytics", icon: BarChart3 },
  { name: "Settings", href: "/vendor/settings", icon: Settings },
]

export function VendorSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [applicationStatus, setApplicationStatus] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      setUser(user)

      const { data } = await supabase
        .from("vendor_applications")
        .select("status, company_name")
        .eq("user_id", user.id)
        .single()

      setApplicationStatus(data)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const isApproved = applicationStatus?.status === "approved"

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r-2 border-blue-200 shadow-2xl">
      {/* Header with gradient */}
      <div className="relative overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-gradient-x"></div>
        
        <div className="px-6 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Supplier</h2>
              <p className="text-xs text-gray-600">Portal</p>
            </div>
          </div>

          {/* User info card */}
          <div className="bg-white p-3 rounded-xl border-2 border-blue-200 shadow-sm">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10 border-2 border-blue-300">
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold">
                  {user?.user_metadata?.company_name
                    ? getInitials(user.user_metadata.company_name)
                    : getInitials(user?.email || "V")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.user_metadata?.company_name || "Your Company"}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user?.user_metadata?.contact_person || user?.email}
                </p>
                <Badge 
                  className={cn(
                    "mt-1 text-xs",
                    isApproved 
                      ? "bg-green-100 text-green-700 border-green-300" 
                      : "bg-amber-100 text-amber-700 border-amber-300"
                  )}
                >
                  {isApproved ? "✓ Approved" : "⏳ Pending"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-blue-600"
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer - Logout */}
      <div className="px-4 py-4 border-t-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-3 border-2 border-blue-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:border-red-300 hover:text-red-700 transition-all font-semibold"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
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