-- Migration Script: Rename Teams to Clubs and Matches to Fixtures
-- WARNING: This is a destructive operation. Make sure to backup your database before running.
-- Run this script in a transaction and test thoroughly before applying to production.

BEGIN;

-- Step 1: Drop all foreign key constraints that reference teams and matches tables
-- We'll recreate them later with the new names

-- Drop foreign keys referencing teams table
ALTER TABLE discord_team_roles DROP CONSTRAINT IF EXISTS discord_team_roles_team_id_fkey;
ALTER TABLE ea_player_stats DROP CONSTRAINT IF EXISTS ea_player_stats_team_id_fkey;
ALTER TABLE ea_team_stats DROP CONSTRAINT IF EXISTS ea_team_stats_team_id_fkey;
ALTER TABLE game_availability DROP CONSTRAINT IF EXISTS game_availability_team_id_fkey;
ALTER TABLE injury_reserves DROP CONSTRAINT IF EXISTS injury_reserves_team_id_fkey;
ALTER TABLE lineups DROP CONSTRAINT IF EXISTS lineups_team_id_fkey;
ALTER TABLE match_events DROP CONSTRAINT IF EXISTS match_events_team_id_fkey;
ALTER TABLE player_signings DROP CONSTRAINT IF EXISTS player_signings_team_id_fkey;
ALTER TABLE player_transfer_offers DROP CONSTRAINT IF EXISTS player_transfer_offers_team_id_fkey;
ALTER TABLE player_transfers DROP CONSTRAINT IF EXISTS player_transfers_from_team_id_fkey;
ALTER TABLE player_transfers DROP CONSTRAINT IF EXISTS player_transfers_to_team_id_fkey;
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_team_id_fkey;
ALTER TABLE team_awards DROP CONSTRAINT IF EXISTS team_awards_team_id_fkey;
ALTER TABLE team_chat_messages DROP CONSTRAINT IF EXISTS team_chat_messages_team_id_fkey;
ALTER TABLE team_managers DROP CONSTRAINT IF EXISTS team_managers_team_id_fkey;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_team1_id_fkey;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_team2_id_fkey;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS fk_team1;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS fk_team2;
ALTER TABLE transfer_listings DROP CONSTRAINT IF EXISTS transfer_listings_team_id_fkey;
ALTER TABLE transfer_offers DROP CONSTRAINT IF EXISTS transfer_offers_offering_team_id_fkey;
ALTER TABLE waiver_claims DROP CONSTRAINT IF EXISTS waiver_claims_claiming_team_id_fkey;
ALTER TABLE waiver_priority DROP CONSTRAINT IF EXISTS waiver_priority_team_id_fkey;
ALTER TABLE waivers DROP CONSTRAINT IF EXISTS waivers_waiving_team_id_fkey;
ALTER TABLE waivers DROP CONSTRAINT IF EXISTS waivers_winning_team_id_fkey;

-- Drop foreign keys referencing matches table
ALTER TABLE ea_player_stats DROP CONSTRAINT IF EXISTS ea_player_stats_match_id_fkey;
ALTER TABLE ea_team_stats DROP CONSTRAINT IF EXISTS ea_team_stats_match_id_fkey;
ALTER TABLE game_availability DROP CONSTRAINT IF EXISTS game_availability_match_id_fkey;
ALTER TABLE lineups DROP CONSTRAINT IF EXISTS lineups_match_id_fkey;
ALTER TABLE match_events DROP CONSTRAINT IF EXISTS match_events_match_id_fkey;

-- Step 2: Rename the main tables
ALTER TABLE teams RENAME TO clubs;
ALTER TABLE matches RENAME TO fixtures;

-- Step 3: Rename columns in all affected tables

