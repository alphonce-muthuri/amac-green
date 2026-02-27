export interface Order {
  id: string
  customer_id: string
  order_number: string
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
  payment_status: "pending" | "paid" | "failed" | "refunded" | "partial"
  payment_method?: string

  // Pricing
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total_amount: number

  // Customer info
  customer_email: string
  customer_phone?: string

  // Shipping address
  shipping_first_name?: string
  shipping_last_name?: string
  shipping_company?: string
  shipping_address_line1: string
  shipping_address_line2?: string
  shipping_city: string
  shipping_state?: string
  shipping_postal_code?: string
  shipping_country: string

  // Billing address
  billing_first_name?: string
  billing_last_name?: string
  billing_company?: string
  billing_address_line1?: string
  billing_address_line2?: string
  billing_city?: string
  billing_state?: string
  billing_postal_code?: string
  billing_country?: string

  // Notes and tracking
  customer_notes?: string
  admin_notes?: string
  tracking_number?: string
  tracking_url?: string

  // Timestamps
  created_at: string
  updated_at: string
  shipped_at?: string
  delivered_at?: string

  // Relations
  order_items?: OrderItem[]
  order_status_history?: OrderStatusHistory[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  vendor_id: string

  // Product snapshot
  product_name: string
  product_sku?: string
  product_image_url?: string

  // Pricing
  quantity: number
  unit_price: number
  total_price: number

  // Product specs at time of order
  product_specifications?: Record<string, any>

  created_at: string
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  status: string
  notes?: string
  created_by?: string
  created_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string

  // Product details (joined)
  product?: {
    id: string
    name: string
    price: number
    image_url?: string
    inventory_quantity: number
    status: string
  }
}

export interface CreateOrderData {
  customer_notes?: string
  shipping_address: {
    first_name: string
    last_name: string
    company?: string
    address_line1: string
    address_line2?: string
    city: string
    state?: string
    postal_code?: string
    country: string
  }
  billing_address?: {
    first_name: string
    last_name: string
    company?: string
    address_line1: string
    address_line2?: string
    city: string
    state?: string
    postal_code?: string
    country: string
  }
  payment_method: string
  items: {
    product_id: string
    quantity: number
  }[]
}
