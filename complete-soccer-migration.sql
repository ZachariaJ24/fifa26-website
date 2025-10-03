-- FIFA 26 Complete Soccer Migration: Remove ALL Hockey Terminology
-- This script converts the entire database from hockey to soccer terminology

-- Begin transaction
BEGIN;

-- ============================================================================
-- PART 1: CLUBS TABLE - Main team stats migration
-- ============================================================================

-- Step 1: Backup existing hockey data in clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS temp_goals_for INTEGER;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS temp_goals_against INTEGER;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS temp_games_played INTEGER;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS temp_otl INTEGER;

UPDATE clubs SET 
  temp_goals_for = COALESCE(goals_for, 0),
  temp_goals_against = COALESCE(goals_against, 0),
  temp_games_played = COALESCE(games_played, 0),
  temp_otl = COALESCE(otl, 0);

-- Step 2: Drop dependent views first, then hockey columns from clubs
DROP VIEW IF EXISTS division_standings CASCADE;
DROP VIEW IF EXISTS conference_standings CASCADE;
DROP VIEW IF EXISTS team_standings CASCADE;
DROP VIEW IF EXISTS league_standings CASCADE;

-- Now drop hockey columns from clubs
ALTER TABLE clubs DROP COLUMN IF EXISTS goals_for CASCADE;
ALTER TABLE clubs DROP COLUMN IF EXISTS goals_against CASCADE;
ALTER TABLE clubs DROP COLUMN IF EXISTS games_played CASCADE;
ALTER TABLE clubs DROP COLUMN IF EXISTS otl CASCADE;
ALTER TABLE clubs DROP COLUMN IF EXISTS powerplay_goals CASCADE;
ALTER TABLE clubs DROP COLUMN IF EXISTS powerplay_opportunities CASCADE;
ALTER TABLE clubs DROP COLUMN IF EXISTS penalty_kill_goals_against CASCADE;
ALTER TABLE clubs DROP COLUMN IF EXISTS penalty_kill_opportunities CASCADE;

-- Step 3: Ensure soccer columns exist in clubs
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS draws INTEGER DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS goals_scored INTEGER DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS goals_conceded INTEGER DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS goal_difference INTEGER DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS clean_sheets INTEGER DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS matches_played INTEGER DEFAULT 0;

-- Step 4: Migrate data to soccer columns
UPDATE clubs SET 
  goals_scored = COALESCE(temp_goals_for, 0),
  goals_conceded = COALESCE(temp_goals_against, 0),
  matches_played = COALESCE(temp_games_played, 0),
  draws = 0,
  goal_difference = (COALESCE(temp_goals_for, 0) - COALESCE(temp_goals_against, 0));

-- Calculate clean sheets from fixtures
UPDATE clubs SET clean_sheets = (
  SELECT COUNT(*)
  FROM fixtures f
  WHERE (f.home_club_id = clubs.id AND f.away_score = 0 AND f.status = 'Completed')
     OR (f.away_club_id = clubs.id AND f.home_score = 0 AND f.status = 'Completed')
);

-- Update points for soccer (3-1-0 system)
UPDATE clubs SET points = (COALESCE(wins, 0) * 3) + (COALESCE(draws, 0) * 1);

-- Clean up temp columns
ALTER TABLE clubs DROP COLUMN IF EXISTS temp_goals_for;
ALTER TABLE clubs DROP COLUMN IF EXISTS temp_goals_against;
ALTER TABLE clubs DROP COLUMN IF EXISTS temp_games_played;
ALTER TABLE clubs DROP COLUMN IF EXISTS temp_otl;

-- ============================================================================
-- PART 2: EA_CLUB_STATS TABLE - Remove hockey-specific stats
-- ============================================================================

-- Backup and remove hockey-specific columns from ea_club_stats
ALTER TABLE ea_club_stats ADD COLUMN IF NOT EXISTS temp_hits INTEGER;
ALTER TABLE ea_club_stats ADD COLUMN IF NOT EXISTS temp_blocks INTEGER;
ALTER TABLE ea_club_stats ADD COLUMN IF NOT EXISTS temp_pim INTEGER;

