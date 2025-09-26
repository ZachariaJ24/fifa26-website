import { createClient } from '@/lib/supabase/server';
import { League, TeamStanding, Match } from '@/types';

// Get all leagues
export async function getLeagues(): Promise<League[]> {
  const supabase = createClient();
  
  // Prefer conferences
  const { data: conferences, error: confErr } = await supabase
    .from('conferences')
    .select(`id, name, description, color, is_active`)
    .order('name');

  if (confErr && !conferences) {
    console.error('Error fetching conferences:', confErr);
    return [];
  }

  // Map conferences to a minimal League shape used by the UI
  return (conferences || []).map((c) => ({
    id: c.id,
    name: c.name,
    short_name: c.name,
    has_promotion: true,
    has_relegation: true,
  })) as unknown as League[];
}

// Get a single league by ID
export async function getLeagueById(id: string): Promise<League | null> {
  const supabase = createClient();
  
  // Try conferences first
  let league: any = null;
  let error: any = null;
  try {
    const { data, error: confErr } = await supabase
      .from('conferences')
      .select(`id, name, description, color, is_active`)
      .eq('id', id)
      .single();
    league = data;
    error = confErr;
  } catch (e) {
    error = e;
  }

  if (error || !league) {
    console.error(`Conference not found: ${id}`, error);
    return null;
  }

  if (error) {
    console.error(`Error fetching league ${id}:`, error);
    return null;
  }

  // Return minimal League shape; top scorers are fetched via getTopScorers
  return {
    id: league.id,
    name: league.name,
    short_name: league.name,
    has_promotion: true,
    has_relegation: true,
  } as unknown as League;
}

export async function getLeagueStandings(leagueId: string): Promise<TeamStanding[]> {
  const supabase = createClient();

  // Pull Standings directly from teams table by conference
  const { data: teams, error } = await supabase
    .from('teams')
    .select('id, name, logo_url, games_played, wins, losses, otl, goals_for, goals_against, points')
    .eq('conference_id', leagueId)
    .order('points', { ascending: false });

  if (error) {
    console.error(`Error fetching Standings (teams) for league ${leagueId}:`, error);
    return [];
  }

  const rows = (teams || []).map((t: any) => {
    const gd = (t.goals_for || 0) - (t.goals_against || 0);
    const played = t.games_played || 0;
    const wins = t.wins || 0;
    const losses = t.losses || 0;
    const draws = 0; // not tracked; schema uses OTL
    const points = t.points || (wins * 2 + (t.otl || 0));
    return {
      id: t.id,
      name: t.name,
      logo_url: t.logo_url,
      position: 0, // will be assigned after sort
      played,
      wins,
      draws,
      losses,
      goals_for: t.goals_for || 0,
      goals_against: t.goals_against || 0,
      goal_difference: gd,
      points,
      form: undefined,
    } as unknown as TeamStanding;
  });

  // Sort by points, GD, GF
  rows.sort((a: any, b: any) => {
    if (b.points !== a.points) return b.points - a.points;
    if ((b.goal_difference || 0) !== (a.goal_difference || 0)) return (b.goal_difference || 0) - (a.goal_difference || 0);
    return (b.goals_for || 0) - (a.goals_for || 0);
  });
  // Assign positions
  rows.forEach((r: any, i: number) => (r.position = i + 1));

  return rows as TeamStanding[];
}
// Get upcoming matches for a league (filter via teams in the league/conference)
export async function getUpcomingMatches(leagueId: string, limit = 10): Promise<Match[]> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: teamRows, error: teamErr } = await supabase
    .from('teams')
    .select('id')
    .eq('conference_id', leagueId);
  if (teamErr) {
    console.error('Error fetching teams for league/conference', leagueId, teamErr);
    return [];
  }
  const teamIds = (teamRows || []).map((t: any) => t.id);
  if (teamIds.length === 0) return [];

  const idsCsv = teamIds.map((id: string) => `"${id}"`).join(',');
  const baseSelect = `
      *,
      home_team:home_team_id(
        id,
        name,
        logo_url
      ),
      away_team:away_team_id(
        id,
        name,
        logo_url
      )
    `;

  const { data: matches, error } = await supabase
    .from('matches')
    .select(baseSelect)
    .gte('match_date', today)
    .order('match_date')
    .or(`home_team_id.in.(${idsCsv}),away_team_id.in.(${idsCsv})`)
    .limit(limit);

  if (error) {
    console.error(`Error fetching upcoming matches for id ${leagueId}:`, error);
    return [];
  }

  return (matches || []) as unknown as Match[];
}

