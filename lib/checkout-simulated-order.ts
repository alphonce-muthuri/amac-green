/**
 * When ORDER_SIMULATION=true, createOrder does not persist to Supabase but checkout still redirects
 * to /checkout/success?order=<id>. We stash a JSON snapshot so the success page can render.
 */
const PREFIX = "amac_checkout_sim_order_"

export type SimulatedCartLine = {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export function persistSimulatedOrderSnapshot(
  orderId: string,
  order: Record<string, unknown>,
  cartLines: SimulatedCartLine[]
) {
  const order_items = cartLines.map((item, i) => ({
    id: `sim-${orderId.slice(0, 8)}-${i}`,
    product_name: item.name,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
    product_image_url: item.image,
  }))
  try {
    sessionStorage.setItem(PREFIX + orderId, JSON.stringify({ ...order, order_items }))
  } catch {
    // ignore quota / private mode
  }
}

export function readSimulatedOrderSnapshot(orderId: string): unknown | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(PREFIX + orderId)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
