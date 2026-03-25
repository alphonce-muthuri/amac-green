"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Truck,
  Store,
  Sparkles,
  BarChart3,
  Target,
  Zap,
  Award,
  Clock,
  ArrowUpRight,
  RefreshCw
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getVendorOrders } from "@/app/actions/orders"
import Link from "next/link"

export default function VendorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<any>(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  })
  const router = useRouter()

  const getVendorApplication = useCallback(async (user: any) => {
    try {
      const { data, error } = await supabase.from("vendor_applications").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching vendor application:", error)
        return
      }

      setApplicationStatus(data)
    } catch (error) {
      console.error("Error in getVendorApplication:", error)
    }
  }, [])

  const getVendorStats = useCallback(async (user: any) => {
    try {
      const ordersResult = await getVendorOrders(user.id)
      
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", user.id)
        .eq("status", "active")

      let totalOrders = 0
      let totalRevenue = 0
      let pendingOrders = 0

      if (ordersResult.success && ordersResult.data) {
        const orders = ordersResult.data
        totalOrders = orders.length
        
        orders.forEach((order: any) => {
          const vendorRevenue = order.order_items.reduce((sum: number, item: any) => {
            return sum + parseFloat(item.total_price)
          }, 0)
          
          totalRevenue += vendorRevenue
          
          if (order.status === 'pending' || order.status === 'confirmed' || order.payment_status === 'pending') {
            pendingOrders++
          }
        })
      }

      setStats({
        totalProducts: productCount || 0,
        totalOrders,
        totalRevenue,
        pendingOrders,
      })
    } catch (error) {
      console.error("Error fetching vendor stats:", error)
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
      })
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
      if (userRole !== "vendor") {
        switch (userRole) {
          case "admin":
            router.push("/admin")
            break
          case "professional":
            router.push("/professional")
            break
          case "customer":
          default:
            router.push("/dashboard")
            break
        }
        return
      }

      setUser(user)
      await getVendorApplication(user)
      await getVendorStats(user)
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router, getVendorApplication, getVendorStats])

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

  const handleRefreshStats = async () => {
    setRefreshing(true)
    await getVendorStats(user)
    setTimeout(() => setRefreshing(false), 500)
  }

  const isApproved = applicationStatus?.status === "approved"

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <Store className="absolute inset-0 m-auto h-8 w-8 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">Loading Your Store</p>
          <p className="text-sm text-gray-600 mt-1">Preparing your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Hero Header */}
          <div className="pb-6 border-b border-blue-200">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-700 border border-blue-800 rounded-xl flex items-center justify-center shadow-sm">
                    <Store className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                  </div>
                  {isApproved && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>

                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tighter mb-2 bg-gradient-to-r from-blue-600 via-indigo-700 to-indigo-900 bg-clip-text text-transparent">
                    Supplier Dashboard
                  </h1>
                  <p className="text-gray-600 text-xs sm:text-sm tracking-tight">
                    Welcome back,{" "}
                    <span className="font-bold text-blue-800">
                      {user?.user_metadata?.contact_person || user?.user_metadata?.first_name || "Vendor"}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className="rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-semibold tracking-tight hover:bg-blue-50">
                      <Store className="h-3 w-3 mr-1" />
                      {applicationStatus?.company_name || "Your Store"}
                    </Badge>
                    {isApproved && (
                      <Badge className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold tracking-tight hover:bg-emerald-50">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified Supplier
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 shrink-0">
                <Button
                  onClick={handleRefreshStats}
                  disabled={refreshing}
                  variant="outline"
                  className="border border-blue-200 hover:bg-blue-50 text-sm font-semibold"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh Stats
                </Button>
              </div>
            </div>
          </div>

          {/* Application Status Alert */}
          {!isApproved && (
            <Card className="border border-amber-200 shadow-sm overflow-hidden">
              <div className="h-2 bg-amber-500/30" />
              <CardContent className="p-6 bg-amber-50/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-amber-900 mb-2">Application Status: {applicationStatus?.status || "pending"}</h3>
                    {applicationStatus?.status === "pending" && (
                      <p className="text-amber-800 mb-3">
                        Our team is reviewing your application. This typically takes 1-3 business days. Once approved, you'll be able to add products and start selling.
                      </p>
                    )}
                    {applicationStatus?.status === "rejected" && (
                      <p className="text-amber-800 mb-3">
                        Your application was not approved. Please contact support for more information or to resubmit.
                      </p>
                    )}
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-gray-600 mb-1">Company</p>
                        <p className="font-bold text-gray-900">{applicationStatus?.company_name || "N/A"}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-gray-600 mb-1">Applied</p>
                        <p className="font-bold text-gray-900">
                          {applicationStatus?.created_at
                            ? new Date(applicationStatus.created_at).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approved Vendor Content */}
          {isApproved && (
            <>
              {/* Stats Dashboard */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-purple-200 hover:shadow-sm transition-shadow overflow-hidden">
                  <div className="h-2 bg-purple-500/30" />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center">
                        <Package className="h-5 w-5 text-purple-700" />
                      </div>
                      <Badge className="rounded-full bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-50">Products</Badge>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">{stats.totalProducts}</p>
                    <p className="text-xs sm:text-sm text-gray-600 tracking-tight">Active Listings</p>
                  </CardContent>
                </Card>

                <Card className="border border-blue-200 hover:shadow-sm transition-shadow overflow-hidden">
                  <div className="h-2 bg-blue-500/30" />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-blue-700" />
                      </div>
                      <Badge className="rounded-full bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-50">Orders</Badge>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">{stats.totalOrders}</p>
                    <p className="text-xs sm:text-sm text-gray-600 tracking-tight">All Time Orders</p>
                  </CardContent>
                </Card>

                <Card className="border border-emerald-200 hover:shadow-sm transition-shadow overflow-hidden">
                  <div className="h-2 bg-emerald-500/30" />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-emerald-700" />
                      </div>
                      <Badge className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-50">Revenue</Badge>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">
                      {(stats.totalRevenue / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 tracking-tight">Total Earnings (KSH)</p>
                  </CardContent>
                </Card>

                <Card className="border border-orange-200 hover:shadow-sm transition-shadow overflow-hidden">
                  <div className="h-2 bg-orange-500/30" />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center">
                        <Clock className="h-5 w-5 text-orange-700" />
                      </div>
                      <Badge className="rounded-full bg-orange-50 text-orange-800 border border-orange-200 animate-pulse hover:bg-orange-50">Pending</Badge>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">{stats.pendingOrders}</p>
                    <p className="text-xs sm:text-sm text-gray-600 tracking-tight">Need Attention</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Getting Started */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border border-indigo-200 shadow-sm overflow-hidden">
                  <div className="h-2 bg-indigo-500/30" />
                  <CardHeader className="bg-white border-b border-indigo-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-700 border border-indigo-800 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg sm:text-xl tracking-tight">Quick Actions</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Common tasks to manage your store</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <Button asChild className="w-full h-12 justify-start bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold">
                      <Link href="/vendor/products/add">
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Product
                        <Sparkles className="h-4 w-4 ml-auto" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full h-12 justify-start border border-indigo-200 hover:bg-indigo-50">
                      <Link href="/vendor/products">
                        <Eye className="h-5 w-5 mr-2" />
                        View All Products
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full h-12 justify-start border border-blue-200 hover:bg-blue-50">
                      <Link href="/vendor/orders">
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Manage Orders
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full h-12 justify-start border border-green-200 hover:bg-green-50">
                      <Link href="/vendor/deliveries">
                        <Truck className="h-5 w-5 mr-2" />
                        Track Deliveries
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-teal-200 shadow-sm overflow-hidden">
                  <div className="h-2 bg-teal-500/30" />
                  <CardHeader className="bg-white border-b border-teal-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-700 border border-teal-800 rounded-lg flex items-center justify-center">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg sm:text-xl tracking-tight">Getting Started</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Complete these steps to optimize your store</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">Account approved</span>
                    </div>
                    
                    <div className={`flex items-center gap-4 p-3 rounded-lg border ${
                      stats.totalProducts > 0 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        stats.totalProducts > 0 ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {stats.totalProducts > 0 ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 border border-gray-300 rounded-full" />
                        )}
                      </div>
                      <span className={`text-sm font-semibold ${stats.totalProducts > 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                        Add your first product
                      </span>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-5 h-5 border border-gray-300 rounded-full" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">Complete store profile</span>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-5 h-5 border border-gray-300 rounded-full" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">Set up payment methods</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-2 bg-gray-400/40" />
                <CardHeader className="bg-white border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 border border-gray-800 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl tracking-tight">Recent Activity</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Your latest store activities</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">No Recent Activity</h3>
                    <p className="text-sm text-gray-600 mb-4">Start by adding your first product to see activity here</p>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 font-semibold">
                      <Link href="/vendor/products/add">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product Now
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Pending/Rejected State */}
          {!isApproved && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border border-blue-200 shadow-sm overflow-hidden">
                <div className="h-2 bg-blue-500/30" />
                <CardHeader className="bg-white border-b border-blue-200">
                  <CardTitle className="text-lg sm:text-xl tracking-tight">What happens next?</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-700 border border-blue-800 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 mb-1">Application Review</p>
                      <p className="text-sm text-gray-600">Our team reviews your business information and documents</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-gray-600 mb-1">Approval Notification</p>
                      <p className="text-sm text-gray-600">You will receive an email once your application is processed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-bold text-gray-600 mb-1">Start Selling</p>
                      <p className="text-sm text-gray-600">Add products and start reaching customers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-purple-200 shadow-sm overflow-hidden">
                <div className="h-2 bg-purple-500/30" />
                <CardHeader className="bg-white border-b border-purple-200">
                  <CardTitle className="text-lg sm:text-xl tracking-tight">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-gray-600">
                    If you have questions about your application or need assistance, we are here to help.
                  </p>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full h-12 justify-start border border-purple-300 hover:bg-purple-50">
                      <Award className="h-5 w-5 mr-2" />
                      Contact Support
                    </Button>
                    <Button variant="outline" className="w-full h-12 justify-start border border-blue-300 hover:bg-blue-50">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      View Documentation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
</div>
  )
}


