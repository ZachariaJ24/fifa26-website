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
  Card,
  ThemeIcon,
  ActionIcon,
  Menu,
  Modal,
  Alert
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  GamepadIcon as GameController,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Calendar,
  Trophy,
  Users,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  Download,
  Upload
} from "lucide-react"

interface EAMatch {
  id: string
  home_club_id: string
  away_club_id: string
  match_date: string
  ea_match_id?: string
  home_score?: number
  away_score?: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  home_club: {
    name: string
    logo_url?: string
  }
  away_club: {
    name: string
    logo_url?: string
  }
  season_id: string
}

interface Club {
  id: string
  name: string
  logo_url?: string
}

interface Season {
  id: string
  name: string
  season_number: number
  is_active: boolean
}

export default function EAMatchesPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState<EAMatch[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMatch, setSelectedMatch] = useState<EAMatch | null>(null)
  
  // Modals
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false)
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  const [syncModalOpened, { open: openSyncModal, close: closeSyncModal }] = useDisclosure(false)
  
  // Form states
  const [homeClubId, setHomeClubId] = useState("")
  const [awayClubId, setAwayClubId] = useState("")
  const [matchDate, setMatchDate] = useState<Date | null>(null)
  const [eaMatchId, setEaMatchId] = useState("")
  const [homeScore, setHomeScore] = useState<number | undefined>(undefined)
  const [awayScore, setAwayScore] = useState<number | undefined>(undefined)
  const [matchStatus, setMatchStatus] = useState<'scheduled' | 'in_progress' | 'completed' | 'cancelled'>('scheduled')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedSeason) {
      fetchMatches()
    }
  }, [selectedSeason])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      
      // Fetch clubs
      const { data: clubsData, error: clubsError } = await supabase
        .from("clubs")
        .select("id, name, logo_url")
        .eq("is_active", true)
        .order("name")

      if (clubsError) throw clubsError
      setClubs(clubsData || [])

      // Fetch seasons
      const { data: seasonsData, error: seasonsError } = await supabase
        .from("seasons")
        .select("*")
        .order("created_at", { ascending: false })

      if (seasonsError) throw seasonsError
      setSeasons(seasonsData || [])

      // Set active season as default
      const activeSeason = seasonsData?.find(s => s.is_active)
      if (activeSeason) {
        setSelectedSeason(activeSeason.id)
      }

    } catch (error: any) {
      console.error("Error fetching initial data:", error)
      notifications.show({
        title: "Error",
        message: "Failed to load initial data",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMatches = async () => {
    if (!selectedSeason) return

    try {
      const { data, error } = await supabase
        .from("ea_matches")
        .select(`
          *,
          home_club:clubs!ea_matches_home_club_id_fkey(name, logo_url),
          away_club:clubs!ea_matches_away_club_id_fkey(name, logo_url)
        `)
        .eq("season_id", selectedSeason)
        .order("match_date", { ascending: false })

      if (error) throw error
      setMatches(data || [])
    } catch (error: any) {
      console.error("Error fetching EA matches:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch EA matches",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    }
  }

  const filteredMatches = matches.filter(match =>
    match.home_club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.away_club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.ea_match_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetForm = () => {
    setHomeClubId("")
    setAwayClubId("")
    setMatchDate(null)
    setEaMatchId("")
    setHomeScore(undefined)
    setAwayScore(undefined)
    setMatchStatus('scheduled')
  }

  const handleCreateMatch = async () => {
    if (!homeClubId || !awayClubId || !matchDate || !selectedSeason) {
      notifications.show({
        title: "Error",
        message: "Please fill in all required fields",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    if (homeClubId === awayClubId) {
      notifications.show({
        title: "Error",
        message: "Home and away clubs must be different",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("ea_matches")
        .insert({
          home_club_id: homeClubId,
          away_club_id: awayClubId,
          match_date: matchDate.toISOString(),
          ea_match_id: eaMatchId.trim() || null,
          home_score: homeScore,
          away_score: awayScore,
          status: matchStatus,
          season_id: selectedSeason
        })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "EA match created successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeCreateModal()
      resetForm()
      fetchMatches()
    } catch (error: any) {
      console.error("Error creating EA match:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create EA match",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditMatch = (match: EAMatch) => {
    setSelectedMatch(match)
    setHomeClubId(match.home_club_id)
    setAwayClubId(match.away_club_id)
    setMatchDate(new Date(match.match_date))
    setEaMatchId(match.ea_match_id || "")
    setHomeScore(match.home_score)
    setAwayScore(match.away_score)
    setMatchStatus(match.status)
    openEditModal()
  }

  const handleUpdateMatch = async () => {
    if (!selectedMatch || !homeClubId || !awayClubId || !matchDate) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("ea_matches")
        .update({
          home_club_id: homeClubId,
          away_club_id: awayClubId,
          match_date: matchDate.toISOString(),
          ea_match_id: eaMatchId.trim() || null,
          home_score: homeScore,
          away_score: awayScore,
          status: matchStatus
        })
        .eq("id", selectedMatch.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "EA match updated successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeEditModal()
      resetForm()
      fetchMatches()
    } catch (error: any) {
      console.error("Error updating EA match:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update EA match",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMatch = (match: EAMatch) => {
    setSelectedMatch(match)
    openDeleteModal()
  }

  const confirmDeleteMatch = async () => {
    if (!selectedMatch) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("ea_matches")
        .delete()
        .eq("id", selectedMatch.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "EA match deleted successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeDeleteModal()
      setSelectedMatch(null)
      fetchMatches()
    } catch (error: any) {
      console.error("Error deleting EA match:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete EA match",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
      'scheduled': { color: 'blue', label: 'Scheduled', icon: Clock },
      'in_progress': { color: 'yellow', label: 'In Progress', icon: Target },
      'completed': { color: 'green', label: 'Completed', icon: CheckCircle },
      'cancelled': { color: 'red', label: 'Cancelled', icon: XCircle }
    }

    const config = statusConfig[status] || { color: 'gray', label: status, icon: Clock }
    const IconComponent = config.icon
    
    return (
      <Badge 
        color={config.color} 
        variant="light" 
        size="sm"
        leftSection={<IconComponent size={12} />}
      >
        {config.label}
      </Badge>
    )
  }

  const syncWithEA = async () => {
    // Placeholder for EA Sports API integration
    notifications.show({
      title: "Sync Started",
      message: "EA Sports match synchronization initiated",
      color: "blue",
      icon: <Upload size={16} />
    })
    
    closeSyncModal()
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading EA Matches...</Text>
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
              <GameController size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                EA Sports Matches
              </Title>
              <Text size="lg" c="yellow" >
                Manage EA Sports FIFA match data and synchronization
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="green">{matches.length}</Text>
              <Text size="sm" c="cyan">EA Matches</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Season Selection and Actions */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between" mb="md">
          <Title order={3}>EA Match Management</Title>
          <Group>
            <Button leftSection={<Upload size={16} />} onClick={openSyncModal} variant="outline">
              Sync with EA
            </Button>
            <Button leftSection={<RefreshCw size={16} />} onClick={fetchMatches}>
              Refresh
            </Button>
            <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
              Create Match
            </Button>
          </Group>
        </Group>

        <Group>
          <Select
            label="Select Season"
            placeholder="Choose a season"
            value={selectedSeason}
            onChange={(value) => setSelectedSeason(value || "")}
            data={seasons.map(season => ({
              value: season.id,
              label: `${season.name} (Season ${season.season_number})${season.is_active ? ' - Active' : ''}`
            }))}
            style={{ minWidth: 200 }}
          />

          <TextInput
            label="Search Matches"
            placeholder="Search by club or EA match ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftSection={<Search size={16} />}
            style={{ flex: 1 }}
          />
        </Group>
      </Paper>

      {/* Matches Table */}
      <Paper withBorder>
        {!selectedSeason ? (
          <Center p="xl">
            <Stack align="center">
              <Calendar size={48} stroke={1} color="var(--mantine-color-gray-5)" />
              <Text c="cyan">Please select a season to view EA matches</Text>
            </Stack>
          </Center>
        ) : filteredMatches.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <GameController size={48} stroke={1} color="var(--mantine-color-gray-5)" />
              <Text c="cyan">
                {searchTerm ? `No matches match "${searchTerm}"` : "No EA matches found for this season"}
              </Text>
              {!searchTerm && (
                <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
                  Create First Match
                </Button>
              )}
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={900}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Match</Table.Th>
                  <Table.Th>Date & Time</Table.Th>
                  <Table.Th>EA Match ID</Table.Th>
                  <Table.Th>Score</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredMatches.map((match) => (
                  <Table.Tr key={match.id}>
                    <Table.Td>
                      <Group>
                        <Text fw={500}>{match.home_club.name}</Text>
                        <Text c="cyan">vs</Text>
                        <Text fw={500}>{match.away_club.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Clock size={14} />
                        <Text size="sm">
                          {new Date(match.match_date).toLocaleDateString()} at{' '}
                          {new Date(match.match_date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {match.ea_match_id ? (
                        <Badge variant="outline" size="sm">
                          {match.ea_match_id}
                        </Badge>
                      ) : (
                        <Text size="sm" c="cyan">Not set</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {match.status === 'completed' && match.home_score !== undefined && match.away_score !== undefined ? (
                        <Badge variant="outline" size="sm">
                          {match.home_score} - {match.away_score}
                        </Badge>
                      ) : (
                        <Text size="sm" c="cyan">-</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {getStatusBadge(match.status)}
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
                            onClick={() => handleEditMatch(match)}
                          >
                            Edit Match
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item 
                            leftSection={<Trash2 size={14} />}
                            color="red"
                            onClick={() => handleDeleteMatch(match)}
                          >
                            Delete Match
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

      {/* Create Match Modal */}
      <Modal opened={createModalOpened} onClose={closeCreateModal} title="Create EA Match" size="md">
        <Stack>
          <Select
            label="Home Club"
            placeholder="Select home club"
            value={homeClubId}
            onChange={(value) => setHomeClubId(value || "")}
            data={clubs.map(club => ({ value: club.id, label: club.name }))}
            required
          />
          
          <Select
            label="Away Club"
            placeholder="Select away club"
            value={awayClubId}
            onChange={(value) => setAwayClubId(value || "")}
            data={clubs.filter(club => club.id !== homeClubId).map(club => ({ value: club.id, label: club.name }))}
            required
          />
          
          <DateTimePicker
            label="Match Date & Time"
            placeholder="Select date and time"
            value={matchDate}
            onChange={setMatchDate}
            required
          />
          
          <TextInput
            label="EA Match ID"
            placeholder="Enter EA Sports match ID"
            value={eaMatchId}
            onChange={(e) => setEaMatchId(e.target.value)}
          />
          
          <Select
            label="Status"
            value={matchStatus}
            onChange={(value) => setMatchStatus(value as any)}
            data={[
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateMatch} loading={isSubmitting}>
              Create Match
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Match Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit EA Match" size="md">
        <Stack>
          <Select
            label="Home Club"
            placeholder="Select home club"
            value={homeClubId}
            onChange={(value) => setHomeClubId(value || "")}
            data={clubs.map(club => ({ value: club.id, label: club.name }))}
            required
          />
          
          <Select
            label="Away Club"
            placeholder="Select away club"
            value={awayClubId}
            onChange={(value) => setAwayClubId(value || "")}
            data={clubs.filter(club => club.id !== homeClubId).map(club => ({ value: club.id, label: club.name }))}
            required
          />
          
          <DateTimePicker
            label="Match Date & Time"
            placeholder="Select date and time"
            value={matchDate}
            onChange={setMatchDate}
            required
          />
          
          <TextInput
            label="EA Match ID"
            placeholder="Enter EA Sports match ID"
            value={eaMatchId}
            onChange={(e) => setEaMatchId(e.target.value)}
          />
          
          <Select
            label="Status"
            value={matchStatus}
            onChange={(value) => setMatchStatus(value as any)}
            data={[
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMatch} loading={isSubmitting}>
              Update Match
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete EA Match" size="sm">
        {selectedMatch && (
          <Stack>
            <Alert icon={<AlertTriangle size={16} />} color="red" variant="light">
              <Text fw={600}>Are you sure?</Text>
              <Text size="sm">
                This will permanently delete the EA match between {selectedMatch.home_club.name} and {selectedMatch.away_club.name}. This action cannot be undone.
              </Text>
            </Alert>

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button color="red" onClick={confirmDeleteMatch} loading={isSubmitting}>
                Delete Match
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Sync with EA Modal */}
      <Modal opened={syncModalOpened} onClose={closeSyncModal} title="Sync with EA Sports" size="md">
        <Stack>
          <Alert color="blue" variant="light">
            <Text fw={500}>EA Sports Integration</Text>
            <Text size="sm">
              This will synchronize match data with EA Sports FIFA servers. This may take a few minutes to complete.
            </Text>
          </Alert>

          <Text size="sm" c="cyan">
            Features that will be synchronized:
          </Text>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li><Text size="sm">Match schedules and results</Text></li>
            <li><Text size="sm">Player statistics</Text></li>
            <li><Text size="sm">Club performance data</Text></li>
            <li><Text size="sm">Tournament standings</Text></li>
          </ul>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeSyncModal}>
              Cancel
            </Button>
            <Button leftSection={<Upload size={16} />} onClick={syncWithEA}>
              Start Sync
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}
