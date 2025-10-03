import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()
    
    // Get standings directly - no auth check for now
    const { data: standings, error } = await supabase
      .from("division_standings")
      .select("*")
      .order("tier")
      .order("points", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 })
    }

    // Group by division
    const standingsByDivision = standings?.reduce((acc: any, team: any) => {
      if (!acc[team.division]) {
        acc[team.division] = []
      }
      acc[team.division].push(team)
      return acc
    }, {}) || {}

    return NextResponse.json(standingsByDivision)
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
