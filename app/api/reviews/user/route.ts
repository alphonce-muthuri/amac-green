import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get("productId")
  const userId = searchParams.get("userId")

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
  }

  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    let user = session?.user

    // Fallback: if session is not available, use userId from query params
    if (!user && userId) {
      console.log("🎭 Using fallback userId from query params:", userId)
      user = { id: userId } as any
    }

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Use service role client to bypass RLS
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: review, error } = await supabaseAdmin
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error("Error fetching user review:", error)
      return NextResponse.json({ error: "Failed to fetch review" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: review || null })
  } catch (error) {
    console.error("Error in GET /api/reviews/user:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
