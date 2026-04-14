"use server"

import { supabaseAdmin } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/require-admin"

export interface VendorPerformance {
  vendorId: string
  vendorName: string
  companyName: string
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  averageOrderValue: number
  topProducts: Array<{ name: string; revenue: number; orders: number }>
  monthlyRevenue: Array<{ month: string; revenue: number; orders: number }>
  revenueGrowth: number
  orderGrowth: number
  conversionRate: number
  rating: number
  totalReviews: number
}

export interface VendorListItem {
  id: string
  companyName: string
  contactPerson: string
  email: string
  status: string
}

export async function getAllVendors(): Promise<{ success: boolean; data?: VendorListItem[]; error?: string }> {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('vendor_applications')
      .select('id, user_id, company_name, contact_person, email, status')
      .eq('status', 'approved')
      .order('company_name')

    if (error) {
      console.error('[VENDOR_PERFORMANCE] Error fetching vendors:', error)
      return { success: false, error: error.message }
    }

    const vendors: VendorListItem[] = data?.map(v => ({
      id: v.user_id,
      companyName: v.company_name,
      contactPerson: v.contact_person,
      email: v.email,
      status: v.status
    })) || []

    return { success: true, data: vendors }
  } catch (error) {
    console.error('[VENDOR_PERFORMANCE] Error:', error)
    return { success: false, error: 'Failed to fetch vendors' }
  }
}

export async function getVendorPerformance(vendorId: string): Promise<{ success: boolean; data?: VendorPerformance; error?: string }> {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    console.log('[VENDOR_PERFORMANCE] Fetching performance for vendor:', vendorId)

    // Get vendor info
    const { data: vendorData, error: vendorError } = await supabaseAdmin
      .from('vendor_applications')
      .select('company_name, contact_person')
      .eq('user_id', vendorId)
      .single()

    if (vendorError) {
      console.error('[VENDOR_PERFORMANCE] Vendor query error:', vendorError)
      return { success: false, error: vendorError.message }
    }

    // Get vendor's products
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, price')
      .eq('vendor_id', vendorId)

    if (productsError) {
      console.error('[VENDOR_PERFORMANCE] Products query error:', productsError)
      return { success: false, error: productsError.message }
    }

    const productIds = productsData?.map(p => p.id) || []

    // Get order items for vendor's products
    const { data: orderItemsData, error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .select(`
        product_id,
        product_name,
        quantity,
        unit_price,
        total_price,
        orders!inner(
          id,
          payment_status,
          created_at,
          total_amount
        )
      `)
      .in('product_id', productIds)
      .eq('orders.payment_status', 'paid')

    if (orderItemsError) {
      console.error('[VENDOR_PERFORMANCE] Order items query error:', orderItemsError)
      return { success: false, error: orderItemsError.message }
    }

    // Get product reviews
    const { data: reviewsData, error: reviewsError } = await supabaseAdmin
      .from('product_reviews')
      .select('rating')
      .in('product_id', productIds)

    if (reviewsError) {
      console.error('[VENDOR_PERFORMANCE] Reviews query error:', reviewsError)
    }

    // Calculate metrics
    const totalRevenue = orderItemsData?.reduce((sum, item) => sum + parseFloat(item.total_price.toString()), 0) || 0
    
    // Get unique orders
    const uniqueOrders = new Set(orderItemsData?.map(item => item.orders.id) || [])
    const totalOrders = uniqueOrders.size

    const totalProducts = productsData?.length || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate top products
    const productRevenue: { [key: string]: { revenue: number; orders: number; name: string } } = {}
    orderItemsData?.forEach(item => {
      const productId = item.product_id
      if (!productRevenue[productId]) {
        productRevenue[productId] = { revenue: 0, orders: 0, name: item.product_name }
      }
      productRevenue[productId].revenue += parseFloat(item.total_price.toString())
      productRevenue[productId].orders += item.quantity
    })

    const topProducts = Object.values(productRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Calculate monthly revenue
    const monthlyData: { [key: string]: { revenue: number; orders: Set<string> } } = {}
    orderItemsData?.forEach(item => {
      const date = new Date(item.orders.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, orders: new Set() }
      }
      
      monthlyData[monthKey].revenue += parseFloat(item.total_price.toString())
      monthlyData[monthKey].orders.add(item.orders.id)
    })

    const monthlyRevenue = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        orders: data.orders.size
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12)

    // Calculate growth metrics
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const lastMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`

    const currentMonthData = monthlyData[thisMonth]
    const previousMonthData = monthlyData[lastMonth]

    const revenueGrowth = previousMonthData?.revenue > 0
      ? ((currentMonthData?.revenue || 0) - previousMonthData.revenue) / previousMonthData.revenue * 100
      : 0

    const orderGrowth = previousMonthData?.orders.size > 0
      ? ((currentMonthData?.orders.size || 0) - previousMonthData.orders.size) / previousMonthData.orders.size * 100
      : 0

    // Calculate rating
    const totalReviews = reviewsData?.length || 0
    const rating = totalReviews > 0
      ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0

    // Calculate conversion rate (products with sales / total products)
    const productsWithSales = new Set(orderItemsData?.map(item => item.product_id) || [])
    const conversionRate = totalProducts > 0 ? (productsWithSales.size / totalProducts) * 100 : 0

    const performance: VendorPerformance = {
      vendorId,
      vendorName: vendorData.contact_person,
      companyName: vendorData.company_name,
      totalRevenue,
      totalOrders,
      totalProducts,
      averageOrderValue,
      topProducts,
      monthlyRevenue,
      revenueGrowth,
      orderGrowth,
      conversionRate,
      rating,
      totalReviews
    }

    console.log('[VENDOR_PERFORMANCE] Performance calculated successfully')
    return { success: true, data: performance }

  } catch (error) {
    console.error('[VENDOR_PERFORMANCE] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch vendor performance' }
  }
}

export async function getAllVendorsPerformance(): Promise<{ success: boolean; data?: VendorPerformance[]; error?: string }> {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    const vendorsResult = await getAllVendors()
    
    if (!vendorsResult.success || !vendorsResult.data) {
      return { success: false, error: vendorsResult.error }
    }

    const performancePromises = vendorsResult.data.map(vendor => getVendorPerformance(vendor.id))
    const performanceResults = await Promise.all(performancePromises)

    const performances = performanceResults
      .filter(result => result.success && result.data)
      .map(result => result.data!)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)

    return { success: true, data: performances }
  } catch (error) {
    console.error('[VENDOR_PERFORMANCE] Error fetching all vendors performance:', error)
    return { success: false, error: 'Failed to fetch vendors performance' }
  }
}