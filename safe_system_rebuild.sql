-- Safe System Rebuild for FIFA 26 Website
-- This script will update existing data instead of deleting everything

-- ==============================================
-- 1. UPDATE EXISTING CONFERENCES
-- ==============================================

-- Update existing conferences or create new ones
INSERT INTO conferences (name, description, color) VALUES
('Eastern Conference', 'Teams from the eastern region', '#3B82F6'),
('Western Conference', 'Teams from the western region', '#EF4444')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  updated_at = NOW();

-- ==============================================
-- 2. UPDATE EXISTING TEAMS WITH CONFERENCES
-- ==============================================

-- Update teams to have proper conference assignments
-- Eastern Conference Teams
UPDATE teams SET 
  conference_id = (SELECT id FROM conferences WHERE name = 'Eastern Conference'),
  division = 'Premier Division',
  updated_at = NOW()
WHERE name IN (
  'Manchester City', 'Liverpool', 'Chelsea', 'Arsenal', 'Tottenham',
  'Newcastle', 'Brighton', 'West Ham', 'Aston Villa', 'Crystal Palace'
);

-- Western Conference Teams  
UPDATE teams SET 
  conference_id = (SELECT id FROM conferences WHERE name = 'Western Conference'),
  division = 'Premier Division',
  updated_at = NOW()
WHERE name IN (
  'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Bayern Munich', 'Borussia Dortmund',
  'Paris Saint-Germain', 'Juventus', 'AC Milan', 'Inter Milan', 'Napoli'
);

-- ==============================================
-- 3. ENSURE PROPER TABLE STRUCTURE
-- ==============================================

-- Add missing columns to teams table if they don't exist
DO $$ 
BEGIN
  -- Add conference_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'teams' AND column_name = 'conference_id') THEN
    ALTER TABLE teams ADD COLUMN conference_id UUID REFERENCES conferences(id);
  END IF;
  
  -- Add division if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'teams' AND column_name = 'division') THEN
    ALTER TABLE teams ADD COLUMN division VARCHAR(100) DEFAULT 'Premier Division';
  END IF;
  
  -- Add stats columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'teams' AND column_name = 'wins') THEN
    ALTER TABLE teams ADD COLUMN wins INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'teams' AND column_name = 'losses') THEN
    ALTER TABLE teams ADD COLUMN losses INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'teams' AND column_name = 'otl') THEN
    ALTER TABLE teams ADD COLUMN otl INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'teams' AND column_name = 'points') THEN
    ALTER TABLE teams ADD COLUMN points INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'teams' AND column_name = 'goals_for') THEN
    ALTER TABLE teams ADD COLUMN goals_for INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'teams' AND column_name = 'goals_against') THEN
    ALTER TABLE teams ADD COLUMN goals_against INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'teams' AND column_name = 'games_played') THEN
    ALTER TABLE teams ADD COLUMN games_played INTEGER DEFAULT 0;
  END IF;
END $$;

-- ==============================================
-- 4. ENSURE PROPER MATCHES STRUCTURE
-- ==============================================

-- Add missing columns to matches table if they don't exist
DO $$ 
BEGIN
  -- Add season_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'matches' AND column_name = 'season_id') THEN
    ALTER TABLE matches ADD COLUMN season_id UUID REFERENCES seasons(id);
  END IF;
  
  -- Add match_date if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'matches' AND column_name = 'match_date') THEN
    ALTER TABLE matches ADD COLUMN match_date TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add venue if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'matches' AND column_name = 'venue') THEN
    ALTER TABLE matches ADD COLUMN venue VARCHAR(255);
  END IF;
  
  -- Add attendance if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'matches' AND column_name = 'attendance') THEN
    ALTER TABLE matches ADD COLUMN attendance INTEGER;
  END IF;
  
  -- Add referee if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'matches' AND column_name = 'referee') THEN
    ALTER TABLE matches ADD COLUMN referee VARCHAR(255);
  END IF;
  
  -- Add overtime columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'matches' AND column_name = 'overtime') THEN
    ALTER TABLE matches ADD COLUMN overtime BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'matches' AND column_name = 'has_overtime') THEN
    ALTER TABLE matches ADD COLUMN has_overtime BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'matches' AND column_name = 'has_shootout') THEN
    ALTER TABLE matches ADD COLUMN has_shootout BOOLEAN DEFAULT false;
  END IF;
  
  -- Add EA match ID if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'matches' AND column_name = 'ea_match_id') THEN
    ALTER TABLE matches ADD COLUMN ea_match_id VARCHAR(255);
  END IF;
END $$;

-- ==============================================
-- 5. ENSURE TRANSFER TABLES EXIST
-- ==============================================

-- Create transfer tables if they don't exist
CREATE TABLE IF NOT EXISTS player_transfer_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id),
  from_team_id UUID REFERENCES teams(id),
  to_team_id UUID REFERENCES teams(id),
  offer_amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing transfer_offers table if it exists
