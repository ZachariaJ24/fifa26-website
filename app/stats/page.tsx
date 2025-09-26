// Midnight Studios INTl - All rights reserved
"use client"

import React, { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface PlayerStat {
  user_id: string;
  goals: number;
  assists: number;
  matches_played: number;
  users: {
    username: string;
  };
}

interface TeamStat {
  team_id: string;
  wins: number;
  losses: number;
  draws: number;
  goals_for: number;
  goals_against: number;
  teams: {
    name: string;
    logo_url: string;
  };
}

export default function StatsPage() {
  const { supabase } = useSupabase()
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([])
  const [teamStats, setTeamStats] = useState<TeamStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: playerData, error: playerError } = await supabase
          .from("player_stats")
          .select("*, users(username)")
          .order("goals", { ascending: false })

        if (playerError) throw playerError
        setPlayerStats(playerData || [])

        const { data: teamData, error: teamError } = await supabase
          .from("team_stats")
          .select("*, teams(name, logo_url)")
          .order("wins", { ascending: false })

        if (teamError) throw teamError
        setTeamStats(teamData || [])
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">League Statistics</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">Explore detailed player and team statistics.</p>
        </div>

        <Tabs defaultValue="player">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="player">Player Stats</TabsTrigger>
            <TabsTrigger value="team">Team Stats</TabsTrigger>
          </TabsList>
          <TabsContent value="player" className="mt-8">
            {loading ? (
              <Skeleton className="h-96 w-full rounded-lg" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Goals</TableHead>
                    <TableHead>Assists</TableHead>
                    <TableHead>Matches Played</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerStats.map((player) => (
                    <TableRow key={player.user_id}>
                      <TableCell>{player.users.username}</TableCell>
                      <TableCell>{player.goals}</TableCell>
                      <TableCell>{player.assists}</TableCell>
                      <TableCell>{player.matches_played}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          <TabsContent value="team" className="mt-8">
            {loading ? (
              <Skeleton className="h-96 w-full rounded-lg" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Wins</TableHead>
                    <TableHead>Losses</TableHead>
                    <TableHead>Draws</TableHead>
                    <TableHead>Goals For</TableHead>
                    <TableHead>Goals Against</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamStats.map((team) => (
                    <TableRow key={team.team_id}>
                      <TableCell>{team.teams.name}</TableCell>
                      <TableCell>{team.wins}</TableCell>
                      <TableCell>{team.losses}</TableCell>
                      <TableCell>{team.draws}</TableCell>
                      <TableCell>{team.goals_for}</TableCell>
                      <TableCell>{team.goals_against}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
