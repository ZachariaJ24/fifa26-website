// Midnight Studios INTl - All rights reserved
"use client"

import React, { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { Trophy, Target, Users, TrendingUp, Award, BarChart3 } from "lucide-react"

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              League Statistics
            </h1>
            <p className="text-xl md:text-2xl text-emerald-700 mb-8 max-w-3xl mx-auto">
              Explore detailed player and team statistics from our competitive league.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="player" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl p-2">
            <TabsTrigger 
              value="player" 
              className="py-3 rounded-lg text-lg font-semibold text-emerald-700 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Users className="h-5 w-5 mr-2" />
              Player Stats
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="py-3 rounded-lg text-lg font-semibold text-emerald-700 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Trophy className="h-5 w-5 mr-2" />
              Team Stats
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="player" className="mt-8">
            {loading ? (
              <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-lg p-6">
                <Skeleton className="h-96 w-full rounded-xl bg-emerald-100" />
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Target className="h-6 w-6" />
                    Player Statistics
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50/50">
                        <TableHead className="text-emerald-800 font-semibold">Player</TableHead>
                        <TableHead className="text-emerald-800 font-semibold">Goals</TableHead>
                        <TableHead className="text-emerald-800 font-semibold">Assists</TableHead>
                        <TableHead className="text-emerald-800 font-semibold">Matches Played</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {playerStats.map((player, index) => (
                        <motion.tr
                          key={player.user_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="hover:bg-emerald-50/50 transition-colors"
                        >
                          <TableCell className="font-medium text-emerald-800">{player.users.username}</TableCell>
                          <TableCell className="text-emerald-700 font-semibold">{player.goals}</TableCell>
                          <TableCell className="text-teal-700 font-semibold">{player.assists}</TableCell>
                          <TableCell className="text-cyan-700 font-semibold">{player.matches_played}</TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="team" className="mt-8">
            {loading ? (
              <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-lg p-6">
                <Skeleton className="h-96 w-full rounded-xl bg-emerald-100" />
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Trophy className="h-6 w-6" />
                    Team Statistics
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-teal-50/50">
                        <TableHead className="text-teal-800 font-semibold">Team</TableHead>
                        <TableHead className="text-teal-800 font-semibold">Wins</TableHead>
                        <TableHead className="text-teal-800 font-semibold">Losses</TableHead>
                        <TableHead className="text-teal-800 font-semibold">Draws</TableHead>
                        <TableHead className="text-teal-800 font-semibold">Goals For</TableHead>
                        <TableHead className="text-teal-800 font-semibold">Goals Against</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamStats.map((team, index) => (
                        <motion.tr
                          key={team.team_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="hover:bg-teal-50/50 transition-colors"
                        >
                          <TableCell className="font-medium text-teal-800">{team.teams.name}</TableCell>
                          <TableCell className="text-emerald-700 font-semibold">{team.wins}</TableCell>
                          <TableCell className="text-red-600 font-semibold">{team.losses}</TableCell>
                          <TableCell className="text-orange-600 font-semibold">{team.draws}</TableCell>
                          <TableCell className="text-teal-700 font-semibold">{team.goals_for}</TableCell>
                          <TableCell className="text-cyan-700 font-semibold">{team.goals_against}</TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
