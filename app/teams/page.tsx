"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { 
  Trophy, 
  Award, 
  Users, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Medal, 
  Star, 
  Zap, 
  Crown, 
  Flame, 
  Shield, 
  Rocket,
  BarChart3,
  Activity,
  Calendar,
  RefreshCw
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TeamLogo } from "@/components/team-logo"

// Maximum roster size constant
const MAX_ROSTER_SIZE = 15

interface Team {
  id: string
  name: string
  logo_url?: string
  wins: number
  losses: number
  otl: number
  points: number
  goals_for: number
  goals_against: number
  games_played: number
  player_count: number
  total_salary: number
  conference?: {
    id: string
    name: string
    color: string
    description: string
  }
  awards?: any[]
}

export default function TeamsPage() {
  const { toast } = useToast()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [conferenceFilter, setConferenceFilter] = useState<string>("all")

  useEffect(() => {
    async function fetchTeams() {
      try {
        setLoading(true)

        // Use the new unified teams API
        const response = await fetch('/api/teams')
        if (!response.ok) {
          throw new Error('Failed to fetch teams')
        }
        
        const teamsData = await response.json()
        setTeams(teamsData)
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

    fetchTeams()
  }, [toast])

  // Filter teams based on search query and conference
  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesConference = conferenceFilter === "all" || 
      (conferenceFilter === "no-conference" && !team.conference) ||
      (team.conference && team.conference.name === conferenceFilter)
    
    return matchesSearch && matchesConference
  })

  // Get unique conferences for filter
  const conferences = Array.from(new Set(teams.map(team => team.conference?.name).filter(Boolean)))

  // Calculate league statistics for the header
  const totalTeams = teams.length
  const totalPlayers = teams.reduce((sum, team) => sum + (team.player_count || 0), 0)
  const totalSalary = teams.reduce((sum, team) => sum + (team.total_salary || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-blue-50 via-slate-50 to-rink-blue-50 dark:from-hockey-silver-900 dark:via-hockey-silver-800 dark:to-rink-blue-900/30">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-xl shadow-lg">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-field-green-600 to-pitch-blue-700 dark:from-field-green-400 dark:to-pitch-blue-500 bg-clip-text text-transparent">
                  Elite Club Directory
                </h1>
                <div className="mt-2">
                   <Badge className="bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 text-white px-4 py-2 text-lg font-semibold">
                     FIFA 26 League Season 1
                   </Badge>
                </div>
              </div>
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full mx-auto mb-8" />
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Discover the powerhouse clubs competing in the most competitive FIFA 26 league. Each club brings unique talent, strategy, and determination to the pitch.
            </p>
          </div>
        </div>
      </div>

      {/* League Statistics */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg w-fit mx-auto mb-4">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">
                {totalTeams}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total Clubs
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">
                {totalPlayers}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total Players
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 rounded-lg w-fit mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">
                ${totalSalary.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total Salary
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Search and Filter Section */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-field-green-50 to-pitch-blue-50 dark:from-field-green-900/30 dark:to-pitch-blue-900/30 border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="text-lg sm:text-xl text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-lg">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                Club Directory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  <Input
                    placeholder="Search clubs by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 sm:pl-12 pr-4 sm:pr-6 py-2 sm:py-3 text-base sm:text-lg border-slate-300 dark:border-slate-600 focus:border-field-green-500 dark:focus:border-field-green-500 focus:ring-2 focus:ring-field-green-500/20 transition-all duration-300"
                  />
                </div>

                {/* Conference Filter */}
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={conferenceFilter === "all" ? "default" : "outline"}
                    className="cursor-pointer hover:bg-field-green-100 dark:hover:bg-field-green-900/30"
                    onClick={() => setConferenceFilter("all")}
                  >
                    All Conferences ({teams.length})
                  </Badge>
                  {conferences.map(conference => (
                    <Badge 
                      key={conference}
                      variant={conferenceFilter === conference ? "default" : "outline"}
                      className="cursor-pointer hover:bg-field-green-100 dark:hover:bg-field-green-900/30"
                      onClick={() => setConferenceFilter(conference)}
                    >
                      {conference} ({teams.filter(t => t.conference?.name === conference).length})
                    </Badge>
                  ))}
                  <Badge 
                    variant={conferenceFilter === "no-conference" ? "default" : "outline"}
                    className="cursor-pointer hover:bg-field-green-100 dark:hover:bg-field-green-900/30"
                    onClick={() => setConferenceFilter("no-conference")}
                  >
                    No Conference ({teams.filter(t => !t.conference).length})
                  </Badge>
                </div>

                {/* Results Count */}
                {(searchQuery || conferenceFilter !== "all") && (
                  <div className="text-center">
                    <span className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                      Found <span className="font-semibold text-field-green-600 dark:text-field-green-400">{filteredTeams.length}</span> club{filteredTeams.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Teams Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-80 sm:h-96 w-full rounded-xl bg-gradient-to-br from-slate-100 to-ice-blue-100 dark:from-slate-800 dark:to-ice-blue-900/20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredTeams.map((team, index) => (
                <Link key={team.id} href={`/teams/${team.id}`}>
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full overflow-hidden">
                    <CardContent className="p-0">
                      {/* Club Logo Section */}
                      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-field-green-50 to-pitch-blue-50 dark:from-field-green-900/30 dark:to-pitch-blue-900/30 flex items-center justify-center p-4 sm:p-6">
                        {/* Logo Container */}
                        <div className="relative h-20 w-20 sm:h-24 sm:w-24 group-hover:scale-110 transition-transform duration-300">
                          {team.logo_url ? (
                            <Image
                              src={team.logo_url || "/placeholder.svg"}
                              alt={team.name}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            />
                          ) : (
                            <TeamLogo teamName={team.name} size="xl" />
                          )}
                        </div>
                        
                        {/* Conference Badge */}
                        {team.conference && (
                          <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                            <div 
                              className="text-white p-2 rounded-full shadow-lg text-xs font-semibold"
                              style={{ backgroundColor: team.conference.color }}
                            >
                              {team.conference.name.split(' ')[0]}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Club Info Section */}
                      <div className="p-4 sm:p-6">
                        {/* Club Name */}
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 text-center mb-3 sm:mb-4">
                          {team.name}
                        </h3>
                        
                        {/* Conference */}
                        {team.conference && (
                          <div className="flex justify-center mb-3 sm:mb-4">
                            <Badge 
                              className="text-white text-sm"
                              style={{ backgroundColor: team.conference.color }}
                            >
                              {team.conference.name}
                            </Badge>
                          </div>
                        )}
                        
                        {/* Record */}
                        <div className="flex justify-center mb-3 sm:mb-4">
                          <Badge className="bg-gradient-to-r from-field-green-100 to-pitch-blue-100 text-field-green-800 border-field-green-300 dark:from-field-green-900/30 dark:to-pitch-blue-900/30 dark:text-field-green-200 dark:border-field-green-600 text-sm sm:text-base">
                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {team.wins}-{team.losses}-{team.otl}
                          </Badge>
                        </div>

                        {/* Club Statistics */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
                              {team.points}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              Points
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">
                              {team.games_played}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              Games
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 mt-3 sm:mt-4">
                          <Users className="h-3 w-3 mr-2" />
                          <span className="font-medium">{team.player_count || 0}/{MAX_ROSTER_SIZE}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              
              {filteredTeams.length === 0 && (
                <div className="col-span-full text-center py-12 sm:py-20">
                  <div className="max-w-md mx-auto px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-slate-200 to-field-green-200 dark:from-slate-700 dark:to-field-green-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <Search className="h-8 w-8 sm:h-10 sm:w-10 text-slate-500 dark:text-slate-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">
                      No clubs found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-500 text-base sm:text-lg mb-4 sm:mb-6">
                      Try adjusting your search terms or browse all available clubs.
                    </p>
                    <button 
                      onClick={() => {
                        setSearchQuery("")
                        setConferenceFilter("all")
                      }}
                      className="inline-flex items-center gap-2 text-field-green-600 dark:text-field-green-400 hover:text-field-green-700 dark:hover:text-field-green-300 font-medium transition-colors duration-200 text-sm sm:text-base"
                    >
                      <Shield className="h-4 w-4" />
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}