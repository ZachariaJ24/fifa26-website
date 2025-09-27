"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Search, 
  Filter,
  Upload,
  Image,
  Calendar,
  Clock,
  Users,
  Trophy,
  Shield,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Settings,
  Crown,
  Target,
  Activity,
  BarChart3,
  Globe,
  MapPin,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react"
import { motion } from "framer-motion"

interface Club {
  id: string
  name: string
  short_name?: string
  logo_url?: string
  description?: string
  founded_year?: number
  home_stadium?: string
  website?: string
  social_media?: {
    twitter?: string
    instagram?: string
    facebook?: string
  }
  contact_info?: {
    email?: string
    phone?: string
    address?: string
  }
  conference_id?: string
  division?: string
  is_active: boolean
  availability?: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
    preferred_times: string[]
    timezone: string
  }
  stats?: {
    wins: number
    losses: number
    draws: number
    points: number
    goals_for: number
    goals_against: number
    games_played: number
  }
  created_at: string
  updated_at: string
  conference?: {
    id: string
    name: string
    color: string
  }
}

interface ClubForm {
  name: string
  short_name: string
  logo_url: string
  description: string
  founded_year: number
  home_stadium: string
  website: string
  social_media: {
    twitter: string
    instagram: string
    facebook: string
  }
  contact_info: {
    email: string
    phone: string
    address: string
  }
  conference_id: string
  division: string
  is_active: boolean
  availability: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
    preferred_times: string[]
    timezone: string
  }
}

