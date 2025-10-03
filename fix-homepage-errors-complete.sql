-- Complete Homepage Error Fix
-- This script addresses all RLS and permission issues causing 400 errors

-- First, check what's causing the 400 errors
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('players', 'clubs', 'fixtures', 'news', 'users')
ORDER BY tablename;

-- Drop all existing policies that might be too restrictive
DROP POLICY IF EXISTS "Allow anonymous players count" ON players;
DROP POLICY IF EXISTS "Allow anonymous clubs read" ON clubs;
DROP POLICY IF EXISTS "Allow anonymous fixtures read" ON fixtures;
DROP POLICY IF EXISTS "Allow anonymous news read" ON news;
DROP POLICY IF EXISTS "Allow anonymous users count" ON users;

-- OPTION 1: Temporarily disable RLS completely (QUICK FIX for testing)
-- Uncomment these lines if you want to disable RLS entirely:
-- ALTER TABLE players DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE clubs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE fixtures DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE news DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- OPTION 2: Create permissive policies for public access (RECOMMENDED)

-- Enable RLS but allow public read access
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create very permissive read policies for homepage
CREATE POLICY "Public read access" ON players
FOR SELECT USING (true);

CREATE POLICY "Public read access" ON clubs
FOR SELECT USING (true);

CREATE POLICY "Public read access" ON fixtures
FOR SELECT USING (true);

CREATE POLICY "Public read access" ON news
FOR SELECT USING (true);

CREATE POLICY "Public read access" ON users
FOR SELECT USING (true);

-- Grant necessary permissions to anonymous users
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.players TO anon;
GRANT SELECT ON public.clubs TO anon;
GRANT SELECT ON public.fixtures TO anon;
GRANT SELECT ON public.news TO anon;
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.conferences TO anon;
GRANT SELECT ON public.seasons TO anon;

-- Also grant to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.players TO authenticated;
GRANT SELECT ON public.clubs TO authenticated;
GRANT SELECT ON public.fixtures TO authenticated;
GRANT SELECT ON public.news TO authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.conferences TO authenticated;
GRANT SELECT ON public.seasons TO authenticated;

-- Test the access with simple queries
SELECT 'Testing players access...' as test;
SELECT COUNT(*) as players_count FROM players;

SELECT 'Testing clubs access...' as test;
SELECT COUNT(*) as clubs_count FROM clubs;

SELECT 'Testing fixtures access...' as test;
SELECT COUNT(*) as fixtures_count FROM fixtures;

SELECT 'Testing news access...' as test;
SELECT COUNT(*) as news_count FROM news;

SELECT 'Testing users access...' as test;
SELECT COUNT(*) as users_count FROM users;

-- If the above queries work, your homepage should work too!
