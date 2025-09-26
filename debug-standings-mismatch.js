// Debug script to identify standings mismatch
// Run this in browser console to see the differences

async function debugStandingsMismatch() {
  console.log("🔍 Debugging Standings Mismatch...")
  
  try {
    // Get Supabase client
    const supabase = window.supabase || createClient()
    
    // 1. Get current season
    const { data: seasonData, error: seasonError } = await supabase
      .from("seasons")
      .select("id, name, season_number")
      .eq("is_active", true)
      .single()
    
    if (seasonError) {
      console.error("❌ Season error:", seasonError)
      return
    }
    
    console.log("📅 Current Season:", seasonData)
    
    // 2. Get teams with stored stats
    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
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
        conference_id,
        conferences(name, color)
      `)
      .eq("is_active", true)
      .order("points", { ascending: false })
    
    if (teamsError) {
      console.error("❌ Teams error:", teamsError)
      return
    }
    
    console.log("🏆 Teams with stored stats:", teamsData)
    
    // 3. Get matches for current season
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select(`
        id,
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        status,
        season_id
      `)
      .eq("season_id", seasonData.id)
      .eq("status", "completed")
    
    if (matchesError) {
      console.error("❌ Matches error:", matchesError)
      return
    }
    
    console.log("⚽ Completed matches:", matchesData)
    
    // 4. Calculate standings from matches (unified calculator logic)
    const calculatedStandings = teamsData.map((team) => {
      let wins = 0
      let losses = 0
      let otl = 0
      let goalsFor = 0
      let goalsAgainst = 0
      
      matchesData.forEach((match) => {
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
      const points = wins * 3 + otl * 1
      const goalDifferential = goalsFor - goalsAgainst
      
      return {
        id: team.id,
        name: team.name,
        calculated: {
          wins,
          losses,
          otl,
          games_played: gamesPlayed,
          points,
          goals_for: goalsFor,
          goals_against: goalsAgainst,
          goal_differential: goalDifferential
        },
        stored: {
          wins: team.wins,
          losses: team.losses,
          otl: team.otl,
          games_played: team.games_played,
          points: team.points,
          goals_for: team.goals_for,
          goals_against: team.goals_against,
          goal_differential: (team.goals_for || 0) - (team.goals_against || 0)
        }
      }
    })
    
    // 5. Compare calculated vs stored
    console.log("📊 Comparison (Calculated vs Stored):")
    calculatedStandings.forEach(team => {
      const mismatches = []
      
      if (team.calculated.wins !== team.stored.wins) mismatches.push(`Wins: ${team.calculated.wins} vs ${team.stored.wins}`)
      if (team.calculated.losses !== team.stored.losses) mismatches.push(`Losses: ${team.calculated.losses} vs ${team.stored.losses}`)
      if (team.calculated.otl !== team.stored.otl) mismatches.push(`OTL: ${team.calculated.otl} vs ${team.stored.otl}`)
      if (team.calculated.points !== team.stored.points) mismatches.push(`Points: ${team.calculated.points} vs ${team.stored.points}`)
      if (team.calculated.goals_for !== team.stored.goals_for) mismatches.push(`GF: ${team.calculated.goals_for} vs ${team.stored.goals_for}`)
      if (team.calculated.goals_against !== team.stored.goals_against) mismatches.push(`GA: ${team.calculated.goals_against} vs ${team.stored.goals_against}`)
      
      if (mismatches.length > 0) {
        console.log(`❌ ${team.name}:`, mismatches.join(", "))
      } else {
        console.log(`✅ ${team.name}: Match`)
      }
    })
    
    // 6. Show summary
    const totalMismatches = calculatedStandings.filter(team => 
      team.calculated.wins !== team.stored.wins ||
      team.calculated.losses !== team.stored.losses ||
      team.calculated.otl !== team.stored.otl ||
      team.calculated.points !== team.stored.points
    ).length
    
    console.log(`\n📈 Summary:`)
    console.log(`- Total teams: ${teamsData.length}`)
    console.log(`- Teams with mismatches: ${totalMismatches}`)
    console.log(`- Completed matches: ${matchesData.length}`)
    console.log(`- Current season: ${seasonData.name} (${seasonData.id})`)
    
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.debugStandingsMismatch = debugStandingsMismatch
}

console.log("Standings debug script loaded. Run debugStandingsMismatch() in console to debug.")
