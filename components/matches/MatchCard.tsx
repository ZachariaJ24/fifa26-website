import { Match } from '@/types';
import { format } from 'date-fns';
import { Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '../ui/card';

type MatchCardProps = {
  match: Match;
  showDate?: boolean;
};

export function MatchCard({ match, showDate = false }: MatchCardProps) {
  const matchDate = new Date(match.match_date);
  const isCompleted = match.status === 'Completed';
  const isLive = match.status === 'In Progress';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {showDate && (
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            <Calendar className="h-4 w-4 mr-2" />
            {format(matchDate, 'EEEE, MMMM d, yyyy')}
          </div>
        )}
        
        <div className="space-y-4">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                {match.home_team?.logo_url ? (
                  <img 
                    src={match.home_team.logo_url} 
                    alt={match.home_team.name} 
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <span className="text-xs font-medium">
                    {match.home_team?.name?.charAt(0) || 'H'}
                  </span>
                )}
              </div>
              <span className="font-medium">{match.home_team?.name || 'TBD'}</span>
            </div>
            {isCompleted && (
              <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                <span className="font-bold">{match.home_score ?? 0}</span>
              </div>
            )}
          </div>

          {/* VS / Match Time */}
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            {isLive ? (
              <div className="flex items-center text-destructive font-medium">
                <span className="h-2 w-2 rounded-full bg-destructive mr-2 animate-pulse" />
                LIVE
              </div>
            ) : isCompleted ? (
              <span className="text-xs uppercase tracking-wider">FT</span>
            ) : (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {format(matchDate, 'h:mm a')}
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                {match.away_team?.logo_url ? (
                  <img 
                    src={match.away_team.logo_url} 
                    alt={match.away_team.name} 
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <span className="text-xs font-medium">
                    {match.away_team?.name?.charAt(0) || 'A'}
                  </span>
                )}
              </div>
              <span className="font-medium">{match.away_team?.name || 'TBD'}</span>
            </div>
            {isCompleted && (
              <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                <span className="font-bold">{match.away_score ?? 0}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 border-t">
        <Link 
          href={`/matches/${match.id}`}
          className="text-sm text-primary hover:underline w-full text-center"
        >
          {isLive ? 'Watch Live' : 'Match Details'}
        </Link>
      </CardFooter>
    </Card>
  );
}
