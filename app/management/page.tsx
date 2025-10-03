// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Container,
  Title,
  Text,
  Group,
  Button,
  Badge,
  Paper,
  Stack,
  Loader,
  Center,
  Tabs,
  Card,
  Grid,
  Progress,
  Table,
  TextInput,
  Select,
  ThemeIcon,
  Avatar,
  Divider,
  Alert,
  ActionIcon
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  Users,
  Calendar,
  Clock,
  Trophy,
  DollarSign,
  Filter,
  History,
  Search,
  Home,
  Gavel,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle
} from "lucide-react"

interface Player {
  id: string
  salary: number
  role: string
  users: {
    id: string
    gamer_tag_id: string
    primary_position: string
    secondary_position?: string
    console: string
    avatar_url?: string
  }
}

interface Club {
  id: string
  name: string
  logo_url?: string
  salary_cap: number
  max_players: number
  wins: number
  losses: number
  draws: number
  points: number
  matches_played: number
  goals_scored: number
  goals_conceded: number
  goal_difference: number
}

interface Match {
  id: string
  home_club_id: string
  away_club_id: string
  match_date: string
  status: string
  home_score?: number
  away_score?: number
  home_club: {
    name: string
    logo_url?: string
  }
  away_club: {
    name: string
    logo_url?: string
  }
}

interface FreeAgent {
  id: string
  salary: number
  users: {
    id: string
    gamer_tag_id: string
    primary_position: string
    secondary_position?: string
    console: string
    avatar_url?: string
  }
}

