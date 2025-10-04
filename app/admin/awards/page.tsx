"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase/client"
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
  Menu
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  Trophy,
  Medal,
  Trash2,
  Plus,
  Edit,
  Award,
  Crown,
  Star,
  Target,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  RefreshCw
} from "lucide-react"

interface Season {
  id: string | number
  name: string
  number?: number
}

interface Team {
  id: string
  name: string
}

interface Player {
  id: string
  user_id: string
  gamer_tag_id: string
  club_id: string | null
  club_name: string | null
}

interface TeamAward {
  id: string
  club_id: string
  club_name: string
  award_type: string
  season_id: string
  created_at: string
}

interface PlayerAward {
  id: string
  player_id: string
  player_name: string
  award_type: string
  season_id: string
  created_at: string
}

export default function AwardsManagementPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [seasons, setSeasons] = useState<Season[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [teamAwards, setTeamAwards] = useState<TeamAward[]>([])
  const [playerAwards, setPlayerAwards] = useState<PlayerAward[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeason, setSelectedSeason] = useState<string>("")
  
  // Modals
  const [teamAwardModalOpened, { open: openTeamAwardModal, close: closeTeamAwardModal }] = useDisclosure(false)
  const [playerAwardModalOpened, { open: openPlayerAwardModal, close: closePlayerAwardModal }] = useDisclosure(false)
  
  // Form states
  const [selectedTeam, setSelectedTeam] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState("")
  const [teamAwardType, setTeamAwardType] = useState("")
  const [playerAwardType, setPlayerAwardType] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const teamAwardTypes = [
    { value: "Champion", label: "🏆 Champion" },
    { value: "Runner-up", label: "🥈 Runner-up" },
    { value: "Best Defense", label: "🛡️ Best Defense" },
    { value: "Best Offense", label: "⚽ Best Offense" },
    { value: "Most Improved", label: "📈 Most Improved" },
    { value: "Fair Play", label: "🤝 Fair Play Award" }
  ]

  const playerAwardTypes = [
    { value: "MVP", label: "👑 Most Valuable Player" },
    { value: "Golden Boot", label: "🥇 Golden Boot" },
    { value: "Golden Glove", label: "🧤 Golden Glove" },
    { value: "Best Defender", label: "🛡️ Best Defender" },
    { value: "Best Midfielder", label: "⚽ Best Midfielder" },
    { value: "Best Forward", label: "🎯 Best Forward" },
    { value: "Rookie of the Year", label: "⭐ Rookie of the Year" },
    { value: "Most Assists", label: "🎯 Most Assists" }
  ]

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedSeason) {
      fetchAwards()
    }
  }, [selectedSeason])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      
      // Fetch seasons
      const { data: seasonsData, error: seasonsError } = await supabase
        .from("seasons")
        .select("*")
        .order("created_at", { ascending: false })

      if (seasonsError) throw seasonsError
      setSeasons(seasonsData || [])

      // Fetch teams (clubs)
      const { data: teamsData, error: teamsError } = await supabase
        .from("clubs")
        .select("id, name")
        .eq("is_active", true)
        .order("name")

      if (teamsError) throw teamsError
      setTeams(teamsData || [])

      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select(`
          id,
          user_id,
          club_id,
          users!inner(gamer_tag_id),
          clubs(name)
        `)
        .eq("status", "active")

      if (playersError) throw playersError
      
      const formattedPlayers = playersData?.map(p => ({
        id: p.id,
        user_id: p.user_id,
        gamer_tag_id: p.users?.gamer_tag_id || '',
        club_id: p.club_id,
        club_name: p.clubs?.name || null
      })) || []
      
      setPlayers(formattedPlayers)

      // Set active season as default
      const activeSeason = seasonsData?.find(s => s.is_active)
      if (activeSeason) {
        setSelectedSeason(activeSeason.id.toString())
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

  const fetchAwards = async () => {
    if (!selectedSeason) return

    try {
      // Fetch team awards
      const { data: teamAwardsData, error: teamAwardsError } = await supabase
        .from("team_awards")
        .select(`
          *,
          clubs(name)
        `)
        .eq("season_id", selectedSeason)

      if (teamAwardsError) throw teamAwardsError
      
      const formattedTeamAwards = teamAwardsData?.map(award => ({
        ...award,
        club_name: award.clubs?.name || 'Unknown Team'
      })) || []
      
      setTeamAwards(formattedTeamAwards)

      // Fetch player awards
      const { data: playerAwardsData, error: playerAwardsError } = await supabase
        .from("player_awards")
        .select(`
          *,
          players!inner(
            users!inner(gamer_tag_id)
          )
        `)
        .eq("season_id", selectedSeason)

      if (playerAwardsError) throw playerAwardsError
      
      const formattedPlayerAwards = playerAwardsData?.map(award => ({
        ...award,
        player_name: award.players?.users?.gamer_tag_id || 'Unknown Player'
      })) || []
      
      setPlayerAwards(formattedPlayerAwards)

    } catch (error: any) {
      console.error("Error fetching awards:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch awards",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    }
  }

  const handleCreateTeamAward = async () => {
    if (!selectedTeam || !teamAwardType || !selectedSeason) {
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
        .from("team_awards")
        .insert({
          club_id: selectedTeam,
          award_type: teamAwardType,
          season_id: selectedSeason
        })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Team award created successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeTeamAwardModal()
      setSelectedTeam("")
      setTeamAwardType("")
      fetchAwards()
    } catch (error: any) {
      console.error("Error creating team award:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create team award",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreatePlayerAward = async () => {
    if (!selectedPlayer || !playerAwardType || !selectedSeason) {
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
        .from("player_awards")
        .insert({
          player_id: selectedPlayer,
          award_type: playerAwardType,
          season_id: selectedSeason
        })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Player award created successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closePlayerAwardModal()
      setSelectedPlayer("")
      setPlayerAwardType("")
      fetchAwards()
    } catch (error: any) {
      console.error("Error creating player award:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create player award",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTeamAward = async (awardId: string) => {
    try {
      const { error } = await supabase
        .from("team_awards")
        .delete()
        .eq("id", awardId)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Team award deleted successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      fetchAwards()
    } catch (error: any) {
      console.error("Error deleting team award:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete team award",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    }
  }

  const handleDeletePlayerAward = async (awardId: string) => {
    try {
      const { error } = await supabase
        .from("player_awards")
        .delete()
        .eq("id", awardId)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Player award deleted successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      fetchAwards()
    } catch (error: any) {
      console.error("Error deleting player award:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete player award",
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
            <Text c="cyan">Loading Awards Management...</Text>
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
              <Trophy size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Awards Management
              </Title>
              <Text size="lg" c="yellow" >
                Manage season awards and achievements for teams and players
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="orange">{teamAwards.length + playerAwards.length}</Text>
              <Text size="sm" c="cyan">Total Awards</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Season Selection */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between" mb="md">
          <Title order={3}>Season Awards</Title>
          <Button leftSection={<RefreshCw size={16} />} onClick={fetchAwards}>
            Refresh
          </Button>
        </Group>

        <Select
          label="Select Season"
          placeholder="Choose a season"
          value={selectedSeason}
          onChange={(value) => setSelectedSeason(value || "")}
          data={seasons.map(season => ({
            value: season.id.toString(),
            label: `${season.name}${season.number ? ` (Season ${season.number})` : ''}`
          }))}
          style={{ maxWidth: 300 }}
        />
      </Paper>

      {/* Awards Tabs */}
      <Tabs defaultValue="team-awards" variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="team-awards" leftSection={<Trophy size={16} />}>
            Team Awards ({teamAwards.length})
          </Tabs.Tab>
          <Tabs.Tab value="player-awards" leftSection={<Medal size={16} />}>
            Player Awards ({playerAwards.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="team-awards" pt="md">
          <Paper withBorder>
            <Group justify="space-between" p="md">
              <Title order={4}>Team Awards</Title>
              <Button leftSection={<Plus size={16} />} onClick={openTeamAwardModal}>
                Add Team Award
              </Button>
            </Group>

            {teamAwards.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <Trophy size={48} stroke={1} color="var(--mantine-color-blue-5)" />
                  <Text c="cyan">No team awards for this season</Text>
                  <Button leftSection={<Plus size={16} />} onClick={openTeamAwardModal}>
                    Add First Team Award
                  </Button>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={600}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Team</Table.Th>
                      <Table.Th>Award Type</Table.Th>
                      <Table.Th>Date Awarded</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {teamAwards.map((award) => (
                      <Table.Tr key={award.id}>
                        <Table.Td>
                          <Group>
                            <ThemeIcon color="blue" variant="light" size="sm">
                              <Trophy size={16} />
                            </ThemeIcon>
                            <Text fw={500}>{award.club_name}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="yellow" variant="light" size="sm">
                            {award.award_type}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="cyan">
                            {new Date(award.created_at).toLocaleDateString()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon 
                            color="red" 
                            variant="light" 
                            onClick={() => handleDeleteTeamAward(award.id)}
                          >
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="player-awards" pt="md">
          <Paper withBorder>
            <Group justify="space-between" p="md">
              <Title order={4}>Player Awards</Title>
              <Button leftSection={<Plus size={16} />} onClick={openPlayerAwardModal}>
                Add Player Award
              </Button>
            </Group>

            {playerAwards.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <Medal size={48} stroke={1} color="var(--mantine-color-blue-5)" />
                  <Text c="cyan">No player awards for this season</Text>
                  <Button leftSection={<Plus size={16} />} onClick={openPlayerAwardModal}>
                    Add First Player Award
                  </Button>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={600}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Player</Table.Th>
                      <Table.Th>Award Type</Table.Th>
                      <Table.Th>Date Awarded</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {playerAwards.map((award) => (
                      <Table.Tr key={award.id}>
                        <Table.Td>
                          <Group>
                            <ThemeIcon color="orange" variant="light" size="sm">
                              <Medal size={16} />
                            </ThemeIcon>
                            <Text fw={500}>{award.player_name}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="orange" variant="light" size="sm">
                            {award.award_type}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="cyan">
                            {new Date(award.created_at).toLocaleDateString()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon 
                            color="red" 
                            variant="light" 
                            onClick={() => handleDeletePlayerAward(award.id)}
                          >
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Team Award Modal */}
      <Modal opened={teamAwardModalOpened} onClose={closeTeamAwardModal} title="Add Team Award" size="md">
        <Stack>
          <Select
            label="Team"
            placeholder="Select a team"
            value={selectedTeam}
            onChange={(value) => setSelectedTeam(value || "")}
            data={teams.map(team => ({ value: team.id, label: team.name }))}
            required
          />
          
          <Select
            label="Award Type"
            placeholder="Select award type"
            value={teamAwardType}
            onChange={(value) => setTeamAwardType(value || "")}
            data={teamAwardTypes}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeTeamAwardModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeamAward} loading={isSubmitting}>
              Add Award
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Player Award Modal */}
      <Modal opened={playerAwardModalOpened} onClose={closePlayerAwardModal} title="Add Player Award" size="md">
        <Stack>
          <Select
            label="Player"
            placeholder="Select a player"
            value={selectedPlayer}
            onChange={(value) => setSelectedPlayer(value || "")}
            data={players.map(player => ({ 
              value: player.id, 
              label: `${player.gamer_tag_id}${player.club_name ? ` (${player.club_name})` : ''}` 
            }))}
            searchable
            required
          />
          
          <Select
            label="Award Type"
            placeholder="Select award type"
            value={playerAwardType}
            onChange={(value) => setPlayerAwardType(value || "")}
            data={playerAwardTypes}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closePlayerAwardModal}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlayerAward} loading={isSubmitting}>
              Add Award
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}
