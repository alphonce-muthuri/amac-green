"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/require-admin"

// Create Supabase client for server actions
async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const anyCookieStore = cookieStore as any
          if (typeof anyCookieStore.getAll === "function") {
            return anyCookieStore.getAll()
          }

          // `cookies()` may not expose `getAll()` depending on Next version/runtime.
          // Supabase SSR only needs an array of `{ name, value }`.
          const asString = typeof anyCookieStore.toString === "function" ? anyCookieStore.toString() : ""
          if (!asString || !asString.includes("=")) return []

          return asString
            .split(/;\s*/)
            .filter(Boolean)
            .map((pair: string) => {
              const idx = pair.indexOf("=")
              if (idx === -1) return { name: pair, value: "" }
              return { name: pair.slice(0, idx), value: pair.slice(idx + 1) }
            })
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export interface DeliveryLocationUpdate {
  latitude: number
  longitude: number
  accuracy?: number
  heading?: number
  speed?: number
  isOnline: boolean
  isAvailable: boolean
  batteryLevel?: number
}

// Test function to debug authentication
export async function testAuthentication() {
  try {
    console.log("[AUTH_TEST] Starting authentication test")
    console.log("[AUTH_TEST] Environment check:", {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + "...",
    })
    
    const cookieStore = await cookies()
    const allCookies = (() => {
      const anyCookieStore = cookieStore as any
      if (typeof anyCookieStore.getAll === "function") return anyCookieStore.getAll()

      const asString = typeof anyCookieStore.toString === "function" ? anyCookieStore.toString() : ""
      if (!asString || !asString.includes("=")) return []

      return asString
        .split(/;\s*/)
        .filter(Boolean)
        .map((pair: string) => {
          const idx = pair.indexOf("=")
          if (idx === -1) return { name: pair, value: "" }
          return { name: pair.slice(0, idx), value: pair.slice(idx + 1) }
        })
    })()
    console.log("[AUTH_TEST] Available cookies:", allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
    
    const supabase = await createClient()
    console.log("[AUTH_TEST] Created client, getting user...")
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    
    console.log("[AUTH_TEST] Raw auth response:", { 
      user: user ? { id: user.id, email: user.email } : null, 
      error: userError 
    })
    
    if (userError) {
      console.error("[AUTH_TEST] Auth error details:", userError)
      return { success: false, error: userError.message, user: null }
    }
    
    if (!user) {
      console.log("[AUTH_TEST] No user found")
      return { success: false, error: "No user found", user: null }
    }
    
    console.log("[AUTH_TEST] User found:", {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role,
      aud: user.aud,
      created_at: user.created_at
    })
    
    return { success: true, user: user, error: null }
  } catch (error) {
    console.error("[AUTH_TEST] Exception:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error", user: null }
  }
}

// Update delivery person's location
export async function updateDeliveryLocation(locationData: DeliveryLocationUpdate) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error("User not authenticated")
    }
    const user_id = user.id

    // Call the database function to update location
    const { data, error } = await supabase.rpc("update_delivery_location", {
      p_user_id: user_id,
      p_latitude: locationData.latitude,
      p_longitude: locationData.longitude,
      p_accuracy: locationData.accuracy,
      p_heading: locationData.heading,
      p_speed: locationData.speed,
      p_is_online: locationData.isOnline,
      p_is_available: locationData.isAvailable,
      p_battery_level: locationData.batteryLevel,
    })

    if (error) {
      throw error
    }

    return { success: true, locationId: data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update location",
    }
  }
}

