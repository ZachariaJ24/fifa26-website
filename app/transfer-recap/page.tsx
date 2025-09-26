// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, TrendingUp, Calendar, Users, Handshake, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { TeamLogo } from '@/components/team-logo';

interface Transfer {
  id: string;
  listing_date: string;
  players: Player;
  teams: Team; // This will be the new team
}

interface Player {
  id: string;
  name: string;
  teams: Team; // This will be the old team
}

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

export default function TransferRecapPage() {
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransfers() {
      setLoading(true);
      try {
        const response = await fetch('/api/transfer-recap');
        if (!response.ok) throw new Error('Failed to fetch transfer recap');
        const data = await response.json();
        setTransfers(data.transfers || []);
      } catch (error: any) {
        toast({
          title: 'Error loading transfer recap',
          description: error.message || 'Failed to load transfer recap data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchTransfers();
  }, [toast]);

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
              Transfer Recap
            </h1>
            <p className="text-xl md:text-2xl text-emerald-700 mb-8 max-w-3xl mx-auto">
              A comprehensive summary of all completed transfers in the league.
            </p>
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl px-4 py-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-emerald-800 font-semibold">Completed Transfers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl px-4 py-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <span className="text-teal-800 font-semibold">Market Activity</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Handshake className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">Transfer History</h2>
                <p className="text-emerald-100 text-sm">
                  Complete record of all player transfers
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-lg p-6">
                    <Skeleton className="h-16 w-full rounded-xl bg-emerald-100" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-emerald-200 hover:bg-emerald-50/50">
                      <TableHead className="text-emerald-800 font-bold text-center">Player</TableHead>
                      <TableHead className="text-emerald-800 font-bold text-center">From Team</TableHead>
                      <TableHead className="text-emerald-800 font-bold text-center"></TableHead>
                      <TableHead className="text-emerald-800 font-bold text-center">To Team</TableHead>
                      <TableHead className="text-emerald-800 font-bold text-center">Transfer Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((transfer, index) => (
                      <motion.tr
                        key={transfer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="border-emerald-200 hover:bg-emerald-50/50 transition-colors duration-200"
                      >
                        <TableCell className="font-bold text-emerald-800 text-center">
                          {transfer.players.name}
                        </TableCell>
                        <TableCell className="flex items-center justify-center gap-2">
                          <TeamLogo teamName={transfer.players.teams.name} logoUrl={transfer.players.teams.logo_url} size="sm" />
                          <span className="text-emerald-700 font-medium">{transfer.players.teams.name}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            className="inline-flex items-center justify-center"
                          >
                            <ArrowRight className="w-5 h-5 text-teal-600" />
                          </motion.div>
                        </TableCell>
                        <TableCell className="flex items-center justify-center gap-2">
                          <TeamLogo teamName={transfer.teams.name} logoUrl={transfer.teams.logo_url} size="sm" />
                          <span className="text-emerald-700 font-medium">{transfer.teams.name}</span>
                        </TableCell>
                        <TableCell className="text-center text-emerald-600 font-medium">
                          <div className="flex items-center justify-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(transfer.listing_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
                
                {transfers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-lg p-12">
                      <Handshake className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
                      <h3 className="text-xl font-bold text-emerald-800 mb-2">No Transfers Yet</h3>
                      <p className="text-emerald-600">Transfer activity will appear here once players are moved between teams.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
