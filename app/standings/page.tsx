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
    'from-field-green-500 to-field-green-600',
    'from-pitch-blue-500 to-pitch-blue-600',
    'from-stadium-gold-500 to-stadium-gold-600',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900 fifa-scrollbar">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-field-green-600/20 via-pitch-blue-600/20 to-stadium-gold-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="fifa-title-enhanced mb-6">
              League Standings
            </h1>
            <p className="text-xl md:text-2xl text-field-green-700 dark:text-field-green-300 mb-8 max-w-3xl mx-auto">
              Track the performance of every club across all our competitive conferences.
            </p>
            <div className="fifa-section-divider"></div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="space-y-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="fifa-card-hover-enhanced">
                <div className="p-6">
                  <Skeleton className="h-8 w-1/2 mx-auto bg-field-green-100 dark:bg-field-green-800" />
                </div>
                <div className="p-6">
                  <Skeleton className="h-96 w-full bg-field-green-100 dark:bg-field-green-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {conferences.map((conference, index) => (
              <div key={conference.id}>
                <div className="fifa-card-hover-enhanced overflow-hidden shadow-2xl shadow-field-green-500/10">
                  <div className={`p-6 bg-gradient-to-r ${conferenceColors[index % conferenceColors.length]}`}>
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-white flex items-center justify-center gap-3">
                      <Trophy className="h-8 w-8" />
                      {conference.name}
                    </h2>
                  </div>
                  <div className="p-0">
                    <TeamStandings teams={conference.standings} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
