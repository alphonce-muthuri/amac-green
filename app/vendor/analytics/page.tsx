"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Star,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Award,
  TrendingDown
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AnalyticsData {
  totalProducts: number
  activeProducts: number
  totalRevenue: number
  totalOrders: number
  averageRating: number
  lowStockItems: number
  outOfStockItems: number
  topProducts: Array<{
    id: string
    name: string
    price: number
    inventory_quantity: number
    revenue: number
  }>
  recentOrders: Array<{
    id: string
    order_number: string
    total_amount: number
    status: string
    created_at: string
  }>
  categoryBreakdown: Array<{
    category: string
    products: number
    revenue: number
  }>
}

async function generateVendorAnalytics(vendorId: string, days: number): Promise<AnalyticsData> {
  // Get products
  const { data: productsData } = await supabase
    .from("products")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })
  
  const products = productsData || []
  
  // Get orders
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data: ordersData } = await supabase
    .from("orders")
    .select("*")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false })
  
  const orders = ordersData || []

  // Get reviews
  const { data: reviewsData } = await supabase
    .from("product_reviews")
    .select("*")
    .in("product_id", products.map(p => p.id))
  
  const reviews = reviewsData || []

  const totalProducts = products.length
  const activeProducts = products.filter(p => p.status === "active").length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  const totalOrders = orders.length
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  const lowStockItems = products.filter(p => (p.inventory_quantity || 0) <= p.low_stock_threshold && (p.inventory_quantity || 0) > 0).length
  const outOfStockItems = products.filter(p => (p.inventory_quantity || 0) === 0).length

  const topProducts = products
    .map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      inventory_quantity: product.inventory_quantity || 0,
      revenue: product.price * (product.inventory_quantity || 0)
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const recentOrders = orders.slice(0, 10).map(order => ({
    id: order.id,
    order_number: order.order_number,
    total_amount: order.total_amount,
    status: order.status,
    created_at: order.created_at
  }))

  const categoryMap: { [key: string]: { products: number; revenue: number } } = {}
  products.forEach(product => {
    const category = product.category || 'Uncategorized'
    if (!categoryMap[category]) {
      categoryMap[category] = { products: 0, revenue: 0 }
    }
    categoryMap[category].products++
    categoryMap[category].revenue += product.price * (product.inventory_quantity || 0)
  })

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.revenue - a.revenue)

  return {
    totalProducts,
    activeProducts,
    totalRevenue,
    totalOrders,
    averageRating,
    lowStockItems,
    outOfStockItems,
    topProducts,
    recentOrders,
    categoryBreakdown
  }
}

