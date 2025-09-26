-- Simple standings sync without touching triggers
-- This will just update the team stats to match calculated standings

-- First, let's see what we're working with
SELECT 
  t.id,
  t.name,
  t.wins,
  t.losses,
  t.otl,
  t.points,
  t.goals_for,
  t.goals_against,
  t.games_played,
  c.name as conference_name
FROM teams t
LEFT JOIN conferences c ON t.conference_id = c.id
WHERE t.is_active = true
ORDER BY t.points DESC, t.wins DESC;

-- Get current active season
SELECT id, name, season_number FROM seasons WHERE is_active = true;

-- Get completed matches for current season
SELECT 
  COUNT(*) as total_matches,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_matches
FROM matches 
WHERE season_id = (SELECT id FROM seasons WHERE is_active = true);

-- Update all teams at once using a single query
WITH team_calculations AS (
  SELECT 
    t.id as team_id,
    t.name as team_name,
    -- Calculate wins
    COUNT(CASE 
      WHEN (m.home_team_id = t.id AND m.home_score > m.away_score) OR 
           (m.away_team_id = t.id AND m.away_score > m.home_score) THEN 1 
    END) as calculated_wins,
    -- Calculate losses
    COUNT(CASE 
      WHEN (m.home_team_id = t.id AND m.home_score < m.away_score) OR 
           (m.away_team_id = t.id AND m.away_score < m.home_score) THEN 1 
    END) as calculated_losses,
    -- Calculate OTL (overtime losses)
    COUNT(CASE 
      WHEN (m.home_team_id = t.id AND m.home_score = m.away_score) OR 
           (m.away_team_id = t.id AND m.away_score = m.home_score) THEN 1 
    END) as calculated_otl,
    -- Calculate goals for
    COALESCE(SUM(CASE WHEN m.home_team_id = t.id THEN m.home_score ELSE m.away_score END), 0) as calculated_gf,
    -- Calculate goals against
    COALESCE(SUM(CASE WHEN m.home_team_id = t.id THEN m.away_score ELSE m.home_score END), 0) as calculated_ga
  FROM teams t
  LEFT JOIN matches m ON (
    m.season_id = (SELECT id FROM seasons WHERE is_active = true)
    AND m.status = 'completed'
    AND (m.home_team_id = t.id OR m.away_team_id = t.id)
  )
  WHERE t.is_active = true
  GROUP BY t.id, t.name
)
UPDATE teams 
SET 
  wins = tc.calculated_wins,
  losses = tc.calculated_losses,
  otl = tc.calculated_otl,
  points = (tc.calculated_wins * 3) + (tc.calculated_otl * 1),
  goals_for = tc.calculated_gf,
  goals_against = tc.calculated_ga,
  games_played = tc.calculated_wins + tc.calculated_losses + tc.calculated_otl,
  updated_at = NOW()
FROM team_calculations tc
WHERE teams.id = tc.team_id;

-- Show the updated results
SELECT 
  t.id,
  t.name,
  t.wins,
  t.losses,
  t.otl,
  t.points,
  t.goals_for,
  t.goals_against,
  t.games_played,
  c.name as conference_name
FROM teams t
LEFT JOIN conferences c ON t.conference_id = c.id
WHERE t.is_active = true
ORDER BY t.points DESC, t.wins DESC;
