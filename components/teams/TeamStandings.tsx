import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type TeamLike = Record<string, any>;

type TeamStandingsProps = {
  teams: TeamLike[];
  showClinched?: boolean;
  showEliminated?: boolean;
};

export function TeamStandings({
  teams,
  showClinched = true,
  showEliminated = true,
}: TeamStandingsProps) {
  // Sort teams by points, then goal difference, then goals scored
  const sortedTeams = [...teams].sort((a, b) => {
    const aPts = Number(a?.points ?? 0);
    const bPts = Number(b?.points ?? 0);
    if (bPts !== aPts) return bPts - aPts;
    const aGd = Number(a?.goal_difference ?? 0);
    const bGd = Number(b?.goal_difference ?? 0);
    if (bGd !== aGd) return bGd - aGd;
    const aGf = Number(a?.goals_for ?? 0);
    const bGf = Number(b?.goals_for ?? 0);
    return bGf - aGf;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        {showClinched && (
          <div className="flex items-center">
            <span className="px-2 py-1 text-xs font-semibold text-green-100 bg-green-600 rounded-md mr-2">CLINCHED</span>
            <span className="text-muted-foreground">Clinched Playoff Spot</span>
          </div>
        )}
        {showEliminated && (
          <div className="flex items-center">
            <span className="px-2 py-1 text-xs font-semibold text-red-100 bg-red-600 rounded-md mr-2">ELIMINATED</span>
            <span className="text-muted-foreground">Eliminated from Playoffs</span>
          </div>
        )}
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0">
              <TableHead className="w-[50px] text-center">#</TableHead>
              <TableHead className="min-w-[200px]">Team</TableHead>
              <TableHead className="text-center">GP</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">D</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center">GF</TableHead>
              <TableHead className="text-center">GA</TableHead>
              <TableHead className="text-center">DIFF</TableHead>
              <TableHead className="text-center font-bold">PTS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTeams.map((team, index) => {
              const isClinched = showClinched && index < 3;
              const isEliminated = showEliminated && index >= sortedTeams.length - 3;
              
              return (
                <TableRow 
                  key={team.id ?? `${team.name}-${index}`}
                  className='hover:bg-muted/50'
                >
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {team.logo_url && (
                        <img 
                          src={team.logo_url} 
                          alt={team.name || 'Team'}
                          className="h-6 w-6 object-contain"
                        />
                      )}
                      <span className="font-medium">{team.name || 'Team'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{team.played ?? 0}</TableCell>
                  <TableCell className="text-center text-green-400">{team.wins ?? 0}</TableCell>
                  <TableCell className="text-center text-yellow-400">{team.draws ?? 0}</TableCell>
                  <TableCell className="text-center text-red-400">{team.losses ?? 0}</TableCell>
                  <TableCell className="text-center">{team.goals_for ?? 0}</TableCell>
                  <TableCell className="text-center">{team.goals_against ?? 0}</TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      'font-medium',
                      (team.goal_difference ?? 0) > 0
                        ? 'text-green-400'
                        : (team.goal_difference ?? 0) < 0
                          ? 'text-red-400'
                          : 'text-muted-foreground'
                    )}>
                      {(team.goal_difference ?? 0) > 0 ? '+' : ''}{team.goal_difference ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-bold text-primary">{team.points ?? 0}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
