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

export default function SuperAdminDashboard() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  useEffect(() => {
    loadAnalytics()
    loadVendors()
    loadCategories()
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
    if (growth < 0) return "text-red-600"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <Activity className="absolute inset-0 m-auto h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Analytics</h2>
          <p className="text-gray-600">Preparing executive dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Analytics Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => loadAnalytics()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Executive Header */}
          <div className="relative overflow-hidden">
            <Card className="border-2 border-blue-300 shadow-2xl">
              <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-x"></div>
              
              {/* Background orbs */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
              
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                  {/* Executive Badge */}
                  <div className="relative">
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Sparkles className="h-14 w-14 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl animate-pulse">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Platform Overview */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
                      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        Executive Dashboard
                      </h1>
                      <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 text-sm px-4 py-1">
                        <Globe className="h-3 w-3 mr-1" />
                        Platform Overview
                      </Badge>
                    </div>
                    
                    <p className="text-lg text-gray-700 mb-4">
                      Real-time analytics and performance metrics for the AMAC Green platform
                    </p>

                    {/* Quick KPI Pills */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border-2 border-green-300">
                        {getGrowthIcon(analytics.revenueGrowth)}
                        <span className="text-sm font-bold text-green-900">
                          {analytics.revenueGrowth.toFixed(1)}% Revenue Growth
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full border-2 border-blue-300">
                        {getGrowthIcon(analytics.orderGrowth)}
                        <span className="text-sm font-bold text-blue-900">
                          {analytics.orderGrowth.toFixed(1)}% Order Growth
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full border-2 border-purple-300">
                        <Target className="h-4 w-4 text-purple-700" />
                        <span className="text-sm font-bold text-purple-900">
                          {analytics.conversionRate.toFixed(1)}% Conversion
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => setShowFilters(!showFilters)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {showFilters ? 'Hide' : 'Show'} Filters
                    </Button>
                    <Button
                      onClick={() => loadAnalytics()}
                      disabled={loading}
                      variant="outline"
                      className="border-2 border-blue-300"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="border-2 border-indigo-200">
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-indigo-600" />
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
                      className="border-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="font-semibold">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="border-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod" className="font-semibold">Payment Method</Label>
                    <Select value={filters.paymentMethod} onValueChange={(value) => handleFilterChange('paymentMethod', value)}>
                      <SelectTrigger className="border-2">
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
                      <SelectTrigger className="border-2">
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
                      <SelectTrigger className="border-2">
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
                  <Button onClick={applyFilters} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Zap className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                  <Button variant="outline" onClick={resetFilters} className="border-2">
                    Reset All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Selectors */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vendor Performance */}
            <Card className="border-2 border-indigo-200">
              <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <CardHeader className="bg-gradient-to-br from-indigo-50 to-purple-50">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <Building2 className="h-6 w-6 text-indigo-600" />
                  Supplier Performance
                </CardTitle>
                <CardDescription className="text-indigo-700">Detailed supplier analytics</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="vendorSelect" className="font-semibold">Select Supplier</Label>
                    <Select value={selectedVendor} onValueChange={handleVendorSelect}>
                      <SelectTrigger className="border-2">
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
                      className="w-full border-2"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loadingVendor ? 'animate-spin' : ''}`} />
                      Refresh Data
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card className="border-2 border-emerald-200">
              <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
              <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50">
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
                      <SelectTrigger className="border-2">
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
                      className="w-full border-2"
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
                  <h2 className="text-3xl font-extrabold text-gray-900">{vendorPerformance.companyName}</h2>
                  <p className="text-gray-600 mt-1">{vendorPerformance.vendorName}</p>
                </div>
                <div className="flex items-center gap-3">
                  {vendorPerformance.rating > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-2 border-yellow-300">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {vendorPerformance.rating.toFixed(1)} ({vendorPerformance.totalReviews})
                    </Badge>
                  )}
                  <Badge className={`${getGrowthColor(vendorPerformance.revenueGrowth)} border-2 border-current`}>
                    {getGrowthIcon(vendorPerformance.revenueGrowth)}
                    {vendorPerformance.revenueGrowth.toFixed(1)}%
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 border-emerald-300">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  <CardContent className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
                    <div className="flex items-center justify-between mb-3">
                      <DollarSign className="h-10 w-10 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Revenue</p>
                    <p className="text-3xl font-extrabold text-emerald-900 mt-1">
                      KES {vendorPerformance.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-700 mt-2">
                      Avg: KES {vendorPerformance.averageOrderValue.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-sky-300">
                  <div className="h-2 bg-gradient-to-r from-sky-500 to-blue-500"></div>
                  <CardContent className="p-6 bg-gradient-to-br from-sky-50 to-blue-50">
                    <div className="flex items-center justify-between mb-3">
                      <ShoppingCart className="h-10 w-10 text-sky-600" />
                    </div>
                    <p className="text-sm font-semibold text-sky-800 uppercase tracking-wide">Orders</p>
                    <p className="text-3xl font-extrabold text-sky-900 mt-1">
                      {vendorPerformance.totalOrders.toLocaleString()}
                    </p>
                    <p className="text-xs text-sky-700 mt-2">
                      {vendorPerformance.orderGrowth > 0 ? '+' : ''}{vendorPerformance.orderGrowth.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-violet-300">
                  <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-500"></div>
                  <CardContent className="p-6 bg-gradient-to-br from-violet-50 to-purple-50">
                    <div className="flex items-center justify-between mb-3">
                      <Package className="h-10 w-10 text-violet-600" />
                    </div>
                    <p className="text-sm font-semibold text-violet-800 uppercase tracking-wide">Products</p>
                    <p className="text-3xl font-extrabold text-violet-900 mt-1">
                      {vendorPerformance.totalProducts}
                    </p>
                    <p className="text-xs text-violet-700 mt-2">
                      {vendorPerformance.conversionRate.toFixed(1)}% with sales
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-amber-300">
                  <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                  <CardContent className="p-6 bg-gradient-to-br from-amber-50 to-orange-50">
                    <div className="flex items-center justify-between mb-3">
                      <Percent className="h-10 w-10 text-amber-600" />
                    </div>
                    <p className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Conversion</p>
                    <p className="text-3xl font-extrabold text-amber-900 mt-1">
                      {vendorPerformance.conversionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-amber-700 mt-2">
                      Product performance
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-blue-200">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-blue-600" />
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

                <Card className="border-2 border-emerald-200">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
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
                  <h2 className="text-3xl font-extrabold text-gray-900">{categoryPerformance.categoryName}</h2>
                  <p className="text-gray-600 mt-1">Category Analytics</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-100 text-emerald-800 border-2 border-emerald-300">
                    {categoryPerformance.totalProducts} Products
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 border-2 border-blue-300">
                    {categoryPerformance.supplierCount} Suppliers
                  </Badge>
                  <Badge className={`${getGrowthColor(categoryPerformance.revenueGrowth)} border-2 border-current`}>
                    {getGrowthIcon(categoryPerformance.revenueGrowth)}
                    {categoryPerformance.revenueGrowth.toFixed(1)}%
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 border-emerald-300">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  <CardContent className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
                    <div className="flex items-center justify-between mb-3">
                      <DollarSign className="h-10 w-10 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Revenue</p>
                    <p className="text-3xl font-extrabold text-emerald-900 mt-1">
                      KES {categoryPerformance.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-emerald-700 mt-2">
                      Avg: KES {categoryPerformance.averageOrderValue.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-sky-300">
                  <div className="h-2 bg-gradient-to-r from-sky-500 to-blue-500"></div>
                  <CardContent className="p-6 bg-gradient-to-br from-sky-50 to-blue-50">
                    <div className="flex items-center justify-between mb-3">
                      <ShoppingCart className="h-10 w-10 text-sky-600" />
                    </div>
                    <p className="text-sm font-semibold text-sky-800 uppercase tracking-wide">Orders</p>
                    <p className="text-3xl font-extrabold text-sky-900 mt-1">
                      {categoryPerformance.totalOrders.toLocaleString()}
                    </p>
                    <p className="text-xs text-sky-700 mt-2">
                      {categoryPerformance.totalQuantitySold.toLocaleString()} units
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-300">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="flex items-center justify-between mb-3">
                      <Package className="h-10 w-10 text-purple-600" />
                    </div>
                    <p className="text-sm font-semibold text-purple-800 uppercase tracking-wide">Products</p>
                    <p className="text-3xl font-extrabold text-purple-900 mt-1">
                      {categoryPerformance.totalProducts}
                    </p>
                    <p className="text-xs text-purple-700 mt-2">
                      {categoryPerformance.supplierCount} suppliers
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-300">
                  <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
                  <CardContent className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
                    <div className="flex items-center justify-between mb-3">
                      <TrendingUp className="h-10 w-10 text-orange-600" />
                    </div>
                    <p className="text-sm font-semibold text-orange-800 uppercase tracking-wide">Growth</p>
                    <p className="text-3xl font-extrabold text-orange-900 mt-1">
                      {categoryPerformance.orderGrowth.toFixed(1)}%
                    </p>
                    <p className="text-xs text-orange-700 mt-2">
                      Last 30 days
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-blue-200">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-blue-600" />
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

                <Card className="border-2 border-emerald-200">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
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
                          <div key={product.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-full flex items-center justify-center font-bold">
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
            <Card className="border-2 border-green-300">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardContent className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="flex items-center justify-between mb-3">
                  <DollarSign className="h-12 w-12 text-green-600" />
                </div>
                <p className="text-sm font-semibold text-green-800 uppercase tracking-wide">Total Revenue</p>
                <p className="text-4xl font-extrabold text-green-900 mt-2">
                  KES {analytics.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-green-700 mt-2">
                  Commission: KES {analytics.platformCommission.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-300">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between mb-3">
                  <ShoppingCart className="h-12 w-12 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Total Orders</p>
                <p className="text-4xl font-extrabold text-blue-900 mt-2">
                  {analytics.totalOrders.toLocaleString()}
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Avg: KES {analytics.averageOrderValue.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-300">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="flex items-center justify-between mb-3">
                  <Target className="h-12 w-12 text-purple-600" />
                </div>
                <p className="text-sm font-semibold text-purple-800 uppercase tracking-wide">Conversion</p>
                <p className="text-4xl font-extrabold text-purple-900 mt-2">
                  {analytics.conversionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-purple-700 mt-2">
                  Orders to payments
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-300">
              <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500"></div>
              <CardContent className="p-6 bg-gradient-to-br from-orange-50 to-amber-50">
                <div className="flex items-center justify-between mb-3">
                  <Truck className="h-12 w-12 text-orange-600" />
                </div>
                <p className="text-sm font-semibold text-orange-800 uppercase tracking-wide">Delivery</p>
                <p className="text-4xl font-extrabold text-orange-900 mt-2">
                  KES {analytics.deliveryRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-orange-700 mt-2">
                  Revenue from fees
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Users */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-blue-200 hover:shadow-xl transition-all">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                <Users className="h-10 w-10 text-blue-600 mb-3" />
                <p className="text-sm font-semibold text-blue-800">Customers</p>
                <p className="text-3xl font-extrabold text-blue-900 mt-2">
                  {analytics.totalCustomers.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:shadow-xl transition-all">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardContent className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <Building2 className="h-10 w-10 text-green-600 mb-3" />
                <p className="text-sm font-semibold text-green-800">Suppliers</p>
                <p className="text-3xl font-extrabold text-green-900 mt-2">
                  {analytics.totalVendors.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:shadow-xl transition-all">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <UserCheck className="h-10 w-10 text-purple-600 mb-3" />
                <p className="text-sm font-semibold text-purple-800">Professionals</p>
                <p className="text-3xl font-extrabold text-purple-900 mt-2">
                  {analytics.totalProfessionals.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 hover:shadow-xl transition-all">
              <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500"></div>
              <CardContent className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
                <Truck className="h-10 w-10 text-orange-600 mb-3" />
                <p className="text-sm font-semibold text-orange-800">Delivery Partners</p>
                <p className="text-3xl font-extrabold text-orange-900 mt-2">
                  {analytics.totalDeliveryPartners.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-200">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-blue-600" />
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

            <Card className="border-2 border-emerald-200">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
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

            <Card className="border-2 border-purple-200">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
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

            <Card className="border-2 border-amber-200">
              <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
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
          </div>

          {/* Top Products */}
          <Card className="border-2 border-green-200">
            <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Top Products by Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {analytics.topProducts.slice(0, 8).map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
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

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  )
}