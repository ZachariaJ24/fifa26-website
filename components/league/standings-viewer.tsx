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

      // Use the new unified standings API
      const response = await fetch('/api/standings')
      if (!response.ok) {
        throw new Error('Failed to fetch standings')
      }
      
      const data = await response.json()
      const standingsByConference = data.standingsByConference

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
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchStandings}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
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
          <p className="text-gray-600">No standings data available</p>
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
                        <tr key={team.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{index + 1}</span>
                              {PrIcon && (
                                <PrIcon className={`h-4 w-4 ${prStatus.color}`} />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {team.logo_url ? (
                                <img 
                                  src={team.logo_url} 
                                  alt={team.name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-xs font-bold text-gray-600">
                                    {team.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                  {team.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                            {team.games_played}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                            {team.wins}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                            {team.losses}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                            {team.otl}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                            {team.goals_for}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                            {team.goals_against}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <span className={team.goal_differential >= 0 ? "text-green-600" : "text-red-600"}>
                              {team.goal_differential >= 0 ? "+" : ""}{team.goal_differential}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {team.points}
                              </span>
                              {prStatus.status === "promotion" && (
                                <Badge variant="default" className="bg-green-600 text-white text-xs">
                                  P
                                </Badge>
                              )}
                              {prStatus.status === "relegation" && (
                                <Badge variant="destructive" className="bg-red-600 text-white text-xs">
                                  R
                                </Badge>
                              )}
                            </div>
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