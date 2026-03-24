import { NextRequest, NextResponse } from "next/server"
import { getDarajaCallbackUrl } from "@/lib/daraja"

// Simulate a successful M-Pesa callback for testing
export async function POST(request: NextRequest) {
    try {
        const { checkoutRequestID, simulate = 'success' } = await request.json()

        if (!checkoutRequestID) {
            return NextResponse.json(
                { success: false, error: "checkoutRequestID is required" },
                { status: 400 }
            )
        }

        console.log(`[DARAJA_SIMULATE] Simulating ${simulate} callback for:`, checkoutRequestID)

        // Create mock callback data
        const mockCallbackData = {
            Body: {
                stkCallback: {
                    MerchantRequestID: `MOCK_${Date.now()}`,
                    CheckoutRequestID: checkoutRequestID,
                    ResultCode: simulate === 'success' ? 0 : 1,
                    ResultDesc: simulate === 'success' ? 'The service request is processed successfully.' : 'The balance is insufficient for the transaction.',
                    CallbackMetadata: simulate === 'success' ? {
                        Item: [
                            { Name: 'Amount', Value: 1.00 },
                            { Name: 'MpesaReceiptNumber', Value: `MOCK${Date.now()}` },
                            { Name: 'TransactionDate', Value: Date.now() },
                            { Name: 'PhoneNumber', Value: '254748410076' }
                        ]
                    } : undefined
                }
            }
        }

        // Call our own callback endpoint
        const callbackResponse = await fetch(getDarajaCallbackUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mockCallbackData)
        })

        const callbackResult = await callbackResponse.json()

        return NextResponse.json({
            success: true,
            message: `${simulate} callback simulated successfully`,
            callbackResult
        })

    } catch (error) {
        console.error('[DARAJA_SIMULATE] Simulation failed:', error)
        return NextResponse.json(
            { success: false, error: 'Callback simulation failed' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Daraja callback simulator',
        usage: 'POST with { "checkoutRequestID": "ws_CO_...", "simulate": "success|failure" }'
    })
}