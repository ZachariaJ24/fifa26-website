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
  Alert,
  Progress,
  Tabs
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  Shield,
  Users,
  RefreshCw,
  Sync,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  Database,
  Zap
} from "lucide-react"

interface RoleSyncIssue {
  user_id: string
  email: string
  gamer_tag_id: string
  user_roles: string[]
  player_roles: string[]
  missing_in_players: string[]
  missing_in_user_roles: string[]
  issue_type: 'missing_player_roles' | 'missing_user_roles' | 'role_mismatch'
}

interface SyncResult {
  user_id: string
  action: string
  success: boolean
  error?: string
}

export default function RoleSyncPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [syncIssues, setSyncIssues] = useState<RoleSyncIssue[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncResults, setSyncResults] = useState<SyncResult[]>([])

  useEffect(() => {
    scanForRoleSyncIssues()
  }, [])

  const scanForRoleSyncIssues = async () => {
    try {
      setLoading(true)
      setSyncResults([])
      
      // Get all users with their roles from both tables
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select(`
          id,
          email,
          gamer_tag_id,
          user_roles(role),
          players(
            id,
            club_id,
            clubs(name)
          )
        `)

      if (usersError) throw usersError

      const issues: RoleSyncIssue[] = []

      for (const user of users || []) {
        const userRoles = user.user_roles?.map((ur: any) => ur.role) || []
        
        // Get player roles (derived from club membership, etc.)
        const playerRoles: string[] = []
        
        // If user has a player record, they should have 'Player' role
        if (user.players && user.players.length > 0) {
          playerRoles.push('Player')
          
          // Check if they're in a club
          const hasClub = user.players.some((p: any) => p.club_id && p.clubs?.name)
          if (hasClub) {
            playerRoles.push('Club Member')
          }
        }

        // Check for admin roles (this would need to be determined by your business logic)
        // For now, we'll assume existing user_roles are correct for admin roles
        const adminRoles = userRoles.filter(role => 
          ['Admin', 'Manager', 'Moderator'].includes(role)
        )
        
        // Find discrepancies
        const missingInPlayers = userRoles.filter(role => 
          !playerRoles.includes(role) && !adminRoles.includes(role)
        )
        const missingInUserRoles = playerRoles.filter(role => 
          !userRoles.includes(role)
        )

        // Determine issue type
        let issueType: RoleSyncIssue['issue_type'] | null = null
        if (missingInPlayers.length > 0) {
          issueType = 'missing_player_roles'
        } else if (missingInUserRoles.length > 0) {
          issueType = 'missing_user_roles'
        }

        // Only add if there are actual issues
        if (issueType && (missingInPlayers.length > 0 || missingInUserRoles.length > 0)) {
          issues.push({
            user_id: user.id,
            email: user.email,
            gamer_tag_id: user.gamer_tag_id,
            user_roles: userRoles,
            player_roles: playerRoles,
            missing_in_players: missingInPlayers,
            missing_in_user_roles: missingInUserRoles,
            issue_type: issueType
          })
        }
      }

      setSyncIssues(issues)

    } catch (error: any) {
      console.error("Error scanning for role sync issues:", error)
      notifications.show({
        title: "Error",
        message: "Failed to scan for role synchronization issues",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const fixAllRoleSync = async () => {
    if (syncIssues.length === 0) {
      notifications.show({
        title: "No Issues",
        message: "No role synchronization issues found to fix",
        color: "blue"
      })
      return
    }

    setIsSyncing(true)
    setSyncProgress(0)
    const results: SyncResult[] = []

    try {
      for (let i = 0; i < syncIssues.length; i++) {
        const issue = syncIssues[i]
        
        try {
          // Fix missing user roles
          for (const role of issue.missing_in_user_roles) {
            const { error } = await supabase
              .from("user_roles")
              .upsert({
                user_id: issue.user_id,
                role: role
              })

            if (error) throw error
          }

          // Note: We don't automatically remove roles as that could be destructive
          // Instead, we log what needs manual review

          results.push({
            user_id: issue.user_id,
            action: `Added roles: ${issue.missing_in_user_roles.join(', ')}`,
            success: true
          })

        } catch (error: any) {
          results.push({
            user_id: issue.user_id,
            action: 'Failed to sync roles',
            success: false,
            error: error.message
          })
        }

        setSyncProgress(((i + 1) / syncIssues.length) * 100)
      }

      setSyncResults(results)
      
      const successCount = results.filter(r => r.success).length
      notifications.show({
        title: "Sync Complete",
        message: `Fixed ${successCount} out of ${syncIssues.length} role sync issues`,
        color: successCount === syncIssues.length ? "green" : "orange",
        icon: <CheckCircle size={16} />
      })

      // Rescan for issues
      await scanForRoleSyncIssues()

    } catch (error: any) {
      console.error("Error fixing role sync:", error)
      notifications.show({
        title: "Sync Failed",
        message: "Failed to fix role synchronization issues",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSyncing(false)
      setSyncProgress(0)
    }
  }

  const getIssueTypeBadge = (type: string) => {
    const config: Record<string, { color: string; label: string }> = {
      'missing_player_roles': { color: 'orange', label: 'Missing Player Roles' },
      'missing_user_roles': { color: 'red', label: 'Missing User Roles' },
      'role_mismatch': { color: 'yellow', label: 'Role Mismatch' }
    }

    const { color, label } = config[type] || { color: 'gray', label: type }
    return <Badge color={color} variant="light" size="sm">{label}</Badge>
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Scanning for Role Sync Issues...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-violet-6) 0%, var(--mantine-color-blue-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <Sync size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Role Sync Fix
              </Title>
              <Text size="lg" c="yellow" >
                Fix role synchronization between user_roles and players tables
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="violet">{syncIssues.length}</Text>
              <Text size="sm" c="cyan">Sync Issues</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between">
          <Title order={3}>Role Synchronization Scanner</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={scanForRoleSyncIssues} disabled={isSyncing}>
              Scan Again
            </Button>
            <Button 
              leftSection={<Zap size={16} />} 
              onClick={fixAllRoleSync}
              loading={isSyncing}
              disabled={syncIssues.length === 0}
              color="violet"
            >
              Fix All Role Sync Issues
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Sync Progress */}
      {isSyncing && (
        <Paper withBorder p="md" mb="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Synchronizing Roles...</Text>
              <Text size="sm" c="cyan">{Math.round(syncProgress)}% complete</Text>
            </Group>
            <Progress value={syncProgress} size="lg" color="violet" />
          </Stack>
        </Paper>
      )}

      {/* Status Alert */}
      {syncIssues.length === 0 ? (
        <Alert color="green" variant="light" mb="lg">
          <Text fw={500}>Role Synchronization is Healthy</Text>
          <Text size="sm" mt="xs">
            All user roles are properly synchronized between user_roles and players tables.
          </Text>
        </Alert>
      ) : (
        <Alert color="orange" variant="light" mb="lg">
          <Text fw={500}>{syncIssues.length} Role Synchronization Issues Found</Text>
          <Text size="sm" mt="xs">
            These issues may cause inconsistent permissions and should be resolved.
          </Text>
        </Alert>
      )}

      {/* Statistics */}
      <Group mb="lg" grow>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="red" variant="light" mx="auto" mb="md">
            <AlertTriangle size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="red">
            {syncIssues.filter(i => i.issue_type === 'missing_user_roles').length}
          </Text>
          <Text size="sm" c="cyan">Missing User Roles</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
            <Users size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="orange">
            {syncIssues.filter(i => i.issue_type === 'missing_player_roles').length}
          </Text>
          <Text size="sm" c="cyan">Missing Player Roles</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="violet" variant="light" mx="auto" mb="md">
            <Shield size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="violet">{syncIssues.length}</Text>
          <Text size="sm" c="cyan">Total Issues</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
            <CheckCircle size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="green">
            {syncResults.filter(r => r.success).length}
          </Text>
          <Text size="sm" c="cyan">Fixed Issues</Text>
        </Card>
      </Group>

      {/* Role Sync Issues Tabs */}
      <Tabs defaultValue="issues" variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="issues" leftSection={<AlertTriangle size={16} />}>
            Sync Issues ({syncIssues.length})
          </Tabs.Tab>
          <Tabs.Tab value="results" leftSection={<CheckCircle size={16} />}>
            Fix Results ({syncResults.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="issues" pt="md">
          <Paper withBorder>
            <Group justify="space-between" p="md">
              <Title order={4}>Role Synchronization Issues</Title>
            </Group>

            {syncIssues.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <CheckCircle size={48} stroke={1} color="var(--mantine-color-green-5)" />
                  <Text c="green" fw={500}>No role sync issues found!</Text>
                  <Text c="cyan" size="sm">All roles are properly synchronized.</Text>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={1000}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>User</Table.Th>
                      <Table.Th>Issue Type</Table.Th>
                      <Table.Th>User Roles</Table.Th>
                      <Table.Th>Player Roles</Table.Th>
                      <Table.Th>Missing Roles</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {syncIssues.map((issue) => (
                      <Table.Tr key={issue.user_id}>
                        <Table.Td>
                          <div>
                            <Text fw={500}>{issue.gamer_tag_id}</Text>
                            <Text size="sm" c="cyan">{issue.email}</Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          {getIssueTypeBadge(issue.issue_type)}
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            {issue.user_roles.length > 0 ? (
                              issue.user_roles.map(role => (
                                <Badge key={role} color="blue" variant="light" size="xs">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <Badge color="cyan" variant="light" size="xs">No Roles</Badge>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            {issue.player_roles.length > 0 ? (
                              issue.player_roles.map(role => (
                                <Badge key={role} color="green" variant="light" size="xs">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <Badge color="cyan" variant="light" size="xs">No Roles</Badge>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Stack gap="xs">
                            {issue.missing_in_user_roles.length > 0 && (
                              <Group gap="xs">
                                <Text size="xs" c="red">Missing in user_roles:</Text>
                                {issue.missing_in_user_roles.map(role => (
                                  <Badge key={role} color="red" variant="light" size="xs">
                                    +{role}
                                  </Badge>
                                ))}
                              </Group>
                            )}
                            {issue.missing_in_players.length > 0 && (
                              <Group gap="xs">
                                <Text size="xs" c="orange">Extra in user_roles:</Text>
                                {issue.missing_in_players.map(role => (
                                  <Badge key={role} color="orange" variant="light" size="xs">
                                    -{role}
                                  </Badge>
                                ))}
                              </Group>
                            )}
                          </Stack>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="results" pt="md">
          <Paper withBorder>
            <Group justify="space-between" p="md">
              <Title order={4}>Fix Results</Title>
            </Group>

            {syncResults.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <Database size={48} stroke={1} color="var(--mantine-color-gray-5)" />
                  <Text c="cyan">No fix operations performed yet</Text>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={700}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>User ID</Table.Th>
                      <Table.Th>Action Taken</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {syncResults.map((result, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <Text size="sm" style={{ fontFamily: 'monospace' }}>
                            {result.user_id.slice(0, 8)}...
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{result.action}</Text>
                          {result.error && (
                            <Text size="xs" c="red">{result.error}</Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            color={result.success ? "green" : "red"} 
                            variant="light" 
                            size="sm"
                          >
                            {result.success ? "Success" : "Failed"}
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
      </Tabs>
    </Container>
  )
}
