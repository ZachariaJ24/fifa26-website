// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Award, Star } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/30 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent tracking-tight">Awards</h1>
        </div>

        <Tabs defaultValue="team-awards">
          <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto bg-gray-800/50 border border-gray-700 p-1 rounded-lg mb-8">
            <TabsTrigger value="team-awards">Team Awards</TabsTrigger>
            <TabsTrigger value="player-awards">Player Awards</TabsTrigger>
          </TabsList>

          <TabsContent value="team-awards">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(teamAwardsByType).map(([awardType, awards]) => (
                  <div key={awardType}>
                    <h3 className="text-xl font-bold mb-4 text-white">{awardType}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {awards.map((award) => (
                        <motion.div
                          key={award.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ y: -4, scale: 1.02 }}
                        >
                          <Link href={`/teams/${award.team_id}`}>
                            <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm overflow-hidden shadow-2xl shadow-blue-500/10 h-full">
                              <CardContent className="p-6">
                                <div className="flex flex-col items-center">
                                  <div className="relative h-24 w-24 mb-4">
                                    {award.team_logo ? (
                                      <Image
                                        src={award.team_logo || "/placeholder.svg"}
                                        alt={award.team_name}
                                        fill
                                        className="object-contain rounded-lg"
                                      />
                                    ) : (
                                      <div className="w-24 h-24 bg-gray-700 flex items-center justify-center text-xl font-bold text-white rounded-lg">
                                        {award.team_name.substring(0, 2)}
                                      </div>
                                    )}
                                  </div>
                                  <h3 className="text-lg font-semibold mb-2 text-white text-center">{award.team_name}</h3>
                                  <div className="text-sm text-gray-400 mb-3 text-center">Season {award.season_number} • {award.year}</div>
                                  {award.description && (
                                    <p className="text-sm text-gray-400 text-center">{award.description}</p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="player-awards">
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-64 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(playerAwardsByType).map(([awardType, awards]) => (
                        <div key={awardType}>
                            <h3 className="text-xl font-bold mb-4 text-white">{awardType}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {awards.map((award) => (
                                    <motion.div
                                        key={award.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        whileHover={{ y: -4, scale: 1.02 }}
                                    >
                                        <Link href={`/players/${award.player_id}`}>
                                            <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm overflow-hidden shadow-2xl shadow-blue-500/10 h-full">
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col items-center">
                                                        <div className="text-2xl font-bold text-white">{award.gamer_tag_id}</div>
                                                        <div className="text-sm text-gray-400 mb-2">{award.team_name && `${award.team_name} • `}Season {award.season_number} • {award.year}</div>
                                                        {award.description && (
                                                            <p className="text-sm text-gray-400 text-center">{award.description}</p>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
