// Midnight Studios INTl - All rights reserved
"use client"

import React, { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import TeamStandings from "@/components/team-standings"
import { Skeleton } from "@/components/ui/skeleton"

export default function StandingsPage() {
  const { supabase } = useSupabase()
  const [standings, setStandings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStandings() {
      try {
        const response = await fetch('/api/standings')
        if (!response.ok) {
          throw new Error('Failed to fetch standings')
        }
        const data = await response.json()
        setStandings(data.standings)
      } catch (error) {
        console.error("Error fetching standings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStandings()
  }, [supabase])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Standings</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">View the current league standings.</p>
        </div>

        {loading ? (
          <Skeleton className="h-96 w-full rounded-lg" />
        ) : (
          <TeamStandings teams={standings} />
        )}
      </main>
    </div>
