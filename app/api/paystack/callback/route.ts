import { NextRequest, NextResponse } from 'next/server'

// Prevent Next.js from trying to prerender this handler.
export const dynamic = 'force-dynamic'

function getRequiredBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (!baseUrl) {
    throw new Error('Missing required site URL: set NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_SITE_URL')
  }
  return baseUrl
}

export async function GET(req: NextRequest) {
  try {
    // Use nextUrl to avoid relying on request.url (which breaks static prerendering).
    const { searchParams } = req.nextUrl
    const reference = searchParams.get('reference')
    const trxref = searchParams.get('trxref')

    console.log('[PAYSTACK] Callback received:', { reference, trxref })

    // Use reference or trxref (Paystack sends both)
    const paymentReference = reference || trxref

    if (!paymentReference) {
      console.error('[PAYSTACK] No payment reference in callback')
      const baseUrl = getRequiredBaseUrl()
      return NextResponse.redirect(new URL('/checkout?error=no_reference', baseUrl))
    }

    const baseUrl = getRequiredBaseUrl()

    // Verify the payment
    const verifyUrl = new URL('/api/paystack/verify', baseUrl)
    const verifyResponse = await fetch(verifyUrl, {
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
      return NextResponse.redirect(new URL(`/checkout/success?order=${orderId}&payment=success`, baseUrl))
    } else {
      console.error('[PAYSTACK] Payment verification failed:', verifyData)
      return NextResponse.redirect(new URL('/checkout?error=payment_failed', baseUrl))
    }

  } catch (error) {
    console.error('[PAYSTACK] Callback error:', error)
    // Fail hard when callback URL base is not configured.
    if (!process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json(
        { success: false, error: 'Payment callback misconfigured: missing site URL' },
        { status: 500 }
      )
    }
    const baseUrl = getRequiredBaseUrl()
    return NextResponse.redirect(new URL('/checkout?error=callback_error', baseUrl))
  }
}