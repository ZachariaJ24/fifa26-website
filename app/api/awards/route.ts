// Midnight Studios INTl - All rights reserved

import { NextResponse } from "next/server"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Fetch team awards
    const { data: teamAwardsData, error: teamAwardsError } = await supabase
      .from("team_awards")
      .select(`
        id,
        team_id,
        teams:team_id (name, logo_url),
        award_type,
        season_number,
        year,
        description
      `)
      .order("year", { ascending: false })
      .order("season_number", { ascending: false })

    if (teamAwardsError) throw teamAwardsError

    const formattedTeamAwards = teamAwardsData.map((award) => ({
      id: award.id,
      team_id: award.team_id,
      team_name: award.teams?.name || "Unknown Team",
      team_logo: award.teams?.logo_url || null,
      award_type: award.award_type,
      season_number: award.season_number,
      year: award.year,
      description: award.description,
    }))

    // Fetch player awards with team info
    const { data: playerAwardsData, error: playerAwardsError } = await supabase
      .from("player_awards")
      .select(`
        id,
        player_id,
        players:player_id (
          users:user_id (gamer_tag_id),
          team_id,
          teams:team_id (name, logo_url)
        ),
        award_type,
        season_number,
        year,
        description
      `)
      .order("year", { ascending: false })
      .order("season_number", { ascending: false })

    if (playerAwardsError) throw playerAwardsError

    const formattedPlayerAwards = playerAwardsData.map((award) => ({
      id: award.id,
      player_id: award.player_id,
      gamer_tag_id: award.players?.users?.gamer_tag_id || "Unknown Player",
      team_id: award.players?.team_id || null,
      team_name: award.players?.teams?.name || null,
      team_logo: award.players?.teams?.logo_url || null,
      award_type: award.award_type,
      season_number: award.season_number,
      year: award.year,
      description: award.description,
    }))

    // Fetch seasons
    const { data: seasonsData, error: seasonsError } = await supabase
      .from("seasons")
      .select("id, name, number")
      .order("name")

    if (seasonsError) throw seasonsError

    return NextResponse.json({
      teamAwards: formattedTeamAwards,
      playerAwards: formattedPlayerAwards,
      seasons: seasonsData,
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
