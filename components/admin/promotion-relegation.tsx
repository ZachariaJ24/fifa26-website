"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowUp, ArrowDown, Trophy, AlertTriangle, CheckCircle } from "lucide-react"

interface PromotionRelegationData {
  season_id: number
  changes: Array<{
    type: "promotion" | "relegation"
    team: string
    from: string
    to: string
    reason: string
  }>
  timestamp: string
}

export function PromotionRelegation() {
  const [loading, setLoading] = useState(false)
  const [lastChanges, setLastChanges] = useState<PromotionRelegationData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchLastChanges()
  }, [])

  const fetchLastChanges = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/promotion-relegation")
      
      if (!response.ok) {
        throw new Error("Failed to fetch promotion/relegation data")
      }

      const data = await response.json()
      setLastChanges(data)
    } catch (error) {
      console.error("Error fetching promotion/relegation data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPromotionRelegation = async () => {
    if (!confirm("Are you sure you want to process promotion and relegation? This will move teams between divisions based on their current standings.")) {
      return
    }

    try {
      setIsProcessing(true)
      const response = await fetch("/api/admin/promotion-relegation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to process promotion/relegation")
      }

      const data = await response.json()
      
      toast({
        title: "Success",
        description: data.message,
      })

      // Refresh the last changes data
      fetchLastChanges()
    } catch (error: any) {
      console.error("Error processing promotion/relegation:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getChangeIcon = (type: string) => {
    return type === "promotion" ? (
      <ArrowUp className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-red-600" />
    )
  }

  const getChangeColor = (type: string) => {
    return type === "promotion" 
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Promotion & Relegation System
          </CardTitle>
          <CardDescription>
            Automatically promote and relegate teams based on their standings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>How it works</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• <strong>Premier Division:</strong> Bottom 2 teams relegated to Championship Division</li>
                <li>• <strong>Championship Division:</strong> Top 2 teams promoted to Premier Division, Bottom 2 relegated to League One</li>
                <li>• <strong>League One:</strong> Top 2 teams promoted to Championship Division</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Process Promotion & Relegation</h3>
              <p className="text-sm text-muted-foreground">
                Calculate standings and move teams between divisions
              </p>
            </div>
            <Button 
              onClick={handleProcessPromotionRelegation}
              disabled={isProcessing}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Process Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {lastChanges && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Last Promotion & Relegation
            </CardTitle>
            <CardDescription>
              Changes processed on {new Date(lastChanges.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastChanges.changes.length === 0 ? (
              <p className="text-muted-foreground">No changes were made in the last processing.</p>
            ) : (
              <div className="space-y-3">
                {lastChanges.changes.map((change, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getChangeIcon(change.type)}
                      <div>
                        <div className="font-semibold">{change.team}</div>
                        <div className="text-sm text-muted-foreground">
                          {change.from} → {change.to}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {change.reason}
                        </div>
                      </div>
                    </div>
                    <Badge className={getChangeColor(change.type)}>
                      {change.type === "promotion" ? "Promoted" : "Relegated"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
