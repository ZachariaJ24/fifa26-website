// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Handshake, List, User, Shield, Footprints, Target } from "lucide-react"
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
    if (['ST', 'CF', 'LW', 'RW'].includes(position)) return <Target className="w-4 h-4 text-red-400" />;
    if (['CAM', 'CM', 'CDM', 'LM', 'RM'].includes(position)) return <Footprints className="w-4 h-4 text-blue-400" />;
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position)) return <Shield className="w-4 h-4 text-green-400" />;
    return <User className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/30 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent tracking-tight">Transfer Market</h1>
        </div>

        <Tabs defaultValue="market">
          <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto bg-gray-800/50 border border-gray-700 p-1 rounded-lg mb-8">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="market">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm overflow-hidden shadow-2xl shadow-blue-500/10 h-full">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold">{listing.players.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          {getPositionIcon(listing.players.position)}
                          <span>{listing.players.position}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                          <TeamLogo teamName={listing.teams.name} logoUrl={listing.teams.logo_url} size="md" />
                          <div>
                            <p className="text-sm text-gray-400">Current Team</p>
                            <p className="font-bold">{listing.teams.name}</p>
                          </div>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-400">Asking Price</p>
                            <p className="font-bold text-lg text-green-400">{listing.asking_price || 'Not specified'}</p>
                        </div>
                        <Button className="w-full">Make Offer</Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="text-center py-12">
                <p className="text-muted-foreground">Transfer history coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
