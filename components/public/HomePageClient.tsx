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
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-none">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Trusted by the Best Teams</h2>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">Our platform is the choice for top-tier teams and players.</p>
              </div>
              <dl className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 text-center lg:grid-cols-3">
                <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                  <dt className="text-base leading-7 text-muted-foreground">Active Players</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                    <AnimatedCounter end={stats.totalPlayers} />
                  </dd>
                </div>
                <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                  <dt className="text-base leading-7 text-muted-foreground">Clubs</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                    <AnimatedCounter end={stats.totalTeams} />
                  </dd>
                </div>
                <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                  <dt className="text-base leading-7 text-muted-foreground">Fixtures</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                    <AnimatedCounter end={stats.totalMatches} />
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Featured Games Section */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-none">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Featured Matches</h2>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">Don't miss these highlighted matches from our competitive league.</p>
              </div>
              {loading.featured ? (
                <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-y-4">
                      <Skeleton className="h-48 w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : featuredGames.length > 0 ? (
                <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                  {featuredGames.map((game) => (
                    <Link key={game.id} href={`/matches/${game.id}`} className="flex flex-col gap-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/50 to-transparent" />
                        <img
                          src={`https://source.unsplash.com/random/800x600?soccer,${game.id}`}
                          alt={`${game.home_team?.name} vs ${game.away_team?.name}`}
                          className="h-48 w-full rounded-lg object-cover"
                        />
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="text-lg font-semibold">{`${game.home_team?.name} vs ${game.away_team?.name}`}</h3>
                          <p className="text-sm">{new Date(game.match_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">{game.status}</p>
                        <p className="text-sm font-medium text-primary hover:underline">View Details</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-16 text-center">
                  <p className="text-lg text-muted-foreground">No featured matches yet. Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* About SFS Section */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-none">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">About Secret Football Society (SFS)</h2>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">Discover what makes SFS the premier destination for competitive football gaming.</p>
              </div>
              <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
                <div className="flex flex-col gap-y-4">
                  <div className="flex items-center gap-x-4">
                    <div className="flex-none rounded-lg bg-primary p-3">
                      <GamepadIcon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold leading-7 text-foreground">Premier SFS League</h3>
                  </div>
                  <p className="text-base leading-7 text-muted-foreground">Secret Football Society (SFS) is a competitive and professionally organized FC 26 football league. We provide a complete football simulation experience with structured seasons, playoffs, and championship tournaments that mirror real football operations.</p>
                </div>
                <div className="flex flex-col gap-y-4">
                  <div className="flex items-center gap-x-4">
                    <div className="flex-none rounded-lg bg-primary p-3">
                      <Users className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold leading-7 text-foreground">Professional Community</h3>
                  </div>
                  <p className="text-base leading-7 text-muted-foreground">Connect with hundreds of dedicated FIFA 26 players in a top-tier competitive environment. Our community consists of seasoned gamers and football enthusiasts who are passionate about strategic play and sportsmanship.</p>
                </div>
              </div>
              <div className="mt-16 text-center">
                <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Why Choose Secret Football Society?</h3>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">Join players who have made SFS their home for competitive football. Experience the perfect blend of professional league management, cutting-edge technology, and a passionate community that shares your love for football.</p>
                <div className="mt-8 flex justify-center gap-x-8">
                  <div className="flex items-center gap-x-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="text-base font-medium text-muted-foreground">Fair Play</span>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Clock className="h-6 w-6 text-primary" />
                    <span className="text-base font-medium text-muted-foreground">24/7 Support</span>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Star className="h-6 w-6 text-primary" />
                    <span className="text-base font-medium text-muted-foreground">Excellence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced League Features Section */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-none">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Advanced League Features</h2>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">Discover the cutting-edge features that make FIFA 26 League the most advanced football league platform.</p>
              </div>
              <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                <div className="flex flex-col gap-y-4">
                  <div className="flex items-center gap-x-4">
                    <div className="flex-none rounded-lg bg-primary p-3">
                      <TrendingUp className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold leading-7 text-foreground">Advanced Stat Tracking</h3>
                  </div>
                  <p className="text-base leading-7 text-muted-foreground">Our platform provides in-depth player and team statistics, including advanced metrics to track performance and identify areas for improvement.</p>
                </div>
                <div className="flex flex-col gap-y-4">
                  <div className="flex items-center gap-x-4">
                    <div className="flex-none rounded-lg bg-primary p-3">
                      <Zap className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold leading-7 text-foreground">Live Match Streaming</h3>
                  </div>
                  <p className="text-base leading-7 text-muted-foreground">Watch live matches with real-time statistics and commentary. Our streaming service provides a professional broadcast experience for all league games.</p>
                </div>
                <div className="flex flex-col gap-y-4">
                  <div className="flex items-center gap-x-4">
                    <div className="flex-none rounded-lg bg-primary p-3">
                      <Target className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold leading-7 text-foreground">Comprehensive Club Management</h3>
                  </div>
                  <p className="text-base leading-7 text-muted-foreground">Manage your club with a full suite of tools, including transfers, player contracts, and team finances. Our platform provides a realistic and immersive management experience.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Games and Standings Section */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-none">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Games & Standings</h2>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">Stay up-to-date with the latest match results and league standings.</p>
              </div>
              <Tabs defaultValue="upcoming" className="mt-16">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="standings">Standings</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="mt-8">
                  {loading.games ? (
                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-y-4">
                          <Skeleton className="h-48 w-full rounded-lg" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : upcomingGames.length > 0 ? (
                    <UpcomingGames games={upcomingGames} />
                  ) : (
                    <div className="text-center">
                      <p className="text-lg text-muted-foreground">No upcoming games scheduled.</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="completed" className="mt-8">
                  {loading.games ? (
                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-y-4">
                          <Skeleton className="h-48 w-full rounded-lg" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : completedGames.length > 0 ? (
                    <CompletedGames games={completedGames} />
                  ) : (
                    <div className="text-center">
                      <p className="text-lg text-muted-foreground">No completed games found.</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="standings" className="mt-8">
                  {loading.standings ? (
                    <Skeleton className="h-96 w-full rounded-lg" />
                  ) : standings.length > 0 ? (
                    <TeamStandings teams={standings} />
                  ) : (
                    <div className="text-center">
                      <p className="text-lg text-muted-foreground">Standings are not available yet.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Latest News Section */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-none">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Latest News</h2>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">Stay informed with the latest updates and announcements from the league.</p>
              </div>
              {loading.news ? (
                <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-y-4">
                      <Skeleton className="h-48 w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : news.length > 0 ? (
                <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
                  {news.map((item) => (
                    <NewsCard key={item.id} news={item} />
                  ))}
                </div>
              ) : (
                <div className="mt-16 text-center">
                  <p className="text-lg text-muted-foreground">No news articles found.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-none">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Ready to Join the Action?</h2>
                <p className="mt-4 text-lg leading-8 text-muted-foreground">Register now to join the most competitive FIFA 26 league and showcase your skills.</p>
                <div className="mt-8 flex justify-center gap-x-4">
                  <Button asChild>
                    <Link href="/register">Register Now</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
