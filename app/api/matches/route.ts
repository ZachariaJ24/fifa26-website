// Midnight Studios INTl - All rights reserved

import { NextResponse } from "next/server"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const seasonId = searchParams.get('season_id')

  try {
    let query = supabase
      .from('matches')
      .select(`
        id,
        match_date,
        status,
        home_score,
        away_score,
        home_team:teams!home_team_id(id, name, logo_url),
        away_team:teams!away_team_id(id, name, logo_url)
      `)

    if (seasonId) {
      query = query.eq('season_id', seasonId)
    } else {
        // If no season is specified, fetch the current active season
        const { data: activeSeason, error: seasonError } = await supabase
            .from('seasons')
            .select('id')
            .eq('is_active', true)
            .single();

        if (seasonError || !activeSeason) {
            throw new Error('No active season found and no season specified');
        }

        query = query.eq('season_id', activeSeason.id);
    }

    const { data, error } = await query.order('match_date', { ascending: true });

    if (error) throw new Error(error.message);

    return NextResponse.json({ matches: data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

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
