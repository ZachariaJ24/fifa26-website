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
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Access Denied</h1>
            <p className="text-slate-600 dark:text-slate-400">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Awards Management
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Manage season awards and achievements for teams and players. 
              Create, edit, and track all league awards and recognitions.
            </p>
                  </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-white dark:bg-slate-800 border shadow-sm">
            <TabsTrigger 
              value="team" 
                className="data-[state=active]:bg-pitch-blue-500 data-[state=active]:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              Team Awards
            </TabsTrigger>
            <TabsTrigger 
              value="player"
                className="data-[state=active]:bg-stadium-gold-500 data-[state=active]:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 flex items-center gap-2"
            >
              <Medal className="h-4 w-4" />
              Player Awards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-800 dark:text-slate-200">Team Awards</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                      Manage team awards like President Trophy and SCS Cup
                    </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    ))}
                      </div>
                ) : teamAwards.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No team awards found</h3>
                    <p className="text-slate-600 dark:text-slate-400">Team awards will appear here once created.</p>
                      </div>
                ) : (
                  <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                          <TableHead className="text-slate-600 dark:text-slate-400">Team</TableHead>
                          <TableHead className="text-slate-600 dark:text-slate-400">Award Type</TableHead>
                          <TableHead className="text-slate-600 dark:text-slate-400">Season</TableHead>
                          <TableHead className="text-slate-600 dark:text-slate-400">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                        {teamAwards.map((award) => (
                          <TableRow key={award.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                              {award.team_name}
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                            {award.award_type}
                        </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                              {award.season_name}
                        </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
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
          <Card>
            <CardHeader>
                <CardTitle className="text-slate-800 dark:text-slate-200">Player Awards</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Manage individual player awards and achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    ))}
                      </div>
                ) : playerAwards.length === 0 ? (
                  <div className="text-center py-12">
                    <Medal className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No player awards found</h3>
                    <p className="text-slate-600 dark:text-slate-400">Player awards will appear here once created.</p>
                      </div>
                ) : (
                  <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                          <TableHead className="text-slate-600 dark:text-slate-400">Player</TableHead>
                          <TableHead className="text-slate-600 dark:text-slate-400">Team</TableHead>
                          <TableHead className="text-slate-600 dark:text-slate-400">Award Type</TableHead>
                          <TableHead className="text-slate-600 dark:text-slate-400">Season</TableHead>
                          <TableHead className="text-slate-600 dark:text-slate-400">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                        {playerAwards.map((award) => (
                          <TableRow key={award.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                              {award.player_name}
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                              {award.team_name || "Free Agent"}
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                            {award.award_type}
                        </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                              {award.season_name}
                        </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
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