"use client"

import { useState, useEffect } from "react"
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
import { 
  Ban, 
  Unlock, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar, 
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { motion } from "framer-motion"

interface BannedUser {
  id: string
  email: string
  gamer_tag?: string
  gamer_tag_id?: string
  discord_name?: string
  ban_reason?: string
  ban_expiration?: string
  created_at: string
  banned_by?: string
  is_permanent: boolean
  days_remaining?: number
}

interface BanUserForm {
  userId: string
  reason: string
  duration: "permanent" | "temporary"
  expirationDate?: string
  expirationDays?: number
}

export function EnhancedBannedUsersPanel() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<BannedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedUser, setSelectedUser] = useState<BannedUser | null>(null)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false)
  const [banForm, setBanForm] = useState<BanUserForm>({
    userId: "",
    reason: "",
    duration: "temporary",
    expirationDays: 7
  })

  useEffect(() => {
    fetchBannedUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchQuery, filterType, bannedUsers])

  const fetchBannedUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("banned_users")
        .select(`
          *,
          user:auth.users(id, email, raw_user_meta_data),
          banned_by_user:auth.users!banned_by(id, email)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const processedUsers = (data || []).map((ban: any) => {
        const meta = ban.user?.raw_user_meta_data || {}
        const isPermanent = !ban.expires_at
        const daysRemaining = ban.expires_at 
          ? Math.ceil((new Date(ban.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : null

        return {
          id: ban.user_id,
          email: ban.user?.email || "Unknown",
          gamer_tag: meta.gamer_tag || meta.gamertag,
          gamer_tag_id: meta.gamer_tag_id,
          discord_name: meta.discord_name,
          ban_reason: ban.reason,
          ban_expiration: ban.expires_at,
          created_at: ban.created_at,
          banned_by: ban.banned_by_user?.email,
          is_permanent: isPermanent,
          days_remaining: daysRemaining
        }
      })

      setBannedUsers(processedUsers)
    } catch (error) {
      console.error("Error fetching banned users:", error)
      toast({
        title: "Error",
        description: "Failed to load banned users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = bannedUsers

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.gamer_tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.discord_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Type filter
    if (filterType !== "all") {
      switch (filterType) {
        case "permanent":
          filtered = filtered.filter(user => user.is_permanent)
          break
        case "temporary":
          filtered = filtered.filter(user => !user.is_permanent)
          break
        case "expired":
          filtered = filtered.filter(user => 
            !user.is_permanent && user.days_remaining !== null && user.days_remaining <= 0
          )
          break
        case "expiring_soon":
          filtered = filtered.filter(user => 
            !user.is_permanent && user.days_remaining !== null && user.days_remaining <= 7 && user.days_remaining > 0
          )
          break
      }
    }

    setFilteredUsers(filtered)
  }

  const handleBanUser = async (formData: BanUserForm) => {
    try {
      const expirationDate = formData.duration === "temporary" && formData.expirationDays
        ? new Date(Date.now() + formData.expirationDays * 24 * 60 * 60 * 1000).toISOString()
        : null

      const { error } = await supabase
        .from("banned_users")
        .insert({
          user_id: formData.userId,
          reason: formData.reason,
          expires_at: expirationDate,
          banned_by: (await supabase.auth.getUser()).data.user?.id
        })

      if (error) throw error

      // Also update the users table
      await supabase
        .from("users")
        .update({
          is_banned: true,
          ban_reason: formData.reason,
          ban_expires_at: expirationDate
        })
        .eq("id", formData.userId)

      toast({
        title: "User Banned",
        description: `User has been ${formData.duration === "permanent" ? "permanently" : "temporarily"} banned`,
      })

      setBanDialogOpen(false)
      setBanForm({ userId: "", reason: "", duration: "temporary", expirationDays: 7 })
      fetchBannedUsers()
    } catch (error: any) {
      console.error("Error banning user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to ban user",
        variant: "destructive"
      })
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      // Remove from banned_users table
      const { error: banError } = await supabase
        .from("banned_users")
        .delete()
        .eq("user_id", userId)

      if (banError) throw banError

      // Update users table
      const { error: userError } = await supabase
        .from("users")
        .update({
          is_banned: false,
          ban_reason: null,
          ban_expires_at: null
        })
        .eq("id", userId)

      if (userError) throw userError

      toast({
        title: "User Unbanned",
        description: "User has been unbanned successfully",
      })

      setUnbanDialogOpen(false)
      setSelectedUser(null)
      fetchBannedUsers()
    } catch (error: any) {
      console.error("Error unbanning user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to unban user",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getStatusBadge = (user: BannedUser) => {
    if (user.is_permanent) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Ban className="h-3 w-3" />
          Permanent
        </Badge>
      )
    }

    if (user.days_remaining === null || user.days_remaining <= 0) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-orange-500 text-orange-600">
          <Clock className="h-3 w-3" />
          Expired
        </Badge>
      )
    }

    if (user.days_remaining <= 7) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-yellow-500 text-yellow-600">
          <AlertTriangle className="h-3 w-3" />
          Expires in {user.days_remaining} days
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1 border-blue-500 text-blue-600">
        <Clock className="h-3 w-3" />
        {user.days_remaining} days left
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-field-green-800 dark:text-field-green-200">
            Banned Users Management
          </h2>
          <p className="text-field-green-600 dark:text-field-green-400">
            Manage user bans and restrictions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchBannedUsers}
            variant="outline"
            size="sm"
            className="fifa-button-enhanced"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
            <DialogTrigger asChild>
              <Button className="fifa-button-enhanced">
                <Ban className="h-4 w-4 mr-2" />
                Ban User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ban User</DialogTitle>
                <DialogDescription>
                  Ban a user from the platform with a reason and duration.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userId">User ID or Email</Label>
                  <Input
                    id="userId"
                    value={banForm.userId}
                    onChange={(e) => setBanForm({ ...banForm, userId: e.target.value })}
                    placeholder="Enter user ID or email"
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Ban Reason</Label>
                  <Textarea
                    id="reason"
                    value={banForm.reason}
                    onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                    placeholder="Enter reason for ban"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <select
                    id="duration"
                    value={banForm.duration}
                    onChange={(e) => setBanForm({ 
                      ...banForm, 
                      duration: e.target.value as "permanent" | "temporary" 
                    })}
                    className="w-full p-2 border border-field-green-200 rounded-lg bg-white dark:bg-slate-800 dark:border-field-green-700"
                  >
                    <option value="temporary">Temporary</option>
                    <option value="permanent">Permanent</option>
                  </select>
                </div>
                {banForm.duration === "temporary" && (
                  <div>
                    <Label htmlFor="expirationDays">Duration (Days)</Label>
                    <Input
                      id="expirationDays"
                      type="number"
                      value={banForm.expirationDays}
                      onChange={(e) => setBanForm({ 
                        ...banForm, 
                        expirationDays: parseInt(e.target.value) || 7 
                      })}
                      min="1"
                      max="365"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setBanDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleBanUser(banForm)}
                  className="fifa-button-enhanced"
                >
                  Ban User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="fifa-card-hover-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Ban className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                  {bannedUsers.length}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Total Banned
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fifa-card-hover-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                  {bannedUsers.filter(u => !u.is_permanent).length}
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Temporary
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fifa-card-hover-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {bannedUsers.filter(u => u.is_permanent).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Permanent
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fifa-card-hover-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                  {bannedUsers.filter(u => 
                    !u.is_permanent && u.days_remaining !== null && u.days_remaining <= 7 && u.days_remaining > 0
                  ).length}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Expiring Soon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="fifa-card-hover-enhanced">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Banned Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-field-green-400" />
                <Input
                  id="search"
                  placeholder="Search by email, gamer tag, or Discord name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 fifa-search"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="filter">Filter by Type</Label>
              <select
                id="filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2 border border-field-green-200 rounded-lg bg-white dark:bg-slate-800 dark:border-field-green-700"
              >
                <option value="all">All Bans</option>
                <option value="permanent">Permanent</option>
                <option value="temporary">Temporary</option>
                <option value="expired">Expired</option>
                <option value="expiring_soon">Expiring Soon</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banned Users List */}
      <Card className="fifa-card-hover-enhanced">
        <CardHeader>
          <CardTitle>Banned Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage and monitor banned users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin text-field-green-500 mx-auto mb-2" />
              <p className="text-field-green-600">Loading banned users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-8">
              <Ban className="h-12 w-12 text-field-green-400 mx-auto mb-4" />
              <p className="text-field-green-600">No banned users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-field-green-200 dark:border-field-green-700 rounded-lg p-4 hover:bg-field-green-50 dark:hover:bg-field-green-900/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-field-green-800 dark:text-field-green-200">
                            {user.gamer_tag || user.email}
                          </h3>
                          {getStatusBadge(user)}
                        </div>
                        <p className="text-sm text-field-green-600 dark:text-field-green-400">
                          {user.email}
                        </p>
                        {user.discord_name && (
                          <p className="text-xs text-pitch-blue-600 dark:text-pitch-blue-400 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {user.discord_name}
                          </p>
                        )}
                        <p className="text-xs text-field-green-500 mt-1">
                          Banned on {formatDate(user.created_at)}
                          {user.banned_by && ` by ${user.banned_by}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user)
                          setUnbanDialogOpen(true)
                        }}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Unlock className="h-4 w-4 mr-1" />
                        Unban
                      </Button>
                    </div>
                  </div>
                  {user.ban_reason && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        <strong>Reason:</strong> {user.ban_reason}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unban Confirmation Dialog */}
      <Dialog open={unbanDialogOpen} onOpenChange={setUnbanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to unban this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="p-4 bg-field-green-50 dark:bg-field-green-900/20 rounded-lg">
              <p><strong>User:</strong> {selectedUser.gamer_tag || selectedUser.email}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Banned on:</strong> {formatDate(selectedUser.created_at)}</p>
              {selectedUser.ban_reason && (
                <p><strong>Reason:</strong> {selectedUser.ban_reason}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUnbanDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedUser && handleUnbanUser(selectedUser.id)}
              className="fifa-button-enhanced"
            >
              <Unlock className="h-4 w-4 mr-2" />
              Unban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
