-- Complete System Rebuild for FIFA 26 Website
-- This script will recreate all core systems from scratch

-- ==============================================
-- 1. CLEANUP EXISTING DATA (CAREFUL!)
-- ==============================================

-- Backup existing data first (optional)
-- CREATE TABLE teams_backup AS SELECT * FROM teams;
-- CREATE TABLE matches_backup AS SELECT * FROM matches;
-- CREATE TABLE conferences_backup AS SELECT * FROM conferences;

-- Clean up existing data (handle foreign key constraints)
-- First, remove foreign key references
UPDATE players SET team_id = NULL WHERE team_id IS NOT NULL;
DELETE FROM player_transfer_offers;
DELETE FROM player_signings;
DELETE FROM player_transfers;
DELETE FROM matches;
DELETE FROM teams;
DELETE FROM conferences;

-- ==============================================
-- 2. RECREATE CONFERENCES
-- ==============================================

-- Drop and recreate conferences table
DROP TABLE IF EXISTS conferences CASCADE;

CREATE TABLE conferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Conferences are viewable by everyone" ON conferences
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify conferences" ON conferences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'Admin'
    )
  );

-- Insert default conferences
INSERT INTO conferences (name, description, color) VALUES
('Eastern Conference', 'Teams from the eastern region', '#3B82F6'),
('Western Conference', 'Teams from the western region', '#EF4444');

-- ==============================================
-- 3. RECREATE TEAMS WITH PROPER STRUCTURE
-- ==============================================

-- Drop and recreate teams table
DROP TABLE IF EXISTS teams CASCADE;

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  logo_url TEXT,
  conference_id UUID REFERENCES conferences(id),
  division VARCHAR(100) DEFAULT 'Premier Division',
  is_active BOOLEAN DEFAULT true,
  
  -- Stats columns
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  otl INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  
  -- Additional stats
  powerplay_goals INTEGER DEFAULT 0,
  powerplay_opportunities INTEGER DEFAULT 0,
  penalty_kill_goals_against INTEGER DEFAULT 0,
  penalty_kill_opportunities INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teams are viewable by everyone" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify teams" ON teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'Admin'
    )
  );

-- Insert FIFA 26 teams with proper conference assignments
INSERT INTO teams (name, conference_id, division) VALUES
-- Eastern Conference Teams
('Manchester City', (SELECT id FROM conferences WHERE name = 'Eastern Conference'), 'Premier Division'),
('Liverpool', (SELECT id FROM conferences WHERE name = 'Eastern Conference'), 'Premier Division'),
('Chelsea', (SELECT id FROM conferences WHERE name = 'Eastern Conference'), 'Premier Division'),
('Arsenal', (SELECT id FROM conferences WHERE name = 'Eastern Conference'), 'Premier Division'),
('Tottenham', (SELECT id FROM conferences WHERE name = 'Eastern Conference'), 'Premier Division'),
('Newcastle', (SELECT id FROM conferences WHERE name = 'Eastern Conference'), 'Premier Division'),
('Brighton', (SELECT id FROM conferences WHERE name = 'Eastern Conference'), 'Premier Division'),
('West Ham', (SELECT id FROM conferences WHERE name = 'Eastern Conference'), 'Premier Division'),
('Aston Villa', (SELECT id FROM conferences WHERE name = 'Eastern Conference'), 'Premier Division'),
('Crystal Palace', (SELECT id FROM conferences WHERE name = 'Eastern Conference'), 'Premier Division'),

-- Western Conference Teams
('Real Madrid', (SELECT id FROM conferences WHERE name = 'Western Conference'), 'Premier Division'),
('Barcelona', (SELECT id FROM conferences WHERE name = 'Western Conference'), 'Premier Division'),
('Atletico Madrid', (SELECT id FROM conferences WHERE name = 'Western Conference'), 'Premier Division'),
('Bayern Munich', (SELECT id FROM conferences WHERE name = 'Western Conference'), 'Premier Division'),
('Borussia Dortmund', (SELECT id FROM conferences WHERE name = 'Western Conference'), 'Premier Division'),
('Paris Saint-Germain', (SELECT id FROM conferences WHERE name = 'Western Conference'), 'Premier Division'),
('Juventus', (SELECT id FROM conferences WHERE name = 'Western Conference'), 'Premier Division'),
('AC Milan', (SELECT id FROM conferences WHERE name = 'Western Conference'), 'Premier Division'),
('Inter Milan', (SELECT id FROM conferences WHERE name = 'Western Conference'), 'Premier Division'),
('Napoli', (SELECT id FROM conferences WHERE name = 'Western Conference'), 'Premier Division');

-- Reassign players to new teams (optional - you may want to do this manually)
-- This will randomly assign players to teams, you might want to customize this
UPDATE players SET team_id = (
  SELECT id FROM teams 
  WHERE is_active = true 
  ORDER BY RANDOM() 
  LIMIT 1
) WHERE team_id IS NULL;

-- ==============================================
-- 4. RECREATE MATCHES SYSTEM
-- ==============================================

-- Drop and recreate matches table
DROP TABLE IF EXISTS matches CASCADE;

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  season_id UUID REFERENCES seasons(id),
  
  -- Match details
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'scheduled',
  
  -- Additional match data
  match_date TIMESTAMP WITH TIME ZONE,
  venue VARCHAR(255),
  attendance INTEGER,
  referee VARCHAR(255),
  
  -- Overtime/Shootout
  overtime BOOLEAN DEFAULT false,
  has_overtime BOOLEAN DEFAULT false,
  has_shootout BOOLEAN DEFAULT false,
  
  -- EA Sports integration
  ea_match_id VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Matches are viewable by everyone" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify matches" ON matches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'Admin'
    )
  );

