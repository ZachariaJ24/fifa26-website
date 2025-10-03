"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/browser-client"

interface Division {
  id: string
  name: string
  tier: number
  color: string
  description?: string
}

export function ClientDivisionManager() {
  const [divisions, setDivisions] = useState<Division[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    tier: 1,
    color: "#3B82F6",
    description: ""
  })
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchDivisions()
  }, [])

  const fetchDivisions = async () => {
    try {
      setLoading(true)
      
      // Use direct Supabase client instead of API route
      const { data, error } = await supabase
        .from("divisions")
        .select("*")
        .order("tier")

      if (error) {
        throw error
      }

      setDivisions(data || [])
    } catch (error: any) {
      console.error("Error fetching divisions:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch divisions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDivision = async () => {
    try {
      setSaving(true)
      
      // Use direct Supabase client instead of API route
      const { data, error } = await supabase
        .from("divisions")
        .insert(formData)
        .select()
        .single()

      if (error) {
        throw error
      }

      setDivisions([...divisions, data])
      setFormData({ name: "", tier: 1, color: "#3B82F6", description: "" })
      setShowForm(false)
      
      toast({
        title: "Success",
        description: "Division created successfully",
      })
    } catch (error: any) {
      console.error("Error creating division:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create division",
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
          <CardTitle>Division Management</CardTitle>
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
          <CardTitle>Division Management</CardTitle>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Division
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showForm && (
          <div className="p-4 border rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Division Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Premier Division"
                />
              </div>
              <div>
                <Label htmlFor="tier">Tier</Label>
                <Input
                  id="tier"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: parseInt(e.target.value) })}
                />
              </div>
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
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateDivision} disabled={saving || !formData.name}>
                {saving ? "Creating..." : "Create Division"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {divisions.map((division) => (
            <div
              key={division.id}
              className="p-4 border rounded-lg space-y-2"
              style={{ borderLeftColor: division.color, borderLeftWidth: "4px" }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{division.name}</h3>
                <Badge variant="secondary">Tier {division.tier}</Badge>
              </div>
              {division.description && (
                <p className="text-sm text-gray-600">{division.description}</p>
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
