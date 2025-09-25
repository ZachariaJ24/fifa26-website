"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useSupabase } from "@/lib/supabase/client"
import TeamStandings from "@/components/team-standings"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Medal, 
  Crown,
  Award,
  BarChart3,
  Users,
  Star,
  Zap,
  TargetIcon,
  Flame,
  ArrowUpDown
} from "lucide-react"
import type { TeamStanding } from "@/lib/standings-calculator"

interface StandingsPageProps {
  searchParams: { season?: string }
}

function DivisionStandings({ standings }: { standings: TeamStanding[] }) {
  // Group teams by division (Premier League style - 3 divisions)
  const divisions = new Map<string, { teams: TeamStanding[], name: string, color: string }>()
  
  standings.forEach(team => {
    const divisionKey = team.division || "Premier Division"
    if (!divisions.has(divisionKey)) {
      // Assign colors based on division
      let color = '#6366f1' // Default color
      if (divisionKey === "Premier Division") color = '#16a34a' // Field green
      else if (divisionKey === "Championship Division") color = '#f59e0b' // Stadium gold
      else if (divisionKey === "League One") color = '#f97316' // Goal orange
      
      divisions.set(divisionKey, {
        teams: [],
        name: divisionKey,
        color: color
      })
    }
    
    divisions.get(divisionKey)!.teams.push(team)
  })

  // Sort teams within each division
  const sortDivisionTeams = (teams: TeamStanding[]) => {
    return teams.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points
      if (a.wins !== b.wins) return b.wins - a.wins
      if (a.goal_differential !== b.goal_differential) return b.goal_differential - a.goal_differential
      return b.goals_for - a.goals_for
    })
  }

  // Get teams for each division
  const premierTeams = sortDivisionTeams(divisions.get("Premier Division")?.teams || [])
  const championshipTeams = sortDivisionTeams(divisions.get("Championship Division")?.teams || [])
  const leagueOneTeams = sortDivisionTeams(divisions.get("League One")?.teams || [])

  return (
    <div className="grid gap-8 grid-cols-1">
      {/* Premier Division */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="fifa-card fifa-card-hover h-full group border-2 border-field-green-200/50 dark:border-field-green-700/50 shadow-2xl shadow-field-green-500/20 overflow-hidden">
          <CardHeader className="pb-4 relative">
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-6 -mt-6 opacity-60 group-hover:opacity-80 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, #10b98120, #10b98140)`
              }}
            ></div>
            <CardTitle className="flex items-center gap-2 sm:gap-3 relative z-10">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, #10b981, #10b981dd)`,
                  boxShadow: `0 10px 25px #10b98140`
                }}
              >
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-pitch-blue-800 dark:text-pitch-blue-200">Premier Division</div>
                <div className="text-sm sm:text-lg text-pitch-blue-600 dark:text-pitch-blue-400">{premierTeams.length} clubs</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TeamStandings teams={premierTeams} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Championship Division */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="fifa-card fifa-card-hover h-full group border-2 border-stadium-gold-200/50 dark:border-stadium-gold-700/50 shadow-2xl shadow-stadium-gold-500/20 overflow-hidden">
          <CardHeader className="pb-4 relative">
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-6 -mt-6 opacity-60 group-hover:opacity-80 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, #f59e0b20, #f59e0b40)`
              }}
            ></div>
            <CardTitle className="flex items-center gap-2 sm:gap-3 relative z-10">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, #f59e0b, #f59e0bdd)`,
                  boxShadow: `0 10px 25px #f59e0b40`
                }}
              >
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-pitch-blue-800 dark:text-pitch-blue-200">Championship Division</div>
                <div className="text-sm sm:text-lg text-pitch-blue-600 dark:text-pitch-blue-400">{championshipTeams.length} clubs</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TeamStandings teams={championshipTeams} />
          </CardContent>
        </Card>
      </motion.div>

      {/* League One */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="fifa-card fifa-card-hover h-full group border-2 border-goal-orange-200/50 dark:border-goal-orange-700/50 shadow-2xl shadow-goal-orange-500/20 overflow-hidden">
          <CardHeader className="pb-4 relative">
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-6 -mt-6 opacity-60 group-hover:opacity-80 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, #ea580c20, #ea580c40)`
              }}
            ></div>
            <CardTitle className="flex items-center gap-2 sm:gap-3 relative z-10">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, #ea580c, #ea580cdd)`,
                  boxShadow: `0 10px 25px #ea580c40`
                }}
              >
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-pitch-blue-800 dark:text-pitch-blue-200">League One</div>
                <div className="text-sm sm:text-lg text-pitch-blue-600 dark:text-pitch-blue-400">{leagueOneTeams.length} clubs</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TeamStandings teams={leagueOneTeams} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function StandingsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-96" />
        ))}
      </div>
    </div>
  )
}

