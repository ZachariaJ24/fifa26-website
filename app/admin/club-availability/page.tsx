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
  Select,
  Paper,
  Stack,
  Group,
  Badge,
  Table,
  Loader,
  Center,
  Tabs,
  Card,
  ThemeIcon,
  Grid,
  Progress
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  Activity,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react"
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO } from "date-fns"

interface PlayerAvailability {
  matchId: string
  matchDate: string
  opponent: string
  status: "available" | "unavailable" | "injury_reserve" | "not_responded"
  signedUpAt: string | null
}

interface Player {
  id: string
  userId: string
  name: string
  gamerTag: string
  gamesPlayed: number
  availability: PlayerAvailability[]
  availableCount: number
  unavailableCount: number
  injuryReserveCount: number
  noResponseCount: number
  isOnIR: boolean
}

interface Club {
  id: string
  name: string
  logoUrl: string | null
  players: Player[]
  matches: any[]
}

export default function ClubAvailabilityPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClub, setSelectedClub] = useState<string>("")
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [availabilityData, setAvailabilityData] = useState<any>(null)

  useEffect(() => {
    fetchClubs()
  }, [])

  useEffect(() => {
    if (selectedClub) {
      fetchAvailabilityData()
    }
  }, [selectedClub, currentWeek])

  const fetchClubs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("clubs")
        .select("id, name, logo_url")
        .eq("is_active", true)
        .order("name")

      if (error) throw error
      setClubs(data || [])
      
      if (data && data.length > 0) {
        setSelectedClub(data[0].id)
      }
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

  const fetchAvailabilityData = async () => {
    if (!selectedClub) return

    try {
      const weekStart = startOfWeek(currentWeek)
      const weekEnd = endOfWeek(currentWeek)

      // Fetch club players
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select(`
          id,
          user_id,
          users!inner(gamer_tag_id)
        `)
        .eq("club_id", selectedClub)
        .eq("status", "active")

      if (playersError) throw playersError

      // Fetch matches for the week
      const { data: matchesData, error: matchesError } = await supabase
        .from("fixtures")
        .select(`
          id,
          match_date,
          home_club_id,
          away_club_id,
          home_club:clubs!fixtures_home_club_id_fkey(name),
          away_club:clubs!fixtures_away_club_id_fkey(name)
        `)
        .or(`home_club_id.eq.${selectedClub},away_club_id.eq.${selectedClub}`)
        .gte("match_date", weekStart.toISOString())
        .lte("match_date", weekEnd.toISOString())

      if (matchesError) throw matchesError

      setAvailabilityData({
        players: playersData || [],
        matches: matchesData || []
      })

    } catch (error: any) {
      console.error("Error fetching availability data:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch availability data",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
      'available': { color: 'green', label: 'Available', icon: CheckCircle },
      'unavailable': { color: 'red', label: 'Unavailable', icon: XCircle },
      'injury_reserve': { color: 'orange', label: 'Injury Reserve', icon: AlertTriangle },
      'not_responded': { color: 'indigo', label: 'No Response', icon: Clock }
    }

    const config = statusConfig[status] || { color: 'indigo', label: status, icon: Clock }
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

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentWeek(subWeeks(currentWeek, 1))
    } else {
      setCurrentWeek(addWeeks(currentWeek, 1))
    }
  }

  if (loading) {
    return (
      <Container size="xl" py="md">
        <Center p="xl">
          <Stack align="center">
            <Loader size="lg" />
            <Text c="dimmed">Loading Club Availability...</Text>
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
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <Calendar size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="white">
                Club Availability
              </Title>
              <Text size="lg" c="white" opacity={0.9}>
                View player availability and games played by week
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="blue">{clubs.length}</Text>
              <Text size="sm" c="dimmed">Active Clubs</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Controls */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between" mb="md">
          <Title order={3}>Availability Overview</Title>
        </Group>

        <Group>
          <Select
            label="Select Club"
            placeholder="Choose a club"
            value={selectedClub}
            onChange={(value) => setSelectedClub(value || "")}
            data={clubs.map(club => ({ value: club.id, label: club.name }))}
            style={{ minWidth: 200 }}
          />

          <div>
            <Text size="sm" fw={500} mb="xs">Week Navigation</Text>
            <Group>
              <Button
                variant="outline"
                leftSection={<ChevronLeft size={16} />}
                onClick={() => navigateWeek('prev')}
              >
                Previous Week
              </Button>
              <Text fw={500}>
                {format(startOfWeek(currentWeek), 'MMM d')} - {format(endOfWeek(currentWeek), 'MMM d, yyyy')}
              </Text>
              <Button
                variant="outline"
                rightSection={<ChevronRight size={16} />}
                onClick={() => navigateWeek('next')}
              >
                Next Week
              </Button>
            </Group>
          </div>
        </Group>
      </Paper>

      {/* Availability Data */}
      {!selectedClub ? (
        <Center p="xl">
          <Stack align="center">
            <Users size={48} stroke={1} color="var(--mantine-color-blue-5)" />
            <Text c="dimmed">Please select a club to view availability</Text>
          </Stack>
        </Center>
      ) : (!availabilityData ? (
        <Center p="xl">
          <Loader />
        </Center>
      ) : (
        <Tabs defaultValue="overview" variant="outline">
          <Tabs.List grow>
            <Tabs.Tab value="overview" leftSection={<Activity size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="players" leftSection={<Users size={16} />}>
              Player Details ({availabilityData.players?.length || 0})
            </Tabs.Tab>
            <Tabs.Tab value="matches" leftSection={<Calendar size={16} />}>
              Matches ({availabilityData.matches?.length || 0})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card withBorder p="md" ta="center">
                  <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
                    <CheckCircle size={24} />
                  </ThemeIcon>
                  <Text size="xl" fw={700} c="green">0</Text>
                  <Text size="sm" c="dimmed">Available</Text>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card withBorder p="md" ta="center">
                  <ThemeIcon size="lg" color="red" variant="light" mx="auto" mb="md">
                    <XCircle size={24} />
                  </ThemeIcon>
                  <Text size="xl" fw={700} c="red">0</Text>
                  <Text size="sm" c="dimmed">Unavailable</Text>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card withBorder p="md" ta="center">
                  <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
                    <AlertTriangle size={24} />
                  </ThemeIcon>
                  <Text size="xl" fw={700} c="orange">0</Text>
                  <Text size="sm" c="dimmed">Injury Reserve</Text>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Card withBorder p="md" ta="center">
                  <ThemeIcon size="lg" color="indigo" variant="light" mx="auto" mb="md">
                    <Clock size={24} />
                  </ThemeIcon>
                  <Text size="xl" fw={700} c="indigo">0</Text>
                  <Text size="sm" c="dimmed">No Response</Text>
                </Card>
              </Grid.Col>
            </Grid>

            <Paper withBorder p="lg" mt="lg">
              <Title order={4} mb="md">Availability Trends</Title>
              <Text c="dimmed">
                Availability data will be displayed here once player responses are collected.
              </Text>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="players" pt="md">
            <Paper withBorder>
              {!availabilityData.players || availabilityData.players.length === 0 ? (
                <Center p="xl">
                  <Stack align="center">
                    <Users size={48} stroke={1} color="var(--mantine-color-blue-5)" />
                    <Text c="dimmed">No players found for this club</Text>
                  </Stack>
                </Center>
              ) : (
                <Table.ScrollContainer minWidth={600}>
                  <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Player</Table.Th>
                        <Table.Th>Games Played</Table.Th>
                        <Table.Th>Availability Rate</Table.Th>
                        <Table.Th>Status</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {availabilityData.players.map((player: any) => (
                        <Table.Tr key={player.id}>
                          <Table.Td>
                            <Group>
                              <ThemeIcon color="blue" variant="light" size="sm">
                                <Users size={16} />
                              </ThemeIcon>
                              <Text fw={500}>{player.users?.gamer_tag_id || 'Unknown Player'}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">0 games</Text>
                          </Table.Td>
                          <Table.Td>
                            <Group>
                              <Progress value={85} size="sm" style={{ flex: 1 }} />
                              <Text size="sm" c="dimmed">85%</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            {getStatusBadge('available')}
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
              {!availabilityData.matches || availabilityData.matches.length === 0 ? (
                <Center p="xl">
                  <Stack align="center">
                    <Calendar size={48} stroke={1} color="var(--mantine-color-blue-5)" />
                    <Text c="dimmed">No matches scheduled for this week</Text>
                  </Stack>
                </Center>
              ) : (
                <Stack p="md">
                  {availabilityData.matches.map((match: any) => (
                    <Card key={match.id} withBorder p="md">
                      <Group justify="space-between">
                        <Group>
                          <ThemeIcon color="green" variant="light">
                            <Trophy size={20} />
                          </ThemeIcon>
                          <div>
                            <Text fw={500}>
                              {match.home_club.name} vs {match.away_club.name}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {format(parseISO(match.match_date), 'PPP p')}
                            </Text>
                          </div>
                        </Group>
                        <Badge variant="light" color="blue" size="sm">
                          Scheduled
                        </Badge>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              )}
            </Paper>
          </Tabs.Panel>
        </Tabs>
      )}
    </Container>
  )
}
