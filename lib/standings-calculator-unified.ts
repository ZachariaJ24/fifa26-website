import { createClient } from "@/lib/supabase/server"

export interface TeamStanding {
  id: string
  name: string
  logo_url?: string
  wins: number
  losses: number
  otl: number
  points: number
  goals_for: number
  goals_against: number
  games_played: number
  goal_differential: number
  conference?: string
  conference_id?: string
  conference_color?: string
  conferences?: {
    id: string
    name: string
    color: string
    description?: string
  }
}

export interface ConferenceStandings {
  conference: {
    id: string
    name: string
    color: string
    description?: string
  }
  teams: TeamStanding[]
}

export interface StandingsData {
  [conferenceName: string]: ConferenceStandings
}

/**
 * Unified standings calculation function that all components should use
 * This ensures consistent standings across the entire site
 */
export async function calculateUnifiedStandings(): Promise<{
  standings: TeamStanding[]
  standingsByConference: StandingsData
}> {
  const supabase = createClient()

  // Get current season
  const { data: seasonData, error: seasonError } = await supabase
    .from("seasons")
    .select("id, name")
    .eq("is_active", true)
    .single()

  if (seasonError) {
    throw new Error(`Failed to load season data: ${seasonError.message}`)
  }

  if (!seasonData) {
    throw new Error("No active season found")
  }

  // Get teams with conference data
  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      logo_url,
      conference_id,
      conferences(
        id,
        name,
        color,
        description
      )
    `)
    .eq("is_active", true)

  if (teamsError) {
    throw new Error(`Failed to load teams data: ${teamsError.message}`)
  }

  // Get completed matches for the current season
  const { data: matchesData, error: matchesError } = await supabase
    .from("matches")
    .select(`
      id,
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      status
    `)
    .eq("season_id", seasonData.id)
    .eq("status", "completed")

  if (matchesError) {
    throw new Error(`Failed to load matches data: ${matchesError.message}`)
  }

  // Calculate standings for each team
  const calculatedStandings: TeamStanding[] = teamsData.map((team: any) => {
    let wins = 0
    let losses = 0
    let otl = 0
    let goalsFor = 0
    let goalsAgainst = 0

    // Calculate stats from matches
    matchesData.forEach((match: any) => {
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
  const standingsByConference: StandingsData = calculatedStandings.reduce((acc: any, team: TeamStanding) => {
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
    standingsByConference[conferenceName].teams.sort((a: TeamStanding, b: TeamStanding) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.wins !== a.wins) return b.wins - a.wins
      return b.goal_differential - a.goal_differential
    })
  })

  return {
    standings: calculatedStandings,
    standingsByConference
  }
}

/**
 * Client-side version for components that need to fetch standings directly
 */
export async function calculateUnifiedStandingsClient(supabase: any): Promise<{
  standings: TeamStanding[]
  standingsByConference: StandingsData
}> {
  // Get current season
  const { data: seasonData, error: seasonError } = await supabase
    .from("seasons")
    .select("id, name")
    .eq("is_active", true)
    .single()

  if (seasonError) {
    throw new Error(`Failed to load season data: ${seasonError.message}`)
  }

  if (!seasonData) {
    throw new Error("No active season found")
  }

  // Get teams with conference data
  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      logo_url,
      conference_id,
      conferences(
        id,
        name,
        color,
        description
      )
    `)
    .eq("is_active", true)

  if (teamsError) {
    throw new Error(`Failed to load teams data: ${teamsError.message}`)
  }

  // Get completed matches for the current season
  const { data: matchesData, error: matchesError } = await supabase
    .from("matches")
    .select(`
      id,
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      status
    `)
    .eq("season_id", seasonData.id)
    .eq("status", "completed")

  if (matchesError) {
    throw new Error(`Failed to load matches data: ${matchesError.message}`)
  }

  // Calculate standings for each team
  const calculatedStandings: TeamStanding[] = teamsData.map((team: any) => {
    let wins = 0
    let losses = 0
    let otl = 0
    let goalsFor = 0
    let goalsAgainst = 0

    // Calculate stats from matches
    matchesData.forEach((match: any) => {
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
  const standingsByConference: StandingsData = calculatedStandings.reduce((acc: any, team: TeamStanding) => {
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
    standingsByConference[conferenceName].teams.sort((a: TeamStanding, b: TeamStanding) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.wins !== a.wins) return b.wins - a.wins
      return b.goal_differential - a.goal_differential
    })
  })

  return {
    standings: calculatedStandings,
    standingsByConference
  }
}
