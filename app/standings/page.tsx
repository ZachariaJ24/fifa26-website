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

interface StandingsPageProps {
  searchParams: { season?: string }
}

interface TeamStanding {
  id: string
  name: string
  logo_url?: string
  wins: number
  losses: number
  otl: number
  games_played: number
  points: number
  goals_for: number
  goals_against: number
  goal_differential: number
  division?: string
  conference?: string
  conference_id?: string
  conference_color?: string
}

function ConferenceStandings({ standings }: { standings: TeamStanding[] }) {
  // Group teams by conference
  const conferences = new Map<string, { teams: TeamStanding[], name: string, color: string }>()
  
  standings.forEach(team => {
    const conferenceKey = team.conference || "No Conference"
    if (!conferences.has(conferenceKey)) {
      // Use conference color or default
      const color = team.conference_color || '#6366f1'
      
      conferences.set(conferenceKey, {
        teams: [],
        name: conferenceKey,
        color: color
      })
    }
    
    conferences.get(conferenceKey)!.teams.push(team)
  })

  // Sort teams within each conference
  const sortConferenceTeams = (teams: TeamStanding[]) => {
    return teams.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points
      if (a.wins !== b.wins) return b.wins - a.wins
      if (a.goal_differential !== b.goal_differential) return b.goal_differential - a.goal_differential
      return b.goals_for - a.goals_for
    })
  }

  // Get all conferences
  const conferenceEntries = Array.from(conferences.entries())

  return (
    <div className="grid gap-8 grid-cols-1">
      {conferenceEntries.map(([conferenceName, conferenceData], index) => {
        const sortedTeams = sortConferenceTeams(conferenceData.teams)
        const conferenceColor = conferenceData.color
        
        return (
          <motion.div
            key={conferenceName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="fifa-card fifa-card-hover h-full group border-2 overflow-hidden" 
                  style={{ 
                    borderColor: `${conferenceColor}50`,
                    boxShadow: `0 25px 50px ${conferenceColor}20`
                  }}>
              <CardHeader className="pb-4 relative">
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-6 -mt-6 opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${conferenceColor}20, ${conferenceColor}40)`
                  }}
                ></div>
                <CardTitle className="flex items-center gap-2 sm:gap-3 relative z-10">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${conferenceColor}, ${conferenceColor}dd)`,
                      boxShadow: `0 10px 25px ${conferenceColor}40`
                    }}
                  >
                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-pitch-blue-800 dark:text-pitch-blue-200">{conferenceName}</div>
                    <div className="text-sm sm:text-lg text-pitch-blue-600 dark:text-pitch-blue-400">{sortedTeams.length} clubs</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TeamStandings teams={sortedTeams} />
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
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

        // Use the new unified standings API
        const response = await fetch('/api/standings')
        if (!response.ok) {
          throw new Error('Failed to fetch standings')
        }
        
        const data = await response.json()
        setStandings(data.standings)
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
              Follow your team's progress through the league conferences
            </motion.p>
          </div>

          {/* Conferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-6">
              <ConferenceStandings standings={standings} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}