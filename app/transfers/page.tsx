"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Handshake, 
  List, 
  User, 
  Shield, 
  Footprints, 
  Target, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Trophy,
  Users,
  Award,
  Star,
  Zap,
  Heart,
  BookOpen,
  Settings,
  Info,
  ExternalLink,
  Clock,
  BarChart3,
  MessageSquare
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { TeamLogo } from "@/components/team-logo"

interface Listing {
  id: string;
  listing_date: string;
  status: string;
  asking_price: string | null;
  players: Player;
  teams: Team;
}

interface Player {
  id: string;
  name: string;
  position: string;
  teams: Team;
}

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

export default function TransfersPage() {
  const { toast } = useToast()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      try {
        const response = await fetch('/api/transfers');
        if (!response.ok) throw new Error('Failed to fetch transfer listings');
        const data = await response.json();
        setListings(data.listings || [])
      } catch (error: any) {
        toast({
          title: "Error loading transfers",
          description: error.message || "Failed to load transfer data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [toast])

  const getPositionIcon = (position: string) => {
    if (['ST', 'CF', 'LW', 'RW'].includes(position)) return <Target className="w-4 h-4 text-goal-orange-500" />;
    if (['CAM', 'CM', 'CDM', 'LM', 'RM'].includes(position)) return <Footprints className="w-4 h-4 text-pitch-blue-500" />;
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position)) return <Shield className="w-4 h-4 text-field-green-500" />;
    return <User className="w-4 h-4 text-assist-white-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30">
      {/* Hero Header Section */}
      <div className="hockey-header relative py-16 px-4">
        <div className="container mx-auto text-center">
          <div>
            <h1 className="hockey-title mb-6">
              Transfer Market
            </h1>
            <p className="hockey-subtitle mb-8">
              Discover and acquire the best players in our competitive league
            </p>
            
            {/* Transfer Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <div className="hockey-stat-item bg-gradient-to-br from-field-green-100 to-field-green-200 dark:from-field-green-900/30 dark:to-field-green-800/20">
                <div className="p-2 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg mb-3 mx-auto w-fit">
                  <Handshake className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-field-green-700 dark:text-field-green-300">
                  Active
                </div>
                <div className="text-xs text-field-green-600 dark:text-field-green-400 font-medium uppercase tracking-wide">
                  Listings
                </div>
              </div>
              
              <div className="hockey-stat-item bg-gradient-to-br from-pitch-blue-100 to-pitch-blue-200 dark:from-pitch-blue-900/30 dark:to-pitch-blue-800/20">
                <div className="p-2 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg mb-3 mx-auto w-fit">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-pitch-blue-700 dark:text-pitch-blue-300">
                  Market
                </div>
                <div className="text-xs text-pitch-blue-600 dark:text-pitch-blue-400 font-medium uppercase tracking-wide">
                  Trends
                </div>
              </div>
              
              <div className="hockey-stat-item bg-gradient-to-br from-stadium-gold-100 to-stadium-gold-200 dark:from-stadium-gold-900/30 dark:to-stadium-gold-800/20">
                <div className="p-2 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg mb-3 mx-auto w-fit">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-stadium-gold-700 dark:text-stadium-gold-300">
                  Player
                </div>
                <div className="text-xs text-stadium-gold-600 dark:text-stadium-gold-400 font-medium uppercase tracking-wide">
                  Values
                </div>
              </div>
              
              <div className="hockey-stat-item bg-gradient-to-br from-goal-orange-100 to-goal-orange-200 dark:from-goal-orange-900/30 dark:to-goal-orange-800/20">
                <div className="p-2 bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 rounded-lg mb-3 mx-auto w-fit">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-goal-orange-700 dark:text-goal-orange-300">
                  Team
                </div>
                <div className="text-xs text-goal-orange-600 dark:text-goal-orange-400 font-medium uppercase tracking-wide">
                  Management
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Transfer Market Tabs */}
          <div className="fifa-card-hover-enhanced border-field-green-200/50 dark:border-field-green-700/50 bg-gradient-to-br from-white to-field-green-50/50 dark:from-slate-900 dark:to-field-green-900/20">
            <div className="p-6">
              <Tabs defaultValue="market" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto mb-8">
                  <TabsTrigger 
                    value="market" 
                    className="py-3 rounded-lg text-lg font-semibold"
                  >
                    <List className="h-5 w-5 mr-2" />
                    Market
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="py-3 rounded-lg text-lg font-semibold"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="market">
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="fifa-card-hover-enhanced p-6">
                          <Skeleton className="h-64 w-full rounded-xl bg-field-green-100 dark:bg-field-green-800" />
                        </div>
                      ))}
                    </div>
                  ) : listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {listings.map((listing, index) => (
                        <motion.div
                          key={listing.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <div className="fifa-card-hover-enhanced overflow-hidden h-full">
                            <div className="p-6">
                              <div className="flex flex-row items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{listing.players.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                  {getPositionIcon(listing.players.position)}
                                  <span className="font-medium">{listing.players.position}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 mb-4">
                                <TeamLogo teamName={listing.teams.name} logoUrl={listing.teams.logo_url} size="md" />
                                <div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Current Team</p>
                                  <p className="font-bold text-slate-800 dark:text-slate-200">{listing.teams.name}</p>
                                </div>
                              </div>
                              <div className="mb-6">
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Asking Price</p>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-5 w-5 text-stadium-gold-600 dark:text-stadium-gold-400" />
                                  <p className="font-bold text-xl text-stadium-gold-700 dark:text-stadium-gold-300">{listing.asking_price || 'Not specified'}</p>
                                </div>
                              </div>
                              <Button className="w-full bg-gradient-to-r from-field-green-500 to-pitch-blue-600 hover:from-field-green-600 hover:to-pitch-blue-700 text-white">
                                Make Offer
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="fifa-card-hover-enhanced p-12 text-center">
                      <Handshake className="h-12 w-12 mx-auto text-field-green-400 dark:text-field-green-500 mb-4" />
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Active Listings</h3>
                      <p className="text-slate-600 dark:text-slate-400">There are currently no players available for transfer.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history">
                  <div className="fifa-card-hover-enhanced p-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-field-green-400 dark:text-field-green-500 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Transfer History</h3>
                    <p className="text-slate-600 dark:text-slate-400">Transfer history coming soon.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Transfer Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* How Transfers Work */}
            <div className="fifa-card-hover-enhanced border-pitch-blue-200/50 dark:border-pitch-blue-700/50 bg-gradient-to-br from-white to-pitch-blue-50/50 dark:from-slate-900 dark:to-pitch-blue-900/20">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg">
                    <Info className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    How Transfers Work
                  </h2>
                </div>
                
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <div className="bg-gradient-to-r from-pitch-blue-50 to-pitch-blue-100 dark:from-pitch-blue-900/20 dark:to-pitch-blue-800/20 p-4 rounded-lg border-l-4 border-pitch-blue-500">
                    <h4 className="font-semibold text-pitch-blue-800 dark:text-pitch-blue-200 mb-2">1. Browse Available Players</h4>
                    <p>View all players currently listed for transfer by their teams.</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pitch-blue-50 to-pitch-blue-100 dark:from-pitch-blue-900/20 dark:to-pitch-blue-800/20 p-4 rounded-lg border-l-4 border-pitch-blue-500">
                    <h4 className="font-semibold text-pitch-blue-800 dark:text-pitch-blue-200 mb-2">2. Make an Offer</h4>
                    <p>Submit a transfer offer for any player you're interested in acquiring.</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pitch-blue-50 to-pitch-blue-100 dark:from-pitch-blue-900/20 dark:to-pitch-blue-800/20 p-4 rounded-lg border-l-4 border-pitch-blue-500">
                    <h4 className="font-semibold text-pitch-blue-800 dark:text-pitch-blue-200 mb-2">3. Negotiate Terms</h4>
                    <p>Work with the selling team to agree on transfer terms and conditions.</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pitch-blue-50 to-pitch-blue-100 dark:from-pitch-blue-900/20 dark:to-pitch-blue-800/20 p-4 rounded-lg border-l-4 border-pitch-blue-500">
                    <h4 className="font-semibold text-pitch-blue-800 dark:text-pitch-blue-200 mb-2">4. Complete Transfer</h4>
                    <p>Once terms are agreed, the transfer is processed and the player joins your team.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer Rules */}
            <div className="fifa-card-hover-enhanced border-stadium-gold-200/50 dark:border-stadium-gold-700/50 bg-gradient-to-br from-white to-stadium-gold-50/50 dark:from-slate-900 dark:to-stadium-gold-900/20">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    Transfer Rules
                  </h2>
                </div>
                
                <div className="space-y-4 text-slate-700 dark:text-slate-300">
                  <div className="bg-gradient-to-r from-stadium-gold-50 to-stadium-gold-100 dark:from-stadium-gold-900/20 dark:to-stadium-gold-800/20 p-4 rounded-lg border-l-4 border-stadium-gold-500">
                    <h4 className="font-semibold text-stadium-gold-800 dark:text-stadium-gold-200 mb-2">Salary Cap Compliance</h4>
                    <p>All transfers must comply with the league's salary cap regulations.</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-stadium-gold-50 to-stadium-gold-100 dark:from-stadium-gold-900/20 dark:to-stadium-gold-800/20 p-4 rounded-lg border-l-4 border-stadium-gold-500">
                    <h4 className="font-semibold text-stadium-gold-800 dark:text-stadium-gold-200 mb-2">Transfer Windows</h4>
                    <p>Transfers can only be completed during designated transfer windows.</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-stadium-gold-50 to-stadium-gold-100 dark:from-stadium-gold-900/20 dark:to-stadium-gold-800/20 p-4 rounded-lg border-l-4 border-stadium-gold-500">
                    <h4 className="font-semibold text-stadium-gold-800 dark:text-stadium-gold-200 mb-2">Player Consent</h4>
                    <p>Players must agree to the transfer before it can be completed.</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-stadium-gold-50 to-stadium-gold-100 dark:from-stadium-gold-900/20 dark:to-stadium-gold-800/20 p-4 rounded-lg border-l-4 border-stadium-gold-500">
                    <h4 className="font-semibold text-stadium-gold-800 dark:text-stadium-gold-200 mb-2">League Approval</h4>
                    <p>All transfers require approval from league administrators.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="fifa-card-hover-enhanced border-field-green-200/50 dark:border-field-green-700/50 bg-gradient-to-br from-white to-field-green-50/50 dark:from-slate-900 dark:to-field-green-900/20">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  Ready to Make a Transfer?
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Browse available players and strengthen your team for the upcoming season.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-gradient-to-r from-field-green-500 to-pitch-blue-600 hover:from-field-green-600 hover:to-pitch-blue-700 text-white">
                  <Handshake className="h-4 w-4 mr-2" />
                  Browse Players
                </Button>
                <Button variant="outline" className="border-field-green-200 dark:border-field-green-700 text-field-green-700 dark:text-field-green-300 hover:bg-field-green-50 dark:hover:bg-field-green-900/20">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Rules
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}