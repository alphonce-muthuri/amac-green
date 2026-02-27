import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-paystack-signature')

    // Verify webhook signature (optional but recommended for production)
    if (process.env.NODE_ENV === 'production' && signature) {
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
        .update(body)
        .digest('hex')

      if (hash !== signature) {
        console.error('[PAYSTACK_WEBHOOK] Invalid signature')
        return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 })
      }
    }

    const event = JSON.parse(body)
    console.log('[PAYSTACK_WEBHOOK] Received event:', event.event, event.data?.reference)

    // Handle charge.success event
    if (event.event === 'charge.success') {
      const transaction = event.data
      const orderId = transaction.metadata?.orderId

      if (!orderId) {
        console.error('[PAYSTACK_WEBHOOK] No orderId in transaction metadata')
        return NextResponse.json({ success: false, error: 'No orderId found' }, { status: 400 })
      }

      console.log('[PAYSTACK_WEBHOOK] Processing successful payment for order:', orderId)

      // Update order status
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          paystack_reference: transaction.reference,
          paystack_transaction_id: transaction.id.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (updateError) {
        console.error('[PAYSTACK_WEBHOOK] Error updating order:', updateError)
        return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 })
      }

      console.log('[PAYSTACK_WEBHOOK] Order updated successfully - delivery assignment should trigger')
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[PAYSTACK_WEBHOOK] Error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}