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
  Paper,
  Stack,
  Group,
  Badge,
  Table,
  Loader,
  Center,
  Alert,
  Modal,
  Tabs,
  Card,
  ThemeIcon,
  ActionIcon,
  Menu,
  NumberInput,
  Switch,
  Avatar,
  Grid,
  Divider
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  Upload,
  Users,
  Trophy,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Crown,
  Target,
  Activity,
  BarChart3,
  MoreHorizontal,
  X
} from "lucide-react"

interface Club {
  id: string
  name: string
  logo_url?: string
  wins: number
  losses: number
  draws: number
  points: number
  matches_played: number
  goals_scored: number
  goals_conceded: number
  goal_difference: number
  is_active: boolean
  created_at: string
  updated_at: string
  ea_club_id?: string
  discord_role_id?: string
  total_retained_salary?: number
}

export default function ClubManagementPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)

  // Modals
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false)
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)

  // Form states
  const [clubName, setClubName] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [eaClubId, setEaClubId] = useState("")
  const [discordRoleId, setDiscordRoleId] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchClubs()
  }, [])

  const fetchClubs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setClubs(data || [])
    } catch (error: any) {
      console.error("Error fetching clubs:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch clubs",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.ea_club_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetForm = () => {
    setClubName("")
    setLogoUrl("")
    setEaClubId("")
    setDiscordRoleId("")
    setIsActive(true)
  }

  const handleCreateClub = async () => {
    if (!clubName.trim()) {
      notifications.show({
        title: "Error",
        message: "Club name is required",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("clubs")
        .insert({
          name: clubName.trim(),
          logo_url: logoUrl.trim() || null,
          ea_club_id: eaClubId.trim() || null,
          discord_role_id: discordRoleId.trim() || null,
          is_active: isActive,
          wins: 0,
          losses: 0,
          draws: 0,
          points: 0,
          matches_played: 0,
          goals_scored: 0,
          goals_conceded: 0,
          goal_difference: 0
        })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Club created successfully",
        color: "green",
        icon: <CheckCircle2 size={16} />
      })

      closeCreateModal()
      resetForm()
      fetchClubs()
    } catch (error: any) {
      console.error("Error creating club:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create club",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClub = (club: Club) => {
    setSelectedClub(club)
    setClubName(club.name)
    setLogoUrl(club.logo_url || "")
    setEaClubId(club.ea_club_id || "")
    setDiscordRoleId(club.discord_role_id || "")
    setIsActive(club.is_active)
    openEditModal()
  }

  const handleUpdateClub = async () => {
    if (!selectedClub || !clubName.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("clubs")
        .update({
          name: clubName.trim(),
          logo_url: logoUrl.trim() || null,
          ea_club_id: eaClubId.trim() || null,
          discord_role_id: discordRoleId.trim() || null,
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedClub.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Club updated successfully",
        color: "green",
        icon: <CheckCircle2 size={16} />
      })

      closeEditModal()
      resetForm()
      fetchClubs()
    } catch (error: any) {
      console.error("Error updating club:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update club",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClub = (club: Club) => {
    setSelectedClub(club)
    openDeleteModal()
  }

  const confirmDeleteClub = async () => {
    if (!selectedClub) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("clubs")
        .delete()
        .eq("id", selectedClub.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Club deleted successfully",
        color: "green",
        icon: <CheckCircle2 size={16} />
      })

      closeDeleteModal()
      setSelectedClub(null)
      fetchClubs()
    } catch (error: any) {
      console.error("Error deleting club:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete club",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="dimmed">Loading Club Management...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-green-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="blue">
              <Building2 size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="white">
                Club Management
              </Title>
              <Text size="lg" c="white" opacity={0.9}>
                Manage clubs, rosters, and team information
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="blue">{clubs.length}</Text>
              <Text size="sm" c="dimmed">Total Clubs</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions and Search */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between" mb="md">
          <Title order={3}>Club Management</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={fetchClubs}>
              Refresh
            </Button>
            <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
              Create Club
            </Button>
          </Group>
        </Group>

        <TextInput
          placeholder="Search clubs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftSection={<Search size={16} />}
          style={{ maxWidth: 400 }}
        />
      </Paper>

      {/* Clubs Grid */}
      <Grid>
        {filteredClubs.map((club) => (
          <Grid.Col key={club.id} span={{ base: 12, sm: 6, lg: 4 }}>
            <Card withBorder shadow="sm" p="lg" h="100%">
              <Group justify="space-between" mb="md">
                <Group>
                  {club.logo_url ? (
                    <Avatar src={club.logo_url} size="md" radius="md" />
                  ) : (
                    <ThemeIcon size="md" color="blue" variant="light">
                      <Building2 size={20} />
                    </ThemeIcon>
                  )}
                  <div>
                    <Text fw={600} size="lg">{club.name}</Text>
                    <Badge color={club.is_active ? "green" : "orange"} variant="light" size="sm">
                      {club.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </Group>

                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <ActionIcon variant="subtle">
                      <MoreHorizontal size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<Eye size={14} />}>
                      View Details
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Edit size={14} />}
                      onClick={() => handleEditClub(club)}
                    >
                      Edit Club
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<Trash2 size={14} />}
                      color="red"
                      onClick={() => handleDeleteClub(club)}
                    >
                      Delete Club
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>

              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Record</Text>
                  <Text size="sm" fw={500}>
                    {club.wins}W - {club.losses}L - {club.draws}D
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Points</Text>
                  <Badge color="blue" variant="light" size="sm">
                    {club.points}
                  </Badge>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Goal Difference</Text>
                  <Text size="sm" fw={500} c={club.goal_difference >= 0 ? "green" : "red"}>
                    {club.goal_difference >= 0 ? '+' : ''}{club.goal_difference}
                  </Text>
                </Group>

                {club.ea_club_id && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">EA Club ID</Text>
                    <Text size="sm" fw={500}>{club.ea_club_id}</Text>
                  </Group>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {filteredClubs.length === 0 && (
        <Center p="xl">
          <Stack align="center">
            <Building2 size={48} stroke={1} color="var(--mantine-color-blue-5)" />
            <Text c="dimmed">
              {searchTerm ? `No clubs match "${searchTerm}"` : "No clubs found"}
            </Text>
            {!searchTerm && (
              <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
                Create First Club
              </Button>
            )}
          </Stack>
        </Center>
      )}

      {/* Create Club Modal */}
      <Modal opened={createModalOpened} onClose={closeCreateModal} title="Create New Club" size="md">
        <Stack>
          <TextInput
            label="Club Name"
            placeholder="Enter club name"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            required
          />

          <TextInput
            label="Logo URL"
            placeholder="https://example.com/logo.png"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />

          <TextInput
            label="EA Club ID"
            placeholder="Enter EA Sports Club ID"
            value={eaClubId}
            onChange={(e) => setEaClubId(e.target.value)}
          />

          <TextInput
            label="Discord Role ID"
            placeholder="Enter Discord role ID"
            value={discordRoleId}
            onChange={(e) => setDiscordRoleId(e.target.value)}
          />

          <Switch
            label="Active Club"
            checked={isActive}
            onChange={(e) => setIsActive(e.currentTarget.checked)}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateClub} loading={isSubmitting}>
              Create Club
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Club Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit Club" size="md">
        <Stack>
          <TextInput
            label="Club Name"
            placeholder="Enter club name"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            required
          />

          <TextInput
            label="Logo URL"
            placeholder="https://example.com/logo.png"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />

          <TextInput
            label="EA Club ID"
            placeholder="Enter EA Sports Club ID"
            value={eaClubId}
            onChange={(e) => setEaClubId(e.target.value)}
          />

          <TextInput
            label="Discord Role ID"
            placeholder="Enter Discord role ID"
            value={discordRoleId}
            onChange={(e) => setDiscordRoleId(e.target.value)}
          />

          <Switch
            label="Active Club"
            checked={isActive}
            onChange={(e) => setIsActive(e.currentTarget.checked)}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={handleUpdateClub} loading={isSubmitting}>
              Update Club
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Club" size="sm">
        {selectedClub && (
          <Stack>
            <Alert icon={<AlertTriangle size={16} />} color="red" variant="light">
              <Text fw={600}>Are you sure?</Text>
              <Text size="sm">
                This will permanently delete "{selectedClub.name}" and all associated data. This action cannot be undone.
              </Text>
            </Alert>

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button color="red" onClick={confirmDeleteClub} loading={isSubmitting}>
                Delete Club
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
