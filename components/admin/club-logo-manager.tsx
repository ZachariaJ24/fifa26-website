"use client"

import { useState, useEffect, useRef } from "react"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Image, 
  Upload, 
  Trash2, 
  Edit, 
  RefreshCw, 
  Search, 
  Filter,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  ExternalLink,
  Camera,
  FileImage,
  Loader2
} from "lucide-react"
import { motion } from "framer-motion"

interface Club {
  id: string
  name: string
  short_name?: string
  logo_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface LogoUploadForm {
  file: File | null
  preview: string | null
}

export function ClubLogoManager() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  
  const [clubs, setClubs] = useState<Club[]>([])
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploadForm, setUploadForm] = useState<LogoUploadForm>({
    file: null,
    preview: null
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
  const maxSize = 5 * 1024 * 1024 // 5MB

  useEffect(() => {
    fetchClubs()
  }, [])

  useEffect(() => {
    filterClubs()
  }, [searchQuery, filterStatus, clubs])

  const fetchClubs = async () => {
    try {
      setLoading(true)
      
      const response = await fetch("/api/admin/clubs")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch clubs")
      }

      setClubs(data)
    } catch (error) {
      console.error("Error fetching clubs:", error)
      toast({
        title: "Error",
        description: "Failed to load clubs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterClubs = () => {
    let filtered = clubs

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(club => 
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.short_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== "all") {
      switch (filterStatus) {
        case "with_logo":
          filtered = filtered.filter(club => club.logo_url)
          break
        case "without_logo":
          filtered = filtered.filter(club => !club.logo_url)
          break
        case "active":
          filtered = filtered.filter(club => club.is_active)
          break
        case "inactive":
          filtered = filtered.filter(club => !club.is_active)
          break
      }
    }

    setFilteredClubs(filtered)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (!file) return

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JPEG, PNG, GIF, or WebP image file.",
        variant: "destructive"
      })
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadForm({
        file,
        preview: e.target?.result as string
      })
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedClub || !uploadForm.file) return

    try {
      setIsUploading(true)
      
      const formData = new FormData()
      formData.append("file", uploadForm.file)
      formData.append("club_id", selectedClub.id)

      const response = await fetch("/api/admin/clubs/upload-logo", {
        method: "POST",
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload logo")
      }

      toast({
        title: "Logo Uploaded",
        description: `${selectedClub.name}'s logo has been uploaded successfully`,
      })

      setUploadDialogOpen(false)
      setSelectedClub(null)
      setUploadForm({ file: null, preview: null })
      fetchClubs()
    } catch (error: any) {
      console.error("Error uploading logo:", error)
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload logo",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedClub) return

    try {
      setIsDeleting(true)
      
      const response = await fetch("/api/admin/clubs/upload-logo", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          club_id: selectedClub.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete logo")
      }

      toast({
        title: "Logo Deleted",
        description: `${selectedClub.name}'s logo has been deleted successfully`,
      })

      setDeleteDialogOpen(false)
      setSelectedClub(null)
      fetchClubs()
    } catch (error: any) {
      console.error("Error deleting logo:", error)
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete logo",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getLogoStatus = (club: Club) => {
    if (club.logo_url) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Has Logo
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1 border-yellow-500 text-yellow-600">
        <AlertTriangle className="h-3 w-3" />
        No Logo
      </Badge>
    )
  }

  const getClubStatus = (club: Club) => {
    if (club.is_active) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 border-blue-500 text-blue-600">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1 border-gray-500 text-gray-600">
        <XCircle className="h-3 w-3" />
        Inactive
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-field-green-800 dark:text-field-green-200 fifa-title">
            Club Logo Management
          </h2>
          <p className="text-field-green-600 dark:text-field-green-400 fifa-subtitle">
            Upload and manage club logos
          </p>
        </div>
        <Button
          onClick={fetchClubs}
          variant="outline"
          size="sm"
          className="fifa-button-enhanced"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="fifa-card-hover-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-field-green-800 dark:text-field-green-200">
                  {clubs.length}
                </p>
                <p className="text-sm text-field-green-600 dark:text-field-green-400">
                  Total Clubs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fifa-card-hover-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Image className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {clubs.filter(c => c.logo_url).length}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  With Logos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fifa-card-hover-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                  {clubs.filter(c => !c.logo_url).length}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Missing Logos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fifa-card-hover-enhanced">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {clubs.filter(c => c.is_active).length}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Active Clubs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="fifa-card-hover-enhanced">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Clubs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-field-green-400" />
                <Input
                  id="search"
                  placeholder="Search by club name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 fifa-search"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Label htmlFor="status-filter">Filter by Status</Label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-field-green-200 rounded-lg bg-white dark:bg-slate-800 dark:border-field-green-700"
              >
                <option value="all">All Status</option>
                <option value="with_logo">With Logo</option>
                <option value="without_logo">Without Logo</option>
                <option value="active">Active Clubs</option>
                <option value="inactive">Inactive Clubs</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clubs List */}
      <Card className="fifa-card-hover-enhanced">
        <CardHeader>
          <CardTitle>Club Logos ({filteredClubs.length})</CardTitle>
          <CardDescription>
            Manage club logos and branding
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin text-field-green-500 mx-auto mb-2" />
              <p className="text-field-green-600">Loading clubs...</p>
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="text-center p-8">
              <Building2 className="h-12 w-12 text-field-green-400 mx-auto mb-4" />
              <p className="text-field-green-600">No clubs found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-field-green-200 dark:border-field-green-700 rounded-lg p-4 hover:bg-field-green-50 dark:hover:bg-field-green-900/20 transition-colors"
                >
                  <div className="text-center">
                    {/* Logo Display */}
                    <div className="w-24 h-24 mx-auto mb-4 relative">
                      {club.logo_url ? (
                        <img
                          src={club.logo_url}
                          alt={`${club.name} logo`}
                          className="w-full h-full rounded-lg object-cover border-2 border-field-green-200 dark:border-field-green-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-lg flex items-center justify-center border-2 border-field-green-200 dark:border-field-green-700">
                          <Building2 className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Club Info */}
                    <h3 className="font-semibold text-field-green-800 dark:text-field-green-200 mb-1">
                      {club.name}
                    </h3>
                    {club.short_name && (
                      <p className="text-sm text-field-green-600 dark:text-field-green-400 mb-2">
                        {club.short_name}
                      </p>
                    )}

                    {/* Status Badges */}
                    <div className="flex justify-center gap-2 mb-4">
                      {getLogoStatus(club)}
                      {getClubStatus(club)}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-2">
                      {club.logo_url ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedClub(club)
                              setUploadDialogOpen(true)
                            }}
                            className="fifa-button-enhanced"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Replace
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedClub(club)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedClub(club)
                            setUploadDialogOpen(true)
                          }}
                          className="fifa-button-enhanced"
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Club Logo</DialogTitle>
            <DialogDescription>
              Upload a logo for {selectedClub?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Input */}
            <div>
              <Label htmlFor="file">Select Logo Image</Label>
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="mt-1"
              />
              <p className="text-xs text-field-green-500 mt-1">
                Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
              </p>
            </div>

            {/* Preview */}
            {uploadForm.preview && (
              <div className="text-center">
                <Label>Preview</Label>
                <div className="w-32 h-32 mx-auto mt-2 border-2 border-field-green-200 dark:border-field-green-700 rounded-lg overflow-hidden">
                  <img
                    src={uploadForm.preview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* File Info */}
            {uploadForm.file && (
              <div className="p-3 bg-field-green-50 dark:bg-field-green-900/20 rounded-lg">
                <p className="text-sm text-field-green-800 dark:text-field-green-200">
                  <strong>File:</strong> {uploadForm.file.name}
                </p>
                <p className="text-sm text-field-green-600 dark:text-field-green-400">
                  <strong>Size:</strong> {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-sm text-field-green-600 dark:text-field-green-400">
                  <strong>Type:</strong> {uploadForm.file.type}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false)
                setUploadForm({ file: null, preview: null })
                if (fileInputRef.current) {
                  fileInputRef.current.value = ""
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadForm.file || isUploading}
              className="fifa-button-enhanced"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Club Logo</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedClub?.name}'s logo? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedClub?.logo_url && (
            <div className="text-center">
              <div className="w-24 h-24 mx-auto border-2 border-field-green-200 dark:border-field-green-700 rounded-lg overflow-hidden">
                <img
                  src={selectedClub.logo_url}
                  alt={`${selectedClub.name} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="fifa-button-enhanced"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Logo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
