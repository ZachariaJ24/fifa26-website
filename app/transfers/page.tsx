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
    if (['ST', 'CF', 'LW', 'RW'].includes(position)) return <Target className="w-4 h-4 text-goal-orange-500" />;
    if (['CAM', 'CM', 'CDM', 'LM', 'RM'].includes(position)) return <Footprints className="w-4 h-4 text-pitch-blue-500" />;
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position)) return <Shield className="w-4 h-4 text-field-green-500" />;
    return <User className="w-4 h-4 text-assist-white-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900 fifa-scrollbar">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-field-green-600/20 via-pitch-blue-600/20 to-stadium-gold-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="fifa-title-enhanced mb-6">
              Transfer Market
            </h1>
            <p className="text-xl md:text-2xl text-field-green-700 dark:text-field-green-300 mb-8 max-w-3xl mx-auto">
              Discover and acquire the best players in our competitive league.
            </p>
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 fifa-card-hover-enhanced px-4 py-2">
                <Handshake className="h-5 w-5 text-field-green-600 dark:text-field-green-400" />
                <span className="text-field-green-800 dark:text-field-green-200 font-semibold">Active Listings</span>
              </div>
              <div className="flex items-center gap-2 fifa-card-hover-enhanced px-4 py-2">
                <TrendingUp className="h-5 w-5 text-pitch-blue-600 dark:text-pitch-blue-400" />
                <span className="text-pitch-blue-800 dark:text-pitch-blue-200 font-semibold">Market Trends</span>
              </div>
            </div>
            <div className="fifa-section-divider"></div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="market" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto fifa-tabs-list mb-8">
            <TabsTrigger 
              value="market" 
              className="fifa-tab-trigger py-3 rounded-lg text-lg font-semibold"
            >
              <List className="h-5 w-5 mr-2" />
              Market
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="fifa-tab-trigger py-3 rounded-lg text-lg font-semibold"
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
                    <div className="fifa-card-hover-enhanced overflow-hidden h-full">
                      <div className="p-6">
                        <div className="flex flex-row items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-field-green-800 dark:text-field-green-200">{listing.players.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-field-green-600 dark:text-field-green-400">
                            {getPositionIcon(listing.players.position)}
                            <span className="font-medium">{listing.players.position}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <TeamLogo teamName={listing.teams.name} logoUrl={listing.teams.logo_url} size="md" />
                          <div>
                            <p className="text-sm text-field-green-600 dark:text-field-green-400 font-medium">Current Team</p>
                            <p className="font-bold text-field-green-800 dark:text-field-green-200">{listing.teams.name}</p>
                          </div>
                        </div>
                        <div className="mb-6">
                          <p className="text-sm text-field-green-600 dark:text-field-green-400 font-medium mb-1">Asking Price</p>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-stadium-gold-600 dark:text-stadium-gold-400" />
                            <p className="font-bold text-xl text-stadium-gold-700 dark:text-stadium-gold-300">{listing.asking_price || 'Not specified'}</p>
                          </div>
                        </div>
                        <Button className="w-full fifa-button-enhanced">
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
            <div className="fifa-card-hover-enhanced p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-field-green-400 dark:text-field-green-500 mb-4" />
              <h3 className="text-xl font-bold text-field-green-800 dark:text-field-green-200 mb-2">Transfer History</h3>
              <p className="text-field-green-600 dark:text-field-green-400">Transfer history coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

