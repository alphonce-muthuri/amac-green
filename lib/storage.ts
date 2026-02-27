import { supabase } from "@/lib/supabase"

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export async function uploadProductImage(file: File, vendorId: string, productId?: string): Promise<UploadResult> {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${vendorId}/${productId || "temp"}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from("product-images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Upload error:", error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Upload exception:", error)
    return { success: false, error: "Failed to upload image" }
  }
}

export async function deleteProductImage(imageUrl: string): Promise<boolean> {
  try {
    // Extract path from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split("/")
    const bucketIndex = pathParts.findIndex((part) => part === "product-images")

    if (bucketIndex === -1) {
      return false
    }

    const filePath = pathParts.slice(bucketIndex + 1).join("/")

    const { error } = await supabase.storage.from("product-images").remove([filePath])

    return !error
  } catch (error) {
    console.error("Delete image error:", error)
    return false
  }
}

export async function moveProductImages(
  tempProductId: string,
  actualProductId: string,
  vendorId: string,
): Promise<string[]> {
  try {
    // List all temp images
    const { data: files, error: listError } = await supabase.storage.from("product-images").list(`${vendorId}/temp`)

    if (listError || !files) {
      return []
    }

    const newUrls: string[] = []

    for (const file of files) {
      const oldPath = `${vendorId}/temp/${file.name}`
      const newPath = `${vendorId}/${actualProductId}/${file.name}`

      // Move file
      const { error: moveError } = await supabase.storage.from("product-images").move(oldPath, newPath)

      if (!moveError) {
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(newPath)

        newUrls.push(urlData.publicUrl)
      }
    }

    return newUrls
  } catch (error) {
    console.error("Move images error:", error)
    return []
  }
}

/**
 * Move a single image that lives under .../{vendorId}/temp/... into
 * .../{vendorId}/{productId}/...  and return the new public URL.
 *
 * If the image is already inside the destination folder (i.e. does **not**
 * contain `/temp/`) the same URL is returned unchanged.
 *
 * @param imageUrl   The public URL returned by Supabase Storage.
 * @param productId  The real product id we just created / updated.
 */
export async function moveImageToProductFolder(imageUrl: string, productId: string): Promise<string> {
  try {
    // ─── Parse out the full storage path ────────────────────────────────────
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split("/") // e.g. ["", "storage", "v1", "object", "public", "product-images", "{vendorId}", "temp", "filename.jpg"]
    const bucketIdx = pathParts.findIndex((p) => p === "product-images")
    // If we can’t find the bucket or there’s no /temp/ segment, return as-is.
    if (bucketIdx === -1 || !pathParts.includes("temp")) {
      return imageUrl
    }

    const vendorId = pathParts[bucketIdx + 1] // "{vendorId}"
    const fileName = pathParts[pathParts.length - 1] // "filename.jpg"

    const oldPath = `${vendorId}/temp/${fileName}`
    const newPath = `${vendorId}/${productId}/${fileName}`

    // ─── Perform the move inside Supabase Storage ───────────────────────────
    const { error: moveError } = await supabase.storage.from("product-images").move(oldPath, newPath)

    if (moveError) {
      console.error("moveImageToProductFolder → move error", moveError)
      return imageUrl // fall back to the original URL
    }

    // ─── Get the new public URL and return it ───────────────────────────────
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(newPath)

    return urlData.publicUrl
  } catch (err) {
    console.error("moveImageToProductFolder → unexpected error", err)
    return imageUrl
  }
}

// Document upload functions for applications
export async function uploadApplicationDocument(
  file: File, 
  applicationType: 'vendor' | 'professional' | 'delivery', 
  applicationId: string,
  documentType: string
): Promise<UploadResult> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Generate unique filename with user ID as folder (required by RLS policy)
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/documents/${applicationType}/${applicationId}/${documentType}-${Date.now()}.${fileExt}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      console.error("Document upload error:", error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Document upload exception:", error)
    return { success: false, error: "Failed to upload document" }
  }
}

export async function deleteApplicationDocument(documentUrl: string): Promise<boolean> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return false
    }

    // Extract path from URL
    const url = new URL(documentUrl)
    const pathParts = url.pathname.split("/")
    const bucketIndex = pathParts.findIndex((part) => part === "product-images")

    if (bucketIndex === -1) {
      return false
    }

    const filePath = pathParts.slice(bucketIndex + 1).join("/")

    // Verify the file belongs to the current user (security check)
    if (!filePath.startsWith(`${user.id}/`)) {
      console.error("User attempting to delete file that doesn't belong to them")
      return false
    }

    const { error } = await supabase.storage
      .from("product-images")
      .remove([filePath])

    return !error
  } catch (error) {
    console.error("Delete document error:", error)
    return false
  }
}