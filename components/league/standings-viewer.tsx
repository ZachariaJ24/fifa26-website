"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, TrendingDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TeamStanding {
  id: string
  name: string
  conference_id?: string
  logo_url?: string
  wins: number
  losses: number
  otl: number
  points: number
  goals_for: number
  goals_against: number
  games_played: number
  goal_differential: number
  conferences?: {
    name: string
    color: string
  }
}

interface ConferenceStandings {
  conference: {
    name: string
    color: string
  }
  teams: TeamStanding[]
}

interface StandingsData {
  [conferenceName: string]: ConferenceStandings
}

export function StandingsViewer() {
  const [standings, setStandings] = useState<StandingsData>({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchStandings()
  }, [])

  const fetchStandings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/league/standings")
      
      if (!response.ok) {
        throw new Error("Failed to fetch standings")
      }

      const data = await response.json()
      setStandings(data)
    } catch (error) {
      console.error("Error fetching standings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch standings",
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
      {Object.entries(standings).map(([conferenceName, conferenceData]) => (
        <Card key={conferenceName}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {conferenceName}
              <Badge 
                variant="secondary"
                style={{ backgroundColor: conferenceData.conference.color + '20', color: conferenceData.conference.color }}
              >
                {conferenceData.teams.length} Teams
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conferenceData.teams.map((team, index) => {
                const prStatus = getPromotionRelegationStatus(team, index + 1, conferenceData.teams.length)
                const PrIcon = prStatus.icon
                
                return (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                    style={{ borderLeftColor: conferenceData.conference.color, borderLeftWidth: "4px" }}
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
                      <div className="flex items-center gap-3">
                        {team.logo_url && (
                          <img src={team.logo_url} alt={team.name} className="h-8 w-8 rounded-full" />
                        )}
                        <div>
                          <h3 className="font-semibold">{team.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{team.wins}-{team.losses}-{team.otl}</span>
                            <span>{team.points} pts</span>
                            <span className={team.goal_differential >= 0 ? "text-green-600" : "text-red-600"}>
                              {team.goal_differential >= 0 ? "+" : ""}{team.goal_differential}
                            </span>
                            <span>{team.games_played} GP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">{team.points}</div>
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