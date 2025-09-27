"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Medal, Trash2, Plus, Pencil, Award, Crown, Star, Target, Zap, Shield, Database, Activity, TrendingUp, Users, Settings, BarChart3, Clock, Calendar, FileText, BookOpen, Globe, AlertTriangle, CheckCircle, Edit, Save, X, Search, Filter, Download, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Define the Season interface
interface Season {
  id: string | number
  name: string
  number?: number
}

interface Team {
  id: string
  name: string
}

interface Player {
  id: string
  user_id: string
  gamer_tag_id: string
  team_id: string | null
  team_name: string | null
}

interface TeamAward {
  id: string
  team_id: string
  team_name: string
  award_type: string
  season_id: string
  season_name: string
  created_at: string
}

interface PlayerAward {
  id: string
  player_id: string
  player_name: string
  team_id: string | null
  team_name: string | null
  award_type: string
  season_id: string
  season_name: string
  created_at: string
}

export default function AdminAwardsPage() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  const [seasons, setSeasons] = useState<Season[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [teamAwards, setTeamAwards] = useState<TeamAward[]>([])
  const [playerAwards, setPlayerAwards] = useState<PlayerAward[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState("team")

  // Check if user is admin
    async function checkAuthorization() {
      if (!session?.user) {
        toast({
          title: "Unauthorized",
          description: "You must be logged in to access this page.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      try {
        const { data: adminRoleData, error: adminRoleError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("role", "Admin")

        if (adminRoleError || !adminRoleData || adminRoleData.length === 0) {
          toast({
            title: "Access denied",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        setIsAdmin(true)
    } catch (error) {
      console.error("Error checking admin status:", error)
        toast({
          title: "Error",
        description: "Failed to verify admin status.",
          variant: "destructive",
        })
      router.push("/")
    }
  }

  // Fetch data
  async function fetchData() {
    try {
      setLoading(true)

      // Fetch seasons
      const { data: seasonsData, error: seasonsError } = await supabase
        .from("seasons")
        .select("id, name, number")
        .order("number", { ascending: false })

      if (seasonsError) throw seasonsError
      setSeasons(seasonsData || [])

      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from("clubs")
        .select("id, name")
        .order("name")

      if (teamsError) throw teamsError
      setTeams(teamsData || [])

      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select(`
          id, 
          user_id,
          users!inner(gamer_tag_id),
          team_id,
          clubs:team_id(name)
        `)

      if (playersError) throw playersError
      setPlayers(
        playersData?.map((p: any) => ({
          id: p.id,
          user_id: p.user_id,
          gamer_tag_id: p.users.gamer_tag_id,
          team_id: p.team_id,
          team_name: p.clubs?.name || null,
        })) || []
      )

      // Fetch team awards
      const { data: teamAwardsData, error: teamAwardsError } = await supabase
        .from("team_awards")
        .select(`
          id,
          team_id,
          award_type,
          season_id,
          clubs:team_id(name),
          seasons:season_id(name)
        `)

      if (teamAwardsError) throw teamAwardsError
      setTeamAwards(
        teamAwardsData?.map((a: any) => ({
          id: a.id,
          team_id: a.team_id,
          team_name: a.clubs?.name || "Unknown Team",
          award_type: a.award_type,
          season_id: a.season_id,
          season_name: a.seasons?.name || "Unknown Season",
          created_at: a.created_at,
        })) || []
      )

      // Fetch player awards
      const { data: playerAwardsData, error: playerAwardsError } = await supabase
        .from("player_awards")
        .select(`
          id,
          player_id,
          award_type,
          season_id,
          players!inner(
            users!inner(gamer_tag_id),
            team_id,
            clubs:team_id(name)
          ),
          seasons:season_id(name)
        `)

      if (playerAwardsError) throw playerAwardsError
      setPlayerAwards(
        playerAwardsData?.map((a: any) => ({
          id: a.id,
          player_id: a.player_id,
          player_name: a.players.users.gamer_tag_id,
          team_id: a.players.team_id,
          team_name: a.players.clubs?.name || null,
          award_type: a.award_type,
          season_id: a.season_id,
          season_name: a.seasons?.name || "Unknown Season",
          created_at: a.created_at,
        })) || []
      )
      } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch awards data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuthorization()
  }, [session])

  useEffect(() => {
    if (isAdmin) {
      fetchData()
    }
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30">
      <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-field-green-800 dark:text-field-green-200 mb-2">Access Denied</h1>
            <p className="text-field-green-600 dark:text-field-green-400">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
      {/* Enhanced Hero Header Section */}
      <div className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-hockey-pattern opacity-5"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-field-green-500/20 to-pitch-blue-500/20 rounded-full"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-r from-stadium-gold-500/20 to-goal-orange-500/20 rounded-full" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-gradient-to-r from-field-green-500/20 to-field-green-500/20 rounded-full" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-r from-stadium-gold-500 to-goal-orange-600 rounded-full shadow-2xl shadow-stadium-gold-500/30">
              <Trophy className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h1 className="hockey-title mb-4 text-white">
            Awards Management
          </h1>
          <p className="hockey-subtitle mb-8 text-white/90">
            Manage season awards and achievements for teams and players. 
            Create, edit, and track all league awards and recognitions.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="hockey-card border-field-green-200/50 dark:border-pitch-blue-700/50 bg-gradient-to-br from-white to-field-green-50/50 dark:from-field-green-900 dark:to-pitch-blue-900/20 shadow-lg rounded-xl p-2">
            <TabsList className="grid w-full grid-cols-2 h-10 bg-field-green-800 dark:bg-field-green-900 rounded-lg p-1">
              <TabsTrigger 
                value="team" 
                className="text-sm font-medium px-3 py-1 rounded-md transition-all duration-200 data-[state=active]:bg-field-green-500 data-[state=active]:text-white text-field-green-300 hover:text-white flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                Team Awards
              </TabsTrigger>
              <TabsTrigger 
                value="player"
                className="text-sm font-medium px-3 py-1 rounded-md transition-all duration-200 data-[state=active]:bg-stadium-gold-500 data-[state=active]:text-white text-field-green-300 hover:text-white flex items-center gap-2"
              >
                <Medal className="h-4 w-4" />
                Player Awards
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="team" className="space-y-6">
            <Card className="hockey-card hockey-card-hover border-field-green-200/50 dark:border-pitch-blue-700/50 bg-gradient-to-br from-white to-field-green-50/50 dark:from-field-green-900 dark:to-pitch-blue-900/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="border-b-2 border-field-green-200/50 dark:border-pitch-blue-700/50 pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-field-green-800 dark:text-field-green-200">
                  <div className="p-2 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-lg">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  Team Awards
                </CardTitle>
                <CardDescription className="text-field-green-600 dark:text-field-green-400 text-base">
                      Manage team awards like President Trophy and SCS Cup
                    </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-field-green-200/30 dark:bg-field-green-700/30 rounded animate-pulse"></div>
                    ))}
                      </div>
                ) : teamAwards.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gradient-to-r from-field-green-500/20 to-pitch-blue-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-field-green-600 dark:text-field-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-field-green-800 dark:text-field-green-200 mb-2">No team awards found</h3>
                    <p className="text-field-green-600 dark:text-field-green-400">Team awards will appear here once created.</p>
                      </div>
                ) : (
                  <div className="hockey-card border-field-green-200/50 dark:border-pitch-blue-700/50 bg-gradient-to-br from-white to-field-green-50/50 dark:from-field-green-900 dark:to-pitch-blue-900/20 rounded-xl overflow-hidden shadow-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-field-green-50/50 to-pitch-blue-50/50 dark:from-field-green-900/20 dark:to-pitch-blue-900/20 border-b-2 border-field-green-200/50 dark:border-pitch-blue-700/50">
                          <TableHead className="text-field-green-800 dark:text-field-green-200 font-bold">Team</TableHead>
                          <TableHead className="text-field-green-800 dark:text-field-green-200 font-bold">Award Type</TableHead>
                          <TableHead className="text-field-green-800 dark:text-field-green-200 font-bold">Season</TableHead>
                          <TableHead className="text-field-green-800 dark:text-field-green-200 font-bold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                        {teamAwards.map((award) => (
                          <TableRow key={award.id} className="hover:bg-gradient-to-r hover:from-field-green-50/30 hover:to-pitch-blue-50/30 dark:hover:from-field-green-900/10 dark:hover:to-pitch-blue-900/10 transition-all duration-300 border-b border-field-green-200/30 dark:border-pitch-blue-700/30">
                            <TableCell className="font-medium text-field-green-800 dark:text-field-green-200">
                              {award.team_name}
                            </TableCell>
                            <TableCell className="text-field-green-600 dark:text-field-green-400">
                            {award.award_type}
                        </TableCell>
                            <TableCell className="text-field-green-600 dark:text-field-green-400">
                              {award.season_name}
                        </TableCell>
                            <TableCell className="text-field-green-600 dark:text-field-green-400">
                              {new Date(award.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                        ))}
                </TableBody>
              </Table>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="player" className="space-y-6">
          <Card className="hockey-card hockey-card-hover border-stadium-gold-200/50 dark:border-stadium-gold-700/50 bg-gradient-to-br from-white to-stadium-gold-50/50 dark:from-field-green-900 dark:to-stadium-gold-900/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b-2 border-stadium-gold-200/50 dark:border-stadium-gold-700/50 pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-field-green-800 dark:text-field-green-200">
                  <div className="p-2 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg">
                    <Medal className="h-6 w-6 text-white" />
                  </div>
                  Player Awards
                </CardTitle>
                <CardDescription className="text-field-green-600 dark:text-field-green-400 text-base">
                  Manage individual player awards and achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-stadium-gold-200/30 dark:bg-stadium-gold-700/30 rounded animate-pulse"></div>
                    ))}
                      </div>
                ) : playerAwards.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gradient-to-r from-stadium-gold-500/20 to-stadium-gold-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Medal className="h-8 w-8 text-stadium-gold-600 dark:text-stadium-gold-400" />
                    </div>
                    <h3 className="text-lg font-medium text-field-green-800 dark:text-field-green-200 mb-2">No player awards found</h3>
                    <p className="text-field-green-600 dark:text-field-green-400">Player awards will appear here once created.</p>
                      </div>
                ) : (
                  <div className="hockey-card border-stadium-gold-200/50 dark:border-stadium-gold-700/50 bg-gradient-to-br from-white to-stadium-gold-50/50 dark:from-field-green-900 dark:to-stadium-gold-900/20 rounded-xl overflow-hidden shadow-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-stadium-gold-50/50 to-stadium-gold-50/50 dark:from-stadium-gold-900/20 dark:to-stadium-gold-900/20 border-b-2 border-stadium-gold-200/50 dark:border-stadium-gold-700/50">
                          <TableHead className="text-field-green-800 dark:text-field-green-200 font-bold">Player</TableHead>
                          <TableHead className="text-field-green-800 dark:text-field-green-200 font-bold">Team</TableHead>
                          <TableHead className="text-field-green-800 dark:text-field-green-200 font-bold">Award Type</TableHead>
                          <TableHead className="text-field-green-800 dark:text-field-green-200 font-bold">Season</TableHead>
                          <TableHead className="text-field-green-800 dark:text-field-green-200 font-bold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                        {playerAwards.map((award) => (
                          <TableRow key={award.id} className="hover:bg-gradient-to-r hover:from-stadium-gold-50/30 hover:to-stadium-gold-50/30 dark:hover:from-stadium-gold-900/10 dark:hover:to-stadium-gold-900/10 transition-all duration-300 border-b border-stadium-gold-200/30 dark:border-stadium-gold-700/30">
                            <TableCell className="font-medium text-field-green-800 dark:text-field-green-200">
                              {award.player_name}
                            </TableCell>
                            <TableCell className="text-field-green-600 dark:text-field-green-400">
                              {award.team_name || "Free Agent"}
                            </TableCell>
                            <TableCell className="text-field-green-600 dark:text-field-green-400">
                            {award.award_type}
                        </TableCell>
                            <TableCell className="text-field-green-600 dark:text-field-green-400">
                              {award.season_name}
                        </TableCell>
                            <TableCell className="text-field-green-600 dark:text-field-green-400">
                              {new Date(award.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                        ))}
                </TableBody>
              </Table>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}