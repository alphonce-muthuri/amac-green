import { NextRequest, NextResponse } from "next/server"
import { darajaAPI, getDarajaCallbackUrl, isLikelyRejectedDarajaCallbackUrl } from "@/lib/daraja"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, amount, orderId, customerName, email } = body

    // Validate required fields
    if (!phoneNumber || !amount || !orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: phoneNumber, amount, orderId" },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be greater than 0" },
        { status: 400 }
      )
    }

    console.log(`[DARAJA] Initiating STK Push for order ${orderId}:`, {
      phoneNumber,
      amount,
      customerName
    })

    // Prepare STK Push parameters
    // Daraja STK: AccountReference max 12 chars, TransactionDesc max 13 (Safaricom returns HTTP 400 if exceeded)
    const callbackURL = getDarajaCallbackUrl()
    if (isLikelyRejectedDarajaCallbackUrl(callbackURL)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "M-Pesa STK requires a public HTTPS CallBackURL. localhost is rejected. Set MPESA_CALLBACK_URL in .env to your tunnel URL, e.g. https://xxxx.ngrok-free.app/api/daraja/callback (see .env.example).",
        },
        { status: 400 }
      )
    }
    const orderKey = String(orderId).replace(/-/g, "")
    const accountReference = orderKey.slice(0, 12)
    const transactionDesc = (`Pay${orderKey.slice(0, 10)}`).slice(0, 13)

    // Initiate STK Push
    const stkResponse = await darajaAPI.initiateSTKPush({
      phoneNumber,
      amount,
      accountReference,
      transactionDesc,
      callbackURL
    })

    console.log(`[DARAJA] STK Push initiated successfully:`, {
      checkoutRequestID: stkResponse.CheckoutRequestID,
      merchantRequestID: stkResponse.MerchantRequestID
    })

    // Update the order with checkout request ID and payment details
    const { error: orderUpdateError } = await supabaseAdmin
      .from('orders')
      .update({
        mpesa_checkout_request_id: stkResponse.CheckoutRequestID,
        payment_method: 'mpesa_daraja',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (orderUpdateError) {
      console.error('[DARAJA] Failed to update order with checkout request ID:', orderUpdateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update order with payment details' },
        { status: 500 }
      )
    }

    console.log(`[DARAJA] Order updated with checkout request ID: ${stkResponse.CheckoutRequestID}`)

    return NextResponse.json({
      success: true,
      data: {
        checkoutRequestID: stkResponse.CheckoutRequestID,
        merchantRequestID: stkResponse.MerchantRequestID,
        customerMessage: stkResponse.CustomerMessage
      }
    })

  } catch (error) {
    console.error('[DARAJA] STK Push initialization failed:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize M-Pesa payment' 
      },
      { status: 500 }
    )
  }
}