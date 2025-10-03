// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Clock, Trophy, DollarSign, Filter, History, Search } from "lucide-react"
import { SalaryProgress } from "@/components/management/salary-progress"
import { RosterProgress } from "@/components/management/roster-progress"
import { TeamAvailabilityTab } from "@/components/management/team-availability-tab"
import Image from "next/image"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { TeamLogos } from "@/components/management/team-logos"
import { SignPlayerModal } from "@/components/management/sign-player-modal"
import { Home, Gavel } from "lucide-react"
import { getTeamStats, getCurrentSeasonId } from "@/lib/team-utils"

interface Player {
  id: string
  salary: number
  role: string
  users: {
    id: string
    gamer_tag_id: string
    primary_position: string
    secondary_position?: string
    console: string
    avatar_url?: string
  }
}

interface Team {
  id: string
  name: string
  logo_url?: string
  salary_cap: number
  max_players: number
  wins: number
  losses: number
  otl: number
  points: number
  games_played: number
  goals_for: number
  goals_against: number
  goal_differential: number
}

interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  scheduled_time: string
  status: string
  home_score?: number
  away_score?: number
  home_team: {
    name: string
    logo_url?: string
  }
  away_team: {
    name: string
    logo_url?: string
  }
}

interface FreeAgent {
  id: string
  salary: number
  users: {
    id: string
    gamer_tag_id: string
    primary_position: string
    secondary_position?: string
    console: string
    avatar_url?: string
  }
}

interface Bid {
  id: string
  amount: number
  expires_at: string
  status: string
  players: {
    id: string
    salary: number
    users: {
      id: string
      gamer_tag_id: string
      primary_position: string
      secondary_position?: string
      console: string
    }
  }
}

// Update the getPositionAbbreviation function to handle both full names and abbreviations
const getPositionAbbreviation = (position: string): string => {
  if (!position) return "?"

  const trimmedPosition = position.trim().toLowerCase()

  // Position mapping that handles both full names and abbreviations
  const positionMap: Record<string, string> = {
    goalie: "G",
    g: "G",
    center: "C",
    c: "C",
    "left wing": "LW",
    lw: "LW",
    "right wing": "RW",
    rw: "RW",
    "left defense": "LD",
    ld: "LD",
    "right defense": "RD",
    rd: "RD",
  }

  return positionMap[trimmedPosition] || position.toUpperCase()
}

// Function to get position color
const getPositionColor = (position: string): string => {
  switch (position) {
    case "Goalie":
    case "G":
      return "text-purple-400"
    case "Center":
    case "C":
      return "text-red-400"
    case "Left Wing":
    case "LW":
      return "text-green-400"
    case "Right Wing":
    case "RW":
      return "text-ice-blue-400"
    case "Left Defense":
    case "LD":
      return "text-cyan-400"
    case "Right Defense":
    case "RD":
      return "text-yellow-400"
    default:
      return "text-hockey-silver-400"
  }
}

const tabs = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "transfers", label: "Transfers", icon: Gavel },
  { id: "signings", label: "Signings", icon: DollarSign },
  { id: "lineups", label: "Lineups", icon: Users },
  { id: "availability", label: "Availability", icon: Calendar },
]

