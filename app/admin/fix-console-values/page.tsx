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
  Alert,
  Progress
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  GamepadIcon as GameController,
  CheckCircle,
  RefreshCw,
  Wrench,
  AlertTriangle,
  Users,
  Monitor,
  Zap
} from "lucide-react"

interface InvalidConsoleUser {
  id: string
  email: string
  gamer_tag_id: string
  current_console: string
  suggested_console: string
  created_at: string
}

interface FixResult {
  user_id: string
  old_console: string
  new_console: string
  success: boolean
  error?: string
}

export default function FixConsoleValuesPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [invalidUsers, setInvalidUsers] = useState<InvalidConsoleUser[]>([])
  const [isFixing, setIsFixing] = useState(false)
  const [fixProgress, setFixProgress] = useState(0)
  const [fixResults, setFixResults] = useState<FixResult[]>([])

  const validConsoles = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch']

  useEffect(() => {
    scanForInvalidConsoles()
  }, [])

  const scanForInvalidConsoles = async () => {
    try {
      setLoading(true)
      setFixResults([])
      
      // Get all users with their console values
      const { data: users, error } = await supabase
        .from("users")
        .select("id, email, gamer_tag_id, console, created_at")
        .order("created_at", { ascending: false })

      if (error) throw error

      // Find users with invalid console values
      const invalidConsoleUsers = users?.filter(user => {
        return user.console && !validConsoles.includes(user.console)
      }).map(user => ({
        id: user.id,
        email: user.email,
        gamer_tag_id: user.gamer_tag_id,
        current_console: user.console,
        suggested_console: suggestConsole(user.console),
        created_at: user.created_at
      })) || []

      setInvalidUsers(invalidConsoleUsers)

    } catch (error: any) {
      console.error("Error scanning for invalid consoles:", error)
      notifications.show({
        title: "Error",
        message: "Failed to scan for invalid console values",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const suggestConsole = (invalidConsole: string): string => {
    const lower = invalidConsole.toLowerCase()
    
    if (lower.includes('pc') || lower.includes('computer') || lower.includes('steam')) {
      return 'PC'
    } else if (lower.includes('playstation') || lower.includes('ps') || lower.includes('sony')) {
      return 'PlayStation'
    } else if (lower.includes('xbox') || lower.includes('microsoft')) {
      return 'Xbox'
    } else if (lower.includes('nintendo') || lower.includes('switch')) {
      return 'Nintendo Switch'
    } else {
      return 'PC' // Default fallback
    }
  }

  const fixAllConsoleValues = async () => {
    if (invalidUsers.length === 0) {
      notifications.show({
        title: "No Issues",
        message: "No invalid console values found to fix",
        color: "blue"
      })
      return
    }

    setIsFixing(true)
    setFixProgress(0)
    const results: FixResult[] = []

    try {
      for (let i = 0; i < invalidUsers.length; i++) {
        const user = invalidUsers[i]
        
        try {
          const { error } = await supabase
            .from("users")
            .update({ console: user.suggested_console })
            .eq("id", user.id)

          if (error) throw error

          results.push({
            user_id: user.id,
            old_console: user.current_console,
            new_console: user.suggested_console,
            success: true
          })
        } catch (error: any) {
          results.push({
            user_id: user.id,
            old_console: user.current_console,
            new_console: user.suggested_console,
            success: false,
            error: error.message
          })
        }

        setFixProgress(((i + 1) / invalidUsers.length) * 100)
      }

      setFixResults(results)
      
      const successCount = results.filter(r => r.success).length
      notifications.show({
        title: "Fix Complete",
        message: `Fixed ${successCount} out of ${invalidUsers.length} invalid console values`,
        color: successCount === invalidUsers.length ? "green" : "orange",
        icon: <CheckCircle size={16} />
      })

      // Rescan for invalid consoles
      await scanForInvalidConsoles()

    } catch (error: any) {
      console.error("Error fixing console values:", error)
      notifications.show({
        title: "Fix Failed",
        message: "Failed to fix console values",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsFixing(false)
      setFixProgress(0)
    }
  }

  const fixSingleUser = async (user: InvalidConsoleUser, newConsole: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ console: newConsole })
        .eq("id", user.id)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: `Updated ${user.gamer_tag_id}'s console to ${newConsole}`,
        color: "green",
        icon: <CheckCircle size={16} />
      })

      // Refresh the list
      await scanForInvalidConsoles()

    } catch (error: any) {
      console.error("Error fixing single user:", error)
      notifications.show({
        title: "Error",
        message: `Failed to update console for ${user.gamer_tag_id}`,
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    }
  }

  const getConsoleBadgeColor = (console: string) => {
    const colors: Record<string, string> = {
      'PC': 'blue',
      'PlayStation': 'indigo',
      'Xbox': 'green',
      'Nintendo Switch': 'red'
    }
    return colors[console] || 'gray'
  }

  if (loading) {
    return (
      <Container size="xl" py="xl" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Scanning for Invalid Console Values...</Text>
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
              <GameController size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Fix Console Values
              </Title>
              <Text size="lg" c="yellow" >
                Fix invalid console values for users that failed to sync
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="dark.6">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="indigo">{invalidUsers.length}</Text>
              <Text size="sm" c="cyan">Invalid Consoles</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions */}
      <Paper withBorder p="md" mb="lg" bg="dark.7">
        <Group justify="space-between">
          <Title order={3}>Console Value Scanner</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={scanForInvalidConsoles} disabled={isFixing}>
              Scan Again
            </Button>
            <Button 
              leftSection={<Zap size={16} />} 
              onClick={fixAllConsoleValues}
              loading={isFixing}
              disabled={invalidUsers.length === 0}
              color="indigo"
            >
              Fix All Console Values
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Fix Progress */}
      {isFixing && (
        <Paper withBorder p="md" mb="lg" bg="dark.7">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Fixing Console Values...</Text>
              <Text size="sm" c="cyan">{Math.round(fixProgress)}% complete</Text>
            </Group>
            <Progress value={fixProgress} size="lg" color="indigo" />
          </Stack>
        </Paper>
      )}

      {/* Status Alert */}
      {invalidUsers.length === 0 ? (
        <Alert color="green" variant="light" mb="lg">
          <Text fw={500}>All Console Values Are Valid</Text>
          <Text size="sm" mt="xs">
            All user accounts have valid console values: {validConsoles.join(', ')}.
          </Text>
        </Alert>
      ) : (
        <Alert color="orange" variant="light" mb="lg">
          <Text fw={500}>{invalidUsers.length} Invalid Console Values Found</Text>
          <Text size="sm" mt="xs">
            These users have console values that don't match the expected format and may cause sync issues.
          </Text>
        </Alert>
      )}

      {/* Valid Console Values Info */}
      <Paper withBorder p="md" mb="lg" bg="dark.7">
        <Group mb="md">
          <ThemeIcon color="blue" variant="light">
            <Monitor size={20} />
          </ThemeIcon>
          <Title order={4}>Valid Console Values</Title>
        </Group>
        
        <Group>
          {validConsoles.map(console => (
            <Badge key={console} color={getConsoleBadgeColor(console)} variant="light" size="lg">
              {console}
            </Badge>
          ))}
        </Group>
      </Paper>

      {/* Statistics */}
      <Group mb="lg" grow>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
            <AlertTriangle size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="orange">{invalidUsers.length}</Text>
          <Text size="sm" c="cyan">Invalid Consoles</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
            <GameController size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="blue">
            {invalidUsers.filter(u => u.suggested_console === 'PC').length}
          </Text>
          <Text size="sm" c="cyan">Suggest PC</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
            <CheckCircle size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="green">
            {fixResults.filter(r => r.success).length}
          </Text>
          <Text size="sm" c="cyan">Fixed Users</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="red" variant="light" mx="auto" mb="md">
            <Users size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="red">
            {fixResults.filter(r => !r.success).length}
          </Text>
          <Text size="sm" c="cyan">Failed Fixes</Text>
        </Card>
      </Group>

      {/* Invalid Console Users Table */}
      <Paper withBorder mb="lg">
        <Group justify="space-between" p="md">
          <Title order={4}>Users with Invalid Console Values</Title>
        </Group>

        {invalidUsers.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <CheckCircle size={48} stroke={1} color="var(--mantine-color-green-5)" />
              <Text c="green" fw={500}>All console values are valid!</Text>
              <Text c="cyan" size="sm">No invalid console values found.</Text>
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={900}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Current Console</Table.Th>
                  <Table.Th>Suggested Console</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {invalidUsers.map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      <div>
                        <Text fw={500}>{user.gamer_tag_id}</Text>
                        <Text size="sm" c="cyan">{user.email}</Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="red" variant="light" size="sm">
                        {user.current_console}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getConsoleBadgeColor(user.suggested_console)} variant="light" size="sm">
                        {user.suggested_console}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="cyan">
                        {new Date(user.created_at).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Select
                          size="xs"
                          value={user.suggested_console}
                          data={validConsoles.map(console => ({ value: console, label: console }))}
                          onChange={(value) => {
                            if (value) {
                              fixSingleUser(user, value)
                            }
                          }}
                          style={{ width: 140 }}
                        />
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>

      {/* Fix Results */}
      {fixResults.length > 0 && (
        <Paper withBorder bg="dark.7">
          <Group justify="space-between" p="md">
            <Title order={4}>Fix Results</Title>
          </Group>

          <Table.ScrollContainer minWidth={700}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User ID</Table.Th>
                  <Table.Th>Old Console</Table.Th>
                  <Table.Th>New Console</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {fixResults.map((result, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <Text size="sm" style={{ fontFamily: 'monospace' }}>
                        {result.user_id.slice(0, 8)}...
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="red" variant="light" size="sm">
                        {result.old_console}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getConsoleBadgeColor(result.new_console)} variant="light" size="sm">
                        {result.new_console}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Badge 
                          color={result.success ? "green" : "red"} 
                          variant="light" 
                          size="sm"
                        >
                          {result.success ? "Fixed" : "Failed"}
                        </Badge>
                        {result.error && (
                          <Text size="xs" c="red">{result.error}</Text>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}
    </Container>
  )
}