// Get recent matches for a league
// Get recent matches for a league (filter via teams in the league/conference)
export async function getRecentMatches(leagueId: string, limit = 10): Promise<Match[]> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: teamRows, error: teamErr } = await supabase
    .from('teams')
    .select('id')
    .or(`conference_id.eq.${leagueId},league_id.eq.${leagueId}`);
  if (teamErr) {
    console.error('Error fetching teams for league/conference', leagueId, teamErr);
    return [];
  }
  const teamIds = (teamRows || []).map((t: any) => t.id);
  if (teamIds.length === 0) return [];

  const idsCsv = teamIds.map((id: string) => `"${id}"`).join(',');
  const baseSelect = `
      *,
      home_team:home_team_id(
        id,
        name,
        logo_url
      ),
      away_team:away_team_id(
        id,
        name,
        logo_url
      )
    `;

  const { data: matches, error } = await supabase
    .from('matches')
    .select(baseSelect)
    .lt('match_date', today)
    .order('match_date', { ascending: false })
    .or(`home_team_id.in.(${idsCsv}),away_team_id.in.(${idsCsv})`)
    .limit(limit);
  if (error) {
    console.error(`Error fetching recent matches for id ${leagueId}:`, error);
    return [];
  }
  return (matches || []) as unknown as Match[];
}

// Get matches by round for a league
// Get matches by round for a league (filter via teams in the league/conference)
export async function getMatchesByRound(leagueId: string, round: string): Promise<Match[]> {
  const supabase = createClient();

  const { data: teamRows, error: teamErr } = await supabase
    .from('teams')
    .select('id')
    .or(`conference_id.eq.${leagueId},league_id.eq.${leagueId}`);
  if (teamErr) {
    console.error('Error fetching teams for league/conference', leagueId, teamErr);
    return [];
  }
  const teamIds = (teamRows || []).map((t: any) => t.id);
  if (teamIds.length === 0) return [];

  const idsCsv = teamIds.map((id: string) => `"${id}"`).join(',');
  const baseSelect = `
      *,
      home_team:home_team_id(
        id,
        name,
        logo_url
      ),
      away_team:away_team_id(
        id,
        name,
        logo_url
      )
    `;

  const { data: matches, error } = await supabase
    .from('matches')
    .select(baseSelect)
    .eq('round', round)
    .order('match_date')
    .or(`home_team_id.in.(${idsCsv}),away_team_id.in.(${idsCsv})`);
  if (error) {
    console.error(`Error fetching matches by round for id ${leagueId}:`, error);
    return [];
  }
  return (matches || []) as unknown as Match[];
}

// Get top scorers for a league
export async function getTopScorers(leagueId: string, limit = 10) {
  const supabase = createClient();

  // Resolve team IDs for this conference/league
  const { data: teamRows, error: teamErr } = await supabase
    .from('teams')
    .select('id, name, logo_url')
    .eq('conference_id', leagueId);
  if (teamErr) {
    console.error(`Error fetching teams for top scorers ${leagueId}:`, teamErr);
    return [];
  }
  const teamMap = new Map<string, { id: string; name: string; logo_url?: string }>();
  (teamRows || []).forEach((t: any) => teamMap.set(t.id, { id: t.id, name: t.name, logo_url: t.logo_url }));
  const teamIds = Array.from(teamMap.keys());
  if (teamIds.length === 0) return [];
  const idsCsv = teamIds.map((id: string) => `"${id}"`).join(',');

  // Fetch per-match player stats for those teams
  const { data: rows, error } = await supabase
    .from('ea_player_stats')
    .select('player_name, team_id, goals, assists')
    .or(`team_id.in.(${idsCsv})`)
    .limit(5000);

  if (error) {
    console.error(`Error fetching ea_player_stats for ${leagueId}:`, error);
    return [];
  }

  // Aggregate goals/assists by player_name + team_id
  const agg = new Map<string, { id: string; name: string; team: { id: string; name: string; logo_url?: string }; goals: number; assists: number; matches_played: number; minutes_played: number }>();
  (rows || []).forEach((r: any) => {
    const key = `${r.team_id}::${r.player_name || 'Unknown'}`;
    if (!agg.has(key)) {
      const team = teamMap.get(r.team_id) || { id: r.team_id, name: 'Unknown', logo_url: undefined };
      agg.set(key, {
        id: key,
        name: r.player_name || 'Unknown',
        team,
        goals: 0,
        assists: 0,
        matches_played: 0,
        minutes_played: 0,
      });
    }
    const cur = agg.get(key)!;
    cur.goals += r.goals || 0;
    cur.assists += r.assists || 0;
    cur.matches_played += 1;
  });

  // Sort by goals desc, then assists desc
  const list = Array.from(agg.values()).sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    return b.assists - a.assists;
  });

  return list.slice(0, limit);
}

