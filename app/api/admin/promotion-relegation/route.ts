import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "Admin")
      .single()

    if (roleError || !userRole) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 })
    }

    const { seasonId } = await request.json()

    if (!seasonId) {
      return NextResponse.json({ error: "Season ID is required" }, { status: 400 })
    }

    // Get current season if not provided
    let currentSeasonId = seasonId
    if (!seasonId) {
      const { data: season, error: seasonError } = await supabase
        .from("seasons")
        .select("id")
        .eq("is_current", true)
        .single()

      if (seasonError || !season) {
        return NextResponse.json({ error: "No current season found" }, { status: 404 })
      }
      currentSeasonId = season.id
    }

    // Get all teams with their current standings
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select(`
        id,
        name,
        division,
        logo_url
      `)
      .eq("is_active", true)

    if (teamsError) {
      console.error("Error fetching teams:", teamsError)
      return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
    }

    // Get all completed matches for the season
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select(`
        id,
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        status
      `)
      .eq("season_id", currentSeasonId)
      .eq("status", "completed")

    if (matchesError) {
      console.error("Error fetching matches:", matchesError)
      return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 })
    }

    // Calculate standings for each team
    const teamStandings = teams.map(team => {
      let wins = 0
      let losses = 0
      let otl = 0
      let goalsFor = 0
      let goalsAgainst = 0

      matches.forEach(match => {
        if (match.home_team_id === team.id) {
          goalsFor += match.home_score || 0
          goalsAgainst += match.away_score || 0

          if (match.home_score > match.away_score) {
            wins++
          } else if (match.home_score < match.away_score) {
            losses++
          } else {
            otl++
          }
        } else if (match.away_team_id === team.id) {
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
      const points = wins * 2 + otl * 1
      const goalDifferential = goalsFor - goalsAgainst

      return {
        ...team,
        wins,
        losses,
        otl,
        games_played: gamesPlayed,
        points,
        goals_for: goalsFor,
        goals_against: goalsAgainst,
        goal_differential: goalDifferential
      }
    })

    // Group teams by division and sort by standings
    const divisionStandings: Record<string, any[]> = {}
    teamStandings.forEach(team => {
      const division = team.division || "Unassigned"
      if (!divisionStandings[division]) {
        divisionStandings[division] = []
      }
      divisionStandings[division].push(team)
    })

    // Sort each division by points, then wins, then goal differential
    Object.keys(divisionStandings).forEach(division => {
      divisionStandings[division].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.wins !== a.wins) return b.wins - a.wins
        return b.goal_differential - a.goal_differential
      })
    })

    // Determine promotions and relegations based on calculated standings
    const promotions: any[] = []
    const relegations: any[] = []

    // Premier Division: Bottom 2 relegated to Championship
    const premierTeams = divisionStandings["Premier Division"] || []
    if (premierTeams.length >= 2) {
      const relegatedFromPremier = premierTeams.slice(-2)
      relegatedFromPremier.forEach(team => {
        relegations.push({
          team,
          from: "Premier Division",
          to: "Championship Division",
          reason: "Bottom 2 in Premier Division"
        })
      })
    }

    // Championship Division: Top 2 promoted to Premier, Bottom 2 relegated to League One
    const championshipTeams = divisionStandings["Championship Division"] || []
    if (championshipTeams.length >= 2) {
      const promotedFromChampionship = championshipTeams.slice(0, 2)
      promotedFromChampionship.forEach(team => {
        promotions.push({
          team,
          from: "Championship Division",
          to: "Premier Division",
          reason: "Top 2 in Championship Division"
        })
      })

      if (championshipTeams.length >= 4) {
        const relegatedFromChampionship = championshipTeams.slice(-2)
        relegatedFromChampionship.forEach(team => {
          relegations.push({
            team,
            from: "Championship Division",
            to: "League One",
            reason: "Bottom 2 in Championship Division"
          })
        })
      }
    }

    // League One: Top 2 promoted to Championship
    const leagueOneTeams = divisionStandings["League One"] || []
    if (leagueOneTeams.length >= 2) {
      const promotedFromLeagueOne = leagueOneTeams.slice(0, 2)
      promotedFromLeagueOne.forEach(team => {
        promotions.push({
          team,
          from: "League One",
          to: "Championship Division",
          reason: "Top 2 in League One"
        })
      })
    }

    // Apply the changes to the database
    const changes: any[] = []

    // Process promotions
    for (const promotion of promotions) {
      const { error: updateError } = await supabase
        .from("teams")
        .update({ division: promotion.to })
        .eq("id", promotion.team.id)

      if (updateError) {
        console.error(`Error promoting team ${promotion.team.name}:`, updateError)
        continue
      }

      changes.push({
        type: "promotion",
        team: promotion.team.name,
        from: promotion.from,
        to: promotion.to,
        reason: promotion.reason
      })
    }

    // Process relegations
    for (const relegation of relegations) {
      const { error: updateError } = await supabase
        .from("teams")
        .update({ division: relegation.to })
        .eq("id", relegation.team.id)

      if (updateError) {
        console.error(`Error relegating team ${relegation.team.name}:`, updateError)
        continue
      }

      changes.push({
        type: "relegation",
        team: relegation.team.name,
        from: relegation.from,
        to: relegation.to,
        reason: relegation.reason
      })
    }

    // Log the promotion/relegation event
    const { error: logError } = await supabase
      .from("system_settings")
      .upsert({
        key: "last_promotion_relegation",
        value: JSON.stringify({
          season_id: currentSeasonId,
          changes,
          timestamp: new Date().toISOString()
        }),
        description: "Last promotion/relegation changes"
      })

    if (logError) {
      console.error("Error logging promotion/relegation:", logError)
    }

    return NextResponse.json({
      success: true,
      changes,
      promotions: promotions.length,
      relegations: relegations.length,
      message: `Processed ${promotions.length} promotions and ${relegations.length} relegations`
    })
  } catch (error: any) {
    console.error("Error in /api/admin/promotion-relegation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "Admin")
      .single()

    if (roleError || !userRole) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 })
    }

    // Get the last promotion/relegation data
    const { data: lastPromotionRelegation, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "last_promotion_relegation")
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching last promotion/relegation:", error)
      return NextResponse.json({ error: "Failed to fetch promotion/relegation data" }, { status: 500 })
    }

    const data = lastPromotionRelegation?.value ? JSON.parse(lastPromotionRelegation.value) : null

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error in /api/admin/promotion-relegation GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
