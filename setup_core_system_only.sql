-- FIFA 26 League - Core System Setup Only
-- This script sets up only the essential division management and signing system
-- Skips system_settings to avoid conflicts

-- ============================================================================
-- 1. DIVISION MANAGEMENT SYSTEM
-- ============================================================================

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
-- 2. SIGNING SYSTEM (player_signings table doesn't exist yet)
-- ============================================================================

-- Create player_signings table for direct signings
CREATE TABLE IF NOT EXISTS player_signings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    salary INTEGER NOT NULL CHECK (salary > 0),
    contract_length INTEGER NOT NULL DEFAULT 1 CHECK (contract_length > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
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

-- Signing indexes
CREATE INDEX IF NOT EXISTS idx_player_signings_player_id ON player_signings(player_id);
CREATE INDEX IF NOT EXISTS idx_player_signings_team_id ON player_signings(team_id);
CREATE INDEX IF NOT EXISTS idx_player_signings_status ON player_signings(status);

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

CREATE TRIGGER update_player_signings_updated_at 
    BEFORE UPDATE ON player_signings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. INITIAL DATA SETUP
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
-- 6. VERIFICATION
-- ============================================================================

SELECT 
    'Core System Setup Finished' as status,
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
