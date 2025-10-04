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
  Code
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Wrench,
  Database,
  Users,
  Shield,
  Zap
} from "lucide-react"

interface ConstraintViolation {
  id: string
  user_id: string
  email: string
  gamer_tag_id: string
  console_value: string
  violation_type: 'duplicate_gamer_tag' | 'invalid_console' | 'constraint_error'
  error_message: string
  created_at: string
}

interface FixResult {
  user_id: string
  violation_type: string
  action_taken: string
  success: boolean
  error?: string
}

export default function FixUserConstraintsPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [violations, setViolations] = useState<ConstraintViolation[]>([])
  const [isFixing, setIsFixing] = useState(false)
  const [fixProgress, setFixProgress] = useState(0)
  const [fixResults, setFixResults] = useState<FixResult[]>([])

  useEffect(() => {
    scanForViolations()
  }, [])

  const scanForViolations = async () => {
    try {
      setLoading(true)
      setFixResults([])
      
      // Scan for constraint violations
      const violationsFound: ConstraintViolation[] = []

      // Check for duplicate gamer tags
      const { data: duplicateGamerTags, error: duplicateError } = await supabase
        .from("users")
        .select("id, email, gamer_tag_id, console, created_at")
        .order("created_at")

      if (duplicateError) throw duplicateError

      // Find duplicates
      const gamerTagCounts = new Map<string, any[]>()
      duplicateGamerTags?.forEach(user => {
        if (!gamerTagCounts.has(user.gamer_tag_id)) {
          gamerTagCounts.set(user.gamer_tag_id, [])
        }
        gamerTagCounts.get(user.gamer_tag_id)?.push(user)
      })

      // Add duplicate violations
      gamerTagCounts.forEach((users, gamerTag) => {
        if (users.length > 1) {
          // Keep the first user, mark others as violations
          users.slice(1).forEach(user => {
            violationsFound.push({
              id: `dup_${user.id}`,
              user_id: user.id,
              email: user.email,
              gamer_tag_id: user.gamer_tag_id,
              console_value: user.console || 'unknown',
              violation_type: 'duplicate_gamer_tag',
              error_message: `Duplicate gamer tag: ${gamerTag}`,
              created_at: user.created_at
            })
          })
        }
      })

      // Check for invalid console values
      const validConsoles = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch']
      duplicateGamerTags?.forEach(user => {
        if (user.console && !validConsoles.includes(user.console)) {
          violationsFound.push({
            id: `console_${user.id}`,
            user_id: user.id,
            email: user.email,
            gamer_tag_id: user.gamer_tag_id,
            console_value: user.console,
            violation_type: 'invalid_console',
            error_message: `Invalid console value: ${user.console}`,
            created_at: user.created_at
          })
        }
      })

      setViolations(violationsFound)

    } catch (error: any) {
      console.error("Error scanning for violations:", error)
      notifications.show({
        title: "Error",
        message: "Failed to scan for constraint violations",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const fixAllViolations = async () => {
    if (violations.length === 0) {
      notifications.show({
        title: "No Issues",
        message: "No constraint violations found to fix",
        color: "blue"
      })
      return
    }

    setIsFixing(true)
    setFixProgress(0)
    const results: FixResult[] = []

    try {
      for (let i = 0; i < violations.length; i++) {
        const violation = violations[i]
        let result: FixResult

        try {
          if (violation.violation_type === 'duplicate_gamer_tag') {
            // Fix duplicate gamer tag by appending timestamp
            const newGamerTag = `${violation.gamer_tag_id}_${Date.now()}`
            
            const { error } = await supabase
              .from("users")
              .update({ gamer_tag_id: newGamerTag })
              .eq("id", violation.user_id)

            if (error) throw error

            result = {
              user_id: violation.user_id,
              violation_type: violation.violation_type,
              action_taken: `Renamed to: ${newGamerTag}`,
              success: true
            }
          } else if (violation.violation_type === 'invalid_console') {
            // Fix invalid console by setting to PC as default
            const { error } = await supabase
              .from("users")
              .update({ console: 'PC' })
              .eq("id", violation.user_id)

            if (error) throw error

            result = {
              user_id: violation.user_id,
              violation_type: violation.violation_type,
              action_taken: 'Set console to PC',
              success: true
            }
          } else {
            result = {
              user_id: violation.user_id,
              violation_type: violation.violation_type,
              action_taken: 'No action available',
              success: false,
              error: 'Unknown violation type'
            }
          }
        } catch (error: any) {
          result = {
            user_id: violation.user_id,
            violation_type: violation.violation_type,
            action_taken: 'Failed to fix',
            success: false,
            error: error.message
          }
        }

        results.push(result)
        setFixProgress(((i + 1) / violations.length) * 100)
      }

      setFixResults(results)
      
      const successCount = results.filter(r => r.success).length
      notifications.show({
        title: "Fix Complete",
        message: `Fixed ${successCount} out of ${violations.length} violations`,
        color: successCount === violations.length ? "green" : "orange",
        icon: <CheckCircle size={16} />
      })

      // Rescan for violations
      await scanForViolations()

    } catch (error: any) {
      console.error("Error fixing violations:", error)
      notifications.show({
        title: "Fix Failed",
        message: "Failed to fix constraint violations",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsFixing(false)
      setFixProgress(0)
    }
  }

  const getViolationBadge = (type: string) => {
    const config: Record<string, { color: string; label: string }> = {
      'duplicate_gamer_tag': { color: 'red', label: 'Duplicate Tag' },
      'invalid_console': { color: 'orange', label: 'Invalid Console' },
      'constraint_error': { color: 'yellow', label: 'Constraint Error' }
    }

    const { color, label } = config[type] || { color: 'gray', label: type }
    return <Badge color={color} variant="light" size="sm">{label}</Badge>
  }

  if (loading) {
    return (
      <Container size="xl" py="xl" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Scanning for Constraint Violations...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-orange-6) 0%, var(--mantine-color-red-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <Wrench size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Fix User Constraints
              </Title>
              <Text size="lg" c="yellow" >
                Fix console and gamer tag constraint violations for user sync
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="dark.6">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="red">{violations.length}</Text>
              <Text size="sm" c="cyan">Violations Found</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between">
          <Title order={3}>Constraint Violation Scanner</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={scanForViolations} disabled={isFixing}>
              Scan Again
            </Button>
            <Button 
              leftSection={<Zap size={16} />} 
              onClick={fixAllViolations}
              loading={isFixing}
              disabled={violations.length === 0}
              color="orange"
            >
              Fix All Violations
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Fix Progress */}
      {isFixing && (
        <Paper withBorder p="md" mb="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Fixing Constraint Violations...</Text>
              <Text size="sm" c="cyan">{Math.round(fixProgress)}% complete</Text>
            </Group>
            <Progress value={fixProgress} size="lg" color="orange" />
          </Stack>
        </Paper>
      )}

      {/* Status Alert */}
      {violations.length === 0 ? (
        <Alert color="green" variant="light" mb="lg">
          <Text fw={500}>No Constraint Violations Found</Text>
          <Text size="sm" mt="xs">
            All user accounts are properly configured with unique gamer tags and valid console values.
          </Text>
        </Alert>
      ) : (
        <Alert color="red" variant="light" mb="lg">
          <Text fw={500}>{violations.length} Constraint Violations Detected</Text>
          <Text size="sm" mt="xs">
            These violations may prevent proper user synchronization and should be fixed immediately.
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
            {violations.filter(v => v.violation_type === 'duplicate_gamer_tag').length}
          </Text>
          <Text size="sm" c="cyan">Duplicate Tags</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
            <Shield size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="orange">
            {violations.filter(v => v.violation_type === 'invalid_console').length}
          </Text>
          <Text size="sm" c="cyan">Invalid Consoles</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
            <Database size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="blue">{violations.length}</Text>
          <Text size="sm" c="cyan">Total Violations</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
            <CheckCircle size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="green">
            {fixResults.filter(r => r.success).length}
          </Text>
          <Text size="sm" c="cyan">Fixed Issues</Text>
        </Card>
      </Group>

      {/* Violations Table */}
      <Paper withBorder mb="lg">
        <Group justify="space-between" p="md">
          <Title order={4}>Constraint Violations</Title>
        </Group>

        {violations.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <CheckCircle size={48} stroke={1} color="var(--mantine-color-green-5)" />
              <Text c="green" fw={500}>No constraint violations found!</Text>
              <Text c="cyan" size="sm">All user accounts are properly configured.</Text>
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Violation Type</Table.Th>
                  <Table.Th>Current Value</Table.Th>
                  <Table.Th>Error Message</Table.Th>
                  <Table.Th>Created</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {violations.map((violation) => (
                  <Table.Tr key={violation.id}>
                    <Table.Td>
                      <div>
                        <Text fw={500}>{violation.gamer_tag_id}</Text>
                        <Text size="sm" c="cyan">{violation.email}</Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      {getViolationBadge(violation.violation_type)}
                    </Table.Td>
                    <Table.Td>
                      <Code size="sm">{violation.console_value}</Code>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="red">{violation.error_message}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="cyan">
                        {new Date(violation.created_at).toLocaleDateString()}
                      </Text>
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
                  <Table.Th>Violation Type</Table.Th>
                  <Table.Th>Action Taken</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {fixResults.map((result, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <Code size="sm">{result.user_id.slice(0, 8)}...</Code>
                    </Table.Td>
                    <Table.Td>
                      {getViolationBadge(result.violation_type)}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{result.action_taken}</Text>
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
                        {result.success ? "Fixed" : "Failed"}
                      </Badge>
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
