"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Users, 
  UserX, 
  Shield, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Ban, 
  Unlock, 
  Eye, 
  Edit, 
  RefreshCw,
  UserCheck,
  UserMinus,
  Database,
  Activity,
  Calendar,
  Settings,
  Crown,
  Target,
  Gamepad2,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react"

interface User {
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
  club?: {
    id: string
    name: string
  }
  season_registrations?: any[]
  is_orphaned?: boolean
}

interface UserStats {
  total: number
  active: number
  banned: number
  orphaned: number
  registered: number
  unconfirmed: number
}

export default function UserManagementPage() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  // State management
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    banned: 0,
    orphaned: 0,
    registered: 0,
    unconfirmed: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  // Fetch users and check admin status
  useEffect(() => {
    checkAdminStatus()
    fetchUsers()
  }, [])

  // Apply filters
  useEffect(() => {
    filterUsers()
  }, [searchQuery, filterRole, filterStatus, users])

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

      const isAdminUser = roles?.some((role: any) => role.role === "Admin") || false
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

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Fetch users with all related data
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select(`
          *,
          user_roles(role),
          clubs(id, name),
          season_registrations(*)
        `)
        .order("created_at", { ascending: false })

      if (usersError) throw usersError

      // Process users data
      const processedUsers = (usersData || []).map((user: any) => ({
        ...user,
        roles: user.user_roles?.map((r: any) => r.role) || [],
        club: user.clubs?.[0] || null,
        season_registrations: user.season_registrations || [],
        is_orphaned: !user.email_confirmed_at && new Date(user.created_at) < new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours old and unconfirmed
      }))

      setUsers(processedUsers)
      calculateStats(processedUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (userList: User[]) => {
    const newStats = {
      total: userList.length,
      active: userList.filter(u => !u.is_banned && u.email_confirmed_at).length,
      banned: userList.filter(u => u.is_banned).length,
      orphaned: userList.filter(u => u.is_orphaned).length,
      registered: userList.filter(u => u.season_registrations && u.season_registrations.length > 0).length,
      unconfirmed: userList.filter(u => !u.email_confirmed_at).length
    }
    setStats(newStats)
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
        case "orphaned":
          filtered = filtered.filter(user => user.is_orphaned)
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

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select users to perform this action.",
        variant: "destructive"
      })
      return
    }

    try {
      switch (action) {
        case "ban":
          // Implement bulk ban
          break
        case "unban":
          // Implement bulk unban
          break
        case "delete":
          // Implement bulk delete
          break
        case "export":
          // Implement export
          break
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error)
      toast({
        title: "Error",
        description: `Failed to perform ${action} action.`,
        variant: "destructive"
      })
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
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
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white fifa-title">
                User Management
              </h1>
              <p className="text-lg text-white fifa-subtitle max-w-4xl mx-auto">
                Comprehensive user administration and management
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="fifa-card-hover-enhanced border-2 border-field-green-200/60 dark:border-field-green-700/60 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {stats.total}
                  </p>
                  <p className="text-sm text-white">
                    Total Users
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fifa-card-hover-enhanced border-2 border-assist-green-200/60 dark:border-assist-green-700/60 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-assist-green-500 to-assist-green-600 rounded-lg flex items-center justify-center shadow-md">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-assist-green-800 dark:text-assist-green-200">
                    {stats.active}
                  </p>
                  <p className="text-sm text-assist-green-600 dark:text-assist-green-400">
                    Active Users
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fifa-card-hover-enhanced border-2 border-goal-red-200/60 dark:border-goal-red-700/60 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-goal-red-500 to-goal-red-600 rounded-lg flex items-center justify-center shadow-md">
                  <Ban className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-goal-red-800 dark:text-goal-red-200">
                    {stats.banned}
                  </p>
                  <p className="text-sm text-goal-red-600 dark:text-goal-red-400">
                    Banned Users
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fifa-card-hover-enhanced border-2 border-goal-orange-200/60 dark:border-goal-orange-700/60 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 rounded-lg flex items-center justify-center shadow-md">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-goal-orange-800 dark:text-goal-orange-200">
                    {stats.orphaned}
                  </p>
                  <p className="text-sm text-goal-orange-600 dark:text-goal-orange-400">
                    Orphaned Users
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fifa-card-hover-enhanced border-2 border-pitch-blue-200/60 dark:border-pitch-blue-700/60 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-pitch-blue-800 dark:text-pitch-blue-200">
                    {stats.registered}
                  </p>
                  <p className="text-sm text-pitch-blue-600 dark:text-pitch-blue-400">
                    Season Registered
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fifa-card-hover-enhanced border-2 border-stadium-gold-200/60 dark:border-stadium-gold-700/60 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg flex items-center justify-center shadow-md">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stadium-gold-800 dark:text-stadium-gold-200">
                    {stats.unconfirmed}
                  </p>
                  <p className="text-sm text-stadium-gold-600 dark:text-stadium-gold-400">
                    Unconfirmed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div>
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="users">All Users</TabsTrigger>
              <TabsTrigger value="banned">Banned Users</TabsTrigger>
              <TabsTrigger value="orphaned">Orphaned Users</TabsTrigger>
              <TabsTrigger value="season-reg">Season Registration</TabsTrigger>
              <TabsTrigger value="bulk-actions">Bulk Actions</TabsTrigger>
            </TabsList>

            {/* All Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="fifa-card-hover-enhanced border-2 border-field-green-200/60 dark:border-field-green-700/60 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-field-green-500 to-pitch-blue-600 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-field-green-500/20 to-pitch-blue-500/20" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-white fifa-title">
                        User Management
                      </CardTitle>
                      <CardDescription className="text-white">
                        Manage all users in the system
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={fetchUsers}
                        variant="outline"
                        size="sm"
                        className="fifa-button-enhanced border-white/30 text-white hover:bg-white/10"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Label htmlFor="search" className="text-sm font-medium text-white">
                        Search Users
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
                        <Input
                          id="search"
                          placeholder="Search by email, gamer tag, or Discord username..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 fifa-search border-2 border-field-green-200/60 dark:border-field-green-700/60 focus:border-field-green-500 dark:focus:border-field-green-400"
                        />
                      </div>
                    </div>
                    <div className="sm:w-48">
                      <Label htmlFor="role-filter" className="text-sm font-medium text-white">
                        Filter by Role
                      </Label>
                      <select
                        id="role-filter"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="w-full p-2 border-2 border-field-green-200/60 rounded-lg bg-white dark:bg-slate-800 dark:border-field-green-700/60 focus:border-field-green-500 dark:focus:border-field-green-400 fifa-search"
                      >
                        <option value="all">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Player">Player</option>
                        <option value="GM">General Manager</option>
                        <option value="AGM">Assistant GM</option>
                      </select>
                    </div>
                    <div className="sm:w-48">
                      <Label htmlFor="status-filter" className="text-sm font-medium text-white">
                        Filter by Status
                      </Label>
                      <select
                        id="status-filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full p-2 border-2 border-field-green-200/60 rounded-lg bg-white dark:bg-slate-800 dark:border-field-green-700/60 focus:border-field-green-500 dark:focus:border-field-green-400 fifa-search"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="banned">Banned</option>
                        <option value="orphaned">Orphaned</option>
                        <option value="unconfirmed">Unconfirmed</option>
                        <option value="registered">Season Registered</option>
                      </select>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-field-green-200 dark:border-field-green-700 bg-gradient-to-r from-field-green-50 to-pitch-blue-50 dark:from-field-green-900/20 dark:to-pitch-blue-900/20">
                          <th className="text-left p-3 font-semibold text-white">
                            <input
                              type="checkbox"
                              className="rounded border-2 border-field-green-300 focus:border-field-green-500"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers(filteredUsers.map(u => u.id))
                                } else {
                                  setSelectedUsers([])
                                }
                              }}
                            />
                          </th>
                          <th className="text-left p-3 font-semibold text-white">
                            User
                          </th>
                          <th className="text-left p-3 font-semibold text-white">
                            Roles
                          </th>
                          <th className="text-left p-3 font-semibold text-white">
                            Status
                          </th>
                          <th className="text-left p-3 font-semibold text-white">
                            Club
                          </th>
                          <th className="text-left p-3 font-semibold text-white">
                            Season Reg
                          </th>
                          <th className="text-left p-3 font-semibold text-white">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={7} className="text-center p-8">
                              <div className="flex items-center justify-center">
                                <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                                Loading users...
                              </div>
                            </td>
                          </tr>
                        ) : filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center p-8 text-white">
                              No users found matching your criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b border-field-green-100 dark:border-field-green-800 hover:bg-gradient-to-r hover:from-field-green-50 hover:to-pitch-blue-50 dark:hover:from-field-green-900/20 dark:hover:to-pitch-blue-900/20 transition-all duration-200">
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  className="rounded border-2 border-field-green-300 focus:border-field-green-500"
                                  checked={selectedUsers.includes(user.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedUsers([...selectedUsers, user.id])
                                    } else {
                                      setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                                    }
                                  }}
                                />
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full flex items-center justify-center shadow-md">
                                    <span className="text-white font-semibold text-sm">
                                      {user.email.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">
                                      {user.gamer_tag || user.email}
                                    </p>
                                    <p className="text-sm text-white">
                                      {user.email}
                                    </p>
                                    {user.discord_username && (
                                      <p className="text-xs text-pitch-blue-600 dark:text-pitch-blue-400 flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        {user.discord_username}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1">
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
                              </td>
                              <td className="p-3">
                                <div className="flex flex-col gap-1">
                                  {user.is_banned ? (
                                    <Badge variant="destructive" className="text-xs">
                                      <Ban className="h-3 w-3 mr-1" />
                                      Banned
                                    </Badge>
                                  ) : user.is_orphaned ? (
                                    <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Orphaned
                                    </Badge>
                                  ) : !user.email_confirmed_at ? (
                                    <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Unconfirmed
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Active
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                {user.club ? (
                                  <Badge variant="outline" className="text-xs">
                                    {user.club.name}
                                  </Badge>
                                ) : (
                                  <span className="text-sm text-white">No Club</span>
                                )}
                              </td>
                              <td className="p-3">
                                {user.season_registrations && user.season_registrations.length > 0 ? (
                                  <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {user.season_registrations.length} Season(s)
                                  </Badge>
                                ) : (
                                  <span className="text-sm text-white">Not Registered</span>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {/* View user details */}}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {/* Edit user */}}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  {user.is_banned ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                      onClick={() => {/* Unban user */}}
                                    >
                                      <Unlock className="h-3 w-3" />
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                      onClick={() => {/* Ban user */}}
                                    >
                                      <Ban className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    onClick={() => {/* Delete user */}}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Additional tabs will be implemented in the next steps */}
            <TabsContent value="banned">
              <Card className="fifa-card-hover-enhanced">
                <CardHeader>
                  <CardTitle>Banned Users Management</CardTitle>
                  <CardDescription>Manage banned users and their restrictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Banned users management will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orphaned">
              <Card className="fifa-card-hover-enhanced">
                <CardHeader>
                  <CardTitle>Orphaned Users</CardTitle>
                  <CardDescription>Detect and manage orphaned authentication users</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Orphaned users management will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="season-reg">
              <Card className="fifa-card-hover-enhanced">
                <CardHeader>
                  <CardTitle>Season Registration Diagnostics</CardTitle>
                  <CardDescription>Analyze and manage season registration data</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white">Season registration diagnostics will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk-actions">
              <Card className="fifa-card-hover-enhanced">
                <CardHeader>
                  <CardTitle>Bulk Actions</CardTitle>
                  <CardDescription>Perform actions on multiple users at once</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => handleBulkAction("ban")}
                        variant="destructive"
                        disabled={selectedUsers.length === 0}
                        className="fifa-button-enhanced"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Ban Selected ({selectedUsers.length})
                      </Button>
                      <Button
                        onClick={() => handleBulkAction("unban")}
                        variant="outline"
                        disabled={selectedUsers.length === 0}
                        className="fifa-button-enhanced"
                      >
                        <Unlock className="h-4 w-4 mr-2" />
                        Unban Selected ({selectedUsers.length})
                      </Button>
                      <Button
                        onClick={() => handleBulkAction("delete")}
                        variant="destructive"
                        disabled={selectedUsers.length === 0}
                        className="fifa-button-enhanced"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected ({selectedUsers.length})
                      </Button>
                      <Button
                        onClick={() => handleBulkAction("export")}
                        variant="outline"
                        disabled={selectedUsers.length === 0}
                        className="fifa-button-enhanced"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Selected ({selectedUsers.length})
                      </Button>
                    </div>
                    <p className="text-sm text-white">
                      Select users from the table above to perform bulk actions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
