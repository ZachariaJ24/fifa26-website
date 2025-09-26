-- Simple standings sync script
-- This will update team stats to match calculated standings from matches

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

-- Update each team's stats manually
-- Replace 'TEAM_ID_HERE' with actual team IDs from your teams table

-- Example for one team (you'll need to run this for each team):
/*
UPDATE teams SET
  wins = (
    SELECT COUNT(*)
    FROM matches 
    WHERE season_id = (SELECT id FROM seasons WHERE is_active = true)
      AND status = 'completed'
      AND (
        (home_team_id = 'TEAM_ID_HERE' AND home_score > away_score) OR 
        (away_team_id = 'TEAM_ID_HERE' AND away_score > home_score)
      )
  ),
  losses = (
    SELECT COUNT(*)
    FROM matches 
    WHERE season_id = (SELECT id FROM seasons WHERE is_active = true)
      AND status = 'completed'
      AND (
        (home_team_id = 'TEAM_ID_HERE' AND home_score < away_score) OR 
        (away_team_id = 'TEAM_ID_HERE' AND away_score < home_score)
      )
  ),
  otl = (
    SELECT COUNT(*)
    FROM matches 
    WHERE season_id = (SELECT id FROM seasons WHERE is_active = true)
      AND status = 'completed'
      AND (
        (home_team_id = 'TEAM_ID_HERE' AND home_score = away_score) OR 
        (away_team_id = 'TEAM_ID_HERE' AND away_score = home_score)
      )
  ),
  goals_for = (
    SELECT COALESCE(SUM(
      CASE WHEN home_team_id = 'TEAM_ID_HERE' THEN home_score ELSE away_score END
    ), 0)
    FROM matches 
    WHERE season_id = (SELECT id FROM seasons WHERE is_active = true)
      AND status = 'completed'
      AND (home_team_id = 'TEAM_ID_HERE' OR away_team_id = 'TEAM_ID_HERE')
  ),
  goals_against = (
    SELECT COALESCE(SUM(
      CASE WHEN home_team_id = 'TEAM_ID_HERE' THEN away_score ELSE home_score END
    ), 0)
    FROM matches 
    WHERE season_id = (SELECT id FROM seasons WHERE is_active = true)
      AND status = 'completed'
      AND (home_team_id = 'TEAM_ID_HERE' OR away_team_id = 'TEAM_ID_HERE')
  ),
  games_played = (
    SELECT COUNT(*)
    FROM matches 
    WHERE season_id = (SELECT id FROM seasons WHERE is_active = true)
      AND status = 'completed'
      AND (home_team_id = 'TEAM_ID_HERE' OR away_team_id = 'TEAM_ID_HERE')
  ),
  points = (
    SELECT COUNT(*) * 3 + (
      SELECT COUNT(*)
      FROM matches 
      WHERE season_id = (SELECT id FROM seasons WHERE is_active = true)
        AND status = 'completed'
        AND (
          (home_team_id = 'TEAM_ID_HERE' AND home_score = away_score) OR 
          (away_team_id = 'TEAM_ID_HERE' AND away_score = home_score)
        )
    )
    FROM matches 
    WHERE season_id = (SELECT id FROM seasons WHERE is_active = true)
      AND status = 'completed'
      AND (
        (home_team_id = 'TEAM_ID_HERE' AND home_score > away_score) OR 
        (away_team_id = 'TEAM_ID_HERE' AND away_score > home_score)
      )
  ),
  updated_at = NOW()
WHERE id = 'TEAM_ID_HERE';
*/

-- Alternative: Use the admin API endpoint instead
-- Go to /admin/settings -> Standings tab -> Sync Standings button
-- This will automatically update all teams at once
