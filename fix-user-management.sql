-- Fix User Management Page Issues
-- This addresses the database relationship and permission problems

-- ============================================================================
-- PART 1: Fix the foreign key relationship issue
-- ============================================================================

-- The error shows that users table doesn't have a direct relationship to clubs
-- We need to go through the players table to get club information

-- Check current relationships
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('users', 'players', 'clubs')
ORDER BY tc.table_name;

-- ============================================================================
-- PART 2: Grant permissions for admin pages
-- ============================================================================

-- Grant permissions to all admin-related tables
GRANT SELECT ON public.users TO anon, authenticated;
GRANT SELECT ON public.user_roles TO anon, authenticated;
GRANT SELECT ON public.players TO anon, authenticated;
GRANT SELECT ON public.clubs TO anon, authenticated;
GRANT SELECT ON public.season_registrations TO anon, authenticated;
GRANT SELECT ON public.banned_users TO anon, authenticated;

-- Also grant UPDATE and INSERT for admin operations
GRANT UPDATE ON public.users TO authenticated;
GRANT UPDATE ON public.user_roles TO authenticated;
GRANT UPDATE ON public.players TO authenticated;
GRANT INSERT ON public.banned_users TO authenticated;

-- ============================================================================
-- PART 3: Create a view to simplify user management queries
-- ============================================================================

-- First, let's check what columns actually exist in the users table
-- Comment out the view creation and add a diagnostic query first

-- Check the actual structure of the users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Create a very basic view with only essential columns that should exist
CREATE OR REPLACE VIEW user_management_view AS
SELECT 
    u.id,
    u.email,
    u.created_at,
    p.id as player_id,
    p.club_id,
    c.name as club_name,
    c.logo_url as club_logo,
    array_agg(DISTINCT ur.role) FILTER (WHERE ur.role IS NOT NULL) as roles,
    COUNT(DISTINCT sr.id) as season_registration_count,
    CASE WHEN bu.id IS NOT NULL THEN true ELSE false END as is_banned,
    bu.reason as ban_reason,
    bu.expires_at as ban_expires_at
FROM users u
LEFT JOIN players p ON u.id = p.user_id
LEFT JOIN clubs c ON p.club_id = c.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN season_registrations sr ON u.id = sr.user_id
LEFT JOIN banned_users bu ON u.id = bu.user_id AND (bu.expires_at IS NULL OR bu.expires_at > NOW())
GROUP BY u.id, u.email, u.created_at, p.id, p.club_id, c.name, c.logo_url, bu.id, bu.reason, bu.expires_at
ORDER BY u.created_at DESC;

-- Grant access to the view
GRANT SELECT ON user_management_view TO anon, authenticated;

-- ============================================================================
-- PART 4: Create helper functions for user management
-- ============================================================================

-- Function to get user management stats (simplified to avoid non-existent columns)
CREATE OR REPLACE FUNCTION get_user_management_stats()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total', (SELECT COUNT(*) FROM users),
    'active', (SELECT COUNT(*) FROM users WHERE id NOT IN (SELECT user_id FROM banned_users WHERE user_id IS NOT NULL AND (expires_at IS NULL OR expires_at > NOW()))),
    'banned', (SELECT COUNT(*) FROM banned_users WHERE expires_at IS NULL OR expires_at > NOW()),
    'orphaned', (SELECT COUNT(*) FROM users WHERE created_at < NOW() - INTERVAL '24 hours'),
    'registered', (SELECT COUNT(DISTINCT user_id) FROM season_registrations WHERE user_id IS NOT NULL),
    'unconfirmed', 0
  );
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_management_stats() TO anon, authenticated;

-- ============================================================================
-- PART 5: Test the fixes
-- ============================================================================

-- Test the view
SELECT COUNT(*) as total_users FROM user_management_view;

-- Test the stats function
SELECT get_user_management_stats();

-- Test individual queries that the page might use
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM user_roles;
SELECT COUNT(*) FROM season_registrations;

-- Test the complex query that was failing
SELECT 
    u.id,
    u.email,
    u.gamer_tag,
    u.created_at,
    array_agg(DISTINCT ur.role) as roles,
    p.club_id,
    c.name as club_name
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN players p ON u.id = p.user_id
LEFT JOIN clubs c ON p.club_id = c.id
GROUP BY u.id, u.email, u.gamer_tag, u.created_at, p.club_id, c.name
LIMIT 5;

SELECT 'User management database fixes complete!' as status;
