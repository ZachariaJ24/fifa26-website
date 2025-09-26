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
  position: string | null;
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
  // Goalie specific
  saves?: number;
  goals_against?: number;
  save_percentage?: number;
  clean_sheets?: number;
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // 1. Fetch all players with their team and user info
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select(`
        id,
        position,
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
      if (!player.users?.gamer_tag_id) continue;

      const playerName = player.users.gamer_tag_id;
      if (!aggregatedStats[player.id]) {
        aggregatedStats[player.id] = {
          player_id: player.id,
          player_name: playerName,
          team_id: player.teams?.id || null,
          team_name: player.teams?.name || 'Free Agent',
          position: player.position,
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
          saves: 0,
          goals_against: 0,
          save_percentage: 0,
          clean_sheets: 0,
        };
      }
    }

    const matchPlayerGames = new Set<string>();

    for (const stat of matchStats) {
        const player = aggregatedStats[stat.player_id];
        if (player) {
            const gameKey = `${stat.player_id}-${stat.match_id}`;
            if (!matchPlayerGames.has(gameKey)) {
                player.games_played += 1;
                matchPlayerGames.add(gameKey);
            }

            player.goals += stat.goals || 0;
            player.assists += stat.assists || 0;
            player.shots += stat.shots || 0;
            player.passes_completed += stat.pass_completed || 0;
            player.passes_attempted += stat.pass_attempted || 0;
            player.tackles += stat.tackles || 0;
            player.interceptions += stat.interceptions || 0;
            player.dribbles += stat.dribbles || 0;
            player.saves += stat.saves || 0;
            player.goals_against += stat.ga || 0;

            if ((stat.ga || 0) === 0 && player.position === 'GK') {
                player.clean_sheets! += 1;
            }
        }
    }

    const finalStats = Object.values(aggregatedStats).map(player => {
      player.pass_accuracy = player.passes_attempted > 0 ? parseFloat(((player.passes_completed / player.passes_attempted) * 100).toFixed(2)) : 0;
      const totalShotsFaced = (player.saves || 0) + (player.goals_against || 0);
      player.save_percentage = totalShotsFaced > 0 ? parseFloat(((player.saves || 0) / totalShotsFaced * 100).toFixed(2)) : 0;
      return player;
    });

    return NextResponse.json({ playerStats: finalStats });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
