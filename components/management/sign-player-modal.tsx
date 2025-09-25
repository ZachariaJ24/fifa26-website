"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import { DollarSign, Users, Trophy, Clock } from "lucide-react"

interface SignPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  player: any
  teamData?: any
  userTeam?: any
  fetchData?: () => void
  fetchPlayerOffers?: () => void
  currentTeamSalary?: number
  projectedSalary?: number
  currentSalaryCap?: number
  teamPlayers?: any[]
  projectedRosterSize?: number
  onOfferPlaced?: () => void
  currentOffer?: any
  salaryCap?: number
  onSubmit?: (amount: number) => void
}

export function SignPlayerModal({
  isOpen,
  onClose,
  player,
  teamData,
  userTeam,
  fetchData,
  fetchPlayerOffers,
  currentTeamSalary = 0,
  projectedSalary = 0,
  currentSalaryCap = 30000000,
  teamPlayers = [],
  projectedRosterSize = 0,
  onOfferPlaced,
  currentOffer,
  salaryCap = 30000000,
  onSubmit,
}: SignPlayerModalProps) {
  const [offerAmount, setOfferAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { supabase, session } = useSupabase()

  const team = userTeam || teamData

  // Set initial offer amount when modal opens
  useEffect(() => {
    if (isOpen && player) {
      // Set minimum offer amount
      const currentOfferAmount = currentOffer?.offer_amount || 0
      const playerSalary = player.salary || 2000000
      const minimumOffer = Math.max(currentOfferAmount + 2000000, playerSalary)
      setOfferAmount(minimumOffer.toString())
      setError(null)
    } else {
      setOfferAmount("")
      setError(null)
    }
  }, [isOpen, player, currentOffer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user) {
      setError("You must be logged in to make a transfer offer")
      return
    }

    const amount = Number.parseInt(offerAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid offer amount")
      return
    }

    // Validate minimum offer
    const currentOfferAmount = currentOffer?.offer_amount || 0
    const playerSalary = player.salary || 2000000
    const minimumOffer = Math.max(currentOfferAmount + 2000000, playerSalary)

    if (amount < minimumOffer) {
      setError(`Minimum offer is $${minimumOffer.toLocaleString()}`)
      return
    }

    // Check salary cap
    const availableCapSpace = salaryCap - projectedSalary
    if (amount > availableCapSpace) {
      setError(`This offer would exceed your salary cap. Available space: $${availableCapSpace.toLocaleString()}`)
      return
    }

    if (!team) {
      setError("No team found")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      console.log("Submitting transfer offer:", {
        playerId: player.id,
        teamId: team.id,
        offerAmount: amount,
        playerName: player.users?.gamer_tag_id,
        teamName: team.name,
      })

      // Check if transfer offers are enabled
      const { data: transferSettings, error: settingsError } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "transfer_offers_enabled")
        .single()

      if (settingsError) {
        console.error("Error checking transfer status:", settingsError)
      }

      if (transferSettings && transferSettings.value !== true) {
        setError("Transfer offers are currently disabled by league administrators")
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
      const expirationTime = new Date(Date.now() + offerDurationSeconds * 1000).toISOString()

      // Insert the offer directly using Supabase client
      const { data: offerData, error: offerError } = await supabase
        .from("player_transfer_offers")
        .insert({
          player_id: player.id,
          team_id: team.id,
          offer_amount: amount,
          offer_expires_at: expirationTime,
        })
        .select()

      if (offerError) {
        console.error("Error inserting offer:", offerError)
        throw new Error(offerError.message || "Failed to place transfer offer")
      }

      console.log("Transfer offer inserted successfully:", offerData)

      // Send notification to the player
      const { error: notificationError } = await supabase.from("notifications").insert({
        user_id: player.user_id,
        title: "New Transfer Offer Received",
        message: `${team.name} has made a transfer offer of $${amount.toLocaleString()} for you.`,
        link: "/free-agency",
      })

      if (notificationError) {
        console.error("Error sending notification:", notificationError)
        // Don't fail the offer if notification fails
      }

      // If there was a previous highest offerer and it's not the current team, notify them
      if (currentOffer && currentOffer.team_id !== team.id) {
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
            message: `Your offer on ${player.users?.gamer_tag_id || "a player"} has been outbid by ${team.name} with $${amount.toLocaleString()}.`,
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
        description: `Your offer of $${amount.toLocaleString()} has been placed for ${player.users?.gamer_tag_id || "the player"}.`,
      })

      // Call the callback functions to refresh data
      if (onOfferPlaced) {
        onOfferPlaced()
      }
      if (fetchData) {
        fetchData()
      }
      if (fetchPlayerOffers) {
        fetchPlayerOffers()
      }

      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(amount)
      }

      onClose()
    } catch (error: any) {
      console.error("Error placing transfer offer:", error)
      setError(error.message || "Failed to place transfer offer")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentOfferAmount = currentOffer?.offer_amount || 0
  const playerSalary = player.salary || 2000000
  const minimumOffer = Math.max(currentOfferAmount + 2000000, playerSalary)
  const isExtendingOffer = currentOffer && currentOffer.team_id === team?.id

  if (!player) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-field-green-600" />
            {isExtendingOffer ? "Extend Transfer Offer" : "Make Transfer Offer"} - {player.users?.gamer_tag_id || "Unknown Player"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Player Info */}
          <div className="p-4 bg-gradient-to-r from-field-green-50 to-pitch-blue-50 dark:from-field-green-900/30 dark:to-pitch-blue-900/30 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {player.users?.gamer_tag_id?.charAt(0) || "?"}
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                  {player.users?.gamer_tag_id || "Unknown Player"}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {player.users?.primary_position || "Unknown Position"} • Overall: {player.overall_rating || "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600 dark:text-slate-400">Current Salary:</span>
                <span className="ml-2 font-semibold text-slate-800 dark:text-slate-200">
                  ${playerSalary.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Position:</span>
                <span className="ml-2 font-semibold text-slate-800 dark:text-slate-200">
                  {player.users?.primary_position || "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Current Offer Info */}
          {currentOffer && (
            <div className="p-4 bg-pitch-blue-50 dark:bg-pitch-blue-900/20 rounded-lg border border-pitch-blue-200 dark:border-pitch-blue-700">
              <h4 className="font-medium text-pitch-blue-900 dark:text-pitch-blue-100 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Current Highest Offer
              </h4>
              <p className="text-sm text-pitch-blue-700 dark:text-pitch-blue-300">
                ${currentOffer.offer_amount.toLocaleString()} by {currentOffer.teams?.name || "Unknown Team"}
              </p>
              {isExtendingOffer && (
                <p className="text-sm text-pitch-blue-600 dark:text-pitch-blue-400 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  You are extending your existing offer
                </p>
              )}
            </div>
          )}

          {/* Team Cap Info */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {team?.name} - Salary Cap
            </h4>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Current Salary:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ${currentTeamSalary.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Projected Salary:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ${projectedSalary.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Salary Cap:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ${salaryCap.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1">
                <span className="text-slate-600 dark:text-slate-400">Available Space:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ${(salaryCap - projectedSalary).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Offer Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="offerAmount">Transfer Offer Amount</Label>
              <Input
                id="offerAmount"
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                min={minimumOffer}
                step="2000000"
                placeholder={`Minimum: $${minimumOffer.toLocaleString()}`}
                disabled={isSubmitting}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Minimum offer: ${minimumOffer.toLocaleString()} (increments of $2,000,000)
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !team} className="flex-1 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 hover:from-field-green-600 hover:to-pitch-blue-700 text-white">
                {isSubmitting ? "Placing Offer..." : isExtendingOffer ? "Extend Offer" : "Make Offer"}
              </Button>
            </div>
          </form>

          {!session?.user && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                You must be logged in to make transfer offers. Please refresh the page and try again.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}