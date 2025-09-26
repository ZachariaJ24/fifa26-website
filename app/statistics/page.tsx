// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { Crown, Shield, BarChart3, TrendingUp, ArrowUpDown, Users, Target, Footprints, Hand } from "lucide-react"
import { TeamLogo } from "@/components/team-logo"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

// Define the structure of our player stats
interface PlayerStats {
  player_id: string;
  player_name: string;
  team_id: string | null;
  team_name: string | null;
  position: string | null;
  games_played: number;
  goals: number;
  assists: number;
  shots: number;
  passes_completed: number;
  passes_attempted: number;
  pass_accuracy: number;
  tackles: number;
  interceptions: number;
  dribbles: number;
  saves?: number;
  goals_against?: number;
  save_percentage?: number;
  clean_sheets?: number;
}

type SortKey = keyof PlayerStats | 'points';

export default function StatisticsPage() {
  const { toast } = useToast()
  const [stats, setStats] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'points', direction: 'desc' });
  const [activeTab, setActiveTab] = useState('overall');

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const response = await fetch('/api/v2/player-stats')
        if (!response.ok) throw new Error('Failed to fetch player stats')
        const data = await response.json()
        setStats(data.playerStats)
      } catch (error: any) {
        toast({
          title: 'Error loading stats',
          description: error.message || 'Failed to load player statistics.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [toast])

  const filteredStats = useMemo(() => {
    if (activeTab === 'overall') return stats;
    if (activeTab === 'attackers') return stats.filter(p => ['ST', 'CF', 'LW', 'RW'].includes(p.position || ''));
    if (activeTab === 'midfielders') return stats.filter(p => ['CAM', 'CM', 'CDM', 'LM', 'RM'].includes(p.position || ''));
    if (activeTab === 'defenders') return stats.filter(p => ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p.position || ''));
    if (activeTab === 'goalkeepers') return stats.filter(p => p.position === 'GK');
    return [];
  }, [stats, activeTab]);

  const sortedStats = useMemo(() => {
    let sortableStats = [...filteredStats];
    sortableStats.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'points') {
        aValue = a.goals + a.assists;
        bValue = b.goals + b.assists;
      } else {
        aValue = a[sortConfig.key as keyof PlayerStats] || 0;
        bValue = b[sortConfig.key as keyof PlayerStats] || 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableStats;
  }, [filteredStats, sortConfig]);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const statHeaders: { key: SortKey; label: string; className?: string }[] = [
    { key: 'player_name', label: 'Player', className: 'min-w-[200px]' },
    { key: 'team_name', label: 'Team', className: 'min-w-[150px]' },
    { key: 'games_played', label: 'GP' },
    { key: 'goals', label: 'G' },
    { key: 'assists', label: 'A' },
    { key: 'points', label: 'P' },
    { key: 'shots', label: 'SHT' },
    { key: 'pass_accuracy', label: 'PA%' },
    { key: 'tackles', label: 'TKL' },
    { key: 'interceptions', label: 'INT' },
    { key: 'dribbles', label: 'DRB' },
  ];

  const goalieStatHeaders: { key: SortKey; label: string; className?: string }[] = [
    { key: 'player_name', label: 'Player', className: 'min-w-[200px]' },
    { key: 'team_name', label: 'Team', className: 'min-w-[150px]' },
    { key: 'games_played', label: 'GP' },
    { key: 'saves', label: 'SV' },
    { key: 'goals_against', label: 'GA' },
    { key: 'save_percentage', label: 'SV%' },
    { key: 'clean_sheets', label: 'CS' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/20 text-white p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
          <Skeleton className="h-12 w-1/2 mx-auto mb-4" />
          <Skeleton className="h-8 w-3/4 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/20 text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent tracking-tight">Player Statistics</h1>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">Deep dive into the performance metrics of the league's top talents.</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto bg-gray-800/50 border border-gray-700 p-1 rounded-lg mb-8">
            <TabsTrigger value="overall"><Users className="w-4 h-4 mr-2"/>Overall</TabsTrigger>
            <TabsTrigger value="attackers"><Target className="w-4 h-4 mr-2"/>Attackers</TabsTrigger>
            <TabsTrigger value="midfielders"><Footprints className="w-4 h-4 mr-2"/>Midfielders</TabsTrigger>
            <TabsTrigger value="defenders"><Shield className="w-4 h-4 mr-2"/>Defenders</TabsTrigger>
            <TabsTrigger value="goalkeepers"><Hand className="w-4 h-4 mr-2"/>Goalkeepers</TabsTrigger>
          </TabsList>

          <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      {(activeTab === 'goalkeepers' ? goalieStatHeaders : statHeaders).map(({ key, label, className }) => (
                        <TableHead key={key} className={`text-white font-bold ${className}`}>
                          <div className="flex items-center cursor-pointer" onClick={() => handleSort(key)}>
                            {label}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedStats.map((player) => (
                      <TableRow key={player.player_id} className="border-gray-700 hover:bg-gray-700/50">
                        <TableCell>
                          <Link href={`/players/${player.player_id}`} className="font-medium text-blue-400 hover:underline">{player.player_name}</Link>
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          <TeamLogo teamName={player.team_name || ''} logoUrl={null} size="sm" />
                          {player.team_name}
                        </TableCell>
                        <TableCell>{player.games_played}</TableCell>
                        {activeTab === 'goalkeepers' ? (
                          <>
                            <TableCell>{player.saves}</TableCell>
                            <TableCell>{player.goals_against}</TableCell>
                            <TableCell>{player.save_percentage}%</TableCell>
                            <TableCell>{player.clean_sheets}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{player.goals}</TableCell>
                            <TableCell>{player.assists}</TableCell>
                            <TableCell>{player.goals + player.assists}</TableCell>
                            <TableCell>{player.shots}</TableCell>
                            <TableCell>{player.pass_accuracy}%</TableCell>
                            <TableCell>{player.tackles}</TableCell>
                            <TableCell>{player.interceptions}</TableCell>
                            <TableCell>{player.dribbles}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}
