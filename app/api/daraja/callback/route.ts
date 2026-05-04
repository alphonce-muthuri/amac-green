import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { restoreInventory } from "@/app/actions/inventory"

interface DarajaCallbackBody {
    Body: {
        stkCallback: {
            MerchantRequestID: string
            CheckoutRequestID: string
            ResultCode: number
            ResultDesc: string
            CallbackMetadata?: {
                Item: Array<{
                    Name: string
                    Value: string | number
                }>
            }
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        // Log all incoming requests for debugging
        console.log('[DARAJA_CALLBACK] Callback endpoint hit at:', new Date().toISOString())
        console.log('[DARAJA_CALLBACK] Request headers:', Object.fromEntries(request.headers.entries()))
        
        const body: DarajaCallbackBody = await request.json()
        console.log('[DARAJA_CALLBACK] Raw body received:', JSON.stringify(body, null, 2))
        
        if (!body.Body || !body.Body.stkCallback) {
            console.error('[DARAJA_CALLBACK] Invalid callback structure:', body)
            return NextResponse.json({ success: false, error: 'Invalid callback structure' }, { status: 400 })
        }
        
        const { stkCallback } = body.Body
        console.log('[DARAJA_CALLBACK] Processing STK callback:', JSON.stringify(stkCallback, null, 2))

        const {
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            CallbackMetadata
        } = stkCallback

        // Find the order using checkout request ID
        const { data: order, error: findError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('mpesa_checkout_request_id', CheckoutRequestID)
            .single()

        if (findError || !order) {
            console.error('[DARAJA_CALLBACK] Order not found for checkout request ID:', CheckoutRequestID)
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
        }

        let orderUpdateData: any = {
            updated_at: new Date().toISOString()
        }

        // Check if payment was successful
        if (ResultCode === 0) {
            // Payment successful
            orderUpdateData.payment_status = 'paid'
            orderUpdateData.status = 'confirmed'
            orderUpdateData.payment_method = 'mpesa_daraja'

            // Extract payment details from callback metadata
            if (CallbackMetadata?.Item) {
                const metadata: Record<string, any> = {}
                CallbackMetadata.Item.forEach(item => {
                    metadata[item.Name] = item.Value
                })

                orderUpdateData.mpesa_transaction_id = metadata.MpesaReceiptNumber
                orderUpdateData.payment_notes = `M-Pesa Receipt: ${metadata.MpesaReceiptNumber}`
            }

            console.log('[DARAJA_CALLBACK] Payment successful:', {
                orderId: order.id,
                amount: order.total_amount,
                receipt: orderUpdateData.mpesa_transaction_id
            })

        } else {
            // Payment failed
            orderUpdateData.payment_status = 'failed'
            orderUpdateData.payment_notes = `Payment failed: ${ResultDesc}`

            console.log('[DARAJA_CALLBACK] Payment failed:', {
                orderId: order.id,
                resultCode: ResultCode,
                resultDesc: ResultDesc
            })
        }

        // Update order with payment result
        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update(orderUpdateData)
            .eq('id', order.id)

        if (updateError) {
            console.error('[DARAJA_CALLBACK] Failed to update order:', updateError)
            return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 })
        }

        // If payment failed, restore inventory so stock is not permanently lost
        if (ResultCode !== 0) {
            await restoreInventory(order.id)
        }

        // If payment was successful, try to assign delivery
        if (ResultCode === 0) {
            console.log('[DARAJA_CALLBACK] Attempting to assign delivery for paid order:', order.id)
            
            // Import and call delivery assignment (don't await to avoid blocking callback)
            setTimeout(async () => {
                try {
                    const { manuallyAssignDelivery } = await import('@/app/actions/orders')
                    await manuallyAssignDelivery(order.id)
                } catch (error) {
                    console.error('[DARAJA_CALLBACK] Failed to assign delivery:', error)
                }
            }, 1000)
        }

        console.log('[DARAJA_CALLBACK] Order updated successfully:', order.id)
        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('[DARAJA_CALLBACK] Callback processing failed:', error)
        return NextResponse.json(
            { success: false, error: 'Callback processing failed' },
            { status: 500 }
        )
    }
}

// GET endpoint for testing callback connectivity
export async function GET() {
    console.log('[DARAJA_CALLBACK] GET request received at:', new Date().toISOString())
    return NextResponse.json({ 
        message: 'Daraja callback endpoint is accessible',
        timestamp: new Date().toISOString(),
        url: '/api/daraja/callback'
    })
}