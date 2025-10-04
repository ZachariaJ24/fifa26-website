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
  Menu
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  Newspaper,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  Calendar,
  User,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle
} from "lucide-react"

interface NewsArticle {
  id: string
  title: string
  content: string
  excerpt?: string
  author: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  published_at?: string
}

export default function NewsManagementPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  
  // Modals
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false)
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  
  // Form states
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [author, setAuthor] = useState("")
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setArticles(data || [])
    } catch (error: any) {
      console.error("Error fetching articles:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch news articles",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchTerm || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || article.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const resetForm = () => {
    setTitle("")
    setContent("")
    setExcerpt("")
    setAuthor("")
    setStatus('draft')
  }

  const handleCreateArticle = async () => {
    if (!title.trim() || !content.trim() || !author.trim()) {
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
      const articleData: any = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || null,
        author: author.trim(),
        status
      }

      if (status === 'published') {
        articleData.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from("news_articles")
        .insert(articleData)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "News article created successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeCreateModal()
      resetForm()
      fetchArticles()
    } catch (error: any) {
      console.error("Error creating article:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create article",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditArticle = (article: NewsArticle) => {
    setSelectedArticle(article)
    setTitle(article.title)
    setContent(article.content)
    setExcerpt(article.excerpt || "")
    setAuthor(article.author)
    setStatus(article.status)
    openEditModal()
  }

  const handleUpdateArticle = async () => {
    if (!selectedArticle || !title.trim() || !content.trim() || !author.trim()) return

    setIsSubmitting(true)
    try {
      const articleData: any = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || null,
        author: author.trim(),
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'published' && selectedArticle.status !== 'published') {
        articleData.published_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from("news_articles")
        .update(articleData)
        .eq("id", selectedArticle.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "News article updated successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeEditModal()
      resetForm()
      fetchArticles()
    } catch (error: any) {
      console.error("Error updating article:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update article",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteArticle = (article: NewsArticle) => {
    setSelectedArticle(article)
    openDeleteModal()
  }

  const confirmDeleteArticle = async () => {
    if (!selectedArticle) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("news_articles")
        .delete()
        .eq("id", selectedArticle.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "News article deleted successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeDeleteModal()
      setSelectedArticle(null)
      fetchArticles()
    } catch (error: any) {
      console.error("Error deleting article:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete article",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      'draft': { color: 'gray', label: 'Draft' },
      'published': { color: 'green', label: 'Published' },
      'archived': { color: 'orange', label: 'Archived' }
    }

    const config = statusConfig[status] || { color: 'gray', label: status }
    return <Badge color={config.color} variant="light" size="sm">{config.label}</Badge>
  }

  if (loading) {
    return (
      <Container size="xl" py="xl" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading News Management...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-yellow-6) 0%, var(--mantine-color-orange-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <Newspaper size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                News Management
              </Title>
              <Text size="lg" c="yellow" >
                Create, edit, and manage news articles and announcements
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="dark.6">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="orange">{articles.length}</Text>
              <Text size="sm" c="cyan">Total Articles</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Filters and Actions */}
      <Paper withBorder p="md" mb="lg" bg="dark.7">
        <Group justify="space-between" mb="md">
          <Title order={3}>News Articles</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={fetchArticles}>
              Refresh
            </Button>
            <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
              Create Article
            </Button>
          </Group>
        </Group>

        <Group>
          <TextInput
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftSection={<Search size={16} />}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="All Status"
            value={statusFilter}
            onChange={setStatusFilter}
            data={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'archived', label: 'Archived' }
            ]}
            clearable
          />
        </Group>
      </Paper>

      {/* Articles Table */}
      <Paper withBorder bg="dark.7">
        {filteredArticles.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <Newspaper size={48} stroke={1} color="var(--mantine-color-gray-5)" />
              <Text c="cyan">
                {searchTerm || statusFilter ? "No articles match your filters" : "No news articles found"}
              </Text>
              {!searchTerm && !statusFilter && (
                <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
                  Create First Article
                </Button>
              )}
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Author</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredArticles.map((article) => (
                  <Table.Tr key={article.id}>
                    <Table.Td>
                      <div>
                        <Text fw={500} lineClamp={1}>{article.title}</Text>
                        {article.excerpt && (
                          <Text size="sm" c="cyan" lineClamp={2} mt={2}>
                            {article.excerpt}
                          </Text>
                        )}
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <User size={14} />
                        <Text size="sm">{article.author}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {getStatusBadge(article.status)}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Calendar size={14} />
                        <Text size="sm">
                          {new Date(article.created_at).toLocaleDateString()}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <MoreHorizontal size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item leftSection={<Eye size={14} />}>
                            View Article
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<Edit size={14} />}
                            onClick={() => handleEditArticle(article)}
                          >
                            Edit Article
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item 
                            leftSection={<Trash2 size={14} />}
                            color="red"
                            onClick={() => handleDeleteArticle(article)}
                          >
                            Delete Article
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

      {/* Create Article Modal */}
      <Modal opened={createModalOpened} onClose={closeCreateModal} title="Create News Article" size="lg">
        <Stack>
          <TextInput
            label="Title"
            placeholder="Enter article title"
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
            label="Excerpt"
            placeholder="Brief summary of the article"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
          />
          
          <Textarea
            label="Content"
            placeholder="Write your article content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
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
            <Button onClick={handleCreateArticle} loading={isSubmitting}>
              Create Article
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Article Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit News Article" size="lg">
        <Stack>
          <TextInput
            label="Title"
            placeholder="Enter article title"
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
            label="Excerpt"
            placeholder="Brief summary of the article"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
          />
          
          <Textarea
            label="Content"
            placeholder="Write your article content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
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
            <Button onClick={handleUpdateArticle} loading={isSubmitting}>
              Update Article
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Article" size="sm">
        {selectedArticle && (
          <Stack>
            <Text>
              Are you sure you want to delete "{selectedArticle.title}"? This action cannot be undone.
            </Text>

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button color="red" onClick={confirmDeleteArticle} loading={isSubmitting}>
                Delete Article
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
