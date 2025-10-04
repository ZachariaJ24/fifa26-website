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
  Tabs,
  Card,
  ThemeIcon,
  ActionIcon,
  Menu,
  NumberInput,
  Switch,
  Grid,
  Alert
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  Calendar,
  Clock,
  Edit,
  Plus,
  Trash2,
  AlertCircle,
  Trophy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  RefreshCw,
  Download
} from "lucide-react"

type MatchStatus = "Scheduled" | "In Progress" | "Completed" | "Postponed" | "Cancelled"

interface Match {
  id: string
  home_club_id: string
  away_club_id: string
  match_date: string
  status: MatchStatus
  home_score?: number
  away_score?: number
  season_id: string
  home_club: {
    id: string
    name: string
    logo_url?: string
  }
  away_club: {
    id: string
    name: string
    logo_url?: string
  }
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

export default function ScheduleManagementPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [matches, setMatches] = useState<Match[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)
  
  // Modals
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false)
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  
  // Form states
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [homeClubId, setHomeClubId] = useState("")
  const [awayClubId, setAwayClubId] = useState("")
  const [matchDate, setMatchDate] = useState<Date | null>(null)
  const [matchStatus, setMatchStatus] = useState<MatchStatus>("Scheduled")
  const [homeScore, setHomeScore] = useState<number | undefined>(undefined)
  const [awayScore, setAwayScore] = useState<number | undefined>(undefined)
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
        .from("fixtures")
        .select(`
          *,
          home_club:clubs!fixtures_home_club_id_fkey(id, name, logo_url),
          away_club:clubs!fixtures_away_club_id_fkey(id, name, logo_url)
        `)
        .eq("season_id", selectedSeason)
        .order("match_date", { ascending: true })

      if (error) throw error
      setMatches(data || [])
    } catch (error: any) {
      console.error("Error fetching matches:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch matches",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    }
  }

  const resetForm = () => {
    setHomeClubId("")
    setAwayClubId("")
    setMatchDate(null)
    setMatchStatus("Scheduled")
    setHomeScore(undefined)
    setAwayScore(undefined)
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
        .from("fixtures")
        .insert({
          home_club_id: homeClubId,
          away_club_id: awayClubId,
          match_date: matchDate.toISOString(),
          status: matchStatus,
          season_id: selectedSeason,
          home_score: homeScore,
          away_score: awayScore
        })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Match created successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeCreateModal()
      resetForm()
      fetchMatches()
    } catch (error: any) {
      console.error("Error creating match:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create match",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditMatch = (match: Match) => {
    setSelectedMatch(match)
    setHomeClubId(match.home_club_id)
    setAwayClubId(match.away_club_id)
    setMatchDate(new Date(match.match_date))
    setMatchStatus(match.status)
    setHomeScore(match.home_score)
    setAwayScore(match.away_score)
    openEditModal()
  }

  const handleUpdateMatch = async () => {
    if (!selectedMatch || !homeClubId || !awayClubId || !matchDate) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("fixtures")
        .update({
          home_club_id: homeClubId,
          away_club_id: awayClubId,
          match_date: matchDate.toISOString(),
          status: matchStatus,
          home_score: homeScore,
          away_score: awayScore
        })
        .eq("id", selectedMatch.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Match updated successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeEditModal()
      resetForm()
      fetchMatches()
    } catch (error: any) {
      console.error("Error updating match:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update match",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMatch = (match: Match) => {
    setSelectedMatch(match)
    openDeleteModal()
  }

  const confirmDeleteMatch = async () => {
    if (!selectedMatch) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("fixtures")
        .delete()
        .eq("id", selectedMatch.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Match deleted successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeDeleteModal()
      setSelectedMatch(null)
      fetchMatches()
    } catch (error: any) {
      console.error("Error deleting match:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete match",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: MatchStatus) => {
    const statusConfig: Record<MatchStatus, { color: string; label: string }> = {
      'Scheduled': { color: 'blue', label: 'Scheduled' },
      'In Progress': { color: 'yellow', label: 'In Progress' },
      'Completed': { color: 'green', label: 'Completed' },
      'Postponed': { color: 'orange', label: 'Postponed' },
      'Cancelled': { color: 'red', label: 'Cancelled' }
    }

    const config = statusConfig[status]
    return <Badge color={config.color} variant="light" size="sm">{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="blue">Loading Schedule Management...</Text>
          </Stack>
        </Center>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-4" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-green-6) 0%, var(--mantine-color-blue-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <Calendar size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Schedule Management
              </Title>
              <Text size="lg" c="yellow" >
                Manage game schedules, fixtures, and match results
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="dark.6">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="green">{matches.length}</Text>
              <Text size="sm" c="blue">Total Matches</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Season Selection and Actions */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between" mb="md">
          <Title order={3}>Match Schedule</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={fetchMatches}>
              Refresh
            </Button>
            <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
              Create Match
            </Button>
          </Group>
        </Group>

        <Select
          label="Select Season"
          placeholder="Choose a season"
          value={selectedSeason}
          onChange={setSelectedSeason}
          data={seasons.map(season => ({
            value: season.id,
            label: `${season.name} (Season ${season.season_number})${season.is_active ? ' - Active' : ''}`
          }))}
          style={{ maxWidth: 300 }}
        />
      </Paper>

      {/* Matches Table */}
      <Paper withBorder bg="dark.7">
        {!selectedSeason ? (
          <Center p="xl">
            <Stack align="center">
              <Calendar size={48} stroke={1} color="var(--mantine-color-blue-5)" />
              <Text c="blue">Please select a season to view matches</Text>
            </Stack>
          </Center>
        ) : matches.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <Calendar size={48} stroke={1} color="var(--mantine-color-blue-5)" />
              <Text c="blue">No matches found for this season</Text>
              <Button leftSection={<Plus size={16} />} onClick={openCreateModal}>
                Create First Match
              </Button>
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Match</Table.Th>
                  <Table.Th>Date & Time</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Score</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {matches.map((match) => (
                  <Table.Tr key={match.id}>
                    <Table.Td>
                      <Group>
                        <Text fw={500}>{match.home_club.name}</Text>
                        <Text c="blue">vs</Text>
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
                      {getStatusBadge(match.status)}
                    </Table.Td>
                    <Table.Td>
                      {match.status === 'Completed' && match.home_score !== undefined && match.away_score !== undefined ? (
                        <Badge variant="outline" size="sm">
                          {match.home_score} - {match.away_score}
                        </Badge>
                      ) : (
                        <Text size="sm" c="blue">-</Text>
                      )}
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
      <Modal opened={createModalOpened} onClose={closeCreateModal} title="Create New Match" size="md">
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
          
          <Select
            label="Status"
            value={matchStatus}
            onChange={(value) => setMatchStatus(value as MatchStatus)}
            data={[
              { value: 'Scheduled', label: 'Scheduled' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Postponed', label: 'Postponed' },
              { value: 'Cancelled', label: 'Cancelled' }
            ]}
          />

          {matchStatus === 'Completed' && (
            <Group grow>
              <NumberInput
                label="Home Score"
                placeholder="0"
                value={homeScore}
                onChange={(value) => setHomeScore(typeof value === 'number' ? value : undefined)}
                min={0}
              />
              <NumberInput
                label="Away Score"
                placeholder="0"
                value={awayScore}
                onChange={(value) => setAwayScore(typeof value === 'number' ? value : undefined)}
                min={0}
              />
            </Group>
          )}

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
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit Match" size="md">
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
          
          <Select
            label="Status"
            value={matchStatus}
            onChange={(value) => setMatchStatus(value as MatchStatus)}
            data={[
              { value: 'Scheduled', label: 'Scheduled' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Postponed', label: 'Postponed' },
              { value: 'Cancelled', label: 'Cancelled' }
            ]}
          />

          {matchStatus === 'Completed' && (
            <Group grow>
              <NumberInput
                label="Home Score"
                placeholder="0"
                value={homeScore}
                onChange={(value) => setHomeScore(typeof value === 'number' ? value : undefined)}
                min={0}
              />
              <NumberInput
                label="Away Score"
                placeholder="0"
                value={awayScore}
                onChange={(value) => setAwayScore(typeof value === 'number' ? value : undefined)}
                min={0}
              />
            </Group>
          )}

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
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Match" size="sm">
        {selectedMatch && (
          <Stack>
            <Alert icon={<AlertTriangle size={16} />} color="red" variant="light">
              <Text fw={600}>Are you sure?</Text>
              <Text size="sm">
                This will permanently delete the match between {selectedMatch.home_club.name} and {selectedMatch.away_club.name}. This action cannot be undone.
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
    </div>
  )
}
