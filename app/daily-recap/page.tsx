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
      {/* Hero Header Section */}
      <div className="relative py-16 px-4">
        <div className="container mx-auto text-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-field-green-600 via-pitch-blue-600 to-stadium-gold-600 dark:from-field-green-400 dark:via-pitch-blue-400 dark:to-stadium-gold-400 bg-clip-text text-transparent leading-tight tracking-tight mb-6">
              Daily Recap
            </h1>
            <p className="text-xl md:text-2xl text-field-green-700 dark:text-field-green-300 leading-relaxed max-w-3xl mx-auto mb-8">
              Comprehensive analysis of recent matches and team performances
            </p>
            
            {/* Daily Recap Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <div className="bg-gradient-to-br from-field-green-50/90 via-pitch-blue-50/90 to-stadium-gold-50/90 dark:from-field-green-900/90 dark:via-pitch-blue-900/90 dark:to-stadium-gold-900/90 backdrop-blur-md border border-field-green-300/50 dark:border-field-green-600/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-2 p-6 text-center">
                <div className="p-2 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg mb-3 mx-auto w-fit">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-field-green-700 dark:text-field-green-300">
                  24h
                </div>
                <div className="text-xs text-field-green-600 dark:text-field-green-400 font-medium uppercase tracking-wide">
                  Time Window
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-pitch-blue-50/90 via-stadium-gold-50/90 to-goal-orange-50/90 dark:from-pitch-blue-900/90 dark:via-stadium-gold-900/90 dark:to-goal-orange-900/90 backdrop-blur-md border border-pitch-blue-300/50 dark:border-pitch-blue-600/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-2 p-6 text-center">
                <div className="p-2 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg mb-3 mx-auto w-fit">
                  <Shirt className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-pitch-blue-700 dark:text-pitch-blue-300">
                  Top
                </div>
                <div className="text-xs text-pitch-blue-600 dark:text-pitch-blue-400 font-medium uppercase tracking-wide">
                  Performers
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-stadium-gold-50/90 via-goal-orange-50/90 to-field-green-50/90 dark:from-stadium-gold-900/90 dark:via-goal-orange-900/90 dark:to-field-green-900/90 backdrop-blur-md border border-stadium-gold-300/50 dark:border-stadium-gold-600/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-2 p-6 text-center">
                <div className="p-2 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg mb-3 mx-auto w-fit">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-stadium-gold-700 dark:text-stadium-gold-300">
                  AI
                </div>
                <div className="text-xs text-stadium-gold-600 dark:text-stadium-gold-400 font-medium uppercase tracking-wide">
                  Analysis
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-goal-orange-50/90 via-field-green-50/90 to-pitch-blue-50/90 dark:from-goal-orange-900/90 dark:via-field-green-900/90 dark:to-pitch-blue-900/90 backdrop-blur-md border border-goal-orange-300/50 dark:border-goal-orange-600/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-2 p-6 text-center">
                <div className="p-2 bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 rounded-lg mb-3 mx-auto w-fit">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-goal-orange-700 dark:text-goal-orange-300">
                  Real-time
                </div>
                <div className="text-xs text-goal-orange-600 dark:text-goal-orange-400 font-medium uppercase tracking-wide">
                  Insights
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">

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
