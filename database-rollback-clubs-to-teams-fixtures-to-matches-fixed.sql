-- Rollback Script: Revert Clubs to Teams and Fixtures to Matches (FIXED VERSION)
-- WARNING: This is a destructive operation. Make sure to backup your database before running.
-- This script reverses the teams-to-clubs and matches-to-fixtures migration.

BEGIN;

-- Step 1: Drop all foreign key constraints that reference clubs and fixtures tables
-- We'll recreate them later with the original names

-- Drop foreign keys referencing clubs table (if they exist)
ALTER TABLE discord_club_roles DROP CONSTRAINT IF EXISTS discord_club_roles_club_id_fkey;
ALTER TABLE ea_player_stats DROP CONSTRAINT IF EXISTS ea_player_stats_club_id_fkey;
ALTER TABLE ea_club_stats DROP CONSTRAINT IF EXISTS ea_club_stats_club_id_fkey;
ALTER TABLE game_availability DROP CONSTRAINT IF EXISTS game_availability_club_id_fkey;
ALTER TABLE injury_reserves DROP CONSTRAINT IF EXISTS injury_reserves_club_id_fkey;
ALTER TABLE lineups DROP CONSTRAINT IF EXISTS lineups_club_id_fkey;
ALTER TABLE fixture_events DROP CONSTRAINT IF EXISTS fixture_events_club_id_fkey;
ALTER TABLE player_signings DROP CONSTRAINT IF EXISTS player_signings_club_id_fkey;
ALTER TABLE player_transfer_offers DROP CONSTRAINT IF EXISTS player_transfer_offers_club_id_fkey;
ALTER TABLE player_transfers DROP CONSTRAINT IF EXISTS player_transfers_from_club_id_fkey;
ALTER TABLE player_transfers DROP CONSTRAINT IF EXISTS player_transfers_to_club_id_fkey;
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_club_id_fkey;
ALTER TABLE club_awards DROP CONSTRAINT IF EXISTS club_awards_club_id_fkey;
ALTER TABLE club_chat_messages DROP CONSTRAINT IF EXISTS club_chat_messages_club_id_fkey;
ALTER TABLE club_managers DROP CONSTRAINT IF EXISTS club_managers_club_id_fkey;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_club1_id_fkey;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_club2_id_fkey;
ALTER TABLE transfer_listings DROP CONSTRAINT IF EXISTS transfer_listings_club_id_fkey;
ALTER TABLE transfer_offers DROP CONSTRAINT IF EXISTS transfer_offers_offering_club_id_fkey;
ALTER TABLE waiver_claims DROP CONSTRAINT IF EXISTS waiver_claims_claiming_club_id_fkey;
ALTER TABLE waiver_priority DROP CONSTRAINT IF EXISTS waiver_priority_club_id_fkey;
ALTER TABLE waivers DROP CONSTRAINT IF EXISTS waivers_waiving_club_id_fkey;
ALTER TABLE waivers DROP CONSTRAINT IF EXISTS waivers_winning_club_id_fkey;

-- Drop foreign keys referencing fixtures table (if they exist)
ALTER TABLE fixtures DROP CONSTRAINT IF EXISTS fixtures_home_club_id_fkey;
ALTER TABLE fixtures DROP CONSTRAINT IF EXISTS fixtures_away_club_id_fkey;
ALTER TABLE ea_player_stats DROP CONSTRAINT IF EXISTS ea_player_stats_fixture_id_fkey;
ALTER TABLE ea_club_stats DROP CONSTRAINT IF EXISTS ea_club_stats_fixture_id_fkey;
ALTER TABLE game_availability DROP CONSTRAINT IF EXISTS game_availability_fixture_id_fkey;
ALTER TABLE lineups DROP CONSTRAINT IF EXISTS lineups_fixture_id_fkey;
ALTER TABLE fixture_events DROP CONSTRAINT IF EXISTS fixture_events_fixture_id_fkey;

-- Also drop any existing constraints with the old names (in case they still exist)
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_home_team_id_fkey;
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_away_team_id_fkey;
ALTER TABLE ea_player_stats DROP CONSTRAINT IF EXISTS ea_player_stats_match_id_fkey;
ALTER TABLE ea_team_stats DROP CONSTRAINT IF EXISTS ea_team_stats_match_id_fkey;
ALTER TABLE game_availability DROP CONSTRAINT IF EXISTS game_availability_match_id_fkey;
ALTER TABLE lineups DROP CONSTRAINT IF EXISTS lineups_match_id_fkey;
ALTER TABLE match_events DROP CONSTRAINT IF EXISTS match_events_match_id_fkey;

-- Step 2: Rename tables that have club/fixture in their names back to original (if they exist)
ALTER TABLE IF EXISTS discord_club_roles RENAME TO discord_team_roles;
ALTER TABLE IF EXISTS ea_club_stats RENAME TO ea_team_stats;
ALTER TABLE IF EXISTS club_awards RENAME TO team_awards;
ALTER TABLE IF EXISTS club_chat_messages RENAME TO team_chat_messages;
ALTER TABLE IF EXISTS club_managers RENAME TO team_managers;
ALTER TABLE IF EXISTS fixture_events RENAME TO match_events;

