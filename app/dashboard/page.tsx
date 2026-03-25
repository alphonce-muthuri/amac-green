"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  CreditCard,
  MapPin,
  Award
} from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applicationStatus, setApplicationStatus] = useState<any>(null)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
  })
  const router = useRouter()

  const checkApplicationStatus = useCallback(async (user: any) => {
    const userRole = user?.user_metadata?.role

    if (userRole === "vendor") {
      const { data } = await supabase
        .from("vendor_applications")
        .select("status, created_at, company_name")
        .eq("user_id", user.id)
        .single()
      setApplicationStatus(data)
    } else if (userRole === "professional") {
      const { data } = await supabase
        .from("professional_applications")
        .select("status, created_at, company_name")
        .eq("user_id", user.id)
        .single()
      setApplicationStatus(data)
    } else if (userRole === "delivery") {
      const { data } = await supabase
        .from("delivery_applications")
        .select("status, created_at, first_name, last_name")
        .eq("user_id", user.id)
        .single()
      setApplicationStatus(data)
    }
  }, [])

  const loadStats = useCallback(async (_user: any) => {
    // Mock stats for now - replace with actual data fetch
    setStats({
      totalOrders: 12,
      pendingOrders: 2,
      completedOrders: 10,
      totalSpent: 45680,
    })
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

      const userRole = user?.user_metadata?.role

      if (userRole === "vendor") {
        router.push("/vendor")
        return
      } else if (userRole === "professional") {
        router.push("/professional")
        return
      } else if (userRole === "admin") {
        router.push("/admin")
        return
      } else if (userRole === "delivery") {
        router.push("/delivery")
        return
      }

      setUser(user)
      await checkApplicationStatus(user)
      await loadStats(user)
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router, checkApplicationStatus, loadStats])

  useEffect(() => {
    void checkUser()
  }, [checkUser])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-200 font-bold">
            <Clock className="h-3 w-3 mr-1 text-emerald-700" />
            Pending Review
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-200 font-bold">
            <CheckCircle className="h-3 w-3 mr-1 text-emerald-700" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-rose-50 hover:bg-rose-50 text-rose-700 hover:text-rose-700 border border-rose-200 hover:border-rose-200 font-bold">
            <XCircle className="h-3 w-3 mr-1 text-rose-700" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userRole = user?.user_metadata?.role || "customer"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Welcome Header */}
      <div className="pb-6 border-b border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tighter mb-2 bg-gradient-to-r from-green-500 via-emerald-800 to-emerald-900 bg-clip-text text-transparent">
              Welcome back,{" "}
              {user?.user_metadata?.first_name || user?.user_metadata?.contact_person || "Valued Customer"}.
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm tracking-tight">
              Here's what's happening with your account today
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-transparent">
              <Image
                src="/images/logo/AMAC-Green-logo.png"
                alt="AMAC Green logo"
                width={240}
                height={120}
                className="w-auto h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <Card className="border border-emerald-200 overflow-hidden hover:shadow-sm transition-all duration-300">
          <div className="h-2 bg-emerald-500/30 rounded-t-lg"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-emerald-700" />
              </div>
              <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-200 font-bold rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Total Orders</h3>
            <p className="text-3xl font-extrabold text-gray-900">{stats.totalOrders}</p>
            <p className="text-sm text-gray-500 mt-2">All time purchases</p>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="border border-emerald-200 overflow-hidden hover:shadow-sm transition-all duration-300">
          <div className="h-2 bg-emerald-500/30 rounded-t-lg"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-emerald-700" />
              </div>
              <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-200 font-bold rounded-full">
                Active
              </Badge>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Pending</h3>
            <p className="text-3xl font-extrabold text-gray-900">{stats.pendingOrders}</p>
            <p className="text-sm text-gray-500 mt-2">In progress</p>
          </CardContent>
        </Card>

        {/* Completed Orders */}
        <Card className="border border-emerald-200 overflow-hidden hover:shadow-sm transition-all duration-300">
          <div className="h-2 bg-emerald-500/30 rounded-t-lg"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-700" />
              </div>
              <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-200 font-bold rounded-full">
                <Award className="w-3 h-3 mr-1" />
                Done
              </Badge>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Completed</h3>
            <p className="text-3xl font-extrabold text-gray-900">{stats.completedOrders}</p>
            <p className="text-sm text-gray-500 mt-2">Successfully delivered</p>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="border border-emerald-200 overflow-hidden hover:shadow-sm transition-all duration-300">
          <div className="h-2 bg-emerald-500/30 rounded-t-lg"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-emerald-700" />
              </div>
              <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-200 font-bold rounded-full">
                KES
              </Badge>
            </div>
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Total Spent</h3>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
                minimumFractionDigits: 0,
              }).format(stats.totalSpent)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Lifetime value</p>
          </CardContent>
        </Card>
      </div>

      {/* Application Status - Only for non-customers */}
      {(userRole === "vendor" || userRole === "professional" || userRole === "delivery") && applicationStatus && (
        <Card className="border border-emerald-200 overflow-hidden">
          <div className="h-2 bg-emerald-500/30 rounded-t-lg"></div>
          <CardHeader className="bg-white border-b border-emerald-200">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-emerald-600" />
                Application Status
              </CardTitle>
              {getStatusBadge(applicationStatus.status)}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                {applicationStatus.status === "pending" && `Your ${userRole} application is under review. We'll notify you once it's processed.`}
                {applicationStatus.status === "approved" && `Congratulations! Your ${userRole} application has been approved.`}
                {applicationStatus.status === "rejected" && `Unfortunately, your ${userRole} application was not approved.`}
              </p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Application submitted:</strong> {new Date(applicationStatus.created_at).toLocaleDateString()}
                </p>
                {applicationStatus.company_name && (
                  <p className="text-sm text-gray-600">
                    <strong>Company:</strong> {applicationStatus.company_name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="pt-2 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => router.push("/products")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-sm sm:text-base font-bold"
          >
            <span className="mr-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/15">
              <ShoppingBag className="h-4 w-4 text-white" />
            </span>
            Start Shopping
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/orders")}
            className="border border-emerald-200 h-12 text-sm sm:text-base font-semibold hover:bg-emerald-50 hover:border-emerald-300"
          >
            <span className="mr-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50">
              <Package className="h-4 w-4 text-emerald-700" />
            </span>
            View Orders
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/profile")}
            className="border border-emerald-200 h-12 text-sm sm:text-base font-semibold hover:bg-emerald-50 hover:border-emerald-300"
          >
            <span className="mr-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50">
              <User className="h-4 w-4 text-emerald-700" />
            </span>
            Profile Settings
          </Button>
        </div>
      </div>

      {/* Account Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-emerald-200">
          <CardHeader className="bg-white border-b border-emerald-200">
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50/40 rounded-lg">
              <span className="text-sm font-semibold text-gray-600">Email</span>
              <span className="text-sm text-gray-900">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50/40 rounded-lg">
              <span className="text-sm font-semibold text-gray-600">Role</span>
              <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-200 font-bold">
                {userRole}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50/40 rounded-lg">
              <span className="text-sm font-semibold text-gray-600">Status</span>
              <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-200 font-bold">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-200">
          <CardHeader className="bg-white border-b border-emerald-200">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">
              Our AMAC Green support team is here to help you with any questions or concerns.
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
              >
                📧 support@amacgreen.energy
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
              >
                📞 +254 700 123 456
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}