-- Complete System Cleanup - Remove Bidding and ELO Systems
-- This script removes ALL bidding and ELO components from your schema
-- Run this in your Supabase SQL Editor

-- ⚠️ WARNING: This will permanently delete all bidding and ELO data!

-- ========================================
-- PART 1: CLEANUP BIDDING SYSTEM
-- ========================================

-- Drop all bidding-related functions
DROP FUNCTION IF EXISTS process_expired_transfer_offers();
DROP FUNCTION IF EXISTS get_highest_transfer_offers();
DROP FUNCTION IF EXISTS update_transfer_offers_updated_at();
DROP FUNCTION IF EXISTS process_transfer_signings();
DROP FUNCTION IF EXISTS get_transfer_statistics();
DROP FUNCTION IF EXISTS get_team_transfer_activity(UUID);
DROP FUNCTION IF EXISTS get_player_transfer_history(UUID);
DROP FUNCTION IF EXISTS check_and_process_expired_offers();

-- Drop all bidding-related views
DROP VIEW IF EXISTS active_transfer_offers;
DROP VIEW IF EXISTS transfer_market_status;
DROP VIEW IF EXISTS recent_transfer_activity;

-- Drop all bidding-related triggers
DROP TRIGGER IF EXISTS update_transfer_offers_updated_at ON player_transfer_offers;

-- Drop all bidding-related indexes
DROP INDEX IF EXISTS idx_transfer_offers_player_id;
DROP INDEX IF EXISTS idx_transfer_offers_team_id;
DROP INDEX IF EXISTS idx_transfer_offers_status;
DROP INDEX IF EXISTS idx_transfer_offers_expires_at;
DROP INDEX IF EXISTS idx_transfer_offers_expired;
DROP INDEX IF EXISTS idx_transfer_offers_player_status;
DROP INDEX IF EXISTS idx_transfer_offers_team_status;

-- Drop the player_bidding table (old bidding system)
DROP TABLE IF EXISTS player_bidding CASCADE;

-- ========================================
-- PART 2: CLEANUP ELO SYSTEM
-- ========================================

-- Drop all ELO-related tables in dependency order
DROP TABLE IF EXISTS elo_match_players CASCADE;
DROP TABLE IF EXISTS elo_matches CASCADE;
DROP TABLE IF EXISTS elo_lobby_players CASCADE;
DROP TABLE IF EXISTS elo_lobbies CASCADE;
DROP TABLE IF EXISTS elo_players CASCADE;
DROP TABLE IF EXISTS elo_settings CASCADE;

-- ========================================
-- PART 3: CLEANUP SYSTEM SETTINGS
-- ========================================

-- Remove bidding-related system settings
DELETE FROM system_settings WHERE key IN (
    'bidding_enabled',
    'bidding_duration', 
    'minimum_bid_increment',
    'transfer_offers_enabled',
    'transfer_offer_duration',
    'minimum_offer_increment',
    'transfer_market_enabled'
);

-- Remove ELO-related system settings
DELETE FROM system_settings WHERE key LIKE '%elo%' OR key LIKE '%ELO%';

-- ========================================
-- PART 4: CLEANUP NOTIFICATIONS
-- ========================================

-- Clean up bidding-related notifications
DELETE FROM notifications WHERE 
    title ILIKE '%bid%' OR 
    title ILIKE '%Bid%' OR
    message ILIKE '%bid%' OR 
    message ILIKE '%Bid%';

-- Clean up ELO-related notifications
DELETE FROM notifications WHERE 
    title ILIKE '%elo%' OR 
    title ILIKE '%ELO%' OR
    message ILIKE '%elo%' OR 
    message ILIKE '%ELO%';

-- ========================================
-- PART 5: RESET PLAYER DATA
-- ========================================

-- Reset any players who were assigned via bidding system to free agents
UPDATE players SET 
    team_id = NULL,
    salary = 2000000, -- Reset to default salary
    updated_at = NOW()
WHERE team_id IS NOT NULL 
AND updated_at > '2024-01-01'::timestamp; -- Only reset recent assignments

-- ========================================
-- PART 6: CLEANUP CUSTOM COLUMNS
-- ========================================

-- Remove any custom fields that might have been added for bidding/ELO
DO $$ 
BEGIN
    -- Drop any custom columns that might exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'bid_status') THEN
        ALTER TABLE players DROP COLUMN bid_status;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'transfer_status') THEN
        ALTER TABLE players DROP COLUMN transfer_status;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'elo_rating') THEN
        ALTER TABLE players DROP COLUMN elo_rating;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'bidding_enabled') THEN
        ALTER TABLE teams DROP COLUMN bidding_enabled;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'elo_enabled') THEN
        ALTER TABLE teams DROP COLUMN elo_enabled;
    END IF;
END $$;

-- ========================================
-- PART 7: VERIFICATION
-- ========================================

-- Show cleanup results
SELECT 
    'System Cleanup Complete' as status,
    COUNT(*) as total_players,
    COUNT(CASE WHEN team_id IS NULL THEN 1 END) as free_agents,
    COUNT(CASE WHEN team_id IS NOT NULL THEN 1 END) as signed_players
FROM players;

-- Show remaining system settings
SELECT 'Remaining System Settings:' as info;
SELECT key, value 
FROM system_settings 
WHERE key LIKE '%bid%' OR key LIKE '%transfer%' OR key LIKE '%market%' OR key LIKE '%elo%';

-- Show any remaining related notifications
SELECT 'Remaining Notifications:' as info;
SELECT COUNT(*) as count
FROM notifications 
WHERE title ILIKE '%bid%' OR message ILIKE '%bid%' OR title ILIKE '%elo%' OR message ILIKE '%elo%';

-- Show current player distribution
SELECT 'Current Player Distribution:' as info;
SELECT 
    CASE 
        WHEN team_id IS NULL THEN 'Free Agents'
        ELSE 'Signed Players'
    END as status,
    COUNT(*) as count
FROM players 
GROUP BY team_id IS NULL;

-- Show remaining tables
SELECT 'Remaining Tables:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%bid%' OR table_name LIKE '%transfer%' OR table_name LIKE '%elo%')
ORDER BY table_name;
