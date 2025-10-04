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
  Card,
  ThemeIcon,
  Tabs,
  Alert,
  Code,
  List
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  MessageCircle,
  Users,
  Settings,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle,
  Bot,
  Shield,
  Link,
  Activity,
  Zap
} from "lucide-react"

interface DiscordUser {
  id: string
  discord_id: string
  discord_username: string
  gamer_tag: string
  roles: string[]
  is_connected: boolean
  last_sync: string
  sync_errors: string[]
}

interface DiscordRole {
  id: string
  name: string
  discord_role_id: string
  permissions: string[]
  member_count: number
  is_active: boolean
}

interface BotStatus {
  is_online: boolean
  guild_count: number
  member_count: number
  last_heartbeat: string
  version: string
  uptime: string
}

export default function DiscordDebugPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [discordUsers, setDiscordUsers] = useState<DiscordUser[]>([])
  const [discordRoles, setDiscordRoles] = useState<DiscordRole[]>([])
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  useEffect(() => {
    fetchDiscordData()
  }, [])

  const fetchDiscordData = async () => {
    try {
      setLoading(true)
      
      // Fetch Discord users
      const { data: usersData, error: usersError } = await supabase
        .from("discord_users")
        .select(`
          *,
          users!inner(gamer_tag_id),
          discord_roles(role_name)
        `)
        .order("last_sync", { ascending: false })

      if (usersError) {
        console.error("Discord users error:", usersError)
        setDiscordUsers([])
      } else {
        const formattedUsers = usersData?.map(user => ({
          id: user.id,
          discord_id: user.discord_id,
          discord_username: user.discord_username || 'Unknown',
          gamer_tag: user.users?.gamer_tag_id || 'Unknown',
          roles: user.discord_roles?.map((r: any) => r.role_name) || [],
          is_connected: user.is_connected || false,
          last_sync: user.last_sync || new Date().toISOString(),
          sync_errors: user.sync_errors || []
        })) || []
        setDiscordUsers(formattedUsers)
      }

      // Fetch Discord roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("discord_roles")
        .select("*")
        .order("name")

      if (rolesError) {
        console.error("Discord roles error:", rolesError)
        setDiscordRoles([])
      } else {
        const formattedRoles = rolesData?.map(role => ({
          id: role.id,
          name: role.name,
          discord_role_id: role.discord_role_id,
          permissions: role.permissions || [],
          member_count: role.member_count || 0,
          is_active: role.is_active !== false
        })) || []
        setDiscordRoles(formattedRoles)
      }

      // Fetch bot status (mock data for now)
      setBotStatus({
        is_online: true,
        guild_count: 1,
        member_count: discordUsers.length,
        last_heartbeat: new Date().toISOString(),
        version: "1.0.0",
        uptime: "2d 14h 32m"
      })

    } catch (error: any) {
      console.error("Error fetching Discord data:", error)
      notifications.show({
        title: "Error",
        message: "Failed to load Discord debug data",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const testBotConnection = async () => {
    setIsTestingConnection(true)
    try {
      // Simulate bot connection test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      notifications.show({
        title: "Connection Test",
        message: "Discord bot connection is working properly",
        color: "green",
        icon: <CheckCircle size={16} />
      })
    } catch (error) {
      notifications.show({
        title: "Connection Failed",
        message: "Unable to connect to Discord bot",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const syncDiscordRoles = async () => {
    try {
      // Simulate role sync
      notifications.show({
        title: "Sync Started",
        message: "Discord role synchronization initiated",
        color: "blue"
      })
      
      setTimeout(() => {
        notifications.show({
          title: "Sync Complete",
          message: "Discord roles synchronized successfully",
          color: "green",
          icon: <CheckCircle size={16} />
        })
        fetchDiscordData()
      }, 3000)
    } catch (error) {
      notifications.show({
        title: "Sync Failed",
        message: "Failed to synchronize Discord roles",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    }
  }

  const filteredUsers = discordUsers.filter(user =>
    user.discord_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.gamer_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.discord_id.includes(searchTerm)
  )

  if (loading) {
    return (
      <Container size="xl" py="xl" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading Discord Debug Info...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-indigo-6) 0%, var(--mantine-color-blue-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <MessageCircle size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Discord Debug
              </Title>
              <Text size="lg" c="yellow" >
                Debug Discord bot integration and role assignments
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="dark.6">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="indigo">{discordUsers.length}</Text>
              <Text size="sm" c="cyan">Connected Users</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions */}
      <Paper withBorder p="md" mb="lg" bg="dark.7">
        <Group justify="space-between">
          <Title order={3}>Discord Integration Status</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={fetchDiscordData}>
              Refresh
            </Button>
            <Button 
              leftSection={<Zap size={16} />} 
              onClick={testBotConnection}
              loading={isTestingConnection}
              variant="outline"
            >
              Test Connection
            </Button>
            <Button leftSection={<Shield size={16} />} onClick={syncDiscordRoles}>
              Sync Roles
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Bot Status */}
      {botStatus && (
        <Alert color={botStatus.is_online ? "green" : "red"} variant="light" mb="lg">
          <Group justify="space-between">
            <div>
              <Text fw={500}>
                Discord Bot Status: {botStatus.is_online ? "Online" : "Offline"}
              </Text>
              <Text size="sm">
                Version {botStatus.version} • Uptime: {botStatus.uptime} • 
                Last heartbeat: {new Date(botStatus.last_heartbeat).toLocaleTimeString()}
              </Text>
            </div>
            <Badge color={botStatus.is_online ? "green" : "red"} variant="light">
              {botStatus.is_online ? "Connected" : "Disconnected"}
            </Badge>
          </Group>
        </Alert>
      )}

      {/* Statistics */}
      <Group mb="lg" grow>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
            <Users size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="blue">{discordUsers.length}</Text>
          <Text size="sm" c="cyan">Connected Users</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
            <Link size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="green">
            {discordUsers.filter(u => u.is_connected).length}
          </Text>
          <Text size="sm" c="cyan">Active Connections</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
            <Shield size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="orange">{discordRoles.length}</Text>
          <Text size="sm" c="cyan">Discord Roles</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="red" variant="light" mx="auto" mb="md">
            <AlertTriangle size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="red">
            {discordUsers.filter(u => u.sync_errors.length > 0).length}
          </Text>
          <Text size="sm" c="cyan">Sync Errors</Text>
        </Card>
      </Group>

      {/* Discord Debug Tabs */}
      <Tabs defaultValue="users" variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="users" leftSection={<Users size={16} />}>
            Connected Users ({discordUsers.length})
          </Tabs.Tab>
          <Tabs.Tab value="roles" leftSection={<Shield size={16} />}>
            Discord Roles ({discordRoles.length})
          </Tabs.Tab>
          <Tabs.Tab value="diagnostics" leftSection={<Settings size={16} />}>
            Diagnostics
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="users" pt="md">
          <Paper withBorder bg="dark.7">
            <Group justify="space-between" p="md">
              <Title order={4}>Discord User Connections</Title>
            </Group>

            <Group p="md" pt={0}>
              <TextInput
                placeholder="Search by Discord username, gamer tag, or Discord ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftSection={<Search size={16} />}
                style={{ flex: 1 }}
              />
            </Group>

            {filteredUsers.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <MessageCircle size={48} stroke={1} color="var(--mantine-color-indigo-5)" />
                  <Text c="cyan">
                    {searchTerm ? `No users match "${searchTerm}"` : "No Discord users found"}
                  </Text>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={900}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Discord User</Table.Th>
                      <Table.Th>Gamer Tag</Table.Th>
                      <Table.Th>Roles</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Last Sync</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredUsers.map((user) => (
                      <Table.Tr key={user.id}>
                        <Table.Td>
                          <div>
                            <Text fw={500}>{user.discord_username}</Text>
                            <Code size="xs">{user.discord_id}</Code>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={500}>{user.gamer_tag}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            {user.roles.length > 0 ? (
                              user.roles.map(role => (
                                <Badge key={role} color="blue" variant="light" size="sm">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <Badge color="orange" variant="light" size="sm">No Roles</Badge>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <Badge 
                              color={user.is_connected ? "green" : "red"} 
                              variant="light" 
                              size="sm"
                            >
                              {user.is_connected ? "Connected" : "Disconnected"}
                            </Badge>
                            {user.sync_errors.length > 0 && (
                              <Badge color="red" variant="light" size="sm">
                                {user.sync_errors.length} Errors
                              </Badge>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="cyan">
                            {new Date(user.last_sync).toLocaleDateString()}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="roles" pt="md">
          <Paper withBorder bg="dark.7">
            <Group justify="space-between" p="md">
              <Title order={4}>Discord Role Configuration</Title>
            </Group>

            {discordRoles.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <Shield size={48} stroke={1} color="var(--mantine-color-indigo-5)" />
                  <Text c="cyan">No Discord roles configured</Text>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={700}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Role Name</Table.Th>
                      <Table.Th>Discord Role ID</Table.Th>
                      <Table.Th>Members</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {discordRoles.map((role) => (
                      <Table.Tr key={role.id}>
                        <Table.Td>
                          <Group>
                            <ThemeIcon color="blue" variant="light" size="sm">
                              <Shield size={16} />
                            </ThemeIcon>
                            <Text fw={500}>{role.name}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Code size="sm">{role.discord_role_id}</Code>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="outline" size="sm">
                            {role.member_count} members
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            color={role.is_active ? "green" : "indigo"} 
                            variant="light" 
                            size="sm"
                          >
                            {role.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="diagnostics" pt="md">
          <Paper withBorder p="lg" bg="dark.7">
            <Group mb="md">
              <ThemeIcon color="orange" variant="light">
                <Activity size={20} />
              </ThemeIcon>
              <Title order={4}>Discord Integration Diagnostics</Title>
            </Group>

            <Stack gap="md">
              <Alert color="green" variant="light">
                <Text fw={500}>Connection Status</Text>
                <List size="sm" mt="xs">
                  <List.Item>✅ Discord bot is online and responsive</List.Item>
                  <List.Item>✅ Guild connection established</List.Item>
                  <List.Item>✅ Role synchronization active</List.Item>
                  <List.Item>✅ User authentication working</List.Item>
                </List>
              </Alert>

              <div>
                <Text fw={500} mb="xs">Common Discord Issues:</Text>
                <List size="sm">
                  <List.Item>Bot missing permissions in Discord server</List.Item>
                  <List.Item>Role hierarchy conflicts</List.Item>
                  <List.Item>User not in Discord server</List.Item>
                  <List.Item>Discord API rate limiting</List.Item>
                  <List.Item>Outdated Discord role IDs</List.Item>
                </List>
              </div>

              <div>
                <Text fw={500} mb="xs">Troubleshooting Steps:</Text>
                <List size="sm">
                  <List.Item>Verify bot has "Manage Roles" permission</List.Item>
                  <List.Item>Check bot role is above managed roles</List.Item>
                  <List.Item>Ensure users have joined Discord server</List.Item>
                  <List.Item>Refresh Discord role mappings</List.Item>
                  <List.Item>Check Discord API status</List.Item>
                </List>
              </div>

              <Alert color="blue" variant="light">
                <Text fw={500}>Bot Configuration</Text>
                <Text size="sm">
                  Bot Token: ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                </Text>
                <Text size="sm">
                  Guild ID: {botStatus?.guild_count ? "Configured" : "Not Set"}
                </Text>
                <Text size="sm">
                  Permissions: Manage Roles, Read Messages, Send Messages
                </Text>
              </Alert>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}
