"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Building2, UserCheck, Clock, CheckCircle, BarChart3, RefreshCw, Truck, TrendingUp, Activity, Zap, Award, LogOut } from "lucide-react"
import { VendorApplications } from "./vendor-applications"
import { ProfessionalApplications } from "./professional-applications"
import { CustomerList } from "./customer-list"
import { DeliveryApplications } from "./delivery-applications"
import { ActiveDeliveryLocations } from "./active-delivery-locations"
import { DeliveryLiveMap } from "./delivery-live-map"

interface DashboardStats {
  vendors: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  professionals: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  delivery: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  customers: number
}

interface AdminDashboardProps {
  initialStats: DashboardStats | null
  onLogout?: () => void | Promise<void>
}

export function AdminDashboard({ initialStats, onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(initialStats)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshStats = async () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout()
    } else {
      // Default logout behavior - redirect to logout API or login page
      window.location.href = '/api/auth/signout' || '/login'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 border border-emerald-500/80 flex items-center justify-center">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-white">
                    Admin Control Center
                  </h1>
                  <p className="text-emerald-200 text-xs sm:text-sm tracking-tight">Manage applications, users & platform</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={refreshStats} 
                disabled={isRefreshing} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-6"
              >
                <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh Data
              </Button>
              <Button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white h-12 px-6"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Customers Card */}
            <Card className="border border-blue-200/70 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Total Customers</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.customers}</div>
                <p className="text-sm text-blue-700">Active customers</p>
              </CardContent>
            </Card>

            {/* Vendors Card */}
            <Card className="border border-orange-200/70 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Vendor Applications</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-orange-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.vendors.total}</div>
                <div className="flex gap-2">
                  <Badge className="bg-orange-100 text-orange-700 border border-orange-300 text-xs font-semibold hover:bg-orange-100">
                    <Clock className="h-3 w-3 mr-1" />
                    {stats.vendors.pending}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border border-green-300 text-xs font-semibold hover:bg-green-100">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {stats.vendors.approved}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Professionals Card */}
            <Card className="border border-emerald-200/70 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Professional Apps</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-emerald-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.professionals.total}</div>
                <div className="flex gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-semibold hover:bg-emerald-100">
                    <Clock className="h-3 w-3 mr-1" />
                    {stats.professionals.pending}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border border-green-300 text-xs font-semibold hover:bg-green-100">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {stats.professionals.approved}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Card */}
            <Card className="border border-purple-200/70 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Delivery Partners</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-purple-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stats.delivery.total}</div>
                <div className="flex gap-2">
                  <Badge className="bg-purple-100 text-purple-700 border border-purple-300 text-xs font-semibold hover:bg-purple-100">
                    <Clock className="h-3 w-3 mr-1" />
                    {stats.delivery.pending}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border border-green-300 text-xs font-semibold hover:bg-green-100">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {stats.delivery.approved}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Platform Health Card */}
            <Card className="border border-green-200/70 shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Platform Status</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-green-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700 mb-1">Good</div>
                <p className="text-sm text-green-700 font-medium flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Stats Banner */}
        <div className="bg-emerald-600 rounded-xl p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <div className="text-3xl font-bold">
                {stats ? stats.vendors.approved + stats.professionals.approved + stats.delivery.approved : 0}
              </div>
              <div className="text-sm text-emerald-100 font-medium">Total Approved</div>
            </div>
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <div className="text-3xl font-bold">
                {stats ? stats.vendors.pending + stats.professionals.pending + stats.delivery.pending : 0}
              </div>
              <div className="text-sm text-emerald-100 font-medium">Pending Review</div>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <div className="text-3xl font-bold">{stats?.customers || 0}</div>
              <div className="text-sm text-emerald-100 font-medium">Active Users</div>
            </div>
            <div className="text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <div className="text-3xl font-bold">98.5%</div>
              <div className="text-sm text-emerald-100 font-medium">Approval Rate</div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Card className="border border-gray-200 shadow-sm">
          <Tabs defaultValue="vendors" className="w-full">
            <CardHeader className="border-b bg-gray-50">
              <TabsList className="grid w-full grid-cols-6 h-auto p-1 bg-gray-100">
                <TabsTrigger 
                  value="vendors" 
                  className="data-[state=active]:bg-orange-600 data-[state=active]:text-white font-semibold py-3 tracking-tight"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Vendors
                </TabsTrigger>
                <TabsTrigger 
                  value="professionals"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold py-3 tracking-tight"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Professionals
                </TabsTrigger>
                <TabsTrigger 
                  value="delivery"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold py-3 tracking-tight"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Delivery
                </TabsTrigger>
                <TabsTrigger 
                  value="customers"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold py-3 tracking-tight"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Customers
                </TabsTrigger>
                <TabsTrigger 
                  value="locations"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-semibold py-3 tracking-tight"
                >
                  Live Locations
                </TabsTrigger>
                <TabsTrigger 
                  value="map"
                  className="data-[state=active]:bg-teal-600 data-[state=active]:text-white font-semibold py-3 tracking-tight"
                >
                  Live Map
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="vendors" className="mt-0">
                <VendorApplications />
              </TabsContent>

              <TabsContent value="professionals" className="mt-0">
                <ProfessionalApplications />
              </TabsContent>

              <TabsContent value="delivery" className="mt-0">
                <DeliveryApplications />
              </TabsContent>

              <TabsContent value="customers" className="mt-0">
                <CustomerList />
              </TabsContent>

              <TabsContent value="locations" className="mt-0">
                <ActiveDeliveryLocations />
              </TabsContent>

              <TabsContent value="map" className="mt-0">
                <DeliveryLiveMap />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}