-- ==============================================
-- 5. RECREATE TRANSFER SYSTEM
-- ==============================================

-- Drop and recreate transfer tables
DROP TABLE IF EXISTS player_transfer_offers CASCADE;
DROP TABLE IF EXISTS player_signings CASCADE;
DROP TABLE IF EXISTS player_transfers CASCADE;

-- Transfer offers table
CREATE TABLE player_transfer_offers (
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

-- Direct signings table
CREATE TABLE player_signings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id),
  team_id UUID REFERENCES teams(id),
  signing_amount DECIMAL(10,2),
  contract_length INTEGER,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Completed transfers table
CREATE TABLE player_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id),
  from_team_id UUID REFERENCES teams(id),
  to_team_id UUID REFERENCES teams(id),
  transfer_amount DECIMAL(10,2),
  transfer_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on transfer tables
ALTER TABLE player_transfer_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_signings ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_transfers ENABLE ROW LEVEL SECURITY;

-- Create policies for transfer tables
CREATE POLICY "Transfer offers are viewable by team managers" ON player_transfer_offers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('Admin', 'Team Manager')
    )
  );

CREATE POLICY "Signings are viewable by team managers" ON player_signings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('Admin', 'Team Manager')
    )
  );

CREATE POLICY "Transfers are viewable by everyone" ON player_transfers
  FOR SELECT USING (true);

-- ==============================================
-- 6. RECREATE SYSTEM SETTINGS
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
-- 8. CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- ==============================================

-- Function to update team stats from matches
CREATE OR REPLACE FUNCTION update_team_stats_from_matches()
RETURNS TRIGGER AS $$
DECLARE
  current_season_id UUID;
BEGIN
  -- Get current active season
  SELECT id INTO current_season_id FROM seasons WHERE is_active = true;
  
  -- Update stats for both teams when match is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Update home team stats
    UPDATE teams SET
      wins = (
        SELECT COUNT(*)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND home_team_id = NEW.home_team_id
          AND home_score > away_score
      ) + (
        SELECT COUNT(*)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND away_team_id = NEW.home_team_id
          AND away_score > home_score
      ),
      losses = (
        SELECT COUNT(*)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND home_team_id = NEW.home_team_id
          AND home_score < away_score
      ) + (
        SELECT COUNT(*)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND away_team_id = NEW.home_team_id
          AND away_score < home_score
      ),
      otl = (
        SELECT COUNT(*)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND home_team_id = NEW.home_team_id
          AND home_score = away_score
      ) + (
        SELECT COUNT(*)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND away_team_id = NEW.home_team_id
          AND away_score = home_score
      ),
      goals_for = (
        SELECT COALESCE(SUM(home_score), 0)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND home_team_id = NEW.home_team_id
      ) + (
        SELECT COALESCE(SUM(away_score), 0)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND away_team_id = NEW.home_team_id
      ),
      goals_against = (
        SELECT COALESCE(SUM(away_score), 0)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND home_team_id = NEW.home_team_id
      ) + (
        SELECT COALESCE(SUM(home_score), 0)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND away_team_id = NEW.home_team_id
      ),
      updated_at = NOW()
    WHERE id = NEW.home_team_id;
    
    -- Update away team stats (similar logic)
    UPDATE teams SET
      wins = (
        SELECT COUNT(*)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND home_team_id = NEW.away_team_id
          AND home_score > away_score
      ) + (
        SELECT COUNT(*)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND away_team_id = NEW.away_team_id
          AND away_score > home_score
      ),
      losses = (
        SELECT COUNT(*)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND home_team_id = NEW.away_team_id
          AND home_score < away_score
      ) + (
        SELECT COUNT(*)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND away_team_id = NEW.away_team_id
          AND away_score < home_score
      ),
      otl = (
        SELECT COUNT(*)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND home_team_id = NEW.away_team_id
          AND home_score = away_score
      ) + (
        SELECT COUNT(*)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND away_team_id = NEW.away_team_id
          AND away_score = home_score
      ),
      goals_for = (
        SELECT COALESCE(SUM(home_score), 0)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND home_team_id = NEW.away_team_id
      ) + (
        SELECT COALESCE(SUM(away_score), 0)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND away_team_id = NEW.away_team_id
      ),
      goals_against = (
        SELECT COALESCE(SUM(away_score), 0)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND home_team_id = NEW.away_team_id
      ) + (
        SELECT COALESCE(SUM(home_score), 0)
        FROM matches 
        WHERE season_id = current_season_id
          AND status = 'completed'
          AND away_team_id = NEW.away_team_id
      ),
      updated_at = NOW()
    WHERE id = NEW.away_team_id;
    
    -- Update points and games_played for both teams
    UPDATE teams SET
      points = (wins * 3) + (otl * 1),
      games_played = wins + losses + otl
    WHERE id IN (NEW.home_team_id, NEW.away_team_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_team_stats_trigger ON matches;
CREATE TRIGGER update_team_stats_trigger
  AFTER INSERT OR UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_team_stats_from_matches();

-- ==============================================
-- 9. VERIFY THE REBUILD
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
  c.color as conference_color
FROM teams t
LEFT JOIN conferences c ON t.conference_id = c.id
WHERE t.is_active = true
ORDER BY c.name, t.name;

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
