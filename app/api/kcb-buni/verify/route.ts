import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { checkoutRequestID, orderId } = await request.json()

    if (!checkoutRequestID && !orderId) {
      return NextResponse.json(
        { success: false, error: "Either checkoutRequestID or orderId is required" },
        { status: 400 }
      )
    }

    console.log('[KCB_BUNI_VERIFY] Verifying payment:', { checkoutRequestID, orderId })

    // Query order by checkout request ID or order ID
    let query = supabaseAdmin
      .from("orders")
      .select("*")

    if (checkoutRequestID) {
      query = query.eq("mpesa_checkout_request_id", checkoutRequestID)
    } else {
      query = query.eq("id", orderId)
    }

    const { data: order, error: orderError } = await query.single()

    if (orderError || !order) {
      console.error('[KCB_BUNI_VERIFY] Order not found:', { checkoutRequestID, orderId })
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    console.log('[KCB_BUNI_VERIFY] Order found:', {
      orderId: order.id,
      orderNumber: order.order_number,
      paymentStatus: order.payment_status,
      status: order.status
    })

    // Return order status
    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          payment_status: order.payment_status,
          total_amount: order.total_amount,
          mpesa_transaction_id: order.mpesa_transaction_id,
          mpesa_phone: order.mpesa_phone,
          payment_notes: order.payment_notes,
          created_at: order.created_at,
          updated_at: order.updated_at
        },
        isPaid: order.payment_status === 'paid',
        isConfirmed: order.status === 'confirmed'
      }
    })

  } catch (error) {
    console.error('[KCB_BUNI_VERIFY] Verification error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to verify payment" 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')
  const checkoutRequestID = searchParams.get('checkoutRequestID')

  if (!orderId && !checkoutRequestID) {
    return NextResponse.json(
      { success: false, error: "Either orderId or checkoutRequestID parameter is required" },
      { status: 400 }
    )
  }

  // Reuse POST logic
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ orderId, checkoutRequestID }),
    headers: { 'Content-Type': 'application/json' }
  }))
}