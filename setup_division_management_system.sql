-- FIFA 26 League - Complete Division Management System Setup
-- This script sets up the complete division management system with promotion/relegation

-- 1. Add division column to teams table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'teams' AND column_name = 'division') THEN
        ALTER TABLE teams ADD COLUMN division VARCHAR(50);
    END IF;
END $$;

-- 2. Create divisions table for better organization
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    tier INTEGER NOT NULL, -- 1 = Premier, 2 = Championship, 3 = League One
    color VARCHAR(7) NOT NULL, -- Hex color code
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insert the 3 divisions
INSERT INTO divisions (name, tier, color, description) VALUES
('Premier Division', 1, '#16a34a', 'Top tier division - highest level of competition'),
('Championship Division', 2, '#f59e0b', 'Second tier division - promotion/relegation with Premier'),
('League One', 3, '#f97316', 'Third tier division - promotion/relegation with Championship')
ON CONFLICT (name) DO UPDATE SET
    tier = EXCLUDED.tier,
    color = EXCLUDED.color,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 4. Update teams to assign them to divisions based on their names
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

-- 5. Assign any remaining teams to League One (default)
UPDATE teams SET division = 'League One' 
WHERE division IS NULL OR division = '';

-- 6. Update system settings for the new division system (conditional inserts)
INSERT INTO system_settings (key, value) 
SELECT 'division_system_enabled', 'true'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'division_system_enabled');

INSERT INTO system_settings (key, value) 
SELECT 'premier_playoff_spots', '4'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'premier_playoff_spots');

INSERT INTO system_settings (key, value) 
SELECT 'championship_playoff_spots', '2'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'championship_playoff_spots');

INSERT INTO system_settings (key, value) 
SELECT 'league_one_playoff_spots', '2'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'league_one_playoff_spots');

INSERT INTO system_settings (key, value) 
SELECT 'promotion_relegation_enabled', 'true'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'promotion_relegation_enabled');

INSERT INTO system_settings (key, value) 
SELECT 'transfer_market_enabled', 'true'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'transfer_market_enabled');

INSERT INTO system_settings (key, value) 
SELECT 'signings_enabled', 'true'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'signings_enabled');

-- 7. Create a view for easy division standings queries
CREATE OR REPLACE VIEW division_standings AS
SELECT 
    t.id,
    t.name,
    t.logo_url,
    t.division,
    d.tier,
    d.color as division_color,
    COALESCE(t.wins, 0) as wins,
    COALESCE(t.losses, 0) as losses,
    COALESCE(t.otl, 0) as otl,
    COALESCE(t.games_played, 0) as games_played,
    COALESCE(t.points, 0) as points,
    COALESCE(t.goals_for, 0) as goals_for,
    COALESCE(t.goals_against, 0) as goals_against,
    COALESCE(t.goals_for - t.goals_against, 0) as goal_differential
FROM teams t
LEFT JOIN divisions d ON t.division = d.name
WHERE t.is_active = true
ORDER BY d.tier, COALESCE(t.points, 0) DESC, COALESCE(t.wins, 0) DESC, COALESCE(t.goals_for - t.goals_against, 0) DESC;

-- 8. Create a function to get promotion/relegation status
CREATE OR REPLACE FUNCTION get_promotion_relegation_status()
RETURNS TABLE (
    division VARCHAR(50),
    team_name VARCHAR(100),
    team_position INTEGER,
    status VARCHAR(20),
    points INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_teams AS (
        SELECT 
            ds.division,
            ds.name,
            ds.points,
            ROW_NUMBER() OVER (PARTITION BY ds.division ORDER BY ds.points DESC, ds.wins DESC, ds.goal_differential DESC) as rank,
            COUNT(*) OVER (PARTITION BY ds.division) as total_teams
        FROM division_standings ds
    )
    SELECT 
        rt.division,
        rt.name,
        rt.rank::INTEGER as team_position,
        CASE 
            WHEN rt.division = 'Premier Division' AND rt.rank > rt.total_teams - 2 THEN 'RELEGATED'
            WHEN rt.division = 'Championship Division' AND rt.rank <= 2 THEN 'PROMOTED'
            WHEN rt.division = 'Championship Division' AND rt.rank > rt.total_teams - 2 THEN 'RELEGATED'
            WHEN rt.division = 'League One' AND rt.rank <= 2 THEN 'PROMOTED'
            ELSE 'STAY'
        END as status,
        rt.points::INTEGER
    FROM ranked_teams rt
    WHERE rt.rank <= 2 OR rt.rank > rt.total_teams - 2
    ORDER BY rt.division, rt.rank;
END;
$$ LANGUAGE plpgsql;

-- 9. Create a trigger to automatically update the updated_at timestamp for divisions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_divisions_updated_at') THEN
        CREATE TRIGGER update_divisions_updated_at 
            BEFORE UPDATE ON divisions 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_division ON teams(division);
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_divisions_tier ON divisions(tier);
CREATE INDEX IF NOT EXISTS idx_divisions_name ON divisions(name);

-- 11. Set up Row Level Security (RLS) policies for divisions table
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read divisions
CREATE POLICY "Allow authenticated users to read divisions" ON divisions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow only admins to modify divisions
CREATE POLICY "Allow admins to modify divisions" ON divisions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'Admin'
        )
    );

-- 12. Grant necessary permissions
GRANT SELECT ON divisions TO authenticated;
GRANT ALL ON divisions TO service_role;

-- 13. Verify the setup
SELECT 
    'Setup Complete' as status,
    COUNT(*) as total_divisions,
    (SELECT COUNT(*) FROM teams WHERE division IS NOT NULL) as teams_with_divisions
FROM divisions;

-- 14. Show current division assignments
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
