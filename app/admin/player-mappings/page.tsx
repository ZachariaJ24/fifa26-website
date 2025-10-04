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
  Alert
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Link,
  Unlink,
  GamepadIcon as GameController,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Target
} from "lucide-react"

interface PlayerMapping {
  id: string
  player_id: string
  ea_player_id: string
  ea_player_name: string
  gamer_tag: string
  club_name: string
  position?: string
  overall_rating?: number
  created_at: string
  updated_at: string
}

interface Player {
  id: string
  user_id: string
  gamer_tag: string
  club_name: string
}

export default function PlayerMappingsPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [mappings, setMappings] = useState<PlayerMapping[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMapping, setSelectedMapping] = useState<PlayerMapping | null>(null)
  
  // Modals
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false)
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  
  // Form states
  const [selectedPlayerId, setSelectedPlayerId] = useState("")
  const [eaPlayerId, setEaPlayerId] = useState("")
  const [eaPlayerName, setEaPlayerName] = useState("")
  const [position, setPosition] = useState("")
  const [overallRating, setOverallRating] = useState<number | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const positions = [
    'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'CF', 'ST'
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch player mappings
      const { data: mappingsData, error: mappingsError } = await supabase
        .from("player_mappings")
        .select(`
          *,
          players!inner(
            users!inner(gamer_tag_id),
            clubs(name)
          )
        `)
        .order("created_at", { ascending: false })

      if (mappingsError) throw mappingsError

      const formattedMappings = mappingsData?.map(mapping => ({
        id: mapping.id,
        player_id: mapping.player_id,
        ea_player_id: mapping.ea_player_id,
        ea_player_name: mapping.ea_player_name,
        gamer_tag: mapping.players?.users?.gamer_tag_id || 'Unknown',
        club_name: mapping.players?.clubs?.name || 'No Club',
        position: mapping.position,
        overall_rating: mapping.overall_rating,
        created_at: mapping.created_at,
        updated_at: mapping.updated_at
      })) || []

      setMappings(formattedMappings)

      // Fetch available players (those without mappings)
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select(`
          id,
          user_id,
          users!inner(gamer_tag_id),
          clubs(name)
        `)
        .eq("status", "active")

      if (playersError) throw playersError

      const formattedPlayers = playersData?.map(player => ({
        id: player.id,
        user_id: player.user_id,
        gamer_tag: player.users?.gamer_tag_id || 'Unknown',
        club_name: player.clubs?.name || 'No Club'
      })) || []

      setPlayers(formattedPlayers)

    } catch (error: any) {
      console.error("Error fetching data:", error)
      notifications.show({
        title: "Error",
        message: "Failed to load player mappings",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredMappings = mappings.filter(mapping =>
    mapping.gamer_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.ea_player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.club_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetForm = () => {
    setSelectedPlayerId("")
    setEaPlayerId("")
    setEaPlayerName("")
    setPosition("")
    setOverallRating(undefined)
  }

  const handleCreateMapping = async () => {
    if (!selectedPlayerId || !eaPlayerId.trim() || !eaPlayerName.trim()) {
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
        .from("player_mappings")
        .insert({
          player_id: selectedPlayerId,
          ea_player_id: eaPlayerId.trim(),
          ea_player_name: eaPlayerName.trim(),
          position: position || null,
          overall_rating: overallRating || null
        })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Player mapping created successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeCreateModal()
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error("Error creating mapping:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create player mapping",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditMapping = (mapping: PlayerMapping) => {
    setSelectedMapping(mapping)
    setSelectedPlayerId(mapping.player_id)
    setEaPlayerId(mapping.ea_player_id)
    setEaPlayerName(mapping.ea_player_name)
    setPosition(mapping.position || "")
    setOverallRating(mapping.overall_rating)
    openEditModal()
  }

  const handleUpdateMapping = async () => {
    if (!selectedMapping || !selectedPlayerId || !eaPlayerId.trim() || !eaPlayerName.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("player_mappings")
        .update({
          player_id: selectedPlayerId,
          ea_player_id: eaPlayerId.trim(),
          ea_player_name: eaPlayerName.trim(),
          position: position || null,
          overall_rating: overallRating || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedMapping.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Player mapping updated successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeEditModal()
      resetForm()
      fetchData()
    } catch (error: any) {
      console.error("Error updating mapping:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update player mapping",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMapping = (mapping: PlayerMapping) => {
    setSelectedMapping(mapping)
    openDeleteModal()
  }

  const confirmDeleteMapping = async () => {
    if (!selectedMapping) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("player_mappings")
        .delete()
        .eq("id", selectedMapping.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Player mapping deleted successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeDeleteModal()
      setSelectedMapping(null)
      fetchData()
    } catch (error: any) {
      console.error("Error deleting mapping:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete player mapping",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAvailablePlayers = () => {
    const mappedPlayerIds = new Set(mappings.map(m => m.player_id))
    return players.filter(p => !mappedPlayerIds.has(p.id))
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading Player Mappings...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-green-6) 0%, var(--mantine-color-blue-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <Link size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Player Mappings
              </Title>
              <Text size="lg" c="yellow" >
                Map league players to EA Sports FIFA player data
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="green">{mappings.length}</Text>
              <Text size="sm" c="cyan">Mapped Players</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions and Search */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between" mb="md">
          <Title order={3}>Player Mappings</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={fetchData}>
              Refresh
            </Button>
            <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
              Create Mapping
            </Button>
          </Group>
        </Group>

        <TextInput
          placeholder="Search by player name, EA name, or club..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftSection={<Search size={16} />}
          style={{ maxWidth: 400 }}
        />
      </Paper>

      {/* Info Alert */}
      <Alert color="blue" variant="light" mb="lg">
        <Text fw={500}>About Player Mappings</Text>
        <Text size="sm" mt="xs">
          Player mappings connect your league players to their EA Sports FIFA counterparts. 
          This enables statistics synchronization and enhanced player profiles.
        </Text>
      </Alert>

      {/* Statistics */}
      <Group mb="lg" grow>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
            <Link size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="green">{mappings.length}</Text>
          <Text size="sm" c="cyan">Mapped Players</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
            <Unlink size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="orange">{getAvailablePlayers().length}</Text>
          <Text size="sm" c="cyan">Unmapped Players</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
            <GameController size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="blue">
            {mappings.filter(m => m.overall_rating).length}
          </Text>
          <Text size="sm" c="cyan">With Ratings</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="purple" variant="light" mx="auto" mb="md">
            <Target size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="purple">
            {mappings.filter(m => m.position).length}
          </Text>
          <Text size="sm" c="cyan">With Positions</Text>
        </Card>
      </Group>

      {/* Mappings Table */}
      <Paper withBorder>
        {filteredMappings.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <Link size={48} stroke={1} color="var(--mantine-color-gray-5)" />
              <Text c="cyan">
                {searchTerm ? `No mappings match "${searchTerm}"` : "No player mappings found"}
              </Text>
              {!searchTerm && (
                <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
                  Create First Mapping
                </Button>
              )}
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={900}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>League Player</Table.Th>
                  <Table.Th>EA Player</Table.Th>
                  <Table.Th>Position</Table.Th>
                  <Table.Th>Rating</Table.Th>
                  <Table.Th>Club</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredMappings.map((mapping) => (
                  <Table.Tr key={mapping.id}>
                    <Table.Td>
                      <Group>
                        <ThemeIcon color="blue" variant="light" size="sm">
                          <Users size={16} />
                        </ThemeIcon>
                        <Text fw={500}>{mapping.gamer_tag}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group>
                        <ThemeIcon color="green" variant="light" size="sm">
                          <GameController size={16} />
                        </ThemeIcon>
                        <div>
                          <Text fw={500} size="sm">{mapping.ea_player_name}</Text>
                          <Text size="xs" c="cyan">ID: {mapping.ea_player_id}</Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {mapping.position ? (
                        <Badge variant="light" size="sm">{mapping.position}</Badge>
                      ) : (
                        <Text size="sm" c="cyan">-</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {mapping.overall_rating ? (
                        <Badge color="orange" variant="light" size="sm">
                          {mapping.overall_rating} OVR
                        </Badge>
                      ) : (
                        <Text size="sm" c="cyan">-</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{mapping.club_name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="cyan">
                        {new Date(mapping.created_at).toLocaleDateString()}
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
                            onClick={() => handleEditMapping(mapping)}
                          >
                            Edit Mapping
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item 
                            leftSection={<Trash2 size={14} />}
                            color="red"
                            onClick={() => handleDeleteMapping(mapping)}
                          >
                            Delete Mapping
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

      {/* Create Mapping Modal */}
      <Modal opened={createModalOpened} onClose={closeCreateModal} title="Create Player Mapping" size="md">
        <Stack>
          <Select
            label="League Player"
            placeholder="Select a player"
            value={selectedPlayerId}
            onChange={(value) => setSelectedPlayerId(value || "")}
            data={getAvailablePlayers().map(player => ({
              value: player.id,
              label: `${player.gamer_tag} (${player.club_name})`
            }))}
            searchable
            required
          />
          
          <TextInput
            label="EA Player ID"
            placeholder="Enter EA Sports player ID"
            value={eaPlayerId}
            onChange={(e) => setEaPlayerId(e.target.value)}
            required
          />
          
          <TextInput
            label="EA Player Name"
            placeholder="Enter EA Sports player name"
            value={eaPlayerName}
            onChange={(e) => setEaPlayerName(e.target.value)}
            required
          />
          
          <Select
            label="Position"
            placeholder="Select position"
            value={position}
            onChange={(value) => setPosition(value || "")}
            data={positions.map(pos => ({ value: pos, label: pos }))}
            clearable
          />
          
          <TextInput
            label="Overall Rating"
            placeholder="Enter overall rating (1-99)"
            type="number"
            min={1}
            max={99}
            value={overallRating?.toString() || ""}
            onChange={(e) => setOverallRating(e.target.value ? parseInt(e.target.value) : undefined)}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateMapping} loading={isSubmitting}>
              Create Mapping
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Mapping Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit Player Mapping" size="md">
        <Stack>
          <Select
            label="League Player"
            placeholder="Select a player"
            value={selectedPlayerId}
            onChange={(value) => setSelectedPlayerId(value || "")}
            data={[
              ...getAvailablePlayers().map(player => ({
                value: player.id,
                label: `${player.gamer_tag} (${player.club_name})`
              })),
              ...(selectedMapping ? [{
                value: selectedMapping.player_id,
                label: `${selectedMapping.gamer_tag} (${selectedMapping.club_name}) - Current`
              }] : [])
            ]}
            searchable
            required
          />
          
          <TextInput
            label="EA Player ID"
            placeholder="Enter EA Sports player ID"
            value={eaPlayerId}
            onChange={(e) => setEaPlayerId(e.target.value)}
            required
          />
          
          <TextInput
            label="EA Player Name"
            placeholder="Enter EA Sports player name"
            value={eaPlayerName}
            onChange={(e) => setEaPlayerName(e.target.value)}
            required
          />
          
          <Select
            label="Position"
            placeholder="Select position"
            value={position}
            onChange={(value) => setPosition(value || "")}
            data={positions.map(pos => ({ value: pos, label: pos }))}
            clearable
          />
          
          <TextInput
            label="Overall Rating"
            placeholder="Enter overall rating (1-99)"
            type="number"
            min={1}
            max={99}
            value={overallRating?.toString() || ""}
            onChange={(e) => setOverallRating(e.target.value ? parseInt(e.target.value) : undefined)}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMapping} loading={isSubmitting}>
              Update Mapping
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Player Mapping" size="sm">
        {selectedMapping && (
          <Stack>
            <Text>
              Are you sure you want to delete the mapping for "{selectedMapping.gamer_tag}" → "{selectedMapping.ea_player_name}"? 
              This action cannot be undone.
            </Text>

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button color="red" onClick={confirmDeleteMapping} loading={isSubmitting}>
                Delete Mapping
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
