import { NextRequest, NextResponse } from "next/server"
import { darajaAPI } from "@/lib/daraja"

export async function GET() {
  try {
    console.log('[DARAJA_TEST] Testing Daraja API connection...')
    
    // Test getting access token
    const accessToken = await darajaAPI.getAccessToken()
    
    return NextResponse.json({
      success: true,
      message: 'Daraja API connection successful',
      data: {
        tokenReceived: !!accessToken,
        tokenLength: accessToken.length,
        baseURL: process.env.MPESA_BASE_URL,
        shortCode: process.env.MPESA_SHORTCODE
      }
    })

  } catch (error) {
    console.error('[DARAJA_TEST] Test failed:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Daraja API test failed',
        config: {
          baseURL: process.env.MPESA_BASE_URL,
          shortCode: process.env.MPESA_SHORTCODE,
          hasConsumerKey: !!process.env.MPESA_CONSUMER_KEY,
          hasConsumerSecret: !!process.env.MPESA_CONSUMER_SECRET,
          hasPassKey: !!process.env.MPESA_PASSKEY
        }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, amount = 1 } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Phone number is required for test" },
        { status: 400 }
      )
    }

    console.log('[DARAJA_TEST] Testing STK Push with:', { phoneNumber, amount })

    const callbackURL = `${process.env.NEXT_PUBLIC_SITE_URL}/api/daraja/callback`
    
    const response = await darajaAPI.initiateSTKPush({
      phoneNumber,
      amount,
      accountReference: 'TEST-ORDER',
      transactionDesc: 'Test Payment',
      callbackURL
    })

    return NextResponse.json({
      success: true,
      message: 'Test STK Push initiated successfully',
      data: response
    })

  } catch (error) {
    console.error('[DARAJA_TEST] STK Push test failed:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'STK Push test failed' 
      },
      { status: 500 }
    )
  }
}