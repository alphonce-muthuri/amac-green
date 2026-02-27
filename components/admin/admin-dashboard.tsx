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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-white">Admin Control Center</h1>
                  <p className="text-emerald-400 text-sm font-medium">Manage applications, users & platform</p>
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
            <Card className="relative overflow-hidden border-2 border-blue-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full -mr-16 -mt-16"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-gray-700">Total Customers</CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-gray-900 mb-1">{stats.customers}</div>
                <p className="text-sm text-blue-600 font-semibold">Active customers</p>
              </CardContent>
            </Card>

            {/* Vendors Card */}
            <Card className="relative overflow-hidden border-2 border-orange-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full -mr-16 -mt-16"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-gray-700">Vendor Applications</CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-gray-900 mb-2">{stats.vendors.total}</div>
                <div className="flex gap-2">
                  <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs font-bold">
                    <Clock className="h-3 w-3 mr-1" />
                    {stats.vendors.pending}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs font-bold">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {stats.vendors.approved}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Professionals Card */}
            <Card className="relative overflow-hidden border-2 border-emerald-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full -mr-16 -mt-16"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-gray-700">Professional Apps</CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-gray-900 mb-2">{stats.professionals.total}</div>
                <div className="flex gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs font-bold">
                    <Clock className="h-3 w-3 mr-1" />
                    {stats.professionals.pending}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs font-bold">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {stats.professionals.approved}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Card */}
            <Card className="relative overflow-hidden border-2 border-purple-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -mr-16 -mt-16"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-gray-700">Delivery Partners</CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Truck className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-gray-900 mb-2">{stats.delivery.total}</div>
                <div className="flex gap-2">
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs font-bold">
                    <Clock className="h-3 w-3 mr-1" />
                    {stats.delivery.pending}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs font-bold">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {stats.delivery.approved}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Platform Health Card */}
            <Card className="relative overflow-hidden border-2 border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full -mr-16 -mt-16"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-gray-700">Platform Status</CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-green-600 mb-1">Good</div>
                <p className="text-sm text-green-600 font-semibold flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Stats Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 mb-8 shadow-xl">
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
        <Card className="border-2 border-gray-200 shadow-xl">
          <Tabs defaultValue="vendors" className="w-full">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
              <TabsList className="grid w-full grid-cols-6 h-auto p-1 bg-gray-100">
                <TabsTrigger 
                  value="vendors" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white font-semibold py-3"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Vendors
                </TabsTrigger>
                <TabsTrigger 
                  value="professionals"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white font-semibold py-3"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Professionals
                </TabsTrigger>
                <TabsTrigger 
                  value="delivery"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-semibold py-3"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Delivery
                </TabsTrigger>
                <TabsTrigger 
                  value="customers"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white font-semibold py-3"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Customers
                </TabsTrigger>
                <TabsTrigger 
                  value="locations"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-semibold py-3"
                >
                  Live Locations
                </TabsTrigger>
                <TabsTrigger 
                  value="map"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white font-semibold py-3"
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