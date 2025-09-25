import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "Admin")
      .single()

    if (roleError || !userRole) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 })
    }

    // Get all teams with their division information
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select(`
        id,
        name,
        division,
        logo_url,
        is_active,
        created_at,
        updated_at
      `)
      .order("name")

    if (teamsError) {
      console.error("Error fetching teams:", teamsError)
      return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
    }

    return NextResponse.json(teams || [])
  } catch (error: any) {
    console.error("Error in /api/admin/teams:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "Admin")
      .single()

    if (roleError || !userRole) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 })
    }

    const { name, division, logo_url, is_active } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    // Create new team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        name,
        division: division || null,
        logo_url: logo_url || null,
        is_active: is_active !== false
      })
      .select()
      .single()

    if (teamError) {
      console.error("Error creating team:", teamError)
      return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
    }

    return NextResponse.json(team)
  } catch (error: any) {
    console.error("Error in /api/admin/teams POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
