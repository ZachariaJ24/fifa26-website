// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Handshake, List, User, Shield, Footprints, Target, DollarSign, Calendar, TrendingUp } from "lucide-react"
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
    if (['ST', 'CF', 'LW', 'RW'].includes(position)) return <Target className="w-4 h-4 text-red-500" />;
    if (['CAM', 'CM', 'CDM', 'LM', 'RM'].includes(position)) return <Footprints className="w-4 h-4 text-blue-500" />;
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position)) return <Shield className="w-4 h-4 text-emerald-500" />;
    return <User className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              Transfer Market
            </h1>
            <p className="text-xl md:text-2xl text-emerald-700 mb-8 max-w-3xl mx-auto">
              Discover and acquire the best players in our competitive league.
            </p>
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl px-4 py-2">
                <Handshake className="h-5 w-5 text-emerald-600" />
                <span className="text-emerald-800 font-semibold">Active Listings</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl px-4 py-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <span className="text-teal-800 font-semibold">Market Trends</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="market" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl p-2 mb-8">
            <TabsTrigger 
              value="market" 
              className="py-3 rounded-lg text-lg font-semibold text-emerald-700 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <List className="h-5 w-5 mr-2" />
              Market
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="py-3 rounded-lg text-lg font-semibold text-emerald-700 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Calendar className="h-5 w-5 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="market">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-lg p-6">
                    <Skeleton className="h-64 w-full rounded-xl bg-emerald-100" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <div className="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                      <div className="p-6">
                        <div className="flex flex-row items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-emerald-800">{listing.players.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-emerald-600">
                            {getPositionIcon(listing.players.position)}
                            <span className="font-medium">{listing.players.position}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <TeamLogo teamName={listing.teams.name} logoUrl={listing.teams.logo_url} size="md" />
                          <div>
                            <p className="text-sm text-emerald-600 font-medium">Current Team</p>
                            <p className="font-bold text-emerald-800">{listing.teams.name}</p>
                          </div>
                        </div>
                        <div className="mb-6">
                          <p className="text-sm text-emerald-600 font-medium mb-1">Asking Price</p>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-teal-600" />
                            <p className="font-bold text-xl text-teal-700">{listing.asking_price || 'Not specified'}</p>
                          </div>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold">
                          Make Offer
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-lg p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-emerald-800 mb-2">Transfer History</h3>
              <p className="text-emerald-600">Transfer history coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

