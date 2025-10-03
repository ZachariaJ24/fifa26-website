-- Complete Bidding System Cleanup - Database Only
-- This script removes ALL bidding-related data and components from the database
-- ⚠️ WARNING: This will permanently delete all bidding data!

-- 1. Drop all bidding-related functions
DROP FUNCTION IF EXISTS process_expired_transfer_offers();
DROP FUNCTION IF EXISTS get_highest_transfer_offers();
DROP FUNCTION IF EXISTS update_transfer_offers_updated_at();
DROP FUNCTION IF EXISTS process_transfer_signings();
DROP FUNCTION IF EXISTS get_transfer_statistics();
DROP FUNCTION IF EXISTS get_team_transfer_activity(UUID);
DROP FUNCTION IF EXISTS get_player_transfer_history(UUID);
DROP FUNCTION IF EXISTS check_and_process_expired_offers();

-- 2. Drop all bidding-related views
DROP VIEW IF EXISTS active_transfer_offers;
DROP VIEW IF EXISTS transfer_market_status;
DROP VIEW IF EXISTS recent_transfer_activity;

-- 3. Drop all bidding-related triggers
DROP TRIGGER IF EXISTS update_transfer_offers_updated_at ON player_transfer_offers;

-- 4. Drop all bidding-related indexes
DROP INDEX IF EXISTS idx_transfer_offers_player_id;
DROP INDEX IF EXISTS idx_transfer_offers_team_id;
DROP INDEX IF EXISTS idx_transfer_offers_status;
DROP INDEX IF EXISTS idx_transfer_offers_expires_at;
DROP INDEX IF EXISTS idx_transfer_offers_expired;
DROP INDEX IF EXISTS idx_transfer_offers_player_status;
DROP INDEX IF EXISTS idx_transfer_offers_team_status;

-- 5. Drop the player_transfer_offers table completely
DROP TABLE IF EXISTS player_transfer_offers CASCADE;

-- 6. Drop old bidding system tables
DROP TABLE IF EXISTS player_bidding CASCADE;
DROP TABLE IF EXISTS bid_history CASCADE;
DROP TABLE IF EXISTS bidding_settings CASCADE;

-- 7. Remove bidding-related system settings
DELETE FROM system_settings WHERE key IN (
    'bidding_enabled',
    'bidding_duration', 
    'minimum_bid_increment',
    'transfer_offers_enabled',
    'transfer_offer_duration',
    'minimum_offer_increment',
    'transfer_market_enabled'
);

-- 8. Clean up bidding-related notifications
DELETE FROM notifications WHERE 
    title ILIKE '%bid%' OR 
    title ILIKE '%Bid%' OR
    message ILIKE '%bid%' OR 
    message ILIKE '%Bid%' OR
    title ILIKE '%transfer%' OR
    message ILIKE '%transfer%';

-- 9. Reset any players who were assigned via bidding system
-- This will make them free agents again
UPDATE players SET 
    team_id = NULL,
    salary = 2000000, -- Reset to default salary
    updated_at = NOW()
WHERE team_id IS NOT NULL 
AND updated_at > '2024-01-01'::timestamp; -- Only reset recent assignments

-- 10. Clean up any remaining bidding-related data
-- Remove any custom fields that might have been added for bidding
DO $$ 
BEGIN
    -- Drop any custom columns that might exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'bid_status') THEN
        ALTER TABLE players DROP COLUMN bid_status;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'transfer_status') THEN
        ALTER TABLE players DROP COLUMN transfer_status;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'bidding_enabled') THEN
        ALTER TABLE teams DROP COLUMN bidding_enabled;
    END IF;
END $$;

-- 11. Verify cleanup
SELECT 
    'Bidding System Cleanup Complete' as status,
    COUNT(*) as total_players,
    COUNT(CASE WHEN team_id IS NULL THEN 1 END) as free_agents,
    COUNT(CASE WHEN team_id IS NOT NULL THEN 1 END) as signed_players
FROM players;

-- Show remaining system settings
SELECT 'Remaining System Settings:' as info;
SELECT key, value 
FROM system_settings 
WHERE key LIKE '%bid%' OR key LIKE '%transfer%' OR key LIKE '%market%';

-- Show any remaining bidding-related notifications
SELECT 'Remaining Notifications:' as info;
SELECT COUNT(*) as count
FROM notifications 
WHERE title ILIKE '%bid%' OR message ILIKE '%bid%' OR title ILIKE '%transfer%' OR message ILIKE '%transfer%';

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
