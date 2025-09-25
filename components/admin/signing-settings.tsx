"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function SigningSettings() {
  const [isSigningEnabled, setIsSigningEnabled] = useState(false)
  const [minSalary, setMinSalary] = useState(750000)
  const [maxSalary, setMaxSalary] = useState(15000000)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const { toast } = useToast()
  const { supabase, session } = useSupabase()

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: settings, error } = await supabase.from("system_settings").select("key, value")

        if (error) {
          console.error("Error loading settings:", error)
          
          // Check if it's a permission error
          if (error.message.includes("permission denied") || error.message.includes("system_settings")) {
            toast({
              title: "Permission Error",
              description: "You don't have permission to access system settings. Please run the SQL script to fix permissions.",
              variant: "destructive",
            })
          } else {
            toast({
              title: "Error loading settings",
              description: "Failed to load signing settings.",
              variant: "destructive",
            })
          }
          
          // Set default values when there's an error
          setIsSigningEnabled(false)
          setMinSalary(750000)
          setMaxSalary(15000000)
          return
        }

        const settingsMap = settings.reduce((acc, setting) => {
          acc[setting.key] = setting.value
          return acc
        }, {})

        setIsSigningEnabled(settingsMap.signings_enabled === "true" || false)
        setMinSalary(settingsMap.min_salary || 750000)
        setMaxSalary(settingsMap.max_salary || 15000000)
      } catch (error) {
        console.error("Error loading settings:", error)
        toast({
          title: "Error loading settings",
          description: "Failed to load signing settings.",
          variant: "destructive",
        })
        
        // Set default values when there's an error
        setIsSigningEnabled(false)
        setMinSalary(750000)
        setMaxSalary(15000000)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [supabase, toast])

  const handleToggleSigning = async () => {
    try {
      setIsSaving(true)
      setAuthError(null)

      console.log("Attempting to toggle signings from", isSigningEnabled, "to", !isSigningEnabled)

      const response = await fetch("/api/admin/signings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ enabled: !isSigningEnabled }),
        credentials: "include",
      })

      const responseData = await response.json()
      console.log("Signing toggle response:", responseData)

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAuthError("You don't have permission to change signing settings. Admin role required.")
        }
        throw new Error(responseData.error || `HTTP ${response.status}: Failed to update signing status`)
      }

      setIsSigningEnabled(!isSigningEnabled)
      toast({
        title: "Signing settings updated",
        description: `Direct signings are now ${!isSigningEnabled ? "enabled" : "disabled"}.`,
      })
    } catch (error: any) {
      console.error("Error updating signing status:", error)
      setAuthError(error.message)
      toast({
        title: "Error updating signing status",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveMinSalary = async () => {
    try {
      setIsSaving(true)
      setAuthError(null)

      const response = await fetch("/api/admin/signings/min-salary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ minSalary }),
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update minimum salary")
      }

      toast({
        title: "Minimum salary updated",
        description: `Minimum salary is now $${minSalary.toLocaleString()}.`,
      })
    } catch (error) {
      console.error("Error updating minimum salary:", error)
      toast({
        title: "Error updating minimum salary",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveMaxSalary = async () => {
    try {
      setIsSaving(true)
      setAuthError(null)

      const response = await fetch("/api/admin/signings/max-salary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ maxSalary }),
        credentials: "include",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update maximum salary")
      }

      toast({
        title: "Maximum salary updated",
        description: `Maximum salary is now $${maxSalary.toLocaleString()}.`,
      })
    } catch (error) {
      console.error("Error updating maximum salary:", error)
      toast({
        title: "Error updating maximum salary",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Signing Settings</CardTitle>
          <CardDescription>Configure direct signing settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signing Settings</CardTitle>
        <CardDescription>Configure direct signing settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        {authError && authError.includes("permission denied") && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Permission Error</AlertTitle>
            <AlertDescription>
              You don't have permission to access the system_settings table. Please run the SQL script to fix permissions:
              <br />
              <code className="mt-2 block p-2 bg-gray-100 rounded text-sm">
                Run the SQL in fix_system_settings_permissions.sql
              </code>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Enable Direct Signings</h3>
            <p className="text-sm text-muted-foreground">Allow teams to sign free agents directly without transfer offers</p>
          </div>
          <Switch checked={isSigningEnabled} onCheckedChange={handleToggleSigning} disabled={isSaving} />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Minimum Salary</h3>
          <p className="text-sm text-muted-foreground">Minimum salary for direct signings</p>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(Number(e.target.value))}
              min={500000}
              step={50000}
              className="max-w-xs"
            />
            <Button onClick={handleSaveMinSalary} disabled={isSaving}>
              Save
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Maximum Salary</h3>
          <p className="text-sm text-muted-foreground">Maximum salary for direct signings</p>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={maxSalary}
              onChange={(e) => setMaxSalary(Number(e.target.value))}
              min={1000000}
              step={500000}
              className="max-w-xs"
            />
            <Button onClick={handleSaveMaxSalary} disabled={isSaving}>
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
