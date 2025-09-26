// Midnight Studios INTl - All rights reserved
"use client"

import React, { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export default function StatsPage() {
  const { supabase } = useSupabase()
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from("player_stats")
          .select("*, players(name)")
          .order("goals", { ascending: false })
          .limit(50)

        if (error) throw error
        setStats(data || [])
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Player Stats</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">View the top player statistics in the league.</p>
        </div>

        {loading ? (
          <Skeleton className="h-96 w-full rounded-lg" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Goals</TableHead>
                <TableHead className="text-right">Assists</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((player) => (
                <TableRow key={player.player_id}>
                  <TableCell>{player.players.name}</TableCell>
                  <TableCell className="text-right">{player.goals}</TableCell>
                  <TableCell className="text-right">{player.assists}</TableCell>
                  <TableCell className="text-right">{player.goals + player.assists}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>
    </div>
  )
}
