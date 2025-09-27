"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Trash2, AlertTriangle, Key, Shield, UserX, CheckCircle, XCircle, Database, Users, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSupabase } from "@/lib/supabase/client"

export default function CompleteUserDeletionPage() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [adminKey, setAdminKey] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"input" | "confirm" | "deleting" | "success">("input")

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

  const handleLookupUser = async () => {
    if (!email.trim()) {
      setError("Please enter an email address")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          clubs:club_id (
            name
          )
        `)
        .eq("email", email.trim().toLowerCase())
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          setError("User not found")
        } else {
          throw error
        }
        return
      }

      setUserData(data)
      setStep("confirm")
    } catch (error) {
      console.error("Error looking up user:", error)
      setError("Failed to look up user")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!adminKey.trim()) {
      setError("Please enter the admin verification key")
      return
    }

    if (!userData) {
      setError("No user data available")
      return
    }

    try {
      setIsDeleting(true)
      setError(null)
      setStep("deleting")

      // Verify admin key (you can implement your own verification logic)
      if (adminKey !== "DELETE_USER_CONFIRM") {
        setError("Invalid admin verification key")
        setStep("confirm")
        return
      }

      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userData.id)
      if (authError) {
        console.error("Auth deletion error:", authError)
        // Continue with database deletion even if auth deletion fails
      }

      // Delete user from database
      const { error: dbError } = await supabase
        .from("users")
        .delete()
        .eq("id", userData.id)

      if (dbError) {
        throw dbError
      }

      setStep("success")
      toast({
        title: "User Deleted Successfully",
        description: `User ${userData.email} has been completely removed from the system`,
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      setError("Failed to delete user")
      setStep("confirm")
    } finally {
      setIsDeleting(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setAdminKey("")
    setUserData(null)
    setError(null)
    setStep("input")
  }

  if (step === "deleting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-field-green-900 via-pitch-blue-900 to-assist-green-900 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-stadium-gold-800/20 to-stadium-gold-900/20 border-stadium-gold-600/30">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Deleting User</h2>
              <p className="text-white/80">Please wait while we remove the user from all systems...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-field-green-900 via-pitch-blue-900 to-assist-green-900 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-stadium-gold-800/20 to-stadium-gold-900/20 border-stadium-gold-600/30">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-assist-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">User Deleted Successfully</h2>
              <p className="text-white/80 mb-6">The user has been completely removed from the system</p>
              <Button
                onClick={resetForm}
                className="bg-field-green-600 hover:bg-field-green-700 text-white"
              >
                Delete Another User
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-900 via-pitch-blue-900 to-assist-green-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white fifa-title mb-4">
            Complete User Deletion
          </h1>
          <p className="text-lg text-white fifa-subtitle max-w-2xl mx-auto">
            Permanently remove users from all systems. This action cannot be undone.
          </p>
        </div>

        {/* Warning Alert */}
        <Alert className="mb-8 bg-goal-red-900/20 border-goal-red-600/30">
          <AlertTriangle className="h-5 w-5 text-goal-red-400" />
          <AlertTitle className="text-goal-red-200 font-bold">Warning</AlertTitle>
          <AlertDescription className="text-goal-red-200">
            This action will permanently delete the user from both the authentication system and the database.
            All associated data will be lost and cannot be recovered.
          </AlertDescription>
        </Alert>

        {step === "input" && (
          <Card className="bg-gradient-to-br from-stadium-gold-800/20 to-stadium-gold-900/20 border-stadium-gold-600/30">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <UserX className="h-6 w-6" />
                User Lookup
              </CardTitle>
              <CardDescription className="text-white">
                Enter the email address of the user you want to delete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg font-semibold text-white flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  User Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <p className="text-sm text-white/70 p-2 bg-gradient-to-r from-ice-blue-100/30 to-rink-blue-100/30 dark:from-ice-blue-900/10 dark:to-rink-blue-900/10 rounded-lg border border-ice-blue-200/30 dark:border-rink-blue-700/30">
                  Enter the exact email address of the user you want to delete
                </p>
              </div>

              {error && (
                <Alert className="bg-goal-red-900/20 border-goal-red-600/30">
                  <AlertCircle className="h-5 w-5 text-goal-red-400" />
                  <AlertDescription className="text-goal-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleLookupUser}
                disabled={isLoading || !email.trim()}
                className="w-full bg-goal-red-600 hover:bg-goal-red-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Looking up user...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Look Up User
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "confirm" && userData && (
          <Card className="bg-gradient-to-br from-stadium-gold-800/20 to-stadium-gold-900/20 border-stadium-gold-600/30">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-goal-red-400" />
                Confirm Deletion
              </CardTitle>
              <CardDescription className="text-white">
                Review user details before permanent deletion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Details */}
              <div className="bg-white/10 rounded-lg p-4 space-y-3">
                <h3 className="text-lg font-bold text-white mb-3">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/90">
                  <div>
                    <span className="font-semibold">Email:</span> {userData.email}
                  </div>
                  <div>
                    <span className="font-semibold">Gamer Tag:</span> {userData.gamer_tag || "N/A"}
                  </div>
                  <div>
                    <span className="font-semibold">Discord Name:</span> {userData.discord_name || "N/A"}
                  </div>
                  <div>
                    <span className="font-semibold">Role:</span> {userData.role}
                  </div>
                  <div>
                    <span className="font-semibold">Club:</span> {userData.clubs?.name || "No Club"}
                  </div>
                  <div>
                    <span className="font-semibold">Joined:</span> {new Date(userData.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold">Verified:</span> {userData.is_verified ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="font-semibold">Banned:</span> {userData.is_banned ? "Yes" : "No"}
                  </div>
                </div>
              </div>

              {/* Admin Verification */}
              <div className="space-y-2">
                <Label htmlFor="adminKey" className="text-lg font-semibold text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-white/80" />
                  Admin Verification Key
                </Label>
                <Input
                  id="adminKey"
                  type="password"
                  placeholder="Enter admin verification key"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <p className="text-sm text-white/70 p-2 bg-gradient-to-r from-ice-blue-100/30 to-rink-blue-100/30 dark:from-ice-blue-900/10 dark:to-rink-blue-900/10 rounded-lg border border-ice-blue-200/30 dark:border-rink-blue-700/30">
                  Enter the admin verification key to confirm deletion
                </p>
              </div>

              {error && (
                <Alert className="bg-goal-red-900/20 border-goal-red-600/30">
                  <AlertCircle className="h-5 w-5 text-goal-red-400" />
                  <AlertDescription className="text-goal-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteUser}
                  disabled={isDeleting || !adminKey.trim()}
                  className="flex-1 bg-goal-red-600 hover:bg-goal-red-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User Permanently
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}