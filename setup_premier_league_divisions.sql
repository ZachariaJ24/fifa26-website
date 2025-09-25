-- FIFA 26 League - Premier League Style Division Setup
-- This script sets up the 3-division system (Premier Division, Championship Division, League One)

-- 1. Update teams table to use division instead of conference
-- First, let's add a division column if it doesn't exist
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

-- 6. Update system settings for the new division system
INSERT INTO system_settings (key, value, description) VALUES
('division_system_enabled', 'true', 'Enable Premier League style 3-division system'),
('premier_playoff_spots', '4', 'Number of playoff spots for Premier Division'),
('championship_playoff_spots', '2', 'Number of playoff spots for Championship Division'),
('league_one_playoff_spots', '2', 'Number of playoff spots for League One'),
('promotion_relegation_enabled', 'true', 'Enable promotion and relegation between divisions')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description;

-- 7. Create a view for easy division standings queries
CREATE OR REPLACE VIEW division_standings AS
SELECT 
    t.id,
    t.name,
    t.logo_url,
    t.division,
    d.tier,
    d.color as division_color,
    COALESCE(ts.wins, 0) as wins,
    COALESCE(ts.losses, 0) as losses,
    COALESCE(ts.otl, 0) as otl,
    COALESCE(ts.games_played, 0) as games_played,
    COALESCE(ts.points, 0) as points,
    COALESCE(ts.goals_for, 0) as goals_for,
    COALESCE(ts.goals_against, 0) as goals_against,
    COALESCE(ts.goal_differential, 0) as goal_differential
FROM teams t
LEFT JOIN divisions d ON t.division = d.name
LEFT JOIN team_stats ts ON t.id = ts.team_id
WHERE t.is_active = true
ORDER BY d.tier, COALESCE(ts.points, 0) DESC, COALESCE(ts.wins, 0) DESC, COALESCE(ts.goal_differential, 0) DESC;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_division ON teams(division);
CREATE INDEX IF NOT EXISTS idx_divisions_tier ON divisions(tier);
CREATE INDEX IF NOT EXISTS idx_team_stats_team_id ON team_stats(team_id);

-- 9. Add a function to get division standings
CREATE OR REPLACE FUNCTION get_division_standings(division_name VARCHAR(50))
RETURNS TABLE (
    team_id UUID,
    team_name VARCHAR(100),
    logo_url TEXT,
    division VARCHAR(50),
    wins INTEGER,
    losses INTEGER,
    otl INTEGER,
    games_played INTEGER,
    points INTEGER,
    goals_for INTEGER,
    goals_against INTEGER,
    goal_differential INTEGER,
    rank INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ds.id,
        ds.name,
        ds.logo_url,
        ds.division,
        ds.wins,
        ds.losses,
        ds.otl,
        ds.games_played,
        ds.points,
        ds.goals_for,
        ds.goals_against,
        ds.goal_differential,
        ROW_NUMBER() OVER (ORDER BY ds.points DESC, ds.wins DESC, ds.goal_differential DESC)::INTEGER as rank
    FROM division_standings ds
    WHERE ds.division = division_name;
END;
$$ LANGUAGE plpgsql;

-- 10. Create a function to get promotion/relegation candidates
CREATE OR REPLACE FUNCTION get_promotion_relegation_candidates()
RETURNS TABLE (
    division VARCHAR(50),
    team_name VARCHAR(100),
    position INTEGER,
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
        rt.rank::INTEGER,
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

-- 11. Update any existing team_stats to ensure they have the correct division info
UPDATE team_stats 
SET updated_at = NOW()
WHERE team_id IN (SELECT id FROM teams WHERE division IS NOT NULL);

-- 12. Create a trigger to automatically update the updated_at timestamp
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

-- 13. Add some sample data for testing (optional)
-- You can uncomment this section if you want to add some test teams

/*
INSERT INTO teams (name, division, is_active, created_at) VALUES
('Test Premier Team', 'Premier Division', true, NOW()),
('Test Championship Team', 'Championship Division', true, NOW()),
('Test League One Team', 'League One', true, NOW())
ON CONFLICT (name) DO NOTHING;
*/

-- 14. Final verification query
SELECT 
    'Setup Complete' as status,
    COUNT(*) as total_teams,
    COUNT(CASE WHEN division = 'Premier Division' THEN 1 END) as premier_teams,
    COUNT(CASE WHEN division = 'Championship Division' THEN 1 END) as championship_teams,
    COUNT(CASE WHEN division = 'League One' THEN 1 END) as league_one_teams
FROM teams 
WHERE is_active = true;

-- Show the division standings
SELECT * FROM division_standings ORDER BY tier, points DESC, wins DESC, goal_differential DESC;
