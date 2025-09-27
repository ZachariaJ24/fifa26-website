-- Rollback Script: Revert Clubs to Teams and Fixtures to Matches
-- WARNING: This is a destructive operation. Make sure to backup your database before running.
-- This script reverses the teams-to-clubs and matches-to-fixtures migration.

BEGIN;

-- Step 1: Drop all foreign key constraints that reference clubs and fixtures tables
-- We'll recreate them later with the original names

-- Drop foreign keys referencing clubs table
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

-- Drop foreign keys referencing fixtures table
ALTER TABLE fixtures DROP CONSTRAINT IF EXISTS fixtures_home_club_id_fkey;
ALTER TABLE fixtures DROP CONSTRAINT IF EXISTS fixtures_away_club_id_fkey;
ALTER TABLE ea_player_stats DROP CONSTRAINT IF EXISTS ea_player_stats_fixture_id_fkey;
ALTER TABLE ea_club_stats DROP CONSTRAINT IF EXISTS ea_club_stats_fixture_id_fkey;
ALTER TABLE game_availability DROP CONSTRAINT IF EXISTS game_availability_fixture_id_fkey;
ALTER TABLE lineups DROP CONSTRAINT IF EXISTS lineups_fixture_id_fkey;
ALTER TABLE fixture_events DROP CONSTRAINT IF EXISTS fixture_events_fixture_id_fkey;

-- Step 2: Rename tables that have club/fixture in their names back to original
ALTER TABLE discord_club_roles RENAME TO discord_team_roles;
ALTER TABLE ea_club_stats RENAME TO ea_team_stats;
ALTER TABLE club_awards RENAME TO team_awards;
ALTER TABLE club_chat_messages RENAME TO team_chat_messages;
ALTER TABLE club_managers RENAME TO team_managers;
ALTER TABLE fixture_events RENAME TO match_events;

-- Step 3: Update column names in renamed tables
ALTER TABLE ea_team_stats RENAME COLUMN club_name TO team_name;

-- Step 4: Rename club-related columns in fixtures table
ALTER TABLE fixtures RENAME COLUMN home_club_id TO home_team_id;
ALTER TABLE fixtures RENAME COLUMN away_club_id TO away_team_id;

-- Step 5: Rename columns in all affected tables

-- Rename club_id columns back to team_id
ALTER TABLE discord_team_roles RENAME COLUMN club_id TO team_id;
ALTER TABLE ea_player_stats RENAME COLUMN club_id TO team_id;
ALTER TABLE ea_team_stats RENAME COLUMN club_id TO team_id;
ALTER TABLE game_availability RENAME COLUMN club_id TO team_id;
ALTER TABLE injury_reserves RENAME COLUMN club_id TO team_id;
ALTER TABLE lineups RENAME COLUMN club_id TO team_id;
ALTER TABLE match_events RENAME COLUMN club_id TO team_id;
ALTER TABLE player_signings RENAME COLUMN club_id TO team_id;
ALTER TABLE player_transfer_offers RENAME COLUMN club_id TO team_id;
ALTER TABLE player_transfers RENAME COLUMN from_club_id TO from_team_id;
ALTER TABLE player_transfers RENAME COLUMN to_club_id TO to_team_id;
ALTER TABLE player_transfers RENAME COLUMN club_id TO team_id;
ALTER TABLE players RENAME COLUMN club_id TO team_id;
ALTER TABLE team_awards RENAME COLUMN club_id TO team_id;
ALTER TABLE team_chat_messages RENAME COLUMN club_id TO team_id;
ALTER TABLE team_managers RENAME COLUMN club_id TO team_id;
ALTER TABLE trades RENAME COLUMN club1_id TO team1_id;
ALTER TABLE trades RENAME COLUMN club2_id TO team2_id;
ALTER TABLE transfer_listings RENAME COLUMN club_id TO team_id;
ALTER TABLE transfer_offers RENAME COLUMN offering_club_id TO offering_team_id;
ALTER TABLE waiver_claims RENAME COLUMN claiming_club_id TO claiming_team_id;
ALTER TABLE waiver_priority RENAME COLUMN club_id TO team_id;
ALTER TABLE waivers RENAME COLUMN waiving_club_id TO waiving_team_id;
ALTER TABLE waivers RENAME COLUMN winning_club_id TO winning_team_id;

-- Rename fixture_id columns back to match_id
ALTER TABLE ea_match_data RENAME COLUMN fixture_id TO match_id;
ALTER TABLE ea_player_stats RENAME COLUMN fixture_id TO match_id;
ALTER TABLE ea_team_stats RENAME COLUMN fixture_id TO match_id;
ALTER TABLE game_availability RENAME COLUMN fixture_id TO match_id;
ALTER TABLE lineups RENAME COLUMN fixture_id TO match_id;
ALTER TABLE match_events RENAME COLUMN fixture_id TO match_id;
ALTER TABLE player_stats RENAME COLUMN fixture_id TO match_id;
ALTER TABLE goalie_stats RENAME COLUMN fixture_id TO match_id;

