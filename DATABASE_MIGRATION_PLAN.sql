-- ============================================================================
-- DATABASE MIGRATION PLAN
-- Purpose: Consolidate dual systems and fix foreign key inconsistencies
-- Date: October 4, 2025
-- ============================================================================

-- IMPORTANT: Review and test in development before running in production!
-- This script makes irreversible changes to your database schema.

-- ============================================================================
-- PART 1: MIGRATE ROLES TO user_roles TABLE
-- ============================================================================

-- Step 1: Ensure all role types exist in roles table
INSERT INTO public.roles (name, display_name, description, level, is_system_role)
VALUES 
  ('Player', 'Player', 'Regular player in the league', 1, true),
  ('GM', 'General Manager', 'Team general manager', 3, true),
  ('AGM', 'Assistant GM', 'Assistant general manager', 2, true),
  ('Owner', 'Team Owner', 'Team owner', 4, true),
  ('Admin', 'Administrator', 'System administrator', 5, true)
ON CONFLICT (name) DO NOTHING;

-- Step 2: Migrate existing player roles to user_roles table
-- Note: user_roles has BOTH role (text, NOT NULL) and role_id (UUID, nullable)
INSERT INTO public.user_roles (user_id, role, role_id)
SELECT 
  p.user_id,
  p.role as role,  -- Text column (NOT NULL)
  r.id as role_id  -- UUID column (nullable)
FROM public.players p
INNER JOIN public.roles r ON r.name = p.role
WHERE p.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.user_id AND ur.role = p.role
  );

-- Step 3: Add comment to players.role column (mark as deprecated)
COMMENT ON COLUMN public.players.role IS 'DEPRECATED: Use user_roles table instead. Kept for backward compatibility.';

-- ============================================================================
-- PART 2: MIGRATE BANS TO users TABLE
-- ============================================================================

-- Step 1: Migrate banned_users data to users table
UPDATE public.users u
SET 
  is_banned = true,
  ban_reason = bu.reason,
  ban_expiration = bu.expires_at
FROM public.banned_users bu
WHERE u.id = bu.user_id;

-- Step 2: Rename banned_users table (don't drop yet, keep as backup)
ALTER TABLE public.banned_users RENAME TO banned_users_deprecated;

-- Step 3: Add comment
COMMENT ON TABLE public.banned_users_deprecated IS 'DEPRECATED: Data migrated to users table. Safe to drop after verification.';

-- ============================================================================
-- PART 3: FIX FOREIGN KEY REFERENCES (auth.users → public.users)
-- ============================================================================

-- WARNING: This section requires careful execution and may fail if data doesn't exist
-- Test each constraint individually before running

-- Step 1: admin_actions.admin_user_id
-- First ensure all admin_user_id values exist in public.users
-- Then update the constraint
ALTER TABLE public.admin_actions 
  DROP CONSTRAINT IF EXISTS admin_actions_admin_user_id_fkey;

ALTER TABLE public.admin_actions
  ADD CONSTRAINT admin_actions_admin_user_id_fkey 
  FOREIGN KEY (admin_user_id) 
  REFERENCES public.users(id) ON DELETE SET NULL;

-- Step 2: analytics_events.user_id
ALTER TABLE public.analytics_events 
  DROP CONSTRAINT IF EXISTS analytics_events_user_id_fkey;

ALTER TABLE public.analytics_events
  ADD CONSTRAINT analytics_events_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) ON DELETE SET NULL;

-- Step 3: code_downloads.user_id
ALTER TABLE public.code_downloads 
  DROP CONSTRAINT IF EXISTS code_downloads_user_id_fkey;

ALTER TABLE public.code_downloads
  ADD CONSTRAINT code_downloads_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) ON DELETE SET NULL;

-- Step 4: file_access_logs.user_id
ALTER TABLE public.file_access_logs 
  DROP CONSTRAINT IF EXISTS file_access_logs_user_id_fkey;

ALTER TABLE public.file_access_logs
  ADD CONSTRAINT file_access_logs_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) ON DELETE SET NULL;

-- Step 5: security_events.user_id
ALTER TABLE public.security_events 
  DROP CONSTRAINT IF EXISTS security_events_user_id_fkey;

ALTER TABLE public.security_events
  ADD CONSTRAINT security_events_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) ON DELETE SET NULL;

-- Step 6: security_events.resolved_by
ALTER TABLE public.security_events 
  DROP CONSTRAINT IF EXISTS security_events_resolved_by_fkey;

ALTER TABLE public.security_events
  ADD CONSTRAINT security_events_resolved_by_fkey 
  FOREIGN KEY (resolved_by) 
  REFERENCES public.users(id) ON DELETE SET NULL;

-- Step 7: ea_player_mappings.user_id
ALTER TABLE public.ea_player_mappings 
  DROP CONSTRAINT IF EXISTS ea_player_mappings_user_id_fkey;

ALTER TABLE public.ea_player_mappings
  ADD CONSTRAINT ea_player_mappings_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) ON DELETE SET NULL;

-- Step 8: player_signings.approved_by
ALTER TABLE public.player_signings 
  DROP CONSTRAINT IF EXISTS player_signings_approved_by_fkey;

ALTER TABLE public.player_signings
  ADD CONSTRAINT player_signings_approved_by_fkey 
  FOREIGN KEY (approved_by) 
  REFERENCES public.users(id) ON DELETE SET NULL;

-- Step 9: club_managers.user_id
ALTER TABLE public.club_managers 
  DROP CONSTRAINT IF EXISTS team_managers_user_id_fkey;

ALTER TABLE public.club_managers
  ADD CONSTRAINT club_managers_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) ON DELETE CASCADE;

-- Step 10: players.manually_removed_by
ALTER TABLE public.players 
  DROP CONSTRAINT IF EXISTS players_manually_removed_by_fkey;

ALTER TABLE public.players
  ADD CONSTRAINT players_manually_removed_by_fkey 
  FOREIGN KEY (manually_removed_by) 
  REFERENCES public.users(id) ON DELETE SET NULL;

-- Step 11: banned_users_deprecated (clean up orphaned records first)
-- Delete any banned_users records where user_id doesn't exist in public.users
DELETE FROM public.banned_users_deprecated
WHERE user_id NOT IN (SELECT id FROM public.users);

-- Delete any banned_users records where banned_by doesn't exist in public.users
UPDATE public.banned_users_deprecated
SET banned_by = NULL
WHERE banned_by IS NOT NULL 
  AND banned_by NOT IN (SELECT id FROM public.users);

-- Now update the constraints
ALTER TABLE public.banned_users_deprecated 
  DROP CONSTRAINT IF EXISTS banned_users_user_id_fkey;

ALTER TABLE public.banned_users_deprecated
  ADD CONSTRAINT banned_users_deprecated_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.banned_users_deprecated 
  DROP CONSTRAINT IF EXISTS banned_users_banned_by_fkey;

ALTER TABLE public.banned_users_deprecated
  ADD CONSTRAINT banned_users_deprecated_banned_by_fkey 
  FOREIGN KEY (banned_by) 
  REFERENCES public.users(id) ON DELETE SET NULL;

-- Step 12: posts.user_id (legacy forum)
ALTER TABLE public.posts 
  DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) ON DELETE CASCADE;

-- Step 13: threads.user_id (legacy forum)
ALTER TABLE public.threads 
  DROP CONSTRAINT IF EXISTS threads_user_id_fkey;

ALTER TABLE public.threads
  ADD CONSTRAINT threads_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) ON DELETE CASCADE;

-- Step 14: forum_posts.author_id (modern forum)
ALTER TABLE public.forum_posts 
  DROP CONSTRAINT IF EXISTS fk_forum_posts_author;

ALTER TABLE public.forum_posts
  ADD CONSTRAINT forum_posts_author_id_fkey 
  FOREIGN KEY (author_id) 
  REFERENCES public.users(id) ON DELETE CASCADE;

