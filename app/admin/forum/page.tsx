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
  Grid,
  Switch
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  Users,
  Clock,
  Pin,
  Lock,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Archive,
  MessageCircle
} from "lucide-react"

interface ForumPost {
  id: string
  title: string
  content: string
  author_id: string
  author_name: string
  category_id: string
  category_name: string
  is_pinned: boolean
  is_locked: boolean
  is_archived: boolean
  reply_count: number
  view_count: number
  created_at: string
  updated_at: string
}

interface ForumCategory {
  id: string
  name: string
  description: string
  is_active: boolean
  post_count: number
}

export default function ForumManagementPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null)
  
  // Modals
  const [createPostModalOpened, { open: openCreatePostModal, close: closeCreatePostModal }] = useDisclosure(false)
  const [editPostModalOpened, { open: openEditPostModal, close: closeEditPostModal }] = useDisclosure(false)
  const [deletePostModalOpened, { open: openDeletePostModal, close: closeDeletePostModal }] = useDisclosure(false)
  const [createCategoryModalOpened, { open: openCreateCategoryModal, close: closeCategoryModal }] = useDisclosure(false)
  
  // Form states
  const [postTitle, setPostTitle] = useState("")
  const [postContent, setPostContent] = useState("")
  const [postCategoryId, setPostCategoryId] = useState("")
  const [isPinned, setIsPinned] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch forum posts
      const { data: postsData, error: postsError } = await supabase
        .from("forum_posts")
        .select(`
          *,
          users!inner(gamer_tag_id),
          forum_categories!inner(name)
        `)
        .order("created_at", { ascending: false })

      if (postsError) throw postsError

      const formattedPosts = postsData?.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        author_id: post.author_id,
        author_name: post.users?.gamer_tag_id || 'Unknown User',
        category_id: post.category_id,
        category_name: post.forum_categories?.name || 'Unknown Category',
        is_pinned: post.is_pinned || false,
        is_locked: post.is_locked || false,
        is_archived: post.is_archived || false,
        reply_count: post.reply_count || 0,
        view_count: post.view_count || 0,
        created_at: post.created_at,
        updated_at: post.updated_at
      })) || []

      setPosts(formattedPosts)

      // Fetch forum categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("forum_categories")
        .select("*")
        .order("name")

      if (categoriesError) throw categoriesError

      const formattedCategories = categoriesData?.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description || '',
        is_active: category.is_active !== false,
        post_count: formattedPosts.filter(p => p.category_id === category.id).length
      })) || []

      setCategories(formattedCategories)

    } catch (error: any) {
      console.error("Error fetching forum data:", error)
      notifications.show({
        title: "Error",
        message: "Failed to load forum data",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || post.category_id === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const resetPostForm = () => {
    setPostTitle("")
    setPostContent("")
    setPostCategoryId("")
    setIsPinned(false)
    setIsLocked(false)
  }

  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim() || !postCategoryId) {
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
      const { error } = await supabase
        .from("forum_posts")
        .insert({
          title: postTitle.trim(),
          content: postContent.trim(),
          category_id: postCategoryId,
          is_pinned: isPinned,
          is_locked: isLocked,
          author_id: (await supabase.auth.getUser()).data.user?.id
        })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Forum post created successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeCreatePostModal()
      resetPostForm()
      fetchData()
    } catch (error: any) {
      console.error("Error creating post:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create forum post",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditPost = (post: ForumPost) => {
    setSelectedPost(post)
    setPostTitle(post.title)
    setPostContent(post.content)
    setPostCategoryId(post.category_id)
    setIsPinned(post.is_pinned)
    setIsLocked(post.is_locked)
    openEditPostModal()
  }

  const handleUpdatePost = async () => {
    if (!selectedPost || !postTitle.trim() || !postContent.trim() || !postCategoryId) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("forum_posts")
        .update({
          title: postTitle.trim(),
          content: postContent.trim(),
          category_id: postCategoryId,
          is_pinned: isPinned,
          is_locked: isLocked,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedPost.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Forum post updated successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeEditPostModal()
      resetPostForm()
      fetchData()
    } catch (error: any) {
      console.error("Error updating post:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update forum post",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePost = (post: ForumPost) => {
    setSelectedPost(post)
    openDeletePostModal()
  }

  const confirmDeletePost = async () => {
    if (!selectedPost) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("forum_posts")
        .delete()
        .eq("id", selectedPost.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Forum post deleted successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeDeletePostModal()
      setSelectedPost(null)
      fetchData()
    } catch (error: any) {
      console.error("Error deleting post:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete forum post",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      notifications.show({
        title: "Error",
        message: "Category name is required",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("forum_categories")
        .insert({
          name: categoryName.trim(),
          description: categoryDescription.trim() || null,
          is_active: true
        })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Forum category created successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeCategoryModal()
      setCategoryName("")
      setCategoryDescription("")
      fetchData()
    } catch (error: any) {
      console.error("Error creating category:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create forum category",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePostPin = async (post: ForumPost) => {
    try {
      const { error } = await supabase
        .from("forum_posts")
        .update({ is_pinned: !post.is_pinned })
        .eq("id", post.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: `Post ${!post.is_pinned ? 'pinned' : 'unpinned'} successfully`,
        color: "green",
        icon: <CheckCircle size={16} />
      })

      fetchData()
    } catch (error: any) {
      console.error("Error toggling pin:", error)
      notifications.show({
        title: "Error",
        message: "Failed to update post",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    }
  }

  const togglePostLock = async (post: ForumPost) => {
    try {
      const { error } = await supabase
        .from("forum_posts")
        .update({ is_locked: !post.is_locked })
        .eq("id", post.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: `Post ${!post.is_locked ? 'locked' : 'unlocked'} successfully`,
        color: "green",
        icon: <CheckCircle size={16} />
      })

      fetchData()
    } catch (error: any) {
      console.error("Error toggling lock:", error)
      notifications.show({
        title: "Error",
        message: "Failed to update post",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    }
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading Forum Management...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-purple-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <MessageSquare size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Forum Management
              </Title>
              <Text size="lg" c="yellow" >
                Manage forum posts, categories, and community discussions
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="blue">{posts.length}</Text>
              <Text size="sm" c="cyan">Total Posts</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Statistics */}
      <Grid mb="lg">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
              <MessageSquare size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="blue">{posts.length}</Text>
            <Text size="sm" c="cyan">Total Posts</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
              <Archive size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="green">{categories.length}</Text>
            <Text size="sm" c="cyan">Categories</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
              <Pin size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="orange">
              {posts.filter(p => p.is_pinned).length}
            </Text>
            <Text size="sm" c="cyan">Pinned Posts</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="red" variant="light" mx="auto" mb="md">
              <Lock size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="red">
              {posts.filter(p => p.is_locked).length}
            </Text>
            <Text size="sm" c="cyan">Locked Posts</Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Actions and Filters */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between" mb="md">
          <Title order={3}>Forum Posts</Title>
          <Group>
            <Button leftSection={<Plus size={16} />} onClick={openCreateCategoryModal} variant="outline">
              Add Category
            </Button>
            <Button leftSection={<RefreshCw size={16} />} onClick={fetchData}>
              Refresh
            </Button>
            <Button leftSection={<Plus size={16} />} onClick={openCreatePostModal}>
              Create Post
            </Button>
          </Group>
        </Group>

        <Group>
          <TextInput
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftSection={<Search size={16} />}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="All Categories"
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value || "")}
            data={categories.map(cat => ({ value: cat.id, label: cat.name }))}
            clearable
            style={{ minWidth: 200 }}
          />
        </Group>
      </Paper>

      {/* Posts Table */}
      <Paper withBorder>
        {filteredPosts.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <MessageSquare size={48} stroke={1} color="var(--mantine-color-gray-5)" />
              <Text c="cyan">
                {searchTerm || selectedCategory ? "No posts match your filters" : "No forum posts found"}
              </Text>
              {!searchTerm && !selectedCategory && (
                <Button leftSection={<Plus size={16} />} onClick={openCreatePostModal}>
                  Create First Post
                </Button>
              )}
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={1000}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Author</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Replies</Table.Th>
                  <Table.Th>Views</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredPosts.map((post) => (
                  <Table.Tr key={post.id}>
                    <Table.Td>
                      <Group>
                        {post.is_pinned && <Pin size={14} color="var(--mantine-color-orange-6)" />}
                        {post.is_locked && <Lock size={14} color="var(--mantine-color-red-6)" />}
                        <Text fw={500} lineClamp={1}>{post.title}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{post.author_name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" size="sm">{post.category_name}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <MessageCircle size={14} />
                        <Text size="sm">{post.reply_count}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Eye size={14} />
                        <Text size="sm">{post.view_count}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {post.is_pinned && <Badge color="orange" variant="light" size="xs">Pinned</Badge>}
                        {post.is_locked && <Badge color="red" variant="light" size="xs">Locked</Badge>}
                        {post.is_archived && <Badge color="cyan" variant="light" size="xs">Archived</Badge>}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="cyan">
                        {new Date(post.created_at).toLocaleDateString()}
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
                            leftSection={<Edit size={14} />}
                            onClick={() => handleEditPost(post)}
                          >
                            Edit Post
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<Pin size={14} />}
                            onClick={() => togglePostPin(post)}
                          >
                            {post.is_pinned ? 'Unpin' : 'Pin'} Post
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<Lock size={14} />}
                            onClick={() => togglePostLock(post)}
                          >
                            {post.is_locked ? 'Unlock' : 'Lock'} Post
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item 
                            leftSection={<Trash2 size={14} />}
                            color="red"
                            onClick={() => handleDeletePost(post)}
                          >
                            Delete Post
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

      {/* Create Post Modal */}
      <Modal opened={createPostModalOpened} onClose={closeCreatePostModal} title="Create Forum Post" size="lg">
        <Stack>
          <TextInput
            label="Title"
            placeholder="Enter post title"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            required
          />
          
          <Select
            label="Category"
            placeholder="Select category"
            value={postCategoryId}
            onChange={(value) => setPostCategoryId(value || "")}
            data={categories.map(cat => ({ value: cat.id, label: cat.name }))}
            required
          />
          
          <Textarea
            label="Content"
            placeholder="Write your post content..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows={8}
            required
          />
          
          <Group>
            <Switch
              label="Pin this post"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.currentTarget.checked)}
            />
            <Switch
              label="Lock this post"
              checked={isLocked}
              onChange={(e) => setIsLocked(e.currentTarget.checked)}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeCreatePostModal}>
              Cancel
            </Button>
            <Button onClick={handleCreatePost} loading={isSubmitting}>
              Create Post
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Post Modal */}
      <Modal opened={editPostModalOpened} onClose={closeEditPostModal} title="Edit Forum Post" size="lg">
        <Stack>
          <TextInput
            label="Title"
            placeholder="Enter post title"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            required
          />
          
          <Select
            label="Category"
            placeholder="Select category"
            value={postCategoryId}
            onChange={(value) => setPostCategoryId(value || "")}
            data={categories.map(cat => ({ value: cat.id, label: cat.name }))}
            required
          />
          
          <Textarea
            label="Content"
            placeholder="Write your post content..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows={8}
            required
          />
          
          <Group>
            <Switch
              label="Pin this post"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.currentTarget.checked)}
            />
            <Switch
              label="Lock this post"
              checked={isLocked}
              onChange={(e) => setIsLocked(e.currentTarget.checked)}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeEditPostModal}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePost} loading={isSubmitting}>
              Update Post
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Create Category Modal */}
      <Modal opened={createCategoryModalOpened} onClose={closeCategoryModal} title="Create Forum Category" size="md">
        <Stack>
          <TextInput
            label="Category Name"
            placeholder="Enter category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
          
          <Textarea
            label="Description"
            placeholder="Enter category description"
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            rows={3}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeCategoryModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} loading={isSubmitting}>
              Create Category
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Post Modal */}
      <Modal opened={deletePostModalOpened} onClose={closeDeletePostModal} title="Delete Forum Post" size="sm">
        {selectedPost && (
          <Stack>
            <Text>
              Are you sure you want to delete the post "{selectedPost.title}"? This action cannot be undone and will also delete all replies.
            </Text>

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeDeletePostModal}>
                Cancel
              </Button>
              <Button color="red" onClick={confirmDeletePost} loading={isSubmitting}>
                Delete Post
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
