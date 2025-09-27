// Updated standings calculator with proper soccer terminology

export interface TeamStanding {
  id: string
  name: string
  logo_url?: string
  wins: number
  losses: number
  draws: number
  points: number
  goals_scored: number
  goals_conceded: number
  matches_played: number
  goal_difference: number
  clean_sheets?: number
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
 * Client-side version for components that need to fetch standings directly
 * Updated to use proper soccer terminology
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

  // Get teams data
  const { data: teamsData, error: teamsError } = await supabase
    .from("clubs")
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

  // Get completed fixtures for the current season
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
    throw new Error(`Failed to load matches data: ${matchesError.message}`)
  }

  // Calculate standings for each team using soccer terminology
  const calculatedStandings: TeamStanding[] = teamsData.map((team: any) => {
    let wins = 0
    let losses = 0
    let draws = 0
    let goalsScored = 0
    let goalsConceded = 0
    let cleanSheets = 0

    // Calculate stats from matches
    matchesData.forEach((match: any) => {
      if (match.home_club_id === team.id) {
        goalsScored += match.home_score || 0
        goalsConceded += match.away_score || 0
        
        if (match.home_score > match.away_score) {
          wins++
        } else if (match.home_score < match.away_score) {
          losses++
        } else {
          draws++
        }
        
        // Clean sheet if no goals conceded
        if ((match.away_score || 0) === 0) {
          cleanSheets++
        }
      } else if (match.away_club_id === team.id) {
        goalsScored += match.away_score || 0
        goalsConceded += match.home_score || 0
        
        if (match.away_score > match.home_score) {
          wins++
        } else if (match.away_score < match.home_score) {
          losses++
        } else {
          draws++
        }
        
        // Clean sheet if no goals conceded
        if ((match.home_score || 0) === 0) {
          cleanSheets++
        }
      }
    })

    const matchesPlayed = wins + losses + draws
    const points = wins * 3 + draws * 1 // 3 points for win, 1 for draw, 0 for loss
    const goalDifference = goalsScored - goalsConceded

    return {
      id: team.id,
      name: team.name,
      logo_url: team.logo_url,
      wins,
      losses,
      draws,
      matches_played: matchesPlayed,
      points,
      goals_scored: goalsScored,
      goals_conceded: goalsConceded,
      goal_difference: goalDifference,
      clean_sheets: cleanSheets,
      conference: team.conferences?.name || "No Conference",
      conference_id: team.conference_id,
      conference_color: team.conferences?.color || "#6B7280",
      conferences: team.conferences
    }
  })

  // Sort by points (descending), then by goal difference (descending), then by goals scored (descending)
  calculatedStandings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
    return b.goals_scored - a.goals_scored
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

  // Sort teams within each conference by points, then goal difference, then goals scored
  Object.keys(standingsByConference).forEach(conferenceName => {
    standingsByConference[conferenceName].teams.sort((a: TeamStanding, b: TeamStanding) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
      return b.goals_scored - a.goals_scored
    })
  })

  return {
    standings: calculatedStandings,
    standingsByConference
  }
}

// Legacy function for backward compatibility - redirects to new function
export async function calculateUnifiedStandings(): Promise<{
  standings: TeamStanding[]
  standingsByConference: StandingsData
}> {
  throw new Error("This function is deprecated. Use calculateUnifiedStandingsClient instead.")
}