-- Rename team_id columns to club_id
ALTER TABLE discord_team_roles RENAME COLUMN team_id TO club_id;
ALTER TABLE ea_player_stats RENAME COLUMN team_id TO club_id;
ALTER TABLE ea_team_stats RENAME COLUMN team_id TO club_id;
ALTER TABLE game_availability RENAME COLUMN team_id TO club_id;
ALTER TABLE injury_reserves RENAME COLUMN team_id TO club_id;
ALTER TABLE lineups RENAME COLUMN team_id TO club_id;
ALTER TABLE match_events RENAME COLUMN team_id TO club_id;
ALTER TABLE player_signings RENAME COLUMN team_id TO club_id;
ALTER TABLE player_transfer_offers RENAME COLUMN team_id TO club_id;
ALTER TABLE player_transfers RENAME COLUMN from_team_id TO from_club_id;
ALTER TABLE player_transfers RENAME COLUMN to_team_id TO to_club_id;
ALTER TABLE player_transfers RENAME COLUMN team_id TO club_id;
ALTER TABLE players RENAME COLUMN team_id TO club_id;
ALTER TABLE team_awards RENAME COLUMN team_id TO club_id;
ALTER TABLE team_chat_messages RENAME COLUMN team_id TO club_id;
ALTER TABLE team_managers RENAME COLUMN team_id TO club_id;
ALTER TABLE trades RENAME COLUMN team1_id TO club1_id;
ALTER TABLE trades RENAME COLUMN team2_id TO club2_id;
ALTER TABLE transfer_listings RENAME COLUMN team_id TO club_id;
ALTER TABLE transfer_offers RENAME COLUMN offering_team_id TO offering_club_id;
ALTER TABLE waiver_claims RENAME COLUMN claiming_team_id TO claiming_club_id;
ALTER TABLE waiver_priority RENAME COLUMN team_id TO club_id;
ALTER TABLE waivers RENAME COLUMN waiving_team_id TO waiving_club_id;
ALTER TABLE waivers RENAME COLUMN winning_team_id TO winning_club_id;

-- Rename match_id columns to fixture_id
ALTER TABLE ea_match_data RENAME COLUMN match_id TO fixture_id;
ALTER TABLE ea_player_stats RENAME COLUMN match_id TO fixture_id;
ALTER TABLE ea_team_stats RENAME COLUMN match_id TO fixture_id;
ALTER TABLE game_availability RENAME COLUMN match_id TO fixture_id;
ALTER TABLE lineups RENAME COLUMN match_id TO fixture_id;
ALTER TABLE match_events RENAME COLUMN match_id TO fixture_id;
ALTER TABLE player_stats RENAME COLUMN match_id TO fixture_id;
ALTER TABLE goalie_stats RENAME COLUMN match_id TO fixture_id;

-- Rename team-related columns in fixtures table
ALTER TABLE fixtures RENAME COLUMN home_team_id TO home_club_id;
ALTER TABLE fixtures RENAME COLUMN away_team_id TO away_club_id;

-- Step 4: Rename tables that have team/match in their names
ALTER TABLE discord_team_roles RENAME TO discord_club_roles;
ALTER TABLE ea_team_stats RENAME TO ea_club_stats;
ALTER TABLE team_awards RENAME TO club_awards;
ALTER TABLE team_chat_messages RENAME TO club_chat_messages;
ALTER TABLE team_managers RENAME TO club_managers;
ALTER TABLE match_events RENAME TO fixture_events;

-- Step 5: Update column names in renamed tables
ALTER TABLE ea_club_stats RENAME COLUMN team_name TO club_name;

-- Step 6: Recreate foreign key constraints with new names

