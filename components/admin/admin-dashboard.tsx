"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Users,
  Building2,
  UserCheck,
  Clock,
  CheckCircle,
  BarChart3,
  RefreshCw,
  Truck,
  TrendingUp,
  Activity,
  Award,
} from "lucide-react"
import { VendorApplications } from "./vendor-applications"
import { ProfessionalApplications } from "./professional-applications"
import { CustomerList } from "./customer-list"
import { DeliveryApplications } from "./delivery-applications"
import { ActiveDeliveryLocations } from "./active-delivery-locations"
import { DeliveryLiveMap } from "./delivery-live-map"

interface DashboardStats {
  vendors: { total: number; pending: number; approved: number; rejected: number }
  professionals: { total: number; pending: number; approved: number; rejected: number }
  delivery: { total: number; pending: number; approved: number; rejected: number }
  customers: number
}

interface AdminDashboardProps {
  initialStats: DashboardStats | null
  activeSection: string
}

const sectionTitles: Record<string, string> = {
  "": "Overview",
  vendors: "Vendor Applications",
  professionals: "Professional Applications",
  delivery: "Delivery Partners",
  customers: "Customers",
  locations: "Live Locations",
  map: "Live Map",
}

export function AdminDashboard({ initialStats, activeSection }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(initialStats)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshStats = async () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const title = sectionTitles[activeSection] ?? "Overview"

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7]">
      {/* Top bar */}
      <header className="flex h-14 items-center gap-2 border-b bg-white px-4">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
          {activeSection === "" && (
            <Button
              onClick={refreshStats}
              disabled={isRefreshing}
              size="sm"
              className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 p-5">
        {/* Overview section */}
        {activeSection === "" && (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Customers</CardTitle>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stats.customers}</div>
                    <p className="text-xs text-gray-400">Active customers</p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor Applications</CardTitle>
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-gray-700" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-2">{stats.vendors.total}</div>
                    <div className="flex gap-2">
                      <Badge className="bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold hover:bg-gray-100">
                        <Clock className="h-3 w-3 mr-1" />{stats.vendors.pending}
                      </Badge>
                      <Badge className="bg-green-100 text-green-700 border border-green-300 text-xs font-semibold hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />{stats.vendors.approved}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Professional Apps</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-emerald-700" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-2">{stats.professionals.total}</div>
                    <div className="flex gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-semibold hover:bg-emerald-100">
                        <Clock className="h-3 w-3 mr-1" />{stats.professionals.pending}
                      </Badge>
                      <Badge className="bg-green-100 text-green-700 border border-green-300 text-xs font-semibold hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />{stats.professionals.approved}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery Partners</CardTitle>
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-gray-700" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-2">{stats.delivery.total}</div>
                    <div className="flex gap-2">
                      <Badge className="bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold hover:bg-gray-100">
                        <Clock className="h-3 w-3 mr-1" />{stats.delivery.pending}
                      </Badge>
                      <Badge className="bg-green-100 text-green-700 border border-green-300 text-xs font-semibold hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />{stats.delivery.approved}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform Status</CardTitle>
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-green-700" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-700 mb-1">Good</div>
                    <p className="text-xs text-emerald-700 font-medium flex items-center">
                      <Award className="w-3 h-3 mr-1" />
                      All systems operational
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Stats */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                  <div className="text-2xl font-bold text-gray-900">
                    {stats
                      ? stats.vendors.approved + stats.professionals.approved + stats.delivery.approved
                      : 0}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Total Approved</div>
                </div>
                <div className="text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                  <div className="text-2xl font-bold text-gray-900">
                    {stats
                      ? stats.vendors.pending + stats.professionals.pending + stats.delivery.pending
                      : 0}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Pending Review</div>
                </div>
                <div className="text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                  <div className="text-2xl font-bold text-gray-900">{stats?.customers || 0}</div>
                  <div className="text-xs text-gray-500 font-medium">Active Users</div>
                </div>
                <div className="text-center">
                  <BarChart3 className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                  <div className="text-2xl font-bold text-gray-900">98.5%</div>
                  <div className="text-xs text-gray-500 font-medium">Approval Rate</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Section content */}
        {activeSection === "vendors" && <VendorApplications />}
        {activeSection === "professionals" && <ProfessionalApplications />}
        {activeSection === "delivery" && <DeliveryApplications />}
        {activeSection === "customers" && <CustomerList />}
        {activeSection === "locations" && <ActiveDeliveryLocations />}
        {activeSection === "map" && <DeliveryLiveMap />}
      </div>
    </div>
  )
}
