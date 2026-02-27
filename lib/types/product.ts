export interface Product {
  id?: string
  vendor_id: string
  category_id?: string
  name: string
  description?: string
  short_description?: string
  sku?: string
  price: number
  compare_price?: number
  cost_price?: number
  track_inventory: boolean
  inventory_quantity: number
  low_stock_threshold: number
  weight?: number
  dimensions_length?: number
  dimensions_width?: number
  dimensions_height?: number
  status: "draft" | "active" | "inactive" | "out_of_stock"
  is_featured: boolean
  meta_title?: string
  meta_description?: string
  tags?: string[]
  specifications?: Record<string, any>
  warranty_info?: string
  shipping_info?: string
  created_at?: string
  updated_at?: string
}

export interface ProductCategory {
  id: string
  name: string
  description?: string
  slug: string
  parent_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id?: string
  product_id: string
  image_url: string
  alt_text?: string
  is_primary: boolean
  sort_order: number
  created_at?: string
}

export interface ProductVariant {
  id?: string
  product_id: string
  name: string
  sku?: string
  price?: number
  compare_price?: number
  inventory_quantity: number
  weight?: number
  is_active: boolean
  variant_options?: Record<string, any>
  created_at?: string
  updated_at?: string
}
