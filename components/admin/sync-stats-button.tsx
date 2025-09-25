"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/hooks/use-supabase"
import { RefreshCw } from "lucide-react"

interface SyncStatsButtonProps {
  seasonId: number
  className?: string
}

export function SyncStatsButton({ seasonId, className }: SyncStatsButtonProps) {
  const [syncing, setSyncing] = useState(false)
  const { toast } = useToast()
  const { session } = useSupabase()

  const handleSync = async () => {
    if (!session?.access_token) {
      toast({
        title: "Error",
        description: "You must be logged in to sync statistics",
        variant: "destructive",
      })
      return
    }

    try {
      setSyncing(true)

      const response = await fetch("/api/admin/sync-all-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ seasonId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync statistics")
      }

      if (data.success) {
        toast({
          title: "Success",
          description: "All statistics have been synced successfully",
        })
      } else {
        toast({
          title: "Partial Success",
          description: "Some statistics were synced, but some failed. Check the details.",
          variant: "destructive",
        })
      }

      // Log detailed results
      console.log("Sync results:", data.results)

    } catch (error: any) {
      console.error("Error syncing stats:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to sync statistics",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Button
      onClick={handleSync}
      disabled={syncing}
      className={className}
      variant="outline"
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Syncing..." : "Sync All Stats"}
    </Button>
  )
}