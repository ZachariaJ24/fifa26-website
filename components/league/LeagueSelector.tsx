'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { LEAGUE_META } from '@/lib/constants/leagues';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const LEAGUES = LEAGUE_META;

export function LeagueSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLeague = pathname.split('/')[2] || LEAGUES[0].slug;

  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
      {LEAGUES.map((league) => (
        <Button
          key={league.slug}
          variant="ghost"
          size="sm"
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            currentLeague === league.slug
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:bg-muted/50'
          )}
          onClick={() => {
            // Update the URL without triggering a full page reload
            const newPath = pathname.includes('leagues')
              ? pathname.replace(/leagues\/[^/]+/, `leagues/${league.slug}`)
              : `/leagues/${league.slug}`;
            router.push(newPath);
          }}
        >
          <span className="hidden sm:inline">{league.name}</span>
          <span className="sm:hidden">{league.shortName}</span>
        </Button>
      ))}
    </div>
  );
}
