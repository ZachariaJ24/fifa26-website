export type LeagueSlug = 'sfs-league-1' | 'sfs-league-2' | 'sfs-league-3';

export const LEAGUE_SLUG_TO_ID: Record<LeagueSlug, string> = {
  'sfs-league-1': 'b4960a2b-a577-40e3-9cfe-8b7810d113f8',
  'sfs-league-2': '4c6c727a-186e-41d5-95f3-a76b717f999e',
  'sfs-league-3': '86a8a13e-3b0b-4fb8-a750-557db9118e75',
};

export const LEAGUE_ID_TO_SLUG: Record<string, LeagueSlug> = {
  'b4960a2b-a577-40e3-9cfe-8b7810d113f8': 'sfs-league-1',
  '4c6c727a-186e-41d5-95f3-a76b717f999e': 'sfs-league-2',
  '86a8a13e-3b0b-4fb8-a750-557db9118e75': 'sfs-league-3',
};

export const LEAGUE_META: Array<{ slug: LeagueSlug; id: string; name: string; shortName: string; color: string }> = [
  { slug: 'sfs-league-1', id: LEAGUE_SLUG_TO_ID['sfs-league-1'], name: 'SFS League 1', shortName: 'L1', color: '#f97316' },
  { slug: 'sfs-league-2', id: LEAGUE_SLUG_TO_ID['sfs-league-2'], name: 'SFS League 2', shortName: 'L2', color: '#22c55e' },
  { slug: 'sfs-league-3', id: LEAGUE_SLUG_TO_ID['sfs-league-3'], name: 'SFS League 3', shortName: 'L3', color: '#6366f1' },
];

export function getLeagueIdFromSlug(slug: string): string | null {
  return LEAGUE_SLUG_TO_ID[slug as LeagueSlug] ?? null;
}

export function getSlugFromLeagueId(id: string): LeagueSlug | null {
  return LEAGUE_ID_TO_SLUG[id] ?? null;
}