export default function ClubManagementPage() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [clubs, setClubs] = useState<Club[]>([])
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([])
  const [conferences, setConferences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterConference, setFilterConference] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [clubForm, setClubForm] = useState<ClubForm>({
    name: "",
    short_name: "",
    logo_url: "",
    description: "",
    founded_year: new Date().getFullYear(),
    home_stadium: "",
    website: "",
    social_media: {
      twitter: "",
      instagram: "",
      facebook: ""
    },
    contact_info: {
      email: "",
      phone: "",
      address: ""
    },
    conference_id: "",
    division: "Premier Division",
    is_active: true,
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
      preferred_times: ["20:30", "21:10", "21:50"],
      timezone: "EST"
    }
  })

  const divisions = [
    "Premier Division",
    "Championship Division",
    "League One",
    "League Two"
  ]

  const timeSlots = [
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:10", "21:20", "21:30", "21:40", "21:50", "22:00", "22:30", "23:00"
  ]

  const timezones = [
    "EST", "CST", "MST", "PST", "GMT", "CET", "JST", "AEST"
  ]

  useEffect(() => {
    checkAdminStatus()
    fetchData()
  }, [])

  useEffect(() => {
    filterClubs()
  }, [searchQuery, filterConference, filterStatus, clubs])

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)

      const isAdminUser = roles?.some(role => role.role === "Admin")
      setIsAdmin(isAdminUser)

      if (!isAdminUser) {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access this page.",
          variant: "destructive"
        })
        router.push("/")
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
      router.push("/login")
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch clubs and conferences in parallel
      const [clubsResponse, conferencesResponse] = await Promise.all([
        supabase
          .from("clubs")
          .select(`
            *,
            conference:conferences(id, name, color)
          `)
          .order("name"),
        supabase
          .from("conferences")
          .select("*")
          .order("name")
      ])

      if (clubsResponse.error) throw clubsResponse.error
      if (conferencesResponse.error) throw conferencesResponse.error

      setClubs(clubsResponse.data || [])
      setConferences(conferencesResponse.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load clubs and conferences",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterClubs = () => {
    let filtered = clubs

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(club => 
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.short_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.home_stadium?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Conference filter
    if (filterConference !== "all") {
      filtered = filtered.filter(club => 
        club.conference_id === filterConference
      )
    }

    // Status filter
    if (filterStatus !== "all") {
      switch (filterStatus) {
        case "active":
          filtered = filtered.filter(club => club.is_active)
          break
        case "inactive":
          filtered = filtered.filter(club => !club.is_active)
          break
      }
    }

    setFilteredClubs(filtered)
  }

  const handleCreateClub = async () => {
    try {
      setIsSaving(true)
      
      const { error } = await supabase
        .from("clubs")
        .insert({
          ...clubForm,
          stats: {
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            goals_for: 0,
            goals_against: 0,
            games_played: 0
          }
        })

      if (error) throw error

      toast({
        title: "Club Created",
        description: `${clubForm.name} has been created successfully`,
      })

      setCreateDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error("Error creating club:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create club",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditClub = (club: Club) => {
    setSelectedClub(club)
    setClubForm({
      name: club.name,
      short_name: club.short_name || "",
      logo_url: club.logo_url || "",
      description: club.description || "",
      founded_year: club.founded_year || new Date().getFullYear(),
      home_stadium: club.home_stadium || "",
      website: club.website || "",
      social_media: club.social_media || {
        twitter: "",
        instagram: "",
        facebook: ""
      },
      contact_info: club.contact_info || {
        email: "",
        phone: "",
        address: ""
      },
      conference_id: club.conference_id || "",
      division: club.division || "Premier Division",
      is_active: club.is_active,
      availability: club.availability || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
        preferred_times: ["20:30", "21:10", "21:50"],
        timezone: "EST"
      }
    })
    setEditDialogOpen(true)
  }

  const handleUpdateClub = async () => {
    if (!selectedClub) return

    try {
      setIsSaving(true)
      
      const { error } = await supabase
        .from("clubs")
        .update({
          ...clubForm,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedClub.id)

      if (error) throw error

      toast({
        title: "Club Updated",
        description: `${clubForm.name} has been updated successfully`,
      })

      setEditDialogOpen(false)
      setSelectedClub(null)
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error("Error updating club:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update club",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClub = async () => {
    if (!selectedClub) return

    try {
      const { error } = await supabase
        .from("clubs")
        .delete()
        .eq("id", selectedClub.id)

      if (error) throw error

      toast({
        title: "Club Deleted",
        description: `${selectedClub.name} has been deleted successfully`,
      })

      setDeleteDialogOpen(false)
      setSelectedClub(null)
      fetchData()
    } catch (error: any) {
      console.error("Error deleting club:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete club",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setClubForm({
      name: "",
      short_name: "",
      logo_url: "",
      description: "",
      founded_year: new Date().getFullYear(),
      home_stadium: "",
      website: "",
      social_media: {
        twitter: "",
        instagram: "",
        facebook: ""
      },
      contact_info: {
        email: "",
        phone: "",
        address: ""
      },
      conference_id: "",
      division: "Premier Division",
      is_active: true,
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
        preferred_times: ["20:30", "21:10", "21:50"],
        timezone: "EST"
      }
    })
  }

  const getStatusBadge = (club: Club) => {
    if (club.is_active) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1 border-red-500 text-red-600">
        <XCircle className="h-3 w-3" />
        Inactive
      </Badge>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You need administrator privileges to access this page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-field-green-800 dark:text-field-green-200 fifa-title">
                  Club Management
                </h1>
                <p className="text-field-green-600 dark:text-field-green-400 fifa-subtitle">
                  Manage football clubs, availability, and logos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchData}
                variant="outline"
                size="sm"
                className="fifa-button-enhanced"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="fifa-button-enhanced">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Club
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Club</DialogTitle>
                    <DialogDescription>
                      Add a new football club to the league
                    </DialogDescription>
                  </DialogHeader>
                  <ClubFormComponent
                    form={clubForm}
                    setForm={setClubForm}
                    conferences={conferences}
                    divisions={divisions}
                    timeSlots={timeSlots}
                    timezones={timezones}
                  />
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateClub}
                      disabled={isSaving}
                      className="fifa-button-enhanced"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Club
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="fifa-card-hover-enhanced border-2 border-field-green-200/60 dark:border-field-green-700/60 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-field-green-800 dark:text-field-green-200">
                    {clubs.length}
                  </p>
                  <p className="text-sm text-field-green-600 dark:text-field-green-400">
                    Total Clubs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fifa-card-hover-enhanced border-2 border-assist-green-200/60 dark:border-assist-green-700/60 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-assist-green-500 to-assist-green-600 rounded-lg flex items-center justify-center shadow-md">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-assist-green-800 dark:text-assist-green-200">
                    {clubs.filter(c => c.is_active).length}
                  </p>
                  <p className="text-sm text-assist-green-600 dark:text-assist-green-400">
                    Active Clubs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fifa-card-hover-enhanced border-2 border-pitch-blue-200/60 dark:border-pitch-blue-700/60 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-pitch-blue-800 dark:text-pitch-blue-200">
                    {conferences.length}
                  </p>
                  <p className="text-sm text-pitch-blue-600 dark:text-pitch-blue-400">
                    Conferences
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fifa-card-hover-enhanced border-2 border-stadium-gold-200/60 dark:border-stadium-gold-700/60 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg flex items-center justify-center shadow-md">
                  <Image className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stadium-gold-800 dark:text-stadium-gold-200">
                    {clubs.filter(c => c.logo_url).length}
                  </p>
                  <p className="text-sm text-stadium-gold-600 dark:text-stadium-gold-400">
                    With Logos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="fifa-card-hover-enhanced mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Clubs</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-field-green-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, stadium, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 fifa-search"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <Label htmlFor="conference-filter">Filter by Conference</Label>
                  <select
                    id="conference-filter"
                    value={filterConference}
                    onChange={(e) => setFilterConference(e.target.value)}
                    className="w-full p-2 border border-field-green-200 rounded-lg bg-white dark:bg-slate-800 dark:border-field-green-700"
                  >
                    <option value="all">All Conferences</option>
                    {conferences.map(conference => (
                      <option key={conference.id} value={conference.id}>
                        {conference.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:w-48">
                  <Label htmlFor="status-filter">Filter by Status</Label>
                  <select
                    id="status-filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-2 border border-field-green-200 rounded-lg bg-white dark:bg-slate-800 dark:border-field-green-700"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clubs List */}
          <Card className="fifa-card-hover-enhanced">
            <CardHeader>
              <CardTitle>Clubs ({filteredClubs.length})</CardTitle>
              <CardDescription>
                Manage football clubs and their information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-field-green-500 mx-auto mb-2" />
                  <p className="text-field-green-600">Loading clubs...</p>
                </div>
              ) : filteredClubs.length === 0 ? (
                <div className="text-center p-8">
                  <Building2 className="h-12 w-12 text-field-green-400 mx-auto mb-4" />
                  <p className="text-field-green-600">No clubs found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClubs.map((club) => (
                    <div
                      key={club.id}
                      className="border border-field-green-200 dark:border-field-green-700 rounded-lg p-4 hover:bg-field-green-50 dark:hover:bg-field-green-900/20 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {club.logo_url ? (
                            <img
                              src={club.logo_url}
                              alt={`${club.name} logo`}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-lg flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-field-green-800 dark:text-field-green-200">
                              {club.name}
                            </h3>
                            {club.short_name && (
                              <p className="text-sm text-field-green-600 dark:text-field-green-400">
                                {club.short_name}
                              </p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(club)}
                      </div>

                      <div className="space-y-2 mb-4">
                        {club.home_stadium && (
                          <p className="text-sm text-field-green-600 dark:text-field-green-400 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {club.home_stadium}
                          </p>
                        )}
                        {club.founded_year && (
                          <p className="text-sm text-field-green-600 dark:text-field-green-400 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Founded {club.founded_year}
                          </p>
                        )}
                        {club.conference && (
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ borderColor: club.conference.color, color: club.conference.color }}
                          >
                            {club.conference.name}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClub(club)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedClub(club)
                              setDeleteDialogOpen(true)
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {club.stats && (
                          <div className="text-right">
                            <p className="text-xs text-field-green-500">
                              {club.stats.wins}W - {club.stats.losses}L - {club.stats.draws}D
                            </p>
                            <p className="text-xs text-field-green-500">
                              {club.stats.points} pts
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Club Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Club</DialogTitle>
              <DialogDescription>
                Update club information and settings
              </DialogDescription>
            </DialogHeader>
            <ClubFormComponent
              form={clubForm}
              setForm={setClubForm}
              conferences={conferences}
              divisions={divisions}
              timeSlots={timeSlots}
              timezones={timezones}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateClub}
                disabled={isSaving}
                className="fifa-button-enhanced"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Club
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Club Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Club</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete this club? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedClub && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This will permanently delete <strong>{selectedClub.name}</strong> and all associated data.
                </AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteClub}
                className="fifa-button-enhanced"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Club
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Club Form Component
function ClubFormComponent({ 
  form, 
  setForm, 
  conferences, 
  divisions, 
  timeSlots, 
  timezones 
}: {
  form: ClubForm
  setForm: (form: ClubForm) => void
  conferences: any[]
  divisions: string[]
  timeSlots: string[]
  timezones: string[]
}) {
  return (
    <Tabs defaultValue="basic" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
        <TabsTrigger value="availability">Availability</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Club Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Manchester United"
            />
          </div>
          <div>
            <Label htmlFor="short_name">Short Name</Label>
            <Input
              id="short_name"
              value={form.short_name}
              onChange={(e) => setForm({ ...form, short_name: e.target.value })}
              placeholder="e.g., Man Utd"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="logo_url">Logo URL</Label>
          <Input
            id="logo_url"
            value={form.logo_url}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Club description and history..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="founded_year">Founded Year</Label>
            <Input
              id="founded_year"
              type="number"
              value={form.founded_year}
              onChange={(e) => setForm({ ...form, founded_year: parseInt(e.target.value) || new Date().getFullYear() })}
            />
          </div>
          <div>
            <Label htmlFor="home_stadium">Home Stadium</Label>
            <Input
              id="home_stadium"
              value={form.home_stadium}
              onChange={(e) => setForm({ ...form, home_stadium: e.target.value })}
              placeholder="e.g., Old Trafford"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://example.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="conference_id">Conference</Label>
            <select
              id="conference_id"
              value={form.conference_id}
              onChange={(e) => setForm({ ...form, conference_id: e.target.value })}
              className="w-full p-2 border border-field-green-200 rounded-lg bg-white dark:bg-slate-800 dark:border-field-green-700"
            >
              <option value="">Select Conference</option>
              {conferences.map(conference => (
                <option key={conference.id} value={conference.id}>
                  {conference.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="division">Division</Label>
            <select
              id="division"
              value={form.division}
              onChange={(e) => setForm({ ...form, division: e.target.value })}
              className="w-full p-2 border border-field-green-200 rounded-lg bg-white dark:bg-slate-800 dark:border-field-green-700"
            >
              {divisions.map(division => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </select>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="contact" className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.contact_info.email}
            onChange={(e) => setForm({ 
              ...form, 
              contact_info: { ...form.contact_info, email: e.target.value }
            })}
            placeholder="club@example.com"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={form.contact_info.phone}
            onChange={(e) => setForm({ 
              ...form, 
              contact_info: { ...form.contact_info, phone: e.target.value }
            })}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={form.contact_info.address}
            onChange={(e) => setForm({ 
              ...form, 
              contact_info: { ...form.contact_info, address: e.target.value }
            })}
            placeholder="Club address..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Social Media</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={form.social_media.twitter}
                onChange={(e) => setForm({ 
                  ...form, 
                  social_media: { ...form.social_media, twitter: e.target.value }
                })}
                placeholder="@clubname"
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={form.social_media.instagram}
                onChange={(e) => setForm({ 
                  ...form, 
                  social_media: { ...form.social_media, instagram: e.target.value }
                })}
                placeholder="@clubname"
              />
            </div>
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={form.social_media.facebook}
                onChange={(e) => setForm({ 
                  ...form, 
                  social_media: { ...form.social_media, facebook: e.target.value }
                })}
                placeholder="Club Name"
              />
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="availability" className="space-y-4">
        <div>
          <Label>Available Days</Label>
          <div className="grid grid-cols-7 gap-2 mt-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
              const dayKey = day.toLowerCase() as keyof typeof form.availability
              return (
                <label key={day} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.availability[dayKey]}
                    onChange={(e) => setForm({
                      ...form,
                      availability: {
                        ...form.availability,
                        [dayKey]: e.target.checked
                      }
                    })}
                    className="rounded border-field-green-300"
                  />
                  <span className="text-sm">{day.slice(0, 3)}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div>
          <Label>Preferred Times</Label>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {timeSlots.map(time => (
              <label key={time} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.availability.preferred_times.includes(time)}
                  onChange={(e) => {
                    const newTimes = e.target.checked
                      ? [...form.availability.preferred_times, time]
                      : form.availability.preferred_times.filter(t => t !== time)
                    setForm({
                      ...form,
                      availability: {
                        ...form.availability,
                        preferred_times: newTimes
                      }
                    })
                  }}
                  className="rounded border-field-green-300"
                />
                <span className="text-sm">{time}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <select
            id="timezone"
            value={form.availability.timezone}
            onChange={(e) => setForm({
              ...form,
              availability: {
                ...form.availability,
                timezone: e.target.value
              }
            })}
            className="w-full p-2 border border-field-green-200 rounded-lg bg-white dark:bg-slate-800 dark:border-field-green-700"
          >
            {timezones.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="rounded border-field-green-300"
          />
          <Label htmlFor="is_active">Active Club</Label>
        </div>
      </TabsContent>
    </Tabs>
  )
}
