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
  Paper,
  Stack,
  Group,
  Card,
  Grid,
  Loader,
  Center,
  ThemeIcon,
  Badge,
  Alert
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  Search,
  GamepadIcon as GameController,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Shield,
  Database,
  Trophy,
  Star,
  Medal,
  Crown,
  Activity,
  AlertTriangle
} from "lucide-react"

export default function EAStatsPageMantine() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    async function checkAuthorization() {
      if (!session?.user) {
        notifications.show({
          title: "Unauthorized",
          message: "You must be logged in to access this page.",
          color: "red",
          icon: <AlertTriangle size={16} />
        })
        router.push("/login")
        return
      }

      try {
        const { data: adminRoleData, error: adminRoleError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("role", "Admin")

        if (adminRoleError || !adminRoleData || adminRoleData.length === 0) {
          notifications.show({
            title: "Access denied",
            message: "You don't have permission to access this page.",
            color: "red",
            icon: <AlertTriangle size={16} />
          })
          router.push("/")
          return
        }

        setIsAdmin(true)
        await fetchTeams()
      } catch (error: any) {
        console.error("Error checking authorization:", error)
        notifications.show({
          title: "Error",
          message: error.message || "An error occurred",
          color: "red",
          icon: <AlertTriangle size={16} />
        })
      } finally {
        setLoading(false)
      }
    }

    checkAuthorization()
  }, [supabase, session, router])

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("is_active", true)
        .order("name")

      if (error) throw error
      setTeams(data || [])
    } catch (error: any) {
      console.error("Error fetching teams:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch teams",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      notifications.show({
        title: "Error",
        message: "Please enter a search query",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    setSearching(true)
    try {
      // Implement EA Stats search functionality here
      // This would typically search EA Sports API or database
      notifications.show({
        title: "Search Complete",
        message: `Searched for: ${searchQuery}`,
        color: "blue",
        icon: <Search size={16} />
      })
    } catch (error: any) {
      console.error("Error searching EA stats:", error)
      notifications.show({
        title: "Error",
        message: "Failed to search EA stats",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setSearching(false)
    }
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="dimmed">Loading EA Stats...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Container size="xl" py="md">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-green-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <GameController size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="white">
                EA Sports FIFA Stats
              </Title>
              <Text size="lg" c="white" opacity={0.9}>
                View and analyze EA Sports FIFA player statistics and performance data
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="blue">{teams.length}</Text>
              <Text size="sm" c="dimmed">Active Teams</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Search Section */}
      <Paper withBorder p="lg" mb="lg">
        <Stack gap="md">
          <Group>
            <ThemeIcon color="blue" variant="light">
              <Search size={20} />
            </ThemeIcon>
            <Title order={3}>Search EA Stats</Title>
          </Group>
          
          <Group>
            <TextInput
              placeholder="Search for players, teams, or stats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftSection={<Search size={16} />}
              style={{ flex: 1 }}
              size="lg"
            />
            <Button 
              leftSection={<Search size={16} />} 
              onClick={handleSearch}
              loading={searching}
              size="lg"
            >
              Search
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Teams Grid */}
      <Paper withBorder p="lg">
        <Group mb="md">
          <ThemeIcon color="green" variant="light">
            <Trophy size={20} />
          </ThemeIcon>
          <Title order={3}>Active Teams</Title>
        </Group>

        {teams.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <Users size={48} stroke={1} color="var(--mantine-color-gray-5)" />
              <Text c="dimmed">No active teams found</Text>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {teams.map((team) => (
              <Grid.Col key={team.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card withBorder shadow="sm" p="md" h="100%">
                  <Stack align="center" gap="md">
                    {team.logo_url ? (
                      <img 
                        src={team.logo_url} 
                        alt={team.name}
                        style={{ width: 60, height: 60, objectFit: 'contain' }}
                      />
                    ) : (
                      <ThemeIcon size={60} color="blue" variant="light">
                        <Trophy size={30} />
                      </ThemeIcon>
                    )}
                    
                    <div style={{ textAlign: 'center' }}>
                      <Text fw={600} size="lg">{team.name}</Text>
                      <Badge color="green" variant="light" size="sm" mt="xs">
                        Active
                      </Badge>
                    </div>

                    <Group gap="xs" justify="center">
                      <Badge variant="outline" size="xs">
                        {team.wins || 0}W
                      </Badge>
                      <Badge variant="outline" size="xs">
                        {team.losses || 0}L
                      </Badge>
                      <Badge variant="outline" size="xs">
                        {team.draws || 0}D
                      </Badge>
                    </Group>

                    <Button 
                      variant="light" 
                      size="xs" 
                      fullWidth
                      leftSection={<BarChart3 size={14} />}
                      component="a"
                      href={`/admin/ea-stats/${team.id}`}
                    >
                      View Stats
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Stats Overview */}
      <Grid mt="lg">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
              <Users size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="blue">0</Text>
            <Text size="sm" c="dimmed">Total Players</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
              <Target size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="green">0</Text>
            <Text size="sm" c="dimmed">Total Goals</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
              <Activity size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="orange">0</Text>
            <Text size="sm" c="dimmed">Total Matches</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="yellow" variant="light" mx="auto" mb="md">
              <Star size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="yellow">0</Text>
            <Text size="sm" c="dimmed">Top Performers</Text>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  )
}