DO $$ 
BEGIN
  -- Add expires_at if it doesn't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'player_transfer_offers') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_transfer_offers' AND column_name = 'expires_at') THEN
      ALTER TABLE player_transfer_offers ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add other missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_transfer_offers' AND column_name = 'offer_amount') THEN
      ALTER TABLE player_transfer_offers ADD COLUMN offer_amount DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_transfer_offers' AND column_name = 'status') THEN
      ALTER TABLE player_transfer_offers ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_transfer_offers' AND column_name = 'created_at') THEN
      ALTER TABLE player_transfer_offers ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_transfer_offers' AND column_name = 'updated_at') THEN
      ALTER TABLE player_transfer_offers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS player_signings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id),
  team_id UUID REFERENCES teams(id),
  signing_amount DECIMAL(10,2),
  contract_length INTEGER,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id),
  from_team_id UUID REFERENCES teams(id),
  to_team_id UUID REFERENCES teams(id),
  transfer_amount DECIMAL(10,2),
  transfer_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing transfer tables if they exist
DO $$ 
BEGIN
  -- Check player_signings table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'player_signings') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_signings' AND column_name = 'signing_amount') THEN
      ALTER TABLE player_signings ADD COLUMN signing_amount DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_signings' AND column_name = 'contract_length') THEN
      ALTER TABLE player_signings ADD COLUMN contract_length INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_signings' AND column_name = 'status') THEN
      ALTER TABLE player_signings ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_signings' AND column_name = 'created_at') THEN
      ALTER TABLE player_signings ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_signings' AND column_name = 'updated_at') THEN
      ALTER TABLE player_signings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
  
  -- Check player_transfers table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'player_transfers') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_transfers' AND column_name = 'transfer_amount') THEN
      ALTER TABLE player_transfers ADD COLUMN transfer_amount DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_transfers' AND column_name = 'transfer_date') THEN
      ALTER TABLE player_transfers ADD COLUMN transfer_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_transfers' AND column_name = 'created_at') THEN
      ALTER TABLE player_transfers ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  END IF;
END $$;

-- ==============================================
-- 6. UPDATE SYSTEM SETTINGS
-- ==============================================

-- Update system settings for new system
INSERT INTO system_settings (key, value) VALUES
('transfer_market_enabled', 'true'::jsonb),
('signing_market_enabled', 'true'::jsonb),
('transfer_offer_duration_hours', '168'::jsonb), -- 7 days
('max_transfer_offers_per_player', '5'::jsonb),
('transfer_recap_enabled', 'true'::jsonb),
('daily_recap_enabled', 'true'::jsonb),
('forum_enabled', 'true'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ==============================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ==============================================

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_conference ON teams(conference_id);
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_teams_points ON teams(points DESC);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_season ON matches(season_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);

-- Transfer indexes
CREATE INDEX IF NOT EXISTS idx_transfer_offers_player ON player_transfer_offers(player_id);
CREATE INDEX IF NOT EXISTS idx_transfer_offers_status ON player_transfer_offers(status);
CREATE INDEX IF NOT EXISTS idx_transfer_offers_expires ON player_transfer_offers(expires_at);

-- ==============================================
-- 8. VERIFY THE REBUILD
-- ==============================================

-- Show conferences
SELECT 'CONFERENCES' as section;
SELECT id, name, color, is_active FROM conferences ORDER BY name;

-- Show teams with conference info
SELECT 'TEAMS WITH CONFERENCES' as section;
SELECT 
  t.id,
  t.name,
  t.division,
  c.name as conference_name,
  c.color as conference_color,
  t.wins,
  t.losses,
  t.otl,
  t.points
FROM teams t
LEFT JOIN conferences c ON t.conference_id = c.id
WHERE t.is_active = true
ORDER BY c.name, t.points DESC;

-- Show system settings
SELECT 'SYSTEM SETTINGS' as section;
SELECT key, value FROM system_settings WHERE key LIKE '%transfer%' OR key LIKE '%signing%' OR key LIKE '%recap%' OR key LIKE '%forum%';

-- Show table counts
SELECT 'TABLE COUNTS' as section;
SELECT 
  'conferences' as table_name, COUNT(*) as count FROM conferences
UNION ALL
SELECT 
  'teams' as table_name, COUNT(*) as count FROM teams
UNION ALL
SELECT 
  'matches' as table_name, COUNT(*) as count FROM matches
UNION ALL
SELECT 
  'player_transfer_offers' as table_name, COUNT(*) as count FROM player_transfer_offers
UNION ALL
SELECT 
  'player_signings' as table_name, COUNT(*) as count FROM player_signings
UNION ALL
SELECT 
  'player_transfers' as table_name, COUNT(*) as count FROM player_transfers;
