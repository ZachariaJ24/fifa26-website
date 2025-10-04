"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Loader,
  Center,
  Tabs,
  ThemeIcon
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Settings, Shield, Users, Database, Trophy, Activity, AlertCircle } from "lucide-react"

// Import the admin components (these may need to be converted to Mantine too)
import { TransferSettings } from "@/components/admin/transfer-settings"
import { SigningSettings } from "@/components/admin/signing-settings"
import { AdminDiagnostics } from "@/components/admin/admin-diagnostics"
import { RemoveUserTransfers } from "@/components/admin/remove-user-transfers"
import { IpTracking } from "@/components/admin/ip-tracking"
import { SeasonsManager } from "@/components/admin/seasons-manager"
import { SyncStandingsButton } from "@/components/admin/sync-standings-button"

export function AdminSettingsPageClientMantine() {
  const router = useRouter()
  const { toast } = useToast()
  const { supabase, session } = useSupabase()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuthorization() {
      if (!session?.user) {
        notifications.show({
          title: "Unauthorized",
          message: "You must be logged in to access this page.",
          color: "red",
          icon: <AlertCircle size={16} />
        })
        router.push("/login")
        return
      }

      try {
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("role", "Admin")

        if (roleError || !roleData || roleData.length === 0) {
          notifications.show({
            title: "Access denied",
            message: "You don't have permission to access the admin settings.",
            color: "red",
            icon: <AlertCircle size={16} />
          })
          router.push("/")
          return
        }

        setIsAdmin(true)
      } catch (error: any) {
        console.error("Error checking authorization:", error)
        notifications.show({
          title: "Error",
          message: error.message || "An error occurred",
          color: "red",
          icon: <AlertCircle size={16} />
        })
      } finally {
        setLoading(false)
      }
    }

    checkAuthorization()
  }, [supabase, session, router])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="blue">Loading System Settings...</Text>
          </Stack>
        </Center>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto py-4">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-yellow-6) 0%, var(--mantine-color-orange-6) 100%)' }}>
        <Center>
          <Stack align="center" gap="md">
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <Settings size={40} />
            </ThemeIcon>
            <Title order={1} c="cyan" ta="center">
              System Settings
            </Title>
            <Text size="lg" c="yellow" ta="center" maw={600}>
              Configure and manage all system settings, transfer parameters, and administrative controls
            </Text>
            <Group gap="xs" p="md" style={{ background: 'rgba(6,182,212,0.2)', borderRadius: 'var(--mantine-radius-xl)', backdropFilter: 'blur(10px)' }}>
              <Shield size={20} color="cyan" />
              <Text c="cyan" fw={600}>Administrator Access Granted</Text>
            </Group>
          </Stack>
        </Center>
      </Paper>

      {/* Settings Tabs */}
      <Tabs defaultValue="transfers" variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="transfers" leftSection={<Shield size={16} />}>
            Transfers
          </Tabs.Tab>
          <Tabs.Tab value="signings" leftSection={<Trophy size={16} />}>
            Signings
          </Tabs.Tab>
          <Tabs.Tab value="ip-tracking" leftSection={<Activity size={16} />}>
            IP Tracking
          </Tabs.Tab>
          <Tabs.Tab value="user-transfers" leftSection={<Users size={16} />}>
            User Transfers
          </Tabs.Tab>
          <Tabs.Tab value="seasons" leftSection={<Trophy size={16} />}>
            Seasons
          </Tabs.Tab>
          <Tabs.Tab value="standings" leftSection={<Trophy size={16} />}>
            Standings
          </Tabs.Tab>
          <Tabs.Tab value="diagnostics" leftSection={<Database size={16} />}>
            Diagnostics
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="transfers" pt="md">
          <Paper withBorder p="lg">
            <Group mb="md">
              <ThemeIcon color="blue" variant="light">
                <Shield size={20} />
              </ThemeIcon>
              <Title order={3}>Transfer Settings</Title>
            </Group>
            <TransferSettings />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="signings" pt="md">
          <Paper withBorder p="lg">
            <Group mb="md">
              <ThemeIcon color="green" variant="light">
                <Trophy size={20} />
              </ThemeIcon>
              <Title order={3}>Signing Settings</Title>
            </Group>
            <SigningSettings />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="ip-tracking" pt="md">
          <Paper withBorder p="lg">
            <Group mb="md">
              <ThemeIcon color="orange" variant="light">
                <Activity size={20} />
              </ThemeIcon>
              <Title order={3}>IP Tracking</Title>
            </Group>
            <IpTracking />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="user-transfers" pt="md">
          <Paper withBorder p="lg">
            <Group mb="md">
              <ThemeIcon color="red" variant="light">
                <Users size={20} />
              </ThemeIcon>
              <Title order={3}>User Transfer Management</Title>
            </Group>
            <RemoveUserTransfers />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="seasons" pt="md">
          <Paper withBorder p="lg">
            <Group mb="md">
              <ThemeIcon color="blue" variant="light">
                <Trophy size={20} />
              </ThemeIcon>
              <Title order={3}>Season Management</Title>
            </Group>
            <SeasonsManager />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="standings" pt="md">
          <Paper withBorder p="lg">
            <Group mb="md">
              <ThemeIcon color="yellow" variant="light">
                <Trophy size={20} />
              </ThemeIcon>
              <Title order={3}>Standings Synchronization</Title>
            </Group>
            <SyncStandingsButton />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="diagnostics" pt="md">
          <Paper withBorder p="lg">
            <Group mb="md">
              <ThemeIcon color="indigo" variant="light">
                <Database size={20} />
              </ThemeIcon>
              <Title order={3}>System Diagnostics</Title>
            </Group>
            <AdminDiagnostics />
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
