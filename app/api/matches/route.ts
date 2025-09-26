import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { searchParams } = new URL(request.url)
    const season = searchParams.get("season")
    const status = searchParams.get("status")
    const conference = searchParams.get("conference")

    let query = supabase
      .from("matches")
      .select(`
        id,
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        status,
        match_date,
        venue,
        attendance,
        referee,
        overtime,
        has_overtime,
        has_shootout,
        ea_match_id,
        season_id,
        home_team:teams!home_team_id(
          id,
          name,
          logo_url,
          conference_id,
          conferences(
            id,
            name,
            color
          )
        ),
        away_team:teams!away_team_id(
          id,
          name,
          logo_url,
          conference_id,
          conferences(
            id,
            name,
            color
          )
        ),
        seasons(
          id,
          name,
          season_number
        )
      `)

    // Apply filters
    if (season) {
      query = query.eq("season_id", season)
    } else {
      // Default to current active season
      const { data: seasonData } = await supabase
        .from("seasons")
        .select("id")
        .eq("is_active", true)
        .single()
      
      if (seasonData) {
        query = query.eq("season_id", seasonData.id)
      }
    }

    if (status) {
      query = query.eq("status", status)
    }

    // Filter by conference if specified
    if (conference) {
      query = query.or(`home_team.conference_id.eq.${conference},away_team.conference_id.eq.${conference}`)
    }

    const { data: matches, error } = await query
      .order("match_date", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(matches)
  } catch (error: any) {
    console.error("Error fetching matches:", error)
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
    const { 
      home_team_id, 
      away_team_id, 
      season_id, 
      match_date, 
      venue, 
      referee 
    } = body

    if (!home_team_id || !away_team_id) {
      return NextResponse.json({ error: "Home and away team IDs are required" }, { status: 400 })
    }

    if (home_team_id === away_team_id) {
      return NextResponse.json({ error: "Home and away teams must be different" }, { status: 400 })
    }

    // Get current season if not provided
    let actualSeasonId = season_id
    if (!actualSeasonId) {
      const { data: seasonData } = await supabase
        .from("seasons")
        .select("id")
        .eq("is_active", true)
        .single()
      
      if (!seasonData) {
        return NextResponse.json({ error: "No active season found" }, { status: 404 })
      }
      actualSeasonId = seasonData.id
    }

    const { data: match, error } = await supabase
      .from("matches")
      .insert({
        home_team_id,
        away_team_id,
        season_id: actualSeasonId,
        match_date: match_date || new Date().toISOString(),
        venue,
        referee,
        status: "scheduled"
      })
      .select(`
        id,
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        status,
        match_date,
        venue,
        referee,
        home_team:teams!home_team_id(
          id,
          name,
          logo_url,
          conferences(
            id,
            name,
            color
          )
        ),
        away_team:teams!away_team_id(
          id,
          name,
          logo_url,
          conferences(
            id,
            name,
            color
          )
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(match, { status: 201 })
  } catch (error: any) {
    console.error("Error creating match:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
