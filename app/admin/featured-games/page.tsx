"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Check, X, Star, StarOff, AlertCircle, RefreshCw, Trophy, Medal, Target, Zap, Shield, Database, Activity, TrendingUp, Users, Settings, BarChart3, Clock, Calendar, FileText, BookOpen, Globe, Publish, AlertTriangle, CheckCircle, Edit, Save, Award, Crown, Gamepad2, Play, Pause, Stop, Eye, EyeOff, Filter, Search, Download, Upload, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { useSupabase } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AdminFeaturedGamesPage() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [dateColumnName, setDateColumnName] = useState<string>("match_date")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [migrationStatus, setMigrationStatus] = useState<"pending" | "success" | "error" | null>(null)
  const [migrationError, setMigrationError] = useState<string | null>(null)

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

  // Fetch matches
  async function fetchMatches() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          home_team_id,
          away_team_id,
          match_date,
          is_featured,
          home_team:home_team_id(name, logo_url),
          away_team:away_team_id(name, logo_url)
        `)
        .order("match_date", { ascending: true })

      if (error) {
        console.error("Error fetching matches:", error)
        toast({
          title: "Error",
          description: "Failed to fetch matches.",
          variant: "destructive",
        })
        return
      }

      setMatches(data || [])
    } catch (error) {
      console.error("Error fetching matches:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Toggle featured status
  async function toggleFeatured(matchId: string, currentStatus: boolean) {
    try {
      setUpdatingId(matchId)
      const { error } = await supabase
        .from("matches")
        .update({ is_featured: !currentStatus })
        .eq("id", matchId)

      if (error) {
        console.error("Error updating featured status:", error)
        toast({
          title: "Error",
          description: "Failed to update featured status.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: `Match ${!currentStatus ? "featured" : "unfeatured"} successfully.`,
      })

      // Refresh matches
      await fetchMatches()
    } catch (error) {
      console.error("Error updating featured status:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => {
    checkAuthorization()
  }, [session])

  useEffect(() => {
    if (isAdmin) {
      fetchMatches()
    }
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
      <div className="bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 shadow-lg border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Featured Games</h1>
                <p className="text-white/90 text-lg">Manage which games are featured on the homepage</p>
              </div>
            </div>
            <Button onClick={fetchMatches} variant="outline" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-pitch-blue-50 to-pitch-blue-100 dark:from-pitch-blue-900/20 dark:to-pitch-blue-800/20 border-pitch-blue-200 dark:border-pitch-blue-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-pitch-blue-700 dark:text-pitch-blue-300">Total Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pitch-blue-600 dark:text-pitch-blue-400">{matches.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-field-green-50 to-field-green-100 dark:from-field-green-900/20 dark:to-field-green-800/20 border-field-green-200 dark:border-field-green-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-field-green-700 dark:text-field-green-300">Featured Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-field-green-600 dark:text-field-green-400">{matches.filter(m => m.is_featured).length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pitch-blue-50 to-pitch-blue-100 dark:from-pitch-blue-900/20 dark:to-pitch-blue-800/20 border-pitch-blue-200 dark:border-pitch-blue-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-pitch-blue-700 dark:text-pitch-blue-300">Upcoming Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pitch-blue-600 dark:text-pitch-blue-400">
                {matches.filter(m => new Date(m.match_date) > new Date()).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matches Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-200">All Matches</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Click the star icon to feature or unfeature a match
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No matches found</h3>
                <p className="text-slate-600 dark:text-slate-400">There are no matches to display.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600 dark:text-slate-400">Featured</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400">Home Team</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400">Away Team</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400">Date</TableHead>
                      <TableHead className="text-slate-600 dark:text-slate-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.map((match) => (
                      <TableRow key={match.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell>
                          {match.is_featured ? (
                            <Badge variant="default" className="bg-field-green-500 text-white">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500">
                              <StarOff className="h-3 w-3 mr-1" />
                              Not Featured
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                          {match.home_team?.name || "Unknown Team"}
                        </TableCell>
                        <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                          {match.away_team?.name || "Unknown Team"}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {format(new Date(match.match_date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFeatured(match.id, match.is_featured)}
                            disabled={updatingId === match.id}
                          >
                            {updatingId === match.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : match.is_featured ? (
                              <StarOff className="h-4 w-4" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}