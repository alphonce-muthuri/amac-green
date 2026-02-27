"use server"

import { supabaseAdmin } from "@/lib/supabase-server"
import { createServerClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function getVendorStats(vendorId?: string) {
  try {
    let vendor_id = vendorId

    // If no vendorId provided, get from session
    if (!vendor_id) {
      const cookieStore = await cookies()
      const supabase = createServerClient(cookieStore)
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return { success: false, error: "User not authenticated" }
      }
      
      vendor_id = user.id
    }

    console.log('[VENDOR_STATS] Getting stats for vendor:', vendor_id)

    // Get product count
    const { count: productCount, error: productError } = await supabaseAdmin
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("vendor_id", vendor_id)
      .eq("status", "active")

    if (productError) {
      console.error('[VENDOR_STATS] Error fetching product count:', productError)
    }

    // Get vendor orders through order_items
    const { data: orderItems, error: orderItemsError } = await supabaseAdmin
      .from("order_items")
      .select(`
        *,
        orders(
          id,
          order_number,
          status,
          payment_status,
          total_amount,
          created_at
        )
      `)
      .eq("vendor_id", vendor_id)

    if (orderItemsError) {
      console.error('[VENDOR_STATS] Error fetching order items:', orderItemsError)
      return {
        success: true,
        data: {
          totalProducts: productCount || 0,
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
        }
      }
    }

    // Group by order to get unique orders
    const orderMap = new Map()
    let totalVendorRevenue = 0

    orderItems?.forEach((item) => {
      const orderId = item.orders.id
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          ...item.orders,
          vendor_items: [],
          vendor_total: 0
        })
      }
      
      // Add this item to the order
      orderMap.get(orderId).vendor_items.push(item)
      orderMap.get(orderId).vendor_total += parseFloat(item.total_price)
      
      // Add to total vendor revenue
      totalVendorRevenue += parseFloat(item.total_price)
    })

    const uniqueOrders = Array.from(orderMap.values())
    
    // Calculate stats
    const totalOrders = uniqueOrders.length
    const pendingOrders = uniqueOrders.filter(order => 
      order.status === 'pending' || order.status === 'confirmed' || order.payment_status === 'pending'
    ).length

    console.log('[VENDOR_STATS] Calculated stats:', {
      totalProducts: productCount || 0,
      totalOrders,
      totalRevenue: totalVendorRevenue,
      pendingOrders
    })

    return {
      success: true,
      data: {
        totalProducts: productCount || 0,
        totalOrders,
        totalRevenue: totalVendorRevenue,
        pendingOrders,
      }
    }
  } catch (error) {
    console.error('[VENDOR_STATS] Unexpected error:', error)
    return { 
      success: false, 
      error: "Failed to fetch vendor stats",
      data: {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
      }
    }
  }
}