"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { 
  Calendar, 
  Clock, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Save,
  Edit,
  Eye,
  Users,
  MapPin,
  Globe
} from "lucide-react"
import { motion } from "framer-motion"

interface Club {
  id: string
  name: string
  short_name?: string
  logo_url?: string
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
  is_active: boolean
  available_on_date?: boolean
  scheduled_games?: any[]
}

interface AvailabilityForm {
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

export function ClubAvailabilityManager() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  
  const [clubs, setClubs] = useState<Club[]>([])
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [availabilityForm, setAvailabilityForm] = useState<AvailabilityForm>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
    preferred_times: ["20:30", "21:10", "21:50"],
    timezone: "EST"
  })

  const timeSlots = [
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:10", "21:20", "21:30", "21:40", "21:50", "22:00", "22:30", "23:00"
  ]

  const timezones = [
    "EST", "CST", "MST", "PST", "GMT", "CET", "JST", "AEST"
  ]

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" }
  ]

  useEffect(() => {
    fetchClubs()
  }, [selectedDate])

  useEffect(() => {
    filterClubs()
  }, [searchQuery, filterStatus, clubs])

  const fetchClubs = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/admin/clubs/availability?date=${selectedDate}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch clubs")
      }

      setClubs(data)
    } catch (error) {
      console.error("Error fetching clubs:", error)
      toast({
        title: "Error",
        description: "Failed to load club availability",
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
        club.short_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== "all") {
      switch (filterStatus) {
        case "available":
          filtered = filtered.filter(club => club.available_on_date !== false)
          break
        case "unavailable":
          filtered = filtered.filter(club => club.available_on_date === false)
          break
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

  const handleEditAvailability = (club: Club) => {
    setSelectedClub(club)
    setAvailabilityForm(club.availability || {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
      preferred_times: ["20:30", "21:10", "21:50"],
      timezone: "EST"
    })
    setEditDialogOpen(true)
  }

  const handleSaveAvailability = async () => {
    if (!selectedClub) return

    try {
      setIsSaving(true)
      
      const response = await fetch("/api/admin/clubs/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          club_id: selectedClub.id,
          availability: availabilityForm
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update availability")
      }

      toast({
        title: "Availability Updated",
        description: `${selectedClub.name}'s availability has been updated successfully`,
      })

      setEditDialogOpen(false)
      setSelectedClub(null)
      fetchClubs()
    } catch (error: any) {
      console.error("Error updating availability:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update availability",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getAvailabilityStatus = (club: Club) => {
    if (club.available_on_date === false) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Scheduled
        </Badge>
      )
    }

    if (!club.is_active) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-gray-500 text-gray-600">
          <XCircle className="h-3 w-3" />
          Inactive
        </Badge>
      )
    }

    const availableDays = club.availability ? 
      Object.values(club.availability).filter((value, index) => 
        index < 7 && value === true
      ).length : 0

    if (availableDays === 0) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-yellow-500 text-yellow-600">
          <AlertTriangle className="h-3 w-3" />
          No Days
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-600">
        <CheckCircle2 className="h-3 w-3" />
        Available
      </Badge>
    )
  }

  const getDayAvailability = (club: Club) => {
    if (!club.availability) return "No schedule set"
    
    const availableDays = days.filter(day => 
      club.availability![day.key as keyof typeof club.availability] === true
    ).map(day => day.label.slice(0, 3))

    return availableDays.length > 0 ? availableDays.join(", ") : "No days set"
  }

  const getPreferredTimes = (club: Club) => {
    if (!club.availability?.preferred_times || club.availability.preferred_times.length === 0) {
      return "No preferred times"
    }
    
    return club.availability.preferred_times.join(", ")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-field-green-800 dark:text-field-green-200">
            Club Availability Management
          </h2>
          <p className="text-field-green-600 dark:text-field-green-400">
            Manage club availability and scheduling preferences
          </p>
        </div>
        <Button
          onClick={fetchClubs}
          variant="outline"
          size="sm"
          className="fifa-button-enhanced"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Date Selector */}
      <Card className="fifa-card-hover-enhanced">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div>
              <Label htmlFor="date">Check Availability For Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="fifa-search"
              />
            </div>
            <div className="text-sm text-field-green-600 dark:text-field-green-400">
              <p>Showing availability for {new Date(selectedDate).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="fifa-card-hover-enhanced">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Clubs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-field-green-400" />
                <Input
                  id="search"
                  placeholder="Search by club name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 fifa-search"
                />
              </div>
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
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="active">Active Clubs</option>
                <option value="inactive">Inactive Clubs</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clubs List */}
      <Card className="fifa-card-hover-enhanced">
        <CardHeader>
          <CardTitle>Club Availability ({filteredClubs.length})</CardTitle>
          <CardDescription>
            Manage club availability and scheduling preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin text-field-green-500 mx-auto mb-2" />
              <p className="text-field-green-600">Loading club availability...</p>
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="text-center p-8">
              <Building2 className="h-12 w-12 text-field-green-400 mx-auto mb-4" />
              <p className="text-field-green-600">No clubs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClubs.map((club) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-field-green-200 dark:border-field-green-700 rounded-lg p-4 hover:bg-field-green-50 dark:hover:bg-field-green-900/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-field-green-800 dark:text-field-green-200">
                            {club.name}
                          </h3>
                          {club.short_name && (
                            <span className="text-sm text-field-green-600 dark:text-field-green-400">
                              ({club.short_name})
                            </span>
                          )}
                          {getAvailabilityStatus(club)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-field-green-600 dark:text-field-green-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {getDayAvailability(club)}
                          </p>
                          <p className="text-sm text-field-green-600 dark:text-field-green-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getPreferredTimes(club)}
                          </p>
                          {club.availability?.timezone && (
                            <p className="text-xs text-field-green-500">
                              Timezone: {club.availability.timezone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAvailability(club)}
                        className="fifa-button-enhanced"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  {club.scheduled_games && club.scheduled_games.length > 0 && (
                    <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                        Scheduled Games:
                      </p>
                      <div className="space-y-1 mt-1">
                        {club.scheduled_games.map((game, index) => (
                          <p key={index} className="text-xs text-orange-700 dark:text-orange-300">
                            {new Date(game.scheduled_time).toLocaleTimeString()} - {game.status}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Availability Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Club Availability</DialogTitle>
            <DialogDescription>
              Update {selectedClub?.name}'s availability schedule and preferences
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Available Days */}
            <div>
              <Label>Available Days</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {days.map((day) => (
                  <label key={day.key} className="flex flex-col items-center gap-2 p-2 border rounded-lg hover:bg-field-green-50 dark:hover:bg-field-green-900/20">
                    <input
                      type="checkbox"
                      checked={availabilityForm[day.key as keyof AvailabilityForm] as boolean}
                      onChange={(e) => setAvailabilityForm({
                        ...availabilityForm,
                        [day.key]: e.target.checked
                      })}
                      className="rounded border-field-green-300"
                    />
                    <span className="text-sm font-medium">{day.label.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferred Times */}
            <div>
              <Label>Preferred Times</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {timeSlots.map(time => (
                  <label key={time} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-field-green-50 dark:hover:bg-field-green-900/20">
                    <input
                      type="checkbox"
                      checked={availabilityForm.preferred_times.includes(time)}
                      onChange={(e) => {
                        const newTimes = e.target.checked
                          ? [...availabilityForm.preferred_times, time]
                          : availabilityForm.preferred_times.filter(t => t !== time)
                        setAvailabilityForm({
                          ...availabilityForm,
                          preferred_times: newTimes
                        })
                      }}
                      className="rounded border-field-green-300"
                    />
                    <span className="text-sm">{time}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Timezone */}
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={availabilityForm.timezone}
                onChange={(e) => setAvailabilityForm({
                  ...availabilityForm,
                  timezone: e.target.value
                })}
                className="w-full p-2 border border-field-green-200 rounded-lg bg-white dark:bg-slate-800 dark:border-field-green-700"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAvailability}
              disabled={isSaving}
              className="fifa-button-enhanced"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
