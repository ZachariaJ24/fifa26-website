import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    const { data: teams, error } = await supabase
      .from("teams")
      .select(`
        id,
        name,
        logo_url,
        conference_id,
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
      .order("name")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(teams || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { teamId, conferenceId } = body

    const { data: team, error } = await supabase
      .from("teams")
      .update({ conference_id: conferenceId })
      .eq("id", teamId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(team)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
