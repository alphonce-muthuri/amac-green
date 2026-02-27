import { NextRequest, NextResponse } from "next/server"

// Simple test endpoint to verify callback connectivity
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        
        console.log('[DARAJA_CALLBACK_TEST] Received test callback:', {
            timestamp: new Date().toISOString(),
            body: JSON.stringify(body, null, 2),
            headers: Object.fromEntries(request.headers.entries())
        })

        // Log to a simple file or database for debugging
        return NextResponse.json({ 
            success: true, 
            message: 'Test callback received successfully',
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[DARAJA_CALLBACK_TEST] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Test callback failed' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({ 
        message: 'Daraja callback test endpoint is working',
        timestamp: new Date().toISOString()
    })
}