export default function ManagementPageMantine() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [loading, setLoading] = useState(true)
  const [userClub, setUserClub] = useState<Club | null>(null)
  const [clubPlayers, setClubPlayers] = useState<Player[]>([])
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
  const [freeAgents, setFreeAgents] = useState<FreeAgent[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  
  // Filters
  const [positionFilter, setPositionFilter] = useState<string | null>(null)
  const [nameFilter, setNameFilter] = useState("")

  useEffect(() => {
    if (session?.user) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)

      // Get user's club through players table (fixed to use club_id)
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .select(`
          id,
          club_id,
          role,
          salary,
          users!inner (
            id,
            gamer_tag_id,
            primary_position,
            secondary_position,
            console,
            avatar_url
          )
        `)
        .eq("user_id", session.user.id)
        .single()

      if (playerError) {
        console.error("Error fetching player data:", playerError)
        notifications.show({
          title: "Error",
          message: "Failed to load your club data. Please try again.",
          color: "red",
          icon: <AlertCircle size={16} />
        })
        return
      }

      if (!playerData?.club_id) {
        notifications.show({
          title: "No Club Found",
          message: "You are not currently on a club. Please contact an administrator.",
          color: "orange",
          icon: <AlertCircle size={16} />
        })
        return
      }

      setUserRole(playerData.role)

      // Get club data (fixed column names)
      const { data: clubData, error: clubError } = await supabase
        .from("clubs")
        .select("*")
        .eq("id", playerData.club_id)
        .single()

      if (clubError) {
        console.error("Error fetching club data:", clubError)
        return
      }

      setUserClub(clubData)

      // Get all club players (fixed to use club_id)
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select(`
          id,
          salary,
          role,
          users!inner (
            id,
            gamer_tag_id,
            primary_position,
            secondary_position,
            console,
            avatar_url
          )
        `)
        .eq("club_id", playerData.club_id)
        .eq("status", "active")

      if (playersError) {
        console.error("Error fetching players:", playersError)
      } else {
        setClubPlayers(playersData || [])
      }

      // Get upcoming matches (fixed to use club_id and match_date)
      const { data: matchesData, error: matchesError } = await supabase
        .from("fixtures")
        .select(`
          id,
          home_club_id,
          away_club_id,
          match_date,
          status,
          home_score,
          away_score,
          home_club:clubs!fixtures_home_club_id_fkey(name, logo_url),
          away_club:clubs!fixtures_away_club_id_fkey(name, logo_url)
        `)
        .or(`home_club_id.eq.${playerData.club_id},away_club_id.eq.${playerData.club_id}`)
        .eq("status", "Scheduled")
        .order("match_date", { ascending: true })
        .limit(5)

      if (matchesError) {
        console.error("Error fetching matches:", matchesError)
      } else {
        setUpcomingMatches(matchesData || [])
      }

      // Get free agents
      const { data: freeAgentsData, error: freeAgentsError } = await supabase
        .from("players")
        .select(`
          id,
          salary,
          users!inner (
            id,
            gamer_tag_id,
            primary_position,
            secondary_position,
            console,
            avatar_url
          )
        `)
        .is("club_id", null)
        .eq("status", "free_agent")
        .limit(20)

      if (freeAgentsError) {
        console.error("Error fetching free agents:", freeAgentsError)
      } else {
        setFreeAgents(freeAgentsData || [])
      }

    } catch (error: any) {
      console.error("Error in fetchData:", error)
      notifications.show({
        title: "Error",
        message: error.message || "An error occurred while loading data",
        color: "red",
        icon: <AlertCircle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredFreeAgents = freeAgents.filter((agent) => {
    let matches = true
    
    if (nameFilter.trim()) {
      const searchTerm = nameFilter.toLowerCase().trim()
      matches = matches && agent.users?.gamer_tag_id?.toLowerCase().includes(searchTerm)
    }
    
    if (positionFilter && positionFilter !== "all") {
      const primaryPosition = agent.users?.primary_position?.toLowerCase()
      const secondaryPosition = agent.users?.secondary_position?.toLowerCase()
      matches = matches && (primaryPosition === positionFilter || secondaryPosition === positionFilter)
    }
    
    return matches
  })

  const getSalaryProgress = () => {
    if (!userClub) return 0
    const totalSalary = clubPlayers.reduce((sum, player) => sum + (player.salary || 0), 0)
    return (totalSalary / userClub.salary_cap) * 100
  }

  const getRosterProgress = () => {
    if (!userClub) return 0
    return (clubPlayers.length / userClub.max_players) * 100
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="dimmed">Loading Management Dashboard...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  if (!userClub) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Alert icon={<AlertCircle size={16} />} color="orange">
            <Text>You are not currently assigned to a club. Please contact an administrator.</Text>
          </Alert>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-green-6) 100%)' }}>
        <Group justify="space-between" align="flex-start">
          <Stack gap="md">
            <Group>
              {userClub.logo_url && (
                <Avatar src={userClub.logo_url} size="lg" radius="md" />
              )}
              <div>
                <Title order={1} c="white">
                  {userClub.name}
                </Title>
                <Text size="lg" c="white" opacity={0.9}>
                  Management Dashboard
                </Text>
                <Badge variant="light" color="white" size="lg" mt="xs">
                  {userRole || 'Player'}
                </Badge>
              </div>
            </Group>
          </Stack>
          
          <Stack gap="xs" align="flex-end">
            <Group>
              <ThemeIcon color="white" variant="light" size="lg">
                <Trophy size={20} />
              </ThemeIcon>
              <div>
                <Text c="white" fw={600} size="lg">{userClub.points}</Text>
                <Text c="white" size="sm" opacity={0.8}>Points</Text>
              </div>
            </Group>
            <Text c="white" size="sm" opacity={0.8}>
              {userClub.wins}W - {userClub.losses}L - {userClub.draws}D
            </Text>
          </Stack>
        </Group>
      </Paper>

      {/* Stats Cards */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed" fw={500}>Salary Cap</Text>
                <Text size="xl" fw={700}>
                  {Math.round(getSalaryProgress())}%
                </Text>
              </div>
              <ThemeIcon color="blue" variant="light" size="lg">
                <DollarSign size={20} />
              </ThemeIcon>
            </Group>
            <Progress value={getSalaryProgress()} color="blue" size="sm" mt="md" />
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed" fw={500}>Roster</Text>
                <Text size="xl" fw={700}>
                  {clubPlayers.length}/{userClub.max_players}
                </Text>
              </div>
              <ThemeIcon color="green" variant="light" size="lg">
                <Users size={20} />
              </ThemeIcon>
            </Group>
            <Progress value={getRosterProgress()} color="green" size="sm" mt="md" />
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed" fw={500}>Goal Difference</Text>
                <Text size="xl" fw={700} c={userClub.goal_difference >= 0 ? "green" : "red"}>
                  {userClub.goal_difference >= 0 ? '+' : ''}{userClub.goal_difference}
                </Text>
              </div>
              <ThemeIcon color={userClub.goal_difference >= 0 ? "green" : "red"} variant="light" size="lg">
                <Target size={20} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed" fw={500}>Matches Played</Text>
                <Text size="xl" fw={700}>
                  {userClub.matches_played}
                </Text>
              </div>
              <ThemeIcon color="orange" variant="light" size="lg">
                <Calendar size={20} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Main Content Tabs */}
      <Tabs defaultValue="roster" variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="roster" leftSection={<Users size={16} />}>
            Roster ({clubPlayers.length})
          </Tabs.Tab>
          <Tabs.Tab value="matches" leftSection={<Calendar size={16} />}>
            Upcoming Matches ({upcomingMatches.length})
          </Tabs.Tab>
          <Tabs.Tab value="free-agents" leftSection={<Search size={16} />}>
            Free Agents ({filteredFreeAgents.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="roster" pt="md">
          <Paper withBorder>
            <Group justify="space-between" p="md">
              <Title order={3}>Club Roster</Title>
              <Button component={Link} href="/management/lineups" leftSection={<Calendar size={16} />}>
                Manage Lineups
              </Button>
            </Group>
            
            <Divider />
            
            {clubPlayers.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <Users size={48} stroke={1} color="var(--mantine-color-gray-5)" />
                  <Text c="dimmed">No players in roster</Text>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={600}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Player</Table.Th>
                      <Table.Th>Position</Table.Th>
                      <Table.Th>Console</Table.Th>
                      <Table.Th>Role</Table.Th>
                      <Table.Th>Salary</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {clubPlayers.map((player) => (
                      <Table.Tr key={player.id}>
                        <Table.Td>
                          <Group>
                            <Avatar size="sm" color="blue">
                              {player.users.gamer_tag_id?.[0]?.toUpperCase() || 'P'}
                            </Avatar>
                            <Text fw={500}>{player.users.gamer_tag_id}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Badge variant="light" color="blue" size="sm">
                              {player.users.primary_position}
                            </Badge>
                            {player.users.secondary_position && (
                              <Badge variant="outline" color="gray" size="sm">
                                {player.users.secondary_position}
                              </Badge>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="outline" size="sm">
                            {player.users.console}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            color={player.role === 'Owner' ? 'yellow' : player.role === 'GM' ? 'blue' : 'gray'} 
                            variant="light" 
                            size="sm"
                          >
                            {player.role}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={500}>${player.salary?.toLocaleString() || 0}</Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="matches" pt="md">
          <Paper withBorder>
            <Group justify="space-between" p="md">
              <Title order={3}>Upcoming Matches</Title>
            </Group>
            
            <Divider />
            
            {upcomingMatches.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <Calendar size={48} stroke={1} color="var(--mantine-color-gray-5)" />
                  <Text c="dimmed">No upcoming matches scheduled</Text>
                </Stack>
              </Center>
            ) : (
              <Stack p="md">
                {upcomingMatches.map((match) => (
                  <Card key={match.id} withBorder p="md">
                    <Group justify="space-between">
                      <Group>
                        <Text fw={500}>
                          {match.home_club.name} vs {match.away_club.name}
                        </Text>
                        <Badge variant="light" color="blue" size="sm">
                          {match.status}
                        </Badge>
                      </Group>
                      <Group>
                        <Clock size={16} />
                        <Text size="sm" c="dimmed">
                          {new Date(match.match_date).toLocaleDateString()}
                        </Text>
                      </Group>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="free-agents" pt="md">
          <Paper withBorder>
            <Group justify="space-between" p="md">
              <Title order={3}>Free Agents</Title>
            </Group>
            
            {/* Filters */}
            <Group p="md" pt={0}>
              <TextInput
                placeholder="Search by name..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                leftSection={<Search size={16} />}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="All Positions"
                value={positionFilter}
                onChange={setPositionFilter}
                data={[
                  { value: 'all', label: 'All Positions' },
                  { value: 'gk', label: 'GK' },
                  { value: 'cb', label: 'CB' },
                  { value: 'lb', label: 'LB' },
                  { value: 'rb', label: 'RB' },
                  { value: 'cdm', label: 'CDM' },
                  { value: 'cm', label: 'CM' },
                  { value: 'cam', label: 'CAM' },
                  { value: 'lm', label: 'LM' },
                  { value: 'rm', label: 'RM' },
                  { value: 'lw', label: 'LW' },
                  { value: 'rw', label: 'RW' },
                  { value: 'st', label: 'ST' },
                ]}
                clearable
              />
            </Group>
            
            <Divider />
            
            {filteredFreeAgents.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <Search size={48} stroke={1} color="var(--mantine-color-gray-5)" />
                  <Text c="dimmed">
                    {nameFilter || positionFilter ? "No free agents match your filters" : "No free agents available"}
                  </Text>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={600}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Player</Table.Th>
                      <Table.Th>Position</Table.Th>
                      <Table.Th>Console</Table.Th>
                      <Table.Th>Salary</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredFreeAgents.map((agent) => (
                      <Table.Tr key={agent.id}>
                        <Table.Td>
                          <Group>
                            <Avatar size="sm" color="gray">
                              {agent.users.gamer_tag_id?.[0]?.toUpperCase() || 'F'}
                            </Avatar>
                            <Text fw={500}>{agent.users.gamer_tag_id}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Badge variant="light" color="green" size="sm">
                              {agent.users.primary_position}
                            </Badge>
                            {agent.users.secondary_position && (
                              <Badge variant="outline" color="gray" size="sm">
                                {agent.users.secondary_position}
                              </Badge>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="outline" size="sm">
                            {agent.users.console}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={500}>${agent.salary?.toLocaleString() || 0}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Button variant="light" size="xs" leftSection={<Users size={14} />}>
                            Sign Player
                          </Button>
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
    </Container>
  )
}
