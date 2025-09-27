"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, CheckCircle, Trophy, Calendar, Settings, Zap } from "lucide-react"
// import { motion } from "framer-motion" - replaced with CSS animations
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
      } catch (error: any) {
        console.error("Error fetching data:", error)
        setError(error.message || "An error occurred while fetching data")
        toast({
          title: "Error",
          description: error.message || "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, toast])

  const handleUpdateSeason = async () => {
    if (!selectedSeason) {
      setError("Please select a season")
      return
    }

    setIsUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: updateError } = await supabase.from("system_settings").upsert(
        {
          key: "current_season",
          value: selectedSeason,
        },
        { onConflict: "key" },
      )

      if (updateError) {
        throw new Error(`Error updating season: ${updateError.message}`)
      }

      setCurrentSeason(selectedSeason)
      setSuccess("Current season updated successfully")
      toast({
        title: "Success",
        description: "Current season updated successfully",
      })
    } catch (error: any) {
      console.error("Error updating season:", error)
      setError(error.message || "An error occurred while updating the season")
      toast({
        title: "Error",
        description: error.message || "Failed to update season",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getCurrentSeasonName = () => {
    const season = seasons.find((s) => s.id === currentSeason)
    return season ? `${season.name} (${season.id})` : "Unknown"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-field-green-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
      <div className="container mx-auto px-4 py-8">
        <div className="">
          <h1 className="text-3xl font-bold mb-6 text-field-green-900 dark:text-field-green-100 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            Update Current Season
          </h1>
          <Card className="max-w-md mx-auto hockey-enhanced-card">
            <CardHeader>
              <CardTitle className="text-2xl text-field-green-900 dark:text-field-green-100 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-lg">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                Current Season
              </CardTitle>
              <CardDescription className="text-field-green-600 dark:text-field-green-400">
                The current season is used for player registrations and other season-specific features.
              </CardDescription>
            </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="hockey-enhanced-card border-goal-red-200 dark:border-goal-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-field-green-900 dark:text-field-green-100">Error</AlertTitle>
              <AlertDescription className="text-field-green-700 dark:text-field-green-300">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="hockey-enhanced-card border-assist-green-200 dark:border-assist-green-800 bg-assist-green-50 dark:bg-assist-green-900/20">
              <CheckCircle className="h-4 w-4 text-assist-green-600 dark:text-assist-green-400" />
              <AlertTitle className="text-assist-green-600 dark:text-assist-green-400">Success</AlertTitle>
              <AlertDescription className="text-assist-green-600 dark:text-assist-green-400">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <label className="text-sm font-medium text-field-green-900 dark:text-field-green-100 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-field-green-500" />
              Current Season
            </label>
            <div className="p-3 border border-field-green-200 dark:border-pitch-blue-700 rounded-lg bg-gradient-to-br from-field-green-50 to-pitch-blue-50 dark:from-field-green-800 dark:to-field-green-700 text-field-green-900 dark:text-field-green-100">
              {getCurrentSeasonName()}
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="season" className="text-sm font-medium text-field-green-900 dark:text-field-green-100 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-pitch-blue-500" />
              Select New Season
            </label>
            <Select value={selectedSeason || "none"} onValueChange={setSelectedSeason}>
              <SelectTrigger className="hockey-search">
                <SelectValue placeholder="Select a season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select a season</SelectItem>
                {seasons.map((season) => (
                  <SelectItem key={season.id} value={season.id}>
                    {season.name} ({season.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdateSeason} disabled={isUpdating || !selectedSeason || selectedSeason === "none"} className="w-full hockey-button-enhanced bg-gradient-to-r from-field-green-500 to-pitch-blue-600 hover:from-field-green-600 hover:to-pitch-blue-700 text-white">
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
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
