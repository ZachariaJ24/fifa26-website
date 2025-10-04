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
  Tabs,
  List
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  RefreshCw,
  Database,
  Users,
  CheckCircle,
  AlertTriangle,
  Activity,
  ArrowRightLeft,
  Shield,
  Key
} from "lucide-react"

interface SyncResult {
  type: 'success' | 'error' | 'warning'
  message: string
  details?: string
}

interface SyncStats {
  authUsers: number
  dbUsers: number
  missingProfiles: number
  orphanedProfiles: number
  emailMismatches: number
}

export default function SyncAuthDatabasePageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncResults, setSyncResults] = useState<SyncResult[]>([])
  const [stats, setStats] = useState<SyncStats>({
    authUsers: 0,
    dbUsers: 0,
    missingProfiles: 0,
    orphanedProfiles: 0,
    emailMismatches: 0
  })
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  useEffect(() => {
    analyzeSyncStatus()
  }, [])

  const analyzeSyncStatus = async () => {
    try {
      setLoading(true)
      setSyncResults([])
      
      // Get all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      if (authError) throw authError

      // Get all database users
      const { data: dbUsers, error: dbError } = await supabase
        .from("users")
        .select("id, email")

      if (dbError) throw dbError

      const authUserMap = new Map(authUsers.users.map(u => [u.id, u]))
      const dbUserMap = new Map(dbUsers?.map(u => [u.id, u]) || [])

      // Find discrepancies
      const missingProfiles = authUsers.users.filter(au => !dbUserMap.has(au.id))
      const orphanedProfiles = (dbUsers || []).filter(du => !authUserMap.has(du.id))
      
      // Find email mismatches
      const emailMismatches = (dbUsers || []).filter(du => {
        const authUser = authUserMap.get(du.id)
        return authUser && authUser.email !== du.email
      })

      setStats({
        authUsers: authUsers.users.length,
        dbUsers: dbUsers?.length || 0,
        missingProfiles: missingProfiles.length,
        orphanedProfiles: orphanedProfiles.length,
        emailMismatches: emailMismatches.length
      })

      // Generate analysis results
      const results: SyncResult[] = []
      
      if (missingProfiles.length === 0 && orphanedProfiles.length === 0 && emailMismatches.length === 0) {
        results.push({
          type: 'success',
          message: 'Perfect synchronization detected',
          details: 'All auth users have corresponding database profiles with matching emails'
        })
      } else {
        if (missingProfiles.length > 0) {
          results.push({
            type: 'warning',
            message: `${missingProfiles.length} auth users missing database profiles`,
            details: 'These users can sign in but have no profile data'
          })
        }
        
        if (orphanedProfiles.length > 0) {
          results.push({
            type: 'error',
            message: `${orphanedProfiles.length} orphaned database profiles found`,
            details: 'These profiles exist in database but have no auth user'
          })
        }
        
        if (emailMismatches.length > 0) {
          results.push({
            type: 'warning',
            message: `${emailMismatches.length} email mismatches detected`,
            details: 'Auth and database emails do not match for these users'
          })
        }
      }

      setSyncResults(results)

    } catch (error: any) {
      console.error("Error analyzing sync status:", error)
      notifications.show({
        title: "Error",
        message: "Failed to analyze auth-database sync status",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const performFullSync = async () => {
    setSyncing(true)
    setSyncProgress(0)
    const results: SyncResult[] = []
    
    try {
      // Step 1: Get all data
      setSyncProgress(10)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      if (authError) throw authError

      const { data: dbUsers, error: dbError } = await supabase
        .from("users")
        .select("*")

      if (dbError) throw dbError

      setSyncProgress(20)

      const authUserMap = new Map(authUsers.users.map(u => [u.id, u]))
      const dbUserMap = new Map(dbUsers?.map(u => [u.id, u]) || [])

      // Step 2: Create missing profiles
      setSyncProgress(40)
      const missingProfiles = authUsers.users.filter(au => !dbUserMap.has(au.id))
      
      for (const authUser of missingProfiles) {
        try {
          await supabase
            .from("users")
            .insert({
              id: authUser.id,
              email: authUser.email || '',
              gamer_tag_id: authUser.email?.split('@')[0] || `user_${authUser.id.slice(0, 8)}`,
              created_at: authUser.created_at,
              email_confirmed_at: authUser.email_confirmed_at,
              last_sign_in_at: authUser.last_sign_in_at
            })
          
          results.push({
            type: 'success',
            message: `Created profile for ${authUser.email}`
          })
        } catch (error) {
          results.push({
            type: 'error',
            message: `Failed to create profile for ${authUser.email}`,
            details: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      setSyncProgress(60)

      // Step 3: Update email mismatches
      const emailMismatches = (dbUsers || []).filter(du => {
        const authUser = authUserMap.get(du.id)
        return authUser && authUser.email !== du.email
      })

      for (const dbUser of emailMismatches) {
        const authUser = authUserMap.get(dbUser.id)
        if (authUser) {
          try {
            await supabase
              .from("users")
              .update({ email: authUser.email })
              .eq("id", dbUser.id)
            
            results.push({
              type: 'success',
              message: `Updated email for user ${dbUser.id}`
            })
          } catch (error) {
            results.push({
              type: 'error',
              message: `Failed to update email for user ${dbUser.id}`,
              details: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        }
      }

      setSyncProgress(80)

      // Step 4: Report orphaned profiles (don't auto-delete)
      const orphanedProfiles = (dbUsers || []).filter(du => !authUserMap.has(du.id))
      if (orphanedProfiles.length > 0) {
        results.push({
          type: 'warning',
          message: `Found ${orphanedProfiles.length} orphaned profiles`,
          details: 'These should be manually reviewed before deletion'
        })
      }

      setSyncProgress(100)
      setLastSyncTime(new Date().toISOString())

      notifications.show({
        title: "Sync Complete",
        message: "Auth-database synchronization completed",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      // Refresh analysis
      await analyzeSyncStatus()

    } catch (error: any) {
      console.error("Error during sync:", error)
      results.push({
        type: 'error',
        message: 'Sync failed',
        details: error.message || 'Unknown error occurred'
      })
      
      notifications.show({
        title: "Sync Error",
        message: "Failed to complete synchronization",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setSyncing(false)
      setSyncProgress(0)
      setSyncResults(results)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="blue">Analyzing Auth-Database Sync...</Text>
          </Stack>
        </Center>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-4">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-purple-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <ArrowRightLeft size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="white">
                Auth to Database Sync
              </Title>
              <Text size="lg" c="white" opacity={0.9}>
                Synchronize Supabase Auth users with database profiles
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="blue">{stats.authUsers}</Text>
              <Text size="sm" c="blue">Auth Users</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between">
          <Title order={3}>Synchronization Control</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={analyzeSyncStatus} disabled={syncing}>
              Analyze Status
            </Button>
            <Button 
              leftSection={<ArrowRightLeft size={16} />} 
              onClick={performFullSync}
              loading={syncing}
            >
              Perform Sync
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Sync Progress */}
      {syncing && (
        <Paper withBorder p="md" mb="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Synchronizing...</Text>
              <Text size="sm" c="blue">{Math.round(syncProgress)}% complete</Text>
            </Group>
            <Progress value={syncProgress} size="lg" />
          </Stack>
        </Paper>
      )}

      {/* Statistics */}
      <Group mb="lg" grow>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
            <Shield size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="blue">{stats.authUsers}</Text>
          <Text size="sm" c="dimmed">Auth Users</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
            <Database size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="green">{stats.dbUsers}</Text>
          <Text size="sm" c="blue">DB Profiles</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
            <AlertTriangle size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="orange">{stats.missingProfiles}</Text>
          <Text size="sm" c="blue">Missing Profiles</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="red" variant="light" mx="auto" mb="md">
            <Users size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="red">{stats.orphanedProfiles}</Text>
          <Text size="sm" c="blue">Orphaned Profiles</Text>
        </Card>
      </Group>

      {/* Last Sync Info */}
      {lastSyncTime && (
        <Alert color="green" variant="light" mb="lg">
          <Text fw={500}>Last Sync Completed</Text>
          <Text size="sm">
            {new Date(lastSyncTime).toLocaleString()}
          </Text>
        </Alert>
      )}

      {/* Sync Results */}
      <Tabs defaultValue="status" variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="status" leftSection={<Activity size={16} />}>
            Sync Status
          </Tabs.Tab>
          <Tabs.Tab value="results" leftSection={<CheckCircle size={16} />}>
            Sync Results ({syncResults.length})
          </Tabs.Tab>
          <Tabs.Tab value="help" leftSection={<Key size={16} />}>
            Help & Info
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="status" pt="md">
          <Paper withBorder p="lg">
            <Title order={4} mb="md">Current Sync Status</Title>
            
            {syncResults.length === 0 ? (
              <Text c="blue">Run analysis to check sync status</Text>
            ) : (
              <Stack gap="md">
                {syncResults.map((result, index) => (
                  <Alert 
                    key={index}
                    color={result.type === 'success' ? 'green' : result.type === 'warning' ? 'orange' : 'red'}
                    variant="light"
                  >
                    <Text fw={500}>{result.message}</Text>
                    {result.details && <Text size="sm" mt="xs">{result.details}</Text>}
                  </Alert>
                ))}
              </Stack>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="results" pt="md">
          <Paper withBorder p="lg">
            <Title order={4} mb="md">Sync Operation Results</Title>
            
            {syncResults.length === 0 ? (
              <Text c="blue">No sync operations performed yet</Text>
            ) : (
              <List spacing="sm">
                {syncResults.map((result, index) => (
                  <List.Item 
                    key={index}
                    icon={
                      <ThemeIcon 
                        size="sm" 
                        color={result.type === 'success' ? 'green' : result.type === 'warning' ? 'orange' : 'red'}
                        variant="light"
                      >
                        {result.type === 'success' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                      </ThemeIcon>
                    }
                  >
                    <Text size="sm">{result.message}</Text>
                    {result.details && <Text size="xs" c="dimmed">{result.details}</Text>}
                  </List.Item>
                ))}
              </List>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="help" pt="md">
          <Paper withBorder p="lg">
            <Title order={4} mb="md">About Auth-Database Sync</Title>
            
            <Stack gap="md">
              <div>
                <Text fw={500} mb="xs">What this tool does:</Text>
                <List size="sm">
                  <List.Item>Finds auth users without database profiles and creates them</List.Item>
                  <List.Item>Identifies email mismatches between auth and database</List.Item>
                  <List.Item>Reports orphaned database profiles for manual review</List.Item>
                  <List.Item>Ensures data consistency between authentication and application data</List.Item>
                </List>
              </div>

              <div>
                <Text fw={500} mb="xs">When to use this tool:</Text>
                <List size="sm">
                  <List.Item>After importing users from external systems</List.Item>
                  <List.Item>When users report login issues</List.Item>
                  <List.Item>During data migration or cleanup operations</List.Item>
                  <List.Item>As part of regular maintenance routines</List.Item>
                </List>
              </div>

              <Alert color="blue" variant="light">
                <Text fw={500}>Safety Note</Text>
                <Text size="sm">
                  This tool only creates missing profiles and updates emails. 
                  It does not delete any data automatically. Orphaned profiles are reported for manual review.
                </Text>
              </Alert>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
