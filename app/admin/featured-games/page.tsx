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
  Switch,
  Image
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  Star,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Calendar,
  Trophy,
  GamepadIcon as GameController,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Upload,
  Home
} from "lucide-react"

interface FeaturedGame {
  id: string
  title: string
  description: string
  game_date: string
  home_team: string
  away_team: string
  image_url?: string
  is_featured: boolean
  priority: number
  created_at: string
  updated_at: string
}

interface Club {
  id: string
  name: string
  logo_url?: string
}

export default function FeaturedGamesPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [featuredGames, setFeaturedGames] = useState<FeaturedGame[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedGame, setSelectedGame] = useState<FeaturedGame | null>(null)
  
  // Modals
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false)
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  
  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [gameDate, setGameDate] = useState<Date | null>(null)
  const [homeTeam, setHomeTeam] = useState("")
  const [awayTeam, setAwayTeam] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isFeatured, setIsFeatured] = useState(true)
  const [priority, setPriority] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch featured games
      const { data: gamesData, error: gamesError } = await supabase
        .from("featured_games")
        .select("*")
        .order("priority", { ascending: true })

      if (gamesError) throw gamesError
      setFeaturedGames(gamesData || [])

      // Fetch clubs for team selection
      const { data: clubsData, error: clubsError } = await supabase
        .from("clubs")
        .select("id, name, logo_url")
        .eq("is_active", true)
        .order("name")

      if (clubsError) throw clubsError
      setClubs(clubsData || [])

    } catch (error: any) {
      console.error("Error fetching data:", error)
      notifications.show({
        title: "Error",
        message: "Failed to load featured games",
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
    setGameDate(null)
    setHomeTeam("")
    setAwayTeam("")
    setImageUrl("")
    setIsFeatured(true)
    setPriority(1)
  }

  const handleCreateGame = async () => {
    if (!title.trim() || !description.trim() || !gameDate || !homeTeam || !awayTeam) {
      notifications.show({
        title: "Error",
        message: "Please fill in all required fields",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    if (homeTeam === awayTeam) {
      notifications.show({
        title: "Error",
        message: "Home and away teams must be different",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("featured_games")
        .insert({
          title: title.trim(),
          description: description.trim(),
          game_date: gameDate.toISOString(),
          home_team: homeTeam,
          away_team: awayTeam,
          image_url: imageUrl.trim() || null,
          is_featured: isFeatured,
          priority: priority
        })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Featured game created successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeCreateModal()
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error("Error creating featured game:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create featured game",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditGame = (game: FeaturedGame) => {
    setSelectedGame(game)
    setTitle(game.title)
    setDescription(game.description)
    setGameDate(new Date(game.game_date))
    setHomeTeam(game.home_team)
    setAwayTeam(game.away_team)
    setImageUrl(game.image_url || "")
    setIsFeatured(game.is_featured)
    setPriority(game.priority)
    openEditModal()
  }

  const handleUpdateGame = async () => {
    if (!selectedGame || !title.trim() || !description.trim() || !gameDate || !homeTeam || !awayTeam) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("featured_games")
        .update({
          title: title.trim(),
          description: description.trim(),
          game_date: gameDate.toISOString(),
          home_team: homeTeam,
          away_team: awayTeam,
          image_url: imageUrl.trim() || null,
          is_featured: isFeatured,
          priority: priority,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedGame.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Featured game updated successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeEditModal()
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error("Error updating featured game:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update featured game",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteGame = (game: FeaturedGame) => {
    setSelectedGame(game)
    openDeleteModal()
  }

  const confirmDeleteGame = async () => {
    if (!selectedGame) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("featured_games")
        .delete()
        .eq("id", selectedGame.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Featured game deleted successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeDeleteModal()
      setSelectedGame(null)
      fetchData()
    } catch (error: any) {
      console.error("Error deleting featured game:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete featured game",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleFeatured = async (game: FeaturedGame) => {
    try {
      const { error } = await supabase
        .from("featured_games")
        .update({ 
          is_featured: !game.is_featured,
          updated_at: new Date().toISOString()
        })
        .eq("id", game.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: `Game ${!game.is_featured ? 'featured' : 'unfeatured'} successfully`,
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

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading Featured Games...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-yellow-6) 0%, var(--mantine-color-orange-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <Star size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Featured Games
              </Title>
              <Text size="lg" c="yellow" >
                Manage featured games displayed on the homepage
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="orange">{featuredGames.length}</Text>
              <Text size="sm" c="cyan">Featured Games</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between">
          <Title order={3}>Featured Games Management</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={fetchData}>
              Refresh
            </Button>
            <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
              Add Featured Game
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Statistics */}
      <Group mb="lg" grow>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
            <Star size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="orange">{featuredGames.filter(g => g.is_featured).length}</Text>
          <Text size="sm" c="cyan">Active Featured</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
            <GameController size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="blue">{featuredGames.length}</Text>
          <Text size="sm" c="cyan">Total Games</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
            <Calendar size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="green">
            {featuredGames.filter(g => new Date(g.game_date) > new Date()).length}
          </Text>
          <Text size="sm" c="cyan">Upcoming</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="purple" variant="light" mx="auto" mb="md">
            <Home size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="purple">
            {Math.min(featuredGames.filter(g => g.is_featured).length, 3)}
          </Text>
          <Text size="sm" c="cyan">On Homepage</Text>
        </Card>
      </Group>

      {/* Featured Games Table */}
      <Paper withBorder>
        {featuredGames.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <Star size={48} stroke={1} color="var(--mantine-color-gray-5)" />
              <Text c="cyan">No featured games found</Text>
              <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
                Add First Featured Game
              </Button>
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={1000}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Priority</Table.Th>
                  <Table.Th>Game</Table.Th>
                  <Table.Th>Teams</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {featuredGames.map((game) => (
                  <Table.Tr key={game.id}>
                    <Table.Td>
                      <Badge variant="outline" size="sm">
                        #{game.priority}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group>
                        {game.image_url && (
                          <Image
                            src={game.image_url}
                            alt={game.title}
                            width={40}
                            height={40}
                            style={{ objectFit: 'cover', borderRadius: 4 }}
                          />
                        )}
                        <div>
                          <Text fw={500} lineClamp={1}>{game.title}</Text>
                          <Text size="sm" c="cyan" lineClamp={1}>{game.description}</Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Text size="sm" fw={500}>{game.home_team}</Text>
                        <Text size="sm" c="cyan">vs</Text>
                        <Text size="sm" fw={500}>{game.away_team}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Calendar size={14} />
                        <Text size="sm">
                          {new Date(game.game_date).toLocaleDateString()}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {game.is_featured ? (
                          <Badge color="green" variant="light" size="sm">Featured</Badge>
                        ) : (
                          <Badge color="cyan" variant="light" size="sm">Hidden</Badge>
                        )}
                        {new Date(game.game_date) > new Date() && (
                          <Badge color="blue" variant="light" size="sm">Upcoming</Badge>
                        )}
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
                          <Menu.Item 
                            leftSection={<Edit size={14} />}
                            onClick={() => handleEditGame(game)}
                          >
                            Edit Game
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<Star size={14} />}
                            onClick={() => toggleFeatured(game)}
                          >
                            {game.is_featured ? 'Unfeature' : 'Feature'} Game
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item 
                            leftSection={<Trash2 size={14} />}
                            color="red"
                            onClick={() => handleDeleteGame(game)}
                          >
                            Delete Game
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

      {/* Create Game Modal */}
      <Modal opened={createModalOpened} onClose={closeCreateModal} title="Add Featured Game" size="lg">
        <Stack>
          <TextInput
            label="Game Title"
            placeholder="Enter game title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <Textarea
            label="Description"
            placeholder="Enter game description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
          
          <DateTimePicker
            label="Game Date & Time"
            placeholder="Select date and time"
            value={gameDate}
            onChange={setGameDate}
            required
          />
          
          <Group grow>
            <Select
              label="Home Team"
              placeholder="Select home team"
              value={homeTeam}
              onChange={(value) => setHomeTeam(value || "")}
              data={clubs.map(club => ({ value: club.name, label: club.name }))}
              searchable
              required
            />
            
            <Select
              label="Away Team"
              placeholder="Select away team"
              value={awayTeam}
              onChange={(value) => setAwayTeam(value || "")}
              data={clubs.filter(club => club.name !== homeTeam).map(club => ({ value: club.name, label: club.name }))}
              searchable
              required
            />
          </Group>
          
          <TextInput
            label="Image URL"
            placeholder="Enter image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          
          <Group>
            <TextInput
              label="Priority"
              placeholder="Enter priority (1 = highest)"
              type="number"
              min={1}
              value={priority.toString()}
              onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
              style={{ width: 120 }}
            />
            
            <Switch
              label="Featured on homepage"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.currentTarget.checked)}
              mt="xl"
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateGame} loading={isSubmitting}>
              Add Featured Game
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Game Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit Featured Game" size="lg">
        <Stack>
          <TextInput
            label="Game Title"
            placeholder="Enter game title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <Textarea
            label="Description"
            placeholder="Enter game description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
          
          <DateTimePicker
            label="Game Date & Time"
            placeholder="Select date and time"
            value={gameDate}
            onChange={setGameDate}
            required
          />
          
          <Group grow>
            <Select
              label="Home Team"
              placeholder="Select home team"
              value={homeTeam}
              onChange={(value) => setHomeTeam(value || "")}
              data={clubs.map(club => ({ value: club.name, label: club.name }))}
              searchable
              required
            />
            
            <Select
              label="Away Team"
              placeholder="Select away team"
              value={awayTeam}
              onChange={(value) => setAwayTeam(value || "")}
              data={clubs.filter(club => club.name !== homeTeam).map(club => ({ value: club.name, label: club.name }))}
              searchable
              required
            />
          </Group>
          
          <TextInput
            label="Image URL"
            placeholder="Enter image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          
          <Group>
            <TextInput
              label="Priority"
              placeholder="Enter priority (1 = highest)"
              type="number"
              min={1}
              value={priority.toString()}
              onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
              style={{ width: 120 }}
            />
            
            <Switch
              label="Featured on homepage"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.currentTarget.checked)}
              mt="xl"
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGame} loading={isSubmitting}>
              Update Featured Game
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Featured Game" size="sm">
        {selectedGame && (
          <Stack>
            <Text>
              Are you sure you want to delete the featured game "{selectedGame.title}"? 
              This action cannot be undone.
            </Text>

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button color="red" onClick={confirmDeleteGame} loading={isSubmitting}>
                Delete Game
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
