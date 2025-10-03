import { notFound } from 'next/navigation';
import { getLeagueById, getLeagueStandings, getUpcomingMatches, getTopScorers } from '@/lib/api/leagues';
import { MatchCard } from '@/components/matches/MatchCard';
import { TeamStandings } from '@/components/teams/TeamStandings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users as UsersIcon, Calendar as CalendarIcon, Trophy as TrophyIcon, Clock as ClockIcon, ChevronRight as ChevronRightIcon, Shield as ShieldIcon, User as UserIcon } from 'lucide-react';
import { LeagueSelector } from '@/components/league/LeagueSelector';
import { getLeagueIdFromSlug, LEAGUE_META } from '@/lib/constants/leagues';

type LeaguePageProps = {
  params: {
    leagueId: string;
  };
};

export default async function LeaguePage({ params }: LeaguePageProps) {
  const slug = params.leagueId;
  const leagueId = getLeagueIdFromSlug(slug);
  if (!leagueId) {
    notFound();
  }
  const league = await getLeagueById(leagueId);
  
  if (!league) {
    notFound();
  }

  const [standings, upcomingMatches, topScorers] = await Promise.all([
    getLeagueStandings(leagueId),
    getUpcomingMatches(leagueId, 4),
    getTopScorers(leagueId, 1),
  ]);

  return (
    <div className="container py-8 space-y-8">
      {/* League Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{league.name}</h1>
          <p className="text-muted-foreground">Season {league.current_season?.name || '2024/25'}</p>
        </div>
        <div className="w-full md:w-auto">
          <LeagueSelector />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Teams" 
          value={standings.length.toString()} 
          icon={<UsersIcon className="h-5 w-5" />} 
        />
        <StatCard 
          title="Matches Played" 
          value={standings.reduce((acc, team) => acc + (team.played || 0), 0).toString()}
          icon={<CalendarIcon className="h-5 w-5" />} 
        />
        <StatCard 
          title="Top Scorer" 
          value={topScorers[0]?.name || 'TBD'}
          subvalue={`${topScorers[0]?.goals || 0} goals`}
          icon={<TrophyIcon className="h-5 w-5" />} 
        />
        <StatCard 
          title="Next Match" 
          value={upcomingMatches[0] ? 
            `${upcomingMatches[0].home_team?.name || 'TBD'} vs ${upcomingMatches[0].away_team?.name || 'TBD'}` : 
            'TBD'}
          subvalue={upcomingMatches[0] ? 
            new Date(upcomingMatches[0].match_date).toLocaleDateString() : ''}
          icon={<ClockIcon className="h-5 w-5" />} 
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Matches</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/leagues/${slug}/matches`}>
                        View All
                        <ChevronRightIcon className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingMatches.length > 0 ? (
                      upcomingMatches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">
                        No upcoming matches scheduled
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Latest News</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                        <div className="h-3 w-1/2 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Standings</CardTitle>
                </CardHeader>
                <CardContent>
                  <TeamStandings 
                    teams={standings.slice(0, 8)} 
                    showPromotion={league.has_promotion}
                    showRelegation={league.has_relegation}
                  />
                  <div className="mt-4 text-center">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/leagues/${slug}/standings`}>
                        View Full Table
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Scorers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">Player {i}</div>
                            <div className="text-xs text-muted-foreground">Team {i}</div>
                          </div>
                        </div>
                        <div className="font-bold">{10 - i * 2} goals</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="standings">
          <Card>
            <CardHeader>
              <CardTitle>League Standings</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamStandings 
                teams={standings} 
                showPromotion={league.has_promotion}
                showRelegation={league.has_relegation}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle>Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {standings.map((team) => (
                  <div key={team.id} className="p-4 border rounded-lg text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center">
                      {team.logo_url ? (
                        <img 
                          src={team.logo_url} 
                          alt={team.name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <ShieldIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="font-medium">{team.name}</div>
                    <div className="text-sm text-muted-foreground">{team.points || 0} pts</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>League Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  subvalue,
  icon 
}: { 
  title: string; 
  value: string;
  subvalue?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-xl font-semibold">{value}</p>
            {subvalue && <p className="text-xs text-muted-foreground">{subvalue}</p>}
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// This function tells Next.js which paths to pre-render
export async function generateStaticParams() {
  return LEAGUE_META.map(m => ({ leagueId: m.slug }));
}
