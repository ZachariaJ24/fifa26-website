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
  TextInput,
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
  Menu,
  Alert
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  Users,
  Search,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  UserCheck,
  UserX,
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Key,
  Settings
} from "lucide-react"

interface UserAccount {
  id: string
  email: string
  gamer_tag_id: string
  created_at: string
  email_confirmed_at?: string
  last_sign_in_at?: string
  is_banned: boolean
  ban_reason?: string
  roles: string[]
}

export default function UserAccountManagerPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserAccount[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  
  // Modals
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  const [resetPasswordModalOpened, { open: openResetPasswordModal, close: closeResetPasswordModal }] = useDisclosure(false)
  
  // Form states
  const [newEmail, setNewEmail] = useState("")
  const [newGamerTag, setNewGamerTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Fetch users with their roles and ban status
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select(`
          id,
          email,
          gamer_tag_id,
          created_at,
          email_confirmed_at,
          last_sign_in_at,
          banned_users(ban_reason),
          user_roles(role)
        `)
        .order("created_at", { ascending: false })

      if (usersError) throw usersError

      const formattedUsers = usersData?.map(user => ({
        id: user.id,
        email: user.email,
        gamer_tag_id: user.gamer_tag_id,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        is_banned: user.banned_users && user.banned_users.length > 0,
        ban_reason: user.banned_users?.[0]?.ban_reason,
        roles: user.user_roles?.map((r: any) => r.role) || []
      })) || []

      setUsers(formattedUsers)

    } catch (error: any) {
      console.error("Error fetching users:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch user accounts",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.gamer_tag_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditUser = (user: UserAccount) => {
    setSelectedUser(user)
    setNewEmail(user.email)
    setNewGamerTag(user.gamer_tag_id)
    openEditModal()
  }

  const handleUpdateUser = async () => {
    if (!selectedUser || !newEmail.trim() || !newGamerTag.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("users")
        .update({
          email: newEmail.trim(),
          gamer_tag_id: newGamerTag.trim()
        })
        .eq("id", selectedUser.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "User account updated successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeEditModal()
      fetchUsers()

    } catch (error: any) {
      console.error("Error updating user:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update user account",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = (user: UserAccount) => {
    setSelectedUser(user)
    openDeleteModal()
  }

  const confirmDeleteUser = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)
    try {
      // Delete user account (this will cascade to related tables)
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", selectedUser.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "User account deleted successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeDeleteModal()
      setSelectedUser(null)
      fetchUsers()

    } catch (error: any) {
      console.error("Error deleting user:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete user account",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = (user: UserAccount) => {
    setSelectedUser(user)
    openResetPasswordModal()
  }

  const sendPasswordReset = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(selectedUser.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Password reset email sent successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeResetPasswordModal()

    } catch (error: any) {
      console.error("Error sending password reset:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to send password reset email",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (user: UserAccount) => {
    if (user.is_banned) {
      return <Badge color="red" variant="light" size="sm">Banned</Badge>
    }
    if (!user.email_confirmed_at) {
      return <Badge color="orange" variant="light" size="sm">Unverified</Badge>
    }
    return <Badge color="green" variant="light" size="sm">Active</Badge>
  }

  const getRoleBadges = (roles: string[]) => {
    if (roles.length === 0) {
      return <Badge color="orange" variant="light" size="xs">No Roles</Badge>
    }
    return roles.map(role => (
      <Badge key={role} color="blue" variant="light" size="xs">
        {role}
      </Badge>
    ))
  }

  if (loading) {
    return (
      <Container size="xl" py="xl" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading User Accounts...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-green-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <Settings size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                User Account Manager
              </Title>
              <Text size="lg" c="yellow" >
                Advanced user account management and administration
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="dark.6">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="blue">{users.length}</Text>
              <Text size="sm" c="cyan">Total Users</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Search and Actions */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between" mb="md">
          <Title order={3}>User Accounts</Title>
          <Button leftSection={<RefreshCw size={16} />} onClick={fetchUsers}>
            Refresh
          </Button>
        </Group>

        <TextInput
          placeholder="Search by email or gamer tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftSection={<Search size={16} />}
          style={{ maxWidth: 400 }}
        />
      </Paper>

      {/* Users Table */}
      <Paper withBorder bg="dark.7">
        {filteredUsers.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <Users size={48} stroke={1} color="var(--mantine-color-blue-5)" />
              <Text c="cyan">
                {searchTerm ? `No users match "${searchTerm}"` : "No users found"}
              </Text>
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={1000}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Roles</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Last Sign In</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredUsers.map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      <div>
                        <Text fw={500}>{user.gamer_tag_id}</Text>
                        <Text size="sm" c="cyan">{user.email}</Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      {getStatusBadge(user)}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {getRoleBadges(user.roles)}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="cyan">
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Never'
                        }
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
                            onClick={() => handleEditUser(user)}
                          >
                            Edit Account
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<Key size={14} />}
                            onClick={() => handleResetPassword(user)}
                          >
                            Reset Password
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item 
                            leftSection={<Trash2 size={14} />}
                            color="red"
                            onClick={() => handleDeleteUser(user)}
                          >
                            Delete Account
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
      </Paper>

      {/* Edit User Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit User Account" size="md">
        {selectedUser && (
          <Stack>
            <Alert color="blue" variant="light">
              <Text fw={500}>Editing Account</Text>
              <Text size="sm">User ID: {selectedUser.id}</Text>
            </Alert>

            <TextInput
              label="Email Address"
              placeholder="user@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            
            <TextInput
              label="Gamer Tag"
              placeholder="Enter gamer tag"
              value={newGamerTag}
              onChange={(e) => setNewGamerTag(e.target.value)}
              required
            />

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} loading={isSubmitting}>
                Update Account
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Delete User Modal */}
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete User Account" size="sm">
        {selectedUser && (
          <Stack>
            <Alert icon={<AlertTriangle size={16} />} color="red" variant="light">
              <Text fw={600}>Permanent Deletion</Text>
              <Text size="sm">
                This will permanently delete the account for "{selectedUser.gamer_tag_id}" ({selectedUser.email}). 
                This action cannot be undone and will remove all associated data.
              </Text>
            </Alert>

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button color="red" onClick={confirmDeleteUser} loading={isSubmitting}>
                Delete Account
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Reset Password Modal */}
      <Modal opened={resetPasswordModalOpened} onClose={closeResetPasswordModal} title="Reset Password" size="sm">
        {selectedUser && (
          <Stack>
            <Alert color="blue" variant="light">
              <Text fw={500}>Password Reset</Text>
              <Text size="sm">
                Send a password reset email to "{selectedUser.email}". The user will receive instructions to create a new password.
              </Text>
            </Alert>

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeResetPasswordModal}>
                Cancel
              </Button>
              <Button onClick={sendPasswordReset} loading={isSubmitting}>
                Send Reset Email
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
