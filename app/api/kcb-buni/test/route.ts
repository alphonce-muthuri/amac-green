import { NextResponse } from "next/server"
import { getKCBBuniClient } from "@/lib/kcb-buni"

export async function GET() {
  try {
    console.log('[KCB_BUNI_TEST] Testing KCB Buni connection...')
    
    // Test configuration
    const config = {
      baseUrl: process.env.KCB_BUNI_BASE_URL,
      tokenUrl: process.env.KCB_BUNI_TOKEN_URL,
      clientId: process.env.KCB_BUNI_CLIENT_ID,
      clientSecret: process.env.KCB_BUNI_CLIENT_SECRET ? '***HIDDEN***' : 'NOT_SET',
      routeCode: process.env.KCB_BUNI_ROUTE_CODE,
      useSharedShortCode: process.env.KCB_BUNI_USE_SHARED_SHORT_CODE
    }
    
    console.log('[KCB_BUNI_TEST] Configuration:', config)
    
    // Test client initialization
    const kcbClient = getKCBBuniClient()
    console.log('[KCB_BUNI_TEST] Client initialized successfully')
    
    // Test token acquisition (this will call the private method)
    try {
      // We can't directly call getAccessToken as it's private, but we can test the client creation
      return NextResponse.json({
        success: true,
        message: "KCB Buni client initialized successfully",
        config: {
          baseUrl: config.baseUrl,
          tokenUrl: config.tokenUrl,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          routeCode: config.routeCode,
          useSharedShortCode: config.useSharedShortCode
        },
        timestamp: new Date().toISOString()
      })
    } catch (tokenError) {
      console.error('[KCB_BUNI_TEST] Token test failed:', tokenError)
      return NextResponse.json({
        success: false,
        error: "Token acquisition failed",
        details: tokenError instanceof Error ? tokenError.message : String(tokenError),
        config: {
          baseUrl: config.baseUrl,
          tokenUrl: config.tokenUrl,
          clientId: config.clientId,
          clientSecret: config.clientSecret
        }
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('[KCB_BUNI_TEST] Test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: "KCB Buni test failed",
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    console.log('[KCB_BUNI_TEST] Testing STK Push with multiple phone numbers...')
    
    const kcbClient = getKCBBuniClient()
    
    // Test with different phone numbers
    const testNumbers = [
      "254722000000", // From Postman collection
      "254700000000", // Common test number
      "254748410076"  // Your number
    ]
    
    const results = []
    
    for (const phoneNumber of testNumbers) {
      try {
        const testRequest = {
          amount: "1",
          callbackUrl: process.env.KCB_BUNI_CALLBACK_URL || "https://posthere.io/test",
          invoiceNumber: "TEST-" + Date.now() + "-" + phoneNumber.slice(-4),
          phoneNumber: phoneNumber,
          transactionDescription: `Test transaction for ${phoneNumber}`
        }
        
        console.log('[KCB_BUNI_TEST] Testing STK Push for:', phoneNumber)
        
        const result = await kcbClient.initiateSTKPush(testRequest)
        
        results.push({
          phoneNumber,
          success: true,
          checkoutRequestID: result.response.CheckoutRequestID,
          responseCode: result.response.ResponseCode,
          customerMessage: result.response.CustomerMessage
        })
        
        console.log('[KCB_BUNI_TEST] ✅ Success for:', phoneNumber, 'CheckoutID:', result.response.CheckoutRequestID)
        
      } catch (error) {
        results.push({
          phoneNumber,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
        
        console.log('[KCB_BUNI_TEST] ❌ Failed for:', phoneNumber, error)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "STK Push tests completed",
      results: results,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('[KCB_BUNI_TEST] STK Push test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: "STK Push test failed",
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}