UPDATE ea_club_stats SET 
  temp_hits = COALESCE(hits, 0),
  temp_blocks = COALESCE(blocks, 0),
  temp_pim = COALESCE(pim, 0);

-- Drop hockey-specific columns
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS hits;
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS blocks;
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS pim;
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS pp_goals;
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS pp_opportunities;
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS pp_pct;
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS faceoff_wins;
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS faceoff_losses;
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS faceoff_pct;
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS time_in_offensive_zone;
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS time_in_defensive_zone;
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS time_in_neutral_zone;
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS takeaways;
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS giveaways;

-- Add soccer-specific columns to ea_club_stats
ALTER TABLE ea_club_stats ADD COLUMN IF NOT EXISTS possession_pct NUMERIC DEFAULT 0;
ALTER TABLE ea_club_stats ADD COLUMN IF NOT EXISTS corners INTEGER DEFAULT 0;
ALTER TABLE ea_club_stats ADD COLUMN IF NOT EXISTS fouls INTEGER DEFAULT 0;
ALTER TABLE ea_club_stats ADD COLUMN IF NOT EXISTS yellow_cards INTEGER DEFAULT 0;
ALTER TABLE ea_club_stats ADD COLUMN IF NOT EXISTS red_cards INTEGER DEFAULT 0;
ALTER TABLE ea_club_stats ADD COLUMN IF NOT EXISTS offsides INTEGER DEFAULT 0;

-- Clean up temp columns
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS temp_hits;
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS temp_blocks;
ALTER TABLE ea_club_stats DROP COLUMN IF EXISTS temp_pim;

-- ============================================================================
-- PART 3: EA_PLAYER_STATS TABLE - Remove hockey-specific player stats
-- ============================================================================

-- Drop hockey-specific columns from ea_player_stats
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS hits;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS pim;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS plus_minus;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS blocks;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS faceoff_pct;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS toi;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS giveaways;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS takeaways;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS defensive_zone_time;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS offensive_zone_time;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS neutral_zone_time;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS dekes;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS successful_dekes;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS faceoffs_won;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS faceoffs_taken;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS interceptions;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS ppg;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS shg;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS time_with_puck;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS skinterceptions;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS skfow;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS skfol;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS skpenaltiesdrawn;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS skpasses;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS skpassattempts;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS skpossession;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS glgaa;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS skppg;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS glshots;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS skshg;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS glga;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS glsaves;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS glsavepct;
ALTER TABLE ea_player_stats DROP COLUMN IF EXISTS toiseconds;

-- Add soccer-specific columns to ea_player_stats
ALTER TABLE ea_player_stats ADD COLUMN IF NOT EXISTS minutes_played INTEGER DEFAULT 0;
ALTER TABLE ea_player_stats ADD COLUMN IF NOT EXISTS yellow_cards INTEGER DEFAULT 0;
ALTER TABLE ea_player_stats ADD COLUMN IF NOT EXISTS red_cards INTEGER DEFAULT 0;
ALTER TABLE ea_player_stats ADD COLUMN IF NOT EXISTS fouls_committed INTEGER DEFAULT 0;
ALTER TABLE ea_player_stats ADD COLUMN IF NOT EXISTS fouls_suffered INTEGER DEFAULT 0;
ALTER TABLE ea_player_stats ADD COLUMN IF NOT EXISTS corners INTEGER DEFAULT 0;
ALTER TABLE ea_player_stats ADD COLUMN IF NOT EXISTS offsides INTEGER DEFAULT 0;
ALTER TABLE ea_player_stats ADD COLUMN IF NOT EXISTS tackles INTEGER DEFAULT 0;
ALTER TABLE ea_player_stats ADD COLUMN IF NOT EXISTS successful_tackles INTEGER DEFAULT 0;
ALTER TABLE ea_player_stats ADD COLUMN IF NOT EXISTS crosses INTEGER DEFAULT 0;
ALTER TABLE ea_player_stats ADD COLUMN IF NOT EXISTS successful_crosses INTEGER DEFAULT 0;
ALTER TABLE ea_player_stats ADD COLUMN IF NOT EXISTS dribbles INTEGER DEFAULT 0;
ALTER TABLE ea_player_stats ADD COLUMN IF NOT EXISTS successful_dribbles INTEGER DEFAULT 0;

