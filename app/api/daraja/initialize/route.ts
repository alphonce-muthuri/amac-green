import { NextRequest, NextResponse } from "next/server"
import { darajaAPI } from "@/lib/daraja"
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
    const callbackURL = `${process.env.NEXT_PUBLIC_SITE_URL}/api/daraja/callback`
    const accountReference = `ORDER-${orderId}`
    const transactionDesc = `Payment for Order ${orderId}`

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