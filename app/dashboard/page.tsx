"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  Zap,
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

  useEffect(() => {
    checkUser()
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
  }

  const checkApplicationStatus = async (user: any) => {
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
  }

  const loadStats = async (user: any) => {
    // Mock stats for now - replace with actual data fetch
    setStats({
      totalOrders: 12,
      pendingOrders: 2,
      completedOrders: 10,
      totalSpent: 45680,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-2 border-amber-300 font-bold">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 border-2 border-green-300 font-bold">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-2 border-red-300 font-bold">
            <XCircle className="h-3 w-3 mr-1" />
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
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">
              Welcome back, {user?.user_metadata?.first_name || user?.user_metadata?.contact_person || "Valued Customer"}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your account today
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Zap className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <Card className="border-2 border-blue-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="h-7 w-7 text-white" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-2 border-blue-300 font-bold">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Total Orders</h3>
            <p className="text-4xl font-extrabold text-gray-900">{stats.totalOrders}</p>
            <p className="text-sm text-gray-500 mt-2">All time purchases</p>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="border-2 border-amber-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-2 border-amber-300 font-bold">
                Active
              </Badge>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Pending</h3>
            <p className="text-4xl font-extrabold text-gray-900">{stats.pendingOrders}</p>
            <p className="text-sm text-gray-500 mt-2">In progress</p>
          </CardContent>
        </Card>

        {/* Completed Orders */}
        <Card className="border-2 border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <Badge className="bg-green-100 text-green-700 border-2 border-green-300 font-bold">
                <Award className="w-3 h-3 mr-1" />
                Done
              </Badge>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Completed</h3>
            <p className="text-4xl font-extrabold text-gray-900">{stats.completedOrders}</p>
            <p className="text-sm text-gray-500 mt-2">Successfully delivered</p>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="border-2 border-purple-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <CreditCard className="h-7 w-7 text-white" />
              </div>
              <Badge className="bg-purple-100 text-purple-700 border-2 border-purple-300 font-bold">
                KES
              </Badge>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Total Spent</h3>
            <p className="text-3xl font-extrabold text-gray-900">
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
        <Card className="border-2 border-purple-200">
          <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-purple-600" />
                Application Status
              </CardTitle>
              {getStatusBadge(applicationStatus.status)}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-gray-700 text-lg">
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
      <Card className="border-2 border-gray-200">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <CardTitle className="text-2xl font-bold text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => router.push("/products")} 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-16 text-lg font-bold"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Start Shopping
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push("/dashboard/orders")} 
              className="border-2 h-16 text-lg font-semibold"
            >
              <Package className="h-5 w-5 mr-2" />
              View Orders
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push("/dashboard/profile")} 
              className="border-2 h-16 text-lg font-semibold"
            >
              <User className="h-5 w-5 mr-2" />
              Profile Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-semibold text-gray-600">Email</span>
              <span className="text-sm text-gray-900">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-semibold text-gray-600">Role</span>
              <Badge className="bg-blue-100 text-blue-700 border-2 border-blue-300 font-bold">
                {userRole}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-semibold text-gray-600">Status</span>
              <Badge className="bg-green-100 text-green-700 border-2 border-green-300 font-bold">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">
              Our AMAC Green support team is here to help you with any questions or concerns.
            </p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start border-2">
                📧 support@amacgreen.energy
              </Button>
              <Button variant="outline" className="w-full justify-start border-2">
                📞 +254 700 123 456
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}