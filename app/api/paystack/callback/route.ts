import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('reference')
    const trxref = searchParams.get('trxref')

    console.log('[PAYSTACK] Callback received:', { reference, trxref })

    // Use reference or trxref (Paystack sends both)
    const paymentReference = reference || trxref

    if (!paymentReference) {
      console.error('[PAYSTACK] No payment reference in callback')
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/checkout?error=no_reference`)
    }

    // Verify the payment
    const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/paystack/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reference: paymentReference }),
    })

    const verifyData = await verifyResponse.json()

    if (verifyData.success && verifyData.data.transaction.status === 'success') {
      console.log('[PAYSTACK] Payment verified successfully')
      
      // Redirect to success page with order ID
      const orderId = verifyData.data.order.id
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${orderId}&payment=success`)
    } else {
      console.error('[PAYSTACK] Payment verification failed:', verifyData)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/checkout?error=payment_failed`)
    }

  } catch (error) {
    console.error('[PAYSTACK] Callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/checkout?error=callback_error`)
  }
}