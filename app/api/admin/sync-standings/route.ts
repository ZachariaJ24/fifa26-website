import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = createAdminClient()

    // Get current active season
    const { data: seasonData, error: seasonError } = await supabase
      .from("seasons")
      .select("id, name")
      .eq("is_active", true)
      .single()

    if (seasonError) {
      return NextResponse.json({ error: `Failed to get season: ${seasonError.message}` }, { status: 500 })
    }

    if (!seasonData) {
      return NextResponse.json({ error: "No active season found" }, { status: 404 })
    }

    // Get all active teams
    const { data: teamsData, error: teamsError } = await supabase
      .from("clubs")
      .select("id, name")
      .eq("is_active", true)

    if (teamsError) {
      return NextResponse.json({ error: `Failed to get teams: ${teamsError.message}` }, { status: 500 })
    }

    // Get completed matches for current season
    const { data: matchesData, error: matchesError } = await supabase
      .from("fixtures")
      .select(`
        id,
        home_club_id,
        away_club_id,
        home_score,
        away_score,
        status
      `)
      .eq("season_id", seasonData.id)
      .eq("status", "completed")

    if (matchesError) {
      return NextResponse.json({ error: `Failed to get matches: ${matchesError.message}` }, { status: 500 })
    }

    console.log(`Syncing standings for ${teamsData.length} teams with ${matchesData.length} completed matches`)

    // Calculate and update stats for each team
    const updateResults = []
    
    for (const team of teamsData) {
      let wins = 0
      let losses = 0
      let otl = 0
      let goalsFor = 0
      let goalsAgainst = 0

      // Calculate stats from matches
      matchesData.forEach((match) => {
        if (match.home_club_id === team.id) {
          goalsFor += match.home_score || 0
          goalsAgainst += match.away_score || 0
          
          if (match.home_score > match.away_score) {
            wins++
          } else if (match.home_score < match.away_score) {
            losses++
          } else {
            otl++
          }
        } else if (match.away_club_id === team.id) {
          goalsFor += match.away_score || 0
          goalsAgainst += match.home_score || 0
          
          if (match.away_score > match.home_score) {
            wins++
          } else if (match.away_score < match.home_score) {
            losses++
          } else {
            otl++
          }
        }
      })

      const gamesPlayed = wins + losses + otl
      const points = wins * 3 + otl * 1 // 3 points for win, 1 for OTL

      // Update team stats in database
      const { error: updateError } = await supabase
        .from("clubs")
        .update({
          wins,
          losses,
          otl,
          points,
          goals_for: goalsFor,
          goals_against: goalsAgainst,
          games_played: gamesPlayed,
          updated_at: new Date().toISOString()
        })
        .eq("id", team.id)

      if (updateError) {
        console.error(`Error updating team ${team.name}:`, updateError)
        updateResults.push({
          team: team.name,
          success: false,
          error: updateError.message
        })
      } else {
        updateResults.push({
          team: team.name,
          success: true,
          stats: { wins, losses, otl, points, goalsFor, goalsAgainst, gamesPlayed }
        })
      }
    }

    const successCount = updateResults.filter(r => r.success).length
    const failureCount = updateResults.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Standings sync completed. Updated ${successCount} teams successfully.`,
      season: seasonData.name,
      teamsUpdated: successCount,
      teamsFailed: failureCount,
      totalMatches: matchesData.length,
      results: updateResults
    })

  } catch (error: any) {
    console.error("Error syncing standings:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Get current active season
    const { data: seasonData, error: seasonError } = await supabase
      .from("seasons")
      .select("id, name")
      .eq("is_active", true)
      .single()

    if (seasonError) {
      return NextResponse.json({ error: `Failed to get season: ${seasonError.message}` }, { status: 500 })
    }

    // Get teams with current stats
    const { data: teamsData, error: teamsError } = await supabase
      .from("clubs")
      .select(`
        id,
        name,
        wins,
        losses,
        otl,
        points,
        goals_for,
        goals_against,
        games_played,
        conferences(name, color)
      `)
      .eq("is_active", true)
      .order("points", { ascending: false })

    if (teamsError) {
      return NextResponse.json({ error: `Failed to get teams: ${teamsError.message}` }, { status: 500 })
    }

    // Get completed matches count
    const { data: matchesData, error: matchesError } = await supabase
      .from("fixtures")
      .select("id")
      .eq("season_id", seasonData.id)
      .eq("status", "completed")

    if (matchesError) {
      return NextResponse.json({ error: `Failed to get matches: ${matchesError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      season: seasonData.name,
      totalTeams: teamsData.length,
      completedMatches: matchesData.length,
      standings: teamsData
    })

  } catch (error: any) {
    console.error("Error getting standings status:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 })
  }
}
