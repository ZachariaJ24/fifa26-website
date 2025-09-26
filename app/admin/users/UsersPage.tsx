"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase/hooks"
import { Search, RefreshCw, Users, Shield, UserCog, Plus, Download } from "lucide-react"
import HeaderBar from "@/components/admin/HeaderBar"
import FilterBar from "@/components/admin/FilterBar"

export default function UsersPage() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [teamFilter, setTeamFilter] = useState("")
  const [teams, setTeams] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Fetch users and teams on component mount
  useEffect(() => {
    fetchUsers()
    fetchTeams()
  }, [])

  // Apply filters whenever they change
  useEffect(() => {
    filterUsers()
  }, [searchQuery, roleFilter, teamFilter, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          profiles (*),
          teams (*)
        `)
        .order('created_at', { ascending: false })
      
      if (usersError) throw usersError
      
      setUsers(usersData || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching teams:', error)
      return
    }
    
    setTeams(data || [])
  }

  const filterUsers = () => {
    let result = [...users]
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(user => 
        user.email?.toLowerCase().includes(query) ||
        user.profiles?.gamer_tag?.toLowerCase().includes(query) ||
        user.profiles?.discord_name?.toLowerCase().includes(query)
      )
    }
    
    // Apply role filter
    if (roleFilter) {
      result = result.filter(user => 
        user.roles?.includes(roleFilter)
      )
    }
    
    // Apply team filter
    if (teamFilter) {
      result = result.filter(user => 
        user.teams?.some((team: any) => team.id === teamFilter)
      )
    }
    
    setFilteredUsers(result)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; variant: string }> = {
      'admin': { label: 'Admin', variant: 'destructive' },
      'player': { label: 'Player', variant: 'default' },
      'coach': { label: 'Coach', variant: 'secondary' },
      'captain': { label: 'Captain', variant: 'outline' },
    }
    
    const config = roleConfig[role.toLowerCase()] || { label: role, variant: 'outline' }
    
    return (
      <Badge variant={config.variant as any} className="capitalize">
        {config.label}
      </Badge>
    )
  }

  const handleRefresh = () => {
    fetchUsers()
  }

  const handleExportCSV = () => {
    // Basic CSV export implementation
    const headers = ['Email', 'Gamer Tag', 'Roles', 'Team', 'Status', 'Last Login']
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        `"${user.email}"`,
        `"${user.profiles?.gamer_tag || 'N/A'}"`,
        `"${user.roles?.join(', ') || 'None'}"`,
        `"${user.teams?.[0]?.name || 'No Team'}"`,
        `"${user.last_sign_in_at ? 'Active' : 'Inactive'}"`,
        `"${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}"`
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="container mx-auto py-6">
      <HeaderBar
        title="User Management"
        subtitle="Manage user accounts, roles, and team assignments"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        }
      />

      <FilterBar onClear={() => {
        setSearchQuery('')
        setRoleFilter('')
        setTeamFilter('')
      }}>
        <div className="w-64">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-48">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="player">Player</SelectItem>
              <SelectItem value="coach">Coach</SelectItem>
              <SelectItem value="captain">Captain</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Users
              {filteredUsers.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
                </span>
              )}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || roleFilter || teamFilter 
                  ? "No users match your current filters." 
                  : "No users have been added yet."}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('')
                  setRoleFilter('')
                  setTeamFilter('')
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                            <UserCog className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.profiles?.gamer_tag || 'No username'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.length > 0 
                            ? user.roles.map((role: string) => (
                                <span key={role}>
                                  {getRoleBadge(role)}
                                </span>
                              ))
                            : <Badge variant="outline">No roles</Badge>
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.teams?.[0]?.name ? (
                          <Badge variant="secondary">
                            {user.teams[0].name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">No team</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full mr-2 ${
                            user.last_sign_in_at ? 'bg-green-500' : 'bg-muted-foreground'
                          }`} />
                          {user.last_sign_in_at ? 'Active' : 'Inactive'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleString() 
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
