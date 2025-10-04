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
  Alert,
  Loader,
  Center
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Save
} from "lucide-react"

interface Season {
  id: string
  name: string
  season_number: number
  is_active: boolean
  start_date: string
  end_date: string
  created_at: string
}

export default function UpdateCurrentSeasonPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [currentSeasonId, setCurrentSeasonId] = useState<string>("")
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch all seasons
      const { data: seasonsData, error: seasonsError } = await supabase
        .from("seasons")
        .select("*")
        .order("created_at", { ascending: false })

      if (seasonsError) throw seasonsError
      setSeasons(seasonsData || [])

      // Get current season from system settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "current_season_id")
        .single()

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError
      }

      const currentId = settingsData?.value || ""
      setCurrentSeasonId(currentId)
      setSelectedSeasonId(currentId)

    } catch (error: any) {
      console.error("Error fetching data:", error)
      notifications.show({
        title: "Error",
        message: "Failed to load season data",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const updateCurrentSeason = async () => {
    if (!selectedSeasonId) {
      notifications.show({
        title: "Error",
        message: "Please select a season",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    setUpdating(true)
    try {
      // Update system settings
      const { error: settingsError } = await supabase
        .from("system_settings")
        .upsert({
          key: "current_season_id",
          value: selectedSeasonId,
          updated_at: new Date().toISOString()
        })

      if (settingsError) throw settingsError

      // Update all seasons to inactive
      const { error: deactivateError } = await supabase
        .from("seasons")
        .update({ is_active: false })
        .neq("id", "00000000-0000-0000-0000-000000000000") // Update all

      if (deactivateError) throw deactivateError

      // Set selected season as active
      const { error: activateError } = await supabase
        .from("seasons")
        .update({ is_active: true })
        .eq("id", selectedSeasonId)

      if (activateError) throw activateError

      setCurrentSeasonId(selectedSeasonId)

      notifications.show({
        title: "Success",
        message: "Current season updated successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      fetchData()

    } catch (error: any) {
      console.error("Error updating current season:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update current season",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setUpdating(false)
    }
  }

  const getCurrentSeason = () => {
    return seasons.find(s => s.id === currentSeasonId)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="blue">Loading Season Data...</Text>
          </Stack>
        </Center>
      </div>
    )
  }

  const currentSeason = getCurrentSeason()

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-orange-6) 0%, var(--mantine-color-yellow-6) 100%)' }}>
        <Stack align="center" gap="md">
          <ThemeIcon size={80} radius="xl" variant="light" color="white">
            <Clock size={40} />
          </ThemeIcon>
          <Title order={1} c="white" ta="center">
            Update Current Season
          </Title>
          <Text size="lg" c="white" ta="center" maw={600}>
            Change the active season for registrations and league operations
          </Text>
        </Stack>
      </Paper>

      <Stack gap="xl">
        {/* Current Season Display */}
        {currentSeason && (
          <Card withBorder p="lg">
            <Group mb="md">
              <ThemeIcon color="green" variant="light">
                <CheckCircle size={20} />
              </ThemeIcon>
              <Title order={3}>Current Active Season</Title>
            </Group>
            
            <Group justify="space-between">
              <div>
                <Text fw={600} size="lg">{currentSeason.name}</Text>
                <Text c="blue">Season {currentSeason.season_number}</Text>
                <Text size="sm" c="blue" mt="xs">
                  {new Date(currentSeason.start_date).toLocaleDateString()} - {new Date(currentSeason.end_date).toLocaleDateString()}
                </Text>
              </div>
              <ThemeIcon size="xl" color="green" variant="light">
                <Calendar size={24} />
              </ThemeIcon>
            </Group>
          </Card>
        )}

        {/* Season Selection */}
        <Paper withBorder p="lg">
          <Group mb="md">
            <ThemeIcon color="blue" variant="light">
              <Clock size={20} />
            </ThemeIcon>
            <Title order={3}>Change Current Season</Title>
          </Group>

          <Stack gap="md">
            <Select
              label="Select New Current Season"
              placeholder="Choose a season to make active"
              value={selectedSeasonId}
              onChange={(value) => setSelectedSeasonId(value || "")}
              data={seasons.map(season => ({
                value: season.id,
                label: `${season.name} (Season ${season.season_number})${season.is_active ? ' - Currently Active' : ''}`
              }))}
              size="lg"
            />

            {selectedSeasonId && selectedSeasonId !== currentSeasonId && (
              <Alert color="blue" variant="light">
                <Text fw={500}>Season Change Impact</Text>
                <Text size="sm" mt="xs">
                  Changing the current season will:
                </Text>
                <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                  <li>Update all registration forms to use the new season</li>
                  <li>Change the default season for new player signups</li>
                  <li>Update system-wide season references</li>
                  <li>Set the selected season as "active" in the database</li>
                </ul>
              </Alert>
            )}

            <Group justify="flex-end">
              <Button variant="outline" leftSection={<RefreshCw size={16} />} onClick={fetchData}>
                Refresh
              </Button>
              <Button 
                leftSection={<Save size={16} />}
                onClick={updateCurrentSeason}
                loading={updating}
                disabled={!selectedSeasonId || selectedSeasonId === currentSeasonId}
              >
                Update Current Season
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* All Seasons Overview */}
        <Paper withBorder p="lg">
          <Group mb="md">
            <ThemeIcon color="indigo" variant="light">
              <Calendar size={20} />
            </ThemeIcon>
            <Title order={3}>All Seasons</Title>
          </Group>

          <Stack gap="xs">
            {seasons.map((season) => (
              <Card key={season.id} withBorder p="md" bg={season.is_active ? "green.0" : undefined}>
                <Group justify="space-between">
                  <div>
                    <Group gap="xs">
                      <Text fw={500}>{season.name}</Text>
                      {season.is_active && (
                        <ThemeIcon size="sm" color="green" variant="light">
                          <CheckCircle size={12} />
                        </ThemeIcon>
                      )}
                    </Group>
                    <Text size="sm" c="blue">
                      Season {season.season_number} • {new Date(season.start_date).toLocaleDateString()} - {new Date(season.end_date).toLocaleDateString()}
                    </Text>
                  </div>
                  {season.is_active && (
                    <Text size="sm" fw={500} c="green">
                      Active
                    </Text>
                  )}
                </Group>
              </Card>
            ))}
          </Stack>
        </Paper>
      </Stack>
    </div>
  )
}
