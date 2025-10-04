"use client"

import { useState, useEffect } from "react"
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
  Avatar,
  Paper,
  Stack,
  Loader,
  Center,
  Pagination,
  ActionIcon,
  Menu,
  Modal,
  Textarea,
  Switch,
  Alert,
  Card,
  Divider,
  Flex,
  Box
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  Users as IconUsers,
  Search as IconSearch,
  RefreshCw as IconRefresh,
  Plus as IconPlus,
  Download as IconDownload,
  MoreHorizontal as IconDots,
  Edit as IconEdit,
  Trash2 as IconTrash,
  Shield as IconShield,
  Ban as IconBan,
  UserCheck as IconUserCheck,
  Filter as IconFilter,
  X as IconX,
  AlertCircle as IconAlertCircle,
  Check as IconCheck
} from 'lucide-react'

interface User {
  id: string
  email: string
  gamer_tag_id?: string
  discord_name?: string
  primary_position?: string
  secondary_position?: string
  console?: string
  is_active?: boolean
  is_banned?: boolean
  ban_reason?: string
  ban_expiration?: string
  last_login_at?: string
  created_at: string
  user_roles?: Array<{ role: string }>
  clubs?: Array<{ id: string; name: string }>
}

interface Club {
  id: string
  name: string
}

export default function UsersPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [users, setUsers] = useState<User[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [clubFilter, setClubFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [banModalOpened, { open: openBanModal, close: closeBanModal }] = useDisclosure(false)
  
  const itemsPerPage = 25

  // Fetch users and clubs on component mount
  useEffect(() => {
    fetchUsers()
    fetchClubs()
  }, [currentPage, searchQuery, roleFilter, clubFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('users')
        .select(`
          *,
          user_roles(role),
          clubs(id, name)
        `)

      // Apply filters
      if (searchQuery) {
        query = query.or(`email.ilike.%${searchQuery}%,gamer_tag_id.ilike.%${searchQuery}%,discord_name.ilike.%${searchQuery}%`)
      }

      if (statusFilter === 'active') {
        query = query.eq('is_active', true).is('ban_reason', null)
      } else if (statusFilter === 'banned') {
        query = query.not('ban_reason', 'is', null)
      } else if (statusFilter === 'inactive') {
        query = query.eq('is_active', false)
      }

      // Get total count for pagination
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const { data: usersData, error: usersError } = await query
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
        .order('created_at', { ascending: false })
      
      if (usersError) throw usersError
      
      setUsers(usersData || [])
      setTotalUsers(count || 0)
    } catch (error) {
      console.error('Error fetching users:', error)
      notifications.show({
        title: "Error",
        message: "Failed to load users. Please try again.",
        color: "red",
        icon: <IconAlertCircle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchClubs = async () => {
    const { data, error } = await supabase
      .from('clubs')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
    
    if (error) {
      console.error('Error fetching clubs:', error)
      return
    }

    setClubs(data || [])
  }

  const handleRefresh = () => {
    fetchUsers()
  }

  const handleExportCSV = () => {
    const headers = ['Email', 'Gamer Tag', 'Discord', 'Position', 'Console', 'Club', 'Status', 'Created']
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        `"${user.email}"`,
        `"${user.gamer_tag_id || 'N/A'}"`,
        `"${user.discord_name || 'N/A'}"`,
        `"${user.primary_position || 'N/A'}"`,
        `"${user.console || 'N/A'}"`,
        `"${user.clubs?.[0]?.name || 'No Club'}"`,
        `"${user.is_banned ? 'Banned' : user.is_active ? 'Active' : 'Inactive'}"`,
        `"${new Date(user.created_at).toLocaleDateString()}"`
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setRoleFilter(null)
    setClubFilter(null)
    setStatusFilter(null)
    setCurrentPage(1)
  }

  const getRoleBadge = (roles: Array<{ role: string }>) => {
    if (!roles || roles.length === 0) {
      return <Badge variant="outline" size="sm">No Role</Badge>
    }

    return roles.map((roleObj, index) => {
      const role = roleObj.role.toLowerCase()
      let color = 'gray'
      
      if (role === 'admin') color = 'red'
      else if (role === 'gm' || role === 'agm') color = 'blue'
      else if (role === 'owner') color = 'yellow'
      else if (role === 'player') color = 'green'
      else color = 'blue'

      return (
        <Badge key={index} variant="light" color={color} size="sm">
          {roleObj.role}
        </Badge>
      )
    })
  }

  const getStatusBadge = (user: User) => {
    if (user.is_banned) {
      return <Badge color="red" variant="filled" size="sm">Banned</Badge>
    }
    if (!user.is_active) {
      return <Badge color="orange" variant="outline" size="sm">Inactive</Badge>
    }
    return <Badge color="green" variant="light" size="sm">Active</Badge>
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    openEditModal()
  }

  const handleBanUser = (user: User) => {
    setSelectedUser(user)
    openBanModal()
  }

  const totalPages = Math.ceil(totalUsers / itemsPerPage)

  if (loading && users.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="blue">Loading users...</Text>
          </Stack>
        </Center>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-4">
      {/* Header */}
      <Paper p="lg" mb="lg" withBorder>
        <Group justify="space-between" mb="md">
          <div>
            <Title order={2}>User Management</Title>
            <Text c="blue">Manage user accounts, roles, and team assignments</Text>
          </div>
          <Group>
            <Button variant="outline" leftSection={<IconDownload size={16} />} onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button leftSection={<IconRefresh size={16} />} onClick={handleRefresh} loading={loading}>
              Refresh
            </Button>
            <Button leftSection={<IconPlus size={16} />}>
              Add User
            </Button>
          </Group>
        </Group>

        {/* Filters */}
        <Card withBorder p="md">
          <Group mb="md">
            <Text fw={500}>Filters</Text>
            <Button variant="subtle" size="xs" leftSection={<IconX size={14} />} onClick={clearFilters}>
              Clear All
            </Button>
          </Group>
          
          <Group>
            <TextInput
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftSection={<IconSearch size={16} />}
              style={{ minWidth: 250 }}
            />
            
            <Select
              placeholder="All Roles"
              value={roleFilter}
              onChange={setRoleFilter}
              data={[
                { value: 'Admin', label: 'Admin' },
                { value: 'Owner', label: 'Owner' },
                { value: 'GM', label: 'GM' },
                { value: 'AGM', label: 'AGM' },
                { value: 'Player', label: 'Player' },
              ]}
              clearable
            />
            
            <Select
              placeholder="All Clubs"
              value={clubFilter}
              onChange={setClubFilter}
              data={clubs.map(club => ({ value: club.id, label: club.name }))}
              clearable
            />
            
            <Select
              placeholder="All Status"
              value={statusFilter}
              onChange={setStatusFilter}
              data={[
                { value: 'active', label: 'Active' },
                { value: 'banned', label: 'Banned' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              clearable
            />
          </Group>
        </Card>
      </Paper>

      {/* Users Table */}
      <Paper withBorder>
        <Group justify="space-between" p="md">
          <Text fw={500}>
            Users ({totalUsers} total)
          </Text>
          <Text size="sm" c="blue">
            Page {currentPage} of {totalPages}
          </Text>
        </Group>
        
        <Divider />

        {loading ? (
          <Center p="xl">
            <Loader />
          </Center>
        ) : users.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <IconUsers size={48} stroke={1} color="var(--mantine-color-blue-5)" />
              <Text c="blue">No users found</Text>
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Roles</Table.Th>
                  <Table.Th>Club</Table.Th>
                  <Table.Th>Position</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Last Active</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      <Group>
                        <Avatar size="sm" color="blue">
                          {user.gamer_tag_id?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </Avatar>
                        <div>
                          <Text fw={500} size="sm">
                            {user.gamer_tag_id || 'No username'}
                          </Text>
                          <Text size="xs" c="blue">
                            {user.email}
                          </Text>
                          {user.discord_name && (
                            <Text size="xs" c="blue">
                              Discord: {user.discord_name}
                            </Text>
                          )}
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {getRoleBadge(user.user_roles || [])}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {user.clubs?.[0] ? (
                        <Badge variant="light" color="blue" size="sm">
                          {user.clubs[0].name}
                        </Badge>
                      ) : (
                        <Text size="sm" c="blue">No club</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        {user.primary_position && (
                          <Badge variant="outline" size="xs">
                            {user.primary_position}
                          </Badge>
                        )}
                        {user.secondary_position && (
                          <Badge variant="outline" size="xs" c="blue">
                            {user.secondary_position}
                          </Badge>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      {getStatusBadge(user)}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="blue">
                        {user.last_login_at 
                          ? new Date(user.last_login_at).toLocaleDateString() 
                          : 'Never'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item 
                            leftSection={<IconEdit size="14" />}
                            onClick={() => handleEditUser(user)}
                          >
                            Edit User
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IconShield size="14" />}
                          >
                            Manage Roles
                          </Menu.Item>
                          <Menu.Divider />
                          {user.is_banned ? (
                            <Menu.Item 
                              leftSection={<IconUserCheck size="14" />}
                              color="green"
                            >
                              Unban User
                            </Menu.Item>
                          ) : (
                            <Menu.Item 
                              leftSection={<IconBan size="14" />}
                              color="red"
                              onClick={() => handleBanUser(user)}
                            >
                              Ban User
                            </Menu.Item>
                          )}
                          <Menu.Item 
                            leftSection={<IconTrash size="14" />}
                            color="red"
                          >
                            Delete User
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

        {totalPages > 1 && (
          <Group justify="center" p="md">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
              size="sm"
            />
          </Group>
        )}
      </Paper>

      {/* Edit User Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title="Edit User"
        size="md"
      >
        {selectedUser && (
          <Stack>
            <TextInput
              label="Email"
              value={selectedUser.email}
              disabled
            />
            <TextInput
              label="Gamer Tag"
              value={selectedUser.gamer_tag_id || ''}
            />
            <TextInput
              label="Discord Name"
              value={selectedUser.discord_name || ''}
            />
            <Group grow>
              <Select
                label="Primary Position"
                value={selectedUser.primary_position || ''}
                data={['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST']}
              />
              <Select
                label="Console"
                value={selectedUser.console || ''}
                data={['Xbox', 'PS5']}
              />
            </Group>
            <Switch
              label="Active User"
              checked={selectedUser.is_active}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button>
                Save Changes
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Ban User Modal */}
      <Modal
        opened={banModalOpened}
        onClose={closeBanModal}
        title="Ban User"
        size="md"
      >
        {selectedUser && (
          <Stack>
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              You are about to ban {selectedUser.gamer_tag_id || selectedUser.email}
            </Alert>
            <Textarea
              label="Ban Reason"
              placeholder="Enter reason for ban..."
              required
            />
            <Select
              label="Ban Duration"
              data={[
                { value: '1d', label: '1 Day' },
                { value: '7d', label: '7 Days' },
                { value: '30d', label: '30 Days' },
                { value: 'permanent', label: 'Permanent' },
              ]}
              required
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeBanModal}>
                Cancel
              </Button>
              <Button color="red">
                Ban User
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  )
}
