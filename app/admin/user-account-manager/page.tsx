"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search, RefreshCw, User, Edit, Trash2, Ban, UserCheck, Download } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { useSupabase } from "@/lib/supabase/client"

interface User {
  id: string
  email: string
  gamer_tag?: string
  discord_name?: string
  role: string
  is_verified: boolean
  created_at: string
  last_sign_in_at?: string
  club_id?: string
  club_name?: string
  is_banned: boolean
  ban_reason?: string
  primary_position?: string
  secondary_position?: string
  console?: string
}

export default function UserAccountManagerPage() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    gamer_tag: "",
    discord_name: "",
    role: "",
    primary_position: "",
    secondary_position: "",
    console: ""
  })
  const [banForm, setBanForm] = useState({
    reason: "",
    duration: "permanent"
  })

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

  // Fetch users
  useEffect(() => {
    if (session?.user?.email) {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          clubs:club_id (
            name
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const usersWithClubNames = data?.map(user => ({
        ...user,
        club_name: user.clubs?.name || null
      })) || []

      setUsers(usersWithClubNames)
      setFilteredUsers(usersWithClubNames)
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  // Filter users
  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.gamer_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.discord_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    if (statusFilter) {
      if (statusFilter === "verified") {
        filtered = filtered.filter(user => user.is_verified)
      } else if (statusFilter === "unverified") {
        filtered = filtered.filter(user => !user.is_verified)
      } else if (statusFilter === "banned") {
        filtered = filtered.filter(user => user.is_banned)
      } else if (statusFilter === "active") {
        filtered = filtered.filter(user => !user.is_banned && user.is_verified)
      }
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      gamer_tag: user.gamer_tag || "",
      discord_name: user.discord_name || "",
      role: user.role,
      primary_position: user.primary_position || "",
      secondary_position: user.secondary_position || "",
      console: user.console || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedUser) return

    try {
      setIsUpdating(true)
      
      const { error } = await supabase
        .from("users")
        .update({
          gamer_tag: editForm.gamer_tag || null,
          discord_name: editForm.discord_name || null,
          role: editForm.role,
          primary_position: editForm.primary_position || null,
          secondary_position: editForm.secondary_position || null,
          console: editForm.console || null
        })
        .eq("id", selectedUser.id)

      if (error) throw error

      toast({
        title: "User Updated",
        description: "User account has been updated successfully",
      })

      setIsEditDialogOpen(false)
      setSelectedUser(null)
      await fetchUsers()
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBanUser = (user: User) => {
    setSelectedUser(user)
    setBanForm({ reason: "", duration: "permanent" })
    setIsBanDialogOpen(true)
  }

  const handleConfirmBan = async () => {
    if (!selectedUser) return

    try {
      setIsUpdating(true)
      
      const banExpiration = banForm.duration === "permanent" 
        ? null 
        : new Date(Date.now() + parseInt(banForm.duration) * 24 * 60 * 60 * 1000).toISOString()

      const { error } = await supabase
        .from("users")
        .update({
          is_banned: true,
          ban_reason: banForm.reason,
          ban_expiration: banExpiration
        })
        .eq("id", selectedUser.id)

      if (error) throw error

      toast({
        title: "User Banned",
        description: `${selectedUser.email} has been banned successfully`,
      })

      setIsBanDialogOpen(false)
      setSelectedUser(null)
      await fetchUsers()
    } catch (error) {
      console.error("Error banning user:", error)
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      setIsUpdating(true)
      
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

      await fetchUsers()
    } catch (error) {
      console.error("Error unbanning user:", error)
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return

    try {
      setIsUpdating(true)
      
      // Delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(selectedUser.id)
      if (authError) {
        console.error("Auth deletion error:", authError)
        // Continue with database deletion
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("users")
        .delete()
        .eq("id", selectedUser.id)

      if (dbError) throw dbError

      toast({
        title: "User Deleted",
        description: `${selectedUser.email} has been deleted successfully`,
      })

      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
      await fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const exportUsers = () => {
    const csvContent = [
      ["Email", "Gamer Tag", "Discord Name", "Role", "Verified", "Banned", "Club", "Primary Position", "Console", "Created At"],
      ...filteredUsers.map(user => [
        user.email,
        user.gamer_tag || "",
        user.discord_name || "",
        user.role,
        user.is_verified ? "Yes" : "No",
        user.is_banned ? "Yes" : "No",
        user.club_name || "",
        user.primary_position || "",
        user.console || "",
        new Date(user.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "users.csv"
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            User Account Manager
          </h1>
          <p className="text-lg text-white max-w-4xl mx-auto">
            Comprehensive user account management and administration
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-field-green-800/50 to-field-green-900/50 border-field-green-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Total Users</p>
                  <p className="text-3xl font-bold text-white">{users.length}</p>
                </div>
                <User className="h-8 w-8 text-field-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pitch-blue-800/50 to-pitch-blue-900/50 border-pitch-blue-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Verified Users</p>
                  <p className="text-3xl font-bold text-white">
                    {users.filter(u => u.is_verified).length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-pitch-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-assist-green-800/50 to-assist-green-900/50 border-assist-green-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Active Users</p>
                  <p className="text-3xl font-bold text-white">
                    {users.filter(u => !u.is_banned && u.is_verified).length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-assist-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-goal-red-800/50 to-goal-red-900/50 border-goal-red-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Banned Users</p>
                  <p className="text-3xl font-bold text-white">
                    {users.filter(u => u.is_banned).length}
                  </p>
                </div>
                <Ban className="h-8 w-8 text-goal-red-400" />
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
                  <User className="h-6 w-6" />
                  User Directory
                </CardTitle>
                <CardDescription className="text-white/80">
                  Manage and monitor all system users
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={exportUsers}
                  variant="outline"
                  className="border-field-green-600/50 text-white hover:bg-field-green-600/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  onClick={fetchUsers}
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
              <Select value={roleFilter || ""} onValueChange={(value) => setRoleFilter(value || null)}>
                <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  <SelectItem value="Player">Player</SelectItem>
                  <SelectItem value="GM">GM</SelectItem>
                  <SelectItem value="AGM">AGM</SelectItem>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
                <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="rounded-lg border border-white/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/10">
                    <TableHead className="text-white font-semibold">User</TableHead>
                    <TableHead className="text-white font-semibold">Role</TableHead>
                    <TableHead className="text-white font-semibold">Status</TableHead>
                    <TableHead className="text-white font-semibold">Club</TableHead>
                    <TableHead className="text-white font-semibold">Position</TableHead>
                    <TableHead className="text-white font-semibold">Console</TableHead>
                    <TableHead className="text-right text-white font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
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
                        <div className="flex flex-col gap-1">
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
                          {user.is_banned && (
                            <Badge variant="destructive" className="bg-goal-red-600 text-white">
                              Banned
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-white">
                          {user.club_name || "No Club"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-white">{user.primary_position || "N/A"}</span>
                          {user.secondary_position && (
                            <span className="text-sm text-white/70">{user.secondary_position}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-white">{user.console || "N/A"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                            className="border-pitch-blue-500/50 text-pitch-blue-400 hover:bg-pitch-blue-500/20"
                            disabled={isUpdating}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!user.is_banned ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBanUser(user)}
                              className="border-goal-red-500/50 text-goal-red-400 hover:bg-goal-red-500/20"
                              disabled={isUpdating}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnbanUser(user.id)}
                              className="border-assist-green-500/50 text-assist-green-400 hover:bg-assist-green-500/20"
                              disabled={isUpdating}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user)}
                            className="border-goal-red-500/50 text-goal-red-400 hover:bg-goal-red-500/20"
                            disabled={isUpdating}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No users found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-stadium-gold-800/20 to-stadium-gold-900/20 border-stadium-gold-600/30">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white flex items-center gap-2">
                <Edit className="h-6 w-6" />
                Edit User
              </DialogTitle>
              <DialogDescription className="text-white/80">
                Update user account information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gamerTag" className="text-white font-semibold">
                    Gamer Tag
                  </Label>
                  <Input
                    id="gamerTag"
                    value={editForm.gamer_tag}
                    onChange={(e) => setEditForm({...editForm, gamer_tag: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                <div>
                  <Label htmlFor="discordName" className="text-white font-semibold">
                    Discord Name
                  </Label>
                  <Input
                    id="discordName"
                    value={editForm.discord_name}
                    onChange={(e) => setEditForm({...editForm, discord_name: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-white font-semibold">
                    Role
                  </Label>
                  <Select value={editForm.role} onValueChange={(value) => setEditForm({...editForm, role: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Player">Player</SelectItem>
                      <SelectItem value="GM">GM</SelectItem>
                      <SelectItem value="AGM">AGM</SelectItem>
                      <SelectItem value="Owner">Owner</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="console" className="text-white font-semibold">
                    Console
                  </Label>
                  <Select value={editForm.console} onValueChange={(value) => setEditForm({...editForm, console: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PlayStation 5">PlayStation 5</SelectItem>
                      <SelectItem value="Xbox Series X">Xbox Series X</SelectItem>
                      <SelectItem value="PC">PC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="primaryPosition" className="text-white font-semibold">
                    Primary Position
                  </Label>
                  <Select value={editForm.primary_position} onValueChange={(value) => setEditForm({...editForm, primary_position: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Center">Center</SelectItem>
                      <SelectItem value="Left Wing">Left Wing</SelectItem>
                      <SelectItem value="Right Wing">Right Wing</SelectItem>
                      <SelectItem value="Left Defense">Left Defense</SelectItem>
                      <SelectItem value="Right Defense">Right Defense</SelectItem>
                      <SelectItem value="Goalie">Goalie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="secondaryPosition" className="text-white font-semibold">
                    Secondary Position
                  </Label>
                  <Select value={editForm.secondary_position} onValueChange={(value) => setEditForm({...editForm, secondary_position: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="Center">Center</SelectItem>
                      <SelectItem value="Left Wing">Left Wing</SelectItem>
                      <SelectItem value="Right Wing">Right Wing</SelectItem>
                      <SelectItem value="Left Defense">Left Defense</SelectItem>
                      <SelectItem value="Right Defense">Right Defense</SelectItem>
                      <SelectItem value="Goalie">Goalie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsEditDialogOpen(false)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="bg-field-green-600 hover:bg-field-green-700 text-white"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              <div>
                <Label htmlFor="banReason" className="text-white font-semibold">
                  Ban Reason
                </Label>
                <Textarea
                  id="banReason"
                  placeholder="Enter the reason for banning this user..."
                  value={banForm.reason}
                  onChange={(e) => setBanForm({...banForm, reason: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
              <div>
                <Label htmlFor="banDuration" className="text-white font-semibold">
                  Ban Duration
                </Label>
                <Select value={banForm.duration} onValueChange={(value) => setBanForm({...banForm, duration: value})}>
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
                onClick={handleConfirmBan}
                disabled={isUpdating || !banForm.reason.trim()}
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

        {/* Delete User Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-stadium-gold-800/20 to-stadium-gold-900/20 border-stadium-gold-600/30">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white flex items-center gap-2">
                <Trash2 className="h-6 w-6 text-goal-red-400" />
                Delete User
              </DialogTitle>
              <DialogDescription className="text-white/80">
                Are you sure you want to permanently delete {selectedUser?.email}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => setIsDeleteDialogOpen(false)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={isUpdating}
                className="bg-goal-red-600 hover:bg-goal-red-700 text-white"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
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