-- Step 15: forum_comments.author_id (modern forum)
ALTER TABLE public.forum_comments 
  DROP CONSTRAINT IF EXISTS fk_forum_comments_author;

ALTER TABLE public.forum_comments
  ADD CONSTRAINT forum_comments_author_id_fkey 
  FOREIGN KEY (author_id) 
  REFERENCES public.users(id) ON DELETE CASCADE;

-- ============================================================================
-- PART 4: DROP LEGACY FORUM TABLES
-- ============================================================================

-- Rename legacy tables (don't drop yet, keep as backup)
ALTER TABLE public.forums RENAME TO forums_deprecated;
ALTER TABLE public.threads RENAME TO threads_deprecated;
ALTER TABLE public.posts RENAME TO posts_deprecated;
ALTER TABLE public.forum_threads RENAME TO forum_threads_deprecated;
ALTER TABLE public.forum_replies RENAME TO forum_replies_deprecated;

-- Add comments
COMMENT ON TABLE public.forums_deprecated IS 'DEPRECATED: Use forum_categories instead. Safe to drop after verification.';
COMMENT ON TABLE public.threads_deprecated IS 'DEPRECATED: Use forum_posts instead. Safe to drop after verification.';
COMMENT ON TABLE public.posts_deprecated IS 'DEPRECATED: Use forum_comments instead. Safe to drop after verification.';
COMMENT ON TABLE public.forum_threads_deprecated IS 'DEPRECATED: Use forum_posts instead. Safe to drop after verification.';
COMMENT ON TABLE public.forum_replies_deprecated IS 'DEPRECATED: Use forum_comments instead. Safe to drop after verification.';

-- ============================================================================
-- PART 5: CREATE TRIGGER TO AUTO-CREATE public.users ON AUTH SIGNUP
-- ============================================================================

-- This ensures public.users.id always matches auth.users.id

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    gamer_tag_id,
    primary_position,
    console,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'gamer_tag_id', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'primary_position', 'ST'),
    COALESCE(NEW.raw_user_meta_data->>'console', 'PS5'),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PART 6: VERIFICATION QUERIES
-- ============================================================================

-- Run these after migration to verify success

-- Check for orphaned auth users (should be 0)
SELECT COUNT(*) as orphaned_auth_users
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- Check for users with roles in both systems
SELECT 
  u.gamer_tag_id,
  p.role as player_role,
  array_agg(r.name) as user_roles
FROM public.users u
LEFT JOIN public.players p ON p.user_id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.roles r ON r.id = ur.role_id
WHERE p.role IS NOT NULL OR ur.id IS NOT NULL
GROUP BY u.id, u.gamer_tag_id, p.role;

-- Check for banned users in both systems (should be 0 after migration)
SELECT COUNT(*) as dual_ban_records
FROM public.users u
INNER JOIN public.banned_users_deprecated bu ON bu.user_id = u.id
WHERE u.is_banned = true;

-- List all foreign keys still pointing to auth.users (should be 0)
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'users'
  AND ccu.table_schema = 'auth';

-- ============================================================================
-- PART 7: CLEANUP (RUN AFTER VERIFICATION)
-- ============================================================================

-- Only run these after verifying migration was successful!

-- DROP TABLE public.banned_users_deprecated CASCADE;
-- DROP TABLE public.forums_deprecated CASCADE;
-- DROP TABLE public.threads_deprecated CASCADE;
-- DROP TABLE public.posts_deprecated CASCADE;
-- DROP TABLE public.forum_threads_deprecated CASCADE;
-- DROP TABLE public.forum_replies_deprecated CASCADE;

-- Optionally remove players.role column (after confirming user_roles works)
-- ALTER TABLE public.players DROP COLUMN role;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Summary of changes:
-- 1. ✅ Migrated player roles to user_roles table
-- 2. ✅ Migrated bans to users table columns
-- 3. ✅ Updated all foreign keys to reference public.users.id
-- 4. ✅ Deprecated legacy forum tables
-- 5. ✅ Created trigger to auto-sync auth.users → public.users
-- 6. ✅ Added verification queries
