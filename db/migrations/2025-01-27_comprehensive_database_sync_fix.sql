-- Comprehensive Database Sync and Fix Script
-- This script addresses all database sync issues, user constraints, console values, role sync, and structure fixes

-- ==============================================
-- 1. FIX USER CONSTRAINTS AND VALIDATION
-- ==============================================

-- Add missing constraints to users table
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_gamer_tag_length CHECK (LENGTH(gamer_tag) >= 2 AND LENGTH(gamer_tag) <= 50);
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_console_check CHECK (console IN ('PS5', 'Xbox', 'PC'));

-- Add missing columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS gamer_tag_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_username VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMPTZ;

-- ==============================================
-- 2. FIX CONSOLE VALUES AND VALIDATION
-- ==============================================

-- Update existing console values to match new constraints
UPDATE users SET console = 'PS5' WHERE console IN ('PlayStation 5', 'PS5', 'PlayStation');
UPDATE users SET console = 'Xbox' WHERE console IN ('Xbox Series X', 'Xbox', 'Xbox One', 'Xbox Series S');
UPDATE users SET console = 'PC' WHERE console IN ('PC', 'Steam', 'Epic Games');

-- Set default console for users without one
UPDATE users SET console = 'PS5' WHERE console IS NULL OR console = '';

-- ==============================================
-- 3. FIX ROLE SYNC SYSTEM
-- ==============================================

-- Ensure user_roles table exists with proper structure
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Add role constraints
ALTER TABLE user_roles ADD CONSTRAINT IF NOT EXISTS user_roles_role_check 
CHECK (role IN ('Admin', 'Player', 'GM', 'AGM', 'Moderator'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- ==============================================
-- 4. SYNC MISSING USERS FROM AUTH TO DATABASE
-- ==============================================

-- Create function to sync users from auth to public.users
CREATE OR REPLACE FUNCTION sync_auth_users_to_public()
RETURNS TABLE(synced_count INTEGER, error_count INTEGER) AS $$
DECLARE
  auth_user RECORD;
  synced_count INTEGER := 0;
  error_count INTEGER := 0;
BEGIN
  -- Loop through all auth users
  FOR auth_user IN 
    SELECT 
      id,
      email,
      raw_user_meta_data,
      created_at,
      email_confirmed_at,
      last_sign_in_at
    FROM auth.users
  LOOP
    BEGIN
      -- Check if user exists in public.users
      IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth_user.id) THEN
        -- Insert user into public.users
        INSERT INTO users (
          id,
          email,
          gamer_tag,
          gamer_tag_id,
          discord_id,
          discord_username,
          primary_position,
          secondary_position,
          console,
          is_active,
          is_banned,
          created_at,
          email_confirmed_at,
          last_sign_in_at
        ) VALUES (
          auth_user.id,
          auth_user.email,
          COALESCE((auth_user.raw_user_meta_data->>'gamer_tag')::TEXT, ''),
          COALESCE((auth_user.raw_user_meta_data->>'gamer_tag_id')::TEXT, ''),
          COALESCE((auth_user.raw_user_meta_data->>'discord_id')::TEXT, ''),
          COALESCE((auth_user.raw_user_meta_data->>'discord_username')::TEXT, ''),
          COALESCE((auth_user.raw_user_meta_data->>'primary_position')::TEXT, ''),
          COALESCE((auth_user.raw_user_meta_data->>'secondary_position')::TEXT, ''),
          COALESCE((auth_user.raw_user_meta_data->>'console')::TEXT, 'PS5'),
          true,
          false,
          auth_user.created_at,
          auth_user.email_confirmed_at,
          auth_user.last_sign_in_at
        );
        
        -- Create default player role
        INSERT INTO user_roles (user_id, role) VALUES (auth_user.id, 'Player');
        
        synced_count := synced_count + 1;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        error_count := error_count + 1;
        RAISE WARNING 'Failed to sync user %: %', auth_user.id, SQLERRM;
    END;
  END LOOP;
  
  RETURN QUERY SELECT synced_count, error_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 5. FIX SEASON SYSTEM SETTINGS
-- ==============================================

-- Ensure system_settings table exists
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default season settings
INSERT INTO system_settings (key, value, description) VALUES
('current_season', '1'::jsonb, 'Current active season number'),
('registration_open', 'true'::jsonb, 'Whether registration is currently open'),
('season_start_date', '2025-02-01'::jsonb, 'Start date of current season'),
('season_end_date', '2025-05-31'::jsonb, 'End date of current season'),
('max_players_per_club', '25'::jsonb, 'Maximum players allowed per club'),
('min_players_per_club', '15'::jsonb, 'Minimum players required per club')
ON CONFLICT (key) DO NOTHING;

-- ==============================================
-- 6. FIX CLUBS TABLE STRUCTURE
-- ==============================================

-- Ensure clubs table has all required columns
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS short_name VARCHAR(50);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS founded_year INTEGER;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS home_stadium VARCHAR(255);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}';
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}';
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{
  "monday": true,
  "tuesday": true,
  "wednesday": true,
  "thursday": true,
  "friday": true,
  "saturday": true,
  "sunday": false,
  "preferred_times": ["20:30", "21:10", "21:50"],
  "timezone": "EST"
}';