-- Foreign keys for clubs table
ALTER TABLE discord_club_roles ADD CONSTRAINT discord_club_roles_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);
ALTER TABLE ea_player_stats ADD CONSTRAINT ea_player_stats_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);
ALTER TABLE ea_club_stats ADD CONSTRAINT ea_club_stats_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);
ALTER TABLE game_availability ADD CONSTRAINT game_availability_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);
ALTER TABLE injury_reserves ADD CONSTRAINT injury_reserves_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);
ALTER TABLE lineups ADD CONSTRAINT lineups_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);
ALTER TABLE fixture_events ADD CONSTRAINT fixture_events_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);
ALTER TABLE player_signings ADD CONSTRAINT player_signings_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);
ALTER TABLE player_transfer_offers ADD CONSTRAINT player_transfer_offers_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);
ALTER TABLE player_transfers ADD CONSTRAINT player_transfers_from_club_id_fkey FOREIGN KEY (from_club_id) REFERENCES public.clubs(id);
ALTER TABLE player_transfers ADD CONSTRAINT player_transfers_to_club_id_fkey FOREIGN KEY (to_club_id) REFERENCES public.clubs(id);
ALTER TABLE players ADD CONSTRAINT players_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);
ALTER TABLE club_awards ADD CONSTRAINT club_awards_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);
ALTER TABLE club_chat_messages ADD CONSTRAINT club_chat_messages_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);
ALTER TABLE club_managers ADD CONSTRAINT club_managers_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);
ALTER TABLE trades ADD CONSTRAINT trades_club1_id_fkey FOREIGN KEY (club1_id) REFERENCES public.clubs(id);
ALTER TABLE trades ADD CONSTRAINT trades_club2_id_fkey FOREIGN KEY (club2_id) REFERENCES public.clubs(id);
ALTER TABLE transfer_listings ADD CONSTRAINT transfer_listings_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);
ALTER TABLE transfer_offers ADD CONSTRAINT transfer_offers_offering_club_id_fkey FOREIGN KEY (offering_club_id) REFERENCES public.clubs(id);
ALTER TABLE waiver_claims ADD CONSTRAINT waiver_claims_claiming_club_id_fkey FOREIGN KEY (claiming_club_id) REFERENCES public.clubs(id);
ALTER TABLE waiver_priority ADD CONSTRAINT waiver_priority_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id);
ALTER TABLE waivers ADD CONSTRAINT waivers_waiving_club_id_fkey FOREIGN KEY (waiving_club_id) REFERENCES public.clubs(id);
ALTER TABLE waivers ADD CONSTRAINT waivers_winning_club_id_fkey FOREIGN KEY (winning_club_id) REFERENCES public.clubs(id);

-- Foreign keys for fixtures table
ALTER TABLE fixtures ADD CONSTRAINT fixtures_home_club_id_fkey FOREIGN KEY (home_club_id) REFERENCES public.clubs(id);
ALTER TABLE fixtures ADD CONSTRAINT fixtures_away_club_id_fkey FOREIGN KEY (away_club_id) REFERENCES public.clubs(id);
ALTER TABLE ea_player_stats ADD CONSTRAINT ea_player_stats_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.fixtures(id);
ALTER TABLE ea_club_stats ADD CONSTRAINT ea_club_stats_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.fixtures(id);
ALTER TABLE game_availability ADD CONSTRAINT game_availability_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.fixtures(id);
ALTER TABLE lineups ADD CONSTRAINT lineups_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.fixtures(id);
ALTER TABLE fixture_events ADD CONSTRAINT fixture_events_fixture_id_fkey FOREIGN KEY (fixture_id) REFERENCES public.fixtures(id);

-- Step 7: Update unique constraints
ALTER TABLE waiver_priority DROP CONSTRAINT IF EXISTS waiver_priority_team_id_key;
ALTER TABLE waiver_priority ADD CONSTRAINT waiver_priority_club_id_key UNIQUE (club_id);

-- Step 8: Update any indexes that might reference the old column names
-- Note: PostgreSQL automatically updates indexes when columns are renamed, but we should verify

-- Step 9: Update any check constraints that reference old column names
-- Most check constraints should be automatically updated, but verify any custom ones

-- Step 10: Update any views, functions, or triggers that reference the old table/column names
-- This would need to be done manually based on your specific database objects

COMMIT;

-- Verification queries to run after migration:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%team%';
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%match%';
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('clubs', 'fixtures');
-- SELECT column_name, table_name FROM information_schema.columns WHERE table_schema = 'public' AND column_name LIKE '%team%';
-- SELECT column_name, table_name FROM information_schema.columns WHERE table_schema = 'public' AND column_name LIKE '%match%';
