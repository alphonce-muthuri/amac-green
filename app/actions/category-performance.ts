"use server"

import { createServerClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export interface CategoryPerformance {
  categoryId: string
  categoryName: string
  categorySlug: string
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalQuantitySold: number
  averageOrderValue: number
  revenueGrowth: number
  orderGrowth: number
  topProducts: Array<{
    id: string
    name: string
    revenue: number
    quantitySold: number
    orders: number
  }>
  revenueByMonth: Array<{
    month: string
    revenue: number
    orders: number
  }>
  supplierCount: number
}

export interface CategoryListItem {
  id: string
  name: string
  slug: string
  productCount: number
}

export async function getAllCategories() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { data: categories, error } = await supabase
      .from('product_categories')
      .select(`
        id,
        name,
        slug,
        products (count)
      `)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return { success: false, error: error.message }
    }

    const categoryList: CategoryListItem[] = categories?.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      productCount: cat.products?.[0]?.count || 0
    })) || []

    return { success: true, data: categoryList }
  } catch (error) {
    console.error('Error in getAllCategories:', error)
    return { success: false, error: 'Failed to fetch categories' }
  }
}

export async function getCategoryPerformance(categoryId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get category details
    const { data: category, error: categoryError } = await supabase
      .from('product_categories')
      .select('id, name, slug')
      .eq('id', categoryId)
      .single()

    if (categoryError || !category) {
      return { success: false, error: 'Category not found' }
    }

    // Get all products in this category
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, vendor_id')
      .eq('category_id', categoryId)
      .eq('status', 'active')

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return { success: false, error: 'Failed to fetch products' }
    }

    const productIds = products?.map(p => p.id) || []
    const vendorIds = [...new Set(products?.map(p => p.vendor_id) || [])]

    if (productIds.length === 0) {
      // No products in this category
      return {
        success: true,
        data: {
          categoryId: category.id,
          categoryName: category.name,
          categorySlug: category.slug,
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          totalQuantitySold: 0,
          averageOrderValue: 0,
          revenueGrowth: 0,
          orderGrowth: 0,
          topProducts: [],
          revenueByMonth: [],
          supplierCount: 0
        }
      }
    }

    // Get order items for products in this category
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        product_id,
        quantity,
        price,
        orders!inner (
          id,
          status,
          total_amount,
          created_at
        )
      `)
      .in('product_id', productIds)
      .in('orders.status', ['completed', 'processing', 'shipped', 'delivered'])

    if (orderItemsError) {
      console.error('Error fetching order items:', orderItemsError)
      return { success: false, error: 'Failed to fetch order data' }
    }

    // Calculate metrics
    const totalRevenue = orderItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
    const totalOrders = new Set(orderItems?.map(item => item.orders.id)).size
    const totalQuantitySold = orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate growth (compare last 30 days vs previous 30 days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const recentItems = orderItems?.filter(item => 
      new Date(item.orders.created_at) >= thirtyDaysAgo
    ) || []
    const previousItems = orderItems?.filter(item => {
      const date = new Date(item.orders.created_at)
      return date >= sixtyDaysAgo && date < thirtyDaysAgo
    }) || []

    const recentRevenue = recentItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const previousRevenue = previousItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const recentOrders = new Set(recentItems.map(item => item.orders.id)).size
    const previousOrders = new Set(previousItems.map(item => item.orders.id)).size

    const revenueGrowth = previousRevenue > 0 
      ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0
    const orderGrowth = previousOrders > 0 
      ? ((recentOrders - previousOrders) / previousOrders) * 100 
      : 0

    // Top products
    const productStats = new Map<string, { name: string; revenue: number; quantity: number; orders: Set<string> }>()
    
    orderItems?.forEach(item => {
      const product = products?.find(p => p.id === item.product_id)
      if (!product) return

      const existing = productStats.get(item.product_id) || {
        name: product.name,
        revenue: 0,
        quantity: 0,
        orders: new Set<string>()
      }

      existing.revenue += item.price * item.quantity
      existing.quantity += item.quantity
      existing.orders.add(item.orders.id)

      productStats.set(item.product_id, existing)
    })

    const topProducts = Array.from(productStats.entries())
      .map(([id, stats]) => ({
        id,
        name: stats.name,
        revenue: stats.revenue,
        quantitySold: stats.quantity,
        orders: stats.orders.size
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Revenue by month (last 6 months)
    const monthlyData = new Map<string, { revenue: number; orders: Set<string> }>()
    
    orderItems?.forEach(item => {
      const date = new Date(item.orders.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const existing = monthlyData.get(monthKey) || { revenue: 0, orders: new Set<string>() }
      existing.revenue += item.price * item.quantity
      existing.orders.add(item.orders.id)
      monthlyData.set(monthKey, existing)
    })

    const revenueByMonth = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        orders: data.orders.size
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)

    const performance: CategoryPerformance = {
      categoryId: category.id,
      categoryName: category.name,
      categorySlug: category.slug,
      totalRevenue,
      totalOrders,
      totalProducts: products?.length || 0,
      totalQuantitySold,
      averageOrderValue,
      revenueGrowth,
      orderGrowth,
      topProducts,
      revenueByMonth,
      supplierCount: vendorIds.length
    }

    return { success: true, data: performance }
  } catch (error) {
    console.error('Error in getCategoryPerformance:', error)
    return { success: false, error: 'Failed to fetch category performance' }
  }
}
