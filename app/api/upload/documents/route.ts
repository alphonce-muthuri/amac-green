import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, createServerClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  // Require an authenticated session before accepting any upload.
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const applicationType = formData.get("applicationType") as string
    const applicationId = formData.get("applicationId") as string
    const documentType = formData.get("documentType") as string

    if (!file || !applicationType || !applicationId || !documentType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size too large. Maximum size is 10MB." },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `documents/${applicationType}/${applicationId}/${documentType}-${Date.now()}.${fileExt}`

    // Upload file using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      console.error("Document upload error:", error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      message: "Document uploaded successfully"
    })
  } catch (error) {
    console.error('[UPLOAD] Document upload error:', error)
    return NextResponse.json(
      { success: false, error: "Failed to upload document" },
      { status: 500 }
    )
  }
}