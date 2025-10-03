// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, Search, Settings, Trophy, Users, AlertTriangle, CheckCircle, XCircle, Edit, Trash2, RefreshCw, ExternalLink } from "lucide-react"
import { TeamLogo } from "@/components/team-logo"

interface Club {
  id: string
  name: string
  logo_url?: string
  season_id: number
  ea_club_id?: string
  is_active: boolean
  conference_id?: string
  created_at: string
  updated_at: string
  conference?: {
    id: string
    name: string
  }
  season?: {
    id: number
    name: string
  }
}

interface Season {
  id: number
  name: string
  is_active: boolean
}

interface Conference {
  id: string
  name: string
  season_id: number
}

interface EAClub {
  clubId: number
  clubName: string
  platform: string
  clubId: number
}

export default function AdminClubsPage() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  // State management
  const [clubs, setClubs] = useState<Club[]>([])
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([])
  const [loadingClubs, setLoadingClubs] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [hasActiveColumn, setHasActiveColumn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAddingClub, setIsAddingClub] = useState(false)
  const [editingClub, setEditingClub] = useState<Club | null>(null)
  const [clubForm, setClubForm] = useState({
    name: "",
    logo_url: "",
    season_id: 1,
    ea_club_id: "",
    is_active: true,
    conference_id: "",
  })
  const [seasons, setSeasons] = useState<Season[]>([])
  const [conferences, setConferences] = useState<Conference[]>([])
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [conferenceFilter, setConferenceFilter] = useState<string>("all")
  const [showConferenceManagement, setShowConferenceManagement] = useState(false)
  const [isUpdatingConference, setIsUpdatingConference] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSearchingEA, setIsSearchingEA] = useState(false)
  const [eaSearchQuery, setEaSearchQuery] = useState("")
  const [eaSearchResults, setEaSearchResults] = useState<EAClub[]>([])
  const [showEaSearchDialog, setShowEaSearchDialog] = useState(false)
  const [hasEaColumn, setHasEaColumn] = useState(false)
  const [hasManualOverrideColumn, setHasManualOverrideColumn] = useState(false)
  const [hasGamesPlayedColumn, setHasGamesPlayedColumn] = useState(false)
  const [hasPointsColumn, setHasPointsColumn] = useState(false)

  // Check admin status
  useEffect(() => {
    async function checkAdminStatus() {
      if (!session?.user) return

      const { data: userData, error } = await supabase
        .from("users")
        .select("roles")
        .eq("id", session.user.id)
        .single()

      if (error) {
        console.error("Error checking admin status:", error)
        return
      }

      const isAdminUser = userData?.roles?.includes("Admin") || false
      setIsAdmin(isAdminUser)

      if (!isAdminUser) {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access this page.",
          variant: "destructive",
        })
        router.push("/")
        return
      }
    }

    checkAdminStatus()
  }, [session, supabase, toast, router])

  // Load initial data
  useEffect(() => {
    if (!isAdmin) return
    loadInitialData()
  }, [isAdmin])

  async function loadInitialData() {
    try {
      setLoading(true)
      await Promise.all([
        loadClubs(),
        loadSeasons(),
        loadConferences(),
        checkColumnExistence(),
      ])
    } catch (error) {
      console.error("Error loading initial data:", error)
      toast({
        title: "Error",
        description: "Failed to load initial data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadClubs() {
    try {
      setLoadingClubs(true)
      setLoadError(null)

      const query = supabase
        .from("clubs")
        .select(`
          *,
          conference:conferences(id, name),
          season:seasons(id, name)
        `)
        .order("name")

      const { data, error } = await query

      if (error) throw error

      setClubs(data || [])
      setFilteredClubs(data || [])
    } catch (error: any) {
      console.error("Error loading clubs:", error)
      setLoadError(error.message)
      toast({
        title: "Error loading clubs",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoadingClubs(false)
    }
  }

  async function loadSeasons() {
    try {
      const { data, error } = await supabase
        .from("seasons")
        .select("*")
        .order("id", { ascending: false })

      if (error) throw error
      setSeasons(data || [])
    } catch (error: any) {
      console.error("Error loading seasons:", error)
    }
  }

  async function loadConferences() {
    try {
      const { data, error } = await supabase
        .from("conferences")
        .select("*")
        .order("name")

      if (error) throw error
      setConferences(data || [])
    } catch (error: any) {
      console.error("Error loading conferences:", error)
    }
  }

  async function checkColumnExistence() {
    try {
      // Check if various columns exist in the clubs table
      const { data: columns } = await supabase
        .from("clubs")
        .select("ea_club_id, manual_override, games_played, points")
        .limit(1)

      setHasEaColumn(!!columns?.[0]?.ea_club_id)
      setHasManualOverrideColumn(!!columns?.[0]?.manual_override)
      setHasGamesPlayedColumn(!!columns?.[0]?.games_played)
      setHasPointsColumn(!!columns?.[0]?.points)
    } catch (error) {
      console.error("Error checking column existence:", error)
    }
  }

  // Filter clubs based on search and filters
  useEffect(() => {
    let filtered = clubs

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply active/inactive filter
    if (!showInactive) {
      filtered = filtered.filter(club => club.is_active)
    }

    // Apply season filter
    if (selectedSeason) {
      filtered = filtered.filter(club => club.season_id === selectedSeason)
    }

    // Apply conference filter
    if (conferenceFilter !== "all") {
      filtered = filtered.filter(club => club.conference_id === conferenceFilter)
    }

    setFilteredClubs(filtered)
  }, [clubs, searchQuery, showInactive, selectedSeason, conferenceFilter])

  async function handleSaveClub() {
    try {
      setIsSaving(true)

      if (editingClub) {
        // Update existing club
        const { error } = await supabase
          .from("clubs")
          .update({
            name: clubForm.name,
            logo_url: clubForm.logo_url,
            season_id: clubForm.season_id,
            ea_club_id: clubForm.ea_club_id || null,
            is_active: clubForm.is_active,
            conference_id: clubForm.conference_id || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingClub.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Club updated successfully.",
        })
      } else {
        // Create new club
        const { error } = await supabase
          .from("clubs")
          .insert({
            name: clubForm.name,
            logo_url: clubForm.logo_url,
            season_id: clubForm.season_id,
            ea_club_id: clubForm.ea_club_id || null,
            is_active: clubForm.is_active,
            conference_id: clubForm.conference_id || null,
          })

        if (error) throw error

        toast({
          title: "Success",
          description: "Club created successfully.",
        })
      }

      // Reset form and reload data
      setClubForm({
        name: "",
        logo_url: "",
        season_id: 1,
        ea_club_id: "",
        is_active: true,
        conference_id: "",
      })
      setEditingClub(null)
      setIsAddingClub(false)
      await loadClubs()
    } catch (error: any) {
      console.error("Error saving club:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteClub(club: Club) {
    if (!confirm(`Are you sure you want to delete ${club.name}? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from("clubs")
        .delete()
        .eq("id", club.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Club deleted successfully.",
      })

      await loadClubs()
    } catch (error: any) {
      console.error("Error deleting club:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  async function searchEAClubs() {
    if (!eaSearchQuery.trim()) return

    try {
      setIsSearchingEA(true)
      const response = await fetch(`/api/ea/search-teams?query=${encodeURIComponent(eaSearchQuery)}`)
      
      if (!response.ok) {
        throw new Error("Failed to search EA clubs")
      }

      const data = await response.json()
      setEaSearchResults(data.clubs || [])
    } catch (error: any) {
      console.error("Error searching EA clubs:", error)
      toast({
        title: "Error",
        description: "Failed to search EA clubs.",
        variant: "destructive",
      })
    } finally {
      setIsSearchingEA(false)
    }
  }

  function selectEAClub(eaClub: EAClub) {
    setClubForm(prev => ({
      ...prev,
      ea_club_id: eaClub.clubId.toString(),
    }))
    setShowEaSearchDialog(false)
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Club Management</h1>
          <p className="text-muted-foreground">Manage clubs, conferences, and EA integrations</p>
        </div>
        <Button onClick={() => setIsAddingClub(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Club
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clubs.length}</div>
            <p className="text-xs text-muted-foreground">
              {clubs.filter(c => c.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conferences</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conferences.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {seasons.length} seasons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EA Integration</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clubs.filter(c => c.ea_club_id).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Connected clubs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Season</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {seasons.find(s => s.is_active)?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Active season
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clubs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedSeason?.toString() || "all"} onValueChange={(value) => setSelectedSeason(value === "all" ? null : parseInt(value))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                {seasons.map(season => (
                  <SelectItem key={season.id} value={season.id.toString()}>
                    {season.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={conferenceFilter} onValueChange={setConferenceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select conference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conferences</SelectItem>
                {conferences.map(conference => (
                  <SelectItem key={conference.id} value={conference.id}>
                    {conference.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive">Show inactive</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clubs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clubs ({filteredClubs.length})</CardTitle>
              <CardDescription>
                Manage club information and settings
              </CardDescription>
            </div>
            <Button variant="outline" onClick={loadClubs} disabled={loadingClubs}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingClubs ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadError && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          )}

          {loadingClubs ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Season</TableHead>
                  <TableHead>Conference</TableHead>
                  <TableHead>Status</TableHead>
                  {hasEaColumn && <TableHead>EA Club ID</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClubs.map((club) => (
                  <TableRow key={club.id}>
                    <TableCell>
                      <TeamLogo
                        teamName={club.name}
                        logoUrl={club.logo_url}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{club.name}</TableCell>
                    <TableCell>{club.season?.name || "N/A"}</TableCell>
                    <TableCell>{club.conference?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={club.is_active ? "default" : "secondary"}>
                        {club.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    {hasEaColumn && (
                      <TableCell>
                        {club.ea_club_id ? (
                          <Badge variant="outline">{club.ea_club_id}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Not connected</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingClub(club)
                            setClubForm({
                              name: club.name,
                              logo_url: club.logo_url || "",
                              season_id: club.season_id,
                              ea_club_id: club.ea_club_id || "",
                              is_active: club.is_active,
                              conference_id: club.conference_id || "",
                            })
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClub(club)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredClubs.length === 0 && !loadingClubs && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No clubs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedSeason || conferenceFilter !== "all" || showInactive
                  ? "Try adjusting your filters"
                  : "Get started by adding your first club"
                }
              </p>
              {!searchQuery && !selectedSeason && conferenceFilter === "all" && !showInactive && (
                <Button onClick={() => setIsAddingClub(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Club
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Club Dialog */}
      <Dialog open={isAddingClub || !!editingClub} onOpenChange={(open) => {
        if (!open) {
          setIsAddingClub(false)
          setEditingClub(null)
          setClubForm({
            name: "",
            logo_url: "",
            season_id: 1,
            ea_club_id: "",
            is_active: true,
            conference_id: "",
          })
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingClub ? "Edit Club" : "Add New Club"}
            </DialogTitle>
            <DialogDescription>
              {editingClub ? "Update club information" : "Create a new club"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Club Name</Label>
                <Input
                  id="name"
                  value={clubForm.name}
                  onChange={(e) => setClubForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter club name"
                />
              </div>
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={clubForm.logo_url}
                  onChange={(e) => setClubForm(prev => ({ ...prev, logo_url: e.target.value }))}
                  placeholder="Enter logo URL"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="season">Season</Label>
                <Select
                  value={clubForm.season_id.toString()}
                  onValueChange={(value) => setClubForm(prev => ({ ...prev, season_id: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map(season => (
                      <SelectItem key={season.id} value={season.id.toString()}>
                        {season.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="conference">Conference</Label>
                <Select
                  value={clubForm.conference_id}
                  onValueChange={(value) => setClubForm(prev => ({ ...prev, conference_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select conference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Conference</SelectItem>
                    {conferences.map(conference => (
                      <SelectItem key={conference.id} value={conference.id}>
                        {conference.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ea_club_id">EA Club ID</Label>
                <div className="flex space-x-2">
                  <Input
                    id="ea_club_id"
                    value={clubForm.ea_club_id}
                    onChange={(e) => setClubForm(prev => ({ ...prev, ea_club_id: e.target.value }))}
                    placeholder="Enter EA Club ID"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEaSearchDialog(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={clubForm.is_active}
                  onCheckedChange={(checked) => setClubForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddingClub(false)
              setEditingClub(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveClub} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingClub ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EA Club Search Dialog */}
      <Dialog open={showEaSearchDialog} onOpenChange={setShowEaSearchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search EA Clubs</DialogTitle>
            <DialogDescription>
              Search for EA Sports FC clubs to connect
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search for club name..."
                value={eaSearchQuery}
                onChange={(e) => setEaSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchEAClubs()}
              />
              <Button onClick={searchEAClubs} disabled={isSearchingEA}>
                {isSearchingEA && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Search
              </Button>
            </div>

            {eaSearchResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {eaSearchResults.map((club) => (
                  <div
                    key={club.clubId}
                    className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted"
                    onClick={() => selectEAClub(club)}
                  >
                    <div>
                      <div className="font-medium">{club.clubName}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {club.clubId} | Platform: {club.platform}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEaSearchDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
