import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type TeamLike = Record<string, any>;

type TeamStandingsProps = {
  teams: TeamLike[];
  showPromotion?: boolean;
  showRelegation?: boolean;
};

export function TeamStandings({
  teams,
  showPromotion = true,
  showRelegation = true,
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center">#</TableHead>
            <TableHead className="min-w-[200px]">Team</TableHead>
            <TableHead className="text-center">P</TableHead>
            <TableHead className="text-center">W</TableHead>
            <TableHead className="text-center">D</TableHead>
            <TableHead className="text-center">L</TableHead>
            <TableHead className="text-center">GF</TableHead>
            <TableHead className="text-center">GA</TableHead>
            <TableHead className="text-center">GD</TableHead>
            <TableHead className="text-center font-bold">PTS</TableHead>
            <TableHead className="text-center">Form</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTeams.map((team, index) => {
            const isPromotion = showPromotion && index < 3;
            const isRelegation = showRelegation && index >= sortedTeams.length - 3;
            
            return (
              <TableRow 
                key={team.id ?? `${team.name}-${index}`}
                className={cn(
                  isPromotion ? 'bg-green-50 dark:bg-green-900/20' : false,
                  isRelegation ? 'bg-red-50 dark:bg-red-900/10' : false,
                  'hover:bg-muted/50'
                )}
              >
                <TableCell className="text-center font-medium">
                  <div className="flex items-center justify-center">
                    <span className={cn(
                      'w-6 h-6 flex items-center justify-center rounded-full text-xs',
                      isPromotion ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200' : false,
                      isRelegation ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200' : false,
                      !isPromotion && !isRelegation ? 'bg-muted' : false
                    )}>
                      {index + 1}
                    </span>
                  </div>
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
                <TableCell className="text-center">{team.wins ?? 0}</TableCell>
                <TableCell className="text-center">{team.draws ?? 0}</TableCell>
                <TableCell className="text-center">{team.losses ?? 0}</TableCell>
                <TableCell className="text-center">{team.goals_for ?? 0}</TableCell>
                <TableCell className="text-center">{team.goals_against ?? 0}</TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    (team.goal_difference ?? 0) > 0
                      ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200'
                      : (team.goal_difference ?? 0) < 0
                        ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200'
                        : 'bg-muted'
                  )}>
                    {(team.goal_difference ?? 0) > 0 ? '+' : ''}{team.goal_difference ?? 0}
                  </span>
                </TableCell>
                <TableCell className="text-center font-bold">{team.points ?? 0}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-1">
                    {String(team.form || '')
                      .split('')
                      .map((result, i) => (
                      <span 
                        key={i}
                        className={cn(
                          'w-4 h-4 rounded-full text-xs flex items-center justify-center',
                          result === 'W' ? 'bg-green-500 text-white' : false,
                          result === 'D' ? 'bg-yellow-500 text-white' : false,
                          result === 'L' ? 'bg-red-500 text-white' : false,
                          !['W', 'D', 'L'].includes(result) ? 'bg-muted' : false
                        )}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      <div className="p-4 border-t text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-4">
          {showPromotion && (
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Promotion</span>
            </div>
          )}
          {showRelegation && (
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span>Relegation</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
