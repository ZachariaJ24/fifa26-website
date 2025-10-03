-- FIFA 26 Website - Database Synchronization Fixes
-- This file contains SQL fixes to ensure database schema matches frontend expectations

-- =====================================================
-- 1. MANAGEMENT PAGE FIXES
-- =====================================================

-- Fix: Management page references team_id but schema uses club_id
-- Ensure all references are consistent with clubs table

-- Check if any legacy team_id columns exist and need migration
DO $$
BEGIN
    -- Check if team_id column exists in players table
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'team_id'
    ) THEN
        -- Migrate data from team_id to club_id if both exist
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'players' AND column_name = 'club_id'
        ) THEN
            UPDATE players SET club_id = team_id WHERE club_id IS NULL AND team_id IS NOT NULL;
            ALTER TABLE players DROP COLUMN team_id;
        ELSE
            -- Rename team_id to club_id
            ALTER TABLE players RENAME COLUMN team_id TO club_id;
        END IF;
    END IF;
END $$;

-- =====================================================
-- 2. USER MANAGEMENT FIXES
-- =====================================================

-- Fix: Frontend references profiles table that doesn't exist
-- Ensure all user data is properly accessible from users table

-- Add missing columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS gamer_tag text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username text;

-- Ensure gamer_tag_id is properly set (some queries expect this)
UPDATE users SET gamer_tag = gamer_tag_id WHERE gamer_tag IS NULL AND gamer_tag_id IS NOT NULL;

-- =====================================================
-- 3. BANNED USERS FIXES
-- =====================================================

-- Ensure banned users functionality works properly
-- Add is_banned computed field support

-- Create or update banned_users view for easier querying
CREATE OR REPLACE VIEW banned_users_view AS
SELECT 
    u.id,
    u.email,
    u.gamer_tag,
    u.gamer_tag_id,
    u.discord_name,
    u.ban_reason,
    u.ban_expiration,
    u.created_at,
    CASE 
        WHEN u.ban_reason IS NOT NULL AND (u.ban_expiration IS NULL OR u.ban_expiration > NOW()) 
        THEN true 
        ELSE false 
    END as is_banned
FROM users u
WHERE u.ban_reason IS NOT NULL;

-- =====================================================
-- 4. CLUB MANAGEMENT FIXES
-- =====================================================

-- Ensure clubs table has all required fields for management interface
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS salary_cap bigint DEFAULT 65000000;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS max_players integer DEFAULT 23;

-- Add computed columns for better management interface
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS games_played integer DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS goals_for integer DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS goals_against integer DEFAULT 0;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS goal_differential integer DEFAULT 0;

-- Update goal differential calculation
UPDATE clubs SET goal_differential = goals_scored - goals_conceded;

-- =====================================================
-- 5. SEASON MANAGEMENT FIXES
-- =====================================================

-- Ensure current season functionality works
INSERT INTO system_settings (key, value, created_at, updated_at)
VALUES ('current_season_id', '{"season_id": null}', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- Function to get current season
CREATE OR REPLACE FUNCTION get_current_season_id()
RETURNS uuid AS $$
DECLARE
    current_season_id uuid;
BEGIN
    SELECT (value->>'season_id')::uuid INTO current_season_id
    FROM system_settings 
    WHERE key = 'current_season_id';
    
    -- If no current season set, get the most recent active season
    IF current_season_id IS NULL THEN
        SELECT id INTO current_season_id
        FROM seasons 
        WHERE is_active = true 
        ORDER BY created_at DESC 
        LIMIT 1;
    END IF;
    
    RETURN current_season_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. PLAYER STATUS FIXES
-- =====================================================

-- Ensure player status is consistent across tables
-- Fix any orphaned players without users

-- Update player status based on user existence
UPDATE players 
SET status = 'retired' 
WHERE user_id NOT IN (SELECT id FROM users) 
AND status = 'active';

-- =====================================================
-- 7. FOREIGN KEY CONSISTENCY
-- =====================================================

-- Ensure all foreign key relationships are properly defined
-- This helps with query performance and data integrity

-- Add missing foreign key constraints if they don't exist
DO $$
BEGIN
    -- players.club_id -> clubs.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'players_club_id_fkey' 
        AND table_name = 'players'
    ) THEN
        ALTER TABLE players 
        ADD CONSTRAINT players_club_id_fkey 
        FOREIGN KEY (club_id) REFERENCES clubs(id);
    END IF;

    -- season_registrations.season_id -> seasons.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'season_registrations_season_id_fkey' 
        AND table_name = 'season_registrations'
    ) THEN
        ALTER TABLE season_registrations 
        ADD CONSTRAINT season_registrations_season_id_fkey 
        FOREIGN KEY (season_id) REFERENCES seasons(id);
    END IF;
