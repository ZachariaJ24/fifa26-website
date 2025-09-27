"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, UserX, Clock, AlertCircle, Ban, Users, RefreshCw, Shield, Gavel, UserCheck, UserMinus, Search, Filter, Download, Calendar, AlertTriangle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSupabase } from "@/lib/supabase/client"

interface BannedUser {
  id: string
  email: string
  gamer_tag?: string
  gamer_tag_id?: string
  discord_name?: string
  ban_reason: string
  ban_expiration: string | null
  created_at: string
  club_name?: string
}

interface User {
  id: string
  gamer_tag_id?: string
  discord_name?: string
  is_banned: boolean
  ban_reason?: string
  ban_expiration?: string | null
}

export default function BannedUsersPage() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([])
  const [filteredBannedUsers, setFilteredBannedUsers] = useState<BannedUser[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredAllUsers, setFilteredAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [banReason, setBanReason] = useState("")
  const [banDuration, setBanDuration] = useState("permanent")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false)
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("banned")

  // Check if user is admin
  useEffect(() => {
    if (session?.user?.email) {
      checkAdminStatus()
    }
  }, [session])

  const checkAdminStatus = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("email", session?.user?.email)
        .single()

      if (userError || !userData || userData.role !== "Admin") {
        router.push("/dashboard")
        return
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
      router.push("/dashboard")
    }
  }

  // Fetch data
  useEffect(() => {
    if (session?.user?.email) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch banned users
      const { data: bannedData, error: bannedError } = await supabase
        .from("users")
        .select(`
          *,
          clubs:club_id (
            name
          )
        `)
        .eq("is_banned", true)
        .order("created_at", { ascending: false })

      if (bannedError) throw bannedError

      const bannedUsersWithClubNames = bannedData?.map(user => ({
        ...user,
        club_name: user.clubs?.name || null
      })) || []

      setBannedUsers(bannedUsersWithClubNames)
      setFilteredBannedUsers(bannedUsersWithClubNames)

      // Fetch all users for banning
      const { data: allUsersData, error: allUsersError } = await supabase
        .from("users")
        .select(`
          *,
          clubs:club_id (
            name
          )
        `)
        .eq("is_banned", false)
        .order("created_at", { ascending: false })

      if (allUsersError) throw allUsersError

      const allUsersWithClubNames = allUsersData?.map(user => ({
        ...user,
        club_name: user.clubs?.name || null
      })) || []

      setAllUsers(allUsersWithClubNames)
      setFilteredAllUsers(allUsersWithClubNames)

    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  // Filter functions
  useEffect(() => {
    let filtered = activeTab === "banned" ? bannedUsers : allUsers

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.gamer_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.discord_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (activeTab === "banned") {
      setFilteredBannedUsers(filtered)
    } else {
      setFilteredAllUsers(filtered)
    }
  }, [bannedUsers, allUsers, searchTerm, activeTab])

  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) {
      setError("Please provide a ban reason")
      return
    }

    try {
      setIsUpdating(true)
      setError(null)

      const banExpiration = banDuration === "permanent" 
        ? null 
        : new Date(Date.now() + parseInt(banDuration) * 24 * 60 * 60 * 1000).toISOString()

      const { error } = await supabase
        .from("users")
        .update({
          is_banned: true,
          ban_reason: banReason,
          ban_expiration: banExpiration
        })
        .eq("id", selectedUser.id)

      if (error) throw error

      toast({
        title: "User Banned",
        description: `${selectedUser.email} has been banned successfully`,
      })

      setIsBanDialogOpen(false)
      setBanReason("")
      setBanDuration("permanent")
      setSelectedUser(null)
      await fetchData()
    } catch (error) {
      console.error("Error banning user:", error)
      setError("Failed to ban user")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      setIsUpdating(true)
      setError(null)

      const { error } = await supabase
        .from("users")
        .update({
          is_banned: false,
          ban_reason: null,
          ban_expiration: null
        })
        .eq("id", userId)

      if (error) throw error

      toast({
        title: "User Unbanned",
        description: "User has been unbanned successfully",
      })

      setIsUnbanDialogOpen(false)
      await fetchData()
    } catch (error) {
      console.error("Error unbanning user:", error)
      setError("Failed to unban user")
    } finally {
      setIsUpdating(false)
    }
  }

  const exportBannedUsers = () => {
    const csvContent = [
      ["Email", "Gamer Tag", "Discord Name", "Ban Reason", "Ban Expiration", "Banned At", "Club"],
      ...filteredBannedUsers.map(user => [
        user.email,
        user.gamer_tag || "",
        user.discord_name || "",
        user.ban_reason,
        user.ban_expiration ? new Date(user.ban_expiration).toLocaleDateString() : "Permanent",
        new Date(user.created_at).toLocaleDateString(),
        user.club_name || ""
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "banned-users.csv"
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
          <h1 className="text-4xl md:text-5xl font-bold text-white hockey-title mb-4">
            Banned Users Management
          </h1>
          <p className="text-lg text-white hockey-subtitle mb-8">
            Manage user access and maintain community standards. 
            View, unban, and track banned users across the platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-goal-red-800/50 to-goal-red-900/50 border-goal-red-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Banned Users</p>
                  <p className="text-3xl font-bold text-white">{bannedUsers.length}</p>
                </div>
                <Ban className="h-8 w-8 text-goal-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-field-green-800/50 to-field-green-900/50 border-field-green-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Active Users</p>
                  <p className="text-3xl font-bold text-white">{allUsers.length}</p>
                </div>
                <Users className="h-8 w-8 text-field-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pitch-blue-800/50 to-pitch-blue-900/50 border-pitch-blue-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Permanent Bans</p>
                  <p className="text-3xl font-bold text-white">
                    {bannedUsers.filter(u => !u.ban_expiration).length}
                  </p>
                </div>
                <Gavel className="h-8 w-8 text-pitch-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-assist-green-800/50 to-assist-green-900/50 border-assist-green-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Temporary Bans</p>
                  <p className="text-3xl font-bold text-white">
                    {bannedUsers.filter(u => u.ban_expiration).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-assist-green-400" />
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
                  <Shield className="h-6 w-6" />
                  User Management
                </CardTitle>
                <CardDescription className="text-white/80">
                  Ban and unban users to maintain community standards
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {activeTab === "banned" && (
                  <Button
                    onClick={exportBannedUsers}
                    variant="outline"
                    className="border-field-green-600/50 text-white hover:bg-field-green-600/20"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                )}
                <Button
                  onClick={fetchData}
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="banned" className="text-white data-[state=active]:bg-goal-red-600/50">
                  <Ban className="h-4 w-4 mr-2" />
                  Banned Users ({bannedUsers.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-white data-[state=active]:bg-field-green-600/50">
                  <Users className="h-4 w-4 mr-2" />
                  Active Users ({allUsers.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="banned" className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                  <Input
                    placeholder="Search banned users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>

                {/* Banned Users Table */}
                <div className="rounded-lg border border-white/20 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-white/10">
                        <TableHead className="text-white font-semibold">User</TableHead>
                        <TableHead className="text-white font-semibold">Ban Reason</TableHead>
                        <TableHead className="text-white font-semibold">Duration</TableHead>
                        <TableHead className="text-white font-semibold">Banned At</TableHead>
                        <TableHead className="text-white font-semibold">Club</TableHead>
                        <TableHead className="text-right text-white font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBannedUsers.map((user) => (
                        <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="font-medium text-white">{user.email}</div>
                              {user.gamer_tag && (
                                <div className="text-sm text-white/70">{user.gamer_tag}</div>
                              )}
                              {user.discord_name && (
                                <div className="text-sm text-white/70">@{user.discord_name}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-white">{user.ban_reason}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                user.ban_expiration
                                  ? "border-assist-green-500 text-assist-green-400"
                                  : "border-goal-red-500 text-goal-red-400"
                              }
                            >
                              {user.ban_expiration ? "Temporary" : "Permanent"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-white">
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-white">
                              {user.club_name || "No Club"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnbanUser(user.id)}
                              className="border-assist-green-500/50 text-assist-green-400 hover:bg-assist-green-500/20"
                              disabled={isUpdating}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredBannedUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Ban className="h-12 w-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">No banned users found</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active" className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
                  <Input
                    placeholder="Search active users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>

                {/* Active Users Table */}
                <div className="rounded-lg border border-white/20 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-white/10">
                        <TableHead className="text-white font-semibold">User</TableHead>
                        <TableHead className="text-white font-semibold">Role</TableHead>
                        <TableHead className="text-white font-semibold">Status</TableHead>
                        <TableHead className="text-white font-semibold">Club</TableHead>
                        <TableHead className="text-white font-semibold">Joined</TableHead>
                        <TableHead className="text-right text-white font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAllUsers.map((user) => (
                        <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="font-medium text-white">{user.email}</div>
                              {user.gamer_tag && (
                                <div className="text-sm text-white/70">{user.gamer_tag}</div>
                              )}
                              {user.discord_name && (
                                <div className="text-sm text-white/70">@{user.discord_name}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                user.role === "Admin"
                                  ? "border-goal-red-500 text-goal-red-400"
                                  : user.role === "Owner"
                                  ? "border-stadium-gold-500 text-stadium-gold-400"
                                  : user.role === "GM"
                                  ? "border-pitch-blue-500 text-pitch-blue-400"
                                  : "border-field-green-500 text-field-green-400"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.is_verified ? "default" : "destructive"}
                              className={
                                user.is_verified
                                  ? "bg-assist-green-600 text-white"
                                  : "bg-goal-red-600 text-white"
                              }
                            >
                              {user.is_verified ? "Verified" : "Unverified"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-white">
                              {user.club_name || "No Club"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-white">
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user)
                                setIsBanDialogOpen(true)
                              }}
                              className="border-goal-red-500/50 text-goal-red-400 hover:bg-goal-red-500/20"
                              disabled={isUpdating}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredAllUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">No active users found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Ban User Dialog */}
        <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-stadium-gold-800/20 to-stadium-gold-900/20 border-stadium-gold-600/30">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white flex items-center gap-2">
                <Ban className="h-6 w-6 text-goal-red-400" />
                Ban User
              </DialogTitle>
              <DialogDescription className="text-white/80">
                Ban {selectedUser?.email} from the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="banReason" className="text-white font-semibold">
                  Ban Reason
                </Label>
                <Textarea
                  id="banReason"
                  placeholder="Enter the reason for banning this user..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banDuration" className="text-white font-semibold">
                  Ban Duration
                </Label>
                <Select value={banDuration} onValueChange={setBanDuration}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && (
                <Alert className="bg-goal-red-900/20 border-goal-red-600/30">
                  <AlertCircle className="h-5 w-5 text-goal-red-400" />
                  <AlertDescription className="text-goal-red-200">{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsBanDialogOpen(false)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBanUser}
                disabled={isUpdating || !banReason.trim()}
                className="bg-goal-red-600 hover:bg-goal-red-700 text-white"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Banning...
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    Ban User
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}