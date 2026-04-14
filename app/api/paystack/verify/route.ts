import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { ADMIN_EMAILS } from '@/lib/require-admin'

export async function POST(req: NextRequest) {
  try {
    // Verify the caller is authenticated.
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

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

    // Extract order ID from Paystack metadata.
    const orderId = transaction.metadata?.orderId
    if (!orderId) {
      console.error('[PAYSTACK] No orderId in transaction metadata')
      return NextResponse.json(
        { success: false, error: 'Order ID not found in transaction' },
        { status: 400 }
      )
    }

    // Look up the order in our DB to verify ownership and expected amount.
    const { data: dbOrder, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('id, customer_id, total_amount, payment_status')
      .eq('id', orderId)
      .single()

    if (orderErr || !dbOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    const isAdmin = ADMIN_EMAILS.includes((user.email ?? '').toLowerCase())
    if (!isAdmin && dbOrder.customer_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    // Guard against amount tampering: Paystack returns kobo, DB stores KES.
    // Allow ±1 KES tolerance for floating-point rounding.
    const paystackAmountKES = transaction.amount / 100
    if (Math.abs(paystackAmountKES - dbOrder.total_amount) > 1) {
      console.error('[PAYSTACK] Amount mismatch — DB:', dbOrder.total_amount, 'Paystack:', paystackAmountKES)
      return NextResponse.json({ success: false, error: 'Amount mismatch' }, { status: 400 })
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