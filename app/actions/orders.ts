"use server"

import { supabaseAdmin } from "@/lib/supabase-server"
import { createServerClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import type { CreateOrderData } from "@/lib/types/order"
import { requireAdmin } from "@/lib/require-admin"

// Generate a proper UUID for simulation
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export async function createOrder(orderData: any) {
  try {
    // Check if we're in simulation mode - Use environment variable or default to false
    const isSimulation = process.env.ORDER_SIMULATION === 'true' || false
    console.log('[ORDER_DEBUG] Order creation mode:', isSimulation ? 'SIMULATION' : 'REAL DATABASE')
    
    if (isSimulation) {
      console.log('🎭 SIMULATION MODE - Creating mock order without database operations')
      
      // Calculate totals
      const subtotal = orderData.subtotal || orderData.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
      const taxAmount = orderData.tax_amount || subtotal * 0.16
      const shippingAmount = orderData.shipping_cost || (subtotal > 10000 ? 0 : 1500)
      const totalAmount = orderData.total_amount || subtotal + taxAmount + shippingAmount

      // Generate mock order
      const mockOrder = {
        id: generateUUID(),
        order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        status: "pending",
        payment_status: "pending",
        financing_status:
          orderData.payment_method === "kcb_financing_pending" || orderData.financing_mode === "pending"
            ? "pending"
            : "none",
        payment_method: orderData.payment_method,
        subtotal: subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        discount_amount: 0,
        total_amount: totalAmount,
        customer_email: orderData.shipping_email || 'demo@example.com',
        shipping_first_name: orderData.shipping_first_name,
        shipping_last_name: orderData.shipping_last_name,
        shipping_address_line1: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_country: orderData.shipping_country || "Kenya",
        billing_first_name: orderData.billing_first_name || orderData.shipping_first_name,
        billing_last_name: orderData.billing_last_name || orderData.shipping_last_name,
        billing_address_line1: orderData.billing_address || orderData.shipping_address,
        billing_city: orderData.billing_city || orderData.shipping_city,
        billing_country: orderData.billing_country || orderData.shipping_country || "Kenya",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log('🎭 SIMULATION MODE - Mock order created:', mockOrder.order_number)
      
      return {
        success: true,
        message: "Order created successfully!",
        simulation: true as const,
        order: mockOrder,
      }
    }

    // Real database operations — always verify identity server-side.
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(cookieStore)
    const { data: { user: authUser }, error: authError } = await supabaseUser.auth.getUser()

    if (authError || !authUser) {
      console.error("[ORDER_DEBUG] Authentication error:", authError)
      return { success: false, error: "User not authenticated" }
    }

    const user_id = authUser.id
    const userEmail = authUser.email || orderData.shipping_email
    console.log('[ORDER_DEBUG] Authenticated user_id:', user_id)

    // Get user profile for email
    const { data: profile } = await supabaseAdmin
      .from("customer_profiles")
      .select("email, phone")
      .eq("user_id", user_id)
      .single()

    console.log('[ORDER_DEBUG] User profile:', profile)

    // Validate products and calculate totals
    let subtotal = 0
    const orderItems = []

    for (const item of orderData.items) {
      const { data: product } = await supabaseAdmin
        .from("products")
        .select("id, name, price, sku, vendor_id, inventory_quantity, product_images(image_url, is_primary)")
        .eq("id", item.product_id)
        .eq("status", "active")
        .single()

      if (!product) {
        return { success: false, error: `Product ${item.product_id} not found or unavailable` }
      }

      if (product.inventory_quantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${product.name}. Only ${product.inventory_quantity} available.`,
        }
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        product_id: product.id,
        vendor_id: product.vendor_id,
        product_name: product.name,
        product_sku: product.sku,
        product_image_url:
          product.product_images?.find((img: any) => img.is_primary)?.image_url ||
          product.product_images?.[0]?.image_url,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: itemTotal,
        ...(item.package_id ? { package_id: item.package_id } : {}),
      })
    }

    // Use provided totals or calculate them
    const taxAmount = orderData.tax_amount || subtotal * 0.16
    const shippingAmount = orderData.shipping_cost || (subtotal > 10000 ? 0 : 1500)
    const totalAmount = orderData.total_amount || subtotal + taxAmount + shippingAmount

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    const wantsFinancing =
      orderData.payment_method === "kcb_financing_pending" || orderData.financing_mode === "pending"

    const financingRequestedAt = new Date().toISOString()

    // Create order with minimal fields for simulation
    const orderInsert: any = {
      customer_id: user_id,
      order_number: orderNumber,
      status: "pending",
      payment_status: "pending",
      payment_method: orderData.payment_method,
      subtotal: orderData.subtotal || subtotal,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      discount_amount: 0,
      total_amount: totalAmount,
      customer_email: profile?.email || userEmail || orderData.shipping_email || "",
      shipping_first_name: orderData.shipping_first_name,
      shipping_last_name: orderData.shipping_last_name,
      shipping_address_line1: orderData.shipping_address,
      shipping_city: orderData.shipping_city,
      shipping_country: orderData.shipping_country || "Kenya",
      billing_first_name: orderData.billing_first_name || orderData.shipping_first_name,
      billing_last_name: orderData.billing_last_name || orderData.shipping_last_name,
      billing_address_line1: orderData.billing_address || orderData.shipping_address,
      billing_city: orderData.billing_city || orderData.shipping_city,
      billing_country: orderData.billing_country || orderData.shipping_country || "Kenya",
      financing_status: wantsFinancing ? "pending" : "none",
      financing_requested_at: wantsFinancing ? financingRequestedAt : null,
      financing_reference: wantsFinancing ? `KCB-REQ-${Date.now().toString(36)}` : null,
      fulfillment_stage: "order_received",
    }

    // Only add optional fields if they exist
    if (orderData.customer_phone) orderInsert.customer_phone = orderData.customer_phone
    if (orderData.notes) {
      orderInsert.customer_notes = orderData.notes
      orderInsert.notes = orderData.notes
    }
    if (orderData.mpesa_phone) orderInsert.mpesa_phone = orderData.mpesa_phone

    console.log('[ORDER_DEBUG] Inserting order:', orderInsert)
    const { data: order, error: orderError } = await supabaseAdmin.from("orders").insert(orderInsert).select().single()

    if (orderError) {
      console.error("[ORDER_DEBUG] Order creation error:", orderError)
      return { success: false, error: orderError.message }
    }

    console.log('[ORDER_DEBUG] Order created successfully:', order.id, order.order_number)

    // Insert order items
    const orderItemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(orderItemsWithOrderId)

    if (itemsError) {
      console.error("Order items creation error:", itemsError)
      return { success: false, error: itemsError.message }
    }

    // Update product inventory with optimistic locking to prevent overselling.
    // The update includes .eq("inventory_quantity", currentQty) so it only
    // succeeds if no concurrent checkout has already changed the row.
    console.log('[ORDER_DEBUG] Updating inventory for', orderData.items.length, 'items')
    for (const item of orderData.items) {
      const { data: product, error: getError } = await supabaseAdmin
        .from("products")
        .select("inventory_quantity")
        .eq("id", item.product_id)
        .single()

      if (getError || !product) {
        console.error("[ORDER_DEBUG] Error getting product inventory:", getError)
        continue
      }

      const currentQty = product.inventory_quantity || 0
      const newQuantity = Math.max(0, currentQty - item.quantity)

      // Optimistic lock: WHERE id = ? AND inventory_quantity = currentQty
      const { data: updatedRows, error: inventoryError } = await supabaseAdmin
        .from("products")
        .update({
          inventory_quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.product_id)
        .eq("inventory_quantity", currentQty) // only update if unchanged since we read it
        .select("id")

      if (inventoryError) {
        console.error("[ORDER_DEBUG] Inventory update error:", inventoryError)
      } else if (!updatedRows || updatedRows.length === 0) {
        console.warn(`[ORDER_DEBUG] Stock race condition detected for product ${item.product_id} — inventory already changed`)
      } else {
        console.log(`[ORDER_DEBUG] Updated inventory for product ${item.product_id}: ${currentQty} -> ${newQuantity}`)
      }
    }

    // Clear user's cart
    await supabaseAdmin.from("shopping_cart").delete().eq("user_id", user_id)

    // Order created successfully - payment will be processed via Paystack
    console.log('[ORDER_DEBUG] ✅ Order created successfully - awaiting payment via Paystack')
    console.log('[ORDER_DEBUG] Order will be marked as paid after successful Paystack payment verification')

    return {
      success: true,
      message: "Order created successfully!",
      order: order,
    }
  } catch (error) {
    console.error("[ORDER_DEBUG] Create order error:", error)
    return { success: false, error: "An unexpected error occurred while creating your order. Please try again." }
  }
}

export async function getCustomerOrders() {
  try {
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(cookieStore)
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) return { success: false, error: "Not authenticated" }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items(
          *,
          products(name, product_images(image_url, is_primary))
        )
      `)
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Failed to fetch orders" }
  }
}

export async function getVendorOrders() {
  try {
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(cookieStore)
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) return { success: false, error: "Not authenticated" }

    const { data, error } = await supabaseAdmin
      .from("order_items")
      .select(`
        *,
        orders(
          *,
          customer_profiles(first_name, last_name)
        ),
        products(name, product_images(image_url, is_primary))
      `)
      .eq("vendor_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    // Group by order
    const orderMap = new Map()

    data?.forEach((item) => {
      const orderId = item.orders.id
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          ...item.orders,
          order_items: [],
        })
      }
      orderMap.get(orderId).order_items.push(item)
    })

    const orders = Array.from(orderMap.values())

    return { success: true, data: orders }
  } catch (error) {
    return { success: false, error: "Failed to fetch vendor orders" }
  }
}

