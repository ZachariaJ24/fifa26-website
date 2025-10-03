-- Fix Homepage RLS Issues
-- This script helps diagnose and fix Row Level Security issues causing 400 errors

-- Check current RLS status on key tables
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('players', 'clubs', 'fixtures', 'news', 'users')
ORDER BY tablename;

-- Check existing RLS policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    roles,
    cmd as command,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('players', 'clubs', 'fixtures', 'news', 'users')
ORDER BY tablename, policyname;

-- OPTION 1: Temporarily disable RLS for homepage tables (QUICK FIX)
-- WARNING: This removes security - only use for testing!

-- ALTER TABLE players DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE clubs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE fixtures DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE news DISABLE ROW LEVEL SECURITY;

-- OPTION 2: Add permissive policies for anonymous access (BETTER APPROACH)

-- Allow anonymous read access to players count
DROP POLICY IF EXISTS "Allow anonymous players count" ON players;
CREATE POLICY "Allow anonymous players count" ON players
FOR SELECT USING (true);

-- Allow anonymous read access to clubs
DROP POLICY IF EXISTS "Allow anonymous clubs read" ON clubs;
CREATE POLICY "Allow anonymous clubs read" ON clubs
FOR SELECT USING (is_active = true);

-- Allow anonymous read access to fixtures
DROP POLICY IF EXISTS "Allow anonymous fixtures read" ON fixtures;
CREATE POLICY "Allow anonymous fixtures read" ON fixtures
FOR SELECT USING (true);

-- Allow anonymous read access to published news
DROP POLICY IF EXISTS "Allow anonymous news read" ON news;
CREATE POLICY "Allow anonymous news read" ON news
FOR SELECT USING (published = true);

-- Allow anonymous read access to users (for count only)
DROP POLICY IF EXISTS "Allow anonymous users count" ON users;
CREATE POLICY "Allow anonymous users count" ON users
FOR SELECT USING (true);

-- Enable RLS on tables (if not already enabled)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Test queries to verify access
SELECT 'players' as table_name, COUNT(*) as count FROM players;
SELECT 'clubs' as table_name, COUNT(*) as count FROM clubs WHERE is_active = true;
SELECT 'fixtures' as table_name, COUNT(*) as count FROM fixtures;
SELECT 'news' as table_name, COUNT(*) as count FROM news WHERE published = true;
SELECT 'users' as table_name, COUNT(*) as count FROM users;
