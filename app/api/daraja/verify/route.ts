import { NextRequest, NextResponse } from "next/server"
import { darajaAPI } from "@/lib/daraja"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { checkoutRequestID, orderId } = body

    if (!checkoutRequestID) {
      return NextResponse.json(
        { success: false, error: "Missing checkoutRequestID" },
        { status: 400 }
      )
    }

    console.log(`[DARAJA_VERIFY] Checking payment status for:`, { checkoutRequestID, orderId })

    // First check our database
    const { data: order, error: dbError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('mpesa_checkout_request_id', checkoutRequestID)
      .single()

    if (dbError) {
      console.error('[DARAJA_VERIFY] Database error:', dbError)
      // If order not found by checkout ID, try by order ID
      if (orderId) {
        const { data: orderById, error: orderError } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()
        
        if (!orderError && orderById) {
          console.log('[DARAJA_VERIFY] Found order by ID:', orderById.id)
          // Update the order with the checkout request ID if missing
          if (!orderById.mpesa_checkout_request_id) {
            await supabaseAdmin
              .from('orders')
              .update({ mpesa_checkout_request_id: checkoutRequestID })
              .eq('id', orderId)
          }
        }
      }
    }

    // If we have a paid order in DB, return it
    if (order && order.payment_status === 'paid') {
      console.log('[DARAJA_VERIFY] Order already paid:', order.id)
      return NextResponse.json({
        success: true,
        data: {
          status: 'completed',
          resultCode: '0',
          resultDesc: 'Payment completed successfully',
          mpesaReceiptNumber: order.mpesa_transaction_id,
          transactionDate: order.updated_at
        }
      })
    }

    // If payment failed, return failed status
    if (order && order.payment_status === 'failed') {
      console.log('[DARAJA_VERIFY] Order payment failed:', order.id)
      return NextResponse.json({
        success: true,
        data: {
          status: 'failed',
          resultCode: '1',
          resultDesc: order.payment_notes || 'Payment failed',
          mpesaReceiptNumber: null,
          transactionDate: order.updated_at
        }
      })
    }

    // If not completed, query Daraja API for latest status
    try {
      const queryResponse = await darajaAPI.querySTKPush(checkoutRequestID)
      
      console.log(`[DARAJA_VERIFY] Query response:`, queryResponse)

      let status = 'pending'
      if (queryResponse.ResultCode === '0') {
        status = 'completed'
      } else if (queryResponse.ResultCode && queryResponse.ResultCode !== '1032') {
        // 1032 means request is still being processed
        status = 'failed'
      }

      // Update order status if payment completed and status changed
      if (order && status === 'completed' && order.payment_status !== 'paid') {
        const { error: orderError } = await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            payment_method: 'mpesa_daraja',
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id)

        if (orderError) {
          console.error('[DARAJA_VERIFY] Failed to update order:', orderError)
        } else {
          console.log('[DARAJA_VERIFY] Order marked as paid:', order.id)
          
          // Try to assign delivery
          setTimeout(async () => {
            try {
              const { manuallyAssignDelivery } = await import('@/app/actions/orders')
              await manuallyAssignDelivery(order.id)
            } catch (error) {
              console.error('[DARAJA_VERIFY] Failed to assign delivery:', error)
            }
          }, 1000)
        }
      } else if (order && status === 'failed' && order.payment_status !== 'failed') {
        const { error: orderError } = await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'failed',
            payment_notes: queryResponse.ResultDesc,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id)

        if (orderError) {
          console.error('[DARAJA_VERIFY] Failed to update order status to failed:', orderError)
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          status,
          resultCode: queryResponse.ResultCode,
          resultDesc: queryResponse.ResultDesc,
          merchantRequestID: queryResponse.MerchantRequestID,
          checkoutRequestID: queryResponse.CheckoutRequestID
        }
      })

    } catch (queryError) {
      console.error('[DARAJA_VERIFY] Query failed:', queryError)
      
      // Return database status if query fails
      return NextResponse.json({
        success: true,
        data: {
          status: order?.payment_status === 'paid' ? 'completed' : 'pending',
          resultCode: order?.payment_status === 'paid' ? '0' : '1032',
          resultDesc: order?.payment_notes || 'Payment verification in progress'
        }
      })
    }

  } catch (error) {
    console.error('[DARAJA_VERIFY] Verification failed:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment verification failed' 
      },
      { status: 500 }
    )
  }
}