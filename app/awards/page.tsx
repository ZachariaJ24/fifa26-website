// Midnight Studios INTl - All rights reserved
"use client"

import React, { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AwardsPage() {
  const { supabase } = useSupabase()
  const [awards, setAwards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAwards() {
      try {
        const { data, error } = await supabase
          .from("awards")
          .select("*, users(username), teams(name)")
          .order("created_at", { ascending: false })

        if (error) throw error
        setAwards(data || [])
      } catch (error) {
        console.error("Error fetching awards:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAwards()
  }, [supabase])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Awards</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">Recognizing the top performers in the league.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {awards.map((award) => (
              <Card key={award.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{award.award_name}</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{award.users?.username || award.teams?.name}</div>
                  <p className="text-xs text-muted-foreground">{award.season}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