-- ============================================================================
-- PART 4: FIXTURES TABLE - Remove hockey-specific match data
-- ============================================================================

-- Remove hockey-specific columns from fixtures
ALTER TABLE fixtures DROP COLUMN IF EXISTS period_scores;
ALTER TABLE fixtures DROP COLUMN IF EXISTS has_overtime;
ALTER TABLE fixtures DROP COLUMN IF EXISTS has_shootout;
ALTER TABLE fixtures DROP COLUMN IF EXISTS overtime;

-- Add soccer-specific columns to fixtures
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS half_time_home_score INTEGER DEFAULT 0;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS half_time_away_score INTEGER DEFAULT 0;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS extra_time_minutes INTEGER DEFAULT 0;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS penalty_shootout BOOLEAN DEFAULT false;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS penalty_home_score INTEGER DEFAULT 0;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS penalty_away_score INTEGER DEFAULT 0;

-- ============================================================================
-- PART 5: REMOVE OBSOLETE HOCKEY TABLES
-- ============================================================================

-- Drop hockey-specific tables that don't apply to soccer
DROP TABLE IF EXISTS goalie_stats CASCADE;
DROP TABLE IF EXISTS player_stats CASCADE; -- This has hockey-specific structure

-- ============================================================================
-- PART 6: UPDATE CONSTRAINTS AND INDEXES
-- ============================================================================

-- Update fixture_events to use soccer events only
ALTER TABLE fixture_events DROP CONSTRAINT IF EXISTS fixture_events_event_type_check;
ALTER TABLE fixture_events ADD CONSTRAINT fixture_events_event_type_check 
  CHECK (event_type = ANY (ARRAY[
    'goal'::text, 
    'own_goal'::text, 
    'penalty_scored'::text, 
    'penalty_missed'::text, 
    'yellow_card'::text, 
    'red_card'::text, 
    'second_yellow'::text, 
    'substitution'::text,
    'corner'::text,
    'offside'::text,
    'foul'::text
  ]));

-- ============================================================================
-- PART 7: ADD COMMENTS AND DOCUMENTATION
-- ============================================================================

-- Document clubs table changes
COMMENT ON COLUMN clubs.goals_scored IS 'Total goals scored by the club';
COMMENT ON COLUMN clubs.goals_conceded IS 'Total goals conceded by the club';
COMMENT ON COLUMN clubs.goal_difference IS 'Goal difference (goals_scored - goals_conceded)';
COMMENT ON COLUMN clubs.draws IS 'Number of drawn matches';
COMMENT ON COLUMN clubs.clean_sheets IS 'Number of matches without conceding goals';
COMMENT ON COLUMN clubs.matches_played IS 'Total matches played';

-- Document ea_club_stats changes
COMMENT ON COLUMN ea_club_stats.possession_pct IS 'Ball possession percentage';
COMMENT ON COLUMN ea_club_stats.corners IS 'Corner kicks taken';
COMMENT ON COLUMN ea_club_stats.fouls IS 'Fouls committed';
COMMENT ON COLUMN ea_club_stats.yellow_cards IS 'Yellow cards received';
COMMENT ON COLUMN ea_club_stats.red_cards IS 'Red cards received';
COMMENT ON COLUMN ea_club_stats.offsides IS 'Offside infractions';

