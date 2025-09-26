// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Award, Star, Crown, Medal, Zap } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

interface TeamAward {
  id: string
  team_id: string
  team_name: string
  team_logo: string | null
  award_type: string
  season_number: number
  year: number
  description: string | null
}

interface PlayerAward {
  id: string
  player_id: string
  gamer_tag_id: string
  team_id: string | null
  team_name: string | null
  team_logo: string | null
  award_type: string
  season_number: number
  year: number
  description: string | null
}

interface Season {
  id: string | number
  name: string
  number?: number
}

export default function AwardsPage() {
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [teamAwards, setTeamAwards] = useState<TeamAward[]>([])
  const [playerAwards, setPlayerAwards] = useState<PlayerAward[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")

  const availableYears = [...new Set([...teamAwards, ...playerAwards].map((award) => award.year))].sort((a, b) => b - a)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await fetch('/api/awards');
        if (!response.ok) throw new Error('Failed to fetch awards');
        const data = await response.json();

        setTeamAwards(data.teamAwards || [])
        setPlayerAwards(data.playerAwards || [])
        setSeasons(data.seasons || [])

      } catch (error: any) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error loading awards",
          description: error.message || "Failed to load awards data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  // Filter awards based on selected season and year
  const filteredTeamAwards = teamAwards.filter((award) => {
    const seasonMatch = selectedSeason === "all" || award.season_number === Number.parseInt(selectedSeason)
    const yearMatch = selectedYear === "all" || award.year === Number.parseInt(selectedYear)
    return seasonMatch && yearMatch
  })

  const filteredPlayerAwards = playerAwards.filter((award) => {
    const seasonMatch = selectedSeason === "all" || award.season_number === Number.parseInt(selectedSeason)
    const yearMatch = selectedYear === "all" || award.year === Number.parseInt(selectedYear)
    return seasonMatch && yearMatch
  })

  // Group team awards by type
  const teamAwardsByType = filteredTeamAwards.reduce(
    (acc, award) => {
      if (!acc[award.award_type]) {
        acc[award.award_type] = []
      }
      acc[award.award_type].push(award)
      return acc
    },
    {} as Record<string, TeamAward[]>,
  )

  // Group player awards by type
  const playerAwardsByType = filteredPlayerAwards.reduce(
    (acc, award) => {
      if (!acc[award.award_type]) {
        acc[award.award_type] = []
      }
      acc[award.award_type].push(award)
      return acc
    },
    {} as Record<string, PlayerAward[]>,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900 fifa-scrollbar">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-field-green-600/20 via-pitch-blue-600/20 to-stadium-gold-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="fifa-title-enhanced mb-6">
              Awards Hall of Fame
            </h1>
            <p className="text-xl md:text-2xl text-field-green-700 dark:text-field-green-300 mb-8 max-w-3xl mx-auto">
              Celebrating excellence and achievement in our competitive league.
            </p>
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 fifa-card-hover-enhanced px-4 py-2">
                <Trophy className="h-5 w-5 text-field-green-600 dark:text-field-green-400" />
                <span className="text-field-green-800 dark:text-field-green-200 font-semibold">Team Awards</span>
              </div>
              <div className="flex items-center gap-2 fifa-card-hover-enhanced px-4 py-2">
                <Star className="h-5 w-5 text-pitch-blue-600 dark:text-pitch-blue-400" />
                <span className="text-pitch-blue-800 dark:text-pitch-blue-200 font-semibold">Player Awards</span>
              </div>
            </div>
            <div className="fifa-section-divider"></div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="team-awards" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto fifa-tabs-list mb-8">
            <TabsTrigger 
              value="team-awards" 
              className="fifa-tab-trigger py-3 rounded-lg text-lg font-semibold"
            >
              <Trophy className="h-5 w-5 mr-2" />
              Team Awards
            </TabsTrigger>
            <TabsTrigger 
              value="player-awards" 
              className="fifa-tab-trigger py-3 rounded-lg text-lg font-semibold"
            >
              <Star className="h-5 w-5 mr-2" />
              Player Awards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team-awards">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="fifa-card-hover-enhanced p-6">
                    <Skeleton className="h-48 w-full rounded-xl bg-field-green-100 dark:bg-field-green-800" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(teamAwardsByType).map(([awardType, awards], typeIndex) => (
                  <motion.div
                    key={awardType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: typeIndex * 0.1 }}
                  >
                    <div className="fifa-card-hover-enhanced p-6 mb-6">
                      <h3 className="text-2xl font-bold text-field-green-800 dark:text-field-green-200 mb-2 flex items-center gap-2">
                        <Crown className="h-6 w-6 text-stadium-gold-600 dark:text-stadium-gold-400" />
                        {awardType}
                      </h3>
                      <div className="fifa-section-divider"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {awards.map((award, index) => (
                        <motion.div
                          key={award.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ y: -4, scale: 1.02 }}
                        >
                          <Link href={`/teams/${award.team_id}`}>
                            <div className="fifa-card-hover-enhanced overflow-hidden h-full">
                              <div className="p-6">
                                <div className="flex flex-col items-center">
                                  <div className="relative h-24 w-24 mb-4">
                                    {award.team_logo ? (
                                      <Image
                                        src={award.team_logo || "/placeholder.svg"}
                                        alt={award.team_name}
                                        fill
                                        className="object-contain rounded-xl"
                                      />
                                    ) : (
                                      <div className="w-24 h-24 bg-gradient-to-br from-field-green-500 to-pitch-blue-500 flex items-center justify-center text-xl font-bold text-white rounded-xl">
                                        {award.team_name.substring(0, 2)}
                                      </div>
                                    )}
                                  </div>
                                  <h3 className="text-lg font-bold mb-2 text-field-green-800 dark:text-field-green-200 text-center">{award.team_name}</h3>
                                  <div className="text-sm text-field-green-600 dark:text-field-green-400 mb-3 text-center font-medium">Season {award.season_number} • {award.year}</div>
                                  {award.description && (
                                    <p className="text-sm text-field-green-700 dark:text-field-green-300 text-center">{award.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="player-awards">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="fifa-card-hover-enhanced p-6">
                    <Skeleton className="h-48 w-full rounded-xl bg-field-green-100 dark:bg-field-green-800" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(playerAwardsByType).map(([awardType, awards], typeIndex) => (
                  <motion.div
                    key={awardType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: typeIndex * 0.1 }}
                  >
                    <div className="fifa-card-hover-enhanced p-6 mb-6">
                      <h3 className="text-2xl font-bold text-field-green-800 dark:text-field-green-200 mb-2 flex items-center gap-2">
                        <Medal className="h-6 w-6 text-stadium-gold-600 dark:text-stadium-gold-400" />
                        {awardType}
                      </h3>
                      <div className="fifa-section-divider"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {awards.map((award, index) => (
                        <motion.div
                          key={award.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ y: -4, scale: 1.02 }}
                        >
                          <Link href={`/players/${award.player_id}`}>
                            <div className="fifa-card-hover-enhanced overflow-hidden h-full">
                              <div className="p-6">
                                <div className="flex flex-col items-center">
                                  <div className="w-24 h-24 bg-gradient-to-br from-pitch-blue-500 to-stadium-gold-500 flex items-center justify-center text-xl font-bold text-white rounded-xl mb-4">
                                    <Zap className="h-8 w-8" />
                                  </div>
                                  <div className="text-xl font-bold text-field-green-800 dark:text-field-green-200 mb-2">{award.gamer_tag_id}</div>
                                  <div className="text-sm text-field-green-600 dark:text-field-green-400 mb-2 text-center font-medium">
                                    {award.team_name && `${award.team_name} • `}Season {award.season_number} • {award.year}
                                  </div>
                                  {award.description && (
                                    <p className="text-sm text-field-green-700 dark:text-field-green-300 text-center">{award.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
