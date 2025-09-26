// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Shirt, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { TeamLogo } from '@/components/team-logo';

interface Match {
  id: string;
  home_team: Team;
  away_team: Team;
  home_score: number;
  away_score: number;
}

interface Transfer {
  id: string;
  players: Player;
  teams: Team;
}

interface Player {
  name: string;
}

interface Team {
  name: string;
  logo_url: string | null;
}

export default function DailyRecapPage() {
  const { toast } = useToast();
  const [recap, setRecap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecap() {
      setLoading(true);
      try {
        const response = await fetch('/api/daily-recap/v2');
        if (!response.ok) throw new Error('Failed to fetch daily recap');
        const data = await response.json();
        setRecap(data);
      } catch (error: any) {
        toast({
          title: 'Error loading daily recap',
          description: error.message || 'Failed to load daily recap data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchRecap();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/30 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent tracking-tight">Daily Recap</h1>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">A snapshot of all league activities for {new Date().toLocaleDateString()}</p>
        </div>

        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-8">
            <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold"><Calendar /> Today's Results</CardTitle>
              </CardHeader>
              <CardContent>
                {recap?.completedMatches?.length > 0 ? (
                  <div className="space-y-4">
                    {recap.completedMatches.map((match: Match) => (
                      <div key={match.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TeamLogo teamName={match.home_team.name} logoUrl={match.home_team.logo_url} size="sm" />
                          <span>{match.home_team.name}</span>
                        </div>
                        <div className="font-bold text-xl">{match.home_score} - {match.away_score}</div>
                        <div className="flex items-center gap-2">
                          <span>{match.away_team.name}</span>
                          <TeamLogo teamName={match.away_team.name} logoUrl={match.away_team.logo_url} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No matches completed today.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold"><Shirt /> Transfer Market Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recap?.newTransfers?.length > 0 ? (
                  <div className="space-y-4">
                    {recap.newTransfers.map((transfer: Transfer) => (
                      <div key={transfer.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <span className="font-bold">{transfer.players.name}</span>
                        <div className="flex items-center gap-2">
                          <TeamLogo teamName={transfer.players.teams.name} logoUrl={transfer.players.teams.logo_url} size="sm" />
                          <span>{transfer.players.teams.name}</span>
                          <ArrowRight className="w-5 h-5 text-green-400" />
                          <TeamLogo teamName={transfer.teams.name} logoUrl={transfer.teams.logo_url} size="sm" />
                          <span>{transfer.teams.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No new transfer listings today.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold"><Calendar /> Upcoming Matches</CardTitle>
              </CardHeader>
              <CardContent>
                {recap?.upcomingMatches?.length > 0 ? (
                  <div className="space-y-4">
                    {recap.upcomingMatches.map((match: Match) => (
                      <div key={match.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TeamLogo teamName={match.home_team.name} logoUrl={match.home_team.logo_url} size="sm" />
                          <span>{match.home_team.name}</span>
                        </div>
                        <div className="font-bold text-xl">vs</div>
                        <div className="flex items-center gap-2">
                          <span>{match.away_team.name}</span>
                          <TeamLogo teamName={match.away_team.name} logoUrl={match.away_team.logo_url} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No matches scheduled for tomorrow.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
