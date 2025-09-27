"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search, RefreshCw, User, Shield, AlertCircle, CheckCircle, XCircle, Database, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSupabase } from "@/lib/supabase/client"

interface UserDiagnostic {
  id: string
  email: string
  gamer_tag?: string
  discord_name?: string
  is_verified: boolean
  is_banned: boolean
  created_at: string
  last_sign_in_at?: string
  club_id?: string
  club_name?: string
  role: string
  primary_position?: string
  secondary_position?: string
  console?: string
  issues: string[]
  status: "healthy" | "warning" | "error"
}

export default function UserDiagnosticsPage() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [searchEmail, setSearchEmail] = useState("")
  const [searchResults, setSearchResults] = useState<UserDiagnostic[]>([])
  const [allUsers, setAllUsers] = useState<UserDiagnostic[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("search")

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

  const searchUser = async () => {
    if (!searchEmail.trim()) {
      setError("Please enter an email address")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          clubs:club_id (
            name
          )
        `)
        .eq("email", searchEmail.trim().toLowerCase())
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          setError("User not found")
        } else {
          throw error
        }
        return
      }

      const diagnostic = await analyzeUser(data)
      setSearchResults([diagnostic])
    } catch (error) {
      console.error("Error searching user:", error)
      setError("Failed to search user")
    } finally {
      setLoading(false)
    }
  }

  const analyzeUser = async (user: any): Promise<UserDiagnostic> => {
    const issues: string[] = []
    let status: "healthy" | "warning" | "error" = "healthy"

    // Check for common issues
    if (!user.is_verified) {
      issues.push("User is not verified")
      status = "warning"
    }

    if (user.is_banned) {
      issues.push("User is banned")
      status = "error"
    }

    if (!user.gamer_tag) {
      issues.push("Missing gamer tag")
      status = "warning"
    }

    if (!user.primary_position) {
      issues.push("Missing primary position")
      status = "warning"
    }

    if (!user.console) {
      issues.push("Missing console preference")
      status = "warning"
    }

    if (!user.last_sign_in_at) {
      issues.push("Never signed in")
      status = "warning"
    }

    return {
      ...user,
      club_name: user.clubs?.name || null,
      issues,
      status
    }
  }

  const scanAllUsers = async () => {
    try {
      setLoading(true)
      setError(null)

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

      const diagnostics = await Promise.all(data.map(analyzeUser))
      setAllUsers(diagnostics)
    } catch (error) {
      console.error("Error scanning users:", error)
      setError("Failed to scan users")
    } finally {
      setLoading(false)
    }
  }

  const fixUserIssue = async (userId: string, issue: string) => {
    try {
      setLoading(true)

      if (issue === "User is not verified") {
        const { error } = await supabase
          .from("users")
          .update({ is_verified: true })
          .eq("id", userId)

        if (error) throw error
        toast({
          title: "User Verified",
          description: "User has been verified successfully",
        })
      } else if (issue === "User is banned") {
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
      }

      // Refresh the data
      if (searchResults.length > 0) {
        await searchUser()
      } else {
        await scanAllUsers()
      }
    } catch (error) {
      console.error("Error fixing user issue:", error)
      toast({
        title: "Error",
        description: "Failed to fix user issue",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-assist-green-400" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-goal-orange-400" />
      case "error":
        return <XCircle className="h-5 w-5 text-goal-red-400" />
      default:
        return <AlertCircle className="h-5 w-5 text-white/60" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "border-assist-green-500 text-assist-green-400"
      case "warning":
        return "border-goal-orange-500 text-goal-orange-400"
      case "error":
        return "border-goal-red-500 text-goal-red-400"
      default:
        return "border-white/50 text-white/60"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-900 via-pitch-blue-900 to-assist-green-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            User Diagnostics
          </h1>
          <p className="text-lg text-white max-w-4xl mx-auto">
          Use this tool to diagnose and fix issues with user accounts. You can look up users by email, check their
          verification status, and perform actions like sending verification emails or creating missing user records.
        </p>
        </div>

        {/* Main Content */}
        <Card className="bg-gradient-to-br from-stadium-gold-800/20 to-stadium-gold-900/20 border-stadium-gold-600/30">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Shield className="h-6 w-6" />
              User Diagnostic Tools
            </CardTitle>
            <CardDescription className="text-white/80">
              Diagnose and fix user account issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="search" className="text-white data-[state=active]:bg-field-green-600/50">
                  <Search className="h-4 w-4 mr-2" />
                  Search User
                </TabsTrigger>
                <TabsTrigger value="scan" className="text-white data-[state=active]:bg-pitch-blue-600/50">
                  <Database className="h-4 w-4 mr-2" />
                  Scan All Users
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="email" className="text-white font-semibold">
                      User Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={searchUser}
                      disabled={loading || !searchEmail.trim()}
                      className="bg-field-green-600 hover:bg-field-green-700 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert className="bg-goal-red-900/20 border-goal-red-600/30">
                    <AlertCircle className="h-5 w-5 text-goal-red-400" />
                    <AlertDescription className="text-goal-red-200">{error}</AlertDescription>
                  </Alert>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    {searchResults.map((user) => (
                      <Card key={user.id} className="bg-white/5 border-white/20">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white">{user.email}</h3>
                                {user.gamer_tag && (
                                  <p className="text-white/70">{user.gamer_tag}</p>
                                )}
                                {user.discord_name && (
                                  <p className="text-white/70">@{user.discord_name}</p>
                                )}
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={getStatusColor(user.status)}
                            >
                              {getStatusIcon(user.status)}
                              <span className="ml-2 capitalize">{user.status}</span>
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label className="text-white font-semibold">Role</Label>
                              <p className="text-white/80">{user.role}</p>
                            </div>
                            <div>
                              <Label className="text-white font-semibold">Club</Label>
                              <p className="text-white/80">{user.club_name || "No Club"}</p>
                            </div>
                            <div>
                              <Label className="text-white font-semibold">Primary Position</Label>
                              <p className="text-white/80">{user.primary_position || "Not Set"}</p>
                            </div>
                            <div>
                              <Label className="text-white font-semibold">Console</Label>
                              <p className="text-white/80">{user.console || "Not Set"}</p>
                            </div>
                            <div>
                              <Label className="text-white font-semibold">Verified</Label>
                              <p className="text-white/80">{user.is_verified ? "Yes" : "No"}</p>
                            </div>
                            <div>
                              <Label className="text-white font-semibold">Banned</Label>
                              <p className="text-white/80">{user.is_banned ? "Yes" : "No"}</p>
                            </div>
                          </div>

                          {user.issues.length > 0 && (
                            <div className="mb-4">
                              <Label className="text-white font-semibold mb-2 block">Issues Found</Label>
                              <div className="space-y-2">
                                {user.issues.map((issue, index) => (
                                  <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                                    <span className="text-white/80">{issue}</span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => fixUserIssue(user.id, issue)}
                                      disabled={loading}
                                      className="border-assist-green-500/50 text-assist-green-400 hover:bg-assist-green-500/20"
                                    >
                                      Fix
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {user.issues.length === 0 && (
                            <div className="text-center py-4">
                              <CheckCircle className="h-8 w-8 text-assist-green-400 mx-auto mb-2" />
                              <p className="text-white/80">No issues found - user account is healthy</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="scan" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white">All Users Diagnostic Scan</h3>
                    <p className="text-white/80">Scan all users for common issues and problems</p>
                  </div>
                  <Button
                    onClick={scanAllUsers}
                    disabled={loading}
                    className="bg-pitch-blue-600 hover:bg-pitch-blue-700 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Scan All Users
                      </>
                    )}
                  </Button>
                </div>

                {allUsers.length > 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="bg-assist-green-800/20 border-assist-green-600/30">
                        <CardContent className="p-4 text-center">
                          <CheckCircle className="h-8 w-8 text-assist-green-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">
                            {allUsers.filter(u => u.status === "healthy").length}
                          </p>
                          <p className="text-white/80">Healthy Users</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-goal-orange-800/20 border-goal-orange-600/30">
                        <CardContent className="p-4 text-center">
                          <AlertTriangle className="h-8 w-8 text-goal-orange-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">
                            {allUsers.filter(u => u.status === "warning").length}
                          </p>
                          <p className="text-white/80">Warning Users</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-goal-red-800/20 border-goal-red-600/30">
                        <CardContent className="p-4 text-center">
                          <XCircle className="h-8 w-8 text-goal-red-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">
                            {allUsers.filter(u => u.status === "error").length}
                          </p>
                          <p className="text-white/80">Error Users</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-2">
                      {allUsers.map((user) => (
                        <Card key={user.id} className="bg-white/5 border-white/20">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-white">{user.email}</h4>
                                  <p className="text-sm text-white/70">
                                    {user.issues.length} issue{user.issues.length !== 1 ? 's' : ''} found
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(user.status)}
                                >
                                  {getStatusIcon(user.status)}
                                  <span className="ml-2 capitalize">{user.status}</span>
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSearchEmail(user.email)
                                    setActiveTab("search")
                                    searchUser()
                                  }}
                                  className="border-pitch-blue-500/50 text-pitch-blue-400 hover:bg-pitch-blue-500/20"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
