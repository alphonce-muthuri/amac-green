import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("MPESA Callback received:", body)

    // Check if we're in simulation mode
    const isSimulation = process.env.MPESA_SIMULATION === "true"

    // Extract the callback data
    const {
      Body: {
        stkCallback: { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID } = {},
      } = {},
    } = body

    if (!CheckoutRequestID) {
      console.error("No CheckoutRequestID in callback")
      return NextResponse.json({ success: false, error: "Missing CheckoutRequestID" }, { status: 400 })
    }

    // Find the order by CheckoutRequestID
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("mpesa_checkout_request_id", CheckoutRequestID)
      .single()

    if (orderError || !order) {
      console.error("Order not found for CheckoutRequestID:", CheckoutRequestID)
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    let paymentStatus = "pending"
    let transactionId = null
    let errorMessage = null

    if (isSimulation && CheckoutRequestID.startsWith("SIM_")) {
      // Simulation mode - simulate successful payment
      console.log("🎭 SIMULATION MODE - Simulating successful payment")
      paymentStatus = "paid"
      transactionId = `SIM_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    } else if (ResultCode === 0) {
      // Real payment successful
      paymentStatus = "paid"

      // Extract transaction details from CallbackMetadata
      if (CallbackMetadata?.Item) {
        for (const item of CallbackMetadata.Item) {
          if (item.Name === "TransactionID") {
            transactionId = item.Value
            break
          }
        }
      }
    } else {
      // Payment failed
      paymentStatus = "failed"
      errorMessage = ResultDesc || "Payment failed"
    }

    // Update order with payment status
    const updateData: any = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    }

    if (transactionId) {
      updateData.mpesa_transaction_id = transactionId
    }

    if (errorMessage) {
      updateData.payment_notes = errorMessage
    }

    // Update order status based on payment status
    if (paymentStatus === "paid") {
      updateData.status = "confirmed"
    } else if (paymentStatus === "failed") {
      updateData.status = "cancelled"
    }

    const { error: updateError } = await supabaseAdmin.from("orders").update(updateData).eq("id", order.id)

    if (updateError) {
      console.error("Error updating order:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 })
    }

    console.log(`Order ${order.id} updated with payment status: ${paymentStatus}`)

    if (paymentStatus === "paid") {
      console.log("🚚 Payment successful - delivery assignment will be triggered by database trigger")
      // The auto_assign_delivery trigger will handle delivery assignment automatically
    }

    return NextResponse.json({
      success: true,
      message: `Order ${order.order_number} payment status updated to ${paymentStatus}`,
    })
  } catch (error) {
    console.error("MPESA Callback Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
