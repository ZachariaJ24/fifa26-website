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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Shield, 
  Ban, 
  Unlock, 
  Trash2, 
  Eye, 
  RefreshCw,
  Search,
  Filter,
  Calendar,
  MessageSquare,
  Gamepad2,
  Target,
  Crown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Database,
  Activity
} from "lucide-react"

interface UserAccount {
  id: string
  email: string
  gamer_tag?: string
  gamer_tag_id?: string
  discord_username?: string
  discord_id?: string
  primary_position?: string
  secondary_position?: string
  console?: string
  is_banned?: boolean
  ban_reason?: string
  ban_expires_at?: string
  created_at: string
  updated_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
  roles?: string[]
  team?: {
    id: string
    name: string
  }
  season_registrations?: any[]
  player_stats?: any[]
  trade_history?: any[]
  waiver_history?: any[]
}

interface EditUserForm {
  gamer_tag: string
  gamer_tag_id: string
  discord_username: string
  discord_id: string
  primary_position: string
  secondary_position: string
  console: string
  roles: string[]
}

export function UserAccountManager() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  
  const [users, setUsers] = useState<UserAccount[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([])
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<EditUserForm>({
    gamer_tag: "",
    gamer_tag_id: "",
    discord_username: "",
    discord_id: "",
    primary_position: "",
    secondary_position: "",
    console: "",
    roles: []
  })

  const availableRoles = [
    { value: "Player", label: "Player" },
    { value: "GM", label: "General Manager" },
    { value: "AGM", label: "Assistant GM" },
    { value: "Admin", label: "Administrator" }
  ]

  const positions = [
    "ST", "CF", "LW", "RW", "CAM", "CM", "CDM", "LM", "RM", 
    "CB", "LB", "RB", "LWB", "RWB", "GK"
  ]

  const consoles = ["PS5", "Xbox"]

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchQuery, filterRole, filterStatus, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          user_roles(role),
          teams(id, name),
          season_registrations(*),
          player_stats(*),
          trades!initiator_user_id(*),
          waivers(*)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const processedUsers = (data || []).map(user => ({
        ...user,
        roles: user.user_roles?.map((r: any) => r.role) || [],
        team: user.teams?.[0] || null,
        season_registrations: user.season_registrations || [],
        player_stats: user.player_stats || [],
        trade_history: user.trades || [],
        waiver_history: user.waivers || []
      }))

      setUsers(processedUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.gamer_tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.discord_username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Role filter
    if (filterRole !== "all") {
      filtered = filtered.filter(user => 
        user.roles?.includes(filterRole)
      )
    }

    // Status filter
    if (filterStatus !== "all") {
      switch (filterStatus) {
        case "active":
          filtered = filtered.filter(user => !user.is_banned && user.email_confirmed_at)
          break
        case "banned":
          filtered = filtered.filter(user => user.is_banned)
          break
        case "unconfirmed":
          filtered = filtered.filter(user => !user.email_confirmed_at)
          break
        case "registered":
          filtered = filtered.filter(user => user.season_registrations && user.season_registrations.length > 0)
          break
      }
    }

    setFilteredUsers(filtered)
  }

  const handleEditUser = (user: UserAccount) => {
    setSelectedUser(user)
    setEditForm({
      gamer_tag: user.gamer_tag || "",
      gamer_tag_id: user.gamer_tag_id || "",
      discord_username: user.discord_username || "",
      discord_id: user.discord_id || "",
      primary_position: user.primary_position || "",
      secondary_position: user.secondary_position || "",
      console: user.console || "",
      roles: user.roles || []
    })
    setEditDialogOpen(true)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return

    try {
      // Update user basic info
      const { error: userError } = await supabase
        .from("users")
        .update({
          gamer_tag: editForm.gamer_tag,
          gamer_tag_id: editForm.gamer_tag_id,
          discord_username: editForm.discord_username,
          discord_id: editForm.discord_id,
          primary_position: editForm.primary_position,
          secondary_position: editForm.secondary_position || null,
          console: editForm.console,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedUser.id)

      if (userError) throw userError

      // Update user roles
      const { error: deleteRolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.id)

      if (deleteRolesError) throw deleteRolesError

      const { error: insertRolesError } = await supabase
        .from("user_roles")
        .insert(editForm.roles.map(role => ({
          user_id: selectedUser.id,
          role
        })))

      if (insertRolesError) throw insertRolesError

      toast({
        title: "User Updated",
        description: "User account has been updated successfully",
      })

      setEditDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error: any) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          cascade: true
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete user")
      }

      toast({
        title: "User Deleted",
        description: `User ${selectedUser.email} has been completely deleted`,
      })

      setDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      })
    }
  }

  const handleBanUser = async (userId: string, reason: string, duration: "permanent" | "temporary", days?: number) => {
    try {
      const expirationDate = duration === "temporary" && days
        ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
        : null

      const { error: banError } = await supabase
        .from("banned_users")
        .insert({
          user_id: userId,
          reason,
          expires_at: expirationDate,
          banned_by: (await supabase.auth.getUser()).data.user?.id
        })

      if (banError) throw banError

      const { error: userError } = await supabase
        .from("users")
        .update({
          is_banned: true,
          ban_reason: reason,
          ban_expires_at: expirationDate
        })
        .eq("id", userId)

      if (userError) throw userError

      toast({
        title: "User Banned",
        description: `User has been ${duration === "permanent" ? "permanently" : "temporarily"} banned`,
      })

      fetchUsers()
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
      const { error: banError } = await supabase
        .from("banned_users")
        .delete()
        .eq("user_id", userId)

      if (banError) throw banError

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

      fetchUsers()
    } catch (error: any) {
      console.error("Error unbanning user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to unban user",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (user: UserAccount) => {
    if (user.is_banned) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Ban className="h-3 w-3" />
          Banned
        </Badge>
      )
    }

    if (!user.email_confirmed_at) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-yellow-500 text-yellow-600">
          <Clock className="h-3 w-3" />
          Unconfirmed
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-600">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white fifa-title">
            User Account Manager
          </h2>
          <p className="text-white fifa-subtitle">
            Comprehensive user account management and administration
          </p>
        </div>
        <Button
          onClick={fetchUsers}
          variant="outline"
          size="sm"
          className="fifa-button-enhanced"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="fifa-card-hover-enhanced">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
                <Input
                  id="search"
                  placeholder="Search by email, gamer tag, or Discord username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 fifa-search"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="role-filter">Filter by Role</Label>
              <select
                id="role-filter"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full p-2 border border-field-green-200 rounded-lg bg-white dark:bg-slate-800 dark:border-field-green-700"
              >
                <option value="all">All Roles</option>
                {availableRoles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
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
                <option value="banned">Banned</option>
                <option value="unconfirmed">Unconfirmed</option>
                <option value="registered">Season Registered</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="fifa-card-hover-enhanced">
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin text-white mx-auto mb-2" />
              <p className="text-white">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-8">
              <User className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="border border-field-green-200 dark:border-field-green-700 rounded-lg p-4 hover:bg-field-green-50 dark:hover:bg-field-green-900/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">
                            {user.gamer_tag || user.email}
                          </h3>
                          {getStatusBadge(user)}
                        </div>
                        <p className="text-sm text-white">
                          {user.email}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          {user.discord_username && (
                            <p className="text-xs text-pitch-blue-600 dark:text-pitch-blue-400 flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {user.discord_username}
                            </p>
                          )}
                          {user.primary_position && (
                            <p className="text-xs text-white flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {user.primary_position}
                            </p>
                          )}
                          {user.console && (
                            <p className="text-xs text-stadium-gold-600 dark:text-stadium-gold-400 flex items-center gap-1">
                              <Gamepad2 className="h-3 w-3" />
                              {user.console}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {user.roles?.map((role) => (
                            <Badge
                              key={role}
                              variant={role === "Admin" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.is_banned ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnbanUser(user.id)}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBanUser(user.id, "Manual ban", "temporary", 7)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user)
                          setDeleteDialogOpen(true)
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Account</DialogTitle>
            <DialogDescription>
              Update user information and roles
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gamer_tag">Gamer Tag</Label>
                <Input
                  id="gamer_tag"
                  value={editForm.gamer_tag}
                  onChange={(e) => setEditForm({ ...editForm, gamer_tag: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="gamer_tag_id">Gamer Tag ID</Label>
                <Input
                  id="gamer_tag_id"
                  value={editForm.gamer_tag_id}
                  onChange={(e) => setEditForm({ ...editForm, gamer_tag_id: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discord_username">Discord Username</Label>
                <Input
                  id="discord_username"
                  value={editForm.discord_username}
                  onChange={(e) => setEditForm({ ...editForm, discord_username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="discord_id">Discord ID</Label>
                <Input
                  id="discord_id"
                  value={editForm.discord_id}
                  onChange={(e) => setEditForm({ ...editForm, discord_id: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary_position">Primary Position</Label>
                <select
                  id="primary_position"
                  value={editForm.primary_position}
                  onChange={(e) => setEditForm({ ...editForm, primary_position: e.target.value })}
                  className="w-full p-2 border border-field-green-200 rounded-lg bg-white dark:bg-slate-800 dark:border-field-green-700"
                >
                  <option value="">Select Position</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="secondary_position">Secondary Position</Label>
                <select
                  id="secondary_position"
                  value={editForm.secondary_position}
                  onChange={(e) => setEditForm({ ...editForm, secondary_position: e.target.value })}
                  className="w-full p-2 border border-field-green-200 rounded-lg bg-white dark:bg-slate-800 dark:border-field-green-700"
                >
                  <option value="">Select Position</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="console">Console</Label>
              <select
                id="console"
                value={editForm.console}
                onChange={(e) => setEditForm({ ...editForm, console: e.target.value })}
                className="w-full p-2 border border-field-green-200 rounded-lg bg-white dark:bg-slate-800 dark:border-field-green-700"
              >
                <option value="">Select Console</option>
                {consoles.map(console => (
                  <option key={console} value={console}>{console}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Roles</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableRoles.map(role => (
                  <label key={role.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.roles.includes(role.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditForm({ ...editForm, roles: [...editForm.roles, role.value] })
                        } else {
                          setEditForm({ ...editForm, roles: editForm.roles.filter(r => r !== role.value) })
                        }
                      }}
                      className="rounded border-field-green-300"
                    />
                    <span className="text-sm">{role.label}</span>
                  </label>
                ))}
              </div>
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
              onClick={handleSaveUser}
              className="fifa-button-enhanced"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this user account? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This will permanently delete user <strong>{selectedUser.gamer_tag || selectedUser.email}</strong> and all associated data including:
                <ul className="list-disc list-inside mt-2">
                  <li>User profile and settings</li>
                  <li>Season registrations</li>
                  <li>Player statistics</li>
                  <li>Trade history</li>
                  <li>Waiver history</li>
                  <li>All related records</li>
                </ul>
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
              onClick={handleDeleteUser}
              className="fifa-button-enhanced"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}