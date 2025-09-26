// Midnight Studios INTl - All rights reserved
"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import NewsCard from "@/components/news-card"
import UpcomingGames from "@/components/upcoming-games"
import CompletedGames from "@/components/completed-games"
import TeamStandings from "@/components/team-standings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import HeroCarousel from "@/components/hero-carousel"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Trophy,
  Users,
  Calendar,
  TrendingUp,
  Zap,
  Star,
  GamepadIcon,
  Target,
  BarChart3,
  Gift,
  Shield,
  Clock,
  Award,
  Database,
  Coins,
  Crown,
  Activity,
  Gamepad2,
  Medal,
  BarChartIcon as ChartBar,
} from "lucide-react"
import { BannedUserModal } from "@/components/auth/banned-user-modal"
import { LeagueSelector } from "@/components/league/LeagueSelector"

// Animated counter component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = React.useRef(null)
  const isInView = useInView(ref)

  useEffect(() => {
    if (!isInView) return

    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [end, duration, isInView])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

export default function HomePageClient() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Handle password reset redirects
  useEffect(() => {
    const code = searchParams.get("code")
    const type = searchParams.get("type")
    
    if (code && type === "recovery") {
      // Redirect to reset password page with the code
      router.push(`/reset-password?code=${code}&type=${type}`)
      return
    }
    
    if (code) {
      // If there's a code but no type, assume it's a password reset
      router.push(`/reset-password?code=${code}`)
      return
    }
  }, [searchParams, router])
  const [news, setNews] = useState<any[]>([])
  const [upcomingGames, setUpcomingGames] = useState<any[]>([])
  const [completedGames, setCompletedGames] = useState<any[]>([])
  const [standings, setStandings] = useState<any[]>([])
  const [featuredGames, setFeaturedGames] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalTeams: 0,
    totalMatches: 0,
  })
  const [loading, setLoading] = useState({
    news: true,
    games: true,
    standings: true,
    featured: true,
  })
  const [heroImages, setHeroImages] = useState<{ url: string; title: string; subtitle: string }[]>([
    {
      url: "https://kudmtqjzuxakngbrqxzp.supabase.co/storage/v1/object/public/logoheader/scslogo.png?height=600&width=1200",
      title: "Welcome to Secret Football Society (SFS)",
      subtitle: "Premier FC 26 competitive football with advanced stat tracking",
    },
    {
      url: "https://kudmtqjzuxakngbrqxzp.supabase.co/storage/v1/object/public/logoheader/scslogo.png?height=600&width=1200",
      title: "Season Registration Open",
      subtitle: "Join SFS and earn rewards through our token system",
    },
    {
      url: "https://kudmtqjzuxakngbrqxzp.supabase.co/storage/v1/object/public/logoheader/scslogo.png?height=600&width=1200",
      title: "Live Match Streaming",
      subtitle: "Watch SFS matches with real-time statistics and commentary",
    },
  ])

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stats
        const [playersRes, teamsRes, matchesRes] = await Promise.all([
          supabase.from("users").select("id", { count: "exact" }),
          supabase
            .from("teams")
            .select("id", { count: "exact" })
            .eq("is_active", true),
          supabase.from("matches").select("id", { count: "exact" }),
        ])

        setStats({
          totalPlayers: playersRes.count || 0,
          totalTeams: teamsRes.count || 0,
          totalMatches: matchesRes.count || 0,
        })

        // Fetch latest news
        const { data: newsData, error: newsError } = await supabase
          .from("news")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(3)

        if (newsError) throw newsError
        setNews(newsData || [])
        setLoading((prev) => ({ ...prev, news: false }))

        // Fetch games and standings
        const response = await fetch('/api/standings')
        if (!response.ok) {
          throw new Error('Failed to fetch standings')
        }
        const data = await response.json()
        setStandings(data.standings)
        setLoading((prev) => ({ ...prev, standings: false }))

        const { data: upcomingData, error: upcomingError } = await supabase
          .from("matches")
          .select(`*, home_team:home_team_id(name, logo_url), away_team:away_team_id(name, logo_url)`)
          .eq("status", "Scheduled")
          .order("match_date", { ascending: true })
          .limit(6)
        if(upcomingError) throw upcomingError
        setUpcomingGames(upcomingData || [])

        const { data: completedData, error: completedError } = await supabase
          .from("matches")
          .select(`*, home_team:home_team_id(name, logo_url), away_team:away_team_id(name, logo_url)`)
          .eq("status", "Completed")
          .order("match_date", { ascending: false })
          .limit(6)
        if(completedError) throw completedError
        setCompletedGames(completedData || [])
        setLoading((prev) => ({ ...prev, games: false }))

        const { data: featuredData, error: featuredError } = await supabase
          .from("matches")
          .select(`*, home_team:home_team_id(name, logo_url), away_team:away_team_id(name, logo_url)`)
          .eq("featured", true)
          .order("match_date", { ascending: false })
          .limit(3)
        if(featuredError) throw featuredError
        setFeaturedGames(featuredData || [])
        setLoading((prev) => ({ ...prev, featured: false }))

      } catch (err) {
        toast({
          title: "Error loading data",
          description: err instanceof Error ? err.message : "Failed to load content. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [supabase, toast])

  return (
    <div className="min-h-screen bg-background">
      <BannedUserModal />
      <main>
        <HeroCarousel images={heroImages} />

        {/* League Selector */}
        <section className="container mx-auto px-4 mt-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Select League</h2>
            <LeagueSelector />
          </div>
        </section>

        {/* League Statistics Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight tracking-tight mb-6">League Statistics</h2>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">Real-time data from our advanced tracking system</p>
              <div className="h-1 w-24 bg-primary rounded-full mx-auto mt-8"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  label: "Active Players",
                  value: stats.totalPlayers,
                  color: "from-green-500 to-green-600",
                },
                {
                  icon: Trophy,
                  label: "Clubs",
                  value: stats.totalTeams,
                  color: "from-blue-500 to-blue-600",
                },
                {
                  icon: Calendar,
                  label: "Fixtures",
                  value: stats.totalMatches,
                  color: "from-yellow-500 to-yellow-600",
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-card border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-105 p-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={`p-4 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg inline-block mb-4`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    <AnimatedCounter end={stat.value} />
                  </div>
                  <div className="text-lg text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Games Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight tracking-tight mb-6">Featured Matches</h2>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">Don't miss these highlighted matches from our competitive league.</p>
              <div className="h-1 w-24 bg-primary rounded-full mx-auto mt-8"></div>
            </div>

            {loading.featured ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card border border-border/50 rounded-2xl shadow-lg p-6">
                    <Skeleton className="h-40 w-full rounded-lg mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : featuredGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    className="bg-card border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-105 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link href={`/matches/${game.id}`} className="block">
                      <div className="relative h-40 bg-cover bg-center" style={{ backgroundImage: `url(https://source.unsplash.com/random/800x600?soccer,${game.id})` }}>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="text-center text-white">
                            <p className="text-sm font-semibold">{new Date(game.match_date).toLocaleDateString()}</p>
                            <h3 className="text-xl font-bold">{`${game.home_team?.name} vs ${game.away_team?.name}`}</h3>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <img src={game.home_team?.logo_url} alt={game.home_team?.name} className="h-8 w-8" />
                            <span className="font-semibold">{game.home_team?.name}</span>
                          </div>
                          <span className="text-muted-foreground">vs</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{game.away_team?.name}</span>
                            <img src={game.away_team?.logo_url} alt={game.away_team?.name} className="h-8 w-8" />
                          </div>
                        </div>
                        <Button className="w-full">View Match Details</Button>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">No featured matches yet. Check back soon!</p>
              </div>
            )}
          </div>
        </section>

        {/* About SFS Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-muted/50 to-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight tracking-tight mb-6">About Secret Football Society (SFS)</h2>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">Discover what makes SFS the premier destination for competitive football gaming.</p>
              <div className="h-1 w-24 bg-primary rounded-full mx-auto mt-8"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                    <GamepadIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Premier SFS League</h3>
                    <p className="text-lg text-muted-foreground">SFS is a competitive and professionally organized FC 26 football league, offering a complete simulation experience with structured seasons, playoffs, and championships.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Professional Community</h3>
                    <p className="text-lg text-muted-foreground">Connect with dedicated FC 26 players in a top-tier competitive environment. Our community is passionate about strategic play and sportsmanship.</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img src="https://source.unsplash.com/random/800x600?soccer-stadium" alt="Soccer Stadium" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <h3 className="text-3xl font-bold mb-4">Why Choose SFS?</h3>
                    <p className="text-lg mb-6">Experience professional league management, cutting-edge technology, and a passionate community.</p>
                    <div className="flex justify-center gap-8">
                      <div className="text-center">
                        <Shield className="h-10 w-10 text-primary mx-auto mb-2" />
                        <span className="font-semibold">Fair Play</span>
                      </div>
                      <div className="text-center">
                        <Clock className="h-10 w-10 text-primary mx-auto mb-2" />
                        <span className="font-semibold">24/7 Support</span>
                      </div>
                      <div className="text-center">
                        <Star className="h-10 w-10 text-primary mx-auto mb-2" />
                        <span className="font-semibold">Excellence</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Advanced League Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight tracking-tight mb-6">Advanced League Features</h2>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">Discover the cutting-edge features that make SFS the most advanced football league platform.</p>
              <div className="h-1 w-24 bg-primary rounded-full mx-auto mt-8"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: TrendingUp,
                  title: "Advanced Stat Tracking",
                  description: "In-depth player and team statistics, including advanced metrics to track performance.",
                  color: "from-purple-500 to-purple-600",
                },
                {
                  icon: Zap,
                  title: "Live Match Streaming",
                  description: "Watch live matches with real-time statistics and commentary for a professional broadcast experience.",
                  color: "from-red-500 to-red-600",
                },
                {
                  icon: Target,
                  title: "Club Management",
                  description: "A full suite of tools for transfers, contracts, and finances for an immersive management experience.",
                  color: "from-indigo-500 to-indigo-600",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-card border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-105 p-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={`p-4 bg-gradient-to-br ${feature.color} rounded-xl shadow-lg inline-block mb-6`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
                  <p className="text-lg text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Games and Standings Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight tracking-tight mb-6">Games & Standings</h2>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">Stay up-to-date with the latest match results and league standings.</p>
              <div className="h-1 w-24 bg-primary rounded-full mx-auto mt-8"></div>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-card border border-border/50 rounded-xl p-2">
                <TabsTrigger value="upcoming" className="py-3 rounded-lg text-lg font-semibold">Upcoming</TabsTrigger>
                <TabsTrigger value="completed" className="py-3 rounded-lg text-lg font-semibold">Completed</TabsTrigger>
                <TabsTrigger value="standings" className="py-3 rounded-lg text-lg font-semibold">Standings</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="mt-8">
                {loading.games ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-card border border-border/50 rounded-2xl shadow-lg p-6">
                        <Skeleton className="h-40 w-full rounded-lg mb-4" />
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : upcomingGames.length > 0 ? (
                  <UpcomingGames games={upcomingGames} />
                ) : (
                  <div className="text-center py-16">
                    <p className="text-xl text-muted-foreground">No upcoming games scheduled.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="completed" className="mt-8">
                {loading.games ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-card border border-border/50 rounded-2xl shadow-lg p-6">
                        <Skeleton className="h-40 w-full rounded-lg mb-4" />
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : completedGames.length > 0 ? (
                  <CompletedGames games={completedGames} />
                ) : (
                  <div className="text-center py-16">
                    <p className="text-xl text-muted-foreground">No completed games found.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="standings" className="mt-8">
                {loading.standings ? (
                  <Skeleton className="h-96 w-full rounded-lg" />
                ) : standings.length > 0 ? (
                  <TeamStandings teams={standings} />
                ) : (
                  <div className="text-center py-16">
                    <p className="text-xl text-muted-foreground">Standings are not available yet.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Latest News Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight tracking-tight mb-6">Latest News</h2>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">Stay informed with the latest updates and announcements from the league.</p>
              <div className="h-1 w-24 bg-primary rounded-full mx-auto mt-8"></div>
            </div>

            {loading.news ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card border border-border/50 rounded-2xl shadow-lg p-6">
                    <Skeleton className="h-40 w-full rounded-lg mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {news.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <NewsCard news={item} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">No news articles found.</p>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-r from-primary to-secondary p-12 text-center">
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="relative">
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight mb-6">Ready to Join the Action?</h2>
                <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-10">Register now to join the most competitive FC 26 league and showcase your skills.</p>
                <div className="flex justify-center gap-x-6">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild size="lg" className="text-lg font-semibold px-8 py-6 bg-white text-primary hover:bg-white/90">
                      <Link href="/register">Register Now</Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild size="lg" variant="outline" className="text-lg font-semibold px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-primary">
                      <Link href="/login">Login</Link>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
