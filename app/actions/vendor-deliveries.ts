"use server"

import { supabaseAdmin } from "@/lib/supabase-server"
import { createServerClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function getVendorDeliveries(vendorId?: string) {
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

    console.log('[VENDOR_DELIVERIES] Getting deliveries for vendor:', vendor_id)

    // Get all deliveries for orders containing vendor's products
    const { data: deliveries, error } = await supabaseAdmin
      .from("deliveries")
      .select(`
        id,
        order_id,
        delivery_person_id,
        delivery_status,
        delivery_address_line1,
        delivery_city,
        delivery_country,
        delivery_fee,
        estimated_delivery_time,
        actual_delivery_time,
        created_at,
        updated_at,
        orders!inner (
          id,
          order_number,
          status,
          total_amount,
          customer_email,
          shipping_first_name,
          shipping_last_name,
          created_at,
          order_items!inner (
            id,
            vendor_id,
            product_name,
            quantity,
            unit_price,
            total_price,
            products (
              name,
              sku
            )
          )
        ),
        delivery_applications (
          first_name,
          last_name,
          phone,
          vehicle_type,
          vehicle_registration
        )
      `)
      .eq("orders.order_items.vendor_id", vendor_id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error('[VENDOR_DELIVERIES] Error fetching deliveries:', error)
      return { success: false, error: error.message }
    }

    console.log('[VENDOR_DELIVERIES] Found deliveries:', deliveries?.length || 0)

    // Filter and format the deliveries to only include vendor's items
    const formattedDeliveries = deliveries?.map(delivery => {
      // Filter order items to only include this vendor's products
      const vendorItems = delivery.orders.order_items.filter(item => item.vendor_id === vendor_id)
      
      return {
        ...delivery,
        orders: {
          ...delivery.orders,
          order_items: vendorItems,
          vendor_total: vendorItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0)
        }
      }
    }) || []

    return { success: true, data: formattedDeliveries }
  } catch (error) {
    console.error('[VENDOR_DELIVERIES] Unexpected error:', error)
    return { success: false, error: "Failed to fetch vendor deliveries" }
  }
}

export async function getVendorActiveDeliveryLocations(vendorId?: string) {
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

    console.log('[VENDOR_DELIVERY_LOCATIONS] Getting active delivery locations for vendor:', vendor_id)

    // Get active delivery locations for deliveries containing vendor's products
    const { data: locations, error } = await supabaseAdmin
      .from("delivery_locations")
      .select(`
        id,
        delivery_person_id,
        latitude,
        longitude,
        accuracy,
        heading,
        speed,
        is_online,
        is_available,
        battery_level,
        last_updated,
        delivery_applications (
          first_name,
          last_name,
          phone,
          vehicle_type,
          vehicle_registration
        ),
        deliveries!inner (
          id,
          delivery_status,
          orders!inner (
            id,
            order_number,
            order_items!inner (
              vendor_id,
              product_name,
              quantity
            )
          )
        )
      `)
      .eq("deliveries.orders.order_items.vendor_id", vendor_id)
      .eq("is_online", true)
      .gte("last_updated", new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Last 30 minutes

    if (error) {
      console.error('[VENDOR_DELIVERY_LOCATIONS] Error fetching locations:', error)
      return { success: false, error: error.message }
    }

    console.log('[VENDOR_DELIVERY_LOCATIONS] Found active locations:', locations?.length || 0)

    // Format the data to include delivery context
    const formattedLocations = locations?.map(location => {
      // Get vendor-specific deliveries for this driver
      const vendorDeliveries = location.deliveries.filter(delivery => 
        delivery.orders.order_items.some(item => item.vendor_id === vendor_id)
      )

      return {
        ...location,
        vendor_deliveries: vendorDeliveries,
        vendor_products_count: vendorDeliveries.reduce((sum, delivery) => 
          sum + delivery.orders.order_items.filter(item => item.vendor_id === vendor_id).length, 0
        )
      }
    }) || []

    return { success: true, data: formattedLocations }
  } catch (error) {
    console.error('[VENDOR_DELIVERY_LOCATIONS] Unexpected error:', error)
    return { success: false, error: "Failed to fetch vendor delivery locations" }
  }
}

export async function getVendorDeliveryStats(vendorId?: string) {
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

    console.log('[VENDOR_DELIVERY_STATS] Getting delivery stats for vendor:', vendor_id)

    // Get delivery statistics for vendor's products
    const { data: stats, error } = await supabaseAdmin
      .from("deliveries")
      .select(`
        id,
        delivery_status,
        orders!inner (
          order_items!inner (
            vendor_id,
            total_price
          )
        )
      `)
      .eq("orders.order_items.vendor_id", vendor_id)

    if (error) {
      console.error('[VENDOR_DELIVERY_STATS] Error fetching stats:', error)
      return { success: false, error: error.message }
    }

    // Calculate statistics
    const totalDeliveries = stats?.length || 0
    const pendingDeliveries = stats?.filter(d => d.delivery_status === 'assigned' || d.delivery_status === 'picked_up').length || 0
    const completedDeliveries = stats?.filter(d => d.delivery_status === 'delivered').length || 0
    const inTransitDeliveries = stats?.filter(d => d.delivery_status === 'in_transit').length || 0

    // Calculate total value of deliveries
    const totalValue = stats?.reduce((sum, delivery) => {
      const vendorItems = delivery.orders.order_items.filter(item => item.vendor_id === vendor_id)
      return sum + vendorItems.reduce((itemSum, item) => itemSum + parseFloat(item.total_price), 0)
    }, 0) || 0

    return {
      success: true,
      data: {
        totalDeliveries,
        pendingDeliveries,
        completedDeliveries,
        inTransitDeliveries,
        totalValue
      }
    }
  } catch (error) {
    console.error('[VENDOR_DELIVERY_STATS] Unexpected error:', error)
    return { success: false, error: "Failed to fetch vendor delivery stats" }
  }
}