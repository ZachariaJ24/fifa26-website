-- FIFA 26 League Database Migration: Complete Soccer Stats Implementation
-- This script drops old hockey columns and implements clean soccer terminology

-- Begin transaction
BEGIN;

-- Step 1: First, migrate existing data to temporary columns to preserve it
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS temp_goals_for INTEGER;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS temp_goals_against INTEGER;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS temp_games_played INTEGER;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS temp_otl INTEGER;

-- Copy existing data to temp columns
UPDATE clubs SET 
  temp_goals_for = COALESCE(goals_for, 0),
  temp_goals_against = COALESCE(goals_against, 0),
  temp_games_played = COALESCE(games_played, 0),
  temp_otl = COALESCE(otl, 0);

-- Step 2: Drop old hockey columns
ALTER TABLE clubs DROP COLUMN IF EXISTS goals_for;
ALTER TABLE clubs DROP COLUMN IF EXISTS goals_against;
ALTER TABLE clubs DROP COLUMN IF EXISTS games_played;
ALTER TABLE clubs DROP COLUMN IF EXISTS otl;
ALTER TABLE clubs DROP COLUMN IF EXISTS powerplay_goals;
ALTER TABLE clubs DROP COLUMN IF EXISTS powerplay_opportunities;
ALTER TABLE clubs DROP COLUMN IF EXISTS penalty_kill_goals_against;
ALTER TABLE clubs DROP COLUMN IF EXISTS penalty_kill_opportunities;

-- Step 3: Ensure soccer columns exist with proper defaults
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS draws INTEGER DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS goals_scored INTEGER DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS goals_conceded INTEGER DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS goal_difference INTEGER DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS clean_sheets INTEGER DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS matches_played INTEGER DEFAULT 0;

-- Step 4: Migrate data from temp columns to soccer columns
UPDATE clubs SET 
  goals_scored = COALESCE(temp_goals_for, 0),
  goals_conceded = COALESCE(temp_goals_against, 0),
  matches_played = COALESCE(temp_games_played, 0),
  draws = 0; -- Will be recalculated from fixtures

-- Calculate goal_difference
UPDATE clubs SET goal_difference = (COALESCE(goals_scored, 0) - COALESCE(goals_conceded, 0));

-- Step 5: Calculate clean sheets from fixtures (matches where club conceded 0 goals)
UPDATE clubs SET clean_sheets = (
  SELECT COUNT(*)
  FROM fixtures f
  WHERE (f.home_club_id = clubs.id AND f.away_score = 0 AND f.status = 'Completed')
     OR (f.away_club_id = clubs.id AND f.home_score = 0 AND f.status = 'Completed')
);

-- Step 6: Update points calculation for soccer (3 points for win, 1 for draw, 0 for loss)
UPDATE clubs SET points = (COALESCE(wins, 0) * 3) + (COALESCE(draws, 0) * 1);

-- Step 7: Clean up temporary columns
ALTER TABLE clubs DROP COLUMN IF EXISTS temp_goals_for;
ALTER TABLE clubs DROP COLUMN IF EXISTS temp_goals_against;
ALTER TABLE clubs DROP COLUMN IF EXISTS temp_games_played;
ALTER TABLE clubs DROP COLUMN IF EXISTS temp_otl;

-- Step 8: Add comments to document the changes
COMMENT ON COLUMN clubs.goals_scored IS 'Total goals scored by the club';
COMMENT ON COLUMN clubs.goals_conceded IS 'Total goals conceded by the club';
COMMENT ON COLUMN clubs.goal_difference IS 'Goal difference (goals_scored - goals_conceded)';
COMMENT ON COLUMN clubs.draws IS 'Number of drawn matches';
COMMENT ON COLUMN clubs.clean_sheets IS 'Number of matches without conceding goals';
COMMENT ON COLUMN clubs.matches_played IS 'Total matches played';

-- Step 9: Indexes already exist (idx_clubs_goal_difference, idx_clubs_goals_scored, idx_clubs_goals_conceded)

-- Step 10: Update any views or triggers that might reference the old columns
-- Note: Any code referencing old hockey columns will need to be updated

COMMIT;

-- MIGRATION COMPLETE: Hockey columns removed, clean soccer implementation ready
-- Old hockey columns (goals_for, goals_against, games_played, otl, powerplay stats) have been DROPPED
-- New soccer columns are now the primary stats system

-- Verification queries (run these after migration):
-- SELECT name, wins, draws, losses, goals_scored, goals_conceded, goal_difference, points, matches_played FROM clubs LIMIT 5;
-- SELECT COUNT(*) as total_clubs, SUM(goals_scored) as total_goals FROM clubs WHERE is_active = true;