// Get all active delivery locations (admin only)
export async function getActiveDeliveryLocations() {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    const supabase = await createClient()

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    // Get active delivery locations with delivery person info
    // We need to join through the user_id since there's no direct relationship
    const { data, error } = await supabase
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
        created_at
      `)
      .eq("is_online", true)
      .gte("last_updated", fiveMinutesAgo)

    if (error) {
      throw error
    }

    // Get delivery applications for these users
    if (data && data.length > 0) {
      const userIds = data.map(loc => loc.delivery_person_id)
      
      const { data: applications, error: appError } = await supabase
        .from("delivery_applications")
        .select("user_id, first_name, last_name, phone, vehicle_type, vehicle_registration")
        .in("user_id", userIds)

      if (appError) {
        return { success: true, data: data.map(loc => ({ ...loc, delivery_applications: null })) }
      } else {
        // Merge the data
        const locationsWithInfo = data.map(location => {
          const app = applications?.find(a => a.user_id === location.delivery_person_id)
          return {
            ...location,
            delivery_applications: app || null
          }
        })
        return { success: true, data: locationsWithInfo }
      }
    }

    if (error) {
      throw error
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get locations",
    }
  }
}

// Update availability status
export async function updateDeliveryAvailability(isAvailable: boolean) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error("User not authenticated")
    }
    const user_id = user.id

    // Update delivery_locations table
    const { error: locationError } = await supabase
      .from("delivery_locations")
      .update({
        is_available: isAvailable,
        last_updated: new Date().toISOString(),
      })
      .eq("delivery_person_id", user_id)

    if (locationError) {
      console.error("Error updating delivery_locations:", locationError)
    }

    // Update delivery_applications table (for auto-assignment)
    const availabilityStatus = isAvailable ? 'available' : 'offline'
    const { error: appError } = await supabase
      .from("delivery_applications")
      .update({
        availability_status: availabilityStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id)

    if (appError) {
      throw appError
    }

    revalidatePath("/delivery")
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update availability",
    }
  }
}

// Get deliveries assigned to current delivery person
export async function getMyDeliveries() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("deliveries")
      .select(`
        *,
        orders!inner(
          order_number,
          customer_email,
          customer_phone,
          total_amount,
          payment_status,
          order_items(
            product_name,
            quantity,
            unit_price
          )
        )
      `)
      .eq("delivery_person_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("[v0] Failed to get deliveries:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get deliveries",
    }
  }
}

// Update delivery status
export async function updateDeliveryStatus(deliveryId: string, status: string, notes?: string) {
  try {
    console.log("[STATUS_DEBUG] Updating delivery status:", deliveryId, "to:", status)
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error("User not authenticated")
    }
    const user_id = user.id

    const updateData: any = {
      delivery_status: status,
      updated_at: new Date().toISOString(),
    }

    // Set timestamps for specific statuses
    if (status === "picked_up") {
      updateData.picked_up_at = new Date().toISOString()
    } else if (status === "delivered") {
      updateData.delivered_at = new Date().toISOString()
      updateData.actual_delivery_time = new Date().toISOString()
    }

    if (notes) {
      updateData.delivery_notes = notes
    }

    const { error } = await supabase
      .from("deliveries")
      .update(updateData)
      .eq("id", deliveryId)
      .eq("delivery_person_id", user_id) // Ensure only assigned delivery person can update

    if (error) {
      throw error
    }

    // Update delivery person availability if delivery is completed
    if (status === "delivered" || status === "failed" || status === "cancelled") {
      console.log("[STATUS_DEBUG] Delivery completed - updating availability to available")
      
      const { error: availabilityError } = await supabase
        .from("delivery_applications")
        .update({
          availability_status: "available",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)

      if (availabilityError) {
        console.error("[STATUS_DEBUG] Error updating availability:", availabilityError)
      } else {
        console.log("[STATUS_DEBUG] ✅ Delivery person is now available for new deliveries")
      }

      // Also update delivery_locations availability
      await supabase
        .from("delivery_locations")
        .update({
          is_available: true,
          last_updated: new Date().toISOString(),
        })
        .eq("delivery_person_id", user_id)
    }

    revalidatePath("/delivery")
    return { success: true }
  } catch (error) {
    console.error("[v0] Failed to update delivery status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update delivery status",
    }
  }
}

// Get all deliveries (admin only)
export async function getAllDeliveries() {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("deliveries")
      .select(`
        *,
        orders!inner(
          order_number,
          customer_email,
          customer_phone,
          total_amount,
          payment_status
        ),
        delivery_applications(
          first_name,
          last_name,
          phone,
          vehicle_type
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("[v0] Failed to get all deliveries:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get deliveries",
    }
  }
}

