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
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900 fifa-scrollbar">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="fifa-title-enhanced mb-6">Daily Recap</h1>
          <p className="mt-4 text-lg text-field-green-600 dark:text-field-green-400 max-w-3xl mx-auto">A snapshot of all league activities for {new Date().toLocaleDateString()}</p>
          <div className="fifa-section-divider"></div>
        </div>

        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-64 w-full rounded-xl bg-field-green-100 dark:bg-field-green-800" />
            <Skeleton className="h-48 w-full rounded-xl bg-field-green-100 dark:bg-field-green-800" />
            <Skeleton className="h-48 w-full rounded-xl bg-field-green-100 dark:bg-field-green-800" />
          </div>
        ) : (
          <div className="space-y-8">
            <Card className="fifa-card-hover-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-field-green-800 dark:text-field-green-200">
                  <Calendar className="text-field-green-600 dark:text-field-green-400" /> Today's Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recap?.completedMatches?.length > 0 ? (
                  <div className="space-y-4">
                    {recap.completedMatches.map((match: Match) => (
                      <div key={match.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-field-green-50 to-pitch-blue-50 dark:from-field-green-900 dark:to-pitch-blue-900 rounded-lg border border-field-green-200 dark:border-field-green-700">
                        <div className="flex items-center gap-2">
                          <TeamLogo teamName={match.home_team.name} logoUrl={match.home_team.logo_url} size="sm" />
                          <span className="text-field-green-800 dark:text-field-green-200 font-medium">{match.home_team.name}</span>
                        </div>
                        <div className="font-bold text-xl text-field-green-700 dark:text-field-green-300">{match.home_score} - {match.away_score}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-field-green-800 dark:text-field-green-200 font-medium">{match.away_team.name}</span>
                          <TeamLogo teamName={match.away_team.name} logoUrl={match.away_team.logo_url} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-field-green-600 dark:text-field-green-400">No matches completed today.</p>
                )}
              </CardContent>
            </Card>

            <Card className="fifa-card-hover-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-field-green-800 dark:text-field-green-200">
                  <Shirt className="text-pitch-blue-600 dark:text-pitch-blue-400" /> Transfer Market Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recap?.newTransfers?.length > 0 ? (
                  <div className="space-y-4">
                    {recap.newTransfers.map((transfer: Transfer) => (
                      <div key={transfer.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-field-green-50 to-pitch-blue-50 dark:from-field-green-900 dark:to-pitch-blue-900 rounded-lg border border-field-green-200 dark:border-field-green-700">
                        <span className="font-bold text-field-green-800 dark:text-field-green-200">{transfer.players.name}</span>
                        <div className="flex items-center gap-2">
                          <TeamLogo teamName={transfer.players.teams.name} logoUrl={transfer.players.teams.logo_url} size="sm" />
                          <span className="text-field-green-800 dark:text-field-green-200">{transfer.players.teams.name}</span>
                          <ArrowRight className="w-5 h-5 text-stadium-gold-600 dark:text-stadium-gold-400" />
                          <TeamLogo teamName={transfer.teams.name} logoUrl={transfer.teams.logo_url} size="sm" />
                          <span className="text-field-green-800 dark:text-field-green-200">{transfer.teams.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-field-green-600 dark:text-field-green-400">No new transfer listings today.</p>
                )}
              </CardContent>
            </Card>

            <Card className="fifa-card-hover-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-field-green-800 dark:text-field-green-200">
                  <Calendar className="text-stadium-gold-600 dark:text-stadium-gold-400" /> Upcoming Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recap?.upcomingMatches?.length > 0 ? (
                  <div className="space-y-4">
                    {recap.upcomingMatches.map((match: Match) => (
                      <div key={match.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-field-green-50 to-pitch-blue-50 dark:from-field-green-900 dark:to-pitch-blue-900 rounded-lg border border-field-green-200 dark:border-field-green-700">
                        <div className="flex items-center gap-2">
                          <TeamLogo teamName={match.home_team.name} logoUrl={match.home_team.logo_url} size="sm" />
                          <span className="text-field-green-800 dark:text-field-green-200 font-medium">{match.home_team.name}</span>
                        </div>
                        <div className="font-bold text-xl text-field-green-700 dark:text-field-green-300">vs</div>
                        <div className="flex items-center gap-2">
                          <span className="text-field-green-800 dark:text-field-green-200 font-medium">{match.away_team.name}</span>
                          <TeamLogo teamName={match.away_team.name} logoUrl={match.away_team.logo_url} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-field-green-600 dark:text-field-green-400">No matches scheduled for tomorrow.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
