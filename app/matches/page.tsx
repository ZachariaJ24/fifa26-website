// Midnight Studios INTl - All rights reserved
"use client"

import React, { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import UpcomingGames from "@/components/upcoming-games"
import CompletedGames from "@/components/completed-games"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export default function MatchesPage() {
  const { supabase } = useSupabase()
  const [upcomingGames, setUpcomingGames] = useState<any[]>([])
  const [completedGames, setCompletedGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMatches() {
      try {
        const { data: upcomingData, error: upcomingError } = await supabase
          .from("matches")
          .select(`*, home_team:home_team_id(name, logo_url), away_team:away_team_id(name, logo_url)`)
          .eq("status", "Scheduled")
          .order("match_date", { ascending: true })

        if (upcomingError) throw upcomingError
        setUpcomingGames(upcomingData || [])

        const { data: completedData, error: completedError } = await supabase
          .from("matches")
          .select(`*, home_team:home_team_id(name, logo_url), away_team:away_team_id(name, logo_url)`)
          .eq("status", "Completed")
          .order("match_date", { ascending: false })

        if (completedError) throw completedError
        setCompletedGames(completedData || [])
      } catch (error) {
        console.error("Error fetching matches:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [supabase])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Matches</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">Browse upcoming and completed matches.</p>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : upcomingGames.length > 0 ? (
              <UpcomingGames games={upcomingGames} />
            ) : (
              <div className="text-center">
                <p className="text-lg text-muted-foreground">No upcoming games scheduled.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="completed" className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : completedGames.length > 0 ? (
              <CompletedGames games={completedGames} />
            ) : (
              <div className="text-center">
                <p className="text-lg text-muted-foreground">No completed games found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
