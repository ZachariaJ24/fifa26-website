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
  Table,
  Loader,
  Center,
  Modal,
  Card,
  ThemeIcon,
  ActionIcon,
  Menu,
  Grid
} from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  FileText,
  Clock,
  Users,
  Trophy,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Send
} from "lucide-react"

interface DailyRecap {
  id: string
  date: string
  title: string
  content: string
  highlights: string[]
  match_results: any[]
  statistics: any
  author: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
  published_at?: string
}

export default function DailyRecapPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [recaps, setRecaps] = useState<DailyRecap[]>([])
  const [selectedRecap, setSelectedRecap] = useState<DailyRecap | null>(null)
  
  // Modals
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false)
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false)
  
  // Form states
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [highlights, setHighlights] = useState("")
  const [author, setAuthor] = useState("")
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchRecaps()
  }, [])

  const fetchRecaps = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("daily_recaps")
        .select("*")
        .order("date", { ascending: false })

      if (error) throw error
      setRecaps(data || [])
    } catch (error: any) {
      console.error("Error fetching daily recaps:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch daily recaps",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedDate(new Date())
    setTitle("")
    setContent("")
    setHighlights("")
    setAuthor("")
    setStatus('draft')
  }

  const handleCreateRecap = async () => {
    if (!selectedDate || !title.trim() || !content.trim() || !author.trim()) {
      notifications.show({
        title: "Error",
        message: "Please fill in all required fields",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    setIsSubmitting(true)
    try {
      const recapData: any = {
        date: selectedDate.toISOString().split('T')[0],
        title: title.trim(),
        content: content.trim(),
        highlights: highlights.trim() ? highlights.split('\n').filter(h => h.trim()) : [],
        author: author.trim(),
        status,
        match_results: [],
        statistics: {}
      }

      if (status === 'published') {
        recapData.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from("daily_recaps")
        .insert(recapData)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Daily recap created successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeCreateModal()
      resetForm()
      fetchRecaps()
    } catch (error: any) {
      console.error("Error creating recap:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create daily recap",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditRecap = (recap: DailyRecap) => {
    setSelectedRecap(recap)
    setSelectedDate(new Date(recap.date))
    setTitle(recap.title)
    setContent(recap.content)
    setHighlights(recap.highlights?.join('\n') || "")
    setAuthor(recap.author)
    setStatus(recap.status)
    openEditModal()
  }

  const handleUpdateRecap = async () => {
    if (!selectedRecap || !selectedDate || !title.trim() || !content.trim() || !author.trim()) return

    setIsSubmitting(true)
    try {
      const recapData: any = {
        date: selectedDate.toISOString().split('T')[0],
        title: title.trim(),
        content: content.trim(),
        highlights: highlights.trim() ? highlights.split('\n').filter(h => h.trim()) : [],
        author: author.trim(),
        status
      }

      if (status === 'published' && selectedRecap.status !== 'published') {
        recapData.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from("daily_recaps")
        .update(recapData)
        .eq("id", selectedRecap.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Daily recap updated successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeEditModal()
      resetForm()
      fetchRecaps()
    } catch (error: any) {
      console.error("Error updating recap:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update daily recap",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRecap = (recap: DailyRecap) => {
    setSelectedRecap(recap)
    openDeleteModal()
  }

  const confirmDeleteRecap = async () => {
    if (!selectedRecap) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("daily_recaps")
        .delete()
        .eq("id", selectedRecap.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Daily recap deleted successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeDeleteModal()
      setSelectedRecap(null)
      fetchRecaps()
    } catch (error: any) {
      console.error("Error deleting recap:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete daily recap",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewRecap = (recap: DailyRecap) => {
    setSelectedRecap(recap)
    openViewModal()
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      'draft': { color: 'indigo', label: 'Draft' },
      'published': { color: 'green', label: 'Published' },
      'archived': { color: 'orange', label: 'Archived' }
    }

    const config = statusConfig[status] || { color: 'indigo', label: status }
    return <Badge color={config.color} variant="light" size="sm">{config.label}</Badge>
  }

  const publishRecap = async (recap: DailyRecap) => {
    try {
      const { error } = await supabase
        .from("daily_recaps")
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq("id", recap.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Daily recap published successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      fetchRecaps()
    } catch (error: any) {
      console.error("Error publishing recap:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to publish daily recap",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    }
  }

  if (loading) {
    return (
      <Container size="xl" py="xl" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading Daily Recaps...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-green-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <FileText size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Daily Recap Management
              </Title>
              <Text size="lg" c="yellow" >
                Create and manage daily league summaries and highlights
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="dark.6">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="blue">{recaps.length}</Text>
              <Text size="sm" c="cyan">Total Recaps</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions */}
      <Paper withBorder p="md" mb="lg" bg="dark.7">
        <Group justify="space-between">
          <Title order={3}>Daily Recaps</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={fetchRecaps}>
              Refresh
            </Button>
            <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
              Create Recap
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Statistics */}
      <Grid mb="lg">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="indigo" variant="light" mx="auto" mb="md">
              <FileText size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="indigo">
              {recaps.filter(r => r.status === 'draft').length}
            </Text>
            <Text size="sm" c="cyan">Drafts</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
              <CheckCircle size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="green">
              {recaps.filter(r => r.status === 'published').length}
            </Text>
            <Text size="sm" c="cyan">Published</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
              <Clock size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="orange">
              {recaps.filter(r => r.status === 'archived').length}
            </Text>
            <Text size="sm" c="cyan">Archived</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
              <Calendar size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="blue">
              {recaps.filter(r => {
                const recapDate = new Date(r.date)
                const today = new Date()
                return recapDate.toDateString() === today.toDateString()
              }).length}
            </Text>
            <Text size="sm" c="cyan">Today's Recaps</Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Recaps Table */}
      <Paper withBorder bg="dark.7">
        {recaps.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <FileText size={48} stroke={1} color="var(--mantine-color-indigo-5)" />
              <Text c="cyan">No daily recaps found</Text>
              <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
                Create First Recap
              </Button>
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Author</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recaps.map((recap) => (
                  <Table.Tr key={recap.id}>
                    <Table.Td>
                      <Group gap="xs">
                        <Calendar size={14} />
                        <Text fw={500}>
                          {new Date(recap.date).toLocaleDateString()}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500} lineClamp={1}>{recap.title}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{recap.author}</Text>
                    </Table.Td>
                    <Table.Td>
                      {getStatusBadge(recap.status)}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="cyan">
                        {new Date(recap.created_at).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <MoreHorizontal size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item 
                            leftSection={<Eye size={14} />}
                            onClick={() => handleViewRecap(recap)}
                          >
                            View Recap
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<Edit size={14} />}
                            onClick={() => handleEditRecap(recap)}
                          >
                            Edit Recap
                          </Menu.Item>
                          {recap.status === 'draft' && (
                            <Menu.Item 
                              leftSection={<Send size={14} />}
                              color="green"
                              onClick={() => publishRecap(recap)}
                            >
                              Publish
                            </Menu.Item>
                          )}
                          <Menu.Divider />
                          <Menu.Item 
                            leftSection={<Trash2 size={14} />}
                            color="red"
                            onClick={() => handleDeleteRecap(recap)}
                          >
                            Delete Recap
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>

      {/* Create Recap Modal */}
      <Modal opened={createModalOpened} onClose={closeCreateModal} title="Create Daily Recap" size="lg">
        <Stack>
          <DatePicker
            label="Recap Date"
            value={selectedDate}
            onChange={setSelectedDate}
            required
          />
          
          <TextInput
            label="Title"
            placeholder="Enter recap title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <TextInput
            label="Author"
            placeholder="Enter author name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
          
          <Textarea
            label="Highlights"
            placeholder="Enter key highlights (one per line)"
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            rows={4}
          />
          
          <Textarea
            label="Content"
            placeholder="Write the full recap content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            required
          />
          
          <Select
            label="Status"
            value={status}
            onChange={(value) => setStatus(value as any)}
            data={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'archived', label: 'Archived' }
            ]}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateRecap} loading={isSubmitting}>
              Create Recap
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Recap Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit Daily Recap" size="lg">
        <Stack>
          <DatePicker
            label="Recap Date"
            value={selectedDate}
            onChange={setSelectedDate}
            required
          />
          
          <TextInput
            label="Title"
            placeholder="Enter recap title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <TextInput
            label="Author"
            placeholder="Enter author name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
          
          <Textarea
            label="Highlights"
            placeholder="Enter key highlights (one per line)"
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            rows={4}
          />
          
          <Textarea
            label="Content"
            placeholder="Write the full recap content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            required
          />
          
          <Select
            label="Status"
            value={status}
            onChange={(value) => setStatus(value as any)}
            data={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'archived', label: 'Archived' }
            ]}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRecap} loading={isSubmitting}>
              Update Recap
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* View Recap Modal */}
      <Modal opened={viewModalOpened} onClose={closeViewModal} title="View Daily Recap" size="lg">
        {selectedRecap && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600} size="lg">{selectedRecap.title}</Text>
              {getStatusBadge(selectedRecap.status)}
            </Group>
            
            <Group>
              <Text size="sm" c="cyan">
                Date: {new Date(selectedRecap.date).toLocaleDateString()}
              </Text>
              <Text size="sm" c="cyan">
                Author: {selectedRecap.author}
              </Text>
            </Group>

            {selectedRecap.highlights && selectedRecap.highlights.length > 0 && (
              <div>
                <Text fw={500} mb="xs">Highlights:</Text>
                <ul style={{ marginLeft: 20 }}>
                  {selectedRecap.highlights.map((highlight, index) => (
                    <li key={index}>
                      <Text size="sm">{highlight}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <Text fw={500} mb="xs">Content:</Text>
              <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                {selectedRecap.content}
              </Text>
            </div>

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeViewModal}>
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Daily Recap" size="sm">
        {selectedRecap && (
          <Stack>
            <Text>
              Are you sure you want to delete the recap "{selectedRecap.title}" for {new Date(selectedRecap.date).toLocaleDateString()}? This action cannot be undone.
            </Text>

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button color="red" onClick={confirmDeleteRecap} loading={isSubmitting}>
                Delete Recap
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
