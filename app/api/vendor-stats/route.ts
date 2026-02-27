import { NextRequest, NextResponse } from "next/server"
import { getVendorStats } from "@/app/actions/vendor-stats"

export async function POST(request: NextRequest) {
  try {
    const { vendorId } = await request.json()
    
    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: "Vendor ID is required" },
        { status: 400 }
      )
    }

    const result = await getVendorStats(vendorId)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error fetching vendor stats:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get stats for current user from session
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