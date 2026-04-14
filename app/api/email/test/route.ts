import { NextRequest, NextResponse } from "next/server"
import { sendTestEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      )
    }

    console.log('[EMAIL_TEST] Sending test email to:', email)
    
    const result = await sendTestEmail(email)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully",
        messageId: result.messageId
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[EMAIL_TEST] Error:', error)
    return NextResponse.json(
      { success: false, error: "Failed to send test email" },
      { status: 500 }
    )
  }
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({
    message: "Email test endpoint",
    usage: "POST with { email: 'test@example.com' }"
  })
}