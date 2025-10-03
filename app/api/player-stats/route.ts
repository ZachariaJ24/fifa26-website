// Midnight Studios INTl - All rights reserved

import { NextResponse } from "next/server"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic' // Ensure the route is always dynamic

// Define the structure of our player stats
interface PlayerStats {
  player_id: string;
  player_name: string;
  team_id: string | null;
  team_name: string | null;
  games_played: number;
  goals: number;
  assists: number;
  shots: number;
  passes_completed: number;
  passes_attempted: number;
  pass_accuracy: number;
  tackles: number;
  interceptions: number;
  dribbles: number;
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // 1. Fetch all players with their team and user info
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select(`
        id,
        users ( gamer_tag_id ),
        teams ( id, name )
      `)

    if (playersError) throw new Error(`Error fetching players: ${playersError.message}`)

    // 2. Fetch all completed match stats from ea_player_stats
    const { data: matchStats, error: matchStatsError } = await supabase
      .from('ea_player_stats')
      .select('*')

    if (matchStatsError) throw new Error(`Error fetching match stats: ${matchStatsError.message}`)

    // 3. Aggregate stats for each player
    const aggregatedStats: Record<string, PlayerStats> = {}

    for (const player of players) {
      if (!player.users?.gamer_tag_id) continue; // Skip players without a gamer tag

      const playerId = player.id;
      aggregatedStats[playerId] = {
        player_id: playerId,
        player_name: player.users.gamer_tag_id,
        team_id: player.teams?.id || null,
        team_name: player.teams?.name || 'Free Agent',
        games_played: 0,
        goals: 0,
        assists: 0,
        shots: 0,
        passes_completed: 0,
        passes_attempted: 0,
        pass_accuracy: 0,
        tackles: 0,
        interceptions: 0,
        dribbles: 0,
      };
    }

    // Process each match stat record
    for (const stat of matchStats) {
        // Find the player in our aggregatedStats using the player name from stats
        const playerRecord = Object.values(aggregatedStats).find(p => p.player_name === stat.player_name);

        if (playerRecord) {
            playerRecord.games_played += 1;
            playerRecord.goals += stat.goals || 0;
            playerRecord.assists += stat.assists || 0;
            playerRecord.shots += stat.shots || 0;
            playerRecord.passes_completed += stat.pass_complete || 0;
            playerRecord.passes_attempted += stat.pass_attempts || 0;
            playerRecord.tackles += stat.takeaways || 0; // Using takeaways as tackles
            playerRecord.interceptions += stat.interceptions || 0;
            playerRecord.dribbles += stat.dekes || 0; // Using dekes as dribbles
        }
    }

    // Final calculation for pass accuracy and convert to array
    const finalStats = Object.values(aggregatedStats).map(player => {
      if (player.passes_attempted > 0) {
        player.pass_accuracy = parseFloat(((player.passes_completed / player.passes_attempted) * 100).toFixed(1));
      }
      return player;
    });

    return NextResponse.json({ playerStats: finalStats });

  } catch (error: any) {
    console.error("Error in player-stats route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