export default function StandingsPage({ searchParams }: StandingsPageProps) {
  const { supabase } = useSupabase()
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current season
        const { data: seasonData, error: seasonError } = await supabase
          .from("seasons")
          .select("id, name")
          .eq("is_active", true)
          .single()

        if (seasonError) {
          console.error("Error fetching season:", seasonError)
          setError("Failed to load season data")
          return
        }

        if (!seasonData) {
          setError("No active season found")
          return
        }

        // Calculate standings dynamically from matches (same logic as home page)
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select(`
            id,
            name,
            logo_url,
            division,
            conference_id,
            conferences (
              name
            )
          `)
          .eq("is_active", true)

        if (teamsError) {
          console.error("Error fetching teams:", teamsError)
          setError("Failed to load teams data")
          return
        }

        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select(`
            id,
            home_team_id,
            away_team_id,
            home_score,
            away_score,
            status
          `)
          .eq("season_id", seasonData.id)
          .eq("status", "completed")

        if (matchesError) {
          console.error("Error fetching matches:", matchesError)
          setError("Failed to load matches data")
          return
        }

        // Calculate standings for each team
        const calculatedStandings = teamsData.map((team) => {
          let wins = 0
          let losses = 0
          let otl = 0
          let goalsFor = 0
          let goalsAgainst = 0

          matchesData.forEach((match) => {
            if (match.home_team_id === team.id) {
              goalsFor += match.home_score || 0
              goalsAgainst += match.away_score || 0
              
              if (match.home_score > match.away_score) {
                wins++
              } else if (match.home_score < match.away_score) {
                losses++
              } else {
                otl++
              }
            } else if (match.away_team_id === team.id) {
              goalsFor += match.away_score || 0
              goalsAgainst += match.home_score || 0
              
              if (match.away_score > match.home_score) {
                wins++
              } else if (match.away_score < match.home_score) {
                losses++
              } else {
                otl++
              }
            }
          })

          const gamesPlayed = wins + losses + otl
          const points = wins * 2 + otl * 1 // 2 points for win, 1 for OTL
          const goalDifferential = goalsFor - goalsAgainst

          return {
            id: team.id,
            name: team.name,
            logo_url: team.logo_url,
            wins,
            losses,
            otl,
            games_played: gamesPlayed,
            points,
            goals_for: goalsFor,
            goals_against: goalsAgainst,
            goal_differential: goalDifferential,
            division: team.division || "Premier Division",
            conference: team.conferences?.name || "Unknown",
            conference_id: team.conference_id,
          }
        })

        // Sort by points (descending), then by wins (descending), then by goal differential (descending)
        calculatedStandings.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points
          if (b.wins !== a.wins) return b.wins - a.wins
          return b.goal_differential - a.goal_differential
        })

        setStandings(calculatedStandings)
      } catch (err) {
        console.error("Error in fetchStandings:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchStandings()
  }, [supabase])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <StandingsLoadingSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="fifa-card border-2 border-goal-orange-200/50 dark:border-goal-orange-700/50 shadow-2xl shadow-goal-orange-500/20">
          <CardHeader>
            <CardTitle className="text-goal-orange-600 dark:text-goal-orange-400">Error Loading Standings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-pitch-blue-600 dark:text-pitch-blue-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pitch-blue-50 via-field-green-50 to-stadium-gold-50 dark:from-pitch-blue-900 dark:via-field-green-900 dark:to-stadium-gold-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pitch-blue-600 via-field-green-600 to-stadium-gold-600 bg-clip-text text-transparent mb-4"
            >
              League Standings
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-pitch-blue-600 dark:text-pitch-blue-400 max-w-2xl mx-auto"
            >
              Follow your team's progress through the Premier League, Championship, and League One divisions
            </motion.p>
          </div>

          {/* Divisions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-6">
              <DivisionStandings standings={standings} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