export async function updateOrderStatus(orderId: string, status: string, notes?: string) {
  try {
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(cookieStore)
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    // Only vendors who have items in this order, or admins, may update its status.
    const isAdmin = user.user_metadata?.role === "admin"
    if (!isAdmin) {
      const { data: vendorItems, error: vendorErr } = await supabaseAdmin
        .from("order_items")
        .select("id")
        .eq("order_id", orderId)
        .eq("vendor_id", user.id)
        .limit(1)

      if (vendorErr || !vendorItems || vendorItems.length === 0) {
        return { success: false, error: "Unauthorized" }
      }
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    // Set timestamps for specific statuses
    if (status === "shipped") {
      updateData.shipped_at = new Date().toISOString()
    } else if (status === "delivered") {
      updateData.delivered_at = new Date().toISOString()
    }

    const { error } = await supabaseAdmin.from("orders").update(updateData).eq("id", orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Add notes if provided
    if (notes) {
      await supabaseAdmin.from("order_status_history").insert({
        order_id: orderId,
        status,
        notes,
        created_by: user.id,
      })
    }

    return { success: true, message: "Order status updated successfully" }
  } catch (error) {
    return { success: false, error: "Failed to update order status" }
  }
}

export async function getOrder(orderId: string) {
  try {
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(cookieStore)
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) return { success: false, error: "Not authenticated" }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items(
          *,
          products(name, product_images(image_url, is_primary))
        ),
        order_status_history(*)
      `)
      .eq("id", orderId)
      .single()

    if (error || !data) {
      return { success: false, error: "Order not found" }
    }

    const isAdmin = user.user_metadata?.role === "admin"
    const isCustomer = data.customer_id === user.id
    const isVendor = (data.order_items as any[])?.some((item: any) => item.vendor_id === user.id)

    if (!isAdmin && !isCustomer && !isVendor) {
      return { success: false, error: "Unauthorized" }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Failed to fetch order" }
  }
}

// Debug function to check delivery assignment
export async function checkDeliveryAssignment(orderId: string) {
  try {
    console.log('[DELIVERY_CHECK] Checking delivery assignment for order:', orderId)
    
    // Check if delivery exists for this order
    const { data: delivery, error: deliveryError } = await supabaseAdmin
      .from("deliveries")
      .select("*")
      .eq("order_id", orderId)
      .single()

    if (!deliveryError && delivery) {
      // Get delivery person info separately
      const { data: deliveryPerson } = await supabaseAdmin
        .from("delivery_applications")
        .select("first_name, last_name, phone, vehicle_type")
        .eq("user_id", delivery.delivery_person_id)
        .single()

      delivery.delivery_applications = deliveryPerson
    }

    if (deliveryError) {
      console.log('[DELIVERY_CHECK] No delivery found or error:', deliveryError.message)
      return { success: false, error: deliveryError.message, hasDelivery: false }
    }

    console.log('[DELIVERY_CHECK] Delivery found:', {
      id: delivery.id,
      status: delivery.delivery_status,
      assignedTo: delivery.delivery_applications?.first_name + ' ' + delivery.delivery_applications?.last_name,
      city: delivery.delivery_city
    })

    return { success: true, data: delivery, hasDelivery: true }
  } catch (error) {
    console.error('[DELIVERY_CHECK] Error:', error)
    return { success: false, error: "Failed to check delivery assignment" }
  }
}

// Manual delivery assignment — admin only
export async function manuallyAssignDelivery(orderId: string) {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    console.log('[MANUAL_DELIVERY] Manually assigning delivery for order:', orderId)
    
    // Get the order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return { success: false, error: "Order not found" }
    }

    // Find an available delivery person
    const { data: deliveryPerson, error: personError } = await supabaseAdmin
      .from("delivery_applications")
      .select("user_id, first_name, last_name")
      .eq("status", "approved")
      .limit(1)
      .single()

    if (personError || !deliveryPerson) {
      return { success: false, error: "No available delivery person found" }
    }

    // Create delivery record manually
    const { data: delivery, error: deliveryError } = await supabaseAdmin
      .from("deliveries")
      .insert({
        order_id: orderId,
        delivery_person_id: deliveryPerson.user_id,
        delivery_address_line1: order.shipping_address_line1,
        delivery_city: order.shipping_city,
        delivery_country: order.shipping_country,
        delivery_status: 'assigned',
        delivery_fee: 500,
        estimated_delivery_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      })
      .select()
      .single()

    if (deliveryError) {
      console.error('[MANUAL_DELIVERY] Error creating delivery:', deliveryError)
      return { success: false, error: deliveryError.message }
    }

    console.log('[MANUAL_DELIVERY] ✅ Delivery assigned manually:', {
      deliveryId: delivery.id,
      assignedTo: deliveryPerson.first_name + ' ' + deliveryPerson.last_name
    })

    return { success: true, data: delivery }
  } catch (error) {
    console.error('[MANUAL_DELIVERY] Error:', error)
    return { success: false, error: "Failed to manually assign delivery" }
  }
}

export type FulfillmentStage =
  | "order_received"
  | "installation_in_progress"
  | "commissioned"
  | "completed"

export async function updateOrderFulfillmentStage(orderId: string, fulfillment_stage: FulfillmentStage) {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        fulfillment_stage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update fulfilment stage" }
  }
}

// Mark an order as paid — admin only
export async function markOrderAsPaid(orderId: string) {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    console.log('[MANUAL_PAYMENT] Manually marking order as paid:', orderId)
    
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        paystack_transaction_id: `MANUAL_${Date.now()}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('[MANUAL_PAYMENT] Error updating order:', updateError)
      return { success: false, error: updateError.message }
    }

    console.log('[MANUAL_PAYMENT] ✅ Order marked as paid successfully')
    
    // Try manual delivery assignment
    setTimeout(async () => {
      await manuallyAssignDelivery(orderId)
    }, 1000)

    return { success: true, data: updatedOrder }
  } catch (error) {
    console.error('[MANUAL_PAYMENT] Error:', error)
    return { success: false, error: "Failed to mark order as paid" }
  }
}
