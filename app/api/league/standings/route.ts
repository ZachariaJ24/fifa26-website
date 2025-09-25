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

    // Get standings using the view
    const { data: standings, error } = await supabase
      .from("division_standings")
      .select("*")
      .order("tier")
      .order("points", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch standings" }, { status: 500 })
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
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
