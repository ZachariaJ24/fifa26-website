// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import TeamStandings, { type TeamStanding } from "@/components/team-standings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, BarChart3, Users, ShieldCheck } from "lucide-react"

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
        const data = await response.json()
        if (data.error) throw new Error(data.error)
        setConferences(data.conferences)
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

  const overallStandings = useMemo(() => {
    const allTeams = conferences.flatMap(c => c.standings);
    return allTeams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
      return b.goals_for - a.goals_for;
    });
  }, [conferences]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-500 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">League Standings</h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">Track the performance of every club across all our competitive conferences.</p>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-12 w-full max-w-lg mx-auto bg-gray-200 dark:bg-gray-700" />
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
              <CardHeader><Skeleton className="h-8 w-1/2 bg-gray-200 dark:bg-gray-600" /></CardHeader>
              <CardContent><Skeleton className="h-96 w-full bg-gray-200 dark:bg-gray-600" /></CardContent>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="conference" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <TabsTrigger value="conference">Conference</TabsTrigger>
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="playoffs">Playoff Picture</TabsTrigger>
            </TabsList>
            
            <TabsContent value="conference" className="mt-8">
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
            </TabsContent>

            <TabsContent value="overall" className="mt-8">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">Overall League Standings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TeamStandings teams={overallStandings} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="playoffs" className="mt-8">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">Playoff Picture</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-16">
                        <ShieldCheck className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Coming Soon</h3>
                        <p className="text-gray-600 dark:text-gray-400">The playoff picture will be available as the season progresses.</p>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
