import { notFound } from 'next/navigation'
import { getLeagueIdFromSlug, LEAGUE_META } from '@/lib/constants/leagues'
import { getTopScorers, getLeagueStats } from '@/lib/api/leagues'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function LeagueStatsPage({ params }: { params: { leagueId: string } }) {
  const slug = params.leagueId
  const leagueId = getLeagueIdFromSlug(slug)
  if (!leagueId) notFound()

  const [scorers, stats] = await Promise.all([
    getTopScorers(leagueId, 10),
    getLeagueStats(leagueId),
  ])

  const meta = LEAGUE_META.find(m => m.slug === slug)

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        {meta && (
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: meta.color }} />
            <span>{meta.name}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Scorers</CardTitle>
          </CardHeader>
          <CardContent>
            {scorers.length ? (
              <div className="space-y-3">
                {scorers.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.team?.name ?? '—'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{p.goals} goals</div>
                      <div className="text-xs text-muted-foreground">{p.assists} assists</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-10">No scorer data yet.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>League Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Matches</div>
                <div className="text-xl font-semibold">{stats.total_matches}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Total Goals</div>
                <div className="text-xl font-semibold">{stats.total_goals}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Avg Goals/Match</div>
                <div className="text-xl font-semibold">{stats.avg_goals_per_match}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Clean Sheets</div>
                <div className="text-xl font-semibold">{stats.total_clean_sheets}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Yellow Cards</div>
                <div className="text-xl font-semibold">{stats.yellow_cards}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Red Cards</div>
                <div className="text-xl font-semibold">{stats.red_cards}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
