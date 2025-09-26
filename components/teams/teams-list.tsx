"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useSupabase } from "@/lib/supabase/client"
import { Users, Trophy, Target, TrendingUp } from "lucide-react"

interface Team {
  id: string
  name: string
  logo_url?: string
  conference_id?: string
  division: string
  wins: number
  losses: number
  otl: number
  points: number
  goals_for: number
  goals_against: number
  games_played: number
  conferences?: {
    id: string
    name: string
    color: string
    description: string
  }
}

interface TeamsListProps {
  conference?: string
  limit?: number
}

export function TeamsList({ conference, limit }: TeamsListProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { supabase } = useSupabase()

  useEffect(() => {
    fetchTeams()
  }, [conference, limit])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/teams')
      if (!response.ok) {
        throw new Error('Failed to fetch teams')
      }

      let teamsData: Team[] = await response.json()

      // Filter by conference if specified
      if (conference) {
        teamsData = teamsData.filter(team => 
          team.conferences?.name === conference
        )
      }

      // Apply limit if specified
      if (limit) {
        teamsData = teamsData.slice(0, limit)
      }

      setTeams(teamsData)
    } catch (error: any) {
      console.error("Error fetching teams:", error)
      setError(error.message || "Failed to fetch teams")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: limit || 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (teams.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">No teams found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <Card key={team.id} className="fifa-card fifa-card-hover">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              {team.logo_url ? (
                <img 
                  src={team.logo_url} 
                  alt={team.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-600">
                    {team.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline"
                    style={{ 
                      borderColor: team.conferences?.color || '#6B7280',
                      color: team.conferences?.color || '#6B7280'
                    }}
                  >
                    {team.conferences?.name || "No Conference"}
                  </Badge>
                  <Badge variant="secondary">{team.division}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Wins</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">{team.wins}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Points</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{team.points}</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Games: {team.games_played}</span>
                <span>GF: {team.goals_for}</span>
                <span>GA: {team.goals_against}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
