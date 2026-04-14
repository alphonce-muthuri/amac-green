import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    // Verify session — never trust client-supplied identity or amount.
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const { orderId, metadata } = await req.json()

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      )
    }

    // Look up the order from the database — do not trust client-supplied amount or email.
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, customer_id, total_amount, customer_email, payment_status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    // Verify the authenticated user owns this order.
    if (order.customer_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }

    // Reject if the order is already paid.
    if (order.payment_status === 'paid') {
      return NextResponse.json({ success: false, error: 'Order is already paid' }, { status: 400 })
    }

    const email = order.customer_email || user.email
    const amount = order.total_amount // use authoritative DB value

    console.log('[PAYSTACK] Initializing payment for order:', orderId, 'amount:', amount)

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Paystack expects amount in kobo/cents
        reference: `order_${orderId}_${Date.now()}`,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/paystack/callback`,
        metadata: {
          orderId,
          ...metadata
        }
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('[PAYSTACK] Initialization failed:', paystackData)
      return NextResponse.json(
        { success: false, error: paystackData.message || 'Payment initialization failed' },
        { status: 400 }
      )
    }

    console.log('[PAYSTACK] Payment initialized successfully:', paystackData.data.reference)

    return NextResponse.json({
      success: true,
      data: {
        authorization_url: paystackData.data.authorization_url,
        access_code: paystackData.data.access_code,
        reference: paystackData.data.reference
      }
    })

  } catch (error) {
    console.error('[PAYSTACK] Initialize error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}