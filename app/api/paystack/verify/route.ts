import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json()

    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    console.log('[PAYSTACK] Verifying payment:', reference)

    // Verify transaction with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const paystackData = await paystackResponse.json()

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('[PAYSTACK] Verification failed:', paystackData)
      return NextResponse.json(
        { success: false, error: paystackData.message || 'Payment verification failed' },
        { status: 400 }
      )
    }

    const transaction = paystackData.data
    console.log('[PAYSTACK] Transaction verified:', {
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount,
      orderId: transaction.metadata?.orderId
    })

    // Extract order ID from metadata
    const orderId = transaction.metadata?.orderId
    if (!orderId) {
      console.error('[PAYSTACK] No orderId in transaction metadata')
      return NextResponse.json(
        { success: false, error: 'Order ID not found in transaction' },
        { status: 400 }
      )
    }

    // Update order based on payment status
    let paymentStatus = 'pending'
    let orderStatus = 'pending'

    if (transaction.status === 'success') {
      paymentStatus = 'paid'
      orderStatus = 'confirmed'
    } else if (transaction.status === 'failed') {
      paymentStatus = 'failed'
      orderStatus = 'cancelled'
    }

    console.log('[PAYSTACK] Updating order:', orderId, 'with status:', paymentStatus)

    // Update order in database
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: paymentStatus,
        status: orderStatus,
        paystack_reference: transaction.reference,
        paystack_transaction_id: transaction.id.toString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single()

    console.log('[PAYSTACK] Update result:', { updatedOrder: updatedOrder?.id, error: updateError })

    if (updateError) {
      console.error('[PAYSTACK] Error updating order:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update order' },
        { status: 500 }
      )
    }

    console.log(`[PAYSTACK] Order ${orderId} updated with payment status: ${paymentStatus}`)

    if (paymentStatus === 'paid') {
      console.log('[PAYSTACK] 🚚 Payment successful - delivery assignment will be triggered by database trigger')
    }

    return NextResponse.json({
      success: true,
      data: {
        transaction,
        order: updatedOrder,
        message: `Payment ${transaction.status}. Order ${updatedOrder.order_number} ${paymentStatus}.`
      }
    })

  } catch (error) {
    console.error('[PAYSTACK] Verify error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}