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
  const StatCard = ({ icon, value, label }: { icon: React.ElementType, value: number, label: string }) => {
    const Icon = icon
    return (
      <motion.div
        className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl p-6 text-center shadow-lg"
        whileHover={{ y: -5, scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Icon className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
        <div className="text-4xl font-bold text-emerald-800"><AnimatedCounter end={value} /></div>
        <p className="text-emerald-700 font-medium mt-1">{label}</p>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 25px 25px, #16a34a 2px, transparent 0), radial-gradient(circle at 75px 75px, #0d9488 2px, transparent 0)`, backgroundSize: '100px 100px' }} />
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}>
            <motion.h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.2 }}>
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">FIFA 26</span>
              <br />
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">LEAGUE</span>
            </motion.h1>
            <motion.p className="text-xl md:text-2xl lg:text-3xl text-emerald-700 mb-12 font-medium max-w-4xl mx-auto leading-relaxed" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }}>
              The premier competitive FIFA gaming experience.
              <br className="hidden md:block" />
              Join elite players in the ultimate football league.
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.8 }}>
              <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105">
                <Link href="/register" className="flex items-center gap-3"><Trophy className="w-6 h-6" /> JOIN THE LEAGUE <ArrowRight className="w-5 h-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl transition-all duration-300 hover:scale-105">
                <Link href="/standings" className="flex items-center gap-3"><BarChart3 className="w-6 h-6" /> VIEW STANDINGS</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
        <motion.div className="absolute bottom-8 left-1/2 transform -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronRight className="w-6 h-6 text-emerald-600 rotate-90" />
        </motion.div>
      </section>

      {/* League Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard icon={Users} value={stats.players} label="Active Players" />
            <StatCard icon={Shield} value={stats.teams} label="Clubs" />
            <StatCard icon={Calendar} value={stats.matches} label="Fixtures" />
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-12">Featured Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredGames.map((match, index) => (
              <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.2 }}>
                <Card className="bg-white/80 border border-emerald-200 rounded-2xl shadow-lg overflow-hidden text-left">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-sm text-emerald-600"><Clock className="h-4 w-4" /><span>{new Date(match.match_date).toLocaleString()}</span></div>
                      <span className="px-3 py-1 text-xs font-semibold text-teal-800 bg-teal-100 rounded-full">Upcoming</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><TeamLogo teamName={match.home_team.name} logoUrl={match.home_team.logo_url} size="sm" /><span className="font-bold text-lg">{match.home_team.name}</span></div>
                      <div className="font-bold text-2xl">vs</div>
                      <div className="flex items-center gap-3"><span className="font-bold text-lg">{match.away_team.name}</span><TeamLogo teamName={match.away_team.name} logoUrl={match.away_team.logo_url} size="sm" /></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About SFS Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">About SFS</h2>
            <p className="text-lg text-emerald-700 leading-relaxed">SFS is the ultimate destination for competitive FIFA players. We provide a professionally managed platform for gamers to showcase their skills, compete for glory, and be part of a thriving community.</p>
          </motion.div>
          <div className="grid gap-8">
            <Card className="bg-white/80 border border-emerald-200 rounded-2xl shadow-lg p-6"><h3 className="font-bold text-xl mb-2 flex items-center gap-2"><Trophy className="text-yellow-500" /> Premier FC 26 League</h3><p>Our league is built on fair play, competition, and community. We offer a structured season format, detailed stat tracking, and a dedicated admin team.</p></Card>
            <Card className="bg-white/80 border border-emerald-200 rounded-2xl shadow-lg p-6"><h3 className="font-bold text-xl mb-2 flex items-center gap-2"><Users className="text-blue-500" /> Professional Community</h3><p>Join hundreds of passionate FIFA players. Discuss strategies, find teammates, and engage in community events. Our Discord server is the heart of our league.</p></Card>
          </div>
        </div>
      </section>

      {/* Why Choose SFS? Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-12">Why Choose SFS?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/80 border border-emerald-200 rounded-2xl shadow-lg p-6"><Zap className="h-10 w-10 text-emerald-600 mx-auto mb-4" /><h3 className="font-bold text-xl mb-2">Advanced League Features</h3><p>Live stat tracking, player awards, and a comprehensive transfer market.</p></Card>
            <Card className="bg-white/80 border border-emerald-200 rounded-2xl shadow-lg p-6"><Users className="h-10 w-10 text-emerald-600 mx-auto mb-4" /><h3 className="font-bold text-xl mb-2">Active Community</h3><p>Engage with players and staff on our active Discord server and forums.</p></Card>
            <Card className="bg-white/80 border border-emerald-200 rounded-2xl shadow-lg p-6"><Trophy className="h-10 w-10 text-emerald-600 mx-auto mb-4" /><h3 className="font-bold text-xl mb-2">Competitive Play</h3><p>Face off against the best players and climb the ranks to become a champion.</p></Card>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-12">Latest News</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestNews.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.2 }}>
                <Card className="bg-white/80 border border-emerald-200 rounded-2xl shadow-lg overflow-hidden text-left h-full">
                  <CardContent className="p-6">
                    <p className="text-sm text-emerald-600 mb-2">{item.date}</p>
                    <h3 className="font-bold text-xl mb-4">{item.title}</h3>
                    <p className="text-emerald-700 mb-4">{item.excerpt}</p>
                    <Button asChild variant="link" className="p-0 text-emerald-600 font-bold"><a>Read More <ArrowRight className="w-4 h-4 ml-1" /></a></Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Fixtures Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Upcoming Fixtures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {upcomingFixtures.map((match, index) => (
              <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.2 }}>
                <Card className="bg-white/80 border border-emerald-200 rounded-2xl shadow-lg overflow-hidden text-left">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-sm text-emerald-600"><Clock className="h-4 w-4" /><span>{new Date(match.match_date).toLocaleString()}</span></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><TeamLogo teamName={match.home_team.name} logoUrl={match.home_team.logo_url} size="sm" /><span className="font-bold text-lg">{match.home_team.name}</span></div>
                      <div className="font-bold text-2xl">vs</div>
                      <div className="flex items-center gap-3"><span className="font-bold text-lg">{match.away_team.name}</span><TeamLogo teamName={match.away_team.name} logoUrl={match.away_team.logo_url} size="sm" /></div>
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
            <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl p-2 mb-8">
              <TabsTrigger value="results">Recent Results</TabsTrigger>
              <TabsTrigger value="standings">League Standings</TabsTrigger>
            </TabsList>
            <TabsContent value="results">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {recentResults.map((match, index) => (
                  <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.2 }}>
                    <Card className="bg-white/80 border border-emerald-200 rounded-2xl shadow-lg overflow-hidden text-left">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2 text-sm text-emerald-600"><Clock className="h-4 w-4" /><span>{new Date(match.match_date).toLocaleDateString()}</span></div>
                          <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Completed</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3"><TeamLogo teamName={match.home_team.name} logoUrl={match.home_team.logo_url} size="sm" /><span className="font-bold text-lg">{match.home_team.name}</span></div>
                          <div className="font-bold text-2xl">{match.home_score} - {match.away_score}</div>
                          <div className="flex items-center gap-3"><span className="font-bold text-lg">{match.away_team.name}</span><TeamLogo teamName={match.away_team.name} logoUrl={match.away_team.logo_url} size="sm" /></div>
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
                    <h3 className="text-2xl font-bold mb-4 text-center">{conference}</h3>
                    <Card className="bg-white/80 border border-emerald-200 rounded-2xl shadow-lg overflow-hidden">
                      <Table>
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
                            <TableRow key={team.id}>
                              <TableCell className="flex items-center gap-2"><TeamLogo teamName={team.name} logoUrl={team.logo_url} size="sm" /> {team.name}</TableCell>
                              <TableCell>{team.wins}</TableCell>
                              <TableCell>{team.losses}</TableCell>
                              <TableCell>{team.otl}</TableCell>
                              <TableCell>{team.points}</TableCell>
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
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Join the FC26 League Today!</h2>
            <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">Your journey to becoming a FIFA legend starts now. Register for the upcoming season and write your own story.</p>
            <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl transition-all duration-300 hover:scale-105">
              <Link href="/register" className="flex items-center gap-3"><Play className="w-6 h-6" /> GET STARTED</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}