const ManagementPage = () => {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  // Safe search params handling
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [teamData, setTeamData] = useState<Team | null>(null)
  const [teamPlayers, setTeamPlayers] = useState<any[]>([])
  const [teamMatches, setTeamMatches] = useState<any[]>([])
  const [freeAgents, setFreeAgents] = useState<any[]>([])
  const [filteredFreeAgents, setFilteredFreeAgents] = useState<any[]>([])
  const [positionFilter, setPositionFilter] = useState<string>("all")
  const [nameFilter, setNameFilter] = useState<string>("")
  const [playerOffers, setPlayerOffers] = useState<Record<string, any>>({})
  const [myTransferOffers, setMyTransferOffers] = useState<any[]>([])
  const [mySignings, setMySignings] = useState<any[]>([])
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState<any>(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<any>(false)
  const [historyPlayer, setHistoryPlayer] = useState<any>(null)
  const [now, setNow] = useState(new Date())
  const [activeTransferOffersCount, setActiveTransferOffersCount] = useState(0)
  const [activeSigningsCount, setActiveSigningsCount] = useState(0)
  const [freeAgentsError, setFreeAgentsError] = useState<string | null>(null)
  const [freeAgentsLoading, setFreeAgentsLoading] = useState(false)

  // Get active tab from search params or default to "roster"
  const [activeTab, setActiveTab] = useState(searchParams?.get("tab") || "roster")

  // Add these state variables after the existing useState declarations
  const [projectedSalary, setProjectedSalary] = useState(0)
  const [projectedRosterSize, setProjectedRosterSize] = useState(0)
  const [currentSalaryCap, setCurrentSalaryCap] = useState(65000000) // $65M salary cap
  const [currentTeamSalary, setCurrentTeamSalary] = useState(0)
  const [isTransferEnabled, setIsTransferEnabled] = useState(true)

  // Add this state variable near the top with other useState declarations
  const [userRole, setUserRole] = useState<string | null>(null)
  const [offerModalOpen, setOfferModalOpen] = useState(false)

  // Add state for cap space withholding
  const [capSpaceWithholding, setCapSpaceWithholding] = useState<{ [playerId: string]: number }>({})

  // Update current time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Update the position filter logic in the useEffect
  useEffect(() => {
    let filtered = freeAgents

    // Apply name filter if provided
    if (nameFilter.trim() !== "") {
      const searchTerm = nameFilter.toLowerCase().trim()
      filtered = filtered.filter((player) => player.users?.gamer_tag_id?.toLowerCase().includes(searchTerm))
    }

    // Apply position filter if not "all"
    if (positionFilter !== "all") {
      filtered = filtered.filter((player) => {
        const primaryPosition = player.users?.primary_position?.toLowerCase()
        const secondaryPosition = player.users?.secondary_position?.toLowerCase()
        return primaryPosition === positionFilter || secondaryPosition === positionFilter
      })
    }

    setFilteredFreeAgents(filtered)
  }, [freeAgents, nameFilter, positionFilter])

  // Calculate projected salary and roster size
  useEffect(() => {
    if (teamPlayers.length > 0) {
      const totalSalary = teamPlayers.reduce((sum, player) => sum + (player.salary || 0), 0)
      setProjectedSalary(totalSalary)
      setProjectedRosterSize(teamPlayers.length)
    }
  }, [teamPlayers])

  // Fetch data function
  const fetchData = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)

      // Get user's team
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .select(`
          id,
          team_id,
          role,
          salary,
          users!inner (
            id,
            gamer_tag_id,
            primary_position,
            secondary_position,
            console,
            avatar_url
          )
        `)
        .eq("user_id", session.user.id)
        .single()

      if (playerError) {
        console.error("Error fetching player data:", playerError)
        toast({
          title: "Error",
          description: "Failed to load your team data. Please try again.",
          variant: "destructive",
        })
        return
      }

      if (!playerData?.team_id) {
        toast({
          title: "No Team Found",
          description: "You are not currently on a team. Please contact an administrator.",
          variant: "destructive",
        })
        return
      }

      // Get team data
      const { data: basicTeamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", playerData.team_id)
        .single()

      if (teamError) {
        console.error("Error fetching team data:", teamError)
        return
      }

      setTeamData(basicTeamData)
      setUserRole(playerData.role)

      // Check if user is authorized (GM, AGM, or Owner)
      const isAuthorized = ["GM", "AGM", "Owner"].includes(playerData.role)
      setIsAuthorized(isAuthorized)

      if (!isAuthorized) {
        toast({
          title: "Access Denied",
          description: "You need to be a GM, AGM, or Owner to access team management.",
          variant: "destructive",
        })
        return
      }

      // Get team players
      const { data: teamPlayersData, error: playersError } = await supabase
        .from("players")
        .select(`
          id,
          salary,
          role,
          users!inner (
            id,
            gamer_tag_id,
            primary_position,
            secondary_position,
            console,
            avatar_url
          )
        `)
        .eq("team_id", playerData.team_id)

      if (playersError) {
        console.error("Error fetching team players:", playersError)
        return
      }

      setTeamPlayers(teamPlayersData || [])
      
      // Calculate current team salary
      const totalSalary = (teamPlayersData || []).reduce((sum, player) => sum + (player.salary || 0), 0)
      setCurrentTeamSalary(totalSalary)

      // Get team matches
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select(`
          id,
          home_team_id,
          away_team_id,
          scheduled_time,
          status,
          home_score,
          away_score,
          home_team:teams!matches_home_team_id_fkey (
            name,
            logo_url
          ),
          away_team:teams!matches_away_team_id_fkey (
            name,
            logo_url
          )
        `)
        .or(`home_team_id.eq.${playerData.team_id},away_team_id.eq.${playerData.team_id}`)
        .order("scheduled_time", { ascending: true })

      if (matchesError) {
        console.error("Error fetching matches:", matchesError)
        return
      }

      setTeamMatches(matchesData || [])

      // Fetch free agents
      await fetchFreeAgents()

      // Fetch player offers
      await fetchPlayerOffers()

    } catch (error) {
      console.error("Error in fetchData:", error)
      toast({
        title: "Error",
        description: "An error occurred while loading data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch free agents
  const fetchFreeAgents = async () => {
    try {
      setFreeAgentsLoading(true)
      setFreeAgentsError(null)

      console.log("=== DEBUG: Starting loadFreeAgents via API ===")
      
      const response = await fetch("/api/free-agency")
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const freeAgentsData = await response.json()
      console.log("Free agents loaded:", freeAgentsData.length)
      
      setFreeAgents(freeAgentsData)
    } catch (error: any) {
      console.error("Error loading free agents:", error)
      setFreeAgentsError(error.message || "Failed to load free agents")
    } finally {
      setFreeAgentsLoading(false)
    }
  }

  // Fetch player offers
  const fetchPlayerOffers = async () => {
    if (!teamData?.id) return

    try {
      const { data: offersData, error } = await supabase
        .from("player_transfer_offers")
        .select(`
          id,
          offer_amount,
          offer_expires_at,
          status,
          players!inner (
            id,
            salary,
            users!inner (
              id,
              gamer_tag_id,
              primary_position,
              secondary_position,
              console
            )
          )
        `)
        .eq("team_id", teamData.id)
        .eq("status", "active")

      if (error) {
        console.error("Error fetching offers:", error)
        return
      }

      const offersMap: Record<string, any> = {}
      const myOffersList: any[] = []

      offersData?.forEach((offer) => {
        offersMap[offer.players.id] = offer
        myOffersList.push(offer)
      })

      setPlayerOffers(offersMap)
      setMyTransferOffers(myOffersList)

      // Count active offers
      const activeCount = myOffersList.length
      setActiveTransferOffersCount(activeCount)
    } catch (error) {
      console.error("Error in fetchPlayerOffers:", error)
    }
  }

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", tab)
    router.push(url.pathname + url.search)
  }

  // Handle player selection for transfer offers
  const handlePlayerSelect = (player: any) => {
    setSelectedPlayer(player)
    setIsModalOpen(true)
  }

  // Load data on component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchData()
    }
  }, [session?.user?.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground">
              You need to be a GM, AGM, or Owner to access team management.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!teamData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No Team Found</h2>
            <p className="text-muted-foreground">
              You are not currently on a team. Please contact an administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30">
      {/* Hero Header Section */}
      <div className="hockey-header relative py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-6 mb-8">
            {teamData.logo_url && (
              <Image
                src={teamData.logo_url}
                alt={teamData.name}
                width={80}
                height={80}
                className="rounded-xl shadow-lg"
              />
            )}
            <div>
              <h1 className="hockey-title mb-2">
                {teamData.name}
              </h1>
              <p className="hockey-subtitle">
                Team Management Dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20">

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="fifa-card-hover-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-field-green-600 dark:text-field-green-400 font-medium">Roster Size</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                    {teamPlayers.length}
                    {projectedRosterSize !== teamPlayers.length && (
                      <span className="text-lg text-pitch-blue-500 ml-1">→ {projectedRosterSize}</span>
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fifa-card-hover-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-field-green-600 dark:text-field-green-400 font-medium">Salary Cap</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                    ${(currentTeamSalary / 1000000).toFixed(1)}M
                    {projectedSalary !== currentTeamSalary && (
                      <span className="text-lg text-stadium-gold-500 ml-1">
                        → ${(projectedSalary / 1000000).toFixed(1)}M
                      </span>
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-stadium-gold-500 to-goal-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fifa-card-hover-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-field-green-600 dark:text-field-green-400 font-medium">Record</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                    {teamData.wins}-{teamData.losses}-{teamData.otl}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-pitch-blue-500 to-field-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fifa-card-hover-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-field-green-600 dark:text-field-green-400 font-medium">Points</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">{teamData.points}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-goal-orange-500 to-stadium-gold-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 fifa-tabs-list">
            <TabsTrigger value="roster" className="fifa-tab-trigger">Roster</TabsTrigger>
            <TabsTrigger value="transfers" className="fifa-tab-trigger">Transfer Market</TabsTrigger>
            <TabsTrigger value="signings" className="fifa-tab-trigger">Direct Signings</TabsTrigger>
            <TabsTrigger value="my-offers" className="fifa-tab-trigger">My Offers</TabsTrigger>
            <TabsTrigger value="team-transfers" className="fifa-tab-trigger">Team Transfers</TabsTrigger>
            <TabsTrigger value="schedule" className="fifa-tab-trigger">Schedule</TabsTrigger>
          </TabsList>

          {/* Roster Tab Content */}
          <TabsContent value="roster">
            <Card className="fifa-card-hover-enhanced">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800 dark:text-slate-200">Team Roster</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Manage your team's players and roles</CardDescription>
              </CardHeader>
              <CardContent>
                {teamPlayers.length > 0 ? (
                  <div className="space-y-4">
                    {teamPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-4 border border-field-green-200 dark:border-field-green-700 rounded-lg bg-gradient-to-r from-field-green-50/50 to-pitch-blue-50/50 dark:from-field-green-900/50 dark:to-pitch-blue-900/50"
                      >
                        <div className="flex items-center gap-4">
                          {player.users?.avatar_url && (
                            <Image
                              src={player.users.avatar_url}
                              alt={player.users.gamer_tag_id}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          )}
                          <div>
                            <h3 className="font-medium">{player.users?.gamer_tag_id}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className={getPositionColor(player.users?.primary_position)}>
                                {getPositionAbbreviation(player.users?.primary_position)}
                              </span>
                              {player.users?.secondary_position && (
                                <>
                                  <span>•</span>
                                  <span className={getPositionColor(player.users?.secondary_position)}>
                                    {getPositionAbbreviation(player.users?.secondary_position)}
                                  </span>
                                </>
                              )}
                              <span>•</span>
                              <span>{player.users?.console}</span>
                              <span>•</span>
                              <span>${(player.salary / 1000000).toFixed(2)}M</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">{player.role}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                    No players on this team
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfer Market Tab Content */}
          <TabsContent value="transfers">
            <Card className="fifa-card-hover-enhanced">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800 dark:text-slate-200">Transfer Market</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">Browse and make transfer offers for available players</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Select value={positionFilter} onValueChange={setPositionFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Positions</SelectItem>
                        <SelectItem value="goalie">Goalie</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="left wing">Left Wing</SelectItem>
                        <SelectItem value="right wing">Right Wing</SelectItem>
                        <SelectItem value="left defense">Left Defense</SelectItem>
                        <SelectItem value="right defense">Right Defense</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Search by name..."
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                      className="flex-1"
                    />
                  </div>

                  {freeAgentsLoading ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : freeAgentsError ? (
                    <div className="text-center py-8 text-red-500">
                      {freeAgentsError}
                    </div>
                  ) : filteredFreeAgents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No free agents available
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredFreeAgents.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => handlePlayerSelect(player)}
                        >
                          <div className="flex items-center gap-4">
                            {player.users?.avatar_url && (
                              <Image
                                src={player.users.avatar_url}
                                alt={player.users.gamer_tag_id}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            )}
                            <div>
                              <h3 className="font-medium">{player.users?.gamer_tag_id}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className={getPositionColor(player.users?.primary_position)}>
                                  {getPositionAbbreviation(player.users?.primary_position)}
                                </span>
                                {player.users?.secondary_position && (
                                  <>
                                    <span>•</span>
                                    <span className={getPositionColor(player.users?.secondary_position)}>
                                      {getPositionAbbreviation(player.users?.secondary_position)}
                                    </span>
                                  </>
                                )}
                                <span>•</span>
                                <span>{player.users?.console}</span>
                                <span>•</span>
                                <span>${(player.salary / 1000000).toFixed(2)}M</span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm">Bid</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Offers Tab Content */}
          <TabsContent value="my-offers">
            <Card>
              <CardHeader>
                <CardTitle>My Transfer Offers</CardTitle>
                <CardDescription>Track your active transfer offers</CardDescription>
              </CardHeader>
              <CardContent>
                {myTransferOffers.length > 0 ? (
                  <div className="space-y-4">
                    {myTransferOffers.map((offer) => (
                      <div
                        key={offer.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          {offer.players?.users?.avatar_url && (
                            <Image
                              src={offer.players.users.avatar_url}
                              alt={offer.players.users.gamer_tag_id}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          )}
                          <div>
                            <h3 className="font-medium">{offer.players?.users?.gamer_tag_id}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className={getPositionColor(offer.players?.users?.primary_position)}>
                                {getPositionAbbreviation(offer.players?.users?.primary_position)}
                              </span>
                              <span>•</span>
                              <span>${(offer.offer_amount / 1000000).toFixed(2)}M</span>
                              <span>•</span>
                              <span>Expires: {new Date(offer.offer_expires_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">{offer.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No transfer offers placed yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Direct Signings Tab Content */}
          <TabsContent value="signings">
            <Card>
              <CardHeader>
                <CardTitle>Direct Player Signings</CardTitle>
                <CardDescription>Sign players directly without transfer offers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Select value={positionFilter} onValueChange={setPositionFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Positions</SelectItem>
                        <SelectItem value="goalie">Goalie</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="left wing">Left Wing</SelectItem>
                        <SelectItem value="right wing">Right Wing</SelectItem>
                        <SelectItem value="left defense">Left Defense</SelectItem>
                        <SelectItem value="right defense">Right Defense</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Search by name..."
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                      className="flex-1"
                    />
                  </div>

                  {freeAgentsLoading ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : freeAgentsError ? (
                    <div className="text-center py-8 text-red-500">
                      {freeAgentsError}
                    </div>
                  ) : filteredFreeAgents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No free agents available for direct signing
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredFreeAgents.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => handlePlayerSelect(player)}
                        >
                          <div className="flex items-center gap-4">
                            {player.users?.avatar_url && (
                              <Image
                                src={player.users.avatar_url}
                                alt={player.users.gamer_tag_id}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            )}
                            <div>
                              <h3 className="font-medium">{player.users?.gamer_tag_id}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className={getPositionColor(player.users?.primary_position)}>
                                  {getPositionAbbreviation(player.users?.primary_position)}
                                </span>
                                {player.users?.secondary_position && (
                                  <>
                                    <span>•</span>
                                    <span className={getPositionColor(player.users?.secondary_position)}>
                                      {getPositionAbbreviation(player.users?.secondary_position)}
                                    </span>
                                  </>
                                )}
                                <span>•</span>
                                <span>{player.users?.console}</span>
                                <span>•</span>
                                <span>${(player.salary / 1000000).toFixed(2)}M</span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Sign Player
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Transfers Tab Content */}
          <TabsContent value="team-transfers">
            <Card>
              <CardHeader>
                <CardTitle>Team-to-Team Transfers</CardTitle>
                <CardDescription>Send transfer offers to other teams for their players</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Team Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Select Team to Negotiate With</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* This would be populated with other teams */}
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <span className="text-white font-bold">T</span>
                          </div>
                          <h4 className="font-medium">Team Name</h4>
                          <p className="text-sm text-muted-foreground">Division</p>
                          <Button size="sm" className="mt-2" variant="outline">
                            View Players
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transfer Offers Received */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Incoming Transfer Offers</h3>
                    <div className="text-sm text-muted-foreground">
                      No incoming transfer offers at this time.
                    </div>
                  </div>

                  {/* Transfer Offers Sent */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Outgoing Transfer Offers</h3>
                    <div className="text-sm text-muted-foreground">
                      No outgoing transfer offers at this time.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab Content */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Team Schedule</CardTitle>
                <CardDescription>Upcoming and recent matches</CardDescription>
              </CardHeader>
              <CardContent>
                {teamMatches.length > 0 ? (
                  <div className="space-y-4">
                    {teamMatches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="font-medium">{match.home_team.name}</div>
                            {match.home_team.logo_url && (
                              <Image
                                src={match.home_team.logo_url}
                                alt={match.home_team.name}
                                width={32}
                                height={32}
                                className="mx-auto mt-1"
                              />
                            )}
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {match.home_score !== null ? `${match.home_score} - ${match.away_score}` : "vs"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(match.scheduled_time).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{match.away_team.name}</div>
                            {match.away_team.logo_url && (
                              <Image
                                src={match.away_team.logo_url}
                                alt={match.away_team.name}
                                width={32}
                                height={32}
                                className="mx-auto mt-1"
                              />
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">{match.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No matches scheduled
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bid Modal */}
        {selectedPlayer && (
          <SignPlayerModal
            player={selectedPlayer}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedPlayer(null)
            }}
            onOfferPlaced={() => {
              // Refresh offers and free agents
              fetchPlayerOffers()
              fetchData()
            }}
            teamData={teamData}
            currentOffer={playerOffers[selectedPlayer.id]}
            projectedSalary={projectedSalary}
            salaryCap={currentSalaryCap}
            projectedRosterSize={projectedRosterSize}
          />
        )}
      </div>
    </div>
  )
}

export default ManagementPage
