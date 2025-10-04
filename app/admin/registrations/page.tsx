"use client"

import React, { useState, useEffect } from "react"
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
  Alert,
  Modal,
  Tabs,
  Card,
  ThemeIcon,
  ActionIcon,
  Menu,
  Radio
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  Download,
  Search,
  AlertCircle,
  RefreshCw,
  User,
  Gamepad2,
  Edit,
  Trophy,
  Calendar,
  Users,
  CheckCircle2,
  MoreHorizontal,
  X
} from "lucide-react"

interface Registration {
  id: string
  user_id: string
  season_number: number
  primary_position: string
  secondary_position?: string
  gamer_tag: string
  console: string
  status: string
  created_at: string
  updated_at: string
}

export default function RegistrationsPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSeason, setActiveSeason] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Edit modals
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null)
  const [newGamerTag, setNewGamerTag] = useState("")
  const [newPrimaryPosition, setNewPrimaryPosition] = useState("")
  const [newSecondaryPosition, setNewSecondaryPosition] = useState("")
  const [newConsole, setNewConsole] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const positionOptions = [
    { value: "Center", label: "Center" },
    { value: "Left Wing", label: "Left Wing" },
    { value: "Right Wing", label: "Right Wing" },
    { value: "Left Defense", label: "Left Defense" },
    { value: "Right Defense", label: "Right Defense" },
    { value: "Goalie", label: "Goalie" },
    { value: "Forward", label: "Forward" },
    { value: "Defense", label: "Defense" },
    { value: "Any", label: "Any" },
  ]

  const consoleOptions = [
    { value: "PlayStation 5", label: "PlayStation 5" },
    { value: "Xbox Series X/S", label: "Xbox Series X/S" },
    { value: "Xbox", label: "Xbox" },
    { value: "PS5", label: "PS5" }
  ]

  useEffect(() => {
    fetchActiveSeason()
  }, [])

  useEffect(() => {
    filterRegistrations()
  }, [registrations, searchTerm, statusFilter])

  const fetchActiveSeason = async () => {
    try {
      setLoading(true)
      
      // Get current season from system settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "current_season")
        .single()

      if (settingsError) {
        console.error("Error fetching current season setting:", settingsError)
        setError(`Error fetching current season: ${settingsError.message}`)
        return
      }

      const currentSeasonId = settingsData?.value

      if (!currentSeasonId) {
        setError("No active season found. Please set an active season in the admin settings.")
        return
      }

      // Get season details
      const { data: seasonData, error: seasonError } = await supabase
        .from("seasons")
        .select("*")
        .eq("id", currentSeasonId)
        .single()

      if (seasonError) {
        console.error("Error fetching season:", seasonError)
        setError(`Error fetching season: ${seasonError.message}`)
        return
      }

      setActiveSeason(seasonData)
      await fetchRegistrations(seasonData.season_number || seasonData.number)

    } catch (error: any) {
      console.error("Error in fetchActiveSeason:", error)
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchRegistrations = async (seasonNumber: number) => {
    try {
      const { data, error } = await supabase
        .from("season_registrations")
        .select("*")
        .eq("season_number", seasonNumber)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching registrations:", error)
        notifications.show({
          title: "Error",
          message: `Failed to fetch registrations: ${error.message}`,
          color: "red",
          icon: <AlertCircle size={16} />
        })
        return
      }

      setRegistrations(data || [])
    } catch (error: any) {
      console.error("Error in fetchRegistrations:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to fetch registrations",
        color: "red",
        icon: <AlertCircle size={16} />
      })
    }
  }

  const filterRegistrations = () => {
    let filtered = [...registrations]

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(reg => 
        reg.gamer_tag?.toLowerCase().includes(search) ||
        reg.primary_position?.toLowerCase().includes(search) ||
        reg.console?.toLowerCase().includes(search)
      )
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(reg => reg.status === statusFilter)
    }

    setFilteredRegistrations(filtered)
  }

  const handleEditRegistration = (registration: Registration) => {
    setEditingRegistration(registration)
    setNewGamerTag(registration.gamer_tag || "")
    setNewPrimaryPosition(registration.primary_position || "")
    setNewSecondaryPosition(registration.secondary_position || "")
    setNewConsole(registration.console || "")
    openEditModal()
  }

  const handleUpdateRegistration = async () => {
    if (!editingRegistration) return

    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from("season_registrations")
        .update({
          gamer_tag: newGamerTag,
          primary_position: newPrimaryPosition,
          secondary_position: newSecondaryPosition || null,
          console: newConsole,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingRegistration.id)

      if (error) {
        throw error
      }

      notifications.show({
        title: "Success",
        message: "Registration updated successfully",
        color: "green",
        icon: <CheckCircle2 size={16} />
      })

      closeEditModal()
      if (activeSeason) {
        await fetchRegistrations(activeSeason.season_number || activeSeason.number)
      }
    } catch (error: any) {
      console.error("Error updating registration:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update registration",
        color: "red",
        icon: <AlertCircle size={16} />
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleApproveRegistration = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from("season_registrations")
        .update({ status: "Approved" })
        .eq("id", registrationId)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Registration approved",
        color: "green",
        icon: <CheckCircle2 size={16} />
      })

      if (activeSeason) {
        await fetchRegistrations(activeSeason.season_number || activeSeason.number)
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to approve registration",
        color: "red",
        icon: <AlertCircle size={16} />
      })
    }
  }

  const handleRejectRegistration = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from("season_registrations")
        .update({ status: "Rejected" })
        .eq("id", registrationId)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Registration rejected",
        color: "orange",
        icon: <X size={16} />
      })

      if (activeSeason) {
        await fetchRegistrations(activeSeason.season_number || activeSeason.number)
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to reject registration",
        color: "red",
        icon: <AlertCircle size={16} />
      })
    }
  }

  const exportToCSV = () => {
    const headers = ['Gamer Tag', 'Primary Position', 'Secondary Position', 'Console', 'Status', 'Created At']
    const csvContent = [
      headers.join(','),
      ...filteredRegistrations.map(reg => [
        `"${reg.gamer_tag || ''}"`,
        `"${reg.primary_position || ''}"`,
        `"${reg.secondary_position || ''}"`,
        `"${reg.console || ''}"`,
        `"${reg.status || ''}"`,
        `"${new Date(reg.created_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `season-registrations-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      'Pending': { color: 'yellow', label: 'Pending' },
      'Approved': { color: 'green', label: 'Approved' },
      'Rejected': { color: 'red', label: 'Rejected' }
    }

    const config = statusConfig[status] || { color: 'gray', label: status }
    return <Badge color={config.color} variant="light" size="sm">{config.label}</Badge>
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading Season Registrations...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<AlertCircle size={16} />} color="red">
          <Text fw={600}>Error Loading Registrations</Text>
          <Text size="sm">{error}</Text>
        </Alert>
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
              <Trophy size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Season Registrations
              </Title>
              <Text size="lg" c="yellow" >
                {activeSeason ? `${activeSeason.name} - Season ${activeSeason.season_number || activeSeason.number}` : 'Manage player registrations'}
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="blue">{filteredRegistrations.length}</Text>
              <Text size="sm" c="cyan">Total Registrations</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Filters and Actions */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between" mb="md">
          <Title order={3}>Registration Management</Title>
          <Group>
            <Button variant="outline" leftSection={<Download size={16} />} onClick={exportToCSV}>
              Export CSV
            </Button>
            <Button leftSection={<RefreshCw size={16} />} onClick={fetchActiveSeason}>
              Refresh
            </Button>
          </Group>
        </Group>

        <Group>
          <TextInput
            placeholder="Search registrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftSection={<Search size={16} />}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="All Status"
            value={statusFilter}
            onChange={setStatusFilter}
            data={[
              { value: 'all', label: 'All Status' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Rejected', label: 'Rejected' }
            ]}
            clearable
          />
        </Group>
      </Paper>

      {/* Registrations Table */}
      <Paper withBorder>
        {filteredRegistrations.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <Users size={48} stroke={1} color="var(--mantine-color-gray-5)" />
              <Text c="cyan">
                {searchTerm || statusFilter ? "No registrations match your filters" : "No registrations found"}
              </Text>
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Player</Table.Th>
                  <Table.Th>Positions</Table.Th>
                  <Table.Th>Console</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Registered</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredRegistrations.map((registration) => (
                  <Table.Tr key={registration.id}>
                    <Table.Td>
                      <Group>
                        <ThemeIcon color="blue" variant="light" size="sm">
                          <User size={16} />
                        </ThemeIcon>
                        <Text fw={500}>{registration.gamer_tag}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Badge variant="light" color="blue" size="sm">
                          {registration.primary_position}
                        </Badge>
                        {registration.secondary_position && (
                          <Badge variant="outline" color="cyan" size="sm">
                            {registration.secondary_position}
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Gamepad2 size={14} />
                        <Text size="sm">{registration.console}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {getStatusBadge(registration.status)}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="cyan">
                        {new Date(registration.created_at).toLocaleDateString()}
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
                            onClick={() => handleEditRegistration(registration)}
                          >
                            Edit Registration
                          </Menu.Item>
                          {registration.status === 'Pending' && (
                            <>
                              <Menu.Item 
                                leftSection={<CheckCircle2 size={14} />}
                                color="green"
                                onClick={() => handleApproveRegistration(registration.id)}
                              >
                                Approve
                              </Menu.Item>
                              <Menu.Item 
                                leftSection={<X size={14} />}
                                color="red"
                                onClick={() => handleRejectRegistration(registration.id)}
                              >
                                Reject
                              </Menu.Item>
                            </>
                          )}
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

      {/* Edit Registration Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit Registration" size="md">
        {editingRegistration && (
          <Stack>
            <TextInput
              label="Gamer Tag"
              value={newGamerTag}
              onChange={(e) => setNewGamerTag(e.target.value)}
              required
            />
            
            <Select
              label="Primary Position"
              value={newPrimaryPosition}
              onChange={(value) => setNewPrimaryPosition(value || "")}
              data={positionOptions}
              required
            />
            
            <Select
              label="Secondary Position"
              value={newSecondaryPosition}
              onChange={(value) => setNewSecondaryPosition(value || "")}
              data={positionOptions}
              clearable
            />
            
            <Select
              label="Console"
              value={newConsole}
              onChange={(value) => setNewConsole(value || "")}
              data={consoleOptions}
              required
            />

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRegistration} loading={isUpdating}>
                Update Registration
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
