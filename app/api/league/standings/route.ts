import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    const { data: teams, error } = await supabase
      .from("teams")
      .select(`
        id,
        name,
        logo_url,
        conference_id,
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group teams by conference
    const standingsByConference = teams?.reduce((acc: any, team: any) => {
      const conferenceName = team.conferences?.name || "No Conference"
      if (!acc[conferenceName]) {
        acc[conferenceName] = {
          conference: team.conferences || { name: conferenceName, color: "#6B7280" },
          teams: []
        }
      }
      
      // Calculate goal differential
      const goalDifferential = (team.goals_for || 0) - (team.goals_against || 0)
      
      acc[conferenceName].teams.push({
        ...team,
        goal_differential: goalDifferential
      })
      
      return acc
    }, {}) || {}

    // Sort teams within each conference by points, then wins, then goal differential
    Object.keys(standingsByConference).forEach(conferenceName => {
      standingsByConference[conferenceName].teams.sort((a: any, b: any) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.wins !== a.wins) return b.wins - a.wins
        return b.goal_differential - a.goal_differential
      })
    })

    return NextResponse.json(standingsByConference)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
