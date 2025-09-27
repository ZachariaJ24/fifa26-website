"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search, RefreshCw, User, AlertCircle, CheckCircle, XCircle, Database, UserX, AlertTriangle, Trash2, UserPlus, Download, Clock, Phone } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSupabase } from "@/lib/supabase/client"

interface OrphanedUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
  phone?: string
  user_metadata?: any
  is_orphaned: boolean
  reason: string
}

export default function OrphanedAuthUsersPage() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [orphanedUsers, setOrphanedUsers] = useState<OrphanedUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<OrphanedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<OrphanedUser | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    gamer_tag: "",
    discord_name: "",
    role: "Player"
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

  // Fetch orphaned users
  useEffect(() => {
    if (session?.user?.email) {
      fetchOrphanedUsers()
    }
  }, [session])

  const fetchOrphanedUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      if (authError) throw authError

      // Get all database users
      const { data: dbUsers, error: dbError } = await supabase
        .from("users")
        .select("id, email")
      if (dbError) throw dbError

      const dbUserIds = new Set(dbUsers?.map(user => user.id) || [])
      
      // Find orphaned users (exist in auth but not in database)
      const orphaned = authUsers.users
        .filter(authUser => !dbUserIds.has(authUser.id))
        .map(authUser => ({
          ...authUser,
          is_orphaned: true,
          reason: "Exists in auth but not in database"
        }))

      setOrphanedUsers(orphaned)
      setFilteredUsers(orphaned)
    } catch (error) {
      console.error("Error fetching orphaned users:", error)
      setError("Failed to fetch orphaned users")
    } finally {
      setLoading(false)
    }
  }

  // Filter users
  useEffect(() => {
    let filtered = orphanedUsers

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_metadata?.gamer_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_metadata?.discord_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [orphanedUsers, searchTerm])

  const handleDeleteOrphanedUser = async (userId: string) => {
    try {
      setIsUpdating(true)
      
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error

      toast({
        title: "User Deleted",
        description: "Orphaned user has been deleted successfully",
      })

      await fetchOrphanedUsers()
    } catch (error) {
      console.error("Error deleting orphaned user:", error)
      toast({
        title: "Error",
        description: "Failed to delete orphaned user",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCreateUser = async () => {
    if (!createForm.email.trim() || !createForm.password.trim()) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsUpdating(true)
      setError(null)

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: createForm.email,
        password: createForm.password,
        email_confirm: true,
        user_metadata: {
          gamer_tag: createForm.gamer_tag || null,
          discord_name: createForm.discord_name || null
        }
      })

      if (authError) throw authError

      // Create database user
      const { error: dbError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: createForm.email,
          gamer_tag: createForm.gamer_tag || null,
          discord_name: createForm.discord_name || null,
          role: createForm.role,
          is_verified: true
        })

      if (dbError) throw dbError

      toast({
        title: "User Created",
        description: "User has been created successfully in both auth and database",
      })

      setIsCreateDialogOpen(false)
      setCreateForm({
        email: "",
        password: "",
        gamer_tag: "",
        discord_name: "",
        role: "Player"
      })
      await fetchOrphanedUsers()
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const exportOrphanedUsers = () => {
    const csvContent = [
      ["Email", "Created At", "Last Sign In", "Email Confirmed", "Phone", "Reason"],
      ...filteredUsers.map(user => [
        user.email,
        new Date(user.created_at).toLocaleDateString(),
        user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never",
        user.email_confirmed_at ? "Yes" : "No",
        user.phone || "",
        user.reason
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "orphaned-auth-users.csv"
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
            Orphaned Auth Users
          </h1>
          <p className="text-lg text-white max-w-4xl mx-auto">
            Manage users that exist in the authentication system but not in the database, or vice versa.
            Clean up orphaned accounts and maintain data consistency.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-goal-red-800/50 to-goal-red-900/50 border-goal-red-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Orphaned Users</p>
                  <p className="text-3xl font-bold text-white">{orphanedUsers.length}</p>
                </div>
                <UserX className="h-8 w-8 text-goal-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pitch-blue-800/50 to-pitch-blue-900/50 border-pitch-blue-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Email Confirmed</p>
                  <p className="text-3xl font-bold text-white">
                    {orphanedUsers.filter(u => u.email_confirmed_at).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-pitch-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-assist-green-800/50 to-assist-green-900/50 border-assist-green-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Never Signed In</p>
                  <p className="text-3xl font-bold text-white">
                    {orphanedUsers.filter(u => !u.last_sign_in_at).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-assist-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-stadium-gold-800/50 to-stadium-gold-900/50 border-stadium-gold-600/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">With Phone</p>
                  <p className="text-3xl font-bold text-white">
                    {orphanedUsers.filter(u => u.phone).length}
                  </p>
                </div>
                <Phone className="h-8 w-8 text-stadium-gold-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warning Alert */}
        <Alert className="mb-8 bg-goal-orange-900/20 border-goal-orange-600/30">
          <AlertTriangle className="h-5 w-5 text-goal-orange-400" />
          <AlertTitle className="text-goal-orange-200 font-bold">Warning</AlertTitle>
          <AlertDescription className="text-goal-orange-200">
            These users exist in the authentication system but not in the database. 
            They cannot access the application and should be cleaned up or properly created in the database.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <Card className="bg-gradient-to-br from-stadium-gold-800/20 to-stadium-gold-900/20 border-stadium-gold-600/30">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Database className="h-6 w-6" />
                  Orphaned Users Directory
                </CardTitle>
                <CardDescription className="text-white/80">
                  Manage users that exist in auth but not in database
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  variant="outline"
                  className="border-assist-green-600/50 text-white hover:bg-assist-green-600/20"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
                <Button
                  onClick={exportOrphanedUsers}
                  variant="outline"
                  className="border-field-green-600/50 text-white hover:bg-field-green-600/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  onClick={fetchOrphanedUsers}
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
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                placeholder="Search orphaned users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>

            {/* Orphaned Users Table */}
            <div className="rounded-lg border border-white/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/10">
                    <TableHead className="text-white font-semibold">User</TableHead>
                    <TableHead className="text-white font-semibold">Status</TableHead>
                    <TableHead className="text-white font-semibold">Created</TableHead>
                    <TableHead className="text-white font-semibold">Last Sign In</TableHead>
                    <TableHead className="text-white font-semibold">Phone</TableHead>
                    <TableHead className="text-white font-semibold">Reason</TableHead>
                    <TableHead className="text-right text-white font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium text-white">{user.email}</div>
                          {user.user_metadata?.gamer_tag && (
                            <div className="text-sm text-white/70">{user.user_metadata.gamer_tag}</div>
                          )}
                          {user.user_metadata?.discord_name && (
                            <div className="text-sm text-white/70">@{user.user_metadata.discord_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={user.email_confirmed_at ? "default" : "destructive"}
                            className={
                              user.email_confirmed_at
                                ? "bg-assist-green-600 text-white"
                                : "bg-goal-red-600 text-white"
                            }
                          >
                            {user.email_confirmed_at ? "Confirmed" : "Unconfirmed"}
                          </Badge>
                          {user.last_sign_in_at && (
                            <Badge variant="outline" className="border-pitch-blue-500 text-pitch-blue-400">
                              Active
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-white">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-white">
                          {user.last_sign_in_at 
                            ? new Date(user.last_sign_in_at).toLocaleDateString()
                            : "Never"
                          }
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-white">{user.phone || "N/A"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-goal-red-500 text-goal-red-400">
                          {user.reason}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsDeleteDialogOpen(true)
                            }}
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
                <UserX className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No orphaned users found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete User Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-stadium-gold-800/20 to-stadium-gold-900/20 border-stadium-gold-600/30">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white flex items-center gap-2">
                <Trash2 className="h-6 w-6 text-goal-red-400" />
                Delete Orphaned User
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
                onClick={() => selectedUser && handleDeleteOrphanedUser(selectedUser.id)}
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

        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-stadium-gold-800/20 to-stadium-gold-900/20 border-stadium-gold-600/30">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-assist-green-400" />
                Create User
              </DialogTitle>
              <DialogDescription className="text-white/80">
                Create a new user in both auth and database systems
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-white font-semibold">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-white font-semibold">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <Label htmlFor="gamerTag" className="text-white font-semibold">
                    Gamer Tag
                  </Label>
                  <Input
                    id="gamerTag"
                    value={createForm.gamer_tag}
                    onChange={(e) => setCreateForm({...createForm, gamer_tag: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    placeholder="GamerTag123"
                  />
                </div>
                <div>
                  <Label htmlFor="discordName" className="text-white font-semibold">
                    Discord Name
                  </Label>
                  <Input
                    id="discordName"
                    value={createForm.discord_name}
                    onChange={(e) => setCreateForm({...createForm, discord_name: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    placeholder="username#1234"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="role" className="text-white font-semibold">
                    Role
                  </Label>
                  <select
                    id="role"
                    value={createForm.role}
                    onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                    className="w-full bg-white/10 border-white/20 text-white rounded-md px-3 py-2"
                  >
                    <option value="Player">Player</option>
                    <option value="GM">GM</option>
                    <option value="AGM">AGM</option>
                    <option value="Owner">Owner</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
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
                onClick={() => setIsCreateDialogOpen(false)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={isUpdating || !createForm.email.trim() || !createForm.password.trim()}
                className="bg-assist-green-600 hover:bg-assist-green-700 text-white"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
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
