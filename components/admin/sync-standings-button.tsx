"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Database, CheckCircle, XCircle } from "lucide-react"

interface SyncResult {
  team: string
  success: boolean
  error?: string
  stats?: {
    wins: number
    losses: number
    otl: number
    points: number
    goalsFor: number
    goalsAgainst: number
    gamesPlayed: number
  }
}

interface SyncResponse {
  success: boolean
  message: string
  season: string
  teamsUpdated: number
  teamsFailed: number
  totalMatches: number
  results: SyncResult[]
}

export function SyncStandingsButton() {
  const [loading, setLoading] = useState(false)
  const [lastSync, setLastSync] = useState<SyncResponse | null>(null)
  const { toast } = useToast()

  const handleSync = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/admin/sync-standings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data: SyncResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync standings")
      }

      setLastSync(data)

      toast({
        title: "Standings Synced",
        description: `Successfully updated ${data.teamsUpdated} teams`,
      })
    } catch (error: any) {
      console.error("Error syncing standings:", error)
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync standings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sync Database Standings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sync the stored team statistics in the database with the calculated standings from matches.
          This ensures the database matches what the unified calculator shows.
        </p>
        
        <Button 
          onClick={handleSync} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Standings
            </>
          )}
        </Button>

        {lastSync && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={lastSync.teamsFailed === 0 ? "default" : "destructive"}>
                {lastSync.teamsUpdated} Updated
              </Badge>
              {lastSync.teamsFailed > 0 && (
                <Badge variant="destructive">
                  {lastSync.teamsFailed} Failed
                </Badge>
              )}
              <Badge variant="outline">
                {lastSync.totalMatches} Matches
              </Badge>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Season:</strong> {lastSync.season}</p>
              <p><strong>Message:</strong> {lastSync.message}</p>
            </div>

            {lastSync.results.length > 0 && (
              <div className="max-h-40 overflow-y-auto">
                <h4 className="font-medium mb-2">Team Results:</h4>
                <div className="space-y-1">
                  {lastSync.results.map((result, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {result.success ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-600" />
                      )}
                      <span className="font-medium">{result.team}</span>
                      {result.success && result.stats && (
                        <span className="text-gray-500">
                          ({result.stats.wins}-{result.stats.losses}-{result.stats.otl}, {result.stats.points} pts)
                        </span>
                      )}
                      {result.error && (
                        <span className="text-red-600">{result.error}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