-- Step 3: Update column names in renamed tables (if columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ea_team_stats' AND column_name = 'club_name') THEN
        ALTER TABLE ea_team_stats RENAME COLUMN club_name TO team_name;
    END IF;
END $$;

-- Step 4: Rename club-related columns in fixtures table (if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fixtures' AND column_name = 'home_club_id') THEN
        ALTER TABLE fixtures RENAME COLUMN home_club_id TO home_team_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fixtures' AND column_name = 'away_club_id') THEN
        ALTER TABLE fixtures RENAME COLUMN away_club_id TO away_team_id;
    END IF;
END $$;

-- Step 5: Rename columns in all affected tables (only if they exist)

-- Function to safely rename columns
CREATE OR REPLACE FUNCTION safe_rename_column(table_name text, old_column text, new_column text)
RETURNS void AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2) THEN
        EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', $1, $2, $3);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Rename club_id columns back to team_id
SELECT safe_rename_column('discord_team_roles', 'club_id', 'team_id');
SELECT safe_rename_column('ea_player_stats', 'club_id', 'team_id');
SELECT safe_rename_column('ea_team_stats', 'club_id', 'team_id');
SELECT safe_rename_column('game_availability', 'club_id', 'team_id');
SELECT safe_rename_column('injury_reserves', 'club_id', 'team_id');
SELECT safe_rename_column('lineups', 'club_id', 'team_id');
SELECT safe_rename_column('match_events', 'club_id', 'team_id');
SELECT safe_rename_column('player_signings', 'club_id', 'team_id');
SELECT safe_rename_column('player_transfer_offers', 'club_id', 'team_id');
SELECT safe_rename_column('player_transfers', 'from_club_id', 'from_team_id');
SELECT safe_rename_column('player_transfers', 'to_club_id', 'to_team_id');
SELECT safe_rename_column('player_transfers', 'club_id', 'team_id');
SELECT safe_rename_column('players', 'club_id', 'team_id');
SELECT safe_rename_column('team_awards', 'club_id', 'team_id');
SELECT safe_rename_column('team_chat_messages', 'club_id', 'team_id');
SELECT safe_rename_column('team_managers', 'club_id', 'team_id');
SELECT safe_rename_column('trades', 'club1_id', 'team1_id');
SELECT safe_rename_column('trades', 'club2_id', 'team2_id');
SELECT safe_rename_column('transfer_listings', 'club_id', 'team_id');
SELECT safe_rename_column('transfer_offers', 'offering_club_id', 'offering_team_id');
SELECT safe_rename_column('waiver_claims', 'claiming_club_id', 'claiming_team_id');
SELECT safe_rename_column('waiver_priority', 'club_id', 'team_id');
SELECT safe_rename_column('waivers', 'waiving_club_id', 'waiving_team_id');
SELECT safe_rename_column('waivers', 'winning_club_id', 'winning_team_id');

-- Rename fixture_id columns back to match_id
SELECT safe_rename_column('ea_match_data', 'fixture_id', 'match_id');
SELECT safe_rename_column('ea_player_stats', 'fixture_id', 'match_id');
SELECT safe_rename_column('ea_team_stats', 'fixture_id', 'match_id');
SELECT safe_rename_column('game_availability', 'fixture_id', 'match_id');
SELECT safe_rename_column('lineups', 'fixture_id', 'match_id');
SELECT safe_rename_column('match_events', 'fixture_id', 'match_id');
SELECT safe_rename_column('player_stats', 'fixture_id', 'match_id');
SELECT safe_rename_column('goalie_stats', 'fixture_id', 'match_id');

-- Drop the helper function
DROP FUNCTION safe_rename_column(text, text, text);

-- Step 6: Rename the main tables back to original names (if they exist)
ALTER TABLE IF EXISTS clubs RENAME TO teams;
ALTER TABLE IF EXISTS fixtures RENAME TO matches;

-- Step 7: Recreate foreign key constraints with original names (only if tables and columns exist)

-- Foreign keys for teams table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams') THEN
        -- Only add constraints if the referenced columns exist
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discord_team_roles' AND column_name = 'team_id') THEN
            ALTER TABLE discord_team_roles ADD CONSTRAINT discord_team_roles_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ea_player_stats' AND column_name = 'team_id') THEN
            ALTER TABLE ea_player_stats ADD CONSTRAINT ea_player_stats_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ea_team_stats' AND column_name = 'team_id') THEN
            ALTER TABLE ea_team_stats ADD CONSTRAINT ea_team_stats_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_availability' AND column_name = 'team_id') THEN
            ALTER TABLE game_availability ADD CONSTRAINT game_availability_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'injury_reserves' AND column_name = 'team_id') THEN
            ALTER TABLE injury_reserves ADD CONSTRAINT injury_reserves_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lineups' AND column_name = 'team_id') THEN
            ALTER TABLE lineups ADD CONSTRAINT lineups_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'match_events' AND column_name = 'team_id') THEN
            ALTER TABLE match_events ADD CONSTRAINT match_events_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_signings' AND column_name = 'team_id') THEN
            ALTER TABLE player_signings ADD CONSTRAINT player_signings_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_transfer_offers' AND column_name = 'team_id') THEN
            ALTER TABLE player_transfer_offers ADD CONSTRAINT player_transfer_offers_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_transfers' AND column_name = 'from_team_id') THEN
            ALTER TABLE player_transfers ADD CONSTRAINT player_transfers_from_team_id_fkey FOREIGN KEY (from_team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_transfers' AND column_name = 'to_team_id') THEN
            ALTER TABLE player_transfers ADD CONSTRAINT player_transfers_to_team_id_fkey FOREIGN KEY (to_team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'team_id') THEN
            ALTER TABLE players ADD CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_awards' AND column_name = 'team_id') THEN
            ALTER TABLE team_awards ADD CONSTRAINT team_awards_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_chat_messages' AND column_name = 'team_id') THEN
            ALTER TABLE team_chat_messages ADD CONSTRAINT team_chat_messages_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_managers' AND column_name = 'team_id') THEN
            ALTER TABLE team_managers ADD CONSTRAINT team_managers_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'team1_id') THEN
            ALTER TABLE trades ADD CONSTRAINT trades_team1_id_fkey FOREIGN KEY (team1_id) REFERENCES public.teams(id);
            ALTER TABLE trades ADD CONSTRAINT fk_team1 FOREIGN KEY (team1_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trades' AND column_name = 'team2_id') THEN
            ALTER TABLE trades ADD CONSTRAINT trades_team2_id_fkey FOREIGN KEY (team2_id) REFERENCES public.teams(id);
            ALTER TABLE trades ADD CONSTRAINT fk_team2 FOREIGN KEY (team2_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transfer_listings' AND column_name = 'team_id') THEN
            ALTER TABLE transfer_listings ADD CONSTRAINT transfer_listings_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transfer_offers' AND column_name = 'offering_team_id') THEN
            ALTER TABLE transfer_offers ADD CONSTRAINT transfer_offers_offering_team_id_fkey FOREIGN KEY (offering_team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waiver_claims' AND column_name = 'claiming_team_id') THEN
            ALTER TABLE waiver_claims ADD CONSTRAINT waiver_claims_claiming_team_id_fkey FOREIGN KEY (claiming_team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waiver_priority' AND column_name = 'team_id') THEN
            ALTER TABLE waiver_priority ADD CONSTRAINT waiver_priority_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waivers' AND column_name = 'waiving_team_id') THEN
            ALTER TABLE waivers ADD CONSTRAINT waivers_waiving_team_id_fkey FOREIGN KEY (waiving_team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waivers' AND column_name = 'winning_team_id') THEN
            ALTER TABLE waivers ADD CONSTRAINT waivers_winning_team_id_fkey FOREIGN KEY (winning_team_id) REFERENCES public.teams(id);
        END IF;
    END IF;
END $$;

-- Foreign keys for matches table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matches') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'home_team_id') THEN
            ALTER TABLE matches ADD CONSTRAINT matches_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'away_team_id') THEN
            ALTER TABLE matches ADD CONSTRAINT matches_away_team_id_fkey FOREIGN KEY (away_team_id) REFERENCES public.teams(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ea_player_stats' AND column_name = 'match_id') THEN
            ALTER TABLE ea_player_stats ADD CONSTRAINT ea_player_stats_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ea_team_stats' AND column_name = 'match_id') THEN
            ALTER TABLE ea_team_stats ADD CONSTRAINT ea_team_stats_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'game_availability' AND column_name = 'match_id') THEN
            ALTER TABLE game_availability ADD CONSTRAINT game_availability_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lineups' AND column_name = 'match_id') THEN
            ALTER TABLE lineups ADD CONSTRAINT lineups_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'match_events' AND column_name = 'match_id') THEN
            ALTER TABLE match_events ADD CONSTRAINT match_events_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);
        END IF;
    END IF;
END $$;

-- Step 8: Update unique constraints
ALTER TABLE waiver_priority DROP CONSTRAINT IF EXISTS waiver_priority_club_id_key;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waiver_priority' AND column_name = 'team_id') THEN
        ALTER TABLE waiver_priority ADD CONSTRAINT waiver_priority_team_id_key UNIQUE (team_id);
    END IF;
END $$;

COMMIT;

-- Verification queries to run after rollback:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%club%';
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%fixture%';
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('teams', 'matches');
-- SELECT column_name, table_name FROM information_schema.columns WHERE table_schema = 'public' AND column_name LIKE '%club%';
-- SELECT column_name, table_name FROM information_schema.columns WHERE table_schema = 'public' AND column_name LIKE '%fixture%';
