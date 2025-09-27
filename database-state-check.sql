-- Database State Diagnostic Script
-- Run this to check the current state of your database before running any rollback

-- Check which main tables exist
SELECT 'Main Tables Status:' as check_type;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams') THEN 'EXISTS'
        ELSE 'MISSING'
    END as teams_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clubs') THEN 'EXISTS'
        ELSE 'MISSING'
    END as clubs_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matches') THEN 'EXISTS'
        ELSE 'MISSING'
    END as matches_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fixtures') THEN 'EXISTS'
        ELSE 'MISSING'
    END as fixtures_table;

-- Check team-related tables
SELECT 'Team-related Tables:' as check_type;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%team%' OR table_name LIKE '%club%')
ORDER BY table_name;

-- Check match-related tables
SELECT 'Match-related Tables:' as check_type;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%match%' OR table_name LIKE '%fixture%')
ORDER BY table_name;

-- Check column names in key tables
SELECT 'Column Analysis:' as check_type;

-- Check columns in the main table (whichever exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clubs') THEN
        RAISE NOTICE 'CLUBS table columns:';
        FOR rec IN SELECT column_name FROM information_schema.columns WHERE table_name = 'clubs' ORDER BY column_name
        LOOP
            RAISE NOTICE '  - %', rec.column_name;
        END LOOP;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams') THEN
        RAISE NOTICE 'TEAMS table columns:';
        FOR rec IN SELECT column_name FROM information_schema.columns WHERE table_name = 'teams' ORDER BY column_name
        LOOP
            RAISE NOTICE '  - %', rec.column_name;
        END LOOP;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fixtures') THEN
        RAISE NOTICE 'FIXTURES table columns:';
        FOR rec IN SELECT column_name FROM information_schema.columns WHERE table_name = 'fixtures' ORDER BY column_name
        LOOP
            RAISE NOTICE '  - %', rec.column_name;
        END LOOP;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matches') THEN
        RAISE NOTICE 'MATCHES table columns:';
        FOR rec IN SELECT column_name FROM information_schema.columns WHERE table_name = 'matches' ORDER BY column_name
        LOOP
            RAISE NOTICE '  - %', rec.column_name;
        END LOOP;
    END IF;
END $$;

-- Check for team_id vs club_id columns
SELECT 'Team/Club ID Columns:' as check_type;
SELECT table_name, column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (column_name LIKE '%team_id%' OR column_name LIKE '%club_id%')
ORDER BY table_name, column_name;

-- Check for match_id vs fixture_id columns  
SELECT 'Match/Fixture ID Columns:' as check_type;
SELECT table_name, column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (column_name LIKE '%match_id%' OR column_name LIKE '%fixture_id%')
ORDER BY table_name, column_name;

-- Summary
SELECT 'SUMMARY:' as summary;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clubs') 
        AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams')
        THEN 'Migration appears COMPLETE - teams renamed to clubs'
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams') 
        AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clubs')
        THEN 'Migration appears NOT STARTED or ROLLED BACK - teams table exists'
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teams') 
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clubs')
        THEN 'PARTIAL STATE - both teams and clubs tables exist'
        ELSE 'UNKNOWN STATE - neither teams nor clubs found'
    END as teams_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fixtures') 
        AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matches')
        THEN 'Migration appears COMPLETE - matches renamed to fixtures'
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matches') 
        AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fixtures')
        THEN 'Migration appears NOT STARTED or ROLLED BACK - matches table exists'
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matches') 
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fixtures')
        THEN 'PARTIAL STATE - both matches and fixtures tables exist'
        ELSE 'UNKNOWN STATE - neither matches nor fixtures found'
    END as matches_status;
