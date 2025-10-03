"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, MapPin, Users, Clock } from "lucide-react"

interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  home_score: number
  away_score: number
  status: string
  match_date: string
  venue?: string
  attendance?: number
  referee?: string
  overtime: boolean
  has_overtime: boolean
  has_shootout: boolean
  home_team: {
    id: string
    name: string
    logo_url?: string
    conferences?: {
      id: string
      name: string
      color: string
    }
  }
  away_team: {
    id: string
    name: string
    logo_url?: string
    conferences?: {
      id: string
      name: string
      color: string
    }
  }
  seasons: {
    id: string
    name: string
    season_number: number
  }
}

interface MatchesListProps {
  status?: string
  conference?: string
  limit?: number
}

export function MatchesList({ status, conference, limit }: MatchesListProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMatches()
  }, [status, conference, limit])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (conference) params.append('conference', conference)
      if (limit) params.append('limit', limit.toString())

      const response = await fetch(`/api/matches?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }

      const matchesData: Match[] = await response.json()
      setMatches(matchesData)
    } catch (error: any) {
      console.error("Error fetching matches:", error)
      setError(error.message || "Failed to fetch matches")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-field-green-100 text-field-green-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: limit || 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
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

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-field-green-600">No matches found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card key={match.id} className="fifa-card fifa-card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {/* Teams */}
              <div className="flex items-center gap-4 flex-1">
                {/* Home Team */}
                <div className="flex items-center gap-3">
                  {match.home_team.logo_url ? (
                    <img 
                      src={match.home_team.logo_url} 
                      alt={match.home_team.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-field-green-300 flex items-center justify-center">
                      <span className="text-sm font-bold text-field-green-600">
                        {match.home_team.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{match.home_team.name}</div>
                    {match.home_team.conferences && (
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          borderColor: match.home_team.conferences.color,
                          color: match.home_team.conferences.color
                        }}
                      >
                        {match.home_team.conferences.name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-center px-4">
                  <div className="text-2xl font-bold">
                    {match.status === 'completed' ? (
                      `${match.home_score} - ${match.away_score}`
                    ) : (
                      'vs'
                    )}
                  </div>
                  {match.overtime && (
                    <Badge variant="secondary" className="text-xs">OT</Badge>
                  )}
                  {match.has_shootout && (
                    <Badge variant="secondary" className="text-xs">SO</Badge>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold">{match.away_team.name}</div>
                    {match.away_team.conferences && (
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          borderColor: match.away_team.conferences.color,
                          color: match.away_team.conferences.color
                        }}
                      >
                        {match.away_team.conferences.name}
                      </Badge>
                    )}
                  </div>
                  {match.away_team.logo_url ? (
                    <img 
                      src={match.away_team.logo_url} 
                      alt={match.away_team.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-field-green-300 flex items-center justify-center">
                      <span className="text-sm font-bold text-field-green-600">
                        {match.away_team.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Match Info */}
              <div className="flex flex-col items-end gap-2">
                <Badge className={getStatusColor(match.status)}>
                  {match.status}
                </Badge>
                {match.match_date && (
                  <div className="flex items-center gap-1 text-sm text-field-green-600">
                    <Calendar className="h-4 w-4" />
                    {formatDate(match.match_date)}
                  </div>
                )}
                {match.venue && (
                  <div className="flex items-center gap-1 text-sm text-field-green-600">
                    <MapPin className="h-4 w-4" />
                    {match.venue}
                  </div>
                )}
                {match.attendance && (
                  <div className="flex items-center gap-1 text-sm text-field-green-600">
                    <Users className="h-4 w-4" />
                    {match.attendance.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