END $$;

-- =====================================================
-- 8. PERFORMANCE OPTIMIZATIONS
-- =====================================================

-- Add indexes for commonly queried fields (non-concurrent for transaction safety)
CREATE INDEX IF NOT EXISTS idx_users_gamer_tag_id ON users(gamer_tag_id);
CREATE INDEX IF NOT EXISTS idx_users_ban_reason ON users(ban_reason) WHERE ban_reason IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_club_id ON players(club_id);
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON user_roles(user_id, role);

-- =====================================================
-- 9. DATA VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate user data consistency
CREATE OR REPLACE FUNCTION validate_user_data_consistency()
RETURNS TABLE(issue_type text, issue_description text, affected_count bigint) AS $$
BEGIN
    -- Check for users without gamer_tag_id
    RETURN QUERY
    SELECT 
        'missing_gamer_tag'::text,
        'Users without gamer_tag_id'::text,
        COUNT(*)
    FROM users 
    WHERE gamer_tag_id IS NULL OR gamer_tag_id = '';

    -- Check for players without valid users
    RETURN QUERY
    SELECT 
        'orphaned_players'::text,
        'Players without valid user records'::text,
        COUNT(*)
    FROM players p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE u.id IS NULL;

    -- Check for clubs without players
    RETURN QUERY
    SELECT 
        'empty_clubs'::text,
        'Clubs without any players'::text,
        COUNT(*)
    FROM clubs c
    LEFT JOIN players p ON c.id = p.club_id
    WHERE p.id IS NULL AND c.is_active = true;

END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. CLEANUP OPERATIONS
-- =====================================================

-- Remove any duplicate user roles
-- Use a different approach since MIN() doesn't work with UUID
DELETE FROM user_roles 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, role) id
    FROM user_roles 
    ORDER BY user_id, role, created_at ASC
);

-- Update any NULL values that should have defaults
UPDATE clubs SET 
    wins = COALESCE(wins, 0),
    losses = COALESCE(losses, 0),
    draws = COALESCE(draws, 0),
    points = COALESCE(points, 0),
    goals_scored = COALESCE(goals_scored, 0),
    goals_conceded = COALESCE(goals_conceded, 0),
    matches_played = COALESCE(matches_played, 0);

UPDATE players SET 
    salary = COALESCE(salary, 0),
    retained_salary = COALESCE(retained_salary, 0);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these queries to verify fixes worked:

-- 1. Check user data consistency
-- SELECT * FROM validate_user_data_consistency();

-- 2. Verify club data
-- SELECT name, wins, losses, draws, points, goals_scored, goals_conceded, goal_difference 
-- FROM clubs WHERE is_active = true ORDER BY points DESC;

-- 3. Check player-club relationships
-- SELECT c.name as club_name, COUNT(p.id) as player_count
-- FROM clubs c
-- LEFT JOIN players p ON c.id = p.club_id AND p.status = 'active'
-- WHERE c.is_active = true
-- GROUP BY c.id, c.name
-- ORDER BY player_count DESC;

-- 4. Verify banned users
-- SELECT * FROM banned_users_view LIMIT 10;

-- =====================================================
-- NOTES FOR DEVELOPERS
-- =====================================================

/*
IMPORTANT: After running these fixes, update your frontend code to:

1. Use 'club_id' instead of 'team_id' in all queries
2. Query users table directly instead of non-existent profiles table
3. Use proper foreign key relationships in joins
4. Handle NULL values appropriately
5. Use the banned_users_view for banned user queries

Example corrected queries:

BEFORE (incorrect):
SELECT p.*, u.gamer_tag FROM players p
JOIN users u ON p.user_id = u.id
WHERE p.team_id = $1

AFTER (correct):
SELECT p.*, u.gamer_tag_id as gamer_tag FROM players p
JOIN users u ON p.user_id = u.id  
WHERE p.club_id = $1

BEFORE (incorrect):
SELECT u.*, p.gamer_tag FROM users u
LEFT JOIN profiles p ON u.id = p.user_id

AFTER (correct):
SELECT u.* FROM users u
*/
