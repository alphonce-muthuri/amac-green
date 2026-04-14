import { NextResponse } from "next/server"
import { getVendorStats } from "@/app/actions/vendor-stats"

// Always resolve vendorId from the authenticated session — never from request body.
export async function GET() {
  try {
    const result = await getVendorStats()
    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error fetching vendor stats:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}