-- ==============================================
-- 7. FIX SEASON REGISTRATIONS
-- ==============================================

-- Ensure season_registrations table exists with proper structure
CREATE TABLE IF NOT EXISTS season_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  primary_position VARCHAR(50) NOT NULL,
  secondary_position VARCHAR(50),
  gamer_tag VARCHAR(50) NOT NULL,
  console VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, season_number)
);

-- Add constraints
ALTER TABLE season_registrations ADD CONSTRAINT IF NOT EXISTS season_registrations_console_check 
CHECK (console IN ('PS5', 'Xbox', 'PC'));
ALTER TABLE season_registrations ADD CONSTRAINT IF NOT EXISTS season_registrations_status_check 
CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled'));

-- ==============================================
-- 8. CREATE SCHEDULE MANAGEMENT TABLES
-- ==============================================

-- Create games table for schedule management
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  away_club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'Scheduled',
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  venue VARCHAR(255),
  referee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints
ALTER TABLE games ADD CONSTRAINT IF NOT EXISTS games_status_check 
CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Postponed'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_games_scheduled_time ON games(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_games_home_club ON games(home_club_id);
CREATE INDEX IF NOT EXISTS idx_games_away_club ON games(away_club_id);

-- ==============================================
-- 9. CREATE USER AVAILABILITY SYSTEM
-- ==============================================

-- Create user_availability table
CREATE TABLE IF NOT EXISTS user_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monday BOOLEAN DEFAULT true,
  tuesday BOOLEAN DEFAULT true,
  wednesday BOOLEAN DEFAULT true,
  thursday BOOLEAN DEFAULT true,
  friday BOOLEAN DEFAULT true,
  saturday BOOLEAN DEFAULT true,
  sunday BOOLEAN DEFAULT false,
  preferred_times TEXT[] DEFAULT ARRAY['20:30', '21:10', '21:50'],
  timezone VARCHAR(10) DEFAULT 'EST',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ==============================================
-- 10. FIX RLS POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_availability ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'Admin'
    )
  );

-- Create policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'Admin'
    )
  );

-- ==============================================
-- 11. CREATE SYNC FUNCTIONS
-- ==============================================

-- Function to sync user data from auth to public
CREATE OR REPLACE FUNCTION sync_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert user data
  INSERT INTO users (
    id,
    email,
    gamer_tag,
    gamer_tag_id,
    discord_id,
    discord_username,
    primary_position,
    secondary_position,
    console,
    is_active,
    created_at,
    email_confirmed_at,
    last_sign_in_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'gamer_tag')::TEXT, ''),
    COALESCE((NEW.raw_user_meta_data->>'gamer_tag_id')::TEXT, ''),
    COALESCE((NEW.raw_user_meta_data->>'discord_id')::TEXT, ''),
    COALESCE((NEW.raw_user_meta_data->>'discord_username')::TEXT, ''),
    COALESCE((NEW.raw_user_meta_data->>'primary_position')::TEXT, ''),
    COALESCE((NEW.raw_user_meta_data->>'secondary_position')::TEXT, ''),
    COALESCE((NEW.raw_user_meta_data->>'console')::TEXT, 'PS5'),
    true,
    NEW.created_at,
    NEW.email_confirmed_at,
    NEW.last_sign_in_at
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    gamer_tag = EXCLUDED.gamer_tag,
    gamer_tag_id = EXCLUDED.gamer_tag_id,
    discord_id = EXCLUDED.discord_id,
    discord_username = EXCLUDED.discord_username,
    primary_position = EXCLUDED.primary_position,
    secondary_position = EXCLUDED.secondary_position,
    console = EXCLUDED.console,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    last_sign_in_at = EXCLUDED.last_sign_in_at,
    updated_at = NOW();
  
  -- Ensure user has a role
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = NEW.id) THEN
    INSERT INTO user_roles (user_id, role) VALUES (NEW.id, 'Player');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user sync
DROP TRIGGER IF EXISTS sync_user_trigger ON auth.users;
CREATE TRIGGER sync_user_trigger
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_data();

-- ==============================================
-- 12. RUN INITIAL SYNC
-- ==============================================

-- Sync all existing auth users
SELECT * FROM sync_auth_users_to_public();

-- ==============================================
-- 13. VERIFICATION QUERIES
-- ==============================================

-- Check sync results
SELECT 
  'Users in auth.users' as table_name,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Users in public.users' as table_name,
  COUNT(*) as count
FROM users
UNION ALL
SELECT 
  'User roles' as table_name,
  COUNT(*) as count
FROM user_roles
UNION ALL
SELECT 
  'Season registrations' as table_name,
  COUNT(*) as count
FROM season_registrations
UNION ALL
SELECT 
  'Clubs' as table_name,
  COUNT(*) as count
FROM clubs;

-- Check for missing users
SELECT 
  'Missing users' as issue,
  COUNT(*) as count
FROM auth.users a
LEFT JOIN users u ON a.id = u.id
WHERE u.id IS NULL;

-- Check console values
SELECT 
  console,
  COUNT(*) as count
FROM users
GROUP BY console
ORDER BY count DESC;

-- Check role distribution
SELECT 
  role,
  COUNT(*) as count
FROM user_roles
GROUP BY role
ORDER BY count DESC;
