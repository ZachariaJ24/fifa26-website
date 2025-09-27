"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Search, User, Shield } from "lucide-react"

interface RoleSyncStatus {
  userId: string
  userRoles: string[]
  playerRole: string | null
  expectedPlayerRole: string
  isInSync: boolean
  needsPlayerRecord: boolean
  playerId: string | null
  teamId: string | null
}

interface BulkSyncResult {
  processed: number
  fixed: number
  errors: number
  details: Array<{
    userId: string
    gamerTag: string
    email: string
    userRoles: string[]
    action: string
    reason?: string
    error?: string
    currentPlayerRole?: string
    expectedPlayerRole?: string
    oldPlayerRole?: string
    newPlayerRole?: string
  }>
}

export default function RoleSyncPage() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [searchEmail, setSearchEmail] = useState("")
  const [roleSyncStatus, setRoleSyncStatus] = useState<RoleSyncStatus | null>(null)
  const [bulkSyncResult, setBulkSyncResult] = useState<BulkSyncResult | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      if (!session?.user) {
        toast({
          title: "Unauthorized",
          description: "You must be logged in to access this page.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      try {
        const { data: adminRoleData, error: adminRoleError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("role", "Admin")

        if (adminRoleError || !adminRoleData || adminRoleData.length === 0) {
          toast({
            title: "Access denied",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error("Error checking admin status:", error)
        toast({
          title: "Error",
          description: "Failed to verify admin status.",
          variant: "destructive",
        })
        router.push("/")
      }
    }

    checkAdmin()
  }, [session, supabase, toast, router])

  const checkRoleSync = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setRoleSyncStatus(null)

    try {
      const response = await fetch("/api/admin/fix-role-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: searchEmail }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to check role sync")
      }

      setRoleSyncStatus(result)
    } catch (error) {
      console.error("Error checking role sync:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check role sync",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const runBulkSync = async () => {
    setLoading(true)
    setBulkSyncResult(null)

    try {
      const response = await fetch("/api/admin/fix-role-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bulk: true }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to run bulk sync")
      }

      setBulkSyncResult(result)
      toast({
        title: "Success",
        description: `Bulk sync completed. Processed: ${result.processed}, Fixed: ${result.fixed}, Errors: ${result.errors}`,
      })
    } catch (error) {
      console.error("Error running bulk sync:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to run bulk sync",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Access Denied</h1>
            <p className="text-slate-600 dark:text-slate-400">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Role Sync Fix
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Fix role synchronization issues between user roles and player records for individual users or bulk operations.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Individual User Check */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-200">Check Individual User</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Check and fix role sync issues for a specific user by email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter user email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={checkRoleSync} disabled={loading} className="min-w-[120px]">
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    {loading ? "Checking..." : "Check"}
                  </Button>
                </div>
              </div>

              {roleSyncStatus && (
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    {roleSyncStatus.isInSync ? (
                      <CheckCircle className="h-5 w-5 text-field-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-goal-orange-500" />
                    )}
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {roleSyncStatus.isInSync ? "In Sync" : "Needs Fix"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">User Roles:</span>
                      <div className="flex gap-1 mt-1">
                        {roleSyncStatus.userRoles.map((role) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Player Role:</span>
                      <div className="mt-1">
                        <Badge variant={roleSyncStatus.playerRole ? "default" : "secondary"}>
                          {roleSyncStatus.playerRole || "None"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Expected Player Role:</span>
                      <div className="mt-1">
                        <Badge variant="outline">{roleSyncStatus.expectedPlayerRole}</Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Needs Player Record:</span>
                      <div className="mt-1">
                        <Badge variant={roleSyncStatus.needsPlayerRecord ? "destructive" : "default"}>
                          {roleSyncStatus.needsPlayerRecord ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bulk Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-200">Bulk Role Sync</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Run role sync fix for all users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={runBulkSync} disabled={loading} className="w-full">
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                {loading ? "Running Bulk Sync..." : "Run Bulk Role Sync"}
              </Button>

              {bulkSyncResult && (
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-4">Bulk Sync Results</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pitch-blue-600">{bulkSyncResult.processed}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Processed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-field-green-600">{bulkSyncResult.fixed}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Fixed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-goal-orange-600">{bulkSyncResult.errors}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Errors</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}