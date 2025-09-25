"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, TrendingDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface TeamStanding {
  id: string
  name: string
  division: string
  tier: number
  division_color: string
  wins: number
  losses: number
  otl: number
  points: number
  goals_for: number
  goals_against: number
  goal_differential: number
}

interface StandingsData {
  [division: string]: TeamStanding[]
}

export function ClientStandingsViewer() {
  const [standings, setStandings] = useState<StandingsData>({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchStandings()
  }, [])

  const fetchStandings = async () => {
    try {
      setLoading(true)
      
      // Use direct Supabase client instead of API route
      const { data, error } = await supabase
        .from("division_standings")
        .select("*")
        .order("tier")
        .order("points", { ascending: false })

      if (error) {
        throw error
      }

      // Group by division
      const standingsByDivision = data?.reduce((acc: any, team: any) => {
        if (!acc[team.division]) {
          acc[team.division] = []
        }
        acc[team.division].push(team)
        return acc
      }, {}) || {}

      setStandings(standingsByDivision)
    } catch (error: any) {
      console.error("Error fetching standings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch standings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPromotionRelegationStatus = (team: TeamStanding, position: number, totalTeams: number) => {
    if (position <= 2) {
      return { status: "promotion", icon: TrendingUp, color: "text-green-600" }
    } else if (position >= totalTeams - 1) {
      return { status: "relegation", icon: TrendingDown, color: "text-red-600" }
    }
    return { status: "safe", icon: null, color: "text-gray-600" }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>League Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(standings).map(([division, teams]) => (
        <Card key={division}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {division}
              <Badge variant="secondary">Tier {teams[0]?.tier || 1}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teams.map((team, index) => {
                const prStatus = getPromotionRelegationStatus(team, index + 1, teams.length)
                const PrIcon = prStatus.icon
                
                return (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    style={{ borderLeftColor: team.division_color, borderLeftWidth: "4px" }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg w-8 text-center">
                          {index + 1}
                        </span>
                        {PrIcon && (
                          <PrIcon className={`h-4 w-4 ${prStatus.color}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{team.wins}-{team.losses}-{team.otl}</span>
                          <span>{team.points} pts</span>
                          <span className={team.goal_differential >= 0 ? "text-green-600" : "text-red-600"}>
                            {team.goal_differential >= 0 ? "+" : ""}{team.goal_differential}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{team.points}</div>
                      <div className="text-sm text-gray-600">points</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
