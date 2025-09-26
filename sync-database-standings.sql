-- Sync database stored team stats with calculated standings from matches
-- This script will update the teams table with accurate stats calculated from matches

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

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS recalculate_team_stats();

-- Create a function to recalculate and update team stats
CREATE FUNCTION recalculate_team_stats()
RETURNS TABLE(
  team_id UUID,
  team_name TEXT,
  old_wins INTEGER,
  new_wins INTEGER,
  old_losses INTEGER,
  new_losses INTEGER,
  old_otl INTEGER,
  new_otl INTEGER,
  old_points INTEGER,
  new_points INTEGER,
  old_gf INTEGER,
  new_gf INTEGER,
  old_ga INTEGER,
  new_ga INTEGER
) AS $$
DECLARE
  current_season_id UUID;
  team_record RECORD;
  calculated_wins INTEGER;
  calculated_losses INTEGER;
  calculated_otl INTEGER;
  calculated_gf INTEGER;
  calculated_ga INTEGER;
  calculated_games INTEGER;
  calculated_points INTEGER;
BEGIN
  -- Get current active season
  SELECT id INTO current_season_id FROM seasons WHERE is_active = true;
  
  -- Loop through all active teams
  FOR team_record IN 
    SELECT id, name, wins, losses, otl, points, goals_for, goals_against, games_played
    FROM teams 
    WHERE is_active = true
  LOOP
    -- Reset counters
    calculated_wins := 0;
    calculated_losses := 0;
    calculated_otl := 0;
    calculated_gf := 0;
    calculated_ga := 0;
    
    -- Calculate stats from matches
    SELECT 
      COUNT(CASE 
        WHEN (home_team_id = team_record.id AND home_score > away_score) OR 
             (away_team_id = team_record.id AND away_score > home_score) THEN 1 
      END),
      COUNT(CASE 
        WHEN (home_team_id = team_record.id AND home_score < away_score) OR 
             (away_team_id = team_record.id AND away_score < home_score) THEN 1 
      END),
      COUNT(CASE 
        WHEN (home_team_id = team_record.id AND home_score = away_score) OR 
             (away_team_id = team_record.id AND away_score = home_score) THEN 1 
      END),
      COALESCE(SUM(CASE WHEN home_team_id = team_record.id THEN home_score ELSE away_score END), 0),
      COALESCE(SUM(CASE WHEN home_team_id = team_record.id THEN away_score ELSE home_score END), 0)
    INTO calculated_wins, calculated_losses, calculated_otl, calculated_gf, calculated_ga
    FROM matches 
    WHERE season_id = current_season_id 
      AND status = 'completed'
      AND (home_team_id = team_record.id OR away_team_id = team_record.id);
    
    calculated_games := calculated_wins + calculated_losses + calculated_otl;
    calculated_points := calculated_wins * 3 + calculated_otl * 1;
    
    -- Return comparison data
    team_id := team_record.id;
    team_name := team_record.name;
    old_wins := team_record.wins;
    new_wins := calculated_wins;
    old_losses := team_record.losses;
    new_losses := calculated_losses;
    old_otl := team_record.otl;
    new_otl := calculated_otl;
    old_points := team_record.points;
    new_points := calculated_points;
    old_gf := team_record.goals_for;
    new_gf := calculated_gf;
    old_ga := team_record.goals_against;
    new_ga := calculated_ga;
    
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the comparison function to see differences
SELECT * FROM recalculate_team_stats();

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS update_team_stats_trigger ON matches;
DROP FUNCTION IF EXISTS update_team_stats_from_matches();

-- Create function to actually update the team stats
CREATE FUNCTION update_team_stats_from_matches()
RETURNS INTEGER AS $$
DECLARE
  current_season_id UUID;
  team_record RECORD;
  calculated_wins INTEGER;
  calculated_losses INTEGER;
  calculated_otl INTEGER;
  calculated_gf INTEGER;
  calculated_ga INTEGER;
  calculated_games INTEGER;
  calculated_points INTEGER;
  updated_count INTEGER := 0;
BEGIN
  -- Get current active season
  SELECT id INTO current_season_id FROM seasons WHERE is_active = true;
  
  -- Loop through all active teams
  FOR team_record IN 
    SELECT id FROM teams WHERE is_active = true
  LOOP
    -- Reset counters
    calculated_wins := 0;
    calculated_losses := 0;
    calculated_otl := 0;
    calculated_gf := 0;
    calculated_ga := 0;
    
    -- Calculate stats from matches
    SELECT 
      COUNT(CASE 
        WHEN (home_team_id = team_record.id AND home_score > away_score) OR 
             (away_team_id = team_record.id AND away_score > home_score) THEN 1 
      END),
      COUNT(CASE 
        WHEN (home_team_id = team_record.id AND home_score < away_score) OR 
             (away_team_id = team_record.id AND away_score < home_score) THEN 1 
      END),
      COUNT(CASE 
        WHEN (home_team_id = team_record.id AND home_score = away_score) OR 
             (away_team_id = team_record.id AND away_score = home_score) THEN 1 
      END),
      COALESCE(SUM(CASE WHEN home_team_id = team_record.id THEN home_score ELSE away_score END), 0),
      COALESCE(SUM(CASE WHEN home_team_id = team_record.id THEN away_score ELSE home_score END), 0)
    INTO calculated_wins, calculated_losses, calculated_otl, calculated_gf, calculated_ga
    FROM matches 
    WHERE season_id = current_season_id 
      AND status = 'completed'
      AND (home_team_id = team_record.id OR away_team_id = team_record.id);
    
    calculated_games := calculated_wins + calculated_losses + calculated_otl;
    calculated_points := calculated_wins * 3 + calculated_otl * 1;
    
    -- Update the team record
    UPDATE teams SET
      wins = calculated_wins,
      losses = calculated_losses,
      otl = calculated_otl,
      points = calculated_points,
      goals_for = calculated_gf,
      goals_against = calculated_ga,
      games_played = calculated_games,
      updated_at = NOW()
    WHERE id = team_record.id;
    
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Run the update function
SELECT update_team_stats_from_matches() as teams_updated;

-- Note: The original trigger was likely different
-- If you need automatic updates, you'll need to create a proper trigger function
-- For now, we'll just run the sync manually when needed

-- Verify the results
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
