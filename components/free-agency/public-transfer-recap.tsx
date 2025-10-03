"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Trophy, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Target,
  Award,
  Activity,
  BarChart3
} from "lucide-react"

interface TransferRecapData {
  recentOffers: any[]
  completedTransfers: any[]
  teamStats: any[]
  totalOffers: number
  totalPlayers: number
  totalTeams: number
}

export function PublicTransferRecap() {
  const [data, setData] = useState<TransferRecapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTransferRecap()
  }, [])

  const fetchTransferRecap = async () => {
    try {
      const response = await fetch("/api/transfer-recap")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching transfer recap:", error)
      setError(error instanceof Error ? error.message : "Failed to load transfer recap")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-md mx-auto">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">No transfer data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="fifa-card-hover-enhanced bg-gradient-to-r from-field-green-50 to-pitch-blue-50 dark:from-field-green-900/30 dark:to-pitch-blue-900/30 border border-field-green-200 dark:border-field-green-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-field-green-600" />
              Total Offers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-200">
              {data.totalOffers.toLocaleString()}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Transfer offers placed
            </p>
          </CardContent>
        </Card>

        <Card className="fifa-card-hover-enhanced bg-gradient-to-r from-stadium-gold-50 to-goal-orange-50 dark:from-stadium-gold-900/30 dark:to-goal-orange-900/30 border border-stadium-gold-200 dark:border-stadium-gold-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-field-green-800 dark:text-field-green-200 flex items-center gap-2">
              <Users className="h-5 w-5 text-stadium-gold-600 dark:text-stadium-gold-400" />
              Players Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-field-green-800 dark:text-field-green-200">
              {data.totalPlayers.toLocaleString()}
            </div>
            <p className="text-sm text-field-green-600 dark:text-field-green-400 mt-1">
              Free agents in market
            </p>
          </CardContent>
        </Card>

        <Card className="fifa-card-hover-enhanced bg-gradient-to-r from-pitch-blue-50 to-assist-white-50 dark:from-pitch-blue-900/30 dark:to-assist-white-900/30 border border-pitch-blue-200 dark:border-pitch-blue-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-field-green-800 dark:text-field-green-200 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-pitch-blue-600 dark:text-pitch-blue-400" />
              Active Clubs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-field-green-800 dark:text-field-green-200">
              {data.totalTeams.toLocaleString()}
            </div>
            <p className="text-sm text-field-green-600 dark:text-field-green-400 mt-1">
              Clubs in transfer market
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transfer Activity */}
      <Card className="fifa-card-hover-enhanced bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-field-green-200 dark:border-field-green-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-field-green-50 to-pitch-blue-50 dark:from-field-green-900/30 dark:to-pitch-blue-900/30 border-b border-field-green-200 dark:border-field-green-700">
          <CardTitle className="text-xl text-field-green-800 dark:text-field-green-200 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            Recent Transfer Activity
          </CardTitle>
          <CardDescription className="text-field-green-600 dark:text-field-green-400">
            Latest transfer offers and completed signings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {data.recentOffers.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-field-green-400 dark:text-field-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-field-green-600 dark:text-field-green-400 mb-2">
                No Recent Activity
              </h3>
              <p className="text-field-green-500 dark:text-field-green-500">
                No transfer offers have been placed recently.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentOffers.slice(0, 10).map((offer, index) => (
                <div
                  key={offer.id || index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-field-green-50 to-pitch-blue-50 dark:from-field-green-900/20 dark:to-pitch-blue-900/20 rounded-lg border border-field-green-200 dark:border-field-green-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {offer.teams?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <div className="font-semibold text-field-green-800 dark:text-field-green-200">
                        {offer.teams?.name || "Unknown Team"}
                      </div>
                      <div className="text-sm text-field-green-600 dark:text-field-green-400">
                        Offer for {offer.player_name || "Unknown Player"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-field-green-800 dark:text-field-green-200">
                      ${offer.offer_amount?.toLocaleString() || "0"}
                    </div>
                    <div className="text-xs text-field-green-500 dark:text-field-green-400">
                      {offer.created_at ? new Date(offer.created_at).toLocaleDateString() : "Unknown date"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Transfers */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-stadium-gold-50 to-goal-orange-50 dark:from-stadium-gold-900/30 dark:to-goal-orange-900/30 border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-stadium-gold-500 to-goal-orange-600 rounded-lg">
              <Award className="h-5 w-5 text-white" />
            </div>
            Completed Transfers
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Recently completed player signings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {data.completedTransfers.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                No Completed Transfers
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                No transfers have been completed recently.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.completedTransfers.slice(0, 10).map((transfer, index) => (
                <div
                  key={transfer.id || index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-stadium-gold-50 to-goal-orange-50 dark:from-stadium-gold-900/20 dark:to-goal-orange-900/20 rounded-lg border border-stadium-gold-200 dark:border-stadium-gold-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-stadium-gold-500 to-goal-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {transfer.teams?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {transfer.teams?.name || "Unknown Team"}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Signed {transfer.player_name || "Unknown Player"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      ${transfer.salary?.toLocaleString() || "0"}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {transfer.completed_at ? new Date(transfer.completed_at).toLocaleDateString() : "Unknown date"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Statistics */}
      {data.teamStats.length > 0 && (
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-pitch-blue-50 to-assist-white-50 dark:from-pitch-blue-900/30 dark:to-assist-white-900/30 border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-pitch-blue-500 to-assist-white-600 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              Club Transfer Statistics
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Transfer activity by club
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.teamStats.slice(0, 9).map((team, index) => (
                <div
                  key={team.id || index}
                  className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-pitch-blue-500 to-assist-white-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {team.name?.charAt(0) || "?"}
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {team.name || "Unknown Team"}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Offers:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {team.offers_count || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Signings:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {team.signings_count || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Spent:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        ${(team.total_spent || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}