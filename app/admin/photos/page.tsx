"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import {
  Container,
  Title,
  Text,
  Button,
  TextInput,
  Textarea,
  Select,
  Paper,
  Stack,
  Group,
  Badge,
  Card,
  ThemeIcon,
  Modal,
  ActionIcon,
  Menu,
  Image,
  Grid,
  FileInput,
  Switch
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  Camera,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Upload,
  Download,
  Share,
  Star,
  ImageIcon,
  Calendar,
  Tag,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

interface Photo {
  id: string
  title: string
  description: string
  image_url: string
  thumbnail_url?: string
  category: string
  tags: string[]
  is_featured: boolean
  is_public: boolean
  uploaded_by: string
  upload_date: string
  file_size?: number
  dimensions?: string
  created_at: string
  updated_at: string
}

interface PhotoCategory {
  id: string
  name: string
  description: string
  photo_count: number
}

export default function PhotoGalleryPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [categories, setCategories] = useState<PhotoCategory[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  
  // Modals
  const [uploadModalOpened, { open: openUploadModal, close: closeUploadModal }] = useDisclosure(false)
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false)
  
  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const photoCategories = [
    "Match Photos",
    "Team Photos", 
    "Awards Ceremony",
    "Training Sessions",
    "League Events",
    "Player Portraits",
    "Stadium Photos",
    "Behind the Scenes",
    "Fan Photos",
    "Promotional"
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch photos
      const { data: photosData, error: photosError } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false })

      if (photosError) throw photosError
      
      const formattedPhotos = photosData?.map(photo => ({
        id: photo.id,
        title: photo.title,
        description: photo.description || "",
        image_url: photo.image_url,
        thumbnail_url: photo.thumbnail_url,
        category: photo.category || "Uncategorized",
        tags: photo.tags || [],
        is_featured: photo.is_featured || false,
        is_public: photo.is_public !== false,
        uploaded_by: photo.uploaded_by || "Unknown",
        upload_date: photo.upload_date || photo.created_at,
        file_size: photo.file_size,
        dimensions: photo.dimensions,
        created_at: photo.created_at,
        updated_at: photo.updated_at
      })) || []

      setPhotos(formattedPhotos)

      // Calculate categories with counts
      const categoryStats = new Map<string, number>()
      formattedPhotos.forEach(photo => {
        categoryStats.set(photo.category, (categoryStats.get(photo.category) || 0) + 1)
      })

      const formattedCategories = Array.from(categoryStats.entries()).map(([name, count]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        description: `${count} photos`,
        photo_count: count
      }))

      setCategories(formattedCategories)

    } catch (error: any) {
      console.error("Error fetching photos:", error)
      notifications.show({
        title: "Error",
        message: "Failed to load photo gallery",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setCategory("")
    setTags("")
    setIsFeatured(false)
    setIsPublic(true)
    setPhotoFile(null)
  }

  const handleUploadPhoto = async () => {
    if (!title.trim() || !photoFile || !category) {
      notifications.show({
        title: "Error",
        message: "Please fill in all required fields and select a photo",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Upload file to Supabase Storage
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `photos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, photoFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath)

      // Save photo metadata to database
      const { error: dbError } = await supabase
        .from("photos")
        .insert({
          title: title.trim(),
          description: description.trim(),
          image_url: publicUrl,
          category: category,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          is_featured: isFeatured,
          is_public: isPublic,
          uploaded_by: "Admin", // Would be actual user in real implementation
          upload_date: new Date().toISOString(),
          file_size: photoFile.size,
          dimensions: "Unknown" // Would be calculated from image
        })

      if (dbError) throw dbError

      notifications.show({
        title: "Success",
        message: "Photo uploaded successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeUploadModal()
      resetForm()
      fetchData()

    } catch (error: any) {
      console.error("Error uploading photo:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to upload photo",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditPhoto = (photo: Photo) => {
    setSelectedPhoto(photo)
    setTitle(photo.title)
    setDescription(photo.description)
    setCategory(photo.category)
    setTags(photo.tags.join(', '))
    setIsFeatured(photo.is_featured)
    setIsPublic(photo.is_public)
    openEditModal()
  }

  const handleUpdatePhoto = async () => {
    if (!selectedPhoto || !title.trim() || !category) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("photos")
        .update({
          title: title.trim(),
          description: description.trim(),
          category: category,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          is_featured: isFeatured,
          is_public: isPublic,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedPhoto.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Photo updated successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeEditModal()
      resetForm()
      fetchData()

    } catch (error: any) {
      console.error("Error updating photo:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update photo",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePhoto = (photo: Photo) => {
    setSelectedPhoto(photo)
    openDeleteModal()
  }

  const confirmDeletePhoto = async () => {
    if (!selectedPhoto) return

    setIsSubmitting(true)
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from("photos")
        .delete()
        .eq("id", selectedPhoto.id)

      if (dbError) throw dbError

      // Delete from storage (optional - you might want to keep files)
      // const filePath = selectedPhoto.image_url.split('/').pop()
      // await supabase.storage.from('photos').remove([`photos/${filePath}`])

      notifications.show({
        title: "Success",
        message: "Photo deleted successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeDeleteModal()
      setSelectedPhoto(null)
      fetchData()

    } catch (error: any) {
      console.error("Error deleting photo:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete photo",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleFeatured = async (photo: Photo) => {
    try {
      const { error } = await supabase
        .from("photos")
        .update({ 
          is_featured: !photo.is_featured,
          updated_at: new Date().toISOString()
        })
        .eq("id", photo.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: `Photo ${!photo.is_featured ? 'featured' : 'unfeatured'} successfully`,
        color: "green",
        icon: <CheckCircle size={16} />
      })

      fetchData()

    } catch (error: any) {
      console.error("Error toggling featured status:", error)
      notifications.show({
        title: "Error",
        message: "Failed to update featured status",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    }
  }

  const filteredPhotos = selectedCategory === "all" 
    ? photos 
    : photos.filter(photo => photo.category === selectedCategory)

  const featuredPhotos = photos.filter(photo => photo.is_featured)

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Stack align="center" h={400} justify="center">
          <Camera size={48} stroke={1} color="var(--mantine-color-blue-5)" />
          <Text c="dimmed">Loading Photo Gallery...</Text>
        </Stack>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-pink-6) 0%, var(--mantine-color-purple-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <Camera size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="white">
                Photo Gallery
              </Title>
              <Text size="lg" c="white" opacity={0.9}>
                Manage photos and media for the FIFA league
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="pink">{photos.length}</Text>
              <Text size="sm" c="dimmed">Total Photos</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions and Filters */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between" mb="md">
          <Title order={3}>Photo Gallery Management</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={fetchData}>
              Refresh
            </Button>
            <Button leftSection={<Upload size={16} />} onClick={openUploadModal}>
              Upload Photo
            </Button>
          </Group>
        </Group>

        <Group>
          <Select
            placeholder="Filter by category"
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value || "all")}
            data={[
              { value: "all", label: "All Categories" },
              ...categories.map(cat => ({ 
                value: cat.name, 
                label: `${cat.name} (${cat.photo_count})` 
              }))
            ]}
            style={{ minWidth: 200 }}
          />
        </Group>
      </Paper>

      {/* Statistics */}
      <Group mb="lg" grow>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="pink" variant="light" mx="auto" mb="md">
            <ImageIcon size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="pink">{photos.length}</Text>
          <Text size="sm" c="dimmed">Total Photos</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="yellow" variant="light" mx="auto" mb="md">
            <Star size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="yellow">{featuredPhotos.length}</Text>
          <Text size="sm" c="dimmed">Featured Photos</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
            <Tag size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="blue">{categories.length}</Text>
          <Text size="sm" c="dimmed">Categories</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
            <Eye size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="green">
            {photos.filter(p => p.is_public).length}
          </Text>
          <Text size="sm" c="dimmed">Public Photos</Text>
        </Card>
      </Group>

      {/* Photo Grid */}
      <Paper withBorder p="lg">
        <Group justify="space-between" mb="md">
          <Title order={4}>
            {selectedCategory === "all" ? "All Photos" : selectedCategory}
          </Title>
          <Text size="sm" c="dimmed">
            {filteredPhotos.length} photos
          </Text>
        </Group>

        {filteredPhotos.length === 0 ? (
          <Stack align="center" py="xl">
            <Camera size={48} stroke={1} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed">
              {selectedCategory === "all" ? "No photos found" : `No photos in ${selectedCategory}`}
            </Text>
            <Button leftSection={<Upload size={16} />} onClick={openUploadModal}>
              Upload First Photo
            </Button>
          </Stack>
        ) : (
          <Grid>
            {filteredPhotos.map((photo) => (
              <Grid.Col key={photo.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card withBorder shadow="sm" p={0} h="100%">
                  <Card.Section>
                    <div style={{ position: 'relative' }}>
                      <Image
                        src={photo.thumbnail_url || photo.image_url}
                        alt={photo.title}
                        height={200}
                        style={{ objectFit: 'cover' }}
                      />
                      
                      {/* Overlay badges */}
                      <div style={{ 
                        position: 'absolute', 
                        top: 8, 
                        left: 8,
                        display: 'flex',
                        gap: 4
                      }}>
                        {photo.is_featured && (
                          <Badge color="yellow" variant="filled" size="sm">
                            Featured
                          </Badge>
                        )}
                        {!photo.is_public && (
                          <Badge color="red" variant="filled" size="sm">
                            Private
                          </Badge>
                        )}
                      </div>

                      {/* Action menu */}
                      <div style={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8
                      }}>
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <ActionIcon variant="filled" color="dark" size="sm">
                              <MoreHorizontal size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item 
                              leftSection={<Eye size={14} />}
                              onClick={() => {
                                setSelectedPhoto(photo)
                                openViewModal()
                              }}
                            >
                              View Details
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<Edit size={14} />}
                              onClick={() => handleEditPhoto(photo)}
                            >
                              Edit Photo
                            </Menu.Item>
                            <Menu.Item 
                              leftSection={<Star size={14} />}
                              onClick={() => toggleFeatured(photo)}
                            >
                              {photo.is_featured ? 'Unfeature' : 'Feature'}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item 
                              leftSection={<Trash2 size={14} />}
                              color="red"
                              onClick={() => handleDeletePhoto(photo)}
                            >
                              Delete Photo
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </div>
                    </div>
                  </Card.Section>

                  <Stack gap="xs" p="md">
                    <Text fw={500} lineClamp={1}>{photo.title}</Text>
                    <Text size="sm" c="dimmed" lineClamp={2}>
                      {photo.description || "No description"}
                    </Text>
                    <Group justify="space-between">
                      <Badge variant="light" size="sm">{photo.category}</Badge>
                      <Text size="xs" c="dimmed">
                        {new Date(photo.upload_date).toLocaleDateString()}
                      </Text>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Upload Photo Modal */}
      <Modal opened={uploadModalOpened} onClose={closeUploadModal} title="Upload New Photo" size="lg">
        <Stack>
          <FileInput
            label="Photo File"
            placeholder="Select photo file"
            value={photoFile}
            onChange={setPhotoFile}
            accept="image/*"
            required
          />

          <TextInput
            label="Photo Title"
            placeholder="Enter photo title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <Textarea
            label="Description"
            placeholder="Enter photo description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          
          <Select
            label="Category"
            placeholder="Select category"
            value={category}
            onChange={(value) => setCategory(value || "")}
            data={photoCategories.map(cat => ({ value: cat, label: cat }))}
            required
          />
          
          <TextInput
            label="Tags"
            placeholder="Enter tags separated by commas"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            description="e.g. match, team, celebration"
          />

          <Group>
            <Switch
              label="Featured Photo"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.currentTarget.checked)}
            />
            
            <Switch
              label="Public Photo"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.currentTarget.checked)}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeUploadModal}>
              Cancel
            </Button>
            <Button onClick={handleUploadPhoto} loading={isSubmitting}>
              Upload Photo
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Photo Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit Photo" size="lg">
        <Stack>
          <TextInput
            label="Photo Title"
            placeholder="Enter photo title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <Textarea
            label="Description"
            placeholder="Enter photo description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          
          <Select
            label="Category"
            placeholder="Select category"
            value={category}
            onChange={(value) => setCategory(value || "")}
            data={photoCategories.map(cat => ({ value: cat, label: cat }))}
            required
          />
          
          <TextInput
            label="Tags"
            placeholder="Enter tags separated by commas"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <Group>
            <Switch
              label="Featured Photo"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.currentTarget.checked)}
            />
            
            <Switch
              label="Public Photo"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.currentTarget.checked)}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePhoto} loading={isSubmitting}>
              Update Photo
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Photo Modal */}
      <Modal opened={viewModalOpened} onClose={closeViewModal} title="Photo Details" size="xl">
        {selectedPhoto && (
          <Stack>
            <Image
              src={selectedPhoto.image_url}
              alt={selectedPhoto.title}
              style={{ maxHeight: 400, objectFit: 'contain' }}
            />
            
            <Title order={4}>{selectedPhoto.title}</Title>
            <Text>{selectedPhoto.description}</Text>
            
            <Group>
              <Badge variant="light">{selectedPhoto.category}</Badge>
              {selectedPhoto.is_featured && <Badge color="yellow">Featured</Badge>}
              {!selectedPhoto.is_public && <Badge color="red">Private</Badge>}
            </Group>
            
            {selectedPhoto.tags.length > 0 && (
              <Group>
                <Text size="sm" fw={500}>Tags:</Text>
                {selectedPhoto.tags.map(tag => (
                  <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
                ))}
              </Group>
            )}
            
            <Group>
              <Text size="sm">
                <strong>Uploaded:</strong> {new Date(selectedPhoto.upload_date).toLocaleString()}
              </Text>
              <Text size="sm">
                <strong>By:</strong> {selectedPhoto.uploaded_by}
              </Text>
              {selectedPhoto.file_size && (
                <Text size="sm">
                  <strong>Size:</strong> {Math.round(selectedPhoto.file_size / 1024)} KB
                </Text>
              )}
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Photo" size="sm">
        {selectedPhoto && (
          <Stack>
            <Text>
              Are you sure you want to delete "{selectedPhoto.title}"? 
              This action cannot be undone.
            </Text>

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button color="red" onClick={confirmDeletePhoto} loading={isSubmitting}>
                Delete Photo
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
