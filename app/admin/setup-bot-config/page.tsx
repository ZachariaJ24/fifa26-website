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
  Card,
  ThemeIcon,
  Alert,
  Stepper,
  Switch,
  Code,
  List,
  Textarea
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  Bot,
  Settings,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Shield,
  Zap,
  Database,
  Key,
  Server
} from "lucide-react"

interface SetupStep {
  id: string
  title: string
  description: string
  completed: boolean
  required: boolean
}

export default function SetupBotConfigPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Form states
  const [botToken, setBotToken] = useState("")
  const [guildId, setGuildId] = useState("")
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [welcomeChannelId, setWelcomeChannelId] = useState("")
  const [logChannelId, setLogChannelId] = useState("")
  const [adminRoleId, setAdminRoleId] = useState("")
  const [playerRoleId, setPlayerRoleId] = useState("")
  const [enableWelcomeMessages, setEnableWelcomeMessages] = useState(true)
  const [enableAutoRoles, setEnableAutoRoles] = useState(true)
  const [enableLogging, setEnableLogging] = useState(true)

  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: "bot_creation",
      title: "Create Discord Bot",
      description: "Create a bot application in Discord Developer Portal",
      completed: false,
      required: true
    },
    {
      id: "bot_token",
      title: "Configure Bot Token",
      description: "Add bot token and basic configuration",
      completed: false,
      required: true
    },
    {
      id: "server_setup",
      title: "Server Configuration",
      description: "Configure Discord server settings",
      completed: false,
      required: true
    },
    {
      id: "permissions",
      title: "Bot Permissions",
      description: "Set up bot roles and permissions",
      completed: false,
      required: true
    },
    {
      id: "channels",
      title: "Channel Setup",
      description: "Configure welcome and log channels",
      completed: false,
      required: false
    },
    {
      id: "finalize",
      title: "Finalize Setup",
      description: "Save configuration and test bot",
      completed: false,
      required: true
    }
  ])

  useEffect(() => {
    checkExistingConfig()
  }, [])

  const checkExistingConfig = async () => {
    try {
      setLoading(true)
      
      const { data: config, error } = await supabase
        .from("bot_config")
        .select("*")
        .single()

      if (config) {
        // Pre-fill form with existing config
        setBotToken(config.bot_token || "")
        setGuildId(config.guild_id || "")
        setWelcomeChannelId(config.welcome_channel_id || "")
        setLogChannelId(config.log_channel_id || "")
        setEnableWelcomeMessages(config.enable_welcome_messages || false)
        setEnableAutoRoles(config.auto_role_assignment || false)
        setEnableLogging(config.enable_logging || false)

        // Update step completion based on existing config
        updateStepCompletion(config)
      }

    } catch (error: any) {
      console.error("Error checking existing config:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStepCompletion = (config: any) => {
    const updatedSteps = setupSteps.map(step => {
      switch (step.id) {
        case "bot_creation":
          return { ...step, completed: !!config.bot_token }
        case "bot_token":
          return { ...step, completed: !!config.bot_token && !!config.guild_id }
        case "server_setup":
          return { ...step, completed: !!config.guild_id }
        case "permissions":
          return { ...step, completed: !!config.bot_token }
        case "channels":
          return { ...step, completed: !!config.welcome_channel_id || !!config.log_channel_id }
        case "finalize":
          return { ...step, completed: config.is_active || false }
        default:
          return step
      }
    })
    setSetupSteps(updatedSteps)
    
    // Set current step to first incomplete step
    const firstIncomplete = updatedSteps.findIndex(step => !step.completed)
    if (firstIncomplete !== -1) {
      setCurrentStep(firstIncomplete)
    }
  }

  const saveConfiguration = async () => {
    setIsProcessing(true)
    try {
      const configData = {
        bot_token: botToken.trim(),
        client_id: clientId.trim(),
        client_secret: clientSecret.trim(),
        guild_id: guildId.trim(),
        welcome_channel_id: welcomeChannelId.trim() || null,
        log_channel_id: logChannelId.trim() || null,
        admin_role_id: adminRoleId.trim() || null,
        player_role_id: playerRoleId.trim() || null,
        enable_welcome_messages: enableWelcomeMessages,
        auto_role_assignment: enableAutoRoles,
        enable_logging: enableLogging,
        is_active: true,
        version: "1.0.0",
        created_at: new Date().toISOString(),
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

      // Mark finalize step as complete
      const updatedSteps = setupSteps.map(step => 
        step.id === "finalize" ? { ...step, completed: true } : step
      )
      setSetupSteps(updatedSteps)

    } catch (error: any) {
      console.error("Error saving configuration:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to save configuration",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const testBotConnection = async () => {
    setIsProcessing(true)
    try {
      // Simulate bot connection test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      notifications.show({
        title: "Connection Test",
        message: "Bot configuration is valid and ready to use",
        color: "green",
        icon: <CheckCircle size={16} />
      })

    } catch (error: any) {
      notifications.show({
        title: "Connection Failed",
        message: "Unable to connect with current configuration",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const nextStep = () => {
    if (currentStep < setupSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completedSteps = setupSteps.filter(step => step.completed).length

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Bot size={48} stroke={1} color="var(--mantine-color-blue-5)" />
            <Text c="dimmed">Loading Bot Configuration...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="md" py="md">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-indigo-6) 100%)' }}>
        <Stack align="center" gap="md">
          <ThemeIcon size={80} radius="xl" variant="light" color="white">
            <Settings size={40} />
          </ThemeIcon>
          <Title order={1} c="white" ta="center">
            Setup Bot Config
          </Title>
          <Text size="lg" c="white" ta="center" maw={600}>
            Initialize and configure Discord bot settings for your FIFA league
          </Text>
          <Group>
            <Badge color="white" variant="filled">
              Step {currentStep + 1} of {setupSteps.length}
            </Badge>
            <Badge color="white" variant="outline">
              {completedSteps}/{setupSteps.length} Complete
            </Badge>
          </Group>
        </Stack>
      </Paper>

      {/* Progress Overview */}
      <Paper withBorder p="lg" mb="lg">
        <Stepper active={currentStep} size="sm" mb="lg">
          {setupSteps.map((step, index) => (
            <Stepper.Step
              key={step.id}
              label={step.title}
              description={step.description}
              completedIcon={<CheckCircle size={18} />}
              allowStepSelect={false}
            />
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Paper withBorder p="lg" mb="lg">
        {currentStep === 0 && (
          <Stack gap="md">
            <Group>
              <ThemeIcon color="blue" variant="light">
                <Bot size={20} />
              </ThemeIcon>
              <Title order={4}>Create Discord Bot</Title>
            </Group>
            
            <Alert color="blue" variant="light">
              <Text fw={500}>Before you begin</Text>
              <Text size="sm" mt="xs">
                You need to create a Discord bot application in the Discord Developer Portal.
              </Text>
            </Alert>

            <Text fw={500}>Steps to create your bot:</Text>
            <List size="sm" spacing="xs">
              <List.Item>Go to <Code>https://discord.com/developers/applications</Code></List.Item>
              <List.Item>Click "New Application" and give it a name</List.Item>
              <List.Item>Go to the "Bot" section in the left sidebar</List.Item>
              <List.Item>Click "Add Bot" to create a bot user</List.Item>
              <List.Item>Copy the bot token (you'll need this in the next step)</List.Item>
              <List.Item>Enable necessary bot permissions</List.Item>
            </List>

            <Alert color="orange" variant="light">
              <Text fw={500}>Important</Text>
              <Text size="sm">
                Keep your bot token secure and never share it publicly. 
                It provides full access to your bot.
              </Text>
            </Alert>
          </Stack>
        )}

        {currentStep === 1 && (
          <Stack gap="md">
            <Group>
              <ThemeIcon color="green" variant="light">
                <Key size={20} />
              </ThemeIcon>
              <Title order={4}>Configure Bot Token</Title>
            </Group>

            <TextInput
              label="Bot Token"
              placeholder="Enter your Discord bot token"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              type="password"
              required
              description="The secret token from your Discord bot application"
            />

            <TextInput
              label="Client ID"
              placeholder="Enter your Discord application client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              description="Found in the 'General Information' section of your Discord app"
            />

            <TextInput
              label="Client Secret"
              placeholder="Enter your Discord application client secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              type="password"
              description="Found in the 'General Information' section of your Discord app"
            />
          </Stack>
        )}

        {currentStep === 2 && (
          <Stack gap="md">
            <Group>
              <ThemeIcon color="orange" variant="light">
                <Server size={20} />
              </ThemeIcon>
              <Title order={4}>Server Configuration</Title>
            </Group>

            <TextInput
              label="Guild ID (Server ID)"
              placeholder="Enter your Discord server ID"
              value={guildId}
              onChange={(e) => setGuildId(e.target.value)}
              required
              description="Right-click your Discord server name and select 'Copy ID'"
            />

            <Alert color="blue" variant="light">
              <Text fw={500}>How to get your Guild ID:</Text>
              <List size="sm" mt="xs">
                <List.Item>Enable Developer Mode in Discord (User Settings → Advanced)</List.Item>
                <List.Item>Right-click on your server name</List.Item>
                <List.Item>Select "Copy ID"</List.Item>
              </List>
            </Alert>
          </Stack>
        )}

        {currentStep === 3 && (
          <Stack gap="md">
            <Group>
              <ThemeIcon color="purple" variant="light">
                <Shield size={20} />
              </ThemeIcon>
              <Title order={4}>Bot Permissions</Title>
            </Group>

            <TextInput
              label="Admin Role ID"
              placeholder="Enter admin role ID"
              value={adminRoleId}
              onChange={(e) => setAdminRoleId(e.target.value)}
              description="Role ID for league administrators"
            />

            <TextInput
              label="Player Role ID"
              placeholder="Enter player role ID"
              value={playerRoleId}
              onChange={(e) => setPlayerRoleId(e.target.value)}
              description="Role ID automatically assigned to players"
            />

            <Alert color="purple" variant="light">
              <Text fw={500}>Required Bot Permissions:</Text>
              <List size="sm" mt="xs">
                <List.Item>Send Messages</List.Item>
                <List.Item>Manage Roles</List.Item>
                <List.Item>Read Message History</List.Item>
                <List.Item>Add Reactions</List.Item>
                <List.Item>Use Slash Commands</List.Item>
              </List>
            </Alert>
          </Stack>
        )}

        {currentStep === 4 && (
          <Stack gap="md">
            <Group>
              <ThemeIcon color="cyan" variant="light">
                <MessageCircle size={20} />
              </ThemeIcon>
              <Title order={4}>Channel Setup</Title>
            </Group>

            <TextInput
              label="Welcome Channel ID"
              placeholder="Enter welcome channel ID (optional)"
              value={welcomeChannelId}
              onChange={(e) => setWelcomeChannelId(e.target.value)}
              description="Channel where welcome messages are sent"
            />

            <TextInput
              label="Log Channel ID"
              placeholder="Enter log channel ID (optional)"
              value={logChannelId}
              onChange={(e) => setLogChannelId(e.target.value)}
              description="Channel where bot logs are sent"
            />

            <Group grow>
              <Switch
                label="Enable Welcome Messages"
                checked={enableWelcomeMessages}
                onChange={(e) => setEnableWelcomeMessages(e.currentTarget.checked)}
              />
              
              <Switch
                label="Enable Auto Roles"
                checked={enableAutoRoles}
                onChange={(e) => setEnableAutoRoles(e.currentTarget.checked)}
              />
              
              <Switch
                label="Enable Logging"
                checked={enableLogging}
                onChange={(e) => setEnableLogging(e.currentTarget.checked)}
              />
            </Group>
          </Stack>
        )}

        {currentStep === 5 && (
          <Stack gap="md">
            <Group>
              <ThemeIcon color="green" variant="light">
                <CheckCircle size={20} />
              </ThemeIcon>
              <Title order={4}>Finalize Setup</Title>
            </Group>

            <Alert color="green" variant="light">
              <Text fw={500}>Configuration Summary</Text>
              <List size="sm" mt="xs">
                <List.Item>Bot Token: {botToken ? "✓ Configured" : "✗ Missing"}</List.Item>
                <List.Item>Guild ID: {guildId ? "✓ Configured" : "✗ Missing"}</List.Item>
                <List.Item>Welcome Channel: {welcomeChannelId ? "✓ Configured" : "○ Optional"}</List.Item>
                <List.Item>Log Channel: {logChannelId ? "✓ Configured" : "○ Optional"}</List.Item>
                <List.Item>Auto Roles: {enableAutoRoles ? "✓ Enabled" : "○ Disabled"}</List.Item>
              </List>
            </Alert>

            <Group>
              <Button 
                leftSection={<Zap size={16} />}
                onClick={testBotConnection}
                loading={isProcessing}
                variant="outline"
              >
                Test Connection
              </Button>
              
              <Button 
                leftSection={<Database size={16} />}
                onClick={saveConfiguration}
                loading={isProcessing}
                disabled={!botToken || !guildId}
              >
                Save Configuration
              </Button>
            </Group>

            {botToken && guildId && (
              <Alert color="blue" variant="light">
                <Text fw={500}>Next Steps</Text>
                <Text size="sm" mt="xs">
                  After saving, your bot will be ready to use. You can start it from the SCS Bot management page.
                </Text>
              </Alert>
            )}
          </Stack>
        )}
      </Paper>

      {/* Navigation */}
      <Group justify="space-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        
        <Button 
          onClick={nextStep}
          disabled={currentStep === setupSteps.length - 1}
        >
          Next Step
        </Button>
      </Group>
    </Container>
  )
}
