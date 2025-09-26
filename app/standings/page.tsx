// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import TeamStandings, { type TeamStanding } from "@/components/team-standings"
import { Trophy } from "lucide-react"
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
          </div>
        )}
      </main>
    </div>
  )
}
