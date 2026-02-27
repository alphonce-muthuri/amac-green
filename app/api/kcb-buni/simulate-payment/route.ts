import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { orderId, checkoutRequestID, simulate = "success" } = await request.json()

    if (!orderId && !checkoutRequestID) {
      return NextResponse.json(
        { success: false, error: "Either orderId or checkoutRequestID is required" },
        { status: 400 }
      )
    }

    console.log('[KCB_BUNI_SIMULATE] Simulating payment:', { orderId, checkoutRequestID, simulate })

    // Find the order
    let query = supabaseAdmin.from("orders").select("*")
    
    if (checkoutRequestID) {
      query = query.eq("mpesa_checkout_request_id", checkoutRequestID)
    } else {
      query = query.eq("id", orderId)
    }

    const { data: order, error: orderError } = await query.single()

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    if (simulate === "success") {
      // Simulate successful payment
      const mockTransactionId = `MOCK${Date.now()}`
      
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          mpesa_transaction_id: mockTransactionId,
          payment_notes: 'Payment simulated for testing',
          updated_at: new Date().toISOString()
        })
        .eq("id", order.id)

      if (updateError) {
        console.error('[KCB_BUNI_SIMULATE] Error updating order:', updateError)
        return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 })
      }

      console.log('[KCB_BUNI_SIMULATE] ✅ Payment simulated successfully:', {
        orderId: order.id,
        orderNumber: order.order_number,
        transactionId: mockTransactionId
      })

      return NextResponse.json({
        success: true,
        message: "Payment simulated successfully",
        data: {
          orderId: order.id,
          orderNumber: order.order_number,
          transactionId: mockTransactionId,
          status: 'confirmed',
          paymentStatus: 'paid'
        }
      })

    } else {
      // Simulate failed payment
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: 'failed',
          payment_notes: 'Payment simulation failed for testing',
          updated_at: new Date().toISOString()
        })
        .eq("id", order.id)

      if (updateError) {
        console.error('[KCB_BUNI_SIMULATE] Error updating order:', updateError)
        return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 })
      }

      console.log('[KCB_BUNI_SIMULATE] ❌ Payment failure simulated:', {
        orderId: order.id,
        orderNumber: order.order_number
      })

      return NextResponse.json({
        success: true,
        message: "Payment failure simulated",
        data: {
          orderId: order.id,
          orderNumber: order.order_number,
          status: 'pending',
          paymentStatus: 'failed'
        }
      })
    }

  } catch (error) {
    console.error('[KCB_BUNI_SIMULATE] Simulation error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to simulate payment" 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')
  const checkoutRequestID = searchParams.get('checkoutRequestID')
  const simulate = searchParams.get('simulate') || 'success'

  if (!orderId && !checkoutRequestID) {
    return NextResponse.json(
      { success: false, error: "Either orderId or checkoutRequestID parameter is required" },
      { status: 400 }
    )
  }

  // Reuse POST logic
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ orderId, checkoutRequestID, simulate }),
    headers: { 'Content-Type': 'application/json' }
  }))
}