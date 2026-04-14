"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Building2, 
  UserCheck, 
  Truck,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Percent,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  LineChart,
  Package,
  Activity,
  Zap,
  Award,
  Star,
  Sparkles,
  Globe
} from "lucide-react"
import { getPlatformAnalytics, type PlatformAnalytics, type AnalyticsFilters } from "@/app/actions/super-admin-analytics"
import { getAllVendors, getVendorPerformance, type VendorListItem, type VendorPerformance } from "@/app/actions/vendor-performance"
import { getAllCategories, getCategoryPerformance, type CategoryListItem, type CategoryPerformance } from "@/app/actions/category-performance"
import { SimpleLineChart } from "@/components/charts/SimpleLineChart"
import { SimpleBarChart } from "@/components/charts/SimpleBarChart"
import { toast } from "@/hooks/use-toast"
import { checkAdminAccess } from "@/app/actions/admin"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authorized, setAuthorized] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: '',
    endDate: '',
    paymentMethod: 'all',
    status: 'all',
    period: 'daily'
  })

  const [vendors, setVendors] = useState<VendorListItem[]>([])
  const [selectedVendor, setSelectedVendor] = useState<string>('all')
  const [vendorPerformance, setVendorPerformance] = useState<VendorPerformance | null>(null)
  const [loadingVendor, setLoadingVendor] = useState(false)
  const [showVendorPerformance, setShowVendorPerformance] = useState(false)

  const [categories, setCategories] = useState<CategoryListItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance | null>(null)
  const [loadingCategory, setLoadingCategory] = useState(false)
  const [showCategoryPerformance, setShowCategoryPerformance] = useState(false)

  // Verify admin identity before loading any data.
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/login"); return }
      const isAdmin = await checkAdminAccess(user.email || "")
      if (!isAdmin) { router.replace("/"); return }
      setAuthorized(true)
      loadAnalytics()
      loadVendors()
      loadCategories()
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadAnalytics = async (customFilters?: AnalyticsFilters) => {
    try {
      setLoading(true)
      const filtersToUse = customFilters || filters
      const result = await getPlatformAnalytics(filtersToUse)
      
      if (result.success && result.data) {
        setAnalytics(result.data)
      } else {
        setError(result.error || 'Failed to load analytics')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof AnalyticsFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const applyFilters = () => {
    loadAnalytics(filters)
  }

  const resetFilters = () => {
    const resetFilters: AnalyticsFilters = {
      startDate: '',
      endDate: '',
      paymentMethod: 'all',
      status: 'all',
      period: 'daily'
    }
    setFilters(resetFilters)
    loadAnalytics(resetFilters)
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp className="h-4 w-4" />
    if (growth < 0) return <ArrowDown className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600"
    if (growth < 0) return "text-gray-700"
    return "text-gray-600"
  }

  const loadVendors = async () => {
    const result = await getAllVendors()
    if (result.success && result.data) {
      setVendors(result.data)
    }
  }

  const loadCategories = async () => {
    const result = await getAllCategories()
    if (result.success && result.data) {
      setCategories(result.data)
    }
  }

  const handleVendorSelect = async (vendorId: string) => {
    setSelectedVendor(vendorId)
    
    if (vendorId === 'all') {
      setVendorPerformance(null)
      setShowVendorPerformance(false)
      return
    }

    setLoadingVendor(true)
    setShowVendorPerformance(true)
    
    try {
      const result = await getVendorPerformance(vendorId)
      if (result.success && result.data) {
        setVendorPerformance(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load vendor performance",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading vendor performance:', error)
    } finally {
      setLoadingVendor(false)
    }
  }

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId)
    
    if (categoryId === 'all') {
      setCategoryPerformance(null)
      setShowCategoryPerformance(false)
      return
    }

    setLoadingCategory(true)
    setShowCategoryPerformance(true)
    
    try {
      const result = await getCategoryPerformance(categoryId)
      if (result.success && result.data) {
        setCategoryPerformance(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load category performance",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading category performance:', error)
    } finally {
      setLoadingCategory(false)
    }
  }

  if (!authorized || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-gray-200 border-t-transparent rounded-full animate-spin"></div>
            <Activity className="absolute inset-0 m-auto h-10 w-10 text-emerald-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Analytics</h2>
          <p className="text-gray-600">Preparing executive dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-10 w-10 text-gray-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Analytics Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => loadAnalytics()}
            className="bg-emerald-600 hover:bg-emerald-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Loading
          </Button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Executive Header */}
          <div className="pb-6 border-b border-slate-200">
            <div className="relative p-6 sm:p-8 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                  {/* Executive Badge */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-xl border border-gray-200 bg-emerald-600 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-emerald-700" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-lg border border-emerald-200 bg-emerald-50 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>

                  {/* Platform Overview */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-slate-700 via-emerald-700 to-slate-900 bg-clip-text text-transparent">
                        Executive Dashboard
                      </h1>
                      <Badge className="bg-emerald-600 text-emerald-700 border border-gray-200 text-xs px-3 py-1 font-medium hover:bg-emerald-600">
                        <Globe className="h-3 w-3 mr-1" />
                        Platform Overview
                      </Badge>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-slate-600 tracking-tight mb-4">
                      Real-time analytics and performance metrics for the AMAC Green platform
                    </p>

                    {/* Quick KPI Pills */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                      <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                        {getGrowthIcon(analytics.revenueGrowth)}
                        <span className="text-sm font-bold text-green-900">
                          {analytics.revenueGrowth.toFixed(1)}% Revenue Growth
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-emerald-600 px-4 py-2 rounded-full border border-gray-200">
                        {getGrowthIcon(analytics.orderGrowth)}
                        <span className="text-sm font-bold text-emerald-700">
                          {analytics.orderGrowth.toFixed(1)}% Order Growth
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
                        <Target className="h-4 w-4 text-gray-700" />
                        <span className="text-sm font-bold text-gray-700">
                          {analytics.conversionRate.toFixed(1)}% Conversion
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => setShowFilters(!showFilters)}
                      className="bg-emerald-600 hover:bg-emerald-600"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {showFilters ? 'Hide' : 'Show'} Filters
                    </Button>
                    <Button
                      onClick={() => loadAnalytics()}
                      disabled={loading}
                      variant="outline"
                      className="border border-slate-300"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-emerald-700" />
                  Advanced Filters
                </CardTitle>
                <CardDescription>Customize your analytics view</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="font-semibold">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="font-semibold">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod" className="font-semibold">Payment Method</Label>
                    <Select value={filters.paymentMethod} onValueChange={(value) => handleFilterChange('paymentMethod', value)}>
                      <SelectTrigger className="border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="mpesa_daraja">M-Pesa</SelectItem>
                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status" className="font-semibold">Order Status</Label>
                    <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                      <SelectTrigger className="border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="period" className="font-semibold">Time Period</Label>
                    <Select value={filters.period} onValueChange={(value) => handleFilterChange('period', value as any)}>
                      <SelectTrigger className="border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <Button onClick={applyFilters} className="bg-emerald-600 hover:bg-emerald-600">
                    <Zap className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                  <Button variant="outline" onClick={resetFilters} className="border">
                    Reset All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Selectors */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vendor Performance */}
            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <Building2 className="h-6 w-6 text-emerald-700" />
                  Supplier Performance
                </CardTitle>
                <CardDescription className="text-emerald-700">Detailed supplier analytics</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="vendorSelect" className="font-semibold">Select Supplier</Label>
                    <Select value={selectedVendor} onValueChange={handleVendorSelect}>
                    <SelectTrigger className="border">
                        <SelectValue placeholder="Choose supplier..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Suppliers</SelectItem>
                        <Separator className="my-2" />
                        {vendors.map(vendor => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.companyName} - {vendor.contactPerson}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedVendor !== 'all' && (
                    <Button
                      variant="outline"
                      onClick={() => handleVendorSelect(selectedVendor)}
                      disabled={loadingVendor}
                      className="w-full border"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loadingVendor ? 'animate-spin' : ''}`} />
                      Refresh Data
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <Package className="h-6 w-6 text-emerald-600" />
                  Category Performance
                </CardTitle>
                <CardDescription className="text-emerald-700">Product category analytics</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="categorySelect" className="font-semibold">Select Category</Label>
                    <Select value={selectedCategory} onValueChange={handleCategorySelect}>
                    <SelectTrigger className="border">
                        <SelectValue placeholder="Choose category..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <Separator className="my-2" />
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name} ({category.productCount})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedCategory !== 'all' && (
                    <Button
                      variant="outline"
                      onClick={() => handleCategorySelect(selectedCategory)}
                      disabled={loadingCategory}
                      className="w-full border"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loadingCategory ? 'animate-spin' : ''}`} />
                      Refresh Data
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vendor Performance Details */}
          {showVendorPerformance && vendorPerformance && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{vendorPerformance.companyName}</h2>
                  <p className="text-gray-600 mt-1">{vendorPerformance.vendorName}</p>
                </div>
                <div className="flex items-center gap-3">
                  {vendorPerformance.rating > 0 && (
                    <Badge className="bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-100">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {vendorPerformance.rating.toFixed(1)} ({vendorPerformance.totalReviews})
                    </Badge>
                  )}
                  <Badge className={`${getGrowthColor(vendorPerformance.revenueGrowth)} border border-current hover:bg-transparent`}>
                    {getGrowthIcon(vendorPerformance.revenueGrowth)}
                    {vendorPerformance.revenueGrowth.toFixed(1)}%
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-emerald-200">
                  <CardContent className="p-6 bg-emerald-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl border border-emerald-200 bg-emerald-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-emerald-700" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-emerald-800 uppercase tracking-normal">Revenue</p>
                    <p className="text-2xl font-semibold text-emerald-900 mt-1">
                      KES {vendorPerformance.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-700 mt-2">
                      Avg: KES {vendorPerformance.averageOrderValue.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-sky-200">
                  <CardContent className="p-6 bg-sky-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl border border-sky-200 bg-sky-100 flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-sky-700" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-sky-800 uppercase tracking-normal">Orders</p>
                    <p className="text-2xl font-semibold text-sky-900 mt-1">
                      {vendorPerformance.totalOrders.toLocaleString()}
                    </p>
                    <p className="text-xs text-sky-700 mt-2">
                      {vendorPerformance.orderGrowth > 0 ? '+' : ''}{vendorPerformance.orderGrowth.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardContent className="p-6 bg-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-700" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-normal">Products</p>
                    <p className="text-2xl font-semibold text-gray-700 mt-1">
                      {vendorPerformance.totalProducts}
                    </p>
                    <p className="text-xs text-gray-700 mt-2">
                      {vendorPerformance.conversionRate.toFixed(1)}% with sales
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardContent className="p-6 bg-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center">
                        <Percent className="h-5 w-5 text-gray-700" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-normal">Conversion</p>
                    <p className="text-2xl font-semibold text-gray-700 mt-1">
                      {vendorPerformance.conversionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-700 mt-2">
                      Product performance
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-emerald-700" />
                      Revenue Trend
                    </CardTitle>
                    <CardDescription>Last 12 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SimpleLineChart 
                      data={vendorPerformance.monthlyRevenue.map(m => ({
                        date: m.month,
                        revenue: m.revenue,
                        orders: m.orders
                      }))} 
                      height={250}
                      showOrders={false}
                    />
                  </CardContent>
                </Card>

                <Card className="border border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      Top Products
                    </CardTitle>
                    <CardDescription>Best performers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SimpleBarChart
                      data={vendorPerformance.topProducts.slice(0, 5).map(product => ({
                        name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
                        value: product.revenue
                      }))}
                      height={250}
                      showPercentage={false}
                    />
                  </CardContent>
                </Card>
              </div>

              <Separator className="my-8" />
            </div>
          )}

          {/* Category Performance Details */}
          {showCategoryPerformance && categoryPerformance && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{categoryPerformance.categoryName}</h2>
                  <p className="text-gray-600 mt-1">Category Analytics</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-50">
                    {categoryPerformance.totalProducts} Products
                  </Badge>
                  <Badge className="bg-emerald-600 text-emerald-700 border border-gray-200 hover:bg-emerald-600">
                    {categoryPerformance.supplierCount} Suppliers
                  </Badge>
                  <Badge className={`${getGrowthColor(categoryPerformance.revenueGrowth)} border border-current hover:bg-transparent`}>
                    {getGrowthIcon(categoryPerformance.revenueGrowth)}
                    {categoryPerformance.revenueGrowth.toFixed(1)}%
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-emerald-200">
                  <CardContent className="p-6 bg-emerald-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <DollarSign className="h-10 w-10 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-emerald-800 uppercase tracking-normal">Revenue</p>
                    <p className="text-2xl font-semibold text-emerald-900 mt-1">
                      KES {categoryPerformance.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-700 mt-2">
                      Avg: KES {categoryPerformance.averageOrderValue.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-sky-200">
                  <CardContent className="p-6 bg-sky-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <ShoppingCart className="h-10 w-10 text-sky-600" />
                    </div>
                    <p className="text-sm font-semibold text-sky-800 uppercase tracking-normal">Orders</p>
                    <p className="text-2xl font-semibold text-sky-900 mt-1">
                      {categoryPerformance.totalOrders.toLocaleString()}
                    </p>
                    <p className="text-xs text-sky-700 mt-2">
                      {categoryPerformance.totalQuantitySold.toLocaleString()} units
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardContent className="p-6 bg-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <Package className="h-10 w-10 text-gray-700" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-normal">Products</p>
                    <p className="text-2xl font-semibold text-gray-700 mt-1">
                      {categoryPerformance.totalProducts}
                    </p>
                    <p className="text-xs text-gray-700 mt-2">
                      {categoryPerformance.supplierCount} suppliers
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardContent className="p-6 bg-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <TrendingUp className="h-10 w-10 text-gray-700" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-normal">Growth</p>
                    <p className="text-2xl font-semibold text-gray-700 mt-1">
                      {categoryPerformance.orderGrowth.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-700 mt-2">
                      Last 30 days
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-emerald-700" />
                      Revenue Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {categoryPerformance.revenueByMonth.length > 0 ? (
                      <SimpleLineChart 
                        data={categoryPerformance.revenueByMonth.map(item => ({
                          date: item.month,
                          revenue: item.revenue,
                          orders: item.orders
                        }))} 
                        height={250}
                        showOrders={true}
                      />
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-gray-500">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-emerald-600" />
                      Top Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {categoryPerformance.topProducts.length > 0 ? (
                      <div className="space-y-3">
                        {categoryPerformance.topProducts.map((product, index) => (
                          <div key={product.id} className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-600">
                                  {product.quantitySold} units • {product.orders} orders
                                </p>
                              </div>
                            </div>
                            <p className="font-bold text-emerald-700">
                              KES {product.revenue.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-gray-500">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Separator className="my-8" />
            </div>
          )}

          {/* Platform Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-green-200">
              <CardContent className="p-6 bg-green-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl border border-green-200 bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-700" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-green-800 uppercase tracking-normal">Total Revenue</p>
                <p className="text-3xl font-semibold text-green-900 mt-2">
                  KES {analytics.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-green-700 mt-2">
                  Commission: KES {analytics.platformCommission.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6 bg-emerald-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl border border-gray-200 bg-emerald-600 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-emerald-700" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-emerald-700 uppercase tracking-normal">Total Orders</p>
                <p className="text-3xl font-semibold text-emerald-700 mt-2">
                  {analytics.totalOrders.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-700 mt-2">
                  Avg: KES {analytics.averageOrderValue.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6 bg-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center">
                    <Target className="h-6 w-6 text-gray-700" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-normal">Conversion</p>
                <p className="text-3xl font-semibold text-gray-700 mt-2">
                  {analytics.conversionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-700 mt-2">
                  Orders to payments
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6 bg-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-gray-700" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-normal">Delivery</p>
                <p className="text-3xl font-semibold text-gray-700 mt-2">
                  KES {analytics.deliveryRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-700 mt-2">
                  Revenue from fees
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Users */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-gray-200">
              <CardContent className="p-6 bg-emerald-600">
                <Users className="h-10 w-10 text-emerald-700 mb-3" />
                <p className="text-sm font-semibold text-emerald-700">Customers</p>
                <p className="text-2xl font-semibold text-emerald-700 mt-2">
                  {analytics.totalCustomers.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-green-200">
              <CardContent className="p-6 bg-green-50/40">
                <Building2 className="h-10 w-10 text-green-600 mb-3" />
                <p className="text-sm font-semibold text-green-800">Suppliers</p>
                <p className="text-2xl font-semibold text-green-900 mt-2">
                  {analytics.totalVendors.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6 bg-gray-100">
                <UserCheck className="h-10 w-10 text-gray-700 mb-3" />
                <p className="text-sm font-semibold text-gray-700">Professionals</p>
                <p className="text-2xl font-semibold text-gray-700 mt-2">
                  {analytics.totalProfessionals.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-6 bg-gray-100">
                <Truck className="h-10 w-10 text-gray-700 mb-3" />
                <p className="text-sm font-semibold text-gray-700">Delivery Partners</p>
                <p className="text-2xl font-semibold text-gray-700 mt-2">
                  {analytics.totalDeliveryPartners.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-emerald-700" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>{filters.period.charAt(0).toUpperCase() + filters.period.slice(1)} overview</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart 
                  data={analytics.dailyRevenue} 
                  height={250}
                  showOrders={false}
                />
              </CardContent>
            </Card>

            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Orders Trend
                </CardTitle>
                <CardDescription>{filters.period.charAt(0).toUpperCase() + filters.period.slice(1)} count</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart 
                  data={analytics.dailyRevenue} 
                  height={250}
                  showOrders={true}
                />
              </CardContent>
            </Card>

            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-gray-700" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart
                  data={analytics.revenueByPaymentMethod.map(method => ({
                    name: method.method,
                    value: method.revenue,
                    percentage: method.percentage
                  }))}
                  height={250}
                  showPercentage={true}
                  horizontal={true}
                />
              </CardContent>
            </Card>

            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-gray-700" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart
                  data={analytics.ordersByStatus.map(status => ({
                    name: status.status,
                    value: status.count,
                    percentage: status.percentage
                  }))}
                  height={250}
                  showPercentage={true}
                />
              </CardContent>
            </Card>

            {analytics.financingByStatus?.length > 0 && (
              <Card className="border border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-emerald-700" />
                    Financing status
                  </CardTitle>
                  <CardDescription>KCB financing pipeline (all orders in range)</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart
                    data={analytics.financingByStatus.map((row) => ({
                      name: row.status,
                      value: row.count,
                      percentage: row.percentage,
                    }))}
                    height={220}
                    showPercentage={true}
                  />
                </CardContent>
              </Card>
            )}

            {analytics.fulfillmentByStage?.length > 0 && (
              <Card className="border border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-700" />
                    Fulfilment stage
                  </CardTitle>
                  <CardDescription>Deployments (spec §4.5)</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart
                    data={analytics.fulfillmentByStage.map((row) => ({
                      name: row.status,
                      value: row.count,
                      percentage: row.percentage,
                    }))}
                    height={220}
                    showPercentage={true}
                  />
                </CardContent>
              </Card>
            )}

            {analytics.ordersByCounty?.length > 0 && (
              <Card className="border border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-emerald-700" />
                    Orders by city (shipping)
                  </CardTitle>
                  <CardDescription>From order shipping_city</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart
                    data={analytics.ordersByCounty.map((row) => ({
                      name: row.county,
                      value: row.count,
                      percentage: row.percentage,
                    }))}
                    height={220}
                    showPercentage={true}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Top Products */}
          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Top Products by Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {analytics.topProducts.slice(0, 8).map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 bg-green-50/60 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-600">{product.orders} units sold</p>
                      </div>
                    </div>
                    <p className="font-bold text-green-700">
                      KES {product.revenue.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}