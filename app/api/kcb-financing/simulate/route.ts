import { NextRequest, NextResponse } from "next/server"
import { applyFinancingOutcome, getKcbFinancingSimulateSecret, isKcbFinancingSimulationEnabled } from "@/lib/financing"

export async function POST(request: NextRequest) {
  if (!isKcbFinancingSimulationEnabled()) {
    return NextResponse.json({ success: false, error: "Financing simulation is disabled" }, { status: 403 })
  }

  const secret = getKcbFinancingSimulateSecret()
  if (secret) {
    const header = request.headers.get("x-kcb-financing-simulate-secret")
    if (header !== secret) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const body = await request.json()
    const orderId = body.orderId as string | undefined
    const outcome = body.outcome as "approved" | "declined" | undefined

    if (!orderId || !outcome || !["approved", "declined"].includes(outcome)) {
      return NextResponse.json(
        { success: false, error: "orderId and outcome (approved|declined) are required" },
        { status: 400 }
      )
    }

    const result = await applyFinancingOutcome({ orderId, outcome })
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[KCB_FINANCING_SIMULATE]", e)
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  }
}
