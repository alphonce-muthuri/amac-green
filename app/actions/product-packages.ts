"use server"

import { createServerClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

async function getVendorId(): Promise<string | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function listVendorProductsForPicker() {
  const vendorId = await getVendorId()
  if (!vendorId) return { success: false, error: "Unauthorized" }

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id, name, sku, price, status")
    .eq("vendor_id", vendorId)
    .eq("status", "active")
    .order("name")

  if (error) return { success: false, error: error.message }
  return { success: true, data: data ?? [] }
}

export async function listVendorPackages() {
  const vendorId = await getVendorId()
  if (!vendorId) return { success: false, error: "Unauthorized" }

  const { data, error } = await supabaseAdmin
    .from("product_packages")
    .select(
      `
      *,
      product_package_items (
        id,
        product_id,
        quantity,
        sort_order,
        products ( id, name, price, sku )
      )
    `
    )
    .eq("vendor_id", vendorId)
    .order("updated_at", { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data ?? [] }
}

export async function createProductPackage(formData: FormData) {
  const vendorId = await getVendorId()
  if (!vendorId) return { success: false, error: "Unauthorized" }

  const name = (formData.get("name") as string)?.trim()
  let slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/\s+/g, "-")
  if (!slug && name) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }
  const description = (formData.get("description") as string) || ""
  const coverage_notes = (formData.get("coverage_notes") as string) || ""
  const status = (formData.get("status") as string) || "draft"

  if (!name || !slug) return { success: false, error: "Name and slug are required" }

  const { data: pkg, error: pErr } = await supabaseAdmin
    .from("product_packages")
    .insert({
      vendor_id: vendorId,
      name,
      slug,
      description,
      coverage_notes,
      status,
    })
    .select()
    .single()

  if (pErr) return { success: false, error: pErr.message }

  revalidatePath("/vendor/packages")
  return { success: true, data: pkg }
}

export async function addPackageItem(packageId: string, productId: string, quantity: number) {
  const vendorId = await getVendorId()
  if (!vendorId) return { success: false, error: "Unauthorized" }

  const { data: pkg } = await supabaseAdmin
    .from("product_packages")
    .select("id")
    .eq("id", packageId)
    .eq("vendor_id", vendorId)
    .single()

  if (!pkg) return { success: false, error: "Package not found" }

  const qty = Math.max(1, quantity)
  const { data: existing } = await supabaseAdmin
    .from("product_package_items")
    .select("id")
    .eq("package_id", packageId)
    .eq("product_id", productId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabaseAdmin
      .from("product_package_items")
      .update({ quantity: qty })
      .eq("id", existing.id)
    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabaseAdmin.from("product_package_items").insert({
      package_id: packageId,
      product_id: productId,
      quantity: qty,
    })
    if (error) return { success: false, error: error.message }
  }
  revalidatePath("/vendor/packages")
  return { success: true }
}

export async function removePackageItem(itemId: string) {
  const vendorId = await getVendorId()
  if (!vendorId) return { success: false, error: "Unauthorized" }

  const { data: item } = await supabaseAdmin
    .from("product_package_items")
    .select("id, package_id")
    .eq("id", itemId)
    .single()

  if (!item) return { success: false, error: "Not found" }

  const { data: pkg } = await supabaseAdmin
    .from("product_packages")
    .select("vendor_id")
    .eq("id", item.package_id)
    .single()

  if (!pkg || pkg.vendor_id !== vendorId) return { success: false, error: "Not found" }

  const { error } = await supabaseAdmin.from("product_package_items").delete().eq("id", itemId)
  if (error) return { success: false, error: error.message }
  revalidatePath("/vendor/packages")
  return { success: true }
}

/** Public: active packages with line items for storefront / add-to-cart. */
export async function listActivePackages() {
  const { data, error } = await supabaseAdmin
    .from("product_packages")
    .select(
      `
      id,
      name,
      slug,
      description,
      coverage_notes,
      vendor_id,
      product_package_items (
        product_id,
        quantity,
        sort_order,
        products (
          id,
          name,
          price,
          sku,
          status,
          product_images ( image_url, is_primary )
        )
      )
    `
    )
    .eq("status", "active")

  if (error) return { success: false, error: error.message }
  return { success: true, data: data ?? [] }
}
