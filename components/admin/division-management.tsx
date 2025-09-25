"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Edit, Trash2, Trophy, ArrowUp, ArrowDown, Users } from "lucide-react"

interface Division {
  id: string
  name: string
  tier: number
  color: string
  description: string | null
  team_count: number
  created_at: string
  updated_at: string
}

export function DivisionManagement() {
  const [divisions, setDivisions] = useState<Division[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingDivision, setEditingDivision] = useState<Division | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    tier: 1,
    color: "#16a34a",
    description: ""
  })

  useEffect(() => {
    fetchDivisions()
  }, [])

  const fetchDivisions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/divisions")
      
      if (!response.ok) {
        throw new Error("Failed to fetch divisions")
      }

      const data = await response.json()
      setDivisions(data)
    } catch (error) {
      console.error("Error fetching divisions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch divisions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDivision = async () => {
    try {
      setSaving(true)
      const response = await fetch("/api/admin/divisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create division")
      }

      toast({
        title: "Success",
        description: "Division created successfully",
      })

      setIsCreateDialogOpen(false)
      setFormData({ name: "", tier: 1, color: "#16a34a", description: "" })
      fetchDivisions()
    } catch (error: any) {
      console.error("Error creating division:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditDivision = async () => {
    if (!editingDivision) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/divisions/${editingDivision.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update division")
      }

      toast({
        title: "Success",
        description: "Division updated successfully",
      })

      setIsEditDialogOpen(false)
      setEditingDivision(null)
      setFormData({ name: "", tier: 1, color: "#16a34a", description: "" })
      fetchDivisions()
    } catch (error: any) {
      console.error("Error updating division:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDivision = async (division: Division) => {
    if (!confirm(`Are you sure you want to delete ${division.name}? This action cannot be undone.`)) {
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/divisions/${division.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete division")
      }

      toast({
        title: "Success",
        description: "Division deleted successfully",
      })

      fetchDivisions()
    } catch (error: any) {
      console.error("Error deleting division:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const openEditDialog = (division: Division) => {
    setEditingDivision(division)
    setFormData({
      name: division.name,
      tier: division.tier,
      color: division.color,
      description: division.description || ""
    })
    setIsEditDialogOpen(true)
  }

  const getTierName = (tier: number) => {
    switch (tier) {
      case 1: return "Premier Division"
      case 2: return "Championship Division"
      case 3: return "League One"
      default: return `Tier ${tier}`
    }
  }

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case 2: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case 3: return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Division Management</CardTitle>
          <CardDescription>Manage league divisions and tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Division Management</CardTitle>
              <CardDescription>Manage league divisions and tiers</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Division
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Division</DialogTitle>
                  <DialogDescription>
                    Create a new division for the league
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
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
                    <Select
                      value={formData.tier.toString()}
                      onValueChange={(value) => setFormData({ ...formData, tier: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Tier 1 (Premier)</SelectItem>
                        <SelectItem value="2">Tier 2 (Championship)</SelectItem>
                        <SelectItem value="3">Tier 3 (League One)</SelectItem>
                      </SelectContent>
                    </Select>
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDivision} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Division
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {divisions.map((division) => (
              <div
                key={division.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: division.color }}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{division.name}</h3>
                      <Badge className={getTierColor(division.tier)}>
                        Tier {division.tier}
                      </Badge>
                    </div>
                    {division.description && (
                      <p className="text-sm text-muted-foreground">{division.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{division.team_count} teams</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(division)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDivision(division)}
                    disabled={division.team_count > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Division</DialogTitle>
            <DialogDescription>
              Update division information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Division Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Premier Division"
              />
            </div>
            <div>
              <Label htmlFor="edit-tier">Tier</Label>
              <Select
                value={formData.tier.toString()}
                onValueChange={(value) => setFormData({ ...formData, tier: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Tier 1 (Premier)</SelectItem>
                  <SelectItem value="2">Tier 2 (Championship)</SelectItem>
                  <SelectItem value="3">Tier 3 (League One)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-color">Color</Label>
              <Input
                id="edit-color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDivision} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Division
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
