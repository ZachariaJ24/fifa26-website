// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import TeamStandings, { type TeamStanding } from "@/components/team-standings"
import { Trophy, BarChart3, Users, Shield, Crown, Flame } from "lucide-react"
import { TeamLogo } from "@/components/team-logo"
import { motion } from "framer-motion"

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

  const playoffTeams = useMemo(() => overallStandings.slice(0, 8), [overallStandings]);
  const bubbleTeams = useMemo(() => overallStandings.slice(8, 12), [overallStandings]);

  const conferenceColors = [
    'from-blue-500 to-cyan-400',
    'from-green-500 to-emerald-400',
    'from-purple-500 to-pink-400',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/30 text-white">
      <div 
        className="py-20 px-6 text-center bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('/images/stadium-background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent tracking-tight"
          >
            League Standings
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto"
          >
            Track the performance of every club across all our competitive conferences.
          </motion.p>
        </div>
      </div>

      <main className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="space-y-12">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
                <CardHeader><Skeleton className="h-8 w-1/2 mx-auto bg-gray-700" /></CardHeader>
                <CardContent><Skeleton className="h-96 w-full bg-gray-700" /></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {conferences.map((conference, index) => (
              <motion.div
                key={conference.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm overflow-hidden shadow-2xl shadow-blue-500/10">
                  <CardHeader className={`p-4 bg-gradient-to-r ${conferenceColors[index % conferenceColors.length]}`}>
                    <CardTitle className="text-2xl md:text-3xl font-bold text-center text-white flex items-center justify-center gap-3">
                      <Trophy /> {conference.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <TeamStandings teams={conference.standings} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: conferences.length * 0.2 }}>
              <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm overflow-hidden shadow-2xl shadow-green-500/10">
                <CardHeader className="p-4 bg-gradient-to-r from-green-500 to-emerald-400">
                  <CardTitle className="text-2xl md:text-3xl font-bold text-center text-white flex items-center justify-center gap-3">
                    <BarChart3 /> Overall Standings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <TeamStandings teams={overallStandings} />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: (conferences.length + 1) * 0.2 }}>
              <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm overflow-hidden shadow-2xl shadow-purple-500/10">
                <CardHeader className="p-4 bg-gradient-to-r from-purple-500 to-pink-400">
                  <CardTitle className="text-2xl md:text-3xl font-bold text-center text-white flex items-center justify-center gap-3">
                    <Shield /> Race to the Finals
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-green-400 flex items-center gap-2 mb-4"><Crown /> Playoff Teams</h3>
                      <div className="space-y-2">
                        {playoffTeams.map((team, i) => <PlayoffTeamCard key={team.id} team={team} rank={i + 1} />)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-2 mb-4"><Flame /> On the Bubble</h3>
                      <div className="space-y-2">
                        {bubbleTeams.map((team, i) => <PlayoffTeamCard key={team.id} team={team} rank={i + 9} />)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        )}
      </main>
    </div>
  )
}

const PlayoffTeamCard = ({ team, rank }: { team: TeamStanding, rank: number }) => (
  <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
    <div className="flex items-center gap-3">
      <span className="font-bold text-lg w-6 text-center">{rank}</span>
      <TeamLogo teamName={team.name} logoUrl={team.logo_url} size="sm" />
      <span className="font-semibold">{team.name}</span>
    </div>
    <div className="font-bold text-blue-400">{team.points} PTS</div>
  </div>
);