-- Step 6: Rename the main tables back to original names
ALTER TABLE clubs RENAME TO teams;
ALTER TABLE fixtures RENAME TO matches;

-- Step 7: Recreate foreign key constraints with original names

-- Foreign keys for teams table
ALTER TABLE discord_team_roles ADD CONSTRAINT discord_team_roles_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
ALTER TABLE ea_player_stats ADD CONSTRAINT ea_player_stats_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
ALTER TABLE ea_team_stats ADD CONSTRAINT ea_team_stats_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
ALTER TABLE game_availability ADD CONSTRAINT game_availability_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
ALTER TABLE injury_reserves ADD CONSTRAINT injury_reserves_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
ALTER TABLE lineups ADD CONSTRAINT lineups_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
ALTER TABLE match_events ADD CONSTRAINT match_events_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
ALTER TABLE player_signings ADD CONSTRAINT player_signings_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
ALTER TABLE player_transfer_offers ADD CONSTRAINT player_transfer_offers_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
ALTER TABLE player_transfers ADD CONSTRAINT player_transfers_from_team_id_fkey FOREIGN KEY (from_team_id) REFERENCES public.teams(id);
ALTER TABLE player_transfers ADD CONSTRAINT player_transfers_to_team_id_fkey FOREIGN KEY (to_team_id) REFERENCES public.teams(id);
ALTER TABLE players ADD CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
ALTER TABLE team_awards ADD CONSTRAINT team_awards_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
ALTER TABLE team_chat_messages ADD CONSTRAINT team_chat_messages_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
ALTER TABLE team_managers ADD CONSTRAINT team_managers_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
ALTER TABLE trades ADD CONSTRAINT trades_team1_id_fkey FOREIGN KEY (team1_id) REFERENCES public.teams(id);
ALTER TABLE trades ADD CONSTRAINT trades_team2_id_fkey FOREIGN KEY (team2_id) REFERENCES public.teams(id);
ALTER TABLE trades ADD CONSTRAINT fk_team1 FOREIGN KEY (team1_id) REFERENCES public.teams(id);
ALTER TABLE trades ADD CONSTRAINT fk_team2 FOREIGN KEY (team2_id) REFERENCES public.teams(id);
ALTER TABLE transfer_listings ADD CONSTRAINT transfer_listings_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
ALTER TABLE transfer_offers ADD CONSTRAINT transfer_offers_offering_team_id_fkey FOREIGN KEY (offering_team_id) REFERENCES public.teams(id);
ALTER TABLE waiver_claims ADD CONSTRAINT waiver_claims_claiming_team_id_fkey FOREIGN KEY (claiming_team_id) REFERENCES public.teams(id);
ALTER TABLE waiver_priority ADD CONSTRAINT waiver_priority_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);
ALTER TABLE waivers ADD CONSTRAINT waivers_waiving_team_id_fkey FOREIGN KEY (waiving_team_id) REFERENCES public.teams(id);
ALTER TABLE waivers ADD CONSTRAINT waivers_winning_team_id_fkey FOREIGN KEY (winning_team_id) REFERENCES public.teams(id);

-- Foreign keys for matches table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'matches_home_team_id_fkey') THEN
        ALTER TABLE matches ADD CONSTRAINT matches_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES public.teams(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'matches_away_team_id_fkey') THEN
        ALTER TABLE matches ADD CONSTRAINT matches_away_team_id_fkey FOREIGN KEY (away_team_id) REFERENCES public.teams(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ea_player_stats_match_id_fkey') THEN
        ALTER TABLE ea_player_stats ADD CONSTRAINT ea_player_stats_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ea_team_stats_match_id_fkey') THEN
        ALTER TABLE ea_team_stats ADD CONSTRAINT ea_team_stats_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'game_availability_match_id_fkey') THEN
        ALTER TABLE game_availability ADD CONSTRAINT game_availability_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'lineups_match_id_fkey') THEN
        ALTER TABLE lineups ADD CONSTRAINT lineups_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'match_events_match_id_fkey') THEN
        ALTER TABLE match_events ADD CONSTRAINT match_events_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);
    END IF;
END $$;

-- Step 8: Update unique constraints
ALTER TABLE waiver_priority DROP CONSTRAINT IF EXISTS waiver_priority_club_id_key;
ALTER TABLE waiver_priority ADD CONSTRAINT waiver_priority_team_id_key UNIQUE (team_id);

COMMIT;

-- Verification queries to run after rollback:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%club%';
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%fixture%';
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('teams', 'matches');
-- SELECT column_name, table_name FROM information_schema.columns WHERE table_schema = 'public' AND column_name LIKE '%club%';
-- SELECT column_name, table_name FROM information_schema.columns WHERE table_schema = 'public' AND column_name LIKE '%fixture%';
