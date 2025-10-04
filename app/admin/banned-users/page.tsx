"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/hooks"
import { useToast } from "@/components/ui/use-toast"
import {
  Container,
  Title,
  Text,
  Group,
  Button,
  TextInput,
  Select,
  Table,
  Badge,
  Paper,
  Stack,
  Loader,
  Center,
  Tabs,
  Modal,
  Textarea,
  Alert,
  Card,
  ActionIcon,
  Menu,
  Checkbox,
  Pagination,
  ThemeIcon
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  UserX,
  Clock,
  AlertCircle,
  Ban,
  Users,
  RefreshCw,
  Shield,
  UserCheck,
  UserMinus,
  Search,
  Download,
  MoreHorizontal,
  X
} from "lucide-react"

interface BannedUser {
  id: string
  email: string
  gamer_tag?: string
  gamer_tag_id?: string
  discord_name?: string
  ban_reason: string
  ban_expiration: string | null
  created_at: string
}

interface User {
  id: string
  gamer_tag_id?: string
  discord_name?: string
  is_banned: boolean
  ban_reason?: string
  ban_expiration?: string | null
}

export default function BannedUsersPageMantine() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([])
  const [loadingBannedUsers, setLoadingBannedUsers] = useState(false)
  const [unbanning, setUnbanning] = useState<string | null>(null)
  const [banning, setBanning] = useState(false)

  // Bulk selection for banned users
  const [selected, setSelected] = useState<string[]>([])

  const [users, setUsers] = useState<User[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const usersPerPage = 25

  // Ban dialog state
  const [banModalOpened, { open: openBanModal, close: closeBanModal }] = useDisclosure(false)
  const [selectedUserForBan, setSelectedUserForBan] = useState<User | null>(null)
  const [banReason, setBanReason] = useState("")
  const [banDuration, setBanDuration] = useState("")

  // Unban confirmation dialog state
  const [unbanModalOpened, { open: openUnbanModal, close: closeUnbanModal }] = useDisclosure(false)
  const [selectedUserForUnban, setSelectedUserForUnban] = useState<BannedUser | null>(null)

  // Search states
  const [searchTerm, setSearchTerm] = useState("")
  const [userSearchTerm, setUserSearchTerm] = useState("")

  const filteredBannedUsers = bannedUsers.filter((user) => {
    if (!searchTerm.trim()) return true

    const search = searchTerm.toLowerCase()
    const gamerTagId = user.gamer_tag_id?.toLowerCase() || ""
    const discordName = user.discord_name?.toLowerCase() || ""
    const email = user.email?.toLowerCase() || ""
    const gamerTag = user.gamer_tag?.toLowerCase() || ""

    return (
      gamerTagId.includes(search) || discordName.includes(search) || email.includes(search) || gamerTag.includes(search)
    )
  })

  const filteredUsers = users.filter((user) => {
    if (!userSearchTerm.trim()) return true

    const search = userSearchTerm.toLowerCase()
    const gamerTagId = user.gamer_tag_id?.toLowerCase() || ""
    const discordName = user.discord_name?.toLowerCase() || ""

    return gamerTagId.includes(search) || discordName.includes(search)
  })

  useEffect(() => {
    async function checkAuthorization() {
      if (!session?.user) {
        toast({
          title: "Unauthorized",
          description: "You must be logged in to access this page.",
          variant: "destructive",
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
          toast({
            title: "Access denied",
            description: "You don't have permission to access this page.",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        setIsAdmin(true)
        fetchBannedUsers()
      } catch (error: any) {
        console.error("Error checking authorization:", error)
        toast({
          title: "Error",
          description: error.message || "An error occurred",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    checkAuthorization()
  }, [supabase, session, toast, router])

  // Realtime updates for banned_users changes
  useEffect(() => {
    const channel = supabase
      .channel("banned_users_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "banned_users" },
        () => {
          fetchBannedUsers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const fetchBannedUsers = async () => {
    setLoadingBannedUsers(true)
    try {
      const response = await fetch("/api/admin/banned-users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch banned users")
      }

      setBannedUsers(data.users || [])
    } catch (error: any) {
      console.error("Error fetching banned users:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to fetch banned users",
        color: "red",
        icon: <AlertCircle size={16} />
      })
    } finally {
      setLoadingBannedUsers(false)
    }
  }

  const handleUnban = async (userId: string) => {
    setUnbanning(userId)

    try {
      const response = await fetch("/api/admin/unban-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to unban user")
      }

      notifications.show({
        title: "Success",
        message: "User has been unbanned successfully",
        color: "green",
        icon: <UserCheck size={16} />
      })

      fetchBannedUsers()
      if (users.length > 0) {
        fetchUsers(currentPage)
      }
    } catch (error: any) {
      console.error("Unban user error:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to unban user",
        color: "red",
        icon: <AlertCircle size={16} />
      })
    } finally {
      setUnbanning(null)
    }
  }

  const openUnbanDialog = (user: BannedUser) => {
    setSelectedUserForUnban(user)
    openUnbanModal()
  }

  const confirmUnban = () => {
    if (selectedUserForUnban) {
      handleUnban(selectedUserForUnban.id)
      closeUnbanModal()
      setSelectedUserForUnban(null)
    }
  }

  const fetchUsers = async (page = 1) => {
    setLoadingUsers(true)
    try {
      const limit = userSearchTerm.trim() ? 100 : usersPerPage
      const offset = userSearchTerm.trim() ? 0 : (page - 1) * usersPerPage

      const response = await fetch(`/api/admin/users-list?page=${userSearchTerm.trim() ? 1 : page}&limit=${limit}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users")
      }

      setUsers(data.users || [])
      setTotalUsers(data.total || 0)
      if (!userSearchTerm.trim()) {
        setCurrentPage(page)
      }
    } catch (error: any) {
      console.error("Error fetching users:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to fetch users",
        color: "red",
        icon: <AlertCircle size={16} />
      })
    } finally {
      setLoadingUsers(false)
    }
  }

  const openBanDialog = (user: User) => {
    setSelectedUserForBan(user)
    openBanModal()
    setBanReason("")
    setBanDuration("")
  }

  const handleBanUser = async () => {
    if (!selectedUserForBan || !banReason.trim()) {
      notifications.show({
        title: "Error",
        message: "Please provide a ban reason",
        color: "red",
        icon: <AlertCircle size={16} />
      })
      return
    }

    if (!banDuration) {
      notifications.show({
        title: "Error",
        message: "Please select a ban duration",
        color: "red",
        icon: <AlertCircle size={16} />
      })
      return
    }

    setBanning(true)

    try {
      const response = await fetch("/api/admin/ban-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserForBan.id,
          banReason: banReason.trim(),
          banDuration: banDuration,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to ban user")
      }

      notifications.show({
        title: "Success",
        message: "User has been banned successfully",
        color: "green",
        icon: <Ban size={16} />
      })

      closeBanModal()
      setSelectedUserForBan(null)
      setBanReason("")
      setBanDuration("")

      fetchBannedUsers()
      fetchUsers(currentPage)
    } catch (error: any) {
      console.error("Ban user error:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to ban user",
        color: "red",
        icon: <AlertCircle size={16} />
      })
    } finally {
      setBanning(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isExpired = (expirationDate: string | null) => {
    if (!expirationDate) return false
    return new Date(expirationDate) < new Date()
  }

  const exportToCsv = () => {
    try {
      const headers = [
        'email',
        'gamer_tag',
        'gamer_tag_id',
        'discord_name',
        'ban_reason',
        'ban_expiration',
        'created_at',
      ]

      const rows = filteredBannedUsers.map(u => [
        u.email || '',
        u.gamer_tag || '',
        u.gamer_tag_id || '',
        u.discord_name || '',
        u.ban_reason || '',
        u.ban_expiration || '',
        u.created_at || '',
      ])

      const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `banned-users-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting CSV', err)
      notifications.show({
        title: 'Error',
        message: 'Failed to export CSV',
        color: 'red',
        icon: <AlertCircle size={16} />
      })
    }
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading Banned Users Management...</Text>
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
      {/* Hero Header Section */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-red-6) 0%, var(--mantine-color-orange-6) 100%)' }}>
        <Center>
          <Stack align="center" gap="md">
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <UserX size={40} />
            </ThemeIcon>
            <Title order={1} c="cyan" ta="center">
              Banned Users Management
            </Title>
            <Text size="lg" c="yellow" ta="center" maw={600}>
              Manage user access and maintain community standards. View, unban, and track banned users across the platform.
            </Text>
          </Stack>
        </Center>
      </Paper>

      {/* Main Content */}
      <Tabs defaultValue="banned" variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="banned" leftSection={<UserX size={16} />}>
            Banned Users ({filteredBannedUsers.length})
          </Tabs.Tab>
          <Tabs.Tab value="ban" leftSection={<Ban size={16} />}>
            Ban User ({filteredUsers.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="banned" pt="md">
          <Paper withBorder>
            {/* Header */}
            <Group justify="space-between" p="md">
              <div>
                <Title order={3}>Banned Users</Title>
                <Text c="cyan">View and manage banned users</Text>
              </div>
              <Group>
                <Button variant="outline" leftSection={<Download size={16} />} onClick={exportToCsv}>
                  Export CSV
                </Button>
                <Button leftSection={<RefreshCw size={16} />} onClick={fetchBannedUsers} loading={loadingBannedUsers}>
                  Refresh
                </Button>
              </Group>
            </Group>

            {/* Search */}
            <Group p="md" pt={0}>
              <TextInput
                placeholder="Search by gamer tag, discord name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftSection={<Search size={16} />}
                style={{ flex: 1 }}
              />
              <Button variant="subtle" leftSection={<X size={14} />} onClick={() => setSearchTerm("")}>
                Clear
              </Button>
            </Group>

            {/* Table */}
            {loadingBannedUsers ? (
              <Center p="xl">
                <Stack align="center">
                  <Loader />
                  <Text c="cyan">Loading banned users...</Text>
                </Stack>
              </Center>
            ) : filteredBannedUsers.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <UserX size={48} stroke={1} color="var(--mantine-color-blue-5)" />
                  <Text c="cyan">
                    {searchTerm ? `No banned users match "${searchTerm}"` : "No banned users found"}
                  </Text>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Clear search
                    </Button>
                  )}
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={800}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>User Details</Table.Th>
                      <Table.Th>Ban Reason</Table.Th>
                      <Table.Th>Expiration</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredBannedUsers.map((user) => (
                      <Table.Tr key={user.id}>
                        <Table.Td>
                          <Stack gap={4}>
                            {user.email && (
                              <Text fw={500} size="sm">{user.email}</Text>
                            )}
                            {user.gamer_tag_id && (
                              <Group gap="xs">
                                <Badge variant="light" color="blue" size="xs">GT</Badge>
                                <Text size="xs">{user.gamer_tag_id}</Text>
                              </Group>
                            )}
                            {user.discord_name && (
                              <Group gap="xs">
                                <Badge variant="light" color="green" size="xs">Discord</Badge>
                                <Text size="xs">{user.discord_name}</Text>
                              </Group>
                            )}
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={2} maw={200}>
                            {user.ban_reason}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          {user.ban_expiration ? (
                            <Group gap="xs">
                              <Clock size={14} />
                              <Text size="sm">{formatDate(user.ban_expiration)}</Text>
                            </Group>
                          ) : (
                            <Badge color="red" variant="filled" size="sm">Permanent</Badge>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {user.ban_expiration && isExpired(user.ban_expiration) ? (
                            <Badge color="orange" variant="light" size="sm">
                              Expired
                            </Badge>
                          ) : (
                            <Badge color="red" variant="filled" size="sm">Active</Badge>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Button
                            variant="light"
                            color="green"
                            size="xs"
                            leftSection={<UserCheck size={14} />}
                            onClick={() => openUnbanDialog(user)}
                            loading={unbanning === user.id}
                          >
                            {unbanning === user.id ? "Unbanning..." : "Unban"}
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

        <Tabs.Panel value="ban" pt="md">
          <Paper withBorder>
            <Group justify="space-between" p="md">
              <div>
                <Title order={3}>User Management</Title>
                <Text c="cyan">Ban users from the platform</Text>
              </div>
              <Button leftSection={<RefreshCw size={16} />} onClick={() => fetchUsers(1)} loading={loadingUsers}>
                Load Users
              </Button>
            </Group>

            {/* Search Users */}
            <Group p="md" pt={0}>
              <TextInput
                placeholder="Search users to ban..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                leftSection={<Search size={16} />}
                style={{ flex: 1 }}
              />
            </Group>

            {/* Users Table */}
            {loadingUsers ? (
              <Center p="xl">
                <Loader />
              </Center>
            ) : users.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <Users size={48} stroke={1} color="var(--mantine-color-blue-5)" />
                  <Text c="cyan">Click "Load Users" to see available users</Text>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={600}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>User</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredUsers.map((user) => (
                      <Table.Tr key={user.id}>
                        <Table.Td>
                          <Stack gap={4}>
                            <Text fw={500} size="sm">
                              {user.gamer_tag_id || 'No username'}
                            </Text>
                            {user.discord_name && (
                              <Text size="xs" c="cyan">Discord: {user.discord_name}</Text>
                            )}
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          {user.is_banned ? (
                            <Badge color="red" variant="filled" size="sm">Banned</Badge>
                          ) : (
                            <Badge color="green" variant="light" size="sm">Active</Badge>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {!user.is_banned && (
                            <Button
                              variant="light"
                              color="red"
                              size="xs"
                              leftSection={<Ban size={14} />}
                              onClick={() => openBanDialog(user)}
                            >
                              Ban User
                            </Button>
                          )}
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

      {/* Unban Confirmation Modal */}
      <Modal opened={unbanModalOpened} onClose={closeUnbanModal} title="Confirm Unban">
        {selectedUserForUnban && (
          <Stack>
            <Alert icon={<UserCheck size={16} />} color="green">
              You are about to unban {selectedUserForUnban.gamer_tag_id || selectedUserForUnban.email}
            </Alert>
            <Group justify="flex-end">
              <Button variant="outline" onClick={closeUnbanModal}>
                Cancel
              </Button>
              <Button color="green" onClick={confirmUnban}>
                Confirm Unban
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Ban User Modal */}
      <Modal opened={banModalOpened} onClose={closeBanModal} title="Ban User">
        {selectedUserForBan && (
          <Stack>
            <Alert icon={<AlertCircle size={16} />} color="red">
              You are about to ban {selectedUserForBan.gamer_tag_id || 'this user'}
            </Alert>
            <Textarea
              label="Ban Reason"
              placeholder="Enter reason for ban..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              required
            />
            <Select
              label="Ban Duration"
              placeholder="Select duration"
              value={banDuration}
              onChange={(value) => setBanDuration(value || "")}
              data={[
                { value: '1d', label: '1 Day' },
                { value: '7d', label: '7 Days' },
                { value: '30d', label: '30 Days' },
                { value: 'permanent', label: 'Permanent' },
              ]}
              required
            />
            <Group justify="flex-end">
              <Button variant="outline" onClick={closeBanModal}>
                Cancel
              </Button>
              <Button color="red" onClick={handleBanUser} loading={banning}>
                Ban User
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
