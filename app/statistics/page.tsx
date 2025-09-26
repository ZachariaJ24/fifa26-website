// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { Crown, Shield, BarChart3, TrendingUp, ArrowUpDown } from "lucide-react"
import { TeamLogo } from "@/components/team-logo"
import Link from "next/link"

// Define the structure of our player stats
interface PlayerStats {
  player_id: string;
  player_name: string;
  team_id: string | null;
  team_name: string | null;
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
}

type SortKey = keyof PlayerStats | 'points';

export default function StatisticsPage() {
  const { toast } = useToast()
  const [stats, setStats] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'points', direction: 'desc' });

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const response = await fetch('/api/player-stats')
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

  const sortedStats = useMemo(() => {
    let sortableStats = [...stats];
    sortableStats.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'points') {
        aValue = a.goals + a.assists;
        bValue = b.goals + b.assists;
      } else {
        aValue = a[sortConfig.key as keyof PlayerStats];
        bValue = b[sortConfig.key as keyof PlayerStats];
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableStats;
  }, [stats, sortConfig]);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getTopPlayer = (key: keyof PlayerStats | 'points') => {
    if (stats.length === 0) return null;
    return [...stats].sort((a, b) => {
      const aValue = key === 'points' ? a.goals + a.assists : a[key];
      const bValue = key === 'points' ? b.goals + b.assists : b[key];
      return (bValue as number) - (aValue as number);
    })[0];
  };

  const topScorer = getTopPlayer('goals');
  const topAssister = getTopPlayer('assists');
  const topPlaymaker = getTopPlayer('points');
  const topPasser = getTopPlayer('pass_accuracy');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/20 text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent tracking-tight">Player Statistics</h1>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">Deep dive into the performance metrics of the league's top talents.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard title="Top Scorer" player={topScorer} stat={`${topScorer?.goals} Goals`} icon={<Crown className="text-yellow-400" />} />
            <StatCard title="Top Playmaker" player={topPlaymaker} stat={`${(topPlaymaker?.goals || 0) + (topPlaymaker?.assists || 0)} Points`} icon={<TrendingUp className="text-green-400" />} />
            <StatCard title="Assist King" player={topAssister} stat={`${topAssister?.assists} Assists`} icon={<BarChart3 className="text-blue-400" />} />
            <StatCard title="Passing Maestro" player={topPasser} stat={`${topPasser?.pass_accuracy}% PA`} icon={<Shield className="text-purple-400" />} />
          </div>

          <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">League Leaders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      {statHeaders.map(({ key, label, className }) => (
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
                        <TableCell>{player.goals}</TableCell>
                        <TableCell>{player.assists}</TableCell>
                        <TableCell>{player.goals + player.assists}</TableCell>
                        <TableCell>{player.shots}</TableCell>
                        <TableCell>{player.pass_accuracy}%</TableCell>
                        <TableCell>{player.tackles}</TableCell>
                        <TableCell>{player.interceptions}</TableCell>
                        <TableCell>{player.dribbles}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

const StatCard = ({ title, player, stat, icon }: { title: string; player: PlayerStats | null; stat: string; icon: React.ReactNode }) => (
  <Card className="bg-gray-800/60 border border-gray-700 hover:border-blue-500 transition-colors duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {player ? (
        <>
          <div className="text-2xl font-bold text-white">{player.player_name}</div>
          <p className="text-xs text-gray-500">{stat}</p>
        </>
      ) : (
        <div className="text-2xl font-bold text-white">N/A</div>
      )}
    </CardContent>
  </Card>
);
