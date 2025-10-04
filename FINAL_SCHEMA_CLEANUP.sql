-- ============================================================================
-- FINAL SCHEMA CLEANUP
-- Fix remaining auth.users references
-- Date: October 4, 2025
-- ============================================================================

-- Fix game_availability.user_id
-- Clean orphaned records first
DELETE FROM public.game_availability
WHERE user_id NOT IN (SELECT id FROM public.users);

-- Update constraint
ALTER TABLE public.game_availability 
  DROP CONSTRAINT IF EXISTS game_availability_user_id_fkey;

ALTER TABLE public.game_availability
  ADD CONSTRAINT game_availability_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) ON DELETE CASCADE;

-- Fix injury_reserves.user_id
-- Clean orphaned records first
DELETE FROM public.injury_reserves
WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM public.users);

-- Update constraint
ALTER TABLE public.injury_reserves 
  DROP CONSTRAINT IF EXISTS injury_reserves_user_id_fkey;

ALTER TABLE public.injury_reserves
  ADD CONSTRAINT injury_reserves_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) ON DELETE SET NULL;

-- ============================================================================
-- VERIFICATION: Check for any remaining auth.users references
-- ============================================================================

SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_schema || '.' || ccu.table_name AS foreign_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'users'
  AND ccu.table_schema = 'auth'
  AND tc.table_schema = 'public';

-- Should return 0 rows after this cleanup
