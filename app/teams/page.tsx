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
              Team Directory
            </h1>
            <p className="text-xl md:text-2xl text-emerald-700 mb-8 max-w-3xl mx-auto">
              Explore the clubs competing in the world's most prestigious virtual football league.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid gap-6 md:grid-cols-3 mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 text-center">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg inline-block mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-emerald-800 mb-2">{totalTeams}</div>
              <div className="text-sm text-emerald-600 font-medium">Total Teams</div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm border border-teal-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 text-center">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg inline-block mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-teal-800 mb-2">{totalPlayers}</div>
              <div className="text-sm text-teal-600 font-medium">Total Players</div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm border border-cyan-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 text-center">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg inline-block mb-4">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-cyan-800 mb-2">${(totalSalary / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-cyan-600 font-medium">Total Salary</div>
            </div>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-lg mb-8"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Directory
            </h2>
            <Input 
              placeholder="Search teams by name..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500" 
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-lg p-6">
                <Skeleton className="h-48 w-full rounded-xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredTeams.map((team, index) => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="h-full"
                >
                  <div className="h-full bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-6">
                      <TeamLogo teamName={team.name} logoUrl={team.logo_url} size="xl" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-center mb-4 text-emerald-800">{team.name}</h3>
                      <div className="flex justify-center mb-4">
                        <Badge className="text-base bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          {team.wins}-{team.draws}-{team.losses}
                        </Badge>
                      </div>
                      {team.awards.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                          {team.awards.slice(0, 3).map((award: any) => (
                            <Badge key={award.id} variant="secondary" className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200">
                              <Crown className="h-3 w-3 text-yellow-600" />
                              {award.award_type}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-emerald-700">{team.points}</div>
                          <div className="text-xs text-emerald-600">Points</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-teal-700">${(team.total_salary / 1000000).toFixed(1)}M</div>
                          <div className="text-xs text-teal-600">Salary</div>
                        </div>
                      </div>
                      <div className="text-center text-sm text-emerald-600 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg px-3 py-2 mt-4 border border-emerald-200">
                        <Users className="h-4 w-4 inline-block mr-2" />
                        {team.player_count || 0}/{MAX_ROSTER_SIZE}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
            {filteredTeams.length === 0 && (
              <div className="col-span-full text-center py-20">
                <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-lg p-12">
                  <Search className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
                  <h3 className="text-xl font-bold text-emerald-800 mb-2">No teams found</h3>
                  <p className="text-emerald-600">Try adjusting your search terms.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
