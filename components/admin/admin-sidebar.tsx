"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Building2,
  UserCheck,
  Truck,
  Users,
  MapPin,
  Map,
  LayoutDashboard,
  LogOut,
  Zap,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  { label: "Overview", icon: LayoutDashboard, section: "" },
  { label: "Vendors", icon: Building2, section: "vendors" },
  { label: "Professionals", icon: UserCheck, section: "professionals" },
  { label: "Delivery", icon: Truck, section: "delivery" },
  { label: "Customers", icon: Users, section: "customers" },
  { label: "Live Locations", icon: MapPin, section: "locations" },
  { label: "Live Map", icon: Map, section: "map" },
]

export function AdminSidebar() {
  const searchParams = useSearchParams()
  const activeSection = searchParams.get("section") ?? ""

  const handleLogout = () => {
    window.location.href = "/login"
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold">AMAC Green</p>
            <p className="text-xs text-sidebar-foreground/60">Admin Control Center</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/40">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = activeSection === item.section
                const href = item.section ? `/admin?section=${item.section}` : "/admin"
                return (
                  <SidebarMenuItem key={item.section || "overview"}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
