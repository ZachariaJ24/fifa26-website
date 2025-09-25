import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()
    
    // Get session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin role
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "Admin")
      .single()

    if (!userRole) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get teams with division info
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
      return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
    }

    return NextResponse.json(teams || [])
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient()
    
    // Get session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin role
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "Admin")
      .single()

    if (!userRole) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { teamId, division } = body

    // Update team division
    const { data: team, error } = await supabase
      .from("teams")
      .update({ division })
      .eq("id", teamId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to update team" }, { status: 500 })
    }

    return NextResponse.json(team)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
