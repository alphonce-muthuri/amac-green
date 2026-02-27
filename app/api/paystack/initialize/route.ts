import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, amount, orderId, metadata } = await req.json()

    if (!email || !amount || !orderId) {
      return NextResponse.json(
        { success: false, error: 'Email, amount, and orderId are required' },
        { status: 400 }
      )
    }

    console.log('[PAYSTACK] Initializing payment:', { email, amount, orderId })

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Paystack expects amount in kobo (cents)
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