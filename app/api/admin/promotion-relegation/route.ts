import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()

    const { seasonId } = await request.json()

    if (!seasonId) {
      return NextResponse.json({ error: "Season ID is required" }, { status: 400 })
    }

    // Get promotion/relegation status using the new function
    const { data: promotionRelegationData, error: prError } = await supabase
      .rpc('get_promotion_relegation_status')

    if (prError) {
      console.error("Error fetching promotion/relegation data:", prError)
      return NextResponse.json({ error: "Failed to fetch promotion/relegation data" }, { status: 500 })
    }

    return NextResponse.json(promotionRelegationData || [])
  } catch (error: any) {
    console.error("Error in /api/admin/promotion-relegation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get promotion/relegation status using the new function
    const { data: promotionRelegationData, error: prError } = await supabase
      .rpc('get_promotion_relegation_status')

    if (prError) {
      console.error("Error fetching promotion/relegation data:", prError)
      return NextResponse.json({ error: "Failed to fetch promotion/relegation data" }, { status: 500 })
    }

    return NextResponse.json(promotionRelegationData || [])
  } catch (error: any) {
    console.error("Error in /api/admin/promotion-relegation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}