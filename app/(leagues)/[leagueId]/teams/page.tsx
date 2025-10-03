import { notFound } from 'next/navigation'
import { getLeagueIdFromSlug, LEAGUE_META } from '@/lib/constants/leagues'
import { getLeagueStandings } from '@/lib/api/leagues'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LeagueTeamsPage({ params }: { params: { leagueId: string } }) {
  const slug = params.leagueId
  const leagueId = getLeagueIdFromSlug(slug)
  if (!leagueId) notFound()

  // We can use standings to list teams quickly
  const teams = await getLeagueStandings(leagueId)
  const meta = LEAGUE_META.find(m => m.slug === slug)

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
        {meta && (
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: meta.color }} />
            <span>{meta.name}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {teams.length ? (
          teams.map(team => (
            <Card key={team.id}>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                  {team.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={team.logo_url} alt={team.name} className="w-12 h-12 object-contain" />
                  ) : (
                    <Shield className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="font-medium">{team.name}</div>
                <div className="text-xs text-muted-foreground">{team.points ?? 0} pts</div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-10 col-span-full">No teams found.</div>
        )}
      </div>
    </div>
  )
}