// Get league stats (totals, averages, etc.)
export interface LeagueStats {
  total_matches: number;
  total_goals: number;
  avg_goals_per_match: number;
  total_clean_sheets: number;
  yellow_cards: number;
  red_cards: number;
  cards_per_match: number;
}

interface MatchRow {
  id: string;
  home_score: number | null;
  away_score: number | null;
}

export async function getLeagueStats(leagueId: string): Promise<LeagueStats> {
  const supabase = createClient();

  // Default return value for error cases
  const defaultStats: LeagueStats = {
    total_matches: 0,
    total_goals: 0,
    avg_goals_per_match: 0,
    total_clean_sheets: 0,
    yellow_cards: 0,
    red_cards: 0,
    cards_per_match: 0,
  };

  try {
    // 1. Get all teams in the conference
    const { data: teamRows, error: teamErr } = await supabase
      .from('teams')
      .select('id')
      .eq('conference_id', leagueId);

    if (teamErr || !teamRows?.length) {
      console.error('Error or no teams found for conference', leagueId, teamErr);
      return defaultStats;
    }

    const teamIds = teamRows.map(t => t.id);
    const teamIdCsv = teamRows.map(t => `"${t.id}"`).join(',');

    // 2. Get all matches involving these teams
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, home_team_id, away_team_id, home_score, away_score')
      .or(`home_team_id.in.(${teamIdCsv}),away_team_id.in.(${teamIdCsv})`);

    if (matchesError || !matches?.length) {
      console.error('Error or no matches found for teams', matchesError);
      return defaultStats;
    }

    // 3. Calculate basic match statistics
    const matchIds = matches.map(m => m.id);
    const totalMatches = matches.length;
    
    const totalGoals = matches.reduce((sum, m) => {
      return sum + (m.home_score || 0) + (m.away_score || 0);
    }, 0);

    const avgGoalsPerMatch = totalMatches > 0 
      ? Number((totalGoals / totalMatches).toFixed(2)) 
      : 0;

    // 4. Calculate clean sheets
    const homeCleanSheets = matches.filter(m => m.away_score === 0).length;
    const awayCleanSheets = matches.filter(m => m.home_score === 0).length;
    const totalCleanSheets = homeCleanSheets + awayCleanSheets;

    // 5. Get card statistics
    let yellowCards = 0;
    let redCards = 0;

    try {
      // Get yellow cards (including second yellows)
      const { count: yellowCount } = await supabase
        .from('match_events')
        .select('*', { count: 'exact', head: true })
        .in('match_id', matchIds)
        .in('event_type', ['yellow_card', 'second_yellow']);
      
      if (yellowCount) yellowCards = yellowCount;

      // Get red cards
      const { count: redCount } = await supabase
        .from('match_events')
        .select('*', { count: 'exact', head: true })
        .in('match_id', matchIds)
        .eq('event_type', 'red_card');
      
      if (redCount) redCards = redCount;
    } catch (error) {
      console.error('Error fetching card stats:', error);
      // Continue with 0 values if there's an error
    }

    // 6. Calculate cards per match
    const cardsPerMatch = totalMatches > 0 
      ? Number(((yellowCards + redCards) / totalMatches).toFixed(2)) 
      : 0;

    // 7. Return the complete stats object
    return {
      total_matches: totalMatches,
      total_goals,
      avg_goals_per_match: avgGoalsPerMatch,
      total_clean_sheets,
      yellow_cards: yellowCards,
      red_cards: redCards,
      cards_per_match: cardsPerMatch,
    };
  } catch (error) {
    console.error('Unexpected error in getLeagueStats:', error);
    return defaultStats;
  }
}
