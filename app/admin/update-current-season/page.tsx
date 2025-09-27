"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, CheckCircle, Trophy, Calendar, Settings, Zap } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSupabase } from "@/lib/supabase/client"

export default function UpdateCurrentSeasonPage() {
  const { supabase } = useSupabase()
  const [seasons, setSeasons] = useState<any[]>([])
  const [currentSeason, setCurrentSeason] = useState<string | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all seasons
        const { data: seasonsData, error: seasonsError } = await supabase
          .from("seasons")
          .select("*")
          .order("created_at", { ascending: false })

        if (seasonsError) {
          throw new Error(`Error fetching seasons: ${seasonsError.message}`)
        }

        setSeasons(seasonsData || [])

        // Fetch current season setting
        const { data: settingData, error: settingError } = await supabase
          .from("system_settings")
          .select("*")
          .eq("key", "current_season")
          .single()

        if (settingError && !settingError.message.includes("No rows found")) {
          throw new Error(`Error fetching current season: ${settingError.message}`)
        }

        if (settingData) {
          setCurrentSeason(settingData.value)
          setSelectedSeason(settingData.value)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const handleUpdate = async () => {
    if (!selectedSeason) {
      toast({
        title: "Error",
        description: "Please select a season to update.",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      // Update the current season setting
      const { error: updateError } = await supabase
        .from("system_settings")
        .upsert({
          key: "current_season",
          value: selectedSeason,
          updated_at: new Date().toISOString(),
        })

      if (updateError) {
        throw new Error(`Error updating current season: ${updateError.message}`)
      }

      setCurrentSeason(selectedSeason)
      setSuccess(`Current season updated to: ${seasons.find(s => s.id === selectedSeason)?.name || selectedSeason}`)
      
      toast({
        title: "Success",
        description: "Current season updated successfully!",
      })
    } catch (err) {
      console.error("Error updating current season:", err)
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading seasons...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 shadow-lg border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/30">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Update Current Season
            </h1>
            <p className="text-white/90 text-lg max-w-3xl mx-auto">
              Manage the current active season for the league. This affects all league operations and data display.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-200">Season Management</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Select the season that should be active for all league operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800 dark:text-green-200">Success</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Current Season
                  </label>
                  <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <p className="text-slate-800 dark:text-slate-200">
                      {currentSeason ? seasons.find(s => s.id === currentSeason)?.name || "Unknown" : "No season set"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Select New Season
                  </label>
                  <Select value={selectedSeason || ""} onValueChange={setSelectedSeason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a season..." />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map((season) => (
                        <SelectItem key={season.id} value={season.id}>
                          {season.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleUpdate} 
                disabled={isUpdating || !selectedSeason || selectedSeason === currentSeason}
                className="w-full"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Update Current Season
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}