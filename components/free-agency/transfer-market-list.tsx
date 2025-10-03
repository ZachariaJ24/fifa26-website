"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { SignPlayerModal as SignModal } from "@/components/management/sign-player-modal"
import { TransferHistoryModal } from "@/components/free-agency/transfer-history-modal"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { History, Clock, Users, Target, DollarSign, Calendar, Trophy } from "lucide-react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface TransferMarketListProps {
  userId?: string
  searchParams?: { [key: string]: string | string[] | undefined }
}

// Position abbreviation mapping function for soccer positions
function getPositionAbbreviation(position: string): string {
  const positionMap: Record<string, string> = {
    "Goalkeeper": "GK",
    "Right Back": "RB",
    "Left Back": "LB",
    "Right Wing": "RW",
    "Left Wing": "LW",
    "Central Midfielder": "CM",
    "Defensive Midfielder": "DM",
    "Attacking Midfielder": "AM",
    "Striker": "ST",
    "Center Forward": "CF",
  }

  return positionMap[position] || position
}

// Simple logging function that only logs in development
const safeLog = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args)
  }
}

interface TeamStats {
  current_salary: number
  roster_size: number
  positions: { [key: string]: number }
}

interface PotentialStats {
  potentialSalary: number
  potentialRosterSize: number
  potentialPositions: { [key: string]: number }
}

