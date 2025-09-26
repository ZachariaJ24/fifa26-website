"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createCustomClient } from "@/lib/supabase/custom-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy } from "lucide-react"
import { motion } from "framer-motion"
import TeamStandings from "@/components/team-standings"
import { useToast } from "@/components/ui/use-toast"
import { TeamStanding, StandingsData } from "@/lib/standings-calculator-unified"

interface StandingsPageProps {
  searchParams: { season?: string }
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

export default function StandingsPage({ searchParams }: StandingsPageProps) {
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createCustomClient()
  const { toast } = useToast()
  const searchParamsHook = useSearchParams()
  const seasonParam = searchParamsHook.get("season")

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        console.log("=== STARTING STANDINGS FETCH ===")
        console.log("Fetching standings using unified calculation...")
        
        // Use the new unified standings API
        const response = await fetch('/api/standings')
        if (!response.ok) {
          throw new Error('Failed to fetch standings')
        }
        
        const data = await response.json()
        const standings = data.standings

        console.log(`Calculated standings for ${standings.length} teams`)
        console.log("Sample standings data:", standings.slice(0, 2))
        setStandings(standings)
        setLoading((prev) => ({ ...prev, standings: false }))
      } catch (err) {
        console.error("Error in fetchStandings:", err)
        setError("An unexpected error occurred")
        toast({
          title: "Error",
          description: "Failed to load standings. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStandings()
  }, [supabase, seasonParam, toast])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ice-blue-50 via-slate-50 to-rink-blue-50 dark:from-hockey-silver-900 dark:via-hockey-silver-800 dark:to-rink-blue-900/30 py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-blue-50 via-slate-50 to-rink-blue-50 dark:from-hockey-silver-900 dark:via-hockey-silver-800 dark:to-rink-blue-900/30 py-12 px-4">
      <div className="container mx-auto">
        <motion.h1
          className="hockey-title mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          League Standings
        </motion.h1>
        <motion.p
          className="hockey-subtitle text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Follow your team's progress through the league conferences.
        </motion.p>

        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-6 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          </div>
        ) : (
          <ConferenceStandings standings={standings} />
        )}
      </div>
    </div>
  )
}