-- Complete System Cleanup (Final Version)
-- This script only removes old bidding references, keeps new transfer/signing system
-- Run this in your Supabase SQL Editor

-- ========================================
-- PART 1: CLEANUP OLD BIDDING REFERENCES ONLY
-- ========================================

-- Remove any old bidding-related system settings (if they exist)
DELETE FROM system_settings WHERE key IN (
    'bidding_enabled',
    'bidding_duration', 
    'bidding_increment',
    'bidding_recap_data',
    'bidding_market_enabled'
);

-- ========================================
-- PART 2: OPTIMIZE DATABASE PERFORMANCE
-- ========================================

-- Analyze tables for better query planning
ANALYZE teams;
ANALYZE players;
ANALYZE matches;
ANALYZE divisions;
ANALYZE conferences;
ANALYZE player_transfer_offers;
ANALYZE player_signings;
ANALYZE player_transfers;

-- ========================================
-- PART 3: VERIFY SYSTEM INTEGRITY
-- ========================================

-- Check for any orphaned records
SELECT 'Orphaned Players' as check_type, COUNT(*) as count
FROM players p 
LEFT JOIN teams t ON p.team_id = t.id 
WHERE p.team_id IS NOT NULL AND t.id IS NULL;

SELECT 'Orphaned Signings' as check_type, COUNT(*) as count
FROM player_signings ps 
LEFT JOIN players p ON ps.player_id = p.id 
WHERE p.id IS NULL;

-- ========================================
-- PART 4: FINAL SYSTEM STATUS
-- ========================================

SELECT 
    'Complete System Setup Finished' as status,
    (SELECT COUNT(*) FROM divisions) as divisions_count,
    (SELECT COUNT(*) FROM conferences) as conferences_count,
    (SELECT COUNT(*) FROM teams WHERE is_active = true) as active_teams_count,
    (SELECT COUNT(*) FROM teams WHERE division IS NOT NULL) as teams_with_divisions,
    (SELECT COUNT(*) FROM teams WHERE conference_id IS NOT NULL) as teams_with_conferences,
    (SELECT COUNT(*) FROM player_signings) as signings_count;

-- Show division assignments
SELECT 
    'Division Assignments' as info,
    division,
    COUNT(*) as team_count
FROM teams 
WHERE is_active = true AND division IS NOT NULL
GROUP BY division 
ORDER BY 
    CASE division 
        WHEN 'Premier Division' THEN 1 
        WHEN 'Championship Division' THEN 2 
        WHEN 'League One' THEN 3 
        ELSE 4 
    END;

-- Show conference assignments
SELECT 
    'Conference Assignments' as info,
    c.name as conference,
    COUNT(t.id) as team_count
FROM conferences c
LEFT JOIN teams t ON c.id = t.conference_id
WHERE t.is_active = true
GROUP BY c.id, c.name
ORDER BY c.name;
