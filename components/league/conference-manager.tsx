"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase/client"

interface Conference {
  id: string
  name: string
  description?: string
  color: string
  is_active: boolean
}

export function ConferenceManager() {
  const [conferences, setConferences] = useState<Conference[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6"
  })
  const { toast } = useToast()
  const { supabase } = useSupabase()

  useEffect(() => {
    fetchConferences()
  }, [supabase])

  const fetchConferences = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from("conferences")
        .select("id, name, description, color, is_active, created_at, updated_at")
        .eq("is_active", true)
        .order("name")

      if (error) {
        throw error
      }

      setConferences(data || [])
    } catch (error: any) {
      console.error("Error fetching conferences:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch conferences",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateConference = async () => {
    try {
      setSaving(true)
      
      const { data, error } = await supabase
        .from("conferences")
        .insert(formData)
        .select()
        .single()

      if (error) {
        throw error
      }

      setConferences([...conferences, data])
      setFormData({ name: "", description: "", color: "#3B82F6" })
      setShowForm(false)
      
      toast({
        title: "Success",
        description: "Conference created successfully",
      })
    } catch (error: any) {
      console.error("Error creating conference:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create conference",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conference Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Conference Management</CardTitle>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Conference
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showForm && (
          <div className="p-4 border rounded-lg space-y-4">
            <div>
              <Label htmlFor="name">Conference Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Eastern Conference"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateConference} disabled={saving || !formData.name}>
                {saving ? "Creating..." : "Create Conference"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conferences.map((conference) => (
            <div
              key={conference.id}
              className="p-4 border rounded-lg space-y-2"
              style={{ borderLeftColor: conference.color, borderLeftWidth: "4px" }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{conference.name}</h3>
                <Badge variant={conference.is_active ? "default" : "secondary"}>
                  {conference.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              {conference.description && (
                <p className="text-sm text-gray-600">{conference.description}</p>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="text-red-600">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
