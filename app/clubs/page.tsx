// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { motion } from "framer-motion"
import { Trophy, Award, Users, Search, TrendingUp, DollarSign, Shield, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TeamLogo } from "@/components/team-logo"
import { useSupabase } from "@/lib/supabase/client"

const MAX_ROSTER_SIZE = 23

export default function ClubsPage() {
  const { toast } = useToast()
  const { supabase } = useSupabase()
  const [clubs, setClubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchClubsData() {
      try {
        setLoading(true)

        // 1. Fetch clubs data directly from database with error handling
        let clubsData = [];
        try {
          const { data, error } = await supabase
            .from('clubs')
            .select(`
              *,
              conferences(name, color)
            `)
            .eq('is_active', true)
            .order('points', { ascending: false });
          
          if (error) {
            console.error('Clubs data error:', error);
          } else {
            clubsData = data || [];
          }
        } catch (error) {
          console.error('Failed to fetch clubs:', error);
        }

        // 2. Fetch club awards with error handling
        let awardsByClub: Record<string, any[]> = {};
        try {
          const { data: awards, error } = await supabase
            .from('club_awards')
            .select('*');
          
          if (error) {
            console.error('Awards error:', error);
          } else {
            awards?.forEach((award: any) => {
              if (!awardsByClub[award.club_id]) {
                awardsByClub[award.club_id] = [];
              }
              awardsByClub[award.club_id].push(award);
            });
          }
        } catch (error) {
          console.error('Failed to fetch awards:', error);
        }

        // 3. Fetch player data for counts and salaries with error handling
        let playersByClub: Record<string, any[]> = {};
        try {
          const { data: players, error: playerError } = await supabase
            .from("players")
            .select("club_id, salary")
            .eq("status", "active");
          
          if (playerError) {
            console.error('Player data error:', playerError);
          } else {
            players?.forEach((player: any) => {
              if (!player.club_id) return;
              if (!playersByClub[player.club_id]) {
                playersByClub[player.club_id] = [];
              }
              playersByClub[player.club_id].push(player);
            });
          }
        } catch (error) {
          console.error('Failed to fetch players:', error);
        }

        // 4. Combine all data
        const combinedData = clubsData.map((club: any) => {
          const clubPlayers = playersByClub[club.id] || [];
          return {
            ...club,
            awards: awardsByClub[club.id] || [],
            playerCount: clubPlayers.length,
            totalSalary: clubPlayers.reduce((sum: number, p: any) => sum + (p.salary || 0), 0),
          };
        });

        setClubs(combinedData);
      } catch (error: any) {
        console.error("Error fetching clubs data:", error);
        toast({
          title: "Error",
          description: "Failed to load clubs data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchClubsData();
  }, [supabase, toast]);

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPlayers = clubs.reduce((sum, club) => sum + club.playerCount, 0);
  const totalSalary = clubs.reduce((sum, club) => sum + club.totalSalary, 0);
  const averageSalary = clubs.length > 0 ? totalSalary / totalPlayers : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white fifa-title mb-4">Clubs</h1>
          </div>
          <p className="text-lg text-white fifa-subtitle">Explore all clubs in the league</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="fifa-card-hover-enhanced border-2 border-field-green-200/60 dark:border-field-green-700/60 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-white fifa-title">Total Clubs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{clubs.length}</p>
            </CardContent>
          </Card>

          <Card className="fifa-card-hover-enhanced border-2 border-assist-green-200/60 dark:border-assist-green-700/60 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-white fifa-title">Total Players</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{totalPlayers}</p>
            </CardContent>
          </Card>

          <Card className="fifa-card-hover-enhanced border-2 border-stadium-gold-200/60 dark:border-stadium-gold-700/60 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-white fifa-title">Total Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">${(totalSalary / 1000000).toFixed(1)}M</p>
            </CardContent>
          </Card>

          <Card className="fifa-card-hover-enhanced border-2 border-pitch-blue-200/60 dark:border-pitch-blue-700/60 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-white fifa-title">Avg Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">${(averageSalary / 1000).toFixed(0)}K</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
            <Input
              type="text"
              placeholder="Search clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 fifa-search border-2 border-field-green-200/60 dark:border-field-green-700/60 focus:border-field-green-500 dark:focus:border-field-green-400"
            />
          </div>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))
          ) : (
            <>
              {filteredClubs.length === 0 ? (
                <div className="col-span-full">
                  <p className="text-center text-white py-8">No clubs found matching your search.</p>
                </div>
              ) : (
                filteredClubs.map((club, index) => (
                  <motion.div
                    key={club.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link href={`/clubs/${club.id}`} className="block">
                      <Card className="fifa-card-hover-enhanced border-2 border-field-green-200/60 dark:border-field-green-700/60 shadow-lg h-full">
                        <CardContent className="p-6 text-center">
                          <TeamLogo teamName={club.name} teamId={club.id} logoUrl={club.logo_url} className="w-16 h-16 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-white mb-2">{club.name}</h3>
                          <Badge className="mb-3 bg-blue-500/20 text-blue-300 border-blue-400/30">
                            {club.conferences?.name || "No Conference"}
                          </Badge>

                          {club.awards.length > 0 && (
                            <div className="mb-4">
                              <div className="flex flex-wrap justify-center gap-1 mb-2">
                                {club.awards.slice(0, 2).map((award: any) => (
                                  <Badge
                                    key={award.id}
                                    variant="outline"
                                    className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                                  >
                                    {award.award_type}
                                  </Badge>
                                ))}
                                {club.awards.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{club.awards.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-400" />
                              <span className="text-2xl font-bold text-white">{club.points}</span>
                              <span className="text-sm text-white block">Points</span>
                            </div>
                            <div>
                              <Users className="h-5 w-5 mx-auto mb-1 text-blue-400" />
                              <span className="text-2xl font-bold text-white">{club.playerCount}</span>
                              <span className="text-sm text-white block">Players</span>
                            </div>
                            <div>
                              <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-400" />
                              <span className="text-lg font-bold text-white">${(club.totalSalary / 1000000).toFixed(1)}M</span>
                              <span className="text-sm text-white block">Salary</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex justify-center gap-4 text-sm text-white">
                              <span>W: {club.wins}</span>
                              <span>D: {club.draws || 0}</span>
                              <span>L: {club.losses}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
