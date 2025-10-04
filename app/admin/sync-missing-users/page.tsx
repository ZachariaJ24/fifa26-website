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
  Card,
  ThemeIcon,
  Alert,
  Progress,
  Loader,
  Center,
  Table,
  Badge
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  RefreshCw,
  Sync,
  Users,
  Database,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  Activity
} from "lucide-react"

interface MissingUser {
  id: string
  email: string
  created_at: string
  email_confirmed_at?: string
  last_sign_in_at?: string
}

interface SyncStats {
  totalAuthUsers: number
  totalDbUsers: number
  missingUsers: number
  syncedUsers: number
}

export default function SyncMissingUsersPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [missingUsers, setMissingUsers] = useState<MissingUser[]>([])
  const [stats, setStats] = useState<SyncStats>({
    totalAuthUsers: 0,
    totalDbUsers: 0,
    missingUsers: 0,
    syncedUsers: 0
  })
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  useEffect(() => {
    checkMissingUsers()
  }, [])

  const checkMissingUsers = async () => {
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
      
      // Find missing users (exist in auth but not in users table)
      const missing = authUsers.users
        .filter(authUser => !dbUserIds.has(authUser.id))
        .map(authUser => ({
          id: authUser.id,
          email: authUser.email || 'No email',
          created_at: authUser.created_at,
          email_confirmed_at: authUser.email_confirmed_at,
          last_sign_in_at: authUser.last_sign_in_at
        }))

      setMissingUsers(missing)
      setStats({
        totalAuthUsers: authUsers.users.length,
        totalDbUsers: dbUsers?.length || 0,
        missingUsers: missing.length,
        syncedUsers: 0
      })

    } catch (error: any) {
      console.error("Error checking missing users:", error)
      notifications.show({
        title: "Error",
        message: "Failed to check missing users",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const syncMissingUsers = async () => {
    if (missingUsers.length === 0) {
      notifications.show({
        title: "No Action Needed",
        message: "All auth users already have database profiles",
        color: "blue"
      })
      return
    }

    setSyncing(true)
    setSyncProgress(0)
    let syncedCount = 0

    try {
      for (let i = 0; i < missingUsers.length; i++) {
        const user = missingUsers[i]
        
        try {
          // Create user profile in database
          const { error } = await supabase
            .from("users")
            .insert({
              id: user.id,
              email: user.email,
              gamer_tag_id: user.email.split('@')[0], // Use email prefix as default
              created_at: user.created_at,
              email_confirmed_at: user.email_confirmed_at,
              last_sign_in_at: user.last_sign_in_at
            })

          if (!error) {
            syncedCount++
          } else {
            console.error(`Failed to sync user ${user.email}:`, error)
          }
        } catch (userError) {
          console.error(`Error syncing user ${user.email}:`, userError)
        }

        // Update progress
        setSyncProgress(((i + 1) / missingUsers.length) * 100)
      }

      setStats(prev => ({ ...prev, syncedUsers: syncedCount }))
      setLastSyncTime(new Date().toISOString())

      notifications.show({
        title: "Sync Complete",
        message: `Successfully synced ${syncedCount} out of ${missingUsers.length} users`,
        color: syncedCount === missingUsers.length ? "green" : "orange",
        icon: <CheckCircle size={16} />
      })

      // Refresh the missing users list
      await checkMissingUsers()

    } catch (error: any) {
      console.error("Error during sync:", error)
      notifications.show({
        title: "Sync Error",
        message: "Some users could not be synced",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setSyncing(false)
      setSyncProgress(0)
    }
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Checking Missing Users...</Text>
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
              <Sync size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Sync Missing Users
              </Title>
              <Text size="lg" c="yellow" >
                Synchronize authentication users with database profiles
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="blue">{stats.missingUsers}</Text>
              <Text size="sm" c="cyan">Missing Users</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between">
          <Title order={3}>User Synchronization</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={checkMissingUsers} disabled={syncing}>
              Check Again
            </Button>
            <Button 
              leftSection={<Sync size={16} />} 
              onClick={syncMissingUsers}
              loading={syncing}
              disabled={missingUsers.length === 0}
            >
              Sync Missing Users
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Sync Progress */}
      {syncing && (
        <Paper withBorder p="md" mb="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Synchronizing Users...</Text>
              <Text size="sm" c="cyan">{Math.round(syncProgress)}% complete</Text>
            </Group>
            <Progress value={syncProgress} size="lg" />
          </Stack>
        </Paper>
      )}

      {/* Info Alert */}
      <Alert color="blue" variant="light" mb="lg">
        <Text fw={500}>What does this tool do?</Text>
        <Text size="sm" mt="xs">
          This tool finds users who exist in Supabase Auth but don't have corresponding profiles in your users table. 
          It creates database profiles for these users to ensure data consistency.
        </Text>
      </Alert>

      {/* Statistics */}
      <Group mb="lg" grow>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
            <Users size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="blue">{stats.totalAuthUsers}</Text>
          <Text size="sm" c="cyan">Auth Users</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
            <Database size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="green">{stats.totalDbUsers}</Text>
          <Text size="sm" c="cyan">DB Profiles</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
            <AlertTriangle size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="orange">{stats.missingUsers}</Text>
          <Text size="sm" c="cyan">Missing</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="purple" variant="light" mx="auto" mb="md">
            <Activity size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="purple">{stats.syncedUsers}</Text>
          <Text size="sm" c="cyan">Last Synced</Text>
        </Card>
      </Group>

      {/* Last Sync Info */}
      {lastSyncTime && (
        <Alert color="green" variant="light" mb="lg">
          <Text fw={500}>Last Sync Completed</Text>
          <Text size="sm">
            {new Date(lastSyncTime).toLocaleString()} - {stats.syncedUsers} users synchronized
          </Text>
        </Alert>
      )}

      {/* Missing Users Table */}
      <Paper withBorder>
        <Group justify="space-between" p="md">
          <Title order={4}>Missing Users</Title>
          {missingUsers.length > 0 && (
            <Badge color="orange" variant="light">
              {missingUsers.length} users need sync
            </Badge>
          )}
        </Group>

        {missingUsers.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <CheckCircle size={48} stroke={1} color="var(--mantine-color-green-5)" />
              <Text c="green" fw={500}>All users are synchronized!</Text>
              <Text c="cyan" size="sm">
                Every authentication user has a corresponding database profile.
              </Text>
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={600}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Last Sign In</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {missingUsers.map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      <Group>
                        <ThemeIcon color="orange" variant="light" size="sm">
                          <UserPlus size={16} />
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