-- Document fixtures changes
COMMENT ON COLUMN fixtures.half_time_home_score IS 'Home team score at half time';
COMMENT ON COLUMN fixtures.half_time_away_score IS 'Away team score at half time';
COMMENT ON COLUMN fixtures.extra_time_minutes IS 'Minutes of extra time played';
COMMENT ON COLUMN fixtures.penalty_shootout IS 'Whether match went to penalty shootout';
COMMENT ON COLUMN fixtures.penalty_home_score IS 'Home team penalty shootout score';
COMMENT ON COLUMN fixtures.penalty_away_score IS 'Away team penalty shootout score';

-- ============================================================================
-- PART 8: RECREATE VIEWS WITH SOCCER TERMINOLOGY
-- ============================================================================

-- Recreate division_standings view with soccer stats
CREATE OR REPLACE VIEW division_standings AS
SELECT 
  c.id,
  c.name,
  c.logo_url,
  c.division,
  c.wins,
  c.losses,
  c.draws,
  c.points,
  c.goals_scored,
  c.goals_conceded,
  c.goal_difference,
  c.clean_sheets,
  c.matches_played,
  c.is_active,
  conf.name as conference_name,
  conf.color as conference_color
FROM clubs c
LEFT JOIN conferences conf ON c.conference_id = conf.id
WHERE c.is_active = true
ORDER BY c.points DESC, c.goal_difference DESC, c.goals_scored DESC;

-- Recreate conference_standings view with soccer stats
CREATE OR REPLACE VIEW conference_standings AS
SELECT 
  c.id,
  c.name,
  c.logo_url,
  c.conference_id,
  c.wins,
  c.losses,
  c.draws,
  c.points,
  c.goals_scored,
  c.goals_conceded,
  c.goal_difference,
  c.clean_sheets,
  c.matches_played,
  c.is_active,
  conf.name as conference_name,
  conf.color as conference_color
FROM clubs c
LEFT JOIN conferences conf ON c.conference_id = conf.id
WHERE c.is_active = true
ORDER BY c.points DESC, c.goal_difference DESC, c.goals_scored DESC;

-- Recreate team_standings view with soccer stats (if it existed)
CREATE OR REPLACE VIEW team_standings AS
SELECT 
  c.id,
  c.name,
  c.logo_url,
  c.wins,
  c.losses,
  c.draws,
  c.points,
  c.goals_scored,
  c.goals_conceded,
  c.goal_difference,
  c.clean_sheets,
  c.matches_played,
  c.is_active
FROM clubs c
WHERE c.is_active = true
ORDER BY c.points DESC, c.goal_difference DESC, c.goals_scored DESC;

-- Recreate league_standings view with soccer stats (if it existed)
CREATE OR REPLACE VIEW league_standings AS
SELECT 
  c.id,
  c.name,
  c.logo_url,
  c.wins,
  c.losses,
  c.draws,
  c.points,
  c.goals_scored,
  c.goals_conceded,
  c.goal_difference,
  c.clean_sheets,
  c.matches_played,
  c.is_active,
  ROW_NUMBER() OVER (ORDER BY c.points DESC, c.goal_difference DESC, c.goals_scored DESC) as position
FROM clubs c
WHERE c.is_active = true;

COMMIT;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- SUMMARY OF CHANGES:
-- 1. CLUBS: Removed all hockey stats, implemented clean soccer stats
-- 2. EA_CLUB_STATS: Removed hockey stats, added soccer-specific stats
-- 3. EA_PLAYER_STATS: Removed hockey stats, added soccer-specific stats  
-- 4. FIXTURES: Removed hockey match data, added soccer match data
-- 5. FIXTURE_EVENTS: Updated to soccer-only events
-- 6. DROPPED: goalie_stats, player_stats (hockey-specific tables)

-- Verification queries:
-- SELECT name, wins, draws, losses, goals_scored, goals_conceded, goal_difference, clean_sheets FROM clubs LIMIT 5;
-- SELECT COUNT(*) as total_clubs FROM clubs WHERE is_active = true;
-- SELECT event_type, COUNT(*) FROM fixture_events GROUP BY event_type;
