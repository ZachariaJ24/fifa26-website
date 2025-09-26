"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import Link from "next/link"
import {
  Users,
  Trophy,
  Calendar,
  Settings,
  ImageIcon,
  BarChart3,
  ShieldCheck,
  Newspaper,
  Database,
  GamepadIcon as GameController,
  Activity,
  ClipboardList,
  Bot,
  RefreshCw,
  MessageSquare,
  Trash2,
  Clock,
  DollarSign,
  Coins,
  Crown,
  Flame,
  Shield,
  Rocket,
  Zap,
  Target,
  TrendingUp,
  Award,
  Medal,
  Star,
  ArrowRight,
  Lock,
  Eye,
  Cog,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink,
  Heart,
  BookOpen
} from "lucide-react"
import AdminDiagnostics from "@/components/admin/admin-diagnostics"

export default function AdminDashboardPage() {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30">
        <div className="container mx-auto px-4 py-20">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Loading Admin Dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const adminLinks = [
    {
      title: "User Management",
      description: "Manage user accounts and roles",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/users",
      category: "user",
      color: "field-green"
    },
    {
      title: "Complete User Deletion",
      description: "Completely remove users from all systems",
      icon: <Trash2 className="h-6 w-6" />,
      href: "/admin/complete-user-deletion",
      category: "user",
      color: "goal-orange"
    },
    {
      title: "Banned Users Management",
      description: "View and manage banned users, ban/unban functionality",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/banned-users",
      category: "user",
      color: "goal-orange"
    },
    {
      title: "Team Management",
      description: "Manage teams and rosters",
      icon: <Trophy className="h-6 w-6" />,
      href: "/admin/teams",
      category: "team",
      color: "pitch-blue"
    },
    {
      title: "Schedule Management",
      description: "Manage game schedule and results",
      icon: <Calendar className="h-6 w-6" />,
      href: "/admin/schedule",
      category: "game",
      color: "stadium-gold"
    },
    {
      title: "Update Current Season",
      description: "Change the active season for registrations",
      icon: <Clock className="h-6 w-6" />,
      href: "/admin/update-current-season",
      category: "system",
      color: "slate"
    },
    {
      title: "Season Registrations",
      description: "Manage player season registrations",
      icon: <ClipboardList className="h-6 w-6" />,
      href: "/admin/registrations",
      category: "user",
      color: "field-green"
    },
    {
      title: "Team Availability",
      description: "View player availability and games played by week",
      icon: <Calendar className="h-6 w-6" />,
      href: "/admin/team-avail",
      category: "team",
      color: "pitch-blue"
    },
    {
      title: "Bidding Recap",
      description: "View comprehensive bidding statistics and player bid history",
      icon: <DollarSign className="h-6 w-6" />,
      href: "/admin/bidding-recap",
      category: "finance",
      color: "goal-orange"
    },
    {
      title: "Daily Recap",
      description: "Generate nightly recap for all teams based on recent matches",
      icon: <Newspaper className="h-6 w-6" />,
      href: "/admin/daily-recap",
      category: "content",
      color: "stadium-gold"
    },
    {
      title: "Manage Tokens",
      description: "Manage player tokens, redeemables, and redemption requests",
      icon: <Coins className="h-6 w-6" />,
      href: "/admin/tokens",
      category: "finance",
      color: "goal-orange"
    },
    {
      title: "News Management",
      description: "Manage news articles and announcements",
      icon: <Newspaper className="h-6 w-6" />,
      href: "/admin/news",
      category: "content",
      color: "stadium-gold"
    },
    {
      title: "Statistics Management",
      description: "Manage player and team statistics",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/admin/statistics",
      category: "data",
      color: "pitch-blue"
    },
    {
      title: "EA Stats",
      description: "View EA Sports FIFA player statistics",
      icon: <GameController className="h-6 w-6" />,
      href: "/admin/ea-stats",
      category: "data",
      color: "pitch-blue"
    },
    {
      title: "EA Matches",
      description: "View EA Sports FIFA match history",
      icon: <Activity className="h-6 w-6" />,
      href: "/admin/ea-matches",
      category: "data",
      color: "pitch-blue"
    },
    {
      title: "Awards Management",
      description: "Manage season awards and achievements",
      icon: <Trophy className="h-6 w-6" />,
      href: "/admin/awards",
      category: "content",
      color: "stadium-gold"
    },
    {
      title: "Photo Gallery",
      description: "Manage photos and media",
      icon: <ImageIcon className="h-6 w-6" />,
      href: "/admin/photos",
      category: "content",
      color: "stadium-gold"
    },
    {
      title: "Team Logos",
      description: "Manage team logos and branding",
      icon: <ImageIcon className="h-6 w-6" />,
      href: "/admin/team-logos",
      category: "team",
      color: "pitch-blue"
    },
    {
      title: "Email Verification",
      description: "Manage email verification",
      icon: <ShieldCheck className="h-6 w-6" />,
      href: "/admin/email-verification",
      category: "security",
      color: "slate"
    },
    {
      title: "Password Reset",
      description: "Reset user passwords directly",
      icon: <ShieldCheck className="h-6 w-6" />,
      href: "/admin/password-reset",
      category: "security",
      color: "slate"
    },
    {
      title: "System Settings",
      description: "Configure system settings",
      icon: <Settings className="h-6 w-6" />,
      href: "/admin/settings",
      category: "system",
      color: "slate"
    },
    {
      title: "User Diagnostics",
      description: "Diagnose and fix issues with user accounts, verification, and registration.",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/user-diagnostics",
      category: "user",
      color: "field-green"
    },
    {
      title: "User Account Manager",
      description: "Search, manage, and fix user account issues across all systems",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/user-account-manager",
      category: "user",
      color: "field-green"
    },
    {
      title: "FIFA 26 Bot",
      description: "Manage Discord bot integration, roles, and Twitch streaming",
      icon: <Bot className="h-6 w-6" />,
      href: "/admin/scs-bot",
      category: "integration",
      color: "stadium-gold"
    },
    {
      title: "Setup Bot Config",
      description: "Initialize and configure Discord bot settings",
      icon: <Settings className="h-6 w-6" />,
      href: "/admin/setup-bot-config",
      category: "integration",
      color: "stadium-gold"
    },
    {
      title: "Reset User Password",
      description: "Reset a user's password by email address.",
      icon: <ShieldCheck className="h-6 w-6" />,
      href: "/admin/reset-user-password",
      category: "security",
      color: "slate"
    },
    {
      title: "Auth to Database Sync",
      description: "Sync users from Supabase Auth to database tables",
      icon: <RefreshCw className="h-6 w-6" />,
      href: "/admin/sync-auth-database",
      category: "system",
      color: "slate"
    },
    {
      title: "Orphaned Auth Users",
      description: "Find and fix users from old auth system that exist in Auth but not in database",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/orphaned-auth-users",
      category: "user",
      color: "field-green"
    },
    {
      title: "Sync Missing Users",
      description: "Sync missing users between auth and database",
      icon: <RefreshCw className="h-6 w-6" />,
      href: "/admin/sync-missing-users",
      category: "system",
      color: "slate"
    },
    {
      title: "Fix User Constraints",
      description: "Fix console and gamer tag constraint violations for user sync",
      icon: <ShieldCheck className="h-6 w-6" />,
      href: "/admin/fix-user-constraints",
      category: "system",
      color: "slate"
    },
    {
      title: "Fix Console Values",
      description: "Fix invalid console values for users that failed to sync",
      icon: <GameController className="h-6 w-6" />,
      href: "/admin/fix-console-values",
      category: "system",
      color: "slate"
    },
    {
      title: "Role Sync Fix",
      description: "Fix role synchronization between user_roles and players tables",
      icon: <Shield className="h-6 w-6" />,
      href: "/admin/role-sync",
      category: "system",
      color: "slate"
    },
    {
      title: "Discord Debug",
      description: "Debug Discord bot integration and role assignments",
      icon: <Bot className="h-6 w-6" />,
      href: "/admin/discord-debug",
      category: "integration",
      color: "stadium-gold"
    },
    {
      title: "Forum Management",
      description: "Manage forum categories and posts",
      icon: <MessageSquare className="h-6 w-6" />,
      href: "/admin/forum",
      category: "content",
      color: "stadium-gold"
    },
    {
      title: "Featured Games",
      description: "Manage featured games on homepage",
      icon: <Trophy className="h-6 w-6" />,
      href: "/admin/featured-games",
      category: "content",
      color: "stadium-gold"
    },
    {
      title: "Player Mappings",
      description: "Manage EA player to user mappings",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/player-mappings",
      category: "data",
      color: "pitch-blue"
    },
    {
      title: "Database Structure",
      description: "Explore database tables and structure",
      icon: <Database className="h-6 w-6" />,
      href: "/admin/database-structure",
      category: "system",
      color: "slate"
    },
    {
      title: "RBAC Debug",
      description: "Debug role-based access control",
      icon: <ShieldCheck className="h-6 w-6" />,
      href: "/admin/rbac-debug",
      category: "security",
      color: "slate"
    },
  ]

  const categories = {
    user: { name: "User Management", icon: <Users className="h-5 w-5" />, color: "field-green" },
    team: { name: "Team Operations", icon: <Trophy className="h-5 w-5" />, color: "pitch-blue" },
    game: { name: "Game Management", icon: <GameController className="h-5 w-5" />, color: "stadium-gold" },
    system: { name: "System Tools", icon: <Settings className="h-5 w-5" />, color: "slate" },
    finance: { name: "Financial Tools", icon: <DollarSign className="h-5 w-5" />, color: "goal-orange" },
    content: { name: "Content Management", icon: <Newspaper className="h-5 w-5" />, color: "stadium-gold" },
    data: { name: "Data & Statistics", icon: <BarChart3 className="h-5 w-5" />, color: "pitch-blue" },
    security: { name: "Security & Access", icon: <Shield className="h-5 w-5" />, color: "slate" },
    integration: { name: "Integrations", icon: <Bot className="h-5 w-5" />, color: "stadium-gold" },
  }

  const groupedLinks = adminLinks.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = []
    }
    acc[link.category].push(link)
    return acc
  }, {} as Record<string, typeof adminLinks>)

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      'field-green': 'from-field-green-500 to-field-green-600',
      'pitch-blue': 'from-pitch-blue-500 to-pitch-blue-600',
      'stadium-gold': 'from-stadium-gold-500 to-stadium-gold-600',
      'goal-orange': 'from-goal-orange-500 to-goal-orange-600',
      'slate': 'from-slate-500 to-slate-600'
    }
    return colorMap[color] || 'from-field-green-500 to-field-green-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30">
      {/* Hero Header Section */}
      <div className="hockey-header relative py-16 px-4">
        <div className="container mx-auto text-center">
          <div>
            <h1 className="hockey-title mb-6">
              Admin Dashboard
            </h1>
            <p className="hockey-subtitle mb-8">
              Complete control center for managing FIFA 26 League operations, users, teams, and system configurations
            </p>
            
            {/* Admin Status Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-field-green-500 to-field-green-600 text-white px-6 py-3 rounded-full shadow-lg shadow-field-green-500/25 border-2 border-white dark:border-slate-800">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">Administrator Access Granted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20">
        {/* Category-based Admin Tools */}
        <div className="space-y-12">
          {Object.entries(groupedLinks).map(([categoryKey, links]) => {
            const category = categories[categoryKey as keyof typeof categories]
            return (
              <div key={categoryKey} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${getColorClasses(category.color)} rounded-xl flex items-center justify-center shadow-lg`}>
                    <div className="text-white">
                      {category.icon}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                      {category.name}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      {links.length} tool{links.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {links.map((link, index) => (
                    <Link key={index} href={link.href} className="block group">
                      <Card className="fifa-card-hover-enhanced h-full group-hover:scale-105 transition-all duration-300 cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between pb-4 relative">
                          <CardTitle className="text-xl text-slate-800 dark:text-slate-200 group-hover:text-field-green-600 dark:group-hover:text-field-green-400 transition-colors duration-200">
                            {link.title}
                          </CardTitle>
                          <div className={`text-white bg-gradient-to-r ${getColorClasses(link.color)} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                            {link.icon}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-4">
                            {link.description}
                          </CardDescription>
                          
                          {/* Action Indicator */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-field-green-600 dark:text-field-green-400 font-medium group-hover:text-field-green-700 dark:group-hover:text-field-green-300 transition-colors duration-200">
                              <span>Access Tool</span>
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                            </div>
                            
                            {/* Category Badge */}
                            <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getColorClasses(link.color)} bg-opacity-10 text-${link.color}-700 dark:text-${link.color}-300 border border-${link.color}-200 dark:border-${link.color}-700`}>
                              {category.name}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* System Diagnostics Section */}
        <div className="mt-20">
          <Card className="fifa-card-hover-enhanced group">
            <CardHeader className="relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-100 to-field-green-100 dark:from-slate-800/30 dark:to-field-green-900/30 rounded-full -mr-6 -mt-6 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <CardTitle className="flex items-center gap-3 text-2xl relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-slate-500 to-field-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-field-green-500/25">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                System Diagnostics & Monitoring
              </CardTitle>
              <CardDescription className="text-lg relative z-10">
                Real-time system health monitoring and diagnostic tools for administrators
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <AdminDiagnostics />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}