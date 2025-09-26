"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, TrendingDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase/client"

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
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { supabase } = useSupabase()

  useEffect(() => {
    fetchStandings()
  }, [supabase])

  const fetchStandings = async () => {
    try {
      setLoading(true)
      setError(null)
      
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
          conferences!inner(
            id,
            name,
            color,
            description
          )
        `)
        .eq("is_active", true)
        .order("points", { ascending: false })

      if (error) {
        throw error
      }

      if (!teams || teams.length === 0) {
        setStandings({})
        return
      }

      // Group teams by conference
      const standingsByConference = teams.reduce((acc: any, team: any) => {
        const conference = team.conferences
        if (!conference) return acc // Skip teams without conferences
        
        const conferenceName = conference.name
        if (!acc[conferenceName]) {
          acc[conferenceName] = {
            conference: {
              id: conference.id,
              name: conference.name,
              color: conference.color,
              description: conference.description
            },
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
      }, {})

      // Sort teams within each conference by points, then wins, then goal differential
      Object.keys(standingsByConference).forEach(conferenceName => {
        standingsByConference[conferenceName].teams.sort((a: any, b: any) => {
          if (b.points !== a.points) return b.points - a.points
          if (b.wins !== a.wins) return b.wins - a.wins
          return b.goal_differential - a.goal_differential
        })
      })

      setStandings(standingsByConference)
    } catch (error: any) {
      console.error("Error fetching standings:", error)
      setError(error.message || "Failed to fetch standings")
      toast({
        title: "Error",
        description: error.message || "Failed to fetch standings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPromotionRelegationStatus = useMemo(() => {
    return (team: TeamStanding, position: number, totalTeams: number) => {
      if (position <= 2) {
        return { status: "promotion", icon: TrendingUp, color: "text-green-600" }
      } else if (position >= totalTeams - 1) {
        return { status: "relegation", icon: TrendingDown, color: "text-red-600" }
      }
      return { status: "safe", icon: null, color: "text-gray-600" }
    }
  }, [])

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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>League Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={fetchStandings} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (Object.keys(standings).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>League Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No standings data available</p>
            <Button onClick={fetchStandings} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {Object.entries(standings).map(([conferenceName, conferenceData]) => (
        <div key={conferenceName} className="space-y-4">
          {/* Conference Header */}
          <div 
            className="relative overflow-hidden rounded-2xl p-6 text-white shadow-xl"
            style={{ 
              background: `linear-gradient(135deg, ${conferenceData.conference.color} 0%, ${conferenceData.conference.color}CC 100%)`
            }}
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{conferenceName}</h2>
                    <p className="text-white/80 text-lg">Conference Standings</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{conferenceData.teams.length}</div>
                  <div className="text-white/80">Teams</div>
                </div>
              </div>
            </div>
          </div>

          {/* Teams Table */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GP</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">W</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">L</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">OTL</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GF</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GA</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GD</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {conferenceData.teams.map((team, index) => {
                      const prStatus = getPromotionRelegationStatus(team, index + 1, conferenceData.teams.length)
                      const PrIcon = prStatus.icon
                      
                      return (
                        <tr 
                          key={team.id} 
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                            index < 2 ? 'bg-green-50 dark:bg-green-900/20' : 
                            index >= conferenceData.teams.length - 2 ? 'bg-red-50 dark:bg-red-900/20' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">{index + 1}</span>
                              {PrIcon && (
                                <PrIcon className={`h-4 w-4 ${prStatus.color}`} />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {team.logo_url && (
                                <img src={team.logo_url} alt={team.name} className="h-10 w-10 rounded-full object-cover" />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{team.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {prStatus.status === 'promotion' && 'Promotion Zone'}
                                  {prStatus.status === 'relegation' && 'Relegation Zone'}
                                  {prStatus.status === 'safe' && 'Safe Zone'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                            {team.games_played}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                            {team.wins}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                            {team.losses}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                            {team.otl}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                            {team.goals_for}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                            {team.goals_against}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <span className={team.goal_differential >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                              {team.goal_differential >= 0 ? "+" : ""}{team.goal_differential}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{team.points}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
