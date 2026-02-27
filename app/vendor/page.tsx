"use client"

import { useState, useEffect } from "react"
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
  }

  const getVendorApplication = async (user: any) => {
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
  }

  const getVendorStats = async (user: any) => {
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
  }

  const handleRefreshStats = async () => {
    setRefreshing(true)
    await getVendorStats(user)
    setTimeout(() => setRefreshing(false), 500)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-6">
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

  const isApproved = applicationStatus?.status === "approved"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <Card className="border-2 border-blue-300 shadow-2xl">
              <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-gradient-x"></div>
              
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
              
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                        <Store className="h-12 w-12 text-white" />
                      </div>
                      {isApproved && (
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                        Supplier Dashboard
                      </h1>
                      <p className="text-lg text-gray-600">
                        Welcome back, <span className="font-bold text-blue-700">{user?.user_metadata?.contact_person || user?.user_metadata?.first_name || "Vendor"}</span>
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-2 border-blue-300">
                          <Store className="h-3 w-3 mr-1" />
                          {applicationStatus?.company_name || "Your Store"}
                        </Badge>
                        {isApproved && (
                          <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified Supplier
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <Button
                      onClick={handleRefreshStats}
                      disabled={refreshing}
                      variant="outline"
                      className="border-2 border-blue-300 hover:bg-blue-50"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh Stats
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Status Alert */}
          {!isApproved && (
            <Card className="border-2 border-amber-300 shadow-xl">
              <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500 animate-gradient-x"></div>
              <CardContent className="p-6 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
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
                <Card className="border-2 border-purple-200 hover:shadow-xl transition-shadow">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                        <Package className="h-6 w-6 text-purple-600" />
                      </div>
                      <Badge className="bg-purple-600 text-white">Products</Badge>
                    </div>
                    <p className="text-3xl font-extrabold text-purple-700 mb-1">{stats.totalProducts}</p>
                    <p className="text-sm text-gray-600">Active Listings</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-200 hover:shadow-xl transition-shadow">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-blue-600" />
                      </div>
                      <Badge className="bg-blue-600 text-white">Orders</Badge>
                    </div>
                    <p className="text-3xl font-extrabold text-blue-700 mb-1">{stats.totalOrders}</p>
                    <p className="text-sm text-gray-600">All Time Orders</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 hover:shadow-xl transition-shadow">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <Badge className="bg-green-600 text-white">Revenue</Badge>
                    </div>
                    <p className="text-3xl font-extrabold text-green-700 mb-1">
                      {(stats.totalRevenue / 1000).toFixed(0)}K
                    </p>
                    <p className="text-sm text-gray-600">Total Earnings (KSH)</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 hover:shadow-xl transition-shadow">
                  <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                      <Badge className="bg-orange-600 text-white animate-pulse">Pending</Badge>
                    </div>
                    <p className="text-3xl font-extrabold text-orange-700 mb-1">{stats.pendingOrders}</p>
                    <p className="text-sm text-gray-600">Need Attention</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Getting Started */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-2 border-indigo-200 shadow-xl">
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  <CardHeader className="bg-gradient-to-br from-indigo-50 to-purple-50 border-b-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Quick Actions</CardTitle>
                        <CardDescription>Common tasks to manage your store</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <Button asChild className="w-full h-12 justify-start bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                      <Link href="/vendor/products/add">
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Product
                        <Sparkles className="h-4 w-4 ml-auto" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full h-12 justify-start border-2 border-indigo-200 hover:bg-indigo-50">
                      <Link href="/vendor/products">
                        <Eye className="h-5 w-5 mr-2" />
                        View All Products
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full h-12 justify-start border-2 border-blue-200 hover:bg-blue-50">
                      <Link href="/vendor/orders">
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Manage Orders
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full h-12 justify-start border-2 border-green-200 hover:bg-green-50">
                      <Link href="/vendor/deliveries">
                        <Truck className="h-5 w-5 mr-2" />
                        Track Deliveries
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-teal-200 shadow-xl">
                  <div className="h-2 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
                  <CardHeader className="bg-gradient-to-br from-teal-50 to-cyan-50 border-b-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Getting Started</CardTitle>
                        <CardDescription>Complete these steps to optimize your store</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">Account approved</span>
                    </div>
                    
                    <div className={`flex items-center gap-4 p-3 rounded-lg border-2 ${
                      stats.totalProducts > 0 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        stats.totalProducts > 0 ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {stats.totalProducts > 0 ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                      <span className={`text-sm font-semibold ${stats.totalProducts > 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                        Add your first product
                      </span>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">Complete store profile</span>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">Set up payment methods</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="border-2 border-gray-300 shadow-xl">
                <div className="h-2 bg-gradient-to-r from-gray-500 to-slate-500"></div>
                <CardHeader className="bg-gradient-to-br from-gray-50 to-slate-50 border-b-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-slate-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Recent Activity</CardTitle>
                      <CardDescription>Your latest store activities</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Recent Activity</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first product to see activity here</p>
                    <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600">
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
              <Card className="border-2 border-blue-200 shadow-xl">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                <CardHeader className="bg-gradient-to-br from-blue-50 to-cyan-50 border-b-2">
                  <CardTitle className="text-xl">What happens next?</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
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
                      <p className="text-sm text-gray-600">You'll receive an email once your application is processed</p>
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

              <Card className="border-2 border-purple-200 shadow-xl">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50 border-b-2">
                  <CardTitle className="text-xl">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-gray-600">
                    If you have questions about your application or need assistance, we're here to help.
                  </p>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full h-12 justify-start border-2 border-purple-300 hover:bg-purple-50">
                      <Award className="h-5 w-5 mr-2" />
                      Contact Support
                    </Button>
                    <Button variant="outline" className="w-full h-12 justify-start border-2 border-blue-300 hover:bg-blue-50">
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