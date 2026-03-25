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
  const pathname = usePathname() ?? ""
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

  const isActive = (href: string) => {
    if (href === "/vendor") return pathname === "/vendor"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-blue-200 shadow-sm">
      <div className="relative overflow-hidden">
        <div className="h-2 bg-blue-500/30" />

        <div className="px-6 py-4 bg-blue-50/80 border-b border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-700 border border-blue-800 rounded-xl flex items-center justify-center shadow-sm">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Supplier</h2>
              <p className="text-xs text-gray-600 tracking-tight">Portal</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10 border border-blue-200">
                <AvatarFallback className="bg-blue-50 text-blue-800 font-bold border border-blue-200">
                  {user?.user_metadata?.company_name
                    ? getInitials(user.user_metadata.company_name)
                    : getInitials(user?.email || "V")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate tracking-tight">
                  {user?.user_metadata?.company_name || "Your Company"}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user?.user_metadata?.contact_person || user?.email}
                </p>
                <Badge
                  className={cn(
                    "mt-1 text-xs font-semibold border",
                    isApproved
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                      : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-50"
                  )}
                >
                  {isApproved ? "✓ Approved" : "⏳ Pending"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 tracking-tight",
                active
                  ? "bg-blue-100 text-blue-950 border border-blue-200"
                  : "text-gray-700 hover:bg-blue-50/80 border border-transparent"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  active ? "text-blue-800" : "text-blue-600"
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-blue-200 bg-blue-50/60">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-3 border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 font-semibold"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
