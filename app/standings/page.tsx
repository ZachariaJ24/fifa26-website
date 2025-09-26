// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import TeamStandings, { type TeamStanding } from "@/components/team-standings"
import { Trophy, BarChart3, Users } from "lucide-react"

interface Conference {
  id: string;
  name: string;
  standings: TeamStanding[];
}

export default function StandingsPage() {
  const { toast } = useToast()
  const [conferences, setConferences] = useState<Conference[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStandingsData() {
      try {
        setLoading(true)
        const response = await fetch("/api/standings-by-league")
        if (!response.ok) throw new Error("Failed to fetch standings")
        const { conferences } = await response.json()
        setConferences(conferences)
      } catch (error: any) {
        toast({
          title: "Error loading standings",
          description: error.message || "Failed to load standings data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStandingsData()
  }, [toast])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-500 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">League Standings</h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">Track the performance of every club across all three of our competitive leagues.</p>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
                <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent><Skeleton className="h-96 w-full" /></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {conferences.map((conference) => (
              <Card key={conference.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-green-500/20 transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">{conference.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <TeamStandings teams={conference.standings} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
