"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { MessageSquare, Loader2, AlertTriangle } from "lucide-react"
import { useSupabase } from "@/lib/supabase/client"

interface DiscordConnectButtonProps {
  userId: string
  source?: "register" | "settings"
  className?: string
  onSuccess?: (discordId: string, discordUsername: string) => void
}

export default function DiscordConnectButton({
  userId,
  source = "settings",
  className,
  onSuccess,
}: DiscordConnectButtonProps) {
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { supabase } = useSupabase()

  const updateUserDiscordInfo = async (discordId: string, discordUsername: string) => {
    try {
      // TODO: Update user Discord info in database
      // This requires the users table to have discord_id and discord_username columns
      console.log("Discord info received:", { discordId, discordUsername, userId })
      
      // For now, just show success message
      toast({
        title: "Discord Connected!",
        description: `Successfully connected to Discord as ${discordUsername}`,
      })
    } catch (error) {
      console.error("Error updating Discord info:", error)
    }
  }

  const connectDiscord = async () => {
    try {
      console.log("DiscordConnectButton clicked", { userId, source, connecting })
      setConnecting(true)
      setError(null)

      // Use popup for both registration and settings flows
      const finalUserId = source === "register" ? "registration" : userId
      const state = source === "register" ? "register" : `${userId}:${source}`


      // Store the source in localStorage so we can handle the callback properly
      localStorage.setItem("discord_connect_source", source)
      localStorage.setItem("discord_connect_user_id", userId)

      const authUrl = `/api/auth/discord?user_id=${finalUserId}&state=${state}`
      console.log("Redirecting to Discord OAuth:", authUrl)

      // Redirect to Discord OAuth in the same window
      window.location.href = authUrl
    } catch (error: any) {
      console.error("Error connecting Discord:", error)
      setError(error.message || "Failed to connect to Discord")
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to Discord. Please try again.",
        variant: "destructive",
      })
      setConnecting(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
        <Button
          type="button"
          onClick={() => {
            setError(null)
            connectDiscord()
          }}
          className={`${className} fifa-button-enhanced cursor-pointer w-full`}
        >
          <MessageSquare className="mr-2 h-4 w-4 text-white" />
          <span className="text-white font-semibold">Try Again</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Button 
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log("Button clicked!", { userId, source, connecting })
          connectDiscord()
        }} 
        disabled={connecting} 
        className={`${className} fifa-button-enhanced cursor-pointer w-full`}
        style={{ pointerEvents: 'auto', zIndex: 10 }}
      >
        {connecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
            <span className="text-white font-semibold">Connecting...</span>
          </>
        ) : (
          <>
            <MessageSquare className="mr-2 h-4 w-4 text-white" />
            <span className="text-white font-semibold">Connect Discord</span>
          </>
        )}
      </Button>
    </div>
  )
}
