-- Cleanup ELO System from Current Schema
-- This script removes ALL ELO-related components
-- Run this in your Supabase SQL Editor

-- ⚠️ WARNING: This will permanently delete all ELO data!

-- 1. Drop all ELO-related tables in dependency order
DROP TABLE IF EXISTS elo_match_players CASCADE;
DROP TABLE IF EXISTS elo_matches CASCADE;
DROP TABLE IF EXISTS elo_lobby_players CASCADE;
DROP TABLE IF EXISTS elo_lobbies CASCADE;
DROP TABLE IF EXISTS elo_players CASCADE;
DROP TABLE IF EXISTS elo_settings CASCADE;

-- 2. Remove ELO-related system settings
DELETE FROM system_settings WHERE key LIKE '%elo%' OR key LIKE '%ELO%';

-- 3. Clean up ELO-related notifications
DELETE FROM notifications WHERE 
    title ILIKE '%elo%' OR 
    title ILIKE '%ELO%' OR
    message ILIKE '%elo%' OR 
    message ILIKE '%ELO%';

-- 4. Verify cleanup
SELECT 
    'ELO System Cleanup Complete' as status;

-- Show remaining system settings
SELECT 'Remaining System Settings:' as info;
SELECT key, value 
FROM system_settings 
WHERE key LIKE '%elo%' OR key LIKE '%ELO%';

-- Show any remaining ELO-related notifications
SELECT 'Remaining Notifications:' as info;
SELECT COUNT(*) as count
FROM notifications 
WHERE title ILIKE '%elo%' OR message ILIKE '%elo%';

-- Show tables that still exist
SELECT 'Remaining Tables:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%elo%'
ORDER BY table_name;
