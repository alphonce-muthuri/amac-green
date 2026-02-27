import { NextRequest, NextResponse } from "next/server"
import { sendNewJobNotificationToProfessionals, sendNewBidNotificationToCustomer } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { type, ...data } = await request.json()

    if (type === 'new-job') {
      const result = await sendNewJobNotificationToProfessionals(data)
      return NextResponse.json(result)
    } else if (type === 'new-bid') {
      const result = await sendNewBidNotificationToCustomer(data)
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid notification type" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[EMAIL_API] Error:', error)
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Installation email notifications endpoint",
    usage: {
      "new-job": "POST with job data to notify professionals",
      "new-bid": "POST with bid data to notify customer"
    }
  })
}