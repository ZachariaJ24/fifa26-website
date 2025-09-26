import { notFound } from 'next/navigation'
import { getLeagueIdFromSlug, LEAGUE_META } from '@/lib/constants/leagues'
import { getLeagueStandings } from '@/lib/api/leagues'
import { TeamStandings } from '@/components/teams/TeamStandings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Users, Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LeagueStandingsPage({ params }: { params: { leagueId: string } }) {
  const slug = params.leagueId
  const leagueId = getLeagueIdFromSlug(slug)
  if (!leagueId) notFound()

  const teams = await getLeagueStandings(leagueId)
  const meta = LEAGUE_META.find(m => m.slug === slug)

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">League Standings</h1>
        <p className="mt-2 text-lg text-muted-foreground">Track your team's journey through the season with comprehensive statistics, rankings, and playoff projections.</p>
      </div>

      <Tabs defaultValue="overall">
        <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
          <TabsTrigger value="overall"><BarChart className="w-4 h-4 mr-2" />Overall Standings</TabsTrigger>
          <TabsTrigger value="conference"><Users className="w-4 h-4 mr-2" />Conference</TabsTrigger>
          <TabsTrigger value="playoffs"><Trophy className="w-4 h-4 mr-2" />Playoff Picture</TabsTrigger>
        </TabsList>
        <TabsContent value="overall">
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle>League Standings</CardTitle>
              <p className="text-sm text-muted-foreground">Complete standings for all teams in the league</p>
            </CardHeader>
            <CardContent>
              {teams && teams.length ? (
                <TeamStandings teams={teams} />
              ) : (
                <div className="text-center text-muted-foreground py-10">No standings available yet.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="conference">
          <div className="text-center text-muted-foreground py-10">Conference standings coming soon.</div>
        </TabsContent>
        <TabsContent value="playoffs">
          <div className="text-center text-muted-foreground py-10">Playoff picture coming soon.</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
