"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import {
  Container,
  Title,
  Text,
  Button,
  Paper,
  Stack,
  Group,
  Table,
  Loader,
  Center,
  Card,
  ThemeIcon,
  Grid,
  Image,
  TextInput,
  Modal,
  FileInput,
  Progress
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  Check,
  AlertCircle,
  Upload,
  RefreshCw,
  Trophy,
  ImageIcon,
  Eye,
  Edit,
  Save,
  X
} from "lucide-react"

interface Club {
  id: string
  name: string
  logo_url?: string
  updated_at: string
}

export default function AdminClubLogosPageMantine() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [clubs, setClubs] = useState<Club[]>([])
  const [updating, setUpdating] = useState(false)
  const [uploadingClub, setUploadingClub] = useState<string | null>(null)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  
  // Modals
  const [uploadModalOpened, { open: openUploadModal, close: closeUploadModal }] = useDisclosure(false)
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  
  // Form states
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("clubs")
        .select("id, name, logo_url, updated_at")
        .order("name")

      if (error) throw error
      setClubs(data || [])
    } catch (error: any) {
      console.error("Error fetching clubs:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch clubs",
        color: "red",
        icon: <AlertCircle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUploadLogo = (club: Club) => {
    setSelectedClub(club)
    setLogoUrl(club.logo_url || "")
    openUploadModal()
  }

  const handleEditLogo = (club: Club) => {
    setSelectedClub(club)
    setLogoUrl(club.logo_url || "")
    openEditModal()
  }

  const uploadLogoFile = async () => {
    if (!logoFile || !selectedClub) return

    setUploadingClub(selectedClub.id)
    setUploadProgress(0)

    try {
      // Upload file to Supabase Storage
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${selectedClub.id}-${Date.now()}.${fileExt}`
      const filePath = `club-logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('club-logos')
        .upload(filePath, logoFile)

      if (uploadError) throw uploadError

      setUploadProgress(50)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('club-logos')
        .getPublicUrl(filePath)

      setUploadProgress(75)

      // Update club with new logo URL
      const { error: updateError } = await supabase
        .from("clubs")
        .update({ 
          logo_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedClub.id)

      if (updateError) throw updateError

      setUploadProgress(100)

      notifications.show({
        title: "Success",
        message: "Club logo uploaded successfully",
        color: "green",
        icon: <Check size={16} />
      })

      closeUploadModal()
      setLogoFile(null)
      setUploadProgress(0)
      fetchClubs()

    } catch (error: any) {
      console.error("Error uploading logo:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to upload logo",
        color: "red",
        icon: <AlertCircle size={16} />
      })
    } finally {
      setUploadingClub(null)
    }
  }

  const updateLogoUrl = async () => {
    if (!selectedClub) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from("clubs")
        .update({ 
          logo_url: logoUrl.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedClub.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Club logo URL updated successfully",
        color: "green",
        icon: <Check size={16} />
      })

      closeEditModal()
      fetchClubs()

    } catch (error: any) {
      console.error("Error updating logo URL:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update logo URL",
        color: "red",
        icon: <AlertCircle size={16} />
      })
    } finally {
      setUpdating(false)
    }
  }

  const removeLogo = async (club: Club) => {
    try {
      const { error } = await supabase
        .from("clubs")
        .update({ 
          logo_url: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", club.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Club logo removed successfully",
        color: "green",
        icon: <Check size={16} />
      })

      fetchClubs()

    } catch (error: any) {
      console.error("Error removing logo:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to remove logo",
        color: "red",
        icon: <AlertCircle size={16} />
      })
    }
  }

  if (loading) {
    return (
      <Container size="xl" py="xl" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading Club Logos...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-orange-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <ImageIcon size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Club Logos Management
              </Title>
              <Text size="lg" c="yellow" >
                Manage club logos and branding assets
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="dark.6">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="blue">{clubs.length}</Text>
              <Text size="sm" c="cyan">Total Clubs</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between">
          <Title order={3}>Club Logos</Title>
          <Button leftSection={<RefreshCw size={16} />} onClick={fetchClubs}>
            Refresh
          </Button>
        </Group>
      </Paper>

      {/* Clubs Grid */}
      <Grid>
        {clubs.map((club) => (
          <Grid.Col key={club.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Card withBorder shadow="sm" p="lg" h="100%">
              <Stack align="center" gap="md">
                {/* Logo Display */}
                <div style={{ 
                  width: 80, 
                  height: 80, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '2px dashed var(--mantine-color-indigo-3)',
                  borderRadius: 'var(--mantine-radius-md)',
                  backgroundColor: 'var(--mantine-color-indigo-0)'
                }}>
                  {club.logo_url ? (
                    <Image
                      src={club.logo_url}
                      alt={club.name}
                      width={60}
                      height={60}
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <ThemeIcon size={40} color="indigo" variant="light">
                      <ImageIcon size={24} />
                    </ThemeIcon>
                  )}
                </div>

                {/* Club Info */}
                <div style={{ textAlign: 'center' }}>
                  <Text fw={600} size="lg">{club.name}</Text>
                  <Text size="sm" c="cyan">
                    {club.logo_url ? 'Logo Set' : 'No Logo'}
                  </Text>
                </div>

                {/* Actions */}
                <Group justify="center" gap="xs">
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<Upload size={14} />}
                    onClick={() => handleUploadLogo(club)}
                    loading={uploadingClub === club.id}
                  >
                    Upload
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="xs"
                    leftSection={<Edit size={14} />}
                    onClick={() => handleEditLogo(club)}
                  >
                    Edit URL
                  </Button>

                  {club.logo_url && (
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      leftSection={<X size={14} />}
                      onClick={() => removeLogo(club)}
                    >
                      Remove
                    </Button>
                  )}
                </Group>

                {/* Last Updated */}
                <Text size="xs" c="cyan">
                  Updated: {new Date(club.updated_at).toLocaleDateString()}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Upload Logo Modal */}
      <Modal opened={uploadModalOpened} onClose={closeUploadModal} title="Upload Club Logo" size="md">
        {selectedClub && (
          <Stack>
            <Text>Upload a new logo for <strong>{selectedClub.name}</strong></Text>
            
            <FileInput
              label="Logo File"
              placeholder="Select image file"
              accept="image/*"
              value={logoFile}
              onChange={setLogoFile}
            />

            {uploadProgress > 0 && (
              <div>
                <Text size="sm" mb="xs">Upload Progress</Text>
                <Progress value={uploadProgress} />
              </div>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeUploadModal}>
                Cancel
              </Button>
              <Button 
                onClick={uploadLogoFile} 
                disabled={!logoFile}
                loading={uploadingClub === selectedClub.id}
              >
                Upload Logo
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Edit Logo URL Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit Logo URL" size="md">
        {selectedClub && (
          <Stack>
            <Text>Edit logo URL for <strong>{selectedClub.name}</strong></Text>
            
            <TextInput
              label="Logo URL"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />

            {logoUrl && (
              <div>
                <Text size="sm" mb="xs">Preview</Text>
                <Center>
                  <Image
                    src={logoUrl}
                    alt="Logo preview"
                    width={80}
                    height={80}
                    style={{ objectFit: 'contain' }}
                    onError={() => {
                      notifications.show({
                        title: "Invalid URL",
                        message: "Could not load image from the provided URL",
                        color: "red",
                        icon: <AlertCircle size={16} />
                      })
                    }}
                  />
                </Center>
              </div>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button onClick={updateLogoUrl} loading={updating}>
                Update URL
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
