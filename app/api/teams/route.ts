import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data: teams, error } = await supabase
      .from("teams")
      .select(`
        id,
        name,
        logo_url,
        conference_id,
        division,
        is_active,
        wins,
        losses,
        otl,
        points,
        goals_for,
        goals_against,
        games_played,
        conferences(
          id,
          name,
          color,
          description
        )
      `)
      .eq("is_active", true)
      .order("points", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(teams)
  } catch (error: any) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Check if user is admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "Admin")
      .single()

    if (roleError || !userRole) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { name, logo_url, conference_id, division } = body

    if (!name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    const { data: team, error } = await supabase
      .from("teams")
      .insert({
        name,
        logo_url,
        conference_id: conference_id || null,
        division: division || "Premier Division"
      })
      .select(`
        id,
        name,
        logo_url,
        conference_id,
        division,
        conferences(
          id,
          name,
          color
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(team, { status: 201 })
  } catch (error: any) {
    console.error("Error creating team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}