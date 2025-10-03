-- DEEP DIVE: Homepage 400 Error Analysis & Complete Fix
-- This script provides comprehensive diagnostics and solutions

-- ============================================================================
-- PART 1: DIAGNOSTIC QUERIES - Run these first to understand the problem
-- ============================================================================

-- Check if tables exist and their structure
SELECT 
    schemaname, 
    tablename, 
    tableowner,
    rowsecurity as rls_enabled,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('players', 'clubs', 'fixtures', 'news', 'users')
ORDER BY tablename;

-- Check current RLS policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    roles,
    cmd as command,
    qual as condition,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('players', 'clubs', 'fixtures', 'news', 'users')
ORDER BY tablename, policyname;

-- Check table permissions for anon and authenticated roles
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('players', 'clubs', 'fixtures', 'news', 'users')
AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY table_name, grantee;

-- Check if anon role exists and its properties
SELECT 
    rolname,
    rolsuper,
    rolinherit,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin,
    rolreplication,
    rolbypassrls
FROM pg_roles 
WHERE rolname IN ('anon', 'authenticated', 'service_role');

-- ============================================================================
-- PART 2: COMPLETE RESET AND FIX
-- ============================================================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow anonymous players count" ON players;
DROP POLICY IF EXISTS "Allow anonymous clubs read" ON clubs;
DROP POLICY IF EXISTS "Allow anonymous fixtures read" ON fixtures;
DROP POLICY IF EXISTS "Allow anonymous news read" ON news;
DROP POLICY IF EXISTS "Allow anonymous users count" ON users;
DROP POLICY IF EXISTS "Public read access" ON players;
DROP POLICY IF EXISTS "Public read access" ON clubs;
DROP POLICY IF EXISTS "Public read access" ON fixtures;
DROP POLICY IF EXISTS "Public read access" ON news;
DROP POLICY IF EXISTS "Public read access" ON users;

-- OPTION A: Disable RLS completely (QUICK FIX - Use this if you want immediate results)
-- Uncomment the following lines to disable RLS entirely:

-- ALTER TABLE players DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE clubs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE fixtures DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE news DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- OPTION B: Proper RLS setup with public access (RECOMMENDED)
-- Comment out Option A above and use this instead:

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create the most permissive policies possible for public read access
CREATE POLICY "homepage_public_access" ON players
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "homepage_public_access" ON clubs
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "homepage_public_access" ON fixtures
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "homepage_public_access" ON news
FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "homepage_public_access" ON users
FOR SELECT TO anon, authenticated
USING (true);

-- Grant explicit permissions to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Specifically grant permissions on our problem tables
GRANT SELECT ON public.players TO anon, authenticated;
GRANT SELECT ON public.clubs TO anon, authenticated;
GRANT SELECT ON public.fixtures TO anon, authenticated;
GRANT SELECT ON public.news TO anon, authenticated;
GRANT SELECT ON public.users TO anon, authenticated;
GRANT SELECT ON public.conferences TO anon, authenticated;
GRANT SELECT ON public.seasons TO anon, authenticated;

-- Also grant to public role (catch-all)
GRANT SELECT ON public.players TO public;
GRANT SELECT ON public.clubs TO public;
GRANT SELECT ON public.fixtures TO public;
GRANT SELECT ON public.news TO public;
GRANT SELECT ON public.users TO public;

-- ============================================================================
-- PART 3: VERIFICATION TESTS
-- ============================================================================

-- Test basic access to each table
SELECT 'Testing players table access...' as test_name;
SELECT COUNT(*) as count FROM players;

SELECT 'Testing clubs table access...' as test_name;
SELECT COUNT(*) as count FROM clubs;

SELECT 'Testing fixtures table access...' as test_name;
SELECT COUNT(*) as count FROM fixtures;

SELECT 'Testing news table access...' as test_name;
SELECT COUNT(*) as count FROM news;

SELECT 'Testing users table access...' as test_name;
SELECT COUNT(*) as count FROM users;

-- Test the exact queries that the homepage is making
SELECT 'Testing homepage players query...' as test_name;
SELECT COUNT(*) FROM players;

SELECT 'Testing homepage clubs query...' as test_name;
SELECT COUNT(*) FROM clubs WHERE is_active = true;

SELECT 'Testing homepage fixtures query...' as test_name;
SELECT COUNT(*) FROM fixtures;

-- Test with specific columns (like the homepage does)
SELECT 'Testing players with id column...' as test_name;
SELECT COUNT(id) FROM players;

SELECT 'Testing clubs with id column...' as test_name;
SELECT COUNT(id) FROM clubs;

SELECT 'Testing fixtures with id column...' as test_name;
SELECT COUNT(id) FROM fixtures;

-- ============================================================================
-- PART 4: ADDITIONAL DEBUGGING INFO
-- ============================================================================

-- Show current user and role
SELECT current_user, current_role, session_user;

-- Show search path
SHOW search_path;

-- Check if there are any triggers that might be interfering
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
AND event_object_table IN ('players', 'clubs', 'fixtures', 'news', 'users');

-- ============================================================================
-- FINAL NOTES
-- ============================================================================

/*
If the verification tests above work but your homepage still shows 400 errors:

1. The issue might be with your Supabase client configuration
2. Check if you're using the correct Supabase URL and anon key
3. Verify your service role key is correct in the admin client
4. Check if there are any middleware or API routes intercepting the requests

If Option B (RLS policies) doesn't work, uncomment Option A to disable RLS entirely.
This will allow all access to the tables and should fix the 400 errors immediately.

After running this script, restart your Next.js application to ensure all 
connections use the new permissions.
*/
