import { notFound } from 'next/navigation'
import { getLeagueIdFromSlug, LEAGUE_META } from '@/lib/constants/leagues'
import { getUpcomingMatches, getRecentMatches } from '@/lib/api/leagues'
import { MatchCard } from '@/components/matches/MatchCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function LeagueMatchesPage({ params }: { params: { leagueId: string } }) {
  const slug = params.leagueId
  const leagueId = getLeagueIdFromSlug(slug)
  if (!leagueId) notFound()

  const [upcoming, recent] = await Promise.all([
    getUpcomingMatches(leagueId, 12),
    getRecentMatches(leagueId, 12),
  ])

  const meta = LEAGUE_META.find(m => m.slug === slug)

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Matches</h1>
        {meta && (
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: meta.color }} />
            <span>{meta.name}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map(m => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-10">No upcoming matches scheduled.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recent.map(m => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-10">No recent matches.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