// Manually assign delivery to a delivery person (admin only)
export async function assignDelivery(deliveryId: string, deliveryPersonId: string) {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("deliveries")
      .update({
        delivery_person_id: deliveryPersonId,
        delivery_status: "assigned",
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", deliveryId)

    if (error) {
      throw error
    }

    // Update delivery person availability
    await supabase
      .from("delivery_applications")
      .update({
        availability_status: "busy",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", deliveryPersonId)

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("[v0] Failed to assign delivery:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign delivery",
    }
  }
}

// Delivery management functions

// Get deliveries assigned to current delivery person
export async function getDeliveryPersonDeliveries() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("[DELIVERY_DEBUG] Authentication failed:", userError)
      throw new Error("User not authenticated")
    }
    const user_id = user.id
    console.log("[DELIVERY_DEBUG] Fetching deliveries for user_id:", user_id)

    // Get deliveries assigned to this delivery person (minimal query to avoid RLS issues)
    console.log("[DELIVERY_DEBUG] Querying deliveries for user:", user_id)
    const { data, error } = await supabase
      .from("deliveries")
      .select(`
        id,
        order_id,
        delivery_status,
        delivery_address_line1,
        delivery_address_line2,
        delivery_city,
        delivery_country,
        delivery_fee,
        delivery_instructions,
        estimated_delivery_time,
        created_at,
        orders(
          order_number,
          customer_email,
          customer_phone,
          total_amount
        )
      `)
      .eq("delivery_person_id", user_id)
      .order("created_at", { ascending: false })

    console.log("[DELIVERY_DEBUG] Query result:", { 
      data: data ? `${data.length} deliveries found` : 'null', 
      error: error?.message || 'no error',
      userIdUsed: user_id
    })

    if (error) {
      console.error("[DELIVERY_DEBUG] Query error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw error
    }

    console.log("[DELIVERY_DEBUG] Successfully retrieved deliveries:", data?.length || 0)
    return { success: true, data: data || [] }
  } catch (error) {
    console.error("[v0] Failed to get delivery person deliveries:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get deliveries",
    }
  }
}

// Accept delivery
export async function acceptDelivery(deliveryId: string) {
  try {
    console.log("[ACCEPT_DEBUG] Starting acceptDelivery for delivery:", deliveryId)
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("[ACCEPT_DEBUG] Authentication failed:", userError)
      throw new Error("User not authenticated")
    }
    const user_id = user.id
    console.log("[ACCEPT_DEBUG] Authenticated user_id:", user_id)

    // Update delivery status to picked_up and set pickup time
    console.log("[ACCEPT_DEBUG] Updating delivery status to picked_up")
    const { data: updatedDelivery, error } = await supabase
      .from("deliveries")
      .update({
        delivery_status: "picked_up",
        picked_up_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", deliveryId)
      .eq("delivery_person_id", user_id)
      .select()
      .single()

    console.log("[ACCEPT_DEBUG] Update result:", { updatedDelivery, error })

    if (error) {
      console.error("[ACCEPT_DEBUG] Update error:", error)
      throw error
    }

    if (!updatedDelivery) {
      console.error("[ACCEPT_DEBUG] No delivery was updated - check delivery_person_id match")
      throw new Error("Delivery not found or not assigned to you")
    }

    console.log("[ACCEPT_DEBUG] ✅ Delivery accepted successfully:", updatedDelivery.id)
    revalidatePath("/delivery")
    return { success: true }
  } catch (error) {
    console.error("[v0] Failed to accept delivery:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept delivery",
    }
  }
}

// Get delivery statistics for delivery person dashboard
export async function getDeliveryStats() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("[STATS_DEBUG] Authentication failed:", userError)
      throw new Error("User not authenticated")
    }
    const user_id = user.id
    console.log("[STATS_DEBUG] Fetching stats for user_id:", user_id)

    // Get delivery statistics
    console.log("[STATS_DEBUG] Querying delivery stats for user:", user_id)
    const { data, error } = await supabase
      .from("deliveries")
      .select("delivery_status, delivery_fee, created_at")
      .eq("delivery_person_id", user_id)

    console.log("[STATS_DEBUG] Stats query result:", { data, error })

    if (error) {
      console.error("[STATS_DEBUG] Stats query error:", error)
      throw error
    }

    const stats = {
      total: data?.length || 0,
      pending: data?.filter((d) => d.delivery_status === "assigned").length || 0,
      inProgress: data?.filter((d) => ["picked_up", "in_transit"].includes(d.delivery_status)).length || 0,
      completed: data?.filter((d) => d.delivery_status === "delivered").length || 0,
      totalEarnings:
        data?.filter((d) => d.delivery_status === "delivered").reduce((sum, d) => sum + (d.delivery_fee || 0), 0) || 0,
      todayDeliveries:
        data?.filter((d) => {
          const today = new Date().toDateString()
          return new Date(d.created_at).toDateString() === today
        }).length || 0,
    }

    console.log("[STATS_DEBUG] Calculated stats:", stats)
    return { success: true, data: stats }
  } catch (error) {
    console.error("[v0] Failed to get delivery stats:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get delivery stats",
    }
  }
}
