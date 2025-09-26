// Midnight Studios INTl - All rights reserved
"use client"

import React, { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { TeamLogo } from "@/components/team-logo"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export default function TeamsPage() {
  const { supabase } = useSupabase()
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTeams() {
      try {
        const { data, error } = await supabase
          .from("teams")
          .select("id, name, logo_url, is_active")
          .eq("is_active", true)
          .order("name", { ascending: true })

        if (error) throw error
        setTeams(data || [])
      } catch (error) {
        console.error("Error fetching teams:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [supabase])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Teams</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">Browse all the active teams in the league.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-y-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {teams.map((team) => (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <Card className="flex flex-col items-center justify-center p-6 hover:bg-muted/50 transition-colors">
                  <TeamLogo teamName={team.name} logoUrl={team.logo_url} size="lg" />
                  <h2 className="mt-4 text-lg font-semibold text-center">{team.name}</h2>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
