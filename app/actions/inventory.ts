"use server"

import { supabaseAdmin } from "@/lib/supabase-server"

/**
 * Restores inventory for all items in an order.
 * Called when a payment fails so that stock decremented at order-creation time
 * is returned to available inventory — preventing permanent stock loss.
 */
export async function restoreInventory(orderId: string): Promise<void> {
  const { data: items, error } = await supabaseAdmin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId)

  if (error || !items?.length) {
    console.error("[INVENTORY] Failed to fetch order items for restoration:", error)
    return
  }

  for (const item of items) {
    const { data: product, error: fetchErr } = await supabaseAdmin
      .from("products")
      .select("inventory_quantity")
      .eq("id", item.product_id)
      .single()

    if (fetchErr || !product) {
      console.error("[INVENTORY] Could not fetch product for restoration:", item.product_id, fetchErr)
      continue
    }

    const { error: updateErr } = await supabaseAdmin
      .from("products")
      .update({ inventory_quantity: product.inventory_quantity + item.quantity })
      .eq("id", item.product_id)

    if (updateErr) {
      console.error("[INVENTORY] Failed to restore stock for product:", item.product_id, updateErr)
    } else {
      console.log(`[INVENTORY] Restored ${item.quantity} units for product ${item.product_id}`)
    }
  }
}
