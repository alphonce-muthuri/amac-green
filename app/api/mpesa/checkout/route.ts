import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { phone, amount, orderId } = await req.json()
    if (!phone || !amount) {
      return NextResponse.json({ success: false, error: "Phone and amount are required." }, { status: 400 })
    }

    // Get env vars
    const consumerKey = process.env.MPESA_CONSUMER_KEY
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET
    const shortcode = process.env.MPESA_SHORTCODE
    const passkey = process.env.MPESA_PASSKEY
    const baseUrl = process.env.MPESA_BASE_URL

    const explicitSimulation = process.env.MPESA_SIMULATION === "true"
    const missingCredentials = !consumerKey || !consumerSecret || !shortcode || !passkey || !baseUrl
    const isSimulation = explicitSimulation || missingCredentials

    if (isSimulation) {
      if (missingCredentials) {
        console.log("🎭 MPESA SIMULATION MODE - Missing credentials, using simulation")
      } else {
        console.log("🎭 MPESA SIMULATION MODE - Explicitly enabled")
      }

      // Simulate a delay to mimic real API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate a fake CheckoutRequestID
      const fakeCheckoutRequestId = `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Store the CheckoutRequestID for callback tracking
      if (orderId) {
        const { supabaseAdmin } = await import("@/lib/supabase-server")
        await supabaseAdmin
          .from("orders")
          .update({
            mpesa_checkout_request_id: fakeCheckoutRequestId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId)
      }

      setTimeout(async () => {
        try {
          const callbackUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          await fetch(`${callbackUrl}/api/mpesa/callback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              Body: {
                stkCallback: {
                  ResultCode: 0,
                  ResultDesc: "The service request is processed successfully.",
                  CheckoutRequestID: fakeCheckoutRequestId,
                  CallbackMetadata: {
                    Item: [{ Name: "TransactionID", Value: `SIM_TXN_${Date.now()}` }],
                  },
                },
              },
            }),
          })
          console.log("🎭 SIMULATION - Auto-triggered successful payment callback")
        } catch (error) {
          console.error("🎭 SIMULATION - Failed to trigger callback:", error)
        }
      }, 3000)

      // Simulate successful STK push
      return NextResponse.json({
        success: true,
        message:
          "STK push sent. Complete payment on your phone. (Simulation mode - payment will auto-complete in 3 seconds)",
        checkoutRequestId: fakeCheckoutRequestId,
        simulation: true,
      })
    }

    // Normalize phone number to handle various input formats
    let normalizedPhone = phone.toString().trim()

    // Remove any non-digit characters except +
    normalizedPhone = normalizedPhone.replace(/[^\d+]/g, "")

    // Handle different input formats
    if (normalizedPhone.startsWith("+254")) {
      // Already in international format, remove the +
      normalizedPhone = normalizedPhone.substring(1)
    } else if (normalizedPhone.startsWith("254")) {
      // Already in international format without +
      normalizedPhone = normalizedPhone
    } else if (normalizedPhone.startsWith("0")) {
      // Local format, convert to international
      normalizedPhone = "254" + normalizedPhone.substring(1)
    } else if (normalizedPhone.startsWith("7") || normalizedPhone.startsWith("1")) {
      // Number starting with 7 or 1, assume it's missing the country code
      normalizedPhone = "254" + normalizedPhone
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format. Please use format: 07XXXXXXXX or +254XXXXXXXXX" },
        { status: 400 },
      )
    }

    // Validate the final format (should be 254 followed by 9 digits)
    if (!/^254[17]\d{8}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number. Please use a valid Kenyan phone number." },
        { status: 400 },
      )
    }

    // Validate and format amount (MPESA requires integer amounts)
    const amountInt = Math.round(Number(amount))
    if (isNaN(amountInt) || amountInt <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount. Please provide a valid positive number." },
        { status: 400 },
      )
    }

    // Validate all required MPESA credentials
    const missingCredentialsList = []
    if (!consumerKey) missingCredentialsList.push("MPESA_CONSUMER_KEY")
    if (!consumerSecret) missingCredentialsList.push("MPESA_CONSUMER_SECRET")
    if (!shortcode) missingCredentialsList.push("MPESA_SHORTCODE")
    if (!passkey) missingCredentialsList.push("MPESA_PASSKEY")
    if (!baseUrl) missingCredentialsList.push("MPESA_BASE_URL")

    if (missingCredentialsList.length > 0) {
      console.error("Missing MPESA credentials:", missingCredentialsList)
      return NextResponse.json(
        {
          success: false,
          error: `MPESA credentials not configured: ${missingCredentialsList.join(", ")}`,
        },
        { status: 500 },
      )
    }

    // Validate shortcode format (should be numeric)
    if (!/^\d+$/.test(shortcode)) {
      console.error("Invalid shortcode format:", shortcode)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid shortcode format. Shortcode should be numeric.",
        },
        { status: 500 },
      )
    }

    // Validate callback URL (must be publicly accessible)
    const callbackUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com"
    if (callbackUrl.includes("localhost") || callbackUrl.includes("127.0.0.1")) {
      console.error("Invalid callback URL for MPESA:", callbackUrl)
      return NextResponse.json(
        {
          success: false,
          error: "MPESA requires a publicly accessible callback URL. Please set NEXT_PUBLIC_SITE_URL to your domain.",
        },
        { status: 500 },
      )
    }

    // Get access token
    console.log("🚀 MPESA Credentials Check:", {
      consumerKey: consumerKey ? "Set" : "Missing",
      consumerSecret: consumerSecret ? "Set" : "Missing",
      shortcode: shortcode ? "Set" : "Missing",
      passkey: passkey ? "Set" : "Missing",
      baseUrl: baseUrl ? "Set" : "Missing",
    })

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")
    console.log("🚀 MPESA Token URL:", `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`)

    const tokenRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
    })

    if (!tokenRes.ok) {
      console.error("MPESA token request failed:", tokenRes.status, tokenRes.statusText)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to authenticate with MPESA API: ${tokenRes.status} ${tokenRes.statusText}`,
        },
        { status: 500 },
      )
    }

    const tokenData = await tokenRes.json()
    console.log("🚀 MPESA Token Response:", tokenData)

    if (!tokenData.access_token) {
      console.error("MPESA token response invalid:", tokenData)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to get MPESA access token: ${tokenData.error_description || "Invalid response"}`,
        },
        { status: 500 },
      )
    }
    const accessToken = tokenData.access_token
    console.log("🚀 MPESA Access Token received successfully")

    // Prepare STK push payload
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14)
    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64")

    // Generate a unique CheckoutRequestID
    const checkoutRequestId = `CHECKOUT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const finalCallbackUrl = `${callbackUrl}/api/mpesa/callback`

    console.log("🚀 MPESA Payload Preparation:", {
      timestamp,
      shortcode,
      passkey: passkey ? "Set" : "Missing",
      originalAmount: amount,
      validatedAmount: amountInt,
      normalizedPhone,
      callbackUrl: finalCallbackUrl,
    })

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amountInt,
      PartyA: normalizedPhone,
      PartyB: shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: finalCallbackUrl,
      AccountReference: orderId ? `ORDER_${orderId}` : "EVERREADY",
      TransactionDesc: "Order Payment",
    }

    // Send STK push
    console.log("🚀 MPESA STK Push Payload:", JSON.stringify(payload, null, 2))
    console.log("🚀 MPESA STK Push URL:", `${baseUrl}/mpesa/stkpush/v1/processrequest`)

    const stkRes = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!stkRes.ok) {
      const errorText = await stkRes.text()
      console.error("MPESA STK push request failed:", stkRes.status, stkRes.statusText)
      console.error("MPESA STK push error response:", errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to send STK push: ${stkRes.status} ${stkRes.statusText}`,
          details: errorText,
        },
        { status: 500 },
      )
    }

    const stkData = await stkRes.json()
    console.log("MPESA STK Push Response:", stkData)

    if (stkData.ResponseCode === "0") {
      console.log("MPESA STK Push Success:", stkData)

      // Store the CheckoutRequestID for callback tracking
      if (orderId) {
        // Update order with CheckoutRequestID
        const { supabaseAdmin } = await import("@/lib/supabase-server")
        await supabaseAdmin
          .from("orders")
          .update({
            mpesa_checkout_request_id: stkData.CheckoutRequestID,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId)
      }

      return NextResponse.json({
        success: true,
        message: "STK push sent. Complete payment on your phone.",
        checkoutRequestId: stkData.CheckoutRequestID,
      })
    } else {
      console.error("MPESA STK Push Error:", stkData)
      const errorMessage = stkData.errorMessage || stkData.errorCode || "STK push failed"
      return NextResponse.json(
        {
          success: false,
          error: `MPESA Error: ${errorMessage}`,
          errorCode: stkData.errorCode,
          errorMessage: stkData.errorMessage,
        },
        { status: 500 },
      )
    }
  } catch (err) {
    console.error("MPESA API Error:", err)
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 })
  }
}
