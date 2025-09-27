-- FIFA 26 League Database Migration: Convert Hockey Stats to Soccer Stats
-- This script updates the clubs table to use proper soccer terminology

-- Begin transaction
BEGIN;

-- Step 1: Add new soccer-appropriate columns to clubs table
ALTER TABLE clubs 
ADD COLUMN IF NOT EXISTS draws INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS goals_scored INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS goals_conceded INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS goal_difference INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clean_sheets INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS matches_played INTEGER DEFAULT 0;

-- Step 2: Migrate existing data from hockey terms to soccer terms
-- Convert goals_for to goals_scored
UPDATE clubs SET goals_scored = COALESCE(goals_for, 0) WHERE goals_for IS NOT NULL;

-- Convert goals_against to goals_conceded  
UPDATE clubs SET goals_conceded = COALESCE(goals_against, 0) WHERE goals_against IS NOT NULL;

-- Convert games_played to matches_played
UPDATE clubs SET matches_played = COALESCE(games_played, 0) WHERE games_played IS NOT NULL;

-- Calculate goal_difference (goals_scored - goals_conceded)
UPDATE clubs SET goal_difference = (COALESCE(goals_scored, 0) - COALESCE(goals_conceded, 0));

-- Convert OTL (overtime losses) to draws for soccer
-- In hockey, OTL represents overtime/shootout losses which get 1 point
-- In soccer, these would be draws, but we'll initialize draws to 0 for now
-- and let the standings calculator handle proper draw calculation
UPDATE clubs SET draws = 0;

-- Step 3: Update points calculation for soccer (3 points for win, 1 for draw, 0 for loss)
-- Recalculate points based on wins and draws
UPDATE clubs SET points = (COALESCE(wins, 0) * 3) + (COALESCE(draws, 0) * 1);

-- Step 4: Add comments to document the changes
COMMENT ON COLUMN clubs.goals_scored IS 'Total goals scored by the club (replaces goals_for)';
COMMENT ON COLUMN clubs.goals_conceded IS 'Total goals conceded by the club (replaces goals_against)';
COMMENT ON COLUMN clubs.goal_difference IS 'Goal difference (goals_scored - goals_conceded)';
COMMENT ON COLUMN clubs.draws IS 'Number of drawn matches';
COMMENT ON COLUMN clubs.clean_sheets IS 'Number of matches without conceding goals';
COMMENT ON COLUMN clubs.matches_played IS 'Total matches played (replaces games_played)';

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clubs_goal_difference ON clubs(goal_difference);
CREATE INDEX IF NOT EXISTS idx_clubs_goals_scored ON clubs(goals_scored);
CREATE INDEX IF NOT EXISTS idx_clubs_goals_conceded ON clubs(goals_conceded);

-- Step 6: Update any views or triggers that might reference the old columns
-- (Add specific view updates here if you have any)

COMMIT;

-- Note: The old columns (goals_for, goals_against, games_played, otl) are kept for backward compatibility
-- They can be dropped in a future migration once all code is updated

-- Verification queries (run these after migration):
-- SELECT name, wins, draws, losses, goals_scored, goals_conceded, goal_difference, points, matches_played FROM clubs LIMIT 5;
-- SELECT COUNT(*) as total_clubs, SUM(goals_scored) as total_goals FROM clubs WHERE is_active = true;
