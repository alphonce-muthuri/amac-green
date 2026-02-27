"use server"

import { createServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import type { Product } from "@/lib/types/product"

export async function createProduct(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    console.log('🎯 createProduct called with formData')
    
    // Debug: Log all form data keys
    const formDataKeys = Array.from(formData.keys())
    console.log('🎯 FormData keys:', formDataKeys)
    
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('🎯 Session result:', { session: session?.user?.id, error: sessionError?.message })
    
    let user = session?.user
    
    // If no session, try to get user from the form data
    if (!user) {
      console.log('🎯 No session found, trying to get user from form data...')
      
      const userId = formData.get('userId') as string
      if (!userId) {
        return { success: false, error: "Authentication required - no user ID provided" }
      }
      
      console.log('🎯 Using user ID from form data:', userId)
      
      // Create a minimal user object with the ID
      user = {
        id: userId,
        email: 'user@example.com', // This will be overridden by the actual user data
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        identities: [],
        factors: []
      } as any
      
      console.log('🎯 Created user object from form data:', user.id)
    }
    
    if (!user) {
      return { success: false, error: "Authentication required" }
    }

    // Extract form data
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const shortDescription = formData.get('shortDescription') as string
    const sku = formData.get('sku') as string
    const price = parseFloat(formData.get('price') as string)
    const comparePrice = formData.get('comparePrice') ? parseFloat(formData.get('comparePrice') as string) : null
    const costPrice = formData.get('costPrice') ? parseFloat(formData.get('costPrice') as string) : null
    const categoryId = formData.get('categoryId') as string
    const status = formData.get('status') as string || 'draft'
    const trackInventory = formData.get('trackInventory') === 'true'
    const inventoryQuantity = formData.get('inventoryQuantity') ? parseInt(formData.get('inventoryQuantity') as string) : 0
    const lowStockThreshold = formData.get('lowStockThreshold') ? parseInt(formData.get('lowStockThreshold') as string) : 5
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null
    const dimensionsLength = formData.get('dimensionsLength') ? parseFloat(formData.get('dimensionsLength') as string) : null
    const dimensionsWidth = formData.get('dimensionsWidth') ? parseFloat(formData.get('dimensionsWidth') as string) : null
    const dimensionsHeight = formData.get('dimensionsHeight') ? parseFloat(formData.get('dimensionsHeight') as string) : null
    const shippingInfo = formData.get('shippingInfo') as string
    const warrantyInfo = formData.get('warrantyInfo') as string
    const specifications = formData.get('specifications') as string
    const tags = formData.get('tags') as string
    const metaTitle = formData.get('metaTitle') as string
    const metaDescription = formData.get('metaDescription') as string
    const isFeatured = formData.get('isFeatured') === 'true'

    // Parse specifications JSON
    let specsObject = {}
    try {
      if (specifications) {
        specsObject = JSON.parse(specifications)
      }
    } catch (e) {
      console.error('Error parsing specifications:', e)
    }

    // Parse tags
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []

    // Create product
    const productData = {
      vendor_id: user.id,
      name,
      description,
      short_description: shortDescription,
      sku,
      price,
      compare_price: comparePrice,
      cost_price: costPrice,
      category_id: categoryId,
      track_inventory: trackInventory,
      inventory_quantity: inventoryQuantity,
      low_stock_threshold: lowStockThreshold,
      weight,
      dimensions_length: dimensionsLength,
      dimensions_width: dimensionsWidth,
      dimensions_height: dimensionsHeight,
      shipping_info: shippingInfo,
      warranty_info: warrantyInfo,
      specifications: specsObject,
      tags: tagsArray,
      meta_title: metaTitle,
      meta_description: metaDescription,
      is_featured: isFeatured,
      status,
    }
    
    console.log('🎯 Inserting product data:', productData)
    
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single()

    if (productError) {
      console.error("Error creating product:", productError)
      return { success: false, error: `Failed to create product: ${productError.message}` }
    }

    // Handle image uploads
    console.log('🎯 Processing individual image fields from form')
    
    // Collect all image data from form fields
    const images: any[] = []
    let index = 0
    
    while (true) {
      const url = formData.get(`image_${index}_url`) as string
      if (!url) break
      
      const alt = formData.get(`image_${index}_alt`) as string
      const isPrimary = formData.get(`image_${index}_primary`) === 'true'
      
      images.push({
        url,
        alt,
        isPrimary
      })
      
      index++
    }
    
    console.log('🎯 Collected images from form:', images)
    
    if (images.length > 0) {
      try {
        // Import the moveImageToProductFolder function
        const { moveImageToProductFolder } = await import('@/lib/storage')
        
        // Move images from temp folder to product folder and update URLs
        const processedImages = await Promise.all(
          images.map(async (image: any, index: number) => {
            const newUrl = await moveImageToProductFolder(image.url, product.id)
            return {
              product_id: product.id,
              image_url: newUrl,
              alt_text: image.alt || product.name,
              is_primary: image.isPrimary || index === 0, // Use the isPrimary flag or default to first image
              sort_order: index
            }
          })
        )
        
        console.log('🎯 Processed images with new URLs:', processedImages)
        
        // Insert images into product_images table
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(processedImages)
        
        if (imagesError) {
          console.error('Error inserting images:', imagesError)
          // Don't fail the product creation if image insertion fails
        } else {
          console.log('🎯 Images inserted successfully')
        }
      } catch (parseError) {
        console.error('Error processing images:', parseError)
      }
    }

    revalidatePath("/vendor/products")
    return { success: true, message: "Product created successfully!", productId: product.id }
  } catch (error) {
    console.error("Error in createProduct:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getProductCategories() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const { data, error } = await supabase.from("product_categories").select("*").eq("is_active", true).order("name")

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Failed to fetch categories" }
  }
}

export async function getVendorProducts(vendorId: string): Promise<Product[]> {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_images (
        id,
        image_url,
        alt_text,
        is_primary,
        sort_order
      )
    `)
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching vendor products:", error)
    throw new Error("Failed to fetch products")
  }

  return data || []
}

export async function getPublicProducts({
  category,
  search,
  sort = "newest",
  page = 1,
  limit = 12,
}: {
  category?: string
  search?: string
  sort?: string
  page?: number
  limit?: number
} = {}) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    let query = supabase
      .from("products")
      .select(`
        *,
        product_images (
          id,
          image_url,
          alt_text,
          is_primary,
          sort_order
        )
      `)
      .eq("status", "active")

    // Filter by category
    if (category) {
      query = query.eq("category", category)
    }

    // Search functionality
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,short_description.ilike.%${search}%`)
    }

    // Sorting
    switch (sort) {
      case "newest":
        query = query.order("created_at", { ascending: false })
        break
      case "oldest":
        query = query.order("created_at", { ascending: true })
        break
      case "price-low":
        query = query.order("price", { ascending: true })
        break
      case "price-high":
        query = query.order("price", { ascending: false })
        break
      case "name":
        query = query.order("name", { ascending: true })
        break
      default:
        query = query.order("created_at", { ascending: false })
    }

    // Get total count for pagination
    const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "active")

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: products, error: productsError } = await query

    if (productsError) {
      console.error("Error fetching products:", productsError)
      return { success: false, data: [], totalPages: 0, totalCount: 0 }
    }

    if (!products || products.length === 0) {
      return { success: true, data: [], totalPages: 0, totalCount: 0 }
    }

    // Get unique vendor IDs
    const vendorIds = [...new Set(products.map((p) => p.vendor_id))]

    // Fetch vendor information for all vendors
    const { data: vendors, error: vendorsError } = await supabase
      .from("vendor_applications")
      .select("user_id, company_name")
      .in("user_id", vendorIds)
      .eq("status", "approved")

    if (vendorsError) {
      console.error("Error fetching vendors:", vendorsError)
      // Continue without vendor names rather than failing
    }

    // Create a map of vendor_id to business_name
    const vendorMap = new Map()
    if (vendors) {
      vendors.forEach((vendor) => {
        vendorMap.set(vendor.user_id, vendor.company_name)
      })
    }

    // Add vendor names to products and filter only approved vendors
    const productsWithVendors = products
      .filter((product) => vendorMap.has(product.vendor_id))
      .map((product) => ({
        ...product,
        vendor_name: vendorMap.get(product.vendor_id) || "Unknown Vendor",
      }))

    const totalPages = count ? Math.ceil(count / limit) : 1

    return {
      success: true,
      data: productsWithVendors,
      totalPages,
      totalCount: count,
    }
  } catch (error) {
    console.error("Error in getPublicProducts:", error)
    return { success: false, data: [], totalPages: 0, totalCount: 0 }
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select(`
        *,
        product_images (
          id,
          image_url,
          alt_text,
          is_primary,
          sort_order
        )
      `)
      .eq("id", id)
      .eq("status", "active")
      .single()

    if (productError || !product) {
      return null
    }

    // Get vendor information
    const { data: vendor, error: vendorError } = await supabase
      .from("vendor_applications")
      .select("company_name, email, phone")
      .eq("user_id", product.vendor_id)
      .eq("status", "approved")
      .single()

    if (vendorError) {
      console.error("Error fetching vendor:", vendorError)
    }

    return {
      ...product,
      vendor_name: vendor?.company_name || "Unknown Vendor",
      vendor_email: vendor?.email,
      vendor_phone: vendor?.phone,
    }
  } catch (error) {
    console.error("Error in getProductById:", error)
    return null
  }
}

export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    let user = session?.user
    
    // If no session, try to get user from form data
    if (!user) {
      const userId = formData.get('userId') as string
      if (!userId) {
        return { success: false, error: "Authentication required - no user ID provided" }
      }
      
      console.log('🎯 Using user ID from form data (updateProduct):', userId)
      
      // Create a minimal user object with the ID
      user = {
        id: userId,
        email: 'user@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        identities: [],
        factors: []
      } as any
      
      console.log('🎯 Created user object from form data (updateProduct):', user.id)
    }

    // Verify ownership
    console.log('🎯 Verifying ownership for product ID:', id)
    console.log('🎯 User ID:', user.id)
    
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("vendor_id")
      .eq("id", id)
      .single()

    console.log('🎯 Existing product result:', { existingProduct, fetchError })

    if (fetchError || !existingProduct) {
      console.log('🎯 Product not found or fetch error:', fetchError)
      return { success: false, error: "Product not found" }
    }

    console.log('🎯 Product vendor_id:', existingProduct.vendor_id)
    console.log('🎯 User ID:', user.id)
    console.log('🎯 Ownership check:', existingProduct.vendor_id === user.id)

    if (existingProduct.vendor_id !== user.id) {
      console.log('🎯 Unauthorized - vendor_id mismatch')
      return { success: false, error: "Unauthorized" }
    }

    // Extract form data
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const shortDescription = formData.get('shortDescription') as string
    const sku = formData.get('sku') as string
    const price = parseFloat(formData.get('price') as string)
    const comparePrice = formData.get('comparePrice') ? parseFloat(formData.get('comparePrice') as string) : null
    const costPrice = formData.get('costPrice') ? parseFloat(formData.get('costPrice') as string) : null
    const categoryId = formData.get('categoryId') as string
    const status = formData.get('status') as string || 'draft'
    const trackInventory = formData.get('trackInventory') === 'true'
    const inventoryQuantity = formData.get('inventoryQuantity') ? parseInt(formData.get('inventoryQuantity') as string) : 0
    const lowStockThreshold = formData.get('lowStockThreshold') ? parseInt(formData.get('lowStockThreshold') as string) : 5
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null
    const dimensionsLength = formData.get('dimensionsLength') ? parseFloat(formData.get('dimensionsLength') as string) : null
    const dimensionsWidth = formData.get('dimensionsWidth') ? parseFloat(formData.get('dimensionsWidth') as string) : null
    const dimensionsHeight = formData.get('dimensionsHeight') ? parseFloat(formData.get('dimensionsHeight') as string) : null
    const shippingInfo = formData.get('shippingInfo') as string
    const warrantyInfo = formData.get('warrantyInfo') as string
    const specifications = formData.get('specifications') as string
    const tags = formData.get('tags') as string
    const metaTitle = formData.get('metaTitle') as string
    const metaDescription = formData.get('metaDescription') as string
    const isFeatured = formData.get('isFeatured') === 'true'

    // Parse specifications JSON
    let specsObject = {}
    try {
      if (specifications) {
        specsObject = JSON.parse(specifications)
      }
    } catch (e) {
      console.error('Error parsing specifications:', e)
    }

    // Parse tags
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []

    // Handle image uploads
    console.log('🎯 Processing individual image fields from form (updateProduct)')
    
    // Collect all image data from form fields
    const images: any[] = []
    let index = 0
    
    while (true) {
      const url = formData.get(`image_${index}_url`) as string
      if (!url) break
      
      const alt = formData.get(`image_${index}_alt`) as string
      const isPrimary = formData.get(`image_${index}_primary`) === 'true'
      
      images.push({
        url,
        alt,
        isPrimary
      })
      
      index++
    }
    
    console.log('🎯 Collected images from form (updateProduct):', images)
    
    if (images.length > 0) {
      try {
        // First, delete existing images
        const { error: deleteError } = await supabase
          .from('product_images')
          .delete()
          .eq('product_id', id)
        
        if (deleteError) {
          console.error('Error deleting existing images:', deleteError)
        }
        
        // Import the moveImageToProductFolder function
        const { moveImageToProductFolder } = await import('@/lib/storage')
        
        // Move images from temp folder to product folder and update URLs
        const processedImages = await Promise.all(
          images.map(async (image: any, index: number) => {
            const newUrl = await moveImageToProductFolder(image.url, id)
            return {
              product_id: id,
              image_url: newUrl,
              alt_text: image.alt || name,
              is_primary: image.isPrimary || index === 0, // Use the isPrimary flag or default to first image
              sort_order: index
            }
          })
        )
        
        console.log('🎯 Inserting updated image records:', processedImages)
        
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(processedImages)
        
        if (imagesError) {
          console.error('Error inserting updated images:', imagesError)
          // Don't fail the product update if image insertion fails
        } else {
          console.log('🎯 Images updated successfully')
        }
      } catch (parseError) {
        console.error('Error processing images for update:', parseError)
      }
    }

    // Update product
    const { error: updateError } = await supabase
      .from("products")
      .update({
        name,
        description,
        short_description: shortDescription,
        sku,
        price,
        compare_price: comparePrice,
        cost_price: costPrice,
        category_id: categoryId,
        track_inventory: trackInventory,
        inventory_quantity: inventoryQuantity,
        low_stock_threshold: lowStockThreshold,
        weight,
        dimensions_length: dimensionsLength,
        dimensions_width: dimensionsWidth,
        dimensions_height: dimensionsHeight,
        shipping_info: shippingInfo,
        warranty_info: warrantyInfo,
        specifications: specsObject,
        tags: tagsArray,
        meta_title: metaTitle,
        meta_description: metaDescription,
        is_featured: isFeatured,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("Error updating product:", updateError)
      return { success: false, error: "Failed to update product" }
    }

    revalidatePath("/vendor/products")
    revalidatePath(`/products/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Error in updateProduct:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function updateInventoryQuantity(
  productId: string,
  newQuantity: number,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    let user = session?.user

    // Fallback: if session is not available, use userId parameter
    if (!user && userId) {
      console.log("🎭 Using fallback userId for inventory update:", userId)
      user = { id: userId } as any
    }

    if (!user) {
      return { success: false, error: "Authentication required" }
    }

    // Verify ownership
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("vendor_id")
      .eq("id", productId)
      .single()

    if (fetchError || !existingProduct) {
      return { success: false, error: "Product not found" }
    }

    if (existingProduct.vendor_id !== user.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Update only the inventory quantity
    const { error: updateError } = await supabase
      .from("products")
      .update({
        inventory_quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq("id", productId)

    if (updateError) {
      console.error("Error updating inventory quantity:", updateError)
      return { success: false, error: "Failed to update inventory quantity" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in updateInventoryQuantity:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function deleteProduct(id: string, userId?: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    let user = session?.user
    
    // If no session, try to get user from parameter
    if (!user) {
      if (!userId) {
        return { success: false, error: "Authentication required - no user ID provided" }
      }
      
      console.log('🎯 Using user ID from parameter:', userId)
      
      // Create a minimal user object with the ID
      user = {
        id: userId,
        email: 'user@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        identities: [],
        factors: []
      } as any
      
      console.log('🎯 Created user object from parameter:', user.id)
    }

    // Verify ownership
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("vendor_id")
      .eq("id", id)
      .single()

    if (fetchError || !product) {
      return { success: false, error: "Product not found" }
    }

    if (product.vendor_id !== user.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Delete product
    const { error: deleteError } = await supabase.from("products").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting product:", deleteError)
      return { success: false, error: "Failed to delete product" }
    }

    revalidatePath("/vendor/products")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteProduct:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function toggleProductStatus(id: string, userId?: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    let user = session?.user
    
    // If no session, try to get user from parameter
    if (!user) {
      if (!userId) {
        return { success: false, error: "Authentication required - no user ID provided" }
      }
      
      console.log('🎯 Using user ID from parameter (toggle):', userId)
      
      // Create a minimal user object with the ID
      user = {
        id: userId,
        email: 'user@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        identities: [],
        factors: []
      } as any
      
      console.log('🎯 Created user object from parameter (toggle):', user.id)
    }

    // Get current product status
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("vendor_id, status")
      .eq("id", id)
      .single()

    if (fetchError || !product) {
      return { success: false, error: "Product not found" }
    }

    if (product.vendor_id !== user.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Toggle status
    const newStatus = product.status === "active" ? "inactive" : "active"

    const { error: updateError } = await supabase
      .from("products")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("Error updating product status:", updateError)
      return { success: false, error: "Failed to update product status" }
    }

    revalidatePath("/vendor/products")
    return { success: true }
  } catch (error) {
    console.error("Error in toggleProductStatus:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
