import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { checkoutRequestId, orderId } = await req.json()
    
    if (!checkoutRequestId || !orderId) {
      return NextResponse.json({ success: false, error: 'CheckoutRequestID and orderId are required' }, { status: 400 })
    }

    // Check if we're in simulation mode
    const isSimulation = process.env.MPESA_SIMULATION === 'true'
    
    if (!isSimulation) {
      return NextResponse.json({ success: false, error: 'Simulation mode not enabled' }, { status: 403 })
    }

    console.log('🎭 SIMULATION MODE - Simulating payment completion')

    // Simulate payment processing delay (3-5 seconds)
    const delay = Math.random() * 2000 + 3000 // 3-5 seconds
    await new Promise(resolve => setTimeout(resolve, delay))

    // Simulate the MPESA callback
    const callbackData = {
      Body: {
        stkCallback: {
          ResultCode: 0, // 0 = success
          ResultDesc: "The service request is processed successfully.",
          CheckoutRequestID: checkoutRequestId,
          CallbackMetadata: {
            Item: [
              {
                Name: "TransactionID",
                Value: `SIM_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              },
              {
                Name: "Amount",
                Value: "1.00"
              },
              {
                Name: "MpesaReceiptNumber",
                Value: `SIM_${Math.random().toString(36).substr(2, 8).toUpperCase()}`
              },
              {
                Name: "TransactionDate",
                Value: new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14)
              },
              {
                Name: "PhoneNumber",
                Value: "254708374149"
              }
            ]
          }
        }
      }
    }

    // Call the callback endpoint
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const callbackUrl = `${baseUrl}/api/mpesa/callback`
    
    const callbackResponse = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(callbackData),
    })

    if (callbackResponse.ok) {
      console.log('🎭 SIMULATION MODE - Payment simulation completed successfully')
      return NextResponse.json({ 
        success: true, 
        message: 'Payment simulation completed successfully',
        simulation: true
      })
    } else {
      console.error('🎭 SIMULATION MODE - Payment simulation failed')
      return NextResponse.json({ 
        success: false, 
        error: 'Payment simulation failed' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Payment simulation error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
