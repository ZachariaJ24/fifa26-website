"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Badge,
  ActionIcon,
  Loader,
  Stack,
  Box,
  ThemeIcon,
  Divider,
  Paper,
  Center,
  Alert
} from '@mantine/core'
import {
  IconUsers,
  IconTrophy,
  IconCalendar,
  IconSettings,
  IconPhoto,
  IconChartBar,
  IconShieldCheck,
  IconNews,
  IconDatabase,
  IconGamepad2,
  IconActivity,
  IconClipboardList,
  IconRobot,
  IconRefresh,
  IconMessageSquare,
  IconTrash,
  IconClock,
  IconCoin,
  IconCrown,
  IconShield,
  IconArrowRight,
  IconAlertTriangle,
  IconCheckCircle,
  IconX,
  IconInfo,
  IconExternalLink,
  IconHeart,
  IconBook,
  IconTool
} from '@tabler/icons-react'
import AdminDiagnostics from "@/components/admin/admin-diagnostics"

interface AdminLink {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  category: string
  color: string
}

export default function AdminDashboardPageMantine() {
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuthorization() {
      if (!session?.user) {
        toast({
          title: "Unauthorized",
          description: "You must be logged in to access this page.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      try {
        const { data: adminRoleData, error: adminRoleError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("role", "Admin")

        if (adminRoleError || !adminRoleData || adminRoleData.length === 0) {
          toast({
            title: "Access denied",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        setIsAdmin(true)
      } catch (error: any) {
        console.error("Error checking authorization:", error)
        toast({
          title: "Error",
          description: error.message || "An error occurred",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    checkAuthorization()
  }, [supabase, session, toast, router])

  const adminLinks: AdminLink[] = [
    {
      title: "User Management",
      description: "Manage user accounts and roles",
      icon: <IconUsers size={24} />,
      href: "/admin/users",
      category: "user",
      color: "green"
    },
    {
      title: "Complete User Deletion",
      description: "Completely remove users from all systems",
      icon: <IconTrash size={24} />,
      href: "/admin/complete-user-deletion",
      category: "user",
      color: "red"
    },
    {
      title: "Banned Users Management",
      description: "View and manage banned users, ban/unban functionality",
      icon: <IconUsers size={24} />,
      href: "/admin/banned-users",
      category: "user",
      color: "orange"
    },
    {
      title: "Club Management",
      description: "Manage clubs and rosters",
      icon: <IconTrophy size={24} />,
      href: "/admin/club-management",
      category: "club",
      color: "blue"
    },
    {
      title: "Schedule Management",
      description: "Manage game schedule and results",
      icon: <IconCalendar size={24} />,
      href: "/admin/schedule",
      category: "game",
      color: "yellow"
    },
    {
      title: "Update Current Season",
      description: "Change the active season for registrations",
      icon: <IconClock size={24} />,
      href: "/admin/update-current-season",
      category: "system",
      color: "gray"
    },
    {
      title: "Season Registrations",
      description: "Manage player season registrations",
      icon: <IconClipboardList size={24} />,
      href: "/admin/registrations",
      category: "user",
      color: "green"
    },
    {
      title: "Club Availability",
      description: "View player availability and games played by week",
      icon: <IconCalendar size={24} />,
      href: "/admin/club-availability",
      category: "club",
      color: "blue"
    },
    {
      title: "Daily Recap",
      description: "Generate nightly recap for all clubs based on recent matches",
      icon: <IconNews size={24} />,
      href: "/admin/daily-recap",
      category: "content",
      color: "yellow"
    },
    {
      title: "Transfer Recap",
      description: "View comprehensive transfer activity and club acquisitions",
      icon: <IconCoin size={24} />,
      href: "/admin/transfer-recap",
      category: "finance",
      color: "orange"
    },
    {
      title: "Manage Tokens",
      description: "Manage player tokens, redeemables, and redemption requests",
      icon: <IconCoin size={24} />,
      href: "/admin/tokens",
      category: "finance",
      color: "orange"
    },
    {
      title: "News Management",
      description: "Manage news articles and announcements",
      icon: <IconNews size={24} />,
      href: "/admin/news",
      category: "content",
      color: "yellow"
    },
    {
      title: "Statistics Management",
      description: "Manage player and club statistics",
      icon: <IconChartBar size={24} />,
      href: "/admin/statistics",
      category: "data",
      color: "blue"
    },
    {
      title: "EA Stats",
      description: "View EA Sports FIFA player statistics",
      icon: <IconGamepad2 size={24} />,
      href: "/admin/ea-stats",
      category: "data",
      color: "blue"
    },
    {
      title: "EA Matches",
      description: "View EA Sports FIFA match history",
      icon: <IconActivity size={24} />,
      href: "/admin/ea-matches",
      category: "data",
      color: "blue"
    },
    {
      title: "Awards Management",
      description: "Manage season awards and achievements",
      icon: <IconTrophy size={24} />,
      href: "/admin/awards",
      category: "content",
      color: "yellow"
    },
    {
      title: "Photo Gallery",
      description: "Manage photos and media",
      icon: <IconPhoto size={24} />,
      href: "/admin/photos",
      category: "content",
      color: "yellow"
    },
    {
      title: "Club Logos",
      description: "Manage club logos and branding",
      icon: <IconPhoto size={24} />,
      href: "/admin/club-logos",
      category: "club",
      color: "blue"
    },
    {
      title: "Email Verification",
      description: "Manage email verification",
      icon: <IconShieldCheck size={24} />,
      href: "/admin/email-verification",
      category: "security",
      color: "gray"
    },
    {
      title: "Password Reset",
      description: "Reset user passwords directly",
      icon: <IconShieldCheck size={24} />,
      href: "/admin/password-reset",
      category: "security",
      color: "gray"
    },
    {
      title: "System Settings",
      description: "Configure system settings",
      icon: <IconSettings size={24} />,
      href: "/admin/settings",
      category: "system",
      color: "gray"
    },
    {
      title: "User Diagnostics",
      description: "Diagnose and fix issues with user accounts, verification, and registration.",
      icon: <IconUsers size={24} />,
      href: "/admin/user-diagnostics",
      category: "user",
      color: "green"
    },
    {
      title: "User Account Manager",
      description: "Search, manage, and fix user account issues across all systems",
      icon: <IconUsers size={24} />,
      href: "/admin/user-account-manager",
      category: "user",
      color: "green"
    },
    {
      title: "FIFA 26 Bot",
      description: "Manage Discord bot integration, roles, and Twitch streaming",
      icon: <IconRobot size={24} />,
      href: "/admin/scs-bot",
      category: "integration",
      color: "yellow"
    },
    {
      title: "Setup Bot Config",
      description: "Initialize and configure Discord bot settings",
      icon: <IconSettings size={24} />,
      href: "/admin/setup-bot-config",
      category: "integration",
      color: "yellow"
    },
    {
      title: "Reset User Password",
      description: "Reset a user's password by email address.",
      icon: <IconShieldCheck size={24} />,
      href: "/admin/reset-user-password",
      category: "security",
      color: "gray"
    },
    {
      title: "Auth to Database Sync",
      description: "Sync users from Supabase Auth to database tables",
      icon: <IconRefresh size={24} />,
      href: "/admin/sync-auth-database",
      category: "system",
      color: "gray"
    },
    {
      title: "Orphaned Auth Users",
      description: "Find and fix users from old auth system that exist in Auth but not in database",
      icon: <IconUsers size={24} />,
      href: "/admin/orphaned-auth-users",
      category: "user",
      color: "green"
    },
    {
      title: "Sync Missing Users",
      description: "Sync missing users between auth and database",
      icon: <IconRefresh size={24} />,
      href: "/admin/sync-missing-users",
      category: "system",
      color: "gray"
    },
    {
      title: "Fix User Constraints",
      description: "Fix console and gamer tag constraint violations for user sync",
      icon: <IconShieldCheck size={24} />,
      href: "/admin/fix-user-constraints",
      category: "system",
      color: "gray"
    },
    {
      title: "Fix Console Values",
      description: "Fix invalid console values for users that failed to sync",
      icon: <IconGamepad2 size={24} />,
      href: "/admin/fix-console-values",
      category: "system",
      color: "gray"
    },
    {
      title: "Role Sync Fix",
      description: "Fix role synchronization between user_roles and players tables",
      icon: <IconShield size={24} />,
      href: "/admin/role-sync",
      category: "system",
      color: "gray"
    },
    {
      title: "Discord Debug",
      description: "Debug Discord bot integration and role assignments",
      icon: <IconRobot size={24} />,
      href: "/admin/discord-debug",
      category: "integration",
      color: "yellow"
    },
    {
      title: "Forum Management",
      description: "Manage forum categories and posts",
      icon: <IconMessageSquare size={24} />,
      href: "/admin/forum",
      category: "content",
      color: "yellow"
    },
    {
      title: "Featured Games",
      description: "Manage featured games on homepage",
      icon: <IconTrophy size={24} />,
      href: "/admin/featured-games",
      category: "content",
      color: "yellow"
    },
    {
      title: "Player Mappings",
      description: "Manage EA player to user mappings",
      icon: <IconUsers size={24} />,
      href: "/admin/player-mappings",
      category: "data",
      color: "blue"
    },
    {
      title: "Database Structure",
      description: "Explore database tables and structure",
      icon: <IconDatabase size={24} />,
      href: "/admin/database-structure",
      category: "system",
      color: "gray"
    },
    {
      title: "RBAC Debug",
      description: "Debug role-based access control",
      icon: <IconShieldCheck size={24} />,
      href: "/admin/rbac-debug",
      category: "security",
      color: "gray"
    },
  ]

  const categories = {
    user: { name: "User Management", icon: <IconUsers size={20} />, color: "green" },
    club: { name: "Club Operations", icon: <IconTrophy size={20} />, color: "blue" },
    game: { name: "Game Management", icon: <IconGamepad2 size={20} />, color: "yellow" },
    system: { name: "System Tools", icon: <IconSettings size={20} />, color: "gray" },
    finance: { name: "Financial Tools", icon: <IconCoin size={20} />, color: "orange" },
    content: { name: "Content Management", icon: <IconNews size={20} />, color: "yellow" },
    data: { name: "Data & Statistics", icon: <IconChartBar size={20} />, color: "blue" },
    security: { name: "Security & Access", icon: <IconShield size={20} />, color: "gray" },
    integration: { name: "Integrations", icon: <IconRobot size={20} />, color: "yellow" },
  }

  const groupedLinks = adminLinks.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = []
    }
    acc[link.category].push(link)
    return acc
  }, {} as Record<string, typeof adminLinks>)

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="dimmed">Loading Admin Dashboard...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Container size="xl" py="xl">
      {/* Hero Header Section */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-green-6) 0%, var(--mantine-color-blue-6) 100%)' }}>
        <Center>
          <Stack align="center" gap="md">
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <IconShield size={40} />
            </ThemeIcon>
            <Title order={1} c="white" ta="center">
              Admin Dashboard
            </Title>
            <Text size="lg" c="white" ta="center" maw={600}>
              Complete control center for managing FIFA 26 League operations, users, teams, and system configurations
            </Text>
            <Badge size="lg" variant="light" color="white" leftSection={<IconShield size={16} />}>
              Administrator Access Granted
            </Badge>
          </Stack>
        </Center>
      </Paper>

      {/* Category-based Admin Tools */}
      <Stack gap="xl">
        {Object.entries(groupedLinks).map(([categoryKey, links]) => {
          const category = categories[categoryKey as keyof typeof categories]
          return (
            <Box key={categoryKey}>
              <Group mb="md">
                <ThemeIcon size="lg" radius="md" color={category.color}>
                  {category.icon}
                </ThemeIcon>
                <div>
                  <Title order={2} c={`${category.color}.7`}>
                    {category.name}
                  </Title>
                  <Text c="dimmed">
                    {links.length} tool{links.length !== 1 ? 's' : ''} available
                  </Text>
                </div>
              </Group>

              <Grid>
                {links.map((link, index) => (
                  <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4 }}>
                    <Card
                      component={Link}
                      href={link.href}
                      h="100%"
                      shadow="sm"
                      padding="lg"
                      radius="md"
                      withBorder
                      style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 'var(--mantine-shadow-md)'
                        }
                      }}
                    >
                      <Group justify="space-between" mb="xs">
                        <Text fw={500} size="lg" lineClamp={2}>
                          {link.title}
                        </Text>
                        <ThemeIcon color={link.color} variant="light" size="lg">
                          {link.icon}
                        </ThemeIcon>
                      </Group>
                      
                      <Text size="sm" c="dimmed" mb="md" lineClamp={3}>
                        {link.description}
                      </Text>
                      
                      <Group justify="space-between" mt="auto">
                        <Group gap="xs">
                          <Text size="sm" fw={500} c={`${link.color}.6`}>
                            Access Tool
                          </Text>
                          <IconArrowRight size={16} />
                        </Group>
                        <Badge variant="light" color={link.color} size="sm">
                          {category.name}
                        </Badge>
                      </Group>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </Box>
          )
        })}
      </Stack>

      {/* System Diagnostics Section */}
      <Paper mt="xl" p="lg" withBorder>
        <Group mb="md">
          <ThemeIcon size="lg" radius="md" color="gray">
            <IconTool size={24} />
          </ThemeIcon>
          <div>
            <Title order={2}>System Diagnostics</Title>
            <Text c="dimmed">
              Real-time system health monitoring and diagnostic tools for administrators
            </Text>
          </div>
        </Group>
        <AdminDiagnostics />
      </Paper>
    </Container>
  )
}
