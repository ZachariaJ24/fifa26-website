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
  Card,
  ThemeIcon,
  Grid,
  Loader,
  Center,
  Tabs,
  Table,
  Progress,
  Badge
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  BarChart3,
  TrendingUp,
  Users,
  Trophy,
  Target,
  Calendar,
  RefreshCw,
  Download,
  Activity,
  Award,
  Zap,
  Shield,
  AlertTriangle
} from "lucide-react"

interface PlayerStats {
  id: string
  gamer_tag: string
  club_name: string
  goals: number
  assists: number
  matches_played: number
  wins: number
  losses: number
  draws: number
  clean_sheets: number
  yellow_cards: number
  red_cards: number
}

interface ClubStats {
  id: string
  name: string
  matches_played: number
  wins: number
  losses: number
  draws: number
  goals_scored: number
  goals_conceded: number
  goal_difference: number
  points: number
  win_rate: number
}

interface Season {
  id: string
  name: string
  season_number: number
  is_active: boolean
}

export default function StatisticsManagementPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string>("")
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([])
  const [clubStats, setClubStats] = useState<ClubStats[]>([])
  const [overallStats, setOverallStats] = useState({
    totalMatches: 0,
    totalGoals: 0,
    totalPlayers: 0,
    avgGoalsPerMatch: 0
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedSeason) {
      fetchStatistics()
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

  const fetchStatistics = async () => {
    if (!selectedSeason) return

    try {
      // Fetch player statistics
      const { data: playersData, error: playersError } = await supabase
        .from("player_statistics")
        .select(`
          *,
          players!inner(
            users!inner(gamer_tag_id),
            clubs(name)
          )
        `)
        .eq("season_id", selectedSeason)
        .order("goals", { ascending: false })

      if (playersError) throw playersError

      const formattedPlayerStats = playersData?.map(stat => ({
        id: stat.id,
        gamer_tag: stat.players?.users?.gamer_tag_id || 'Unknown',
        club_name: stat.players?.clubs?.name || 'No Club',
        goals: stat.goals || 0,
        assists: stat.assists || 0,
        matches_played: stat.matches_played || 0,
        wins: stat.wins || 0,
        losses: stat.losses || 0,
        draws: stat.draws || 0,
        clean_sheets: stat.clean_sheets || 0,
        yellow_cards: stat.yellow_cards || 0,
        red_cards: stat.red_cards || 0
      })) || []

      setPlayerStats(formattedPlayerStats)

      // Fetch club statistics
      const { data: clubsData, error: clubsError } = await supabase
        .from("clubs")
        .select("*")
        .eq("is_active", true)
        .order("points", { ascending: false })

      if (clubsError) throw clubsError

      const formattedClubStats = clubsData?.map(club => ({
        id: club.id,
        name: club.name,
        matches_played: club.matches_played || 0,
        wins: club.wins || 0,
        losses: club.losses || 0,
        draws: club.draws || 0,
        goals_scored: club.goals_scored || 0,
        goals_conceded: club.goals_conceded || 0,
        goal_difference: club.goal_difference || 0,
        points: club.points || 0,
        win_rate: club.matches_played > 0 ? ((club.wins || 0) / club.matches_played) * 100 : 0
      })) || []

      setClubStats(formattedClubStats)

      // Calculate overall statistics
      const totalMatches = formattedClubStats.reduce((sum, club) => sum + club.matches_played, 0) / 2 // Divide by 2 to avoid double counting
      const totalGoals = formattedClubStats.reduce((sum, club) => sum + club.goals_scored, 0)
      const totalPlayers = formattedPlayerStats.length
      const avgGoalsPerMatch = totalMatches > 0 ? totalGoals / totalMatches : 0

      setOverallStats({
        totalMatches,
        totalGoals,
        totalPlayers,
        avgGoalsPerMatch
      })

    } catch (error: any) {
      console.error("Error fetching statistics:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch statistics",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    }
  }

  const exportStatistics = (type: 'players' | 'clubs') => {
    const data = type === 'players' ? playerStats : clubStats
    
    if (data.length === 0) {
      notifications.show({
        title: "No Data",
        message: `No ${type} statistics to export`,
        color: "orange",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    // Create CSV content
    let headers: string[]
    let csvContent: string

    if (type === 'players') {
      headers = ['Player', 'Club', 'Goals', 'Assists', 'Matches', 'Wins', 'Losses', 'Draws', 'Clean Sheets', 'Yellow Cards', 'Red Cards']
      csvContent = [
        headers.join(','),
        ...playerStats.map(p => [
          p.gamer_tag,
          p.club_name,
          p.goals,
          p.assists,
          p.matches_played,
          p.wins,
          p.losses,
          p.draws,
          p.clean_sheets,
          p.yellow_cards,
          p.red_cards
        ].join(','))
      ].join('\n')
    } else {
      headers = ['Club', 'Matches', 'Wins', 'Losses', 'Draws', 'Goals For', 'Goals Against', 'Goal Diff', 'Points', 'Win Rate']
      csvContent = [
        headers.join(','),
        ...clubStats.map(c => [
          c.name,
          c.matches_played,
          c.wins,
          c.losses,
          c.draws,
          c.goals_scored,
          c.goals_conceded,
          c.goal_difference,
          c.points,
          c.win_rate.toFixed(1) + '%'
        ].join(','))
      ].join('\n')
    }

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-statistics-${selectedSeason}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    notifications.show({
      title: "Success",
      message: `${type} statistics exported successfully`,
      color: "green"
    })
  }

  if (loading) {
    return (
      <Container size="xl" py="xl" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading Statistics...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-green-6) 0%, var(--mantine-color-blue-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <BarChart3 size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Statistics Management
              </Title>
              <Text size="lg" c="yellow" >
                View and analyze player and club performance statistics
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="dark.6">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="green">{overallStats.totalMatches}</Text>
              <Text size="sm" c="cyan">Total Matches</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Season Selection */}
      <Paper withBorder p="md" mb="lg" bg="dark.7">
        <Group justify="space-between" mb="md">
          <Title order={3}>Season Statistics</Title>
          <Button leftSection={<RefreshCw size={16} />} onClick={fetchStatistics}>
            Refresh
          </Button>
        </Group>

        <Select
          label="Select Season"
          placeholder="Choose a season"
          value={selectedSeason}
          onChange={(value) => setSelectedSeason(value || "")}
          data={seasons.map(season => ({
            value: season.id,
            label: `${season.name} (Season ${season.season_number})${season.is_active ? ' - Active' : ''}`
          }))}
          style={{ maxWidth: 300 }}
        />
      </Paper>

      {/* Overall Statistics */}
      <Grid mb="lg">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
              <Activity size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="blue">{overallStats.totalMatches}</Text>
            <Text size="sm" c="cyan">Total Matches</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
              <Target size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="green">{overallStats.totalGoals}</Text>
            <Text size="sm" c="cyan">Total Goals</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
              <Users size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="orange">{overallStats.totalPlayers}</Text>
            <Text size="sm" c="cyan">Active Players</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="purple" variant="light" mx="auto" mb="md">
              <TrendingUp size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="purple">{overallStats.avgGoalsPerMatch.toFixed(1)}</Text>
            <Text size="sm" c="cyan">Avg Goals/Match</Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Statistics Tabs */}
      <Tabs defaultValue="players" variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="players" leftSection={<Users size={16} />}>
            Player Statistics ({playerStats.length})
          </Tabs.Tab>
          <Tabs.Tab value="clubs" leftSection={<Trophy size={16} />}>
            Club Statistics ({clubStats.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="players" pt="md">
          <Paper withBorder bg="dark.7">
            <Group justify="space-between" p="md">
              <Title order={4}>Player Performance</Title>
              <Button 
                leftSection={<Download size={16} />} 
                onClick={() => exportStatistics('players')}
                variant="outline"
              >
                Export CSV
              </Button>
            </Group>

            {playerStats.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <Users size={48} stroke={1} color="var(--mantine-color-blue-5)" />
                  <Text c="cyan">No player statistics for this season</Text>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={1000}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Player</Table.Th>
                      <Table.Th>Club</Table.Th>
                      <Table.Th>Goals</Table.Th>
                      <Table.Th>Assists</Table.Th>
                      <Table.Th>Matches</Table.Th>
                      <Table.Th>Record</Table.Th>
                      <Table.Th>Clean Sheets</Table.Th>
                      <Table.Th>Cards</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {playerStats.map((player, index) => (
                      <Table.Tr key={player.id}>
                        <Table.Td>
                          <Group>
                            <Badge variant="outline" size="sm">#{index + 1}</Badge>
                            <Text fw={500}>{player.gamer_tag}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{player.club_name}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="green" variant="light" size="sm">
                            {player.goals}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="blue" variant="light" size="sm">
                            {player.assists}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{player.matches_played}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {player.wins}W-{player.losses}L-{player.draws}D
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="orange" variant="light" size="sm">
                            {player.clean_sheets}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Badge color="yellow" variant="light" size="xs">
                              {player.yellow_cards}Y
                            </Badge>
                            <Badge color="red" variant="light" size="xs">
                              {player.red_cards}R
                            </Badge>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="clubs" pt="md">
          <Paper withBorder bg="dark.7">
            <Group justify="space-between" p="md">
              <Title order={4}>Club Performance</Title>
              <Button 
                leftSection={<Download size={16} />} 
                onClick={() => exportStatistics('clubs')}
                variant="outline"
              >
                Export CSV
              </Button>
            </Group>

            {clubStats.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <Trophy size={48} stroke={1} color="var(--mantine-color-blue-5)" />
                  <Text c="cyan">No club statistics for this season</Text>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={1000}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Position</Table.Th>
                      <Table.Th>Club</Table.Th>
                      <Table.Th>Matches</Table.Th>
                      <Table.Th>Record</Table.Th>
                      <Table.Th>Goals</Table.Th>
                      <Table.Th>Goal Diff</Table.Th>
                      <Table.Th>Points</Table.Th>
                      <Table.Th>Win Rate</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {clubStats.map((club, index) => (
                      <Table.Tr key={club.id}>
                        <Table.Td>
                          <Badge 
                            color={index < 3 ? "yellow" : index < 6 ? "blue" : "indigo"} 
                            variant="light" 
                            size="sm"
                          >
                            #{index + 1}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={500}>{club.name}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{club.matches_played}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {club.wins}W-{club.losses}L-{club.draws}D
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {club.goals_scored}:{club.goals_conceded}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text 
                            size="sm" 
                            fw={500} 
                            c={club.goal_difference >= 0 ? "green" : "red"}
                          >
                            {club.goal_difference >= 0 ? '+' : ''}{club.goal_difference}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="blue" variant="filled" size="sm">
                            {club.points}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group>
                            <Progress 
                              value={club.win_rate} 
                              size="sm" 
                              style={{ width: 60 }}
                              color={club.win_rate > 60 ? "green" : club.win_rate > 40 ? "yellow" : "red"}
                            />
                            <Text size="sm">{club.win_rate.toFixed(1)}%</Text>
                          </Group>
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