export function TransferMarketList({ userId, searchParams = {} }: TransferMarketListProps) {
  const [players, setPlayers] = useState<any[]>([])
  const [playerOffers, setPlayerOffers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [historyPlayer, setHistoryPlayer] = useState<any>(null)
  const [userTeam, setUserTeam] = useState<any>(null)
  const [now, setNow] = useState(new Date())
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [freeAgents, setFreeAgents] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [myActiveOffers, setMyActiveOffers] = useState<any[]>([])

  // Use useSearchParams hook for better client-side URL parameter handling
  const searchParamsHook = useSearchParams()
  const positionFilter = searchParamsHook?.get("position") || searchParams?.position || "all"
  const sortBy = searchParamsHook?.get("sort") || searchParams?.sort || "name"

  // Update time every 15 minutes to check for expired offers
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
      checkExpiredOffers()
    }, 900000)

    return () => clearInterval(interval)
  }, [playerOffers])

  // Function to check for expired offers and assign players
  const checkExpiredOffers = async () => {
    const expiredOffers = Object.values(playerOffers).filter((offer: any) => {
      return new Date(offer.offer_expires_at) < now
    })

    if (expiredOffers.length > 0) {
      for (const offer of expiredOffers) {
        await assignPlayerToTeam(offer)
      }

      // Refresh the free agents list if any offers were processed
      if (expiredOffers.length > 0) {
        await loadFreeAgents()
      }
    }
  }

  // Function to assign a player to the winning team
  const assignPlayerToTeam = async (offer: any) => {
    try {
      // Get the player information
      const { data: player, error: playerError } = await supabase
        .from("players")
        .select("*")
        .eq("id", offer.player_id)
        .single()

      if (playerError) throw playerError

      // Update the player's team and salary
      const { error: updateError } = await supabase
        .from("players")
        .update({
          club_id: offer.team_id,
          salary: offer.offer_amount,
        })
        .eq("id", offer.player_id)

      if (updateError) throw updateError

      // Get team name for notification
      const { data: team } = await supabase
        .from("clubs")
        .select("name")
        .eq("id", offer.team_id)
        .single()

      // Notify the player
      await supabase.from("notifications").insert({
        user_id: player.user_id,
        title: "Transfer Successful - You've Been Signed!",
        message: `Congratulations! ${team.name} has successfully signed you for $${offer.offer_amount.toLocaleString()}.`,
        link: "/profile",
      })

      // Notify team managers
      const { data: managers } = await supabase
        .from("players")
        .select("user_id")
        .eq("club_id", offer.team_id)
        .in("role", ["GM", "AGM", "Owner"])

      if (managers && managers.length > 0) {
        const { data: userData } = await supabase
          .from("users")
          .select("gamer_tag_id")
          .eq("id", player.user_id)
          .single()

        const notifications = managers.map((manager) => ({
          user_id: manager.user_id,
          title: "Transfer Successful - Player Signed",
          message: `Your team has successfully signed ${userData?.gamer_tag_id || "a player"} for $${offer.offer_amount.toLocaleString()}.`,
          link: "/management",
        }))

        await supabase.from("notifications").insert(notifications)
      }

      safeLog(`Player ${player.id} assigned to team ${offer.team_id} with salary ${offer.offer_amount}`)
    } catch (error) {
      safeLog("Error assigning player to team:", error)
    }
  }

  // Load free agents from the API
  const loadFreeAgents = useCallback(async () => {
    try {
      setRefreshing(true)
      console.log("=== DEBUG: Starting loadFreeAgents via API ===")

      const response = await fetch("/api/free-agency")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("=== DEBUG: API Response ===", data)

      if (data.success && data.players) {
        const freeAgentsList = data.players
        setFreeAgents(freeAgentsList)
        setPlayers(freeAgentsList)

        // Fetch offers for all players
        await fetchPlayerOffers()

        console.log("=== DEBUG: End loadFreeAgents via API ===")
      } else {
        console.error("API returned unsuccessful response:", data)
        setError(data.error || "Failed to load free agents")
      }
    } catch (error) {
      console.error("Error loading free agents:", error)
      setError(error instanceof Error ? error.message : "Failed to load free agents")
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Fetch current offers for all players
  const fetchPlayerOffers = useCallback(async () => {
    try {
      const { data: offers, error } = await supabase
        .from("player_transfer_offers")
        .select(`
        *,
        teams (
          id,
          name,
          logo_url
        )
        `)
        .order("offer_amount", { ascending: false })

      if (error) throw error

      // Group offers by player_id and keep only the highest offer for each player
      const highestOffers: Record<string, any> = {}

      offers?.forEach((offer) => {
        if (!highestOffers[offer.player_id] || offer.offer_amount > highestOffers[offer.player_id].offer_amount) {
          highestOffers[offer.player_id] = offer
        }
      })

      setPlayerOffers(highestOffers)

      // Also fetch my team's active offers for potential calculations
      if (userTeam?.id) {
        const myOffers = offers?.filter((offer) => offer.team_id === userTeam.id && new Date(offer.offer_expires_at) > now) || []
        setMyActiveOffers(myOffers)
      }
    } catch (error) {
      safeLog("Error fetching player offers:", error)
    }
  }, [supabase, userTeam?.id, now])

  // Load user team data
  const loadUserTeam = useCallback(async () => {
    if (!userId) return

    try {
      const { data: teamData, error } = await supabase
        .from("players")
        .select(`
          club_id,
          clubs (
            id,
            name,
            logo_url,
            salary_cap
          )
        `)
        .eq("user_id", userId)
        .eq("role", "GM")
        .single()

      if (error) {
        safeLog("Error loading user team:", error)
        return
      }

      if (teamData?.teams) {
        setUserTeam(teamData.teams)
      }
    } catch (error) {
      safeLog("Error in loadUserTeam:", error)
    }
  }, [supabase, userId])

  // Load team statistics
  const fetchTeamStats = useCallback(async () => {
    if (!userTeam?.id) return

    try {
      const { data: stats, error } = await supabase
        .from("team_stats")
        .select("*")
        .eq("club_id", userTeam.id)
        .single()

      if (error) {
        safeLog("Error fetching team stats:", error)
        return
      }

      setTeamStats(stats)
    } catch (error) {
      safeLog("Error in fetchTeamStats:", error)
    }
  }, [supabase, userTeam?.id])

  // Calculate potential stats based on all active winning offers
  const calculatePotentialStats = (): PotentialStats | null => {
    if (!userTeam || !teamStats || !myActiveOffers.length) return null

    // Filter to only winning offers that haven't expired
    const winningOffers = myActiveOffers.filter((offer) => {
      const highestOffer = playerOffers[offer.player_id]
      const isWinning = highestOffer && highestOffer.id === offer.id
      const isActive = new Date(offer.offer_expires_at) > now
      return isWinning && isActive
    })

    if (winningOffers.length === 0) return null

    // Calculate potential salary increase
    const potentialSalaryIncrease = winningOffers.reduce((sum, offer) => {
      // Find the player data to get their salary
      const player = freeAgents.find((p) => p.id === offer.player_id)
      return sum + (player?.salary || 0)
    }, 0)

    const potentialSalary = teamStats.current_salary + potentialSalaryIncrease
    const potentialRosterSize = teamStats.roster_size + winningOffers.length

    // Calculate potential position breakdown
    const potentialPositions = { ...teamStats.positions }
    winningOffers.forEach((offer) => {
      const player = freeAgents.find((p) => p.id === offer.player_id)
      if (player?.users?.primary_position) {
        const pos = player.users.primary_position
        potentialPositions[pos] = (potentialPositions[pos] || 0) + 1
      }
    })

    return {
      potentialSalary,
      potentialRosterSize,
      potentialPositions,
    }
  }

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setMounted(true)
      await loadUserTeam()
      await loadFreeAgents()
    }

    loadData()
  }, [loadUserTeam, loadFreeAgents])

  // Load team stats when user team changes
  useEffect(() => {
    if (userTeam) {
      fetchTeamStats()
    }
  }, [userTeam, fetchTeamStats])

  const handleSignClick = (player: any) => {
    console.log("handleSignClick called for player:", player)
    setSelectedPlayer(player)
    setIsModalOpen(true)
  }

  const handleHistoryClick = (player: any) => {
    setHistoryPlayer(player)
    setIsHistoryModalOpen(true)
  }

  const handleRefresh = async () => {
    await loadFreeAgents()
  }

  // Update the handleSignSubmit function to enforce minimum offer increment
  const handleSignSubmit = async (amount: number) => {
    if (!userTeam || !selectedPlayer) return

    try {
      // Check salary cap
      const potentialStats = calculatePotentialStats()
      const projectedSalary = potentialStats?.potentialSalary || teamStats?.current_salary || 0
      const projectedSalaryWithOffer = projectedSalary + amount

      if (projectedSalaryWithOffer > (userTeam.salary_cap || 30000000)) {
        toast({
          title: "Exceeds salary cap",
          description: "This offer would put your team over the salary cap.",
          variant: "destructive",
        })
        return
      }

      // Check if this team already has the highest offer
      const currentOffer = playerOffers[selectedPlayer.id]
      if (currentOffer && currentOffer.team_id === userTeam.id) {
        // Allow re-offering to extend the timer
        // No additional checks needed since we want to allow extending the timer
      }

      // Check if the offer meets the minimum increment requirement
      if (currentOffer && amount < currentOffer.offer_amount + 2000000) {
        toast({
          title: "Offer too low",
          description: "New offers must be at least $2,000,000 higher than the current highest offer.",
          variant: "destructive",
        })
        return
      }

      // Get the current offer duration from system settings
      const { data: durationSetting } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "transfer_offer_duration")
        .single()

      // Default to 14400 seconds (4 hours) if setting not found
      const offerDurationSeconds = durationSetting?.value ? Number.parseInt(durationSetting.value) : 14400
      const offerExpirationTime = new Date(Date.now() + offerDurationSeconds * 1000).toISOString()

      const { error: offerError } = await supabase.from("player_transfer_offers").insert({
        player_id: selectedPlayer.id,
        team_id: userTeam.id,
        offer_amount: amount,
        offer_expires_at: offerExpirationTime,
      })

      if (offerError) throw new Error(offerError.message)

      // Send notification to the player
      const { error: notificationError } = await supabase.from("notifications").insert({
        user_id: selectedPlayer.user_id,
        title: "New Transfer Offer Received",
        message: `${userTeam.name} has made a transfer offer of $${amount.toLocaleString()} for you.`,
        link: "/free-agency",
      })

      if (notificationError) {
        console.error("Error sending notification to player:", notificationError)
        // Don't fail the offer if notification fails
      }

      // If there was a previous highest offerer and it's not the current team, notify them
      if (currentOffer && currentOffer.team_id !== userTeam.id) {
        // Get the GM/AGM/Owner of the outbid team
        const { data: teamManagers } = await supabase
          .from("players")
          .select("user_id")
          .eq("team_id", currentOffer.team_id)
          .in("role", ["GM", "AGM", "Owner"])

        if (teamManagers && teamManagers.length > 0) {
          const notifications = teamManagers.map((manager) => ({
            user_id: manager.user_id,
            title: "Your Offer Was Outbid",
            message: `Your offer on ${selectedPlayer.users?.gamer_tag_id || "a player"} has been outbid by ${userTeam.name} with $${amount.toLocaleString()}.`,
            link: "/management",
          }))

          const { error: outbidNotificationError } = await supabase.from("notifications").insert(notifications)

          if (outbidNotificationError) {
            console.error("Error sending outbid notifications:", outbidNotificationError)
            // Don't fail the offer if notification fails
          }
        }
      }

      toast({
        title: "Transfer offer placed successfully",
        description: `Your offer of $${amount.toLocaleString()} has been placed.`,
      })

      setIsModalOpen(false)

      // Refresh offers
      await loadFreeAgents()
    } catch (error: any) {
      toast({
        title: "Error placing offer",
        description: error.message || "Failed to place transfer offer",
        variant: "destructive",
      })
    }
  }

  // Filter and sort players
  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = [...players]

    // Filter by position
    if (positionFilter !== "all") {
      filtered = filtered.filter((player) => player.users?.primary_position === positionFilter)
    }

    // Sort players
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.users?.gamer_tag_id || "").localeCompare(b.users?.gamer_tag_id || "")
        case "position":
          return (a.users?.primary_position || "").localeCompare(b.users?.primary_position || "")
        case "salary":
          return (b.salary || 0) - (a.salary || 0)
        case "rating":
          return (b.overall_rating || 0) - (a.overall_rating || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [players, positionFilter, sortBy])

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team Stats Card */}
      {userTeam && teamStats && (
        <Card className="bg-gradient-to-r from-field-green-50 to-pitch-blue-50 dark:from-field-green-900/30 dark:to-pitch-blue-900/30 border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
              <div className="p-2 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              {userTeam.name} - Current Squad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {teamStats.roster_size}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  ${(teamStats.current_salary / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Salary Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  ${((userTeam.salary_cap || 30000000) / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Salary Cap</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {myActiveOffers.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Active Offers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedPlayers.map((player) => {
          const currentOffer = playerOffers[player.id]
          const isMyOffer = currentOffer && userTeam && currentOffer.team_id === userTeam.id
          const isWinningOffer = currentOffer && currentOffer.id === playerOffers[player.id]?.id

          return (
            <Card key={player.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {player.users?.gamer_tag_id?.charAt(0) || "?"}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                        {player.users?.gamer_tag_id || "Unknown Player"}
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        {getPositionAbbreviation(player.users?.primary_position || "Unknown")} • Overall: {player.overall_rating || "N/A"}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={isWinningOffer ? "default" : "secondary"}
                    className={isWinningOffer ? "bg-gradient-to-r from-field-green-500 to-pitch-blue-600 text-white" : ""}
                  >
                    {isWinningOffer ? "Leading" : "Available"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-600 dark:text-slate-400">Current Salary</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      ${(player.salary || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-600 dark:text-slate-400">Position</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {player.users?.primary_position || "Unknown"}
                    </div>
                  </div>
                </div>

                {currentOffer && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Current Highest Offer</div>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        ${currentOffer.offer_amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        by {currentOffer.teams?.name || "Unknown Team"}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Expires: {new Date(currentOffer.offer_expires_at).toLocaleString()}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSignClick(player)}
                    className="flex-1 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 hover:from-field-green-600 hover:to-pitch-blue-700 text-white shadow-lg"
                    disabled={!userTeam}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    {isMyOffer ? "Update Offer" : "Make Offer"}
                  </Button>
                  <Button
                    onClick={() => handleHistoryClick(player)}
                    variant="outline"
                    size="icon"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredAndSortedPlayers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
            No players found
          </h3>
          <p className="text-slate-500 dark:text-slate-500">
            Try adjusting your filters or check back later for new players.
          </p>
        </div>
      )}

      {/* Modals */}
      {selectedPlayer && (
        <SignModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          player={selectedPlayer}
          teamData={userTeam}
          userTeam={userTeam}
          fetchData={loadFreeAgents}
          fetchPlayerOffers={fetchPlayerOffers}
          currentTeamSalary={teamStats?.current_salary || 0}
          projectedSalary={calculatePotentialStats()?.potentialSalary || teamStats?.current_salary || 0}
          currentSalaryCap={userTeam?.salary_cap || 30000000}
          teamPlayers={[]}
          projectedRosterSize={calculatePotentialStats()?.potentialRosterSize || teamStats?.roster_size || 0}
          onOfferPlaced={loadFreeAgents}
          currentOffer={playerOffers[selectedPlayer.id]}
          salaryCap={userTeam?.salary_cap || 30000000}
          onSubmit={handleSignSubmit}
        />
      )}

      {historyPlayer && (
        <TransferHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          player={historyPlayer}
        />
      )}
    </div>
  )
}