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
  Card,
  ThemeIcon,
  Alert,
  Tabs,
  Switch,
  Code,
  List
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  Bot,
  MessageCircle,
  Users,
  Settings,
  RefreshCw,
  Play,
  Square,
  Zap,
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  Twitch,
  Video
} from "lucide-react"

interface BotConfig {
  id: string
  bot_token: string
  guild_id: string
  is_active: boolean
  auto_role_assignment: boolean
  welcome_channel_id?: string
  log_channel_id?: string
  twitch_integration: boolean
  twitch_channel?: string
  last_heartbeat?: string
  version: string
}

interface BotStats {
  total_members: number
  active_members: number
  roles_managed: number
  commands_processed: number
  uptime: string
  last_restart: string
}

export default function SCSBotPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [botConfig, setBotConfig] = useState<BotConfig | null>(null)
  const [botStats, setBotStats] = useState<BotStats | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [botStatus, setBotStatus] = useState<'online' | 'offline' | 'error'>('offline')

  // Form states
  const [botToken, setBotToken] = useState("")
  const [guildId, setGuildId] = useState("")
  const [welcomeChannelId, setWelcomeChannelId] = useState("")
  const [logChannelId, setLogChannelId] = useState("")
  const [twitchChannel, setTwitchChannel] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [autoRoleAssignment, setAutoRoleAssignment] = useState(false)
  const [twitchIntegration, setTwitchIntegration] = useState(false)

  useEffect(() => {
    fetchBotConfig()
    fetchBotStats()
  }, [])

  const fetchBotConfig = async () => {
    try {
      setLoading(true)
      
      // Fetch bot configuration
      const { data: configData, error: configError } = await supabase
        .from("bot_config")
        .select("*")
        .single()

      if (configError && configError.code !== 'PGRST116') {
        throw configError
      }

      if (configData) {
        setBotConfig(configData)
        setBotToken(configData.bot_token || "")
        setGuildId(configData.guild_id || "")
        setWelcomeChannelId(configData.welcome_channel_id || "")
        setLogChannelId(configData.log_channel_id || "")
        setTwitchChannel(configData.twitch_channel || "")
        setIsActive(configData.is_active || false)
        setAutoRoleAssignment(configData.auto_role_assignment || false)
        setTwitchIntegration(configData.twitch_integration || false)
        
        // Set bot status based on last heartbeat
        if (configData.last_heartbeat) {
          const lastHeartbeat = new Date(configData.last_heartbeat)
          const now = new Date()
          const timeDiff = now.getTime() - lastHeartbeat.getTime()
          setBotStatus(timeDiff < 60000 ? 'online' : 'offline') // 1 minute threshold
        }
      }

    } catch (error: any) {
      console.error("Error fetching bot config:", error)
      notifications.show({
        title: "Error",
        message: "Failed to load bot configuration",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBotStats = async () => {
    try {
      // Mock bot stats for now - in real implementation, this would come from Discord API
      setBotStats({
        total_members: 156,
        active_members: 89,
        roles_managed: 12,
        commands_processed: 2847,
        uptime: "3d 14h 22m",
        last_restart: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      })
    } catch (error: any) {
      console.error("Error fetching bot stats:", error)
    }
  }

  const saveBotConfig = async () => {
    setIsProcessing(true)
    try {
      const configData = {
        bot_token: botToken.trim(),
        guild_id: guildId.trim(),
        welcome_channel_id: welcomeChannelId.trim() || null,
        log_channel_id: logChannelId.trim() || null,
        twitch_channel: twitchChannel.trim() || null,
        is_active: isActive,
        auto_role_assignment: autoRoleAssignment,
        twitch_integration: twitchIntegration,
        version: "1.0.0",
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from("bot_config")
        .upsert(configData)

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Bot configuration saved successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      await fetchBotConfig()

    } catch (error: any) {
      console.error("Error saving bot config:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to save bot configuration",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const startBot = async () => {
    setIsProcessing(true)
    try {
      // In real implementation, this would trigger bot startup
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      setBotStatus('online')
      notifications.show({
        title: "Bot Started",
        message: "SCS Bot is now online and ready",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      await fetchBotConfig()
      await fetchBotStats()

    } catch (error: any) {
      console.error("Error starting bot:", error)
      notifications.show({
        title: "Error",
        message: "Failed to start bot",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const stopBot = async () => {
    setIsProcessing(true)
    try {
      // In real implementation, this would trigger bot shutdown
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setBotStatus('offline')
      notifications.show({
        title: "Bot Stopped",
        message: "SCS Bot has been stopped",
        color: "orange",
        icon: <Square size={16} />
      })

    } catch (error: any) {
      console.error("Error stopping bot:", error)
      notifications.show({
        title: "Error",
        message: "Failed to stop bot",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const restartBot = async () => {
    setIsProcessing(true)
    try {
      setBotStatus('offline')
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate restart
      setBotStatus('online')
      
      notifications.show({
        title: "Bot Restarted",
        message: "SCS Bot has been restarted successfully",
        color: "blue",
        icon: <RefreshCw size={16} />
      })

      await fetchBotStats()

    } catch (error: any) {
      console.error("Error restarting bot:", error)
      notifications.show({
        title: "Error",
        message: "Failed to restart bot",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Bot size={48} stroke={1} color="var(--mantine-color-blue-5)" />
            <Text c="dimmed">Loading SCS Bot Configuration...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-indigo-6) 0%, var(--mantine-color-purple-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <Bot size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="white">
                SCS Bot
              </Title>
              <Text size="lg" c="white" opacity={0.9}>
                Manage Discord bot integration, roles, and Twitch streaming
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Badge 
                color={botStatus === 'online' ? 'green' : botStatus === 'offline' ? 'red' : 'orange'}
                variant="filled"
                size="lg"
              >
                {botStatus.toUpperCase()}
              </Badge>
              <Text size="sm" c="dimmed">Bot Status</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Bot Controls */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between">
          <Title order={3}>Bot Control Panel</Title>
          <Group>
            <Button 
              leftSection={<Play size={16} />} 
              onClick={startBot}
              loading={isProcessing}
              disabled={botStatus === 'online'}
              color="green"
            >
              Start Bot
            </Button>
            <Button 
              leftSection={<Square size={16} />} 
              onClick={stopBot}
              loading={isProcessing}
              disabled={botStatus === 'offline'}
              color="red"
              variant="outline"
            >
              Stop Bot
            </Button>
            <Button 
              leftSection={<RefreshCw size={16} />} 
              onClick={restartBot}
              loading={isProcessing}
              variant="outline"
            >
              Restart Bot
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Bot Status Alert */}
      <Alert 
        color={botStatus === 'online' ? 'green' : 'red'} 
        variant="light" 
        mb="lg"
        icon={botStatus === 'online' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
      >
        <Text fw={500}>
          Bot Status: {botStatus === 'online' ? 'Online and Active' : 'Offline'}
        </Text>
        <Text size="sm">
          {botStatus === 'online' 
            ? 'The Discord bot is running and processing commands.'
            : 'The Discord bot is not currently running. Start it to enable Discord integration.'
          }
        </Text>
      </Alert>

      {/* Statistics */}
      {botStats && (
        <Group mb="lg" grow>
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
              <Users size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="blue">{botStats.total_members}</Text>
            <Text size="sm" c="dimmed">Total Members</Text>
          </Card>
          
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
              <Activity size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="green">{botStats.active_members}</Text>
            <Text size="sm" c="dimmed">Active Members</Text>
          </Card>
          
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
              <Shield size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="orange">{botStats.roles_managed}</Text>
            <Text size="sm" c="dimmed">Roles Managed</Text>
          </Card>
          
          <Card withBorder p="md" ta="center">
            <ThemeIcon size="lg" color="purple" variant="light" mx="auto" mb="md">
              <Zap size={24} />
            </ThemeIcon>
            <Text size="xl" fw={700} c="purple">{botStats.commands_processed}</Text>
            <Text size="sm" c="dimmed">Commands Processed</Text>
          </Card>
        </Group>
      )}

      {/* Bot Configuration Tabs */}
      <Tabs defaultValue="config" variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="config" leftSection={<Settings size={16} />}>
            Configuration
          </Tabs.Tab>
          <Tabs.Tab value="discord" leftSection={<MessageCircle size={16} />}>
            Discord Settings
          </Tabs.Tab>
          <Tabs.Tab value="twitch" leftSection={<Twitch size={16} />}>
            Twitch Integration
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="config" pt="md">
          <Paper withBorder p="lg">
            <Group mb="md">
              <ThemeIcon color="blue" variant="light">
                <Settings size={20} />
              </ThemeIcon>
              <Title order={4}>Bot Configuration</Title>
            </Group>

            <Stack gap="md">
              <TextInput
                label="Bot Token"
                placeholder="Enter Discord bot token"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                type="password"
                description="Your Discord bot's secret token"
              />

              <TextInput
                label="Guild ID"
                placeholder="Enter Discord server ID"
                value={guildId}
                onChange={(e) => setGuildId(e.target.value)}
                description="The Discord server ID where the bot operates"
              />

              <Group grow>
                <Switch
                  label="Bot Active"
                  description="Enable/disable bot functionality"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.currentTarget.checked)}
                />
                
                <Switch
                  label="Auto Role Assignment"
                  description="Automatically assign roles to new members"
                  checked={autoRoleAssignment}
                  onChange={(e) => setAutoRoleAssignment(e.currentTarget.checked)}
                />
              </Group>

              <Button onClick={saveBotConfig} loading={isProcessing}>
                Save Configuration
              </Button>
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="discord" pt="md">
          <Paper withBorder p="lg">
            <Group mb="md">
              <ThemeIcon color="indigo" variant="light">
                <MessageCircle size={20} />
              </ThemeIcon>
              <Title order={4}>Discord Integration Settings</Title>
            </Group>

            <Stack gap="md">
              <TextInput
                label="Welcome Channel ID"
                placeholder="Enter welcome channel ID"
                value={welcomeChannelId}
                onChange={(e) => setWelcomeChannelId(e.target.value)}
                description="Channel where welcome messages are sent"
              />

              <TextInput
                label="Log Channel ID"
                placeholder="Enter log channel ID"
                value={logChannelId}
                onChange={(e) => setLogChannelId(e.target.value)}
                description="Channel where bot logs are sent"
              />

              <Alert color="blue" variant="light">
                <Text fw={500}>Discord Bot Features</Text>
                <List size="sm" mt="xs">
                  <List.Item>Automatic role assignment based on game registration</List.Item>
                  <List.Item>Welcome messages for new members</List.Item>
                  <List.Item>Command handling for league information</List.Item>
                  <List.Item>Integration with user verification system</List.Item>
                </List>
              </Alert>

              <Button onClick={saveBotConfig} loading={isProcessing}>
                Save Discord Settings
              </Button>
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="twitch" pt="md">
          <Paper withBorder p="lg">
            <Group mb="md">
              <ThemeIcon color="purple" variant="light">
                <Video size={20} />
              </ThemeIcon>
              <Title order={4}>Twitch Streaming Integration</Title>
            </Group>

            <Stack gap="md">
              <Switch
                label="Enable Twitch Integration"
                description="Connect with Twitch for stream notifications"
                checked={twitchIntegration}
                onChange={(e) => setTwitchIntegration(e.currentTarget.checked)}
              />

              {twitchIntegration && (
                <TextInput
                  label="Twitch Channel"
                  placeholder="Enter Twitch channel name"
                  value={twitchChannel}
                  onChange={(e) => setTwitchChannel(e.target.value)}
                  description="Main Twitch channel for league streams"
                />
              )}

              <Alert color="purple" variant="light">
                <Text fw={500}>Twitch Integration Features</Text>
                <List size="sm" mt="xs">
                  <List.Item>Automatic stream notifications in Discord</List.Item>
                  <List.Item>Live match streaming announcements</List.Item>
                  <List.Item>Integration with league schedule</List.Item>
                  <List.Item>Stream viewer role assignments</List.Item>
                </List>
              </Alert>

              <Button onClick={saveBotConfig} loading={isProcessing}>
                Save Twitch Settings
              </Button>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Bot Information */}
      {botConfig && (
        <Paper withBorder p="lg" mt="lg">
          <Group mb="md">
            <ThemeIcon color="gray" variant="light">
              <Bot size={20} />
            </ThemeIcon>
            <Title order={4}>Bot Information</Title>
          </Group>

          <Group>
            <div>
              <Text size="sm" c="dimmed">Version</Text>
              <Code>{botConfig.version}</Code>
            </div>
            <div>
              <Text size="sm" c="dimmed">Last Heartbeat</Text>
              <Text size="sm">
                {botConfig.last_heartbeat 
                  ? new Date(botConfig.last_heartbeat).toLocaleString()
                  : 'Never'
                }
              </Text>
            </div>
            {botStats && (
              <div>
                <Text size="sm" c="dimmed">Uptime</Text>
                <Text size="sm">{botStats.uptime}</Text>
              </div>
            )}
          </Group>
        </Paper>
      )}
    </Container>
  )
}