export default function VendorAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [timeRange, setTimeRange] = useState("30")

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        const data = await generateVendorAnalytics(user.id, parseInt(timeRange))
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error loading analytics:", error)
      setAnalytics(null)
    }
    
    setLoading(false)
  }, [timeRange])

  useEffect(() => {
    void loadAnalytics()
  }, [loadAnalytics])

  const formatCurrency = (amount: number) => `KSH ${amount.toLocaleString()}`

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <BarChart3 className="absolute inset-0 m-auto h-8 w-8 text-indigo-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">Loading Analytics</p>
          <p className="text-sm text-gray-600 mt-1">Analyzing your data...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border border-red-300">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-12 w-12 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Analytics Data</h3>
                <p className="text-gray-600 mb-6">Unable to load analytics. Please try again.</p>
                <Button onClick={loadAnalytics} className="bg-indigo-600 hover:bg-indigo-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <Card className="border border-indigo-300 shadow-md overflow-hidden">
              <div className="h-2 bg-indigo-500/30" />
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-700 border border-indigo-800 rounded-xl flex items-center justify-center shadow-md">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h1>
                      <p className="text-lg text-gray-600">Track your business performance and insights</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="h-12 px-4 border border-indigo-300 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                    </select>
                    <Button onClick={loadAnalytics} variant="outline" className="h-12 border">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-green-200 hover:shadow-sm transition-shadow">
              <div className="h-2 bg-emerald-500/30" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <Badge className="rounded-full bg-green-600 text-white">Revenue</Badge>
                </div>
                <p className="text-xl font-semibold text-green-700 mb-1">
                  {(analytics.totalRevenue / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-gray-600">Total Revenue (KSH)</p>
              </CardContent>
            </Card>

            <Card className="border border-blue-200 hover:shadow-sm transition-shadow">
              <div className="h-2 bg-blue-500/30" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <Badge className="rounded-full bg-blue-600 text-white">Orders</Badge>
                </div>
                <p className="text-xl font-semibold text-blue-700 mb-1">{analytics.totalOrders}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </CardContent>
            </Card>

            <Card className="border border-purple-200 hover:shadow-sm transition-shadow">
              <div className="h-2 bg-purple-500/30" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  <Badge className="rounded-full bg-purple-600 text-white">Products</Badge>
                </div>
                <p className="text-xl font-semibold text-purple-700 mb-1">{analytics.activeProducts}</p>
                <p className="text-sm text-gray-600">Active Products</p>
              </CardContent>
            </Card>

            <Card className="border border-yellow-200 hover:shadow-sm transition-shadow">
              <div className="h-2 bg-amber-500/30" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <Badge className="rounded-full bg-yellow-600 text-white">Rating</Badge>
                </div>
                <p className="text-xl font-semibold text-yellow-700 mb-1">{analytics.averageRating.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Alerts */}
          {(analytics.lowStockItems > 0 || analytics.outOfStockItems > 0) && (
            <Card className="border border-orange-200 bg-orange-50/80">
              <div className="h-2 bg-orange-500/30" />
            <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <CardTitle className="text-orange-900">Inventory Alerts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {analytics.lowStockItems > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-full bg-orange-600 text-white">{analytics.lowStockItems}</Badge>
                      <span className="text-orange-800 font-semibold">items low in stock</span>
                    </div>
                  )}
                  {analytics.outOfStockItems > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-full bg-red-600 text-white">{analytics.outOfStockItems}</Badge>
                      <span className="text-red-800 font-semibold">items out of stock</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border border-indigo-200">
                  <div className="h-2 bg-indigo-500/30"></div>
                  <CardHeader className="bg-white border-b border-indigo-200">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Top Products by Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {analytics.topProducts.map((product, index) => (
                        <div key={product.id} className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 hover:shadow-sm transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-bold">{product.name}</p>
                                <p className="text-sm text-gray-600">Stock: {product.inventory_quantity}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-indigo-700">{formatCurrency(product.revenue)}</p>
                              <p className="text-sm text-gray-600">{formatCurrency(product.price)} each</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-blue-200">
                  <div className="h-2 bg-blue-500/30" />
            <CardHeader className="bg-white border-b border-blue-200">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Category Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {analytics.categoryBreakdown.slice(0, 5).map((category, index) => (
                        <div key={category.category} className="p-4 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-sm transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-bold">{category.category}</p>
                                <p className="text-sm text-gray-600">{category.products} products</p>
                              </div>
                            </div>
                            <p className="font-bold text-lg text-blue-700">{formatCurrency(category.revenue)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products">
              <Card className="border border-purple-200">
                <div className="h-2 bg-purple-500/30" />
            <CardHeader className="bg-white border-b border-purple-200">
                  <CardTitle>Product Status Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total Products</span>
                        <Badge className="rounded-full bg-purple-600 text-white">{analytics.totalProducts}</Badge>
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Active Products</span>
                        <Badge className="rounded-full bg-green-600 text-white">{analytics.activeProducts}</Badge>
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Low Stock Items</span>
                        <Badge className="rounded-full bg-orange-600 text-white">{analytics.lowStockItems}</Badge>
                      </div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Out of Stock</span>
                        <Badge className="rounded-full bg-red-600 text-white">{analytics.outOfStockItems}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card className="border border-green-200">
                <div className="h-2 bg-emerald-500/30" />
            <CardHeader className="bg-white border-b border-emerald-200">
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {analytics.recentOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-600">No recent orders</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analytics.recentOrders.map((order) => (
                        <div key={order.id} className="p-4 bg-emerald-50 rounded-xl border border-green-200 hover:shadow-sm transition-all">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold">#{order.order_number}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right flex items-center gap-3">
                              <p className="font-bold text-lg text-green-700">{formatCurrency(order.total_amount)}</p>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
</div>
  )
}


