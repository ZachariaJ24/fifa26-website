// Midnight Studios INTl - All rights reserved
"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TeamLogo } from "@/components/team-logo"
import {
  Trophy,
  Users,
  Calendar,
  BarChart3,
  Shield,
  ArrowRight,
  ChevronRight,
  Clock,
  Zap,
  Play,
  Crown,
  Target,
  Star,
  Award,
  Activity,
} from "lucide-react"

interface HomePageClientProps {
  session: any
  stats: { players: number; teams: number; matches: number }
  featuredGames: any[]
  latestNews: any[]
  upcomingFixtures: any[]
  recentResults: any[]
  standings: Record<string, any[]>
}

function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  useEffect(() => {
    if (!isInView) return

    let startTime: number
    const startCount = 0

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(startCount + (end - startCount) * easeOutQuart)
      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(updateCount)
      }
    }

    requestAnimationFrame(updateCount)
  }, [isInView, end, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export default function HomePageClient({ session, stats, featuredGames, latestNews, upcomingFixtures, recentResults, standings }: HomePageClientProps) {
  const StatCard = ({ icon, value, label, color }: { icon: React.ElementType, value: number, label: string, color: string }) => {
    const Icon = icon
    const getColorClasses = (color: string) => {
      switch (color) {
        case "field-green": return "from-field-green-500 to-field-green-600"
        case "pitch-blue": return "from-pitch-blue-500 to-pitch-blue-600"
        case "stadium-gold": return "from-stadium-gold-500 to-stadium-gold-600"
        case "goal-orange": return "from-goal-orange-500 to-goal-orange-600"
        default: return "from-field-green-500 to-field-green-600"
      }
    }
    
    return (
      <div className="fifa-card-hover-enhanced p-6 text-center">
        <div className={`p-4 rounded-xl bg-gradient-to-r ${getColorClasses(color)} shadow-lg mb-4 mx-auto w-fit`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div className="text-3xl font-bold text-field-green-800 dark:text-field-green-200 mb-2">
          <AnimatedCounter end={value} />
        </div>
        <p className="text-sm text-field-green-600 dark:text-field-green-400 font-medium">{label}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900 text-foreground fifa-scrollbar">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-field-green-500/30 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
            }}
            animate={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
            }}
            transition={{
              duration: Math.random() * 25 + 15,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-fifa-pattern opacity-5"></div>
        
        {/* Floating Elements */}
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-field-green-200/30 to-pitch-blue-200/30 rounded-full blur-3xl"
          animate={{ 
            y: [-20, 20, -20],
            x: [-10, 10, -10]
          }}
          transition={{ 
            duration: 6, 
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-stadium-gold-200/30 to-goal-orange-200/30 rounded-full blur-3xl"
          animate={{ 
            y: [20, -20, 20],
            x: [10, -10, 10]
          }}
          transition={{ 
            duration: 8, 
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}>
            <motion.h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.2 }}>
              <span className="fifa-gradient-text-animated">FIFA 26</span>
              <br />
              <span className="bg-gradient-to-r from-pitch-blue-600 via-stadium-gold-600 to-field-green-600 bg-clip-text text-transparent">LEAGUE</span>
            </motion.h1>
            <motion.p className="text-xl md:text-2xl lg:text-3xl text-field-green-700 dark:text-field-green-300 mb-12 font-medium max-w-4xl mx-auto leading-relaxed" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }}>
              The premier competitive FIFA gaming experience.
              <br className="hidden md:block" />
              Join elite players in the ultimate football league.
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.8 }}>
              <Button asChild size="lg" className="fifa-button-enhanced px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl">
                <Link href="/register" className="flex items-center gap-3"><Trophy className="w-6 h-6" /> JOIN THE LEAGUE <ArrowRight className="w-5 h-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-field-green-600 text-field-green-600 hover:bg-field-green-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl transition-all duration-300 hover:scale-105">
                <Link href="/standings" className="flex items-center gap-3"><BarChart3 className="w-6 h-6" /> VIEW STANDINGS</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
        <motion.div className="absolute bottom-8 left-1/2 transform -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronRight className="w-6 h-6 text-field-green-600 rotate-90" />
        </motion.div>
      </section>

      {/* League Stats Section */}
      <motion.section
        className="py-20 px-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-field-green-600 via-pitch-blue-600 to-stadium-gold-600 dark:from-field-green-400 dark:via-pitch-blue-400 dark:to-stadium-gold-400 bg-clip-text text-transparent leading-tight tracking-tight mb-6">
              League Statistics
            </h2>
            <p className="text-xl md:text-2xl text-field-green-700 dark:text-field-green-300 leading-relaxed max-w-3xl mx-auto">
              Real-time data from our advanced tracking system
            </p>
            <div className="h-1 w-24 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full mx-auto mt-8"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                label: "Active Players",
                value: stats.players,
                color: "bg-pitch-blue-500",
              },
              {
                icon: Shield,
                label: "Teams",
                value: stats.teams,
                color: "bg-field-green-500",
              },
              {
                icon: Calendar,
                label: "Matches",
                value: stats.matches,
                color: "bg-stadium-gold-500",
              },
              {
                icon: Activity,
                label: "Total Members",
                value: stats.players + stats.teams,
                color: "bg-goal-orange-500",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-field-green-200/50 dark:border-field-green-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-2 p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${stat.color} rounded-xl shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-field-green-800 dark:text-field-green-200 mb-2">
                      <AnimatedCounter end={stat.value} />
                    </div>
                    <div className="text-sm text-field-green-600 dark:text-field-green-400 font-medium">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Games Section */}
      <motion.section
        className="py-20 px-4"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-field-green-600 via-pitch-blue-600 to-stadium-gold-600 dark:from-field-green-400 dark:via-pitch-blue-400 dark:to-stadium-gold-400 bg-clip-text text-transparent leading-tight tracking-tight mb-6">
              Featured Games
            </h2>
            <p className="text-xl md:text-2xl text-field-green-700 dark:text-field-green-300 leading-relaxed max-w-3xl mx-auto">
              Don't miss these highlighted matches from our competitive league
            </p>
            <div className="h-1 w-24 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full mx-auto mt-8"></div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-2 hover:shadow-2xl"
              >
                <Link href={`/matches/${game.id}`}>
                  <Card className="h-full cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-stadium-gold-500" />
                          <span className="text-sm font-semibold text-stadium-gold-600 dark:text-stadium-gold-400">
                            Featured Match
                          </span>
                        </div>
                        <span className="text-xs text-field-green-500 dark:text-field-green-400">
                          {new Date(game.match_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Home Team */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-field-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {game.home_team?.name?.charAt(0) || "H"}
                            </span>
                          </div>
                          <span className="font-semibold text-field-green-800 dark:text-field-green-200 flex-1">
                            {game.home_team?.name || "Home Team"}
                          </span>
                          <span className="text-2xl font-bold text-field-green-600 dark:text-field-green-400">
                            {game.home_score || 0}
                          </span>
                        </div>

                        {/* VS */}
                        <div className="text-center">
                          <span className="text-sm font-medium text-field-green-500 dark:text-field-green-400">VS</span>
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-pitch-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {game.away_team?.name?.charAt(0) || "A"}
                            </span>
                          </div>
                          <span className="font-semibold text-field-green-800 dark:text-field-green-200 flex-1">
                            {game.away_team?.name || "Away Team"}
                          </span>
                          <span className="text-2xl font-bold text-pitch-blue-600 dark:text-pitch-blue-400">
                            {game.away_score || 0}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-field-green-200 dark:border-field-green-700">
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            game.status === 'Completed' 
                              ? 'bg-field-green-100 text-field-green-800 dark:bg-field-green-900 dark:text-field-green-200'
                              : game.status === 'Scheduled'
                              ? 'bg-pitch-blue-100 text-pitch-blue-800 dark:bg-pitch-blue-900 dark:text-pitch-blue-200'
                              : 'bg-stadium-gold-100 text-stadium-gold-800 dark:bg-stadium-gold-900 dark:text-stadium-gold-200'
                          }`}>
                            {game.status}
                          </span>
                          <span className="text-xs text-field-green-500 dark:text-field-green-400 hover:text-field-green-700 dark:hover:text-field-green-300 transition-colors">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* About FIFA League Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="fifa-title-enhanced mb-6">About FIFA League</h2>
            <p className="text-lg text-field-green-700 dark:text-field-green-300 leading-relaxed">FIFA League is the ultimate destination for competitive FIFA players. We provide a professionally managed platform for gamers to showcase their skills, compete for glory, and be part of a thriving community.</p>
          </motion.div>
          <div className="grid gap-8">
            <Card className="fifa-card-hover-enhanced p-6">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                <Trophy className="text-stadium-gold-500" /> Premier FIFA 26 League
              </h3>
              <p className="text-field-green-600 dark:text-field-green-400">Our league is built on fair play, competition, and community. We offer a structured season format, detailed stat tracking, and a dedicated admin team.</p>
            </Card>
            <Card className="fifa-card-hover-enhanced p-6">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                <Users className="text-pitch-blue-500" /> Professional Community
              </h3>
              <p className="text-field-green-600 dark:text-field-green-400">Join hundreds of passionate FIFA players. Discuss strategies, find teammates, and engage in community events. Our Discord server is the heart of our league.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose FIFA League? Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="fifa-title-enhanced mb-12">Why Choose FIFA League?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="fifa-card-hover-enhanced p-6">
              <Zap className="h-10 w-10 text-field-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2">Advanced League Features</h3>
              <p className="text-field-green-600 dark:text-field-green-400">Live stat tracking, player awards, and a comprehensive transfer market.</p>
            </Card>
            <Card className="fifa-card-hover-enhanced p-6">
              <Users className="h-10 w-10 text-pitch-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2">Active Community</h3>
              <p className="text-field-green-600 dark:text-field-green-400">Engage with players and staff on our active Discord server and forums.</p>
            </Card>
            <Card className="fifa-card-hover-enhanced p-6">
              <Trophy className="h-10 w-10 text-stadium-gold-600 mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2">Competitive Play</h3>
              <p className="text-field-green-600 dark:text-field-green-400">Face off against the best players and climb the ranks to become a champion.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="fifa-title-enhanced mb-12">Latest News</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestNews.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.2 }}>
                <Card className="fifa-card-hover-enhanced overflow-hidden text-left h-full">
                  <CardContent className="p-6">
                    <p className="text-sm text-field-green-600 dark:text-field-green-400 mb-2">{item.date}</p>
                    <h3 className="font-bold text-xl mb-4 text-field-green-800 dark:text-field-green-200">{item.title}</h3>
                    <p className="text-field-green-600 dark:text-field-green-400 mb-4">{item.excerpt}</p>
                    <Button asChild variant="link" className="p-0 text-field-green-600 dark:text-field-green-400 font-bold hover:text-field-green-800 dark:hover:text-field-green-200">
                      <a>Read More <ArrowRight className="w-4 h-4 ml-1" /></a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Fixtures Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="fifa-title-enhanced text-center mb-12">Upcoming Fixtures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {upcomingFixtures.map((match, index) => (
              <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.2 }}>
                <Card className="fifa-card-hover-enhanced overflow-hidden text-left">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-sm text-field-green-600 dark:text-field-green-400">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(match.match_date).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TeamLogo teamName={match.home_team.name} logoUrl={match.home_team.logo_url} size="sm" />
                        <span className="font-bold text-lg text-field-green-800 dark:text-field-green-200">{match.home_team.name}</span>
                      </div>
                      <div className="font-bold text-2xl text-field-green-600 dark:text-field-green-400">vs</div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-field-green-800 dark:text-field-green-200">{match.away_team.name}</span>
                        <TeamLogo teamName={match.away_team.name} logoUrl={match.away_team.logo_url} size="sm" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Results and Standings Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="results">
            <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto fifa-tabs-list mb-8">
              <TabsTrigger value="results" className="fifa-tab-trigger">Recent Results</TabsTrigger>
              <TabsTrigger value="standings" className="fifa-tab-trigger">League Standings</TabsTrigger>
            </TabsList>
            <TabsContent value="results">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {recentResults.map((match, index) => (
                  <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.2 }}>
                    <Card className="fifa-card-hover-enhanced overflow-hidden text-left">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2 text-sm text-field-green-600 dark:text-field-green-400">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(match.match_date).toLocaleDateString()}</span>
                          </div>
                          <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-full">Completed</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <TeamLogo teamName={match.home_team.name} logoUrl={match.home_team.logo_url} size="sm" />
                            <span className="font-bold text-lg text-field-green-800 dark:text-field-green-200">{match.home_team.name}</span>
                          </div>
                          <div className="font-bold text-2xl text-field-green-600 dark:text-field-green-400">{match.home_score} - {match.away_score}</div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-field-green-800 dark:text-field-green-200">{match.away_team.name}</span>
                            <TeamLogo teamName={match.away_team.name} logoUrl={match.away_team.logo_url} size="sm" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="standings">
              <div className="space-y-8">
                {Object.entries(standings).map(([conference, teams]) => (
                  <div key={conference}>
                    <h3 className="text-2xl font-bold mb-4 text-center fifa-gradient-text">{conference}</h3>
                    <Card className="fifa-card-hover-enhanced overflow-hidden">
                      <Table className="fifa-standings-table">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Team</TableHead>
                            <TableHead>W</TableHead>
                            <TableHead>L</TableHead>
                            <TableHead>OTL</TableHead>
                            <TableHead>Points</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teams.map(team => (
                            <TableRow key={team.id} className="fifa-table-row-hover">
                              <TableCell className="flex items-center gap-2">
                                <TeamLogo teamName={team.name} logoUrl={team.logo_url} size="sm" /> 
                                <span className="text-field-green-800 dark:text-field-green-200">{team.name}</span>
                              </TableCell>
                              <TableCell className="text-field-green-600 dark:text-field-green-400">{team.wins}</TableCell>
                              <TableCell className="text-field-green-600 dark:text-field-green-400">{team.losses}</TableCell>
                              <TableCell className="text-field-green-600 dark:text-field-green-400">{team.otl}</TableCell>
                              <TableCell className="font-bold text-stadium-gold-600 dark:text-stadium-gold-400">{team.points}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Join League CTA Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background with overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-field-green-600 via-pitch-blue-600 to-stadium-gold-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              Join the FIFA 26 League Today!
            </h2>
            <p className="text-xl mb-12 text-white/95 max-w-2xl mx-auto drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
              Your journey to becoming a FIFA legend starts now. Register for the upcoming season and write your own story.
            </p>
            <Button asChild size="lg" className="bg-white text-field-green-600 hover:bg-field-green-50 px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/20">
              <Link href="/register" className="flex items-center gap-3"><Play className="w-6 h-6" /> GET STARTED</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
