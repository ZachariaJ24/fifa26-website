import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const seasonId = searchParams.get("season_id")
    const conferenceId = searchParams.get("conference_id")
    const activeOnly = searchParams.get("active_only") === "true"

    let query = supabase
      .from("clubs")
      .select(`
        *,
        conference:conferences(id, name),
        season:seasons(id, name)
      `)
      .order("name")

    if (seasonId) {
      query = query.eq("season_id", seasonId)
    }

    if (conferenceId) {
      query = query.eq("conference_id", conferenceId)
    }

    if (activeOnly) {
      query = query.eq("is_active", true)
    }

    const { data: clubs, error } = await query

    if (error) {
      console.error("Error fetching clubs:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ clubs })
  } catch (error: any) {
    console.error("Error in clubs API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    const { data: club, error } = await supabase
      .from("clubs")
      .insert({
        name: body.name,
        logo_url: body.logo_url,
        season_id: body.season_id,
        ea_club_id: body.ea_club_id,
        is_active: body.is_active ?? true,
        conference_id: body.conference_id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating club:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ club })
  } catch (error: any) {
    console.error("Error in clubs POST API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
