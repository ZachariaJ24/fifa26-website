import { getLeagueStandings } from '@/lib/api/leagues'
import { LEAGUE_META } from '@/lib/constants/leagues'
import { TeamStandings } from '@/components/teams/TeamStandings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function StackedStandingsPage() {
  const standingsByLeague = await Promise.all(
    LEAGUE_META.map(async (meta) => {
      const teams = await getLeagueStandings(meta.id)
      return { meta, teams }
    })
  )

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">SFS Standings (All Leagues)</h1>
        <p className="text-muted-foreground">Current standings stacked by league</p>
      </div>

      <div className="space-y-10">
        {standingsByLeague.map(({ meta, teams }) => (
          <Card key={meta.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                {meta.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teams && teams.length > 0 ? (
                <TeamStandings teams={teams} />
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No standings available yet.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
