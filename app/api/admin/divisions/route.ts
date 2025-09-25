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

    // Get all divisions with team counts
    const { data: divisions, error: divisionsError } = await supabase
      .from("divisions")
      .select(`
        id,
        name,
        tier,
        color,
        description,
        created_at,
        updated_at
      `)
      .order("tier")

    if (divisionsError) {
      console.error("Error fetching divisions:", divisionsError)
      return NextResponse.json({ error: "Failed to fetch divisions" }, { status: 500 })
    }

    // Get team counts for each division
    const { data: teamCounts, error: teamCountsError } = await supabase
      .from("teams")
      .select("division")
      .eq("is_active", true)

    if (teamCountsError) {
      console.error("Error fetching team counts:", teamCountsError)
      return NextResponse.json({ error: "Failed to fetch team counts" }, { status: 500 })
    }

    // Count teams per division
    const divisionTeamCounts = teamCounts?.reduce((acc, team) => {
      const division = team.division || "Unassigned"
      acc[division] = (acc[division] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Add team counts to divisions
    const divisionsWithCounts = divisions?.map(division => ({
      ...division,
      team_count: divisionTeamCounts[division.name] || 0
    })) || []

    return NextResponse.json(divisionsWithCounts)
  } catch (error: any) {
    console.error("Error in /api/admin/divisions:", error)
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

    const { name, tier, color, description } = await request.json()

    if (!name || !tier || !color) {
      return NextResponse.json({ error: "Name, tier, and color are required" }, { status: 400 })
    }

    // Create new division
    const { data: division, error: divisionError } = await supabase
      .from("divisions")
      .insert({
        name,
        tier,
        color,
        description: description || null
      })
      .select()
      .single()

    if (divisionError) {
      console.error("Error creating division:", divisionError)
      return NextResponse.json({ error: "Failed to create division" }, { status: 500 })
    }

    return NextResponse.json(division)
  } catch (error: any) {
    console.error("Error in /api/admin/divisions POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
