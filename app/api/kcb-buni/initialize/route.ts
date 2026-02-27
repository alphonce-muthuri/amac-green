import { NextRequest, NextResponse } from "next/server"
import { getKCBBuniClient, KCBBuniClient } from "@/lib/kcb-buni"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, amount, orderId, customerName, email } = await request.json()

    // Validate required fields
    if (!phoneNumber || !amount || !orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: phoneNumber, amount, orderId" },
        { status: 400 }
      )
    }

    // Validate phone number
    if (!KCBBuniClient.isValidKenyanPhone(phoneNumber)) {
      return NextResponse.json(
        { success: false, error: "Invalid Kenyan phone number format" },
        { status: 400 }
      )
    }

    // Format phone number
    const formattedPhone = KCBBuniClient.formatPhoneNumber(phoneNumber)
    console.log('[KCB_BUNI_API] Phone number formatting:', {
      original: phoneNumber,
      formatted: formattedPhone
    })

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("order_number, total_amount")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    // Verify amount matches order
    const orderAmount = parseFloat(order.total_amount.toString())
    const requestAmount = parseFloat(amount.toString())
    
    if (Math.abs(orderAmount - requestAmount) > 0.01) {
      return NextResponse.json(
        { success: false, error: "Amount mismatch with order total" },
        { status: 400 }
      )
    }

    console.log('[KCB_BUNI_API] Initializing STK Push:', {
      orderId,
      orderNumber: order.order_number,
      amount: requestAmount,
      phoneNumber: formattedPhone
    })

    // Initialize KCB Buni client
    const kcbClient = getKCBBuniClient()

    // Prepare callback URL - use the same one from Postman collection for testing
    const callbackUrl = process.env.KCB_BUNI_CALLBACK_URL || 'https://posthere.io/f613-4b7f-b82b'
    
    console.log('[KCB_BUNI_API] Using callback URL:', callbackUrl)

    // Initiate STK Push
    const stkResponse = await kcbClient.initiateSTKPush({
      amount: requestAmount.toString(),
      callbackUrl,
      invoiceNumber: order.order_number,
      phoneNumber: formattedPhone,
      transactionDescription: `Payment for order ${order.order_number}`
    })

    // Check if STK Push was successful
    // ResponseCode can be string '0' or number 0, both indicate success
    const responseCode = parseInt(stkResponse.response.ResponseCode.toString())
    console.log('[KCB_BUNI_API] STK Push ResponseCode:', responseCode, 'Type:', typeof stkResponse.response.ResponseCode)
    
    if (responseCode !== 0) {
      console.error('[KCB_BUNI_API] STK Push failed with ResponseCode:', responseCode)
      return NextResponse.json(
        { 
          success: false, 
          error: stkResponse.response.ResponseDescription || "STK Push failed" 
        },
        { status: 400 }
      )
    }
    
    console.log('[KCB_BUNI_API] ✅ STK Push successful! ResponseCode:', responseCode)

    // Update order with STK Push details
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        mpesa_checkout_request_id: stkResponse.response.CheckoutRequestID,
        mpesa_merchant_request_id: stkResponse.response.MerchantRequestID,
        mpesa_phone: formattedPhone,
        payment_notes: stkResponse.response.CustomerMessage,
        updated_at: new Date().toISOString()
      })
      .eq("id", orderId)

    if (updateError) {
      console.error('[KCB_BUNI_API] Error updating order:', updateError)
      // Don't fail the request, just log the error
    }

    console.log('[KCB_BUNI_API] STK Push initiated successfully:', {
      checkoutRequestID: stkResponse.response.CheckoutRequestID,
      merchantRequestID: stkResponse.response.MerchantRequestID
    })

    return NextResponse.json({
      success: true,
      data: {
        checkoutRequestID: stkResponse.response.CheckoutRequestID,
        merchantRequestID: stkResponse.response.MerchantRequestID,
        customerMessage: stkResponse.response.CustomerMessage,
        responseDescription: stkResponse.response.ResponseDescription
      }
    })

  } catch (error) {
    console.error('[KCB_BUNI_API] Initialize error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to initialize M-Pesa payment" 
      },
      { status: 500 }
    )
  }
}