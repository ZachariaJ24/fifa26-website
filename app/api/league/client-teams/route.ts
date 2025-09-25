import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()
    
    // Get teams directly - no auth check for now
    const { data: teams, error } = await supabase
      .from("teams")
      .select(`
        id,
        name,
        division,
        logo_url,
        is_active,
        wins,
        losses,
        otl,
        points,
        goals_for,
        goals_against
      `)
      .eq("is_active", true)
      .order("name")

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 })
    }

    return NextResponse.json(teams || [])
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { teamId, division } = body

    // Update team division directly
    const { data: team, error } = await supabase
      .from("teams")
      .update({ division })
      .eq("id", teamId)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 })
    }

    return NextResponse.json(team)
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
