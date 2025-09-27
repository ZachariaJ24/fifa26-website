import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get current active season
    const { data: seasonData, error: seasonError } = await supabase
      .from("seasons")
      .select("id, name")
      .eq("is_active", true)
      .single()

    if (seasonError) {
      return NextResponse.json({ error: "No active season found" }, { status: 404 })
    }

    // Get clubs with conference data
    const { data: teamsData, error: teamsError } = await supabase
      .from("clubs")
      .select(`
        id,
        name,
        logo_url,
        conference_id,
        division,
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

    if (teamsError) {
      return NextResponse.json({ error: teamsError.message }, { status: 500 })
    }

    // Get completed fixtures for the current season
    const { data: matchesData, error: matchesError } = await supabase
      .from("fixtures")
      .select(`
        id,
        home_club_id,
        away_club_id,
        home_score,
        away_score,
        status,
        overtime,
        has_overtime
      `)
      .eq("season_id", seasonData.id)
      .eq("status", "completed")

    if (matchesError) {
      return NextResponse.json({ error: matchesError.message }, { status: 500 })
    }

    // Calculate standings for each team
    const calculatedStandings = teamsData.map((team: any) => {
      let wins = 0
      let losses = 0
      let otl = 0
      let goalsFor = 0
      let goalsAgainst = 0

      // Calculate stats from fixtures
      matchesData.forEach((match: any) => {
        if (match.home_club_id === team.id) {
          goalsFor += match.home_score || 0
          goalsAgainst += match.away_score || 0
          
          if (match.home_score > match.away_score) {
            wins++
          } else if (match.home_score < match.away_score) {
            if (match.overtime || match.has_overtime) {
              otl++
            } else {
              losses++
            }
          } else {
            // Tie counts as loss if no overtime/shootout
            losses++
          }
        } else if (match.away_club_id === team.id) {
          goalsFor += match.away_score || 0
          goalsAgainst += match.home_score || 0
          
          if (match.away_score > match.home_score) {
            wins++
          } else if (match.away_score < match.home_score) {
            if (match.overtime || match.has_overtime) {
              otl++
            } else {
              losses++
            }
          } else {
            // Tie counts as loss if no overtime/shootout
            losses++
          }
        }
      })

      const gamesPlayed = wins + losses + otl
      const points = wins * 3 + otl * 1 // 3 points for win, 1 for OTL
      const goalDifferential = goalsFor - goalsAgainst

      return {
        id: team.id,
        name: team.name,
        logo_url: team.logo_url,
        wins,
        losses,
        otl,
        games_played: gamesPlayed,
        points,
        goals_for: goalsFor,
        goals_against: goalsAgainst,
        goal_differential: goalDifferential,
        division: team.division,
        conference: team.conferences?.name || "No Conference",
        conference_id: team.conference_id,
        conference_color: team.conferences?.color || "#6B7280",
        conferences: team.conferences
      }
    })

    // Sort by points (descending), then by wins (descending), then by goal differential (descending)
    calculatedStandings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.wins !== a.wins) return b.wins - a.wins
      return b.goal_differential - a.goal_differential
    })

    // Group teams by conference
    const standingsByConference = calculatedStandings.reduce((acc: any, team: any) => {
      const conference = team.conferences
      
      // Handle teams without conferences
      const conferenceName = conference ? conference.name : "No Conference"
      const conferenceData = conference || {
        id: "no-conference",
        name: "No Conference",
        color: "#6B7280",
        description: "Teams not assigned to any conference"
      }
      
      if (!acc[conferenceName]) {
        acc[conferenceName] = {
          conference: conferenceData,
          teams: []
        }
      }
      
      acc[conferenceName].teams.push(team)
      
      return acc
    }, {})

    // Sort teams within each conference by points, then wins, then goal differential
    Object.keys(standingsByConference).forEach(conferenceName => {
      standingsByConference[conferenceName].teams.sort((a: any, b: any) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.wins !== a.wins) return b.wins - a.wins
        return b.goal_differential - a.goal_differential
      })
    })

    return NextResponse.json({
      season: seasonData.name,
      standings: calculatedStandings,
      standingsByConference: Object.values(standingsByConference),
      totalTeams: calculatedStandings.length,
      completedMatches: matchesData.length
    })
  } catch (error: any) {
    console.error("Error fetching standings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}