// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Clock, Home, ExternalLink, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Filter, Calendar, Trophy, Zap, Target, Users, TrendingUp } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { TeamLogo } from "@/components/team-logo"

export default function FixturesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [matches, setMatches] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSeason, setCurrentSeason] = useState<any>(null)

  // Pagination and filtering state
  const [currentWeek, setCurrentWeek] = useState(1)
  const [totalWeeks, setTotalWeeks] = useState(1)
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [weekMatches, setWeekMatches] = useState<any[]>([])

  // Get initial filters from URL params
  useEffect(() => {
    const week = searchParams.get("week")
    const team = searchParams.get("team")

    if (week) setCurrentWeek(Number.parseInt(week))
    if (team) setSelectedTeam(team)
  }, [searchParams])

  // Fetch all matches
  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/matches');
        if (!response.ok) throw new Error('Failed to fetch matches');
        const data = await response.json();

        setMatches(data.matches || [])

        // Calculate weeks based on matches
        if (data.matches && data.matches.length > 0) {
          const weeks = calculateWeeks(data.matches)
          setTotalWeeks(weeks)
        }
      } catch (error: any) {
        console.error("Error fetching matches:", error)
        setError(`Error: ${error.message}`)
        toast({
          title: "Error",
          description: "Failed to load matches. Please try again.",
          variant: "destructive",
        })
        setMatches([])
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [toast, selectedTeam])

  // Calculate weeks from matches
  const calculateWeeks = (matchesData: any[]) => {
    if (!matchesData.length) return 1

    // Group matches by week (7-day periods starting from first match)
    const firstMatchDate = new Date(matchesData[0].match_date)
    const lastMatchDate = new Date(matchesData[matchesData.length - 1].match_date)

    // Calculate the difference in weeks
    const timeDiff = lastMatchDate.getTime() - firstMatchDate.getTime()
    const weeksDiff = Math.ceil(timeDiff / (7 * 24 * 60 * 60 * 1000))

    return Math.max(1, weeksDiff + 1)
  }

  // Get matches for current week
  useEffect(() => {
    if (matches.length === 0) {
      setWeekMatches([])
      return
    }

    const firstMatchDate = new Date(matches[0].match_date)
    const weekStartDate = new Date(firstMatchDate)
    weekStartDate.setDate(firstMatchDate.getDate() + (currentWeek - 1) * 7)

    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekStartDate.getDate() + 6)
    weekEndDate.setHours(23, 59, 59, 999)

    const filteredMatches = matches.filter((match) => {
      const matchDate = new Date(match.match_date)
      return matchDate >= weekStartDate && matchDate <= weekEndDate
    })

    setWeekMatches(filteredMatches)
  }, [matches, currentWeek])

  // Update URL when filters change
  const updateURL = (week: number, team: string) => {
    const params = new URLSearchParams()
    if (week > 1) params.set("week", week.toString())
    if (team !== "all") params.set("team", team)

    const newURL = params.toString() ? `/matches?${params.toString()}` : "/matches"
    router.replace(newURL, { scroll: false })
  }

  // Handle week navigation
  const goToWeek = (week: number) => {
    setCurrentWeek(week)
    updateURL(week, selectedTeam)
  }

  // Handle team filter change
  const handleTeamFilter = (team: string) => {
    setSelectedTeam(team)
    setCurrentWeek(1) // Reset to first week when changing team filter
    updateURL(1, team)
  }

  // Group matches by date
  const groupMatchesByDate = (matches: any[]) => {
    const groups: Record<string, any[]> = {}

    matches.forEach((match) => {
      const date = new Date(match.match_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      if (!groups[date]) {
        groups[date] = []
      }

      groups[date].push(match)
    })

    return groups
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "outline"
      case "In Progress":
        return "secondary"
      case "Completed":
        return "default"
      default:
        return "default"
    }
  }

  const matchesByDate = groupMatchesByDate(weekMatches)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900 flex items-center justify-center fifa-scrollbar">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-field-green-600 mx-auto mb-4"></div>
          <p className="text-field-green-700 dark:text-field-green-300 font-medium">Loading fixtures...</p>
        </div>
      </div>
    )
  }

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
              Fixtures
            </h1>
            <p className="text-xl md:text-2xl text-field-green-700 dark:text-field-green-300 mb-8 max-w-3xl mx-auto">
              Follow all the action with our comprehensive fixture schedule and results.
            </p>
            <div className="fifa-section-divider"></div>
          </motion.div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {Object.entries(matchesByDate).map(([date, dateMatches]) => (
            <motion.div 
              key={date}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }}
            >
              <div className="fifa-card-hover-enhanced p-6 mb-6">
                <h2 className="text-2xl font-bold text-field-green-800 dark:text-field-green-200 mb-2">{date}</h2>
                <div className="fifa-section-divider"></div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {dateMatches.map((match, index) => {
                  const formattedDate = formatDate(match.match_date)
                  const isCompleted = match.status === "Completed"

                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="group cursor-pointer"
                      onClick={() => router.push(`/matches/${match.id}`)}
                    >
                      <div className="fifa-card-hover-enhanced overflow-hidden h-full">
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2 text-sm text-field-green-600 dark:text-field-green-400">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">{formattedDate.time}</span>
                            </div>
                            <Badge 
                              variant={getStatusBadgeVariant(match.status)}
                              className={`${
                                match.status === "Completed" 
                                  ? "bg-field-green-100 text-field-green-800 border-field-green-200 dark:bg-field-green-800 dark:text-field-green-200 dark:border-field-green-600" 
                                  : match.status === "In Progress"
                                  ? "bg-pitch-blue-100 text-pitch-blue-800 border-pitch-blue-200 dark:bg-pitch-blue-800 dark:text-pitch-blue-200 dark:border-pitch-blue-600"
                                  : "bg-stadium-gold-100 text-stadium-gold-800 border-stadium-gold-200 dark:bg-stadium-gold-800 dark:text-stadium-gold-200 dark:border-stadium-gold-600"
                              }`}
                            >
                              {match.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <TeamLogo teamName={match.home_team.name} logoUrl={match.home_team.logo_url} size="sm" />
                              <span className="font-bold text-lg text-field-green-800 dark:text-field-green-200">{match.home_team.name}</span>
                            </div>
                            <div className="font-bold text-2xl text-field-green-700 dark:text-field-green-300">
                              {isCompleted ? `${match.home_score} - ${match.away_score}` : 'vs'}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-lg text-field-green-800 dark:text-field-green-200">{match.away_team.name}</span>
                              <TeamLogo teamName={match.away_team.name} logoUrl={match.away_team.logo_url} size="sm" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
