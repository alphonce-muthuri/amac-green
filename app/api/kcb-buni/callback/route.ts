import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json()
    
    console.log('[KCB_BUNI_CALLBACK] Received callback:', JSON.stringify(callbackData, null, 2))

    // Extract relevant data from callback
    // The exact structure may vary, but typically includes:
    const {
      Body: {
        stkCallback: {
          MerchantRequestID,
          CheckoutRequestID,
          ResultCode,
          ResultDesc,
          CallbackMetadata
        }
      }
    } = callbackData

    console.log('[KCB_BUNI_CALLBACK] Processing callback:', {
      merchantRequestID: MerchantRequestID,
      checkoutRequestID: CheckoutRequestID,
      resultCode: ResultCode,
      resultDesc: ResultDesc
    })

    // Find the order by checkout request ID
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, total_amount")
      .eq("mpesa_checkout_request_id", CheckoutRequestID)
      .single()

    if (orderError || !order) {
      console.error('[KCB_BUNI_CALLBACK] Order not found for CheckoutRequestID:', CheckoutRequestID)
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    // Process the callback based on result code
    if (ResultCode === 0) {
      // Payment successful
      console.log('[KCB_BUNI_CALLBACK] Payment successful for order:', order.order_number)

      // Extract transaction details from CallbackMetadata
      let transactionId = ''
      let phoneNumber = ''
      let amount = 0

      if (CallbackMetadata && CallbackMetadata.Item) {
        CallbackMetadata.Item.forEach((item: any) => {
          switch (item.Name) {
            case 'MpesaReceiptNumber':
              transactionId = item.Value
              break
            case 'PhoneNumber':
              phoneNumber = item.Value
              break
            case 'Amount':
              amount = item.Value
              break
          }
        })
      }

      // Update order as paid
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          mpesa_transaction_id: transactionId,
          mpesa_phone: phoneNumber,
          payment_notes: ResultDesc,
          updated_at: new Date().toISOString()
        })
        .eq("id", order.id)

      if (updateError) {
        console.error('[KCB_BUNI_CALLBACK] Error updating order:', updateError)
        return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 })
      }

      console.log('[KCB_BUNI_CALLBACK] Order updated successfully:', {
        orderId: order.id,
        transactionId,
        amount
      })

    } else {
      // Payment failed
      console.log('[KCB_BUNI_CALLBACK] Payment failed for order:', order.order_number, 'Reason:', ResultDesc)

      // Update order as failed
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: 'failed',
          payment_notes: ResultDesc,
          updated_at: new Date().toISOString()
        })
        .eq("id", order.id)

      if (updateError) {
        console.error('[KCB_BUNI_CALLBACK] Error updating failed order:', updateError)
      }
    }

    // Always return success to KCB Buni to acknowledge receipt
    return NextResponse.json({ 
      success: true, 
      message: "Callback processed successfully" 
    })

  } catch (error) {
    console.error('[KCB_BUNI_CALLBACK] Callback processing error:', error)
    
    // Still return success to avoid retries from KCB Buni
    return NextResponse.json({ 
      success: true, 
      message: "Callback received but processing failed" 
    })
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({ 
    message: "KCB Buni callback endpoint is active",
    timestamp: new Date().toISOString()
  })
}