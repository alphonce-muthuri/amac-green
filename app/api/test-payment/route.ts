import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    const { supabaseAdmin } = await import("@/lib/supabase-server")

    // Find the order
    const { data: order, error: orderError } = await supabaseAdmin.from("orders").select("*").eq("id", orderId).single()

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    // Generate a test transaction ID
    const testTransactionId = `TEST_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Update order to paid status
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        mpesa_transaction_id: testTransactionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("Error updating order:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 })
    }

    console.log(`🧪 TEST - Order ${order.order_number} marked as paid, delivery assignment will be triggered`)

    return NextResponse.json({
      success: true,
      message: `Order ${order.order_number} marked as paid successfully`,
      transactionId: testTransactionId,
    })
  } catch (error) {
    console.error("Test Payment Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
