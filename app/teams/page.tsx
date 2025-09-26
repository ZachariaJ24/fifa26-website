// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Trophy, Award, Users, Search, TrendingUp, DollarSign, Shield, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TeamLogo } from "@/components/team-logo"
import { useSupabase } from "@/lib/supabase/client"

const MAX_ROSTER_SIZE = 23

export default function TeamsPage() {
  const { toast } = useToast()
  const { supabase } = useSupabase()
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchTeamsData() {
      try {
        setLoading(true)

        // 1. Fetch standings data
        const standingsRes = await fetch("/api/standings")
        if (!standingsRes.ok) throw new Error("Failed to fetch standings")
        const { standings } = await standingsRes.json()

        // 2. Fetch team awards
        const awardsRes = await fetch("/api/teams/awards")
        if (!awardsRes.ok) throw new Error("Failed to fetch awards")
        const { awards } = await awardsRes.json()

        const awardsByTeam: Record<string, any[]> = {}
        awards?.forEach((award: any) => {
          if (!awardsByTeam[award.team_id]) {
            awardsByTeam[award.team_id] = []
          }
          awardsByTeam[award.team_id].push(award)
        })

        // 3. Fetch player data for counts and salaries
        const { data: players, error: playerError } = await supabase.from("players").select("team_id, salary")
        if (playerError) throw playerError

        const playerDataByTeam: Record<string, { count: number; salary: number }> = {}
        players?.forEach((player: any) => {
          if (!player.team_id) return
          if (!playerDataByTeam[player.team_id]) {
            playerDataByTeam[player.team_id] = { count: 0, salary: 0 }
          }
          playerDataByTeam[player.team_id].count++
          playerDataByTeam[player.team_id].salary += player.salary || 0
        })

        // 4. Combine all data
        const combinedTeamData = standings.map((team: any) => ({
          ...team,
          awards: awardsByTeam[team.id] || [],
          player_count: playerDataByTeam[team.id]?.count || 0,
          total_salary: playerDataByTeam[team.id]?.salary || 0,
        }))

        setTeams(combinedTeamData)
      } catch (error: any) {
        toast({
          title: "Error loading teams",
          description: error.message || "Failed to load teams data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTeamsData()
  }, [supabase, toast])

  const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const totalTeams = teams.length
  const totalPlayers = teams.reduce((sum, team) => sum + (team.player_count || 0), 0)
  const totalSalary = teams.reduce((sum, team) => sum + (team.total_salary || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-500 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">Team Directory</h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">Explore the clubs competing in the world's most prestigious virtual football league.</p>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg"><CardContent className="p-6 text-center"><Trophy className="h-8 w-8 text-blue-500 mx-auto mb-2" /><div className="text-3xl font-bold">{totalTeams}</div><div className="text-sm text-muted-foreground">Total Teams</div></CardContent></Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg"><CardContent className="p-6 text-center"><Users className="h-8 w-8 text-green-500 mx-auto mb-2" /><div className="text-3xl font-bold">{totalPlayers}</div><div className="text-sm text-muted-foreground">Total Players</div></CardContent></Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg"><CardContent className="p-6 text-center"><DollarSign className="h-8 w-8 text-yellow-500 mx-auto mb-2" /><div className="text-3xl font-bold">${(totalSalary / 1000000).toFixed(1)}M</div><div className="text-sm text-muted-foreground">Total Salary</div></CardContent></Card>
        </div>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg mb-8">
          <CardHeader><CardTitle className="flex items-center gap-2"><Search /> Search Directory</CardTitle></CardHeader>
          <CardContent>
            <Input placeholder="Search teams by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full" />
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredTeams.map((team) => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <motion.div whileHover={{ scale: 1.05 }} className="h-full">
                  <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 flex items-center justify-center p-6">
                        <TeamLogo teamName={team.name} logoUrl={team.logo_url} size="xl" />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-center mb-4">{team.name}</h3>
                        <div className="flex justify-center mb-4"><Badge className="text-base"><TrendingUp className="h-4 w-4 mr-2" />{team.wins}-{team.draws}-{team.losses}</Badge></div>
                        {team.awards.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-2 mb-4">
                            {team.awards.slice(0, 3).map((award: any) => (
                              <Badge key={award.id} variant="secondary" className="flex items-center gap-1"><Crown className="h-3 w-3 text-yellow-500" />{award.award_type}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div><div className="text-2xl font-bold">{team.points}</div><div className="text-xs text-muted-foreground">Points</div></div>
                          <div><div className="text-lg font-bold">${(team.total_salary / 1000000).toFixed(1)}M</div><div className="text-xs text-muted-foreground">Salary</div></div>
                        </div>
                        <div className="text-center text-sm text-muted-foreground bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 mt-4"><Users className="h-4 w-4 inline-block mr-2" />{team.player_count || 0}/{MAX_ROSTER_SIZE}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
            {filteredTeams.length === 0 && (
              <div className="col-span-full text-center py-20">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold">No teams found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
