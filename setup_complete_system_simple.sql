-- FIFA 26 League - Complete System Setup (Simplified)
-- This script sets up the complete division management, transfer, and signing system

-- ============================================================================
-- 1. DIVISION MANAGEMENT SYSTEM
-- ============================================================================

-- Add division column to teams table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'teams' AND column_name = 'division') THEN
        ALTER TABLE teams ADD COLUMN division VARCHAR(50);
    END IF;
END $$;

-- Create divisions table for better organization
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    tier INTEGER NOT NULL, -- 1 = Premier, 2 = Championship, 3 = League One
    color VARCHAR(7) NOT NULL, -- Hex color code
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the 3 divisions
INSERT INTO divisions (name, tier, color, description) VALUES
('Premier Division', 1, '#16a34a', 'Top tier division - highest level of competition'),
('Championship Division', 2, '#f59e0b', 'Second tier division - promotion/relegation with Premier'),
('League One', 3, '#f97316', 'Third tier division - promotion/relegation with Championship')
ON CONFLICT (name) DO UPDATE SET
    tier = EXCLUDED.tier,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- 2. TRANSFER AND SIGNING SYSTEM
-- ============================================================================

-- Create player_transfer_offers table for transfer offers
CREATE TABLE IF NOT EXISTS player_transfer_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL,
    team_id UUID NOT NULL,
    offer_amount INTEGER NOT NULL CHECK (offer_amount > 0),
    offer_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'accepted', 'rejected', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create player_signings table for direct signings
CREATE TABLE IF NOT EXISTS player_signings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL,
    team_id UUID NOT NULL,
    salary INTEGER NOT NULL CHECK (salary > 0),
    contract_length INTEGER NOT NULL DEFAULT 1 CHECK (contract_length > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create player_transfers table (replaces old player_bidding)
CREATE TABLE IF NOT EXISTS player_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL,
    team_id UUID NOT NULL,
    transfer_amount INTEGER NOT NULL CHECK (transfer_amount > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired', 'manually_assigned')),
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Division indexes
CREATE INDEX IF NOT EXISTS idx_teams_division ON teams(division);
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_divisions_tier ON divisions(tier);
CREATE INDEX IF NOT EXISTS idx_divisions_name ON divisions(name);

-- Transfer/Signing indexes
CREATE INDEX IF NOT EXISTS idx_player_transfer_offers_player_id ON player_transfer_offers(player_id);
CREATE INDEX IF NOT EXISTS idx_player_transfer_offers_team_id ON player_transfer_offers(team_id);
CREATE INDEX IF NOT EXISTS idx_player_transfer_offers_status ON player_transfer_offers(status);
CREATE INDEX IF NOT EXISTS idx_player_transfer_offers_expires_at ON player_transfer_offers(offer_expires_at);

CREATE INDEX IF NOT EXISTS idx_player_signings_player_id ON player_signings(player_id);
CREATE INDEX IF NOT EXISTS idx_player_signings_team_id ON player_signings(team_id);
CREATE INDEX IF NOT EXISTS idx_player_signings_status ON player_signings(status);

CREATE INDEX IF NOT EXISTS idx_player_transfers_player_id ON player_transfers(player_id);
CREATE INDEX IF NOT EXISTS idx_player_transfers_team_id ON player_transfers(team_id);
CREATE INDEX IF NOT EXISTS idx_player_transfers_status ON player_transfers(status);

-- ============================================================================
-- 4. TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_divisions_updated_at 
    BEFORE UPDATE ON divisions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_transfer_offers_updated_at 
    BEFORE UPDATE ON player_transfer_offers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_signings_updated_at 
    BEFORE UPDATE ON player_signings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_transfers_updated_at 
    BEFORE UPDATE ON player_transfers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. SYSTEM SETTINGS
-- ============================================================================

INSERT INTO system_settings (key, value, description) VALUES
-- Division system settings
('division_system_enabled', 'true', 'Enable Premier League style 3-division system'),
('premier_playoff_spots', '4', 'Number of playoff spots for Premier Division'),
('championship_playoff_spots', '2', 'Number of playoff spots for Championship Division'),
('league_one_playoff_spots', '2', 'Number of playoff spots for League One'),
('promotion_relegation_enabled', 'true', 'Enable promotion and relegation between divisions'),

-- Transfer system settings
('transfer_market_enabled', 'true', 'Controls whether the player transfer market is open or closed'),
('transfer_offer_duration', '14400', 'Duration of transfer offers in seconds (default: 4 hours)'),
('transfer_increment', '2000000', 'Minimum increment for transfer offers'),

-- Signing system settings
('signings_enabled', 'true', 'Controls whether direct player signings are open or closed'),

-- General salary settings
('min_salary', '750000', 'Minimum salary for players'),
('max_salary', '15000000', 'Maximum salary for players')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;

-- ============================================================================
-- 6. INITIAL DATA SETUP
-- ============================================================================

-- Update teams to assign them to divisions based on their names
-- Premier Division teams (top tier)
UPDATE teams SET division = 'Premier Division' 
WHERE name IN (
    'Manchester United FC',
    'Real Madrid CF', 
    'FC Barcelona',
    'Bayern Munich',
    'Liverpool FC',
    'Chelsea FC',
    'Arsenal FC',
    'Paris Saint-Germain'
);

-- Championship Division teams (second tier)
UPDATE teams SET division = 'Championship Division' 
WHERE name IN (
    'AC Milan',
    'Juventus FC',
    'Inter Milan',
    'Atletico Madrid',
    'Borussia Dortmund',
    'Tottenham Hotspur',
    'Manchester City',
    'Napoli'
);

-- League One teams (third tier)
UPDATE teams SET division = 'League One' 
WHERE name IN (
    'AS Roma',
    'Lazio',
    'Valencia CF',
    'Sevilla FC',
    'RB Leipzig',
    'Bayer Leverkusen',
    'Newcastle United',
    'West Ham United'
);

-- Assign any remaining teams to League One (default)
UPDATE teams SET division = 'League One' 
WHERE division IS NULL OR division = '';

-- ============================================================================
-- 7. VERIFICATION
-- ============================================================================

SELECT 
    'Complete System Setup Finished' as status,
    (SELECT COUNT(*) FROM divisions) as divisions_count,
    (SELECT COUNT(*) FROM teams WHERE division IS NOT NULL) as teams_with_divisions,
    (SELECT COUNT(*) FROM player_transfer_offers) as transfer_offers_count,
    (SELECT COUNT(*) FROM player_signings) as signings_count,
    (SELECT COUNT(*) FROM player_transfers) as transfers_count;

-- Show current division assignments
SELECT 
    division,
    COUNT(*) as team_count,
    STRING_AGG(name, ', ') as teams
FROM teams 
WHERE is_active = true 
GROUP BY division 
ORDER BY 
    CASE division 
        WHEN 'Premier Division' THEN 1 
        WHEN 'Championship Division' THEN 2 
        WHEN 'League One' THEN 3 
        ELSE 4 
    END;
