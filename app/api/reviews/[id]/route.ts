import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    let user = session?.user
    const reviewId = params.id
    const body = await request.json()
    const { rating, title, comment, userId } = body

    // Fallback: if session is not available, use userId from request body
    if (!user && userId) {
      console.log("🎭 Using fallback userId from request body:", userId)
      user = { id: userId } as any
    }

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!rating) {
      return NextResponse.json({ error: "Rating is required" }, { status: 400 })
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

    // Verify ownership
    const { data: review, error: fetchError } = await supabaseAdmin
      .from("product_reviews")
      .select("user_id")
      .eq("id", reviewId)
      .single()

    if (fetchError || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (review.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update the review using service role client
    const { error: updateError } = await supabaseAdmin
      .from("product_reviews")
      .update({
        rating,
        title,
        comment,
        updated_at: new Date().toISOString()
      })
      .eq("id", reviewId)

    if (updateError) {
      console.error("Error updating review:", updateError)
      return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PUT /api/reviews/[id]:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    let user = session?.user
    const reviewId = params.id
    const body = await request.json()
    const { userId } = body

    // Fallback: if session is not available, use userId from request body
    if (!user && userId) {
      console.log("🎭 Using fallback userId from request body:", userId)
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

    // Verify ownership
    const { data: review, error: fetchError } = await supabaseAdmin
      .from("product_reviews")
      .select("user_id")
      .eq("id", reviewId)
      .single()

    if (fetchError || !review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (review.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete the review using service role client
    const { error: deleteError } = await supabaseAdmin
      .from("product_reviews")
      .delete()
      .eq("id", reviewId)

    if (deleteError) {
      console.error("Error deleting review:", deleteError)
      return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/reviews/[id]:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
