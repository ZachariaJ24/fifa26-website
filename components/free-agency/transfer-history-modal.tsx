"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Clock, DollarSign, Users, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface TransferHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  player: any
}

export function TransferHistoryModal({ isOpen, onClose, player }: TransferHistoryModalProps) {
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && player?.id) {
      loadTransferHistory()
    }
  }, [isOpen, player?.id])

  const loadTransferHistory = async () => {
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("player_transfer_offers")
        .select(`
          id,
          offer_amount,
          created_at,
          offer_expires_at,
          teams (
            id,
            name,
            logo_url
          )
        `)
        .eq("player_id", player.id)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setOffers(data || [])
    } catch (error: any) {
      toast({
        title: "Error loading transfer history",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!player) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-field-green-600" />
            Transfer History - {player.users?.gamer_tag_id || "Unknown Player"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                No Transfer Offers
              </h3>
              <p className="text-slate-500 dark:text-slate-500">
                This player hasn't received any transfer offers yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {offers.map((offer, index) => {
                const isExpired = new Date(offer.offer_expires_at) < new Date()
                const isHighest = index === 0 // Assuming they're sorted by amount descending
                
                return (
                  <div
                    key={offer.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      isHighest
                        ? "bg-gradient-to-r from-field-green-50 to-pitch-blue-50 dark:from-field-green-900/30 dark:to-pitch-blue-900/30 border-field-green-200 dark:border-field-green-700"
                        : isExpired
                        ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {offer.teams?.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                              {offer.teams?.name || "Unknown Team"}
                            </h4>
                            {isHighest && (
                              <Badge className="bg-gradient-to-r from-field-green-500 to-pitch-blue-600 text-white text-xs">
                                Highest
                              </Badge>
                            )}
                            {isExpired && (
                              <Badge variant="secondary" className="text-xs">
                                Expired
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {format(new Date(offer.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                          ${offer.offer_amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires: {format(new Date(offer.offer_expires_at), "MMM d, h:mm a")}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}