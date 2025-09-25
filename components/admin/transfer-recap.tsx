"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, RefreshCw, DollarSign, Users, Trophy, Download, UserCheck, Target, Award, Medal, Star, Shield, Database, Settings, Zap, TrendingUp, Activity, BarChart3, CheckCircle, XCircle, AlertTriangle, Clock, GamepadIcon, Shield as GoalieMask } from "lucide-react"
import { TeamLogo } from "@/components/team-logo"
import { useToast } from "@/hooks/use-toast"

interface TransferData {
  id: string
  transfer_amount: number
  created_at: string
  team: {
    id: string
    name: string
    logo_url: string | null
  }
}

interface SignedPlayer {
  id: string
  gamer_tag_id: string
  primary_position: string
  secondary_position: string | null
  signingAmount: number
}

interface RosterPlayer {
  id: string
  gamer_tag_id: string
  primary_position: string
  secondary_position: string | null
  salary: number
}

interface PositionCounts {
  "Left Wing": number
  "Right Wing": number
  Center: number
  "Left Defense": number
  "Right Defense": number
  Goalie: number
}

interface PlayerTransfer {
  player: {
    id: string
    gamer_tag_id: string
    primary_position: string
    secondary_position: string | null
  }
  transfers: TransferData[]
  highestTransfer: number
  totalTransfers: number
  winningTeam: {
    id: string
    name: string
    logo_url: string | null
  } | null
}

interface TeamStat {
  team: {
    id: string
    name: string
    logo_url: string | null
  }
  totalTransfers: number
  uniquePlayersCount: number
  currentSalary: number
  currentRoster: RosterPlayer[]
  positionCounts: PositionCounts
  signedPlayers: SignedPlayer[]
  transfers: TransferData[]
}

interface TransferRecapData {
  teamStats: TeamStat[]
  playerTransfers: PlayerTransfer[]
  totalTransfers: number
  totalPlayers: number
  totalTeams: number
}

export function TransferRecap() {
  const [data, setData] = useState<TransferRecapData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchTransferRecap = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/transfers/recap")
      if (!response.ok) {
        throw new Error("Failed to fetch transfer recap")
      }

      const recapData = await response.json()
      setData(recapData)

      // Save the recap data for public viewing
      try {
        const saveResponse = await fetch("/api/transfers/recap/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(recapData),
        })

        if (saveResponse.ok) {
          toast({
            title: "Success",
            description: "Transfer recap generated and saved for public viewing!",
          })
        } else {
          const errorData = await saveResponse.json()
          console.error("Save error details:", errorData)
          toast({
            title: "Partial Success",
            description: `Recap generated but save failed: ${errorData.details || errorData.error || "Unknown error"}`,
            variant: "destructive",
          })
        }
      } catch (saveError) {
        console.error("Failed to save public recap:", saveError)
        toast({
          title: "Partial Success",
          description: `Recap generated but save failed: ${saveError instanceof Error ? saveError.message : "Network error"}`,
          variant: "destructive",
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      toast({
        title: "Error",
        description: "Failed to generate transfer recap.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPositionAbbreviation = (position: string) => {
    const abbrevs: { [key: string]: string } = {
      "Left Wing": "LW",
      "Right Wing": "RW",
      Center: "C",
      "Left Defense": "LD",
      "Right Defense": "RD",
      Goalie: "G",
    }
    return abbrevs[position] || position
  }

  const downloadCSV = () => {
    if (!data) return

    let csvContent = "SCS Transfer Recap\n\n"

    // Summary
    csvContent += "SUMMARY\n"
    csvContent += `Total Transfers,${data.totalTransfers}\n`
    csvContent += `Players Transferred,${data.totalPlayers}\n`
    csvContent += `Teams Participating,${data.totalTeams}\n`
    csvContent += `Total League Salary,${formatCurrency(data.teamStats.reduce((sum, team) => sum + team.currentSalary, 0))}\n\n`

    // Team Statistics with Signed Players
    csvContent += "TEAM STATISTICS\n"
    csvContent += "Rank,Team,Total Transfers,Players Transferred,Signed Players,Current Salary,Cap Space Remaining\n"
    data.teamStats.forEach((team, index) => {
      const capSpaceRemaining = 30000000 - team.currentSalary
      csvContent += `${index + 1},${team.team.name},${team.totalTransfers},${team.uniquePlayersCount},${team.signedPlayers.length},${formatCurrency(team.currentSalary)},${formatCurrency(capSpaceRemaining)}\n`
    })

    // Signed Players by Team
    csvContent += "\nSIGNED PLAYERS BY TEAM\n"
    data.teamStats.forEach((team) => {
      if (team.signedPlayers.length > 0) {
        csvContent += `\n${team.team.name} Signed Players:\n`
        csvContent += "Player,Position,Signing Amount\n"
        team.signedPlayers.forEach((player) => {
          csvContent += `${player.gamer_tag_id},${player.primary_position},${formatCurrency(player.signingAmount)}\n`
        })
      }
    })

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `SCS_Transfer_Recap_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-ice-blue-500 to-rink-blue-600 rounded-xl shadow-lg">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-hockey-silver-800 dark:text-hockey-silver-200">Transfer Recap</h2>
            <p className="text-hockey-silver-600 dark:text-hockey-silver-400 text-lg">Comprehensive overview of all transfer activity</p>
          </div>
        </div>
        <div className="flex gap-3">
          {data && (
            <Button 
              onClick={downloadCSV} 
              className="hockey-button bg-gradient-to-r from-hockey-silver-500 to-hockey-silver-600 hover:from-hockey-silver-600 hover:to-hockey-silver-700 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          )}
          <Button 
            onClick={fetchTransferRecap} 
            disabled={loading}
            className="hockey-button bg-gradient-to-r from-ice-blue-500 to-rink-blue-600 hover:from-ice-blue-600 hover:to-rink-blue-700 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Generate Recap
          </Button>
        </div>
      </div>

      {error && (
        <Card className="hockey-card border-2 border-goal-red-200/50 dark:border-goal-red-700/50 bg-gradient-to-r from-goal-red-50/50 to-goal-red-100/50 dark:from-goal-red-900/20 dark:to-goal-red-800/20 shadow-2xl shadow-goal-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-goal-red-500 to-goal-red-600 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <p className="text-goal-red-700 dark:text-goal-red-300 font-medium">Error: {error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <div className="space-y-6">
          {/* Enhanced Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="hockey-card hockey-card-hover border-ice-blue-200/50 dark:border-rink-blue-700/50 bg-gradient-to-br from-white to-ice-blue-50/50 dark:from-hockey-silver-900 dark:to-rink-blue-900/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-ice-blue-500 to-ice-blue-600 rounded-lg">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-ice-blue-700 dark:text-ice-blue-300">{data.totalTransfers}</p>
                    <p className="text-sm text-hockey-silver-600 dark:text-hockey-silver-400 font-medium">Total Transfers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hockey-card hockey-card-hover border-assist-green-200/50 dark:border-assist-green-700/50 bg-gradient-to-br from-white to-assist-green-50/50 dark:from-hockey-silver-900 dark:to-assist-green-900/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-assist-green-500 to-assist-green-600 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-assist-green-700 dark:text-assist-green-300">{data.totalPlayers}</p>
                    <p className="text-sm text-hockey-silver-600 dark:text-hockey-silver-400 font-medium">Players Transferred</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hockey-card hockey-card-hover border-rink-blue-200/50 dark:border-rink-blue-700/50 bg-gradient-to-br from-white to-rink-blue-50/50 dark:from-hockey-silver-900 dark:to-rink-blue-900/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-rink-blue-500 to-rink-blue-600 rounded-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-rink-blue-700 dark:text-rink-blue-300">{data.totalTeams}</p>
                    <p className="text-sm text-hockey-silver-600 dark:text-hockey-silver-400 font-medium">Teams Participating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hockey-card hockey-card-hover border-goal-red-200/50 dark:border-goal-red-700/50 bg-gradient-to-br from-white to-goal-red-50/50 dark:from-hockey-silver-900 dark:to-goal-red-900/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-goal-red-500 to-goal-red-600 rounded-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-goal-red-700 dark:text-goal-red-300">
                      {formatCurrency(data.teamStats.reduce((sum, team) => sum + team.currentSalary, 0))}
                    </p>
                    <p className="text-sm text-hockey-silver-600 dark:text-hockey-silver-400 font-medium">Total League Salary</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Team Statistics with Signed Players and Roster */}
          <Card className="hockey-card hockey-card-hover border-ice-blue-200/50 dark:border-rink-blue-700/50 bg-gradient-to-br from-white to-ice-blue-50/50 dark:from-hockey-silver-900 dark:to-rink-blue-900/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b-2 border-ice-blue-200/50 dark:border-rink-blue-700/50 pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-hockey-silver-800 dark:text-hockey-silver-200">
                <div className="p-2 bg-gradient-to-r from-ice-blue-500 to-rink-blue-600 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                Team Transfer Statistics & Rosters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.teamStats.map((teamStat, index) => {
                  const capSpaceRemaining = 30000000 - teamStat.currentSalary
                  const totalRosterSize = teamStat.currentRoster.length

                  return (
                    <div key={teamStat.team.id} className="hockey-card border-ice-blue-200/50 dark:border-rink-blue-700/50 bg-gradient-to-br from-white to-ice-blue-50/50 dark:from-hockey-silver-900 dark:to-rink-blue-900/20 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
                      {/* Enhanced Team Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-gradient-to-r from-hockey-silver-500 to-hockey-silver-600 rounded-lg text-white font-bold text-lg min-w-[3rem] text-center">
                            #{index + 1}
                          </div>
                          <div className="w-12 h-12">
                            <TeamLogo
                              teamId={teamStat.team.id}
                              teamName={teamStat.team.name}
                              logoUrl={teamStat.team.logo_url}
                              size="md"
                            />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-hockey-silver-800 dark:text-hockey-silver-200">{teamStat.team.name}</h3>
                            <p className="text-sm text-hockey-silver-600 dark:text-hockey-silver-400">
                              {totalRosterSize} players • {formatCurrency(teamStat.currentSalary)} salary
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-assist-green-600 dark:text-assist-green-400">{formatCurrency(capSpaceRemaining)}</p>
                          <p className="text-sm text-hockey-silver-600 dark:text-hockey-silver-400">Cap Space Remaining</p>
                        </div>
                      </div>

                      {/* Enhanced Transfer Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-gradient-to-br from-ice-blue-100 to-ice-blue-200 dark:from-ice-blue-900/30 dark:to-ice-blue-800/20 rounded-lg border border-ice-blue-200/50 dark:border-ice-blue-700/50">
                          <p className="text-lg font-semibold text-ice-blue-700 dark:text-ice-blue-300">{teamStat.totalTransfers}</p>
                          <p className="text-xs text-hockey-silver-600 dark:text-hockey-silver-400">Total Transfers</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-rink-blue-100 to-rink-blue-200 dark:from-rink-blue-900/30 dark:to-rink-blue-800/20 rounded-lg border border-rink-blue-200/50 dark:border-rink-blue-700/50">
                          <p className="text-lg font-semibold text-rink-blue-700 dark:text-rink-blue-300">{teamStat.uniquePlayersCount}</p>
                          <p className="text-xs text-hockey-silver-600 dark:text-hockey-silver-400">Players Transferred</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-assist-green-100 to-assist-green-200 dark:from-assist-green-900/30 dark:to-assist-green-800/20 rounded-lg border border-assist-green-200/50 dark:border-assist-green-700/50">
                          <p className="text-lg font-semibold text-assist-green-600 dark:text-assist-green-400">{teamStat.signedPlayers.length}</p>
                          <p className="text-xs text-hockey-silver-600 dark:text-hockey-silver-400">Signed Players</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-goal-red-100 to-goal-red-200 dark:from-goal-red-900/30 dark:to-goal-red-800/20 rounded-lg border border-goal-red-200/50 dark:border-goal-red-700/50">
                          <p className="text-lg font-semibold text-goal-red-600 dark:text-goal-red-400">{totalRosterSize}</p>
                          <p className="text-xs text-hockey-silver-600 dark:text-hockey-silver-400">Current Roster</p>
                        </div>
                      </div>

                      {/* Enhanced Signed Players */}
                      {teamStat.signedPlayers.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1 bg-gradient-to-r from-assist-green-500 to-assist-green-600 rounded-lg">
                              <UserCheck className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="font-medium text-hockey-silver-800 dark:text-hockey-silver-200">Signed Players ({teamStat.signedPlayers.length})</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {teamStat.signedPlayers.map((player) => (
                              <div
                                key={player.id}
                                className="flex items-center justify-between p-3 bg-gradient-to-br from-assist-green-100 to-assist-green-200 dark:from-assist-green-900/20 dark:to-assist-green-800/20 border border-assist-green-200/50 dark:border-assist-green-700/50 rounded-lg text-sm hover:scale-105 transition-transform duration-200"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="p-1 bg-gradient-to-r from-assist-green-500/20 to-assist-green-500/20 rounded">
                                    <GamepadIcon className="h-3 w-3 text-assist-green-600 dark:text-assist-green-400" />
                                  </div>
                                  <span className="font-medium text-hockey-silver-800 dark:text-hockey-silver-200">{player.gamer_tag_id}</span>
                                  <Badge variant="outline" className="text-xs border-assist-green-300 dark:border-assist-green-600 text-assist-green-700 dark:text-assist-green-300">
                                    {getPositionAbbreviation(player.primary_position)}
                                  </Badge>
                                </div>
                                <span className="font-semibold text-assist-green-600 dark:text-assist-green-400">
                                  {formatCurrency(player.signingAmount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enhanced Current Roster Preview */}
                      {teamStat.currentRoster.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1 bg-gradient-to-r from-rink-blue-500 to-rink-blue-600 rounded-lg">
                              <Target className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="font-medium text-hockey-silver-800 dark:text-hockey-silver-200">Current Roster ({teamStat.currentRoster.length})</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                            {teamStat.currentRoster.map((player) => (
                              <div
                                key={player.id}
                                className="flex items-center justify-between p-3 bg-gradient-to-br from-rink-blue-100 to-rink-blue-200 dark:from-rink-blue-900/20 dark:to-rink-blue-800/20 border border-rink-blue-200/50 dark:border-rink-blue-700/50 rounded-lg text-sm hover:scale-105 transition-transform duration-200"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="p-1 bg-gradient-to-r from-rink-blue-500/20 to-rink-blue-500/20 rounded">
                                    <GoalieMask className="h-3 w-3 text-rink-blue-600 dark:text-rink-blue-400" />
                                  </div>
                                  <span className="font-medium text-hockey-silver-800 dark:text-hockey-silver-200">{player.gamer_tag_id}</span>
                                  <Badge variant="outline" className="text-xs border-rink-blue-300 dark:border-rink-blue-600 text-rink-blue-700 dark:text-rink-blue-300">
                                    {getPositionAbbreviation(player.primary_position)}
                                  </Badge>
                                </div>
                                <span className="font-semibold text-rink-blue-600 dark:text-rink-blue-400">{formatCurrency(player.salary)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Player Transfer History */}
          <Card className="hockey-card hockey-card-hover border-ice-blue-200/50 dark:border-rink-blue-700/50 bg-gradient-to-br from-white to-ice-blue-50/50 dark:from-hockey-silver-900 dark:to-rink-blue-900/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b-2 border-ice-blue-200/50 dark:border-rink-blue-700/50 pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-hockey-silver-800 dark:text-hockey-silver-200">
                <div className="p-2 bg-gradient-to-r from-goal-red-500 to-goal-red-600 rounded-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                Player Transfer History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.playerTransfers.map((playerTransfer) => (
                  <div key={playerTransfer.player.id} className="hockey-card border-ice-blue-200/50 dark:border-rink-blue-700/50 bg-gradient-to-br from-white to-ice-blue-50/50 dark:from-hockey-silver-900 dark:to-rink-blue-900/20 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-ice-blue-500/20 to-rink-blue-500/20 rounded-lg">
                          <GamepadIcon className="h-5 w-5 text-ice-blue-600 dark:text-ice-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-hockey-silver-800 dark:text-hockey-silver-200">{playerTransfer.player.gamer_tag_id}</h3>
                          <p className="text-sm text-hockey-silver-600 dark:text-hockey-silver-400">
                            {playerTransfer.player.primary_position}
                            {playerTransfer.player.secondary_position && ` / ${playerTransfer.player.secondary_position}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-assist-green-600 dark:text-assist-green-400">{formatCurrency(playerTransfer.highestTransfer)}</p>
                        <p className="text-sm text-hockey-silver-600 dark:text-hockey-silver-400">Highest Transfer • {playerTransfer.totalTransfers} total transfers</p>
                        {playerTransfer.winningTeam && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-5 h-5">
                              <TeamLogo
                                teamId={playerTransfer.winningTeam.id}
                                teamName={playerTransfer.winningTeam.name}
                                logoUrl={playerTransfer.winningTeam.logo_url}
                                size="xs"
                              />
                            </div>
                            <Badge className="bg-gradient-to-r from-assist-green-500 to-assist-green-600 text-white border-0 text-xs">
                              Won by {playerTransfer.winningTeam.name}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4 bg-ice-blue-200/50 dark:bg-rink-blue-700/50" />

                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-hockey-silver-600 dark:text-hockey-silver-400 mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Transfer History
                      </h4>
                      {playerTransfer.transfers.map((transfer, transferIndex) => (
                        <div key={transfer.id} className="flex items-center justify-between py-3 px-4 bg-gradient-to-br from-hockey-silver-100 to-hockey-silver-200 dark:from-hockey-silver-900/30 dark:to-hockey-silver-800/20 rounded-lg border border-hockey-silver-200/50 dark:border-hockey-silver-700/50 hover:scale-105 transition-transform duration-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6">
                              <TeamLogo
                                teamId={transfer.team.id}
                                teamName={transfer.team.name}
                                logoUrl={transfer.team.logo_url}
                                size="xs"
                              />
                            </div>
                            <span className="font-medium text-hockey-silver-800 dark:text-hockey-silver-200">{transfer.team.name}</span>
                            {transferIndex === 0 && (
                              <Badge className="bg-gradient-to-r from-assist-green-500 to-assist-green-600 text-white border-0 text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Winner
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-semibold text-hockey-silver-800 dark:text-hockey-silver-200">{formatCurrency(transfer.transfer_amount)}</span>
                            <span className="text-xs text-hockey-silver-600 dark:text-hockey-silver-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(transfer.created_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
