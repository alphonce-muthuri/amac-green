"use server"

import { supabaseAdmin } from "@/lib/supabase-server"

export interface PlatformAnalytics {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalVendors: number
  totalProfessionals: number
  totalDeliveryPartners: number
  monthlyRevenue: Array<{ month: string; revenue: number; orders: number }>
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>
  topProducts: Array<{ name: string; revenue: number; orders: number }>
  revenueByPaymentMethod: Array<{ method: string; revenue: number; percentage: number }>
  ordersByStatus: Array<{ status: string; count: number; percentage: number }>
  averageOrderValue: number
  conversionRate: number
  platformCommission: number
  deliveryRevenue: number
  revenueGrowth: number
  orderGrowth: number
  financingByStatus: Array<{ status: string; count: number; percentage: number }>
  fulfillmentByStage: Array<{ status: string; count: number; percentage: number }>
  ordersByCounty: Array<{ county: string; count: number; percentage: number }>
}

export interface AnalyticsFilters {
  startDate?: string
  endDate?: string
  paymentMethod?: string
  status?: string
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export async function getPlatformAnalytics(filters?: AnalyticsFilters): Promise<{ success: boolean; data?: PlatformAnalytics; error?: string }> {
  try {
    console.log('[SUPER_ADMIN] Fetching platform analytics with filters:', filters)

    // Build query filters
    let revenueQuery = supabaseAdmin
      .from('orders')
      .select('total_amount, payment_method, created_at, status')
      .eq('payment_status', 'paid')

    let ordersQuery = supabaseAdmin
      .from('orders')
      .select('id, status, created_at, total_amount, payment_status, financing_status, fulfillment_stage, shipping_city')

    // Apply date filters
    if (filters?.startDate) {
      revenueQuery = revenueQuery.gte('created_at', filters.startDate)
      ordersQuery = ordersQuery.gte('created_at', filters.startDate)
    }
    if (filters?.endDate) {
      revenueQuery = revenueQuery.lte('created_at', filters.endDate)
      ordersQuery = ordersQuery.lte('created_at', filters.endDate)
    }

    // Apply payment method filter
    if (filters?.paymentMethod && filters.paymentMethod !== 'all') {
      revenueQuery = revenueQuery.eq('payment_method', filters.paymentMethod)
    }

    // Apply status filter
    if (filters?.status && filters.status !== 'all') {
      ordersQuery = ordersQuery.eq('status', filters.status)
    }

    const { data: revenueData, error: revenueError } = await revenueQuery
    if (revenueError) {
      console.error('[SUPER_ADMIN] Revenue query error:', revenueError)
      return { success: false, error: revenueError.message }
    }

    const { data: ordersData, error: ordersError } = await ordersQuery
    if (ordersError) {
      console.error('[SUPER_ADMIN] Orders query error:', ordersError)
      return { success: false, error: ordersError.message }
    }

    // Get customer count
    const { data: customersData, error: customersError } = await supabaseAdmin
      .from('customer_profiles')
      .select('id')

    if (customersError) {
      console.error('[SUPER_ADMIN] Customers query error:', customersError)
      return { success: false, error: customersError.message }
    }

    // Get vendor count
    const { data: vendorsData, error: vendorsError } = await supabaseAdmin
      .from('vendor_applications')
      .select('id, status')
      .eq('status', 'approved')

    if (vendorsError) {
      console.error('[SUPER_ADMIN] Vendors query error:', vendorsError)
      return { success: false, error: vendorsError.message }
    }

    // Get professional count
    const { data: professionalsData, error: professionalsError } = await supabaseAdmin
      .from('professional_applications')
      .select('id, status')
      .eq('status', 'approved')

    if (professionalsError) {
      console.error('[SUPER_ADMIN] Professionals query error:', professionalsError)
      return { success: false, error: professionalsError.message }
    }

    // Get delivery partners count
    const { data: deliveryData, error: deliveryError } = await supabaseAdmin
      .from('delivery_applications')
      .select('id, status')
      .eq('status', 'approved')

    if (deliveryError) {
      console.error('[SUPER_ADMIN] Delivery query error:', deliveryError)
      return { success: false, error: deliveryError.message }
    }

    // Get order items for product analysis
    const { data: orderItemsData, error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        product_name,
        quantity,
        unit_price,
        total_price,
        orders!inner(payment_status)
      `)
      .eq('orders.payment_status', 'paid')

    if (orderItemsError) {
      console.error('[SUPER_ADMIN] Order items query error:', orderItemsError)
      return { success: false, error: orderItemsError.message }
    }

    // Calculate analytics
    const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0) || 0
    const totalOrders = ordersData?.length || 0
    const totalCustomers = customersData?.length || 0
    const totalVendors = vendorsData?.length || 0
    const totalProfessionals = professionalsData?.length || 0
    const totalDeliveryPartners = deliveryData?.length || 0

    // Calculate monthly revenue
    const monthlyRevenue = calculateMonthlyRevenue(revenueData || [])

    // Calculate daily revenue
    const dailyRevenue = calculateDailyRevenue(revenueData || [], filters?.period || 'daily')

    // Calculate top products
    const topProducts = calculateTopProducts(orderItemsData || [])

    // Calculate revenue by payment method
    const revenueByPaymentMethod = calculateRevenueByPaymentMethod(revenueData || [])

    // Calculate orders by status
    const ordersByStatus = calculateOrdersByStatus(ordersData || [])

    const financingByStatus = calculateByField(
      ordersData || [],
      (o) => (o as { financing_status?: string }).financing_status || "none",
      "financing"
    )
    const fulfillmentByStage = calculateByField(
      ordersData || [],
      (o) => (o as { fulfillment_stage?: string }).fulfillment_stage || "order_received",
      "fulfillment"
    )

    const ordersByCounty = calculateOrdersByShippingCity(ordersData || [])

    // Calculate average order value
    const paidOrders = revenueData?.length || 0
    const averageOrderValue = paidOrders > 0 ? totalRevenue / paidOrders : 0

    // Calculate conversion rate (paid orders / total orders)
    const conversionRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0

    // Calculate platform commission (assuming 5% commission)
    const platformCommission = totalRevenue * 0.05

    // Calculate delivery revenue (assuming KES 1 per delivery for paid orders)
    const deliveryRevenue = paidOrders * 1

    // Calculate growth metrics
    const { revenueGrowth, orderGrowth } = calculateGrowthMetrics(revenueData || [], ordersData || [])

    const analytics: PlatformAnalytics = {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalVendors,
      totalProfessionals,
      totalDeliveryPartners,
      monthlyRevenue,
      dailyRevenue,
      topProducts,
      revenueByPaymentMethod,
      ordersByStatus,
      averageOrderValue,
      conversionRate,
      platformCommission,
      deliveryRevenue,
      revenueGrowth,
      orderGrowth,
      financingByStatus,
      fulfillmentByStage,
      ordersByCounty,
    }

    console.log('[SUPER_ADMIN] Analytics calculated successfully')
    return { success: true, data: analytics }

  } catch (error) {
    console.error('[SUPER_ADMIN] Analytics error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch analytics' }
  }
}

function calculateMonthlyRevenue(orders: any[]): Array<{ month: string; revenue: number; orders: number }> {
  const monthlyData: { [key: string]: { revenue: number; orders: number } } = {}

  orders.forEach(order => {
    const date = new Date(order.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, orders: 0 }
    }
    
    monthlyData[monthKey].revenue += parseFloat(order.total_amount.toString())
    monthlyData[monthKey].orders += 1
  })

  return Object.entries(monthlyData)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12) // Last 12 months
}

function calculateTopProducts(orderItems: any[]): Array<{ name: string; revenue: number; orders: number }> {
  const productData: { [key: string]: { revenue: number; orders: number } } = {}

  orderItems.forEach(item => {
    const productName = item.product_name
    
    if (!productData[productName]) {
      productData[productName] = { revenue: 0, orders: 0 }
    }
    
    productData[productName].revenue += parseFloat(item.total_price.toString())
    productData[productName].orders += item.quantity
  })

  return Object.entries(productData)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10) // Top 10 products
}

function calculateRevenueByPaymentMethod(orders: any[]): Array<{ method: string; revenue: number; percentage: number }> {
  const methodData: { [key: string]: number } = {}
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0)

  orders.forEach(order => {
    const method = order.payment_method || 'unknown'
    methodData[method] = (methodData[method] || 0) + parseFloat(order.total_amount.toString())
  })

  return Object.entries(methodData)
    .map(([method, revenue]) => ({
      method: method.replace('_', ' ').toUpperCase(),
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

function calculateOrdersByShippingCity(
  orders: { shipping_city?: string | null }[]
): Array<{ county: string; count: number; percentage: number }> {
  const counts: { [key: string]: number } = {}
  orders.forEach((o) => {
    const c = (o.shipping_city || "").trim() || "Unknown"
    counts[c] = (counts[c] || 0) + 1
  })
  const total = orders.length
  return Object.entries(counts)
    .map(([county, count]) => ({
      county,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

function calculateByField(
  orders: any[],
  getKey: (o: any) => string,
  _label: string
): Array<{ status: string; count: number; percentage: number }> {
  const counts: { [key: string]: number } = {}
  const total = orders.length
  orders.forEach((order) => {
    const k = getKey(order) || "unknown"
    counts[k] = (counts[k] || 0) + 1
  })
  return Object.entries(counts)
    .map(([status, count]) => ({
      status: status.replace(/_/g, " "),
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

function calculateOrdersByStatus(orders: any[]): Array<{ status: string; count: number; percentage: number }> {
  const statusData: { [key: string]: number } = {}
  const totalOrders = orders.length

  orders.forEach(order => {
    const status = order.status || 'unknown'
    statusData[status] = (statusData[status] || 0) + 1
  })

  return Object.entries(statusData)
    .map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)
}

function calculateDailyRevenue(orders: any[], period: string): Array<{ date: string; revenue: number; orders: number }> {
  const dailyData: { [key: string]: { revenue: number; orders: number } } = {}

  orders.forEach(order => {
    const date = new Date(order.created_at)
    let dateKey: string

    switch (period) {
      case 'daily':
        dateKey = date.toISOString().split('T')[0]
        break
      case 'weekly':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        dateKey = weekStart.toISOString().split('T')[0]
        break
      case 'monthly':
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'yearly':
        dateKey = date.getFullYear().toString()
        break
      default:
        dateKey = date.toISOString().split('T')[0]
    }
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = { revenue: 0, orders: 0 }
    }
    
    dailyData[dateKey].revenue += parseFloat(order.total_amount.toString())
    dailyData[dateKey].orders += 1
  })

  return Object.entries(dailyData)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30) // Last 30 periods
}

function calculateGrowthMetrics(revenueData: any[], ordersData: any[]): { revenueGrowth: number; orderGrowth: number } {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Current month data
  const currentMonthRevenue = revenueData
    .filter(order => new Date(order.created_at) >= thisMonth)
    .reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0)

  const currentMonthOrders = ordersData
    .filter(order => new Date(order.created_at) >= thisMonth && order.payment_status === 'paid')
    .length

  // Previous month data
  const previousMonthRevenue = revenueData
    .filter(order => {
      const orderDate = new Date(order.created_at)
      return orderDate >= lastMonth && orderDate < thisMonth
    })
    .reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0)

  const previousMonthOrders = ordersData
    .filter(order => {
      const orderDate = new Date(order.created_at)
      return orderDate >= lastMonth && orderDate < thisMonth && order.payment_status === 'paid'
    })
    .length

  // Calculate growth percentages
  const revenueGrowth = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : 0

  const orderGrowth = previousMonthOrders > 0 
    ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100 
    : 0

  return { revenueGrowth, orderGrowth }
}