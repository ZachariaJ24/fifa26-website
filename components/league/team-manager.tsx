"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, Trophy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Team {
  id: string
  name: string
  conference_id?: string
  logo_url?: string
  is_active: boolean
  wins: number
  losses: number
  otl: number
  points: number
  goals_for: number
  goals_against: number
  games_played: number
  conferences?: {
    name: string
    color: string
  }
}

interface Conference {
  id: string
  name: string
  color: string
}

export function TeamManager() {
  const [teams, setTeams] = useState<Team[]>([])
  const [conferences, setConferences] = useState<Conference[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [teamsResponse, conferencesResponse] = await Promise.all([
        fetch("/api/league/teams"),
        fetch("/api/league/conferences")
      ])

      if (!teamsResponse.ok || !conferencesResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const [teamsData, conferencesData] = await Promise.all([
        teamsResponse.json(),
        conferencesResponse.json()
      ])

      setTeams(teamsData)
      setConferences(conferencesData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConferenceChange = async (teamId: string, conferenceId: string) => {
    try {
      setSaving(true)
      const response = await fetch("/api/league/teams", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamId, conferenceId }),
      })

      if (!response.ok) {
        throw new Error("Failed to update team")
      }

      // Update local state
      setTeams(teams.map(team => 
        team.id === teamId ? { ...team, conference_id: conferenceId } : team
      ))

      toast({
        title: "Success",
        description: "Team conference updated successfully",
      })
    } catch (error) {
      console.error("Error updating team:", error)
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTeams.map((team) => (
            <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                {team.logo_url && (
                  <img src={team.logo_url} alt={team.name} className="h-12 w-12 rounded-full" />
                )}
                <div>
                  <h3 className="font-semibold">{team.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {team.points} pts
                    </span>
                    <span>{team.wins}-{team.losses}-{team.otl}</span>
                    <span>+{team.goals_for - team.goals_against}</span>
                    <span>{team.games_played} GP</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`conference-${team.id}`}>Conference:</Label>
                  <Select
                    value={team.conference_id || ""}
                    onValueChange={(value) => handleConferenceChange(team.id, value)}
                    disabled={saving}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select conference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Conference</SelectItem>
                      {conferences.map((conference) => (
                        <SelectItem key={conference.id} value={conference.id}>
                          {conference.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Badge variant={team.is_active ? "default" : "secondary"}>
                  {team.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
