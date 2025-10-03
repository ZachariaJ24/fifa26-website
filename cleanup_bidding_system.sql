-- Complete Bidding System Cleanup - Remove All Bidding Components
-- Run this in your Supabase SQL Editor

-- ⚠️ WARNING: This will permanently delete all bidding data!
-- Make sure you have backups if you need to preserve any bidding history

-- 1. Drop all bidding-related functions
DROP FUNCTION IF EXISTS process_expired_transfer_offers();
DROP FUNCTION IF EXISTS get_highest_transfer_offers();
DROP FUNCTION IF EXISTS update_transfer_offers_updated_at();

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

-- 5. Drop the player_transfer_offers table (if you want to completely remove transfer system)
-- Uncomment the next line if you want to remove the entire transfer system:
-- DROP TABLE IF EXISTS player_transfer_offers CASCADE;

-- 6. Drop old bidding system tables (if they exist)
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
    'minimum_offer_increment'
);

-- 8. Clean up any bidding-related notifications
DELETE FROM notifications WHERE title LIKE '%bid%' OR title LIKE '%Bid%';
DELETE FROM notifications WHERE message LIKE '%bid%' OR message LIKE '%Bid%';

-- 9. Remove any bidding-related data from other tables
-- Clean up any references in the players table
UPDATE players SET 
    updated_at = NOW()
WHERE team_id IS NOT NULL 
AND id IN (
    SELECT DISTINCT player_id 
    FROM player_bidding 
    WHERE status = 'Won' OR status = 'completed'
);

-- 10. Drop any remaining bidding-related functions
DROP FUNCTION IF EXISTS process_expired_bids();
DROP FUNCTION IF EXISTS get_bid_statistics();
DROP FUNCTION IF EXISTS get_team_bid_activity(UUID);
DROP FUNCTION IF EXISTS get_player_bid_history(UUID);
DROP FUNCTION IF EXISTS check_and_process_expired_bids();

-- 11. Verify cleanup
SELECT 
    'Bidding System Cleanup Complete' as status,
    COUNT(*) as remaining_transfer_offers
FROM player_transfer_offers;

-- Show remaining system settings
SELECT key, value 
FROM system_settings 
WHERE key LIKE '%bid%' OR key LIKE '%transfer%';

-- Show any remaining bidding-related notifications
SELECT COUNT(*) as remaining_bidding_notifications
FROM notifications 
WHERE title LIKE '%bid%' OR message LIKE '%bid%';
