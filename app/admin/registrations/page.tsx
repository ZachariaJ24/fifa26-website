"use client"

import React, { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Download, Search, AlertCircle, RefreshCw, User, MapPin, Gamepad2, Edit, Trophy, Calendar, Users, Star, Shield, Target, Zap, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function RegistrationsPage() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [registrations, setRegistrations] = useState<any[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSeason, setActiveSeason] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedRegistration, setSelectedRegistration] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditNameOpen, setIsEditNameOpen] = useState(false)
  const [isEditPositionsOpen, setIsEditPositionsOpen] = useState(false)
  const [isEditConsoleOpen, setIsEditConsoleOpen] = useState(false)
  const [editingRegistration, setEditingRegistration] = useState<any | null>(null)
  const [newGamerTag, setNewGamerTag] = useState("")
  const [newPrimaryPosition, setNewPrimaryPosition] = useState("")
  const [newSecondaryPosition, setNewSecondaryPosition] = useState("")
  const [newConsole, setNewConsole] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [showAllRegistrations, setShowAllRegistrations] = useState(false)

  const positionOptions = [
    "Center",
    "Left Wing",
    "Right Wing",
    "Left Defense",
    "Right Defense",
    "Goalie"
  ]

  const consoleOptions = [
    "PlayStation 5",
    "Xbox Series X",
    "PC"
  ]

  // Fetch active season and registrations
  useEffect(() => {
    fetchActiveSeason()
  }, [])

  const fetchActiveSeason = async () => {
    try {
      setLoading(true)
      
      // Get active season
      const { data: seasonData, error: seasonError } = await supabase
        .from("seasons")
        .select("*")
        .eq("is_active", true)
        .single()

      if (seasonError) {
        console.error("Error fetching active season:", seasonError)
        setError("No active season found")
        return
      }

      setActiveSeason(seasonData)

      // Get registrations for active season
      const { data: registrationsData, error: registrationsError } = await supabase
        .from("season_registrations")
        .select(`
          *,
          users (
            id,
            email,
            gamer_tag,
            discord_name,
            primary_position,
            secondary_position,
            console
          ),
          clubs (
            id,
            name
          )
        `)
        .eq("season_id", seasonData.id)
        .order("created_at", { ascending: false })

      if (registrationsError) {
        console.error("Error fetching registrations:", registrationsError)
        setError("Failed to fetch registrations")
        return
      }

      setRegistrations(registrationsData || [])
      setFilteredRegistrations(registrationsData || [])
    } catch (error) {
      console.error("Error:", error)
      setError("An error occurred while fetching data")
    } finally {
      setLoading(false)
    }
  }

  // Filter registrations
  useEffect(() => {
    let filtered = registrations

    if (searchTerm) {
      filtered = filtered.filter(reg =>
        reg.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.users?.gamer_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.users?.discord_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(reg => reg.status === statusFilter)
    }

    setFilteredRegistrations(filtered)
  }, [registrations, searchTerm, statusFilter])

  const handleStatusChange = async (registrationId: string, newStatus: string) => {
    try {
      setIsUpdating(true)
      
      const { error } = await supabase
        .from("season_registrations")
        .update({ status: newStatus })
        .eq("id", registrationId)

      if (error) throw error

      toast({
        title: "Status Updated",
        description: "Registration status has been updated successfully",
      })

      await fetchActiveSeason()
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update registration status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditGamerTag = async () => {
    if (!editingRegistration || !newGamerTag.trim()) return

    try {
      setIsUpdating(true)
      
      const { error } = await supabase
        .from("users")
        .update({ gamer_tag: newGamerTag })
        .eq("id", editingRegistration.users.id)

      if (error) throw error

      toast({
        title: "Gamer Tag Updated",
        description: "Gamer tag has been updated successfully",
      })

      setIsEditNameOpen(false)
      setNewGamerTag("")
      setEditingRegistration(null)
      await fetchActiveSeason()
    } catch (error) {
      console.error("Error updating gamer tag:", error)
      toast({
        title: "Error",
        description: "Failed to update gamer tag",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditPositions = async () => {
    if (!editingRegistration || !newPrimaryPosition) return

    try {
      setIsUpdating(true)
      
      const { error } = await supabase
        .from("users")
        .update({ 
          primary_position: newPrimaryPosition,
          secondary_position: newSecondaryPosition || null
        })
        .eq("id", editingRegistration.users.id)

      if (error) throw error

      toast({
        title: "Positions Updated",
        description: "Player positions have been updated successfully",
      })

      setIsEditPositionsOpen(false)
      setNewPrimaryPosition("")
      setNewSecondaryPosition("")
      setEditingRegistration(null)
      await fetchActiveSeason()
    } catch (error) {
      console.error("Error updating positions:", error)
      toast({
        title: "Error",
        description: "Failed to update positions",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditConsole = async () => {
    if (!editingRegistration || !newConsole) return

    try {
      setIsUpdating(true)
      
      const { error } = await supabase
        .from("users")
        .update({ console: newConsole })
        .eq("id", editingRegistration.users.id)

      if (error) throw error

      toast({
        title: "Console Updated",
        description: "Player console has been updated successfully",
      })

      setIsEditConsoleOpen(false)
      setNewConsole("")
      setEditingRegistration(null)
      await fetchActiveSeason()
    } catch (error) {
      console.error("Error updating console:", error)
      toast({
        title: "Error",
        description: "Failed to update console",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const exportRegistrations = () => {
    const csvContent = [
      ["Email", "Gamer Tag", "Discord Name", "Status", "Primary Position", "Secondary Position", "Console", "Club", "Registered At"],
      ...filteredRegistrations.map(reg => [
        reg.users?.email || "",
        reg.users?.gamer_tag || "",
        reg.users?.discord_name || "",
        reg.status,
        reg.users?.primary_position || "",
        reg.users?.secondary_position || "",
        reg.users?.console || "",
        reg.clubs?.name || "No Club",
        new Date(reg.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "season-registrations.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-field-green-900 via-pitch-blue-900 to-assist-green-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-900 via-pitch-blue-900 to-assist-green-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white fifa-title mb-4">
            Season Registrations
          </h1>
          <p className="text-lg text-white fifa-subtitle max-w-4xl mx-auto">
            {activeSeason ? `Managing registrations for ${activeSeason.name}` : "Loading active season..."}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-field-green-800/50 to-field-green-900/50 border-field-green-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Total Registrations</p>
                  <p className="text-3xl font-bold text-white">{registrations.length}</p>
                </div>
                <Users className="h-8 w-8 text-field-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pitch-blue-800/50 to-pitch-blue-900/50 border-pitch-blue-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Approved</p>
                  <p className="text-3xl font-bold text-white">
                    {registrations.filter(r => r.status === "approved").length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-pitch-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-assist-green-800/50 to-assist-green-900/50 border-assist-green-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Pending</p>
                  <p className="text-3xl font-bold text-white">
                    {registrations.filter(r => r.status === "pending").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-assist-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-goal-red-800/50 to-goal-red-900/50 border-goal-red-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Rejected</p>
                  <p className="text-3xl font-bold text-white">
                    {registrations.filter(r => r.status === "rejected").length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-goal-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-gradient-to-br from-stadium-gold-800/20 to-stadium-gold-900/20 border-stadium-gold-600/30">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Registration Management
                </CardTitle>
                <CardDescription className="text-white/80">
                  Review and manage season registrations
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={exportRegistrations}
                  variant="outline"
                  className="border-field-green-600/50 text-white hover:bg-field-green-600/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  onClick={fetchActiveSeason}
                  variant="outline"
                  className="border-pitch-blue-600/50 text-white hover:bg-pitch-blue-600/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                <Input
                  placeholder="Search registrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="w-full sm:w-48 bg-white/10 border-white/20 text-white rounded-md px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Registrations Table */}
            <div className="rounded-lg border border-white/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/10">
                    <TableHead className="text-white font-semibold">Player</TableHead>
                    <TableHead className="text-white font-semibold">Status</TableHead>
                    <TableHead className="text-white font-semibold">Positions</TableHead>
                    <TableHead className="text-white font-semibold">Console</TableHead>
                    <TableHead className="text-white font-semibold">Club</TableHead>
                    <TableHead className="text-white font-semibold">Registered</TableHead>
                    <TableHead className="text-right text-white font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium text-white">{registration.users?.email}</div>
                          {registration.users?.gamer_tag && (
                            <div className="text-sm text-white/70">{registration.users.gamer_tag}</div>
                          )}
                          {registration.users?.discord_name && (
                            <div className="text-sm text-white/70">@{registration.users.discord_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            registration.status === "approved" ? "default" :
                            registration.status === "rejected" ? "destructive" : "secondary"
                          }
                          className={
                            registration.status === "approved" ? "bg-assist-green-600 text-white" :
                            registration.status === "rejected" ? "bg-goal-red-600 text-white" :
                            "bg-pitch-blue-600 text-white"
                          }
                        >
                          {registration.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-white">{registration.users?.primary_position || "N/A"}</span>
                          {registration.users?.secondary_position && (
                            <span className="text-sm text-white/70">{registration.users.secondary_position}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-white">{registration.users?.console || "N/A"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-white">{registration.clubs?.name || "No Club"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-white">
                          {new Date(registration.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRegistration(registration)
                              setIsDialogOpen(true)
                            }}
                            className="border-pitch-blue-500/50 text-pitch-blue-400 hover:bg-pitch-blue-500/20"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingRegistration(registration)
                              setNewGamerTag(registration.users?.gamer_tag || "")
                              setIsEditNameOpen(true)
                            }}
                            className="border-field-green-500/50 text-field-green-400 hover:bg-field-green-500/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredRegistrations.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No registrations found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registration Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-stadium-gold-800/20 to-stadium-gold-900/20 border-stadium-gold-600/30">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white flex items-center gap-2">
                <User className="h-6 w-6" />
                Registration Details
              </DialogTitle>
              <DialogDescription className="text-white/80">
                Review registration information and status
              </DialogDescription>
            </DialogHeader>
            {selectedRegistration && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white font-semibold">Email</Label>
                    <p className="text-white/80">{selectedRegistration.users?.email}</p>
                  </div>
                  <div>
                    <Label className="text-white font-semibold">Gamer Tag</Label>
                    <p className="text-white/80">{selectedRegistration.users?.gamer_tag || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-white font-semibold">Discord Name</Label>
                    <p className="text-white/80">{selectedRegistration.users?.discord_name || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-white font-semibold">Status</Label>
                    <Badge
                      variant={
                        selectedRegistration.status === "approved" ? "default" :
                        selectedRegistration.status === "rejected" ? "destructive" : "secondary"
                      }
                      className={
                        selectedRegistration.status === "approved" ? "bg-assist-green-600 text-white" :
                        selectedRegistration.status === "rejected" ? "bg-goal-red-600 text-white" :
                        "bg-pitch-blue-600 text-white"
                      }
                    >
                      {selectedRegistration.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-white font-semibold">Primary Position</Label>
                    <p className="text-white/80">{selectedRegistration.users?.primary_position || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-white font-semibold">Secondary Position</Label>
                    <p className="text-white/80">{selectedRegistration.users?.secondary_position || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-white font-semibold">Console</Label>
                    <p className="text-white/80">{selectedRegistration.users?.console || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-white font-semibold">Club</Label>
                    <p className="text-white/80">{selectedRegistration.clubs?.name || "No Club"}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusChange(selectedRegistration.id, "approved")}
                    disabled={isUpdating || selectedRegistration.status === "approved"}
                    className="bg-assist-green-600 hover:bg-assist-green-700 text-white"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(selectedRegistration.id, "rejected")}
                    disabled={isUpdating || selectedRegistration.status === "rejected"}
                    className="bg-goal-red-600 hover:bg-goal-red-700 text-white"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Gamer Tag Dialog */}
        <Dialog open={isEditNameOpen} onOpenChange={setIsEditNameOpen}>
          <DialogContent className="bg-gradient-to-br from-stadium-gold-800/20 to-stadium-gold-900/20 border-stadium-gold-600/30">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Edit Gamer Tag</DialogTitle>
              <DialogDescription className="text-white/80">
                Update the player's gamer tag
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="gamerTag" className="text-white font-semibold">
                  Gamer Tag
                </Label>
                <Input
                  id="gamerTag"
                  value={newGamerTag}
                  onChange={(e) => setNewGamerTag(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsEditNameOpen(false)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditGamerTag}
                disabled={isUpdating || !newGamerTag.trim()}
                className="bg-field-green-600 hover:bg-field-green-700 text-white"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Gamer Tag"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}