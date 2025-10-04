"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import {
  Calendar,
  Users,
  Activity,
  Trophy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { format, parseISO, addWeeks, subWeeks } from "date-fns"

interface Club {
  id: string
  name: string
  code: string
  logo_url?: string
}

interface Player {
  id: string
  user_id: string
  users: {
    gamer_tag_id: string
    discord_id?: string
  }
}

interface Match {
  id: string
  home_club: Club
  away_club: Club
  match_date: string
}

interface AvailabilityData {
  players?: Player[]
  matches?: Match[]
}

export default function ClubAvailabilityPage() {
  const [selectedClub, setSelectedClub] = useState<string>("")
  const [clubs, setClubs] = useState<Club[]>([])
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const supabase = useSupabase()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchClubs()
  }, [])

  useEffect(() => {
    if (selectedClub) {
      fetchAvailabilityData()
    }
  }, [selectedClub, currentWeek])

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from("clubs")
        .select("id, name, code, logo_url")
        .order("name")

      if (error) throw error
      setClubs(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load clubs",
        variant: "destructive",
      })
    }
  }

  const fetchAvailabilityData = async () => {
    setLoading(true)
    try {
      // For now, just set empty data since this is a placeholder
      setAvailabilityData({
        players: [],
        matches: []
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load availability data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentWeek(subWeeks(currentWeek, 1))
    } else {
      setCurrentWeek(addWeeks(currentWeek, 1))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Available</span>
      case 'unavailable':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Unavailable</span>
      case 'injury':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Injury Reserve</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">No Response</span>
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-4">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Club Availability...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-4">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-8 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-full p-4 mr-6">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Club Availability</h1>
              <p className="text-white text-opacity-90 text-lg">
                Manage and track player availability across all clubs
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-white text-sm font-medium">
              Week of {format(currentWeek, 'MMM d, yyyy')}
            </div>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Club Selection */}
      {!selectedClub ? (
        <div className="text-center p-8">
          <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Please select a club to view availability</p>
        </div>
      ) : !availabilityData ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border p-6 text-center">
              <div className="bg-green-100 rounded-full p-3 inline-flex mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>

            <div className="bg-white rounded-lg border p-6 text-center">
              <div className="bg-red-100 rounded-full p-3 inline-flex mb-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-600">Unavailable</div>
            </div>

            <div className="bg-white rounded-lg border p-6 text-center">
              <div className="bg-orange-100 rounded-full p-3 inline-flex mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">Injury Reserve</div>
            </div>

            <div className="bg-white rounded-lg border p-6 text-center">
              <div className="bg-indigo-100 rounded-full p-3 inline-flex mb-4">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-indigo-600">0</div>
              <div className="text-sm text-gray-600">No Response</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-8">
            <h3 className="text-lg font-semibold mb-4">Availability Trends</h3>
            <p className="text-gray-600">
              Availability data will be displayed here once player responses are collected.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
