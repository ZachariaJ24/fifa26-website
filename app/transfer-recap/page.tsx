// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, TrendingUp, Calendar, Users, Handshake, Clock, CheckCircle, Trophy, BarChart3, Activity } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900 fifa-scrollbar">
      {/* Enhanced Hero Header Section */}
      <div className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-fifa-pattern opacity-5"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-field-green-500/20 to-pitch-blue-500/20 rounded-full animate-float"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-r from-stadium-gold-500/20 to-goal-orange-500/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-gradient-to-r from-assist-white-500/20 to-field-green-500/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full shadow-2xl shadow-field-green-500/30">
              <Handshake className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-field-green-600 via-pitch-blue-600 to-stadium-gold-600 dark:from-field-green-400 dark:via-pitch-blue-400 dark:to-stadium-gold-400 bg-clip-text text-transparent mb-4">
            Transfer Recap
          </h1>
          <p className="text-xl md:text-2xl text-field-green-700 dark:text-field-green-300 leading-relaxed max-w-3xl mx-auto mb-8">
            Complete overview of all transfer activity and team acquisitions
          </p>
          
          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-gradient-to-r from-field-green-100/50 to-pitch-blue-100/50 dark:from-field-green-900/20 dark:to-pitch-blue-900/20 px-4 py-2 rounded-full border border-field-green-200/50 dark:border-pitch-blue-700/50">
              <Trophy className="h-4 w-4 text-field-green-600 dark:text-field-green-400" />
              <span className="text-sm font-medium text-field-green-800 dark:text-field-green-200">Team Statistics</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-pitch-blue-100/50 to-pitch-blue-100/50 dark:from-pitch-blue-900/20 dark:to-pitch-blue-900/20 px-4 py-2 rounded-full border border-pitch-blue-200/50 dark:border-pitch-blue-700/50">
              <Users className="h-4 w-4 text-pitch-blue-600 dark:text-pitch-blue-400" />
              <span className="text-sm font-medium text-field-green-800 dark:text-field-green-200">Player Analysis</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-stadium-gold-100/50 to-stadium-gold-100/50 dark:from-stadium-gold-900/20 dark:to-stadium-gold-900/20 px-4 py-2 rounded-full border border-stadium-gold-200/50 dark:border-stadium-gold-700/50">
              <BarChart3 className="h-4 w-4 text-stadium-gold-600 dark:text-stadium-gold-400" />
              <span className="text-sm font-medium text-field-green-800 dark:text-field-green-200">Financial Overview</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-goal-orange-100/50 to-goal-orange-100/50 dark:from-goal-orange-900/20 dark:to-goal-orange-900/20 px-4 py-2 rounded-full border border-goal-orange-200/50 dark:border-goal-orange-700/50">
              <Activity className="h-4 w-4 text-goal-orange-600 dark:text-goal-orange-400" />
              <span className="text-sm font-medium text-field-green-800 dark:text-field-green-200">Transfer History</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="fifa-card-hover-enhanced overflow-hidden">
          <div className="bg-gradient-to-r from-field-green-600 to-pitch-blue-600 text-white p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Handshake className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">Transfer History</h2>
                <p className="text-field-green-100 text-sm">
                  Complete record of all player transfers
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="fifa-card-hover-enhanced p-6">
                    <Skeleton className="h-16 w-full rounded-xl bg-field-green-100 dark:bg-field-green-800" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="fifa-standings-table">
                  <TableHeader>
                    <TableRow className="fifa-table-row-hover">
                      <TableHead className="text-field-green-800 dark:text-field-green-200 font-bold text-center">Player</TableHead>
                      <TableHead className="text-field-green-800 dark:text-field-green-200 font-bold text-center">From Team</TableHead>
                      <TableHead className="text-field-green-800 dark:text-field-green-200 font-bold text-center"></TableHead>
                      <TableHead className="text-field-green-800 dark:text-field-green-200 font-bold text-center">To Team</TableHead>
                      <TableHead className="text-field-green-800 dark:text-field-green-200 font-bold text-center">Transfer Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((transfer, index) => (
                      <motion.tr
                        key={transfer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="fifa-table-row-hover"
                      >
                        <TableCell className="font-bold text-field-green-800 dark:text-field-green-200 text-center">
                          {transfer.players.name}
                        </TableCell>
                        <TableCell className="flex items-center justify-center gap-2">
                          <TeamLogo teamName={transfer.players.teams.name} logoUrl={transfer.players.teams.logo_url} size="sm" />
                          <span className="text-field-green-700 dark:text-field-green-300 font-medium">{transfer.players.teams.name}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            className="inline-flex items-center justify-center"
                          >
                            <ArrowRight className="w-5 h-5 text-pitch-blue-600 dark:text-pitch-blue-400" />
                          </motion.div>
                        </TableCell>
                        <TableCell className="flex items-center justify-center gap-2">
                          <TeamLogo teamName={transfer.teams.name} logoUrl={transfer.teams.logo_url} size="sm" />
                          <span className="text-field-green-700 dark:text-field-green-300 font-medium">{transfer.teams.name}</span>
                        </TableCell>
                        <TableCell className="text-center text-field-green-600 dark:text-field-green-400 font-medium">
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
                    <div className="fifa-card-hover-enhanced p-12">
                      <Handshake className="h-12 w-12 mx-auto text-field-green-400 dark:text-field-green-500 mb-4" />
                      <h3 className="text-xl font-bold text-field-green-800 dark:text-field-green-200 mb-2">No Transfers Yet</h3>
                      <p className="text-field-green-600 dark:text-field-green-400">Transfer activity will appear here once players are moved between teams.</p>
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
