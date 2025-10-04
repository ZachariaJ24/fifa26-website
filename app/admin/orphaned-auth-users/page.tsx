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
  Paper,
  Stack,
  Group,
  Badge,
  Table,
  Loader,
  Center,
  Card,
  ThemeIcon,
  ActionIcon,
  Alert,
  Modal
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  UserX,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Users,
  Database,
  Link,
  Unlink,
  Search
} from "lucide-react"

interface OrphanedUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
  has_profile: boolean
}

export default function OrphanedAuthUsersPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [orphanedUsers, setOrphanedUsers] = useState<OrphanedUser[]>([])
  const [selectedUser, setSelectedUser] = useState<OrphanedUser | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Modals
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  const [cleanupModalOpened, { open: openCleanupModal, close: closeCleanupModal }] = useDisclosure(false)

  useEffect(() => {
    fetchOrphanedUsers()
  }, [])

  const fetchOrphanedUsers = async () => {
    try {
      setLoading(true)
      
      // Get all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      if (authError) throw authError

      // Get all users from our users table
      const { data: dbUsers, error: dbError } = await supabase
        .from("users")
        .select("id, email")

      if (dbError) throw dbError

      const dbUserIds = new Set(dbUsers?.map(u => u.id) || [])
      
      // Find orphaned auth users (exist in auth but not in users table)
      const orphaned = authUsers.users
        .filter(authUser => !dbUserIds.has(authUser.id))
        .map(authUser => ({
          id: authUser.id,
          email: authUser.email || 'No email',
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
          email_confirmed_at: authUser.email_confirmed_at,
          has_profile: false
        }))

      setOrphanedUsers(orphaned)

    } catch (error: any) {
      console.error("Error fetching orphaned users:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch orphaned auth users",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = (user: OrphanedUser) => {
    setSelectedUser(user)
    openDeleteModal()
  }

  const confirmDeleteUser = async () => {
    if (!selectedUser) return

    setIsProcessing(true)
    try {
      // Delete from auth
      const { error } = await supabase.auth.admin.deleteUser(selectedUser.id)
      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Orphaned user deleted successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeDeleteModal()
      setSelectedUser(null)
      fetchOrphanedUsers()

    } catch (error: any) {
      console.error("Error deleting orphaned user:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete orphaned user",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCleanupAll = () => {
    openCleanupModal()
  }

  const confirmCleanupAll = async () => {
    setIsProcessing(true)
    try {
      let deletedCount = 0
      
      for (const user of orphanedUsers) {
        try {
          await supabase.auth.admin.deleteUser(user.id)
          deletedCount++
        } catch (error) {
          console.error(`Failed to delete user ${user.email}:`, error)
        }
      }

      notifications.show({
        title: "Cleanup Complete",
        message: `Successfully deleted ${deletedCount} orphaned users`,
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeCleanupModal()
      fetchOrphanedUsers()

    } catch (error: any) {
      console.error("Error during cleanup:", error)
      notifications.show({
        title: "Error",
        message: "Some users could not be deleted",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const createUserProfile = async (user: OrphanedUser) => {
    try {
      // Create a basic user profile
      const { error } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email,
          gamer_tag_id: user.email.split('@')[0], // Use email prefix as default gamer tag
          created_at: user.created_at
        })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "User profile created successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      fetchOrphanedUsers()

    } catch (error: any) {
      console.error("Error creating user profile:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to create user profile",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    }
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading Orphaned Auth Users...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-red-6) 0%, var(--mantine-color-orange-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <UserX size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Orphaned Auth Users
              </Title>
              <Text size="lg" c="yellow" >
                Manage authentication users without corresponding database profiles
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="red">{orphanedUsers.length}</Text>
              <Text size="sm" c="cyan">Orphaned Users</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between">
          <Title order={3}>Orphaned Users Management</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={fetchOrphanedUsers}>
              Refresh
            </Button>
            {orphanedUsers.length > 0 && (
              <Button 
                leftSection={<Trash2 size={16} />} 
                color="red" 
                onClick={handleCleanupAll}
              >
                Cleanup All
              </Button>
            )}
          </Group>
        </Group>
      </Paper>

      {/* Info Alert */}
      <Alert color="blue" variant="light" mb="lg">
        <Text fw={500}>What are orphaned auth users?</Text>
        <Text size="sm" mt="xs">
          These are users who exist in Supabase Auth but don't have corresponding profiles in your users table. 
          This can happen when user registration fails partway through or during data migrations.
        </Text>
      </Alert>

      {/* Statistics */}
      <Group mb="lg" grow>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="red" variant="light" mx="auto" mb="md">
            <Unlink size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="red">{orphanedUsers.length}</Text>
          <Text size="sm" c="cyan">Orphaned Users</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
            <AlertTriangle size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="orange">
            {orphanedUsers.filter(u => !u.email_confirmed_at).length}
          </Text>
          <Text size="sm" c="cyan">Unverified</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="cyan" variant="light" mx="auto" mb="md">
            <Users size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="cyan">
            {orphanedUsers.filter(u => !u.last_sign_in_at).length}
          </Text>
          <Text size="sm" c="cyan">Never Signed In</Text>
        </Card>
      </Group>

      {/* Orphaned Users Table */}
      <Paper withBorder>
        {orphanedUsers.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <CheckCircle size={48} stroke={1} color="var(--mantine-color-green-5)" />
              <Text c="green" fw={500}>No orphaned auth users found!</Text>
              <Text c="cyan" size="sm">All authentication users have corresponding database profiles.</Text>
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Last Sign In</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {orphanedUsers.map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      <Group>
                        <ThemeIcon color="red" variant="light" size="sm">
                          <UserX size={16} />
                        </ThemeIcon>
                        <Text fw={500}>{user.email}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {user.email_confirmed_at ? (
                          <Badge color="green" variant="light" size="sm">Verified</Badge>
                        ) : (
                          <Badge color="orange" variant="light" size="sm">Unverified</Badge>
                        )}
                        <Badge color="red" variant="light" size="sm">No Profile</Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="cyan">
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
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          leftSection={<Link size={14} />}
                          onClick={() => createUserProfile(user)}
                        >
                          Create Profile
                        </Button>
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>

      {/* Delete User Modal */}
      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Orphaned User" size="sm">
        {selectedUser && (
          <Stack>
            <Alert icon={<AlertTriangle size={16} />} color="red" variant="light">
              <Text fw={600}>Permanent Deletion</Text>
              <Text size="sm">
                This will permanently delete the authentication record for "{selectedUser.email}". 
                This action cannot be undone.
              </Text>
            </Alert>

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeDeleteModal}>
                Cancel
              </Button>
              <Button color="red" onClick={confirmDeleteUser} loading={isProcessing}>
                Delete User
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Cleanup All Modal */}
      <Modal opened={cleanupModalOpened} onClose={closeCleanupModal} title="Cleanup All Orphaned Users" size="md">
        <Stack>
          <Alert icon={<AlertTriangle size={16} />} color="red" variant="light">
            <Text fw={600}>Mass Deletion Warning</Text>
            <Text size="sm">
              This will permanently delete ALL {orphanedUsers.length} orphaned authentication records. 
              This action cannot be undone.
            </Text>
          </Alert>

          <Text size="sm" c="cyan">
            Users to be deleted:
          </Text>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {orphanedUsers.slice(0, 10).map(user => (
              <Text key={user.id} size="sm">• {user.email}</Text>
            ))}
            {orphanedUsers.length > 10 && (
              <Text size="sm" c="cyan">... and {orphanedUsers.length - 10} more</Text>
            )}
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeCleanupModal}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmCleanupAll} loading={isProcessing}>
              Delete All ({orphanedUsers.length})
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}
