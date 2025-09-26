import { notFound } from 'next/navigation'
import { getLeagueIdFromSlug, LEAGUE_META } from '@/lib/constants/leagues'
import { getLeagueStandings } from '@/lib/api/leagues'
import { TeamStandings } from '@/components/teams/TeamStandings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function LeagueStandingsPage({ params }: { params: { leagueId: string } }) {
  const slug = params.leagueId
  const leagueId = getLeagueIdFromSlug(slug)
  if (!leagueId) notFound()

  const teams = await getLeagueStandings(leagueId)
  const meta = LEAGUE_META.find(m => m.slug === slug)

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Standings</h1>
        {meta && (
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: meta.color }} />
            <span>{meta.name}</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>League Table</CardTitle>
        </CardHeader>
        <CardContent>
          {teams && teams.length ? (
            <TeamStandings teams={teams} />
          ) : (
            <div className="text-center text-muted-foreground py-10">No standings available yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
