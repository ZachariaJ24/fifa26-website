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
  Card,
  ThemeIcon,
  Grid,
  Alert
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  TrendingUp,
  Users,
  ArrowRightLeft,
  Calendar,
  DollarSign,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Building2
} from "lucide-react"

interface Transfer {
  id: string
  player_id: string
  from_club_id: string
  to_club_id: string
  transfer_fee: number
  transfer_date: string
  status: string
  player_name: string
  from_club_name: string
  to_club_name: string
  season_id: string
}

interface Season {
  id: string
  name: string
  season_number: number
  is_active: boolean
}

export default function TransferRecapPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string>("")
  const [stats, setStats] = useState({
    totalTransfers: 0,
    totalFees: 0,
    avgTransferFee: 0,
    mostActiveClub: ""
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedSeason) {
      fetchTransfers()
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

  const fetchTransfers = async () => {
    if (!selectedSeason) return

    try {
      // Fetch transfers for the selected season
      const { data: transfersData, error: transfersError } = await supabase
        .from("transfers")
        .select(`
          *,
          players!inner(
            users!inner(gamer_tag_id)
          ),
          from_club:clubs!transfers_from_club_id_fkey(name),
          to_club:clubs!transfers_to_club_id_fkey(name)
        `)
        .eq("season_id", selectedSeason)
        .order("transfer_date", { ascending: false })

      if (transfersError) throw transfersError

      const formattedTransfers = transfersData?.map(transfer => ({
        id: transfer.id,
        player_id: transfer.player_id,
        from_club_id: transfer.from_club_id,
        to_club_id: transfer.to_club_id,
        transfer_fee: transfer.transfer_fee || 0,
        transfer_date: transfer.transfer_date,
        status: transfer.status,
        player_name: transfer.players?.users?.gamer_tag_id || 'Unknown Player',
        from_club_name: transfer.from_club?.name || 'Unknown Club',
        to_club_name: transfer.to_club?.name || 'Unknown Club',
        season_id: transfer.season_id
      })) || []

      setTransfers(formattedTransfers)
      calculateStats(formattedTransfers)

    } catch (error: any) {
      console.error("Error fetching transfers:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch transfer data",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    }
  }

  const calculateStats = (transfersData: Transfer[]) => {
    const totalTransfers = transfersData.length
    const totalFees = transfersData.reduce((sum, t) => sum + t.transfer_fee, 0)
    const avgTransferFee = totalTransfers > 0 ? totalFees / totalTransfers : 0

    // Find most active club (most transfers in or out)
    const clubActivity: Record<string, number> = {}
    transfersData.forEach(transfer => {
      clubActivity[transfer.from_club_name] = (clubActivity[transfer.from_club_name] || 0) + 1
      clubActivity[transfer.to_club_name] = (clubActivity[transfer.to_club_name] || 0) + 1
    })

    const mostActiveClub = Object.entries(clubActivity)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "None"

    setStats({
      totalTransfers,
      totalFees,
      avgTransferFee,
      mostActiveClub
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      'completed': { color: 'green', label: 'Completed' },
      'pending': { color: 'yellow', label: 'Pending' },
      'cancelled': { color: 'red', label: 'Cancelled' },
      'approved': { color: 'blue', label: 'Approved' }
    }

    const config = statusConfig[status] || { color: 'blue', label: status }
    return <Badge color={config.color} variant="light" size="sm">{config.label}</Badge>
  }

  const exportTransfers = () => {
    if (transfers.length === 0) {
      notifications.show({
        title: "No Data",
        message: "No transfers to export for the selected season",
        color: "orange",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    // Create CSV content
    const headers = ['Player', 'From Club', 'To Club', 'Transfer Fee', 'Date', 'Status']
    const csvContent = [
      headers.join(','),
      ...transfers.map(t => [
        t.player_name,
        t.from_club_name,
        t.to_club_name,
        t.transfer_fee,
        new Date(t.transfer_date).toLocaleDateString(),
        t.status
      ].join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transfers-${selectedSeason}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    notifications.show({
      title: "Success",
      message: "Transfer data exported successfully",
      color: "green",
      icon: <CheckCircle size={16} />
    })
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading Transfer Recap...</Text>
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
              <ArrowRightLeft size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Transfer Recap
              </Title>
              <Text size="lg" c="yellow" >
                View and analyze player transfers by season
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="green">{stats.totalTransfers}</Text>
              <Text size="sm" c="cyan">Total Transfers</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Season Selection and Actions */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between" mb="md">
          <Title order={3}>Transfer Analysis</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={fetchTransfers}>
              Refresh
            </Button>
            <Button leftSection={<Download size={16} />} onClick={exportTransfers}>
              Export CSV
            </Button>
          </Group>
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

      {/* Statistics Cards */}
      <Grid mb="lg">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
              <ArrowRightLeft size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="blue">{stats.totalTransfers}</Text>
            <Text size="sm" c="cyan">Total Transfers</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
              <DollarSign size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="green">${stats.totalFees.toLocaleString()}</Text>
            <Text size="sm" c="cyan">Total Fees</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
              <TrendingUp size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="orange">${Math.round(stats.avgTransferFee).toLocaleString()}</Text>
            <Text size="sm" c="cyan">Avg Transfer Fee</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="purple" variant="light" mx="auto" mb="md">
              <Building2 size={24} />
            </ThemeIcon>
            <Text size="lg" fw={700} c="purple" lineClamp={1}>{stats.mostActiveClub}</Text>
            <Text size="sm" c="cyan">Most Active Club</Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Transfers Table */}
      <Paper withBorder>
        {!selectedSeason ? (
          <Center p="xl">
            <Stack align="center">
              <Calendar size={48} stroke={1} color="var(--mantine-color-blue-5)" />
              <Text c="cyan">Please select a season to view transfers</Text>
            </Stack>
          </Center>
        ) : transfers.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <ArrowRightLeft size={48} stroke={1} color="var(--mantine-color-blue-5)" />
              <Text c="cyan">No transfers found for this season</Text>
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Player</Table.Th>
                  <Table.Th>Transfer</Table.Th>
                  <Table.Th>Fee</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {transfers.map((transfer) => (
                  <Table.Tr key={transfer.id}>
                    <Table.Td>
                      <Group>
                        <ThemeIcon color="blue" variant="light" size="sm">
                          <Users size={16} />
                        </ThemeIcon>
                        <Text fw={500}>{transfer.player_name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Text size="sm">{transfer.from_club_name}</Text>
                        <ArrowRightLeft size={14} color="var(--mantine-color-blue-6)" />
                        <Text size="sm" fw={500}>{transfer.to_club_name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500} c={transfer.transfer_fee > 0 ? "green" : "gray"}>
                        {transfer.transfer_fee > 0 ? `$${transfer.transfer_fee.toLocaleString()}` : 'Free'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Calendar size={14} />
                        <Text size="sm">
                          {new Date(transfer.transfer_date).toLocaleDateString()}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {getStatusBadge(transfer.status)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>
    </Container>
  )
}
