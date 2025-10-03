-- Simple Migration: Convert Conference System to Premier League Divisions
-- Run this in your Supabase SQL Editor

-- 1. Add division column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS division VARCHAR(50);

-- 2. Assign teams to divisions based on their names
-- Premier Division (Top Tier)
UPDATE teams SET division = 'Premier Division' 
WHERE name IN (
    'Manchester United FC', 'Real Madrid CF', 'FC Barcelona', 'Bayern Munich',
    'Liverpool FC', 'Chelsea FC', 'Arsenal FC', 'Paris Saint-Germain'
);

-- Championship Division (Second Tier)  
UPDATE teams SET division = 'Championship Division' 
WHERE name IN (
    'AC Milan', 'Juventus FC', 'Inter Milan', 'Atletico Madrid',
    'Borussia Dortmund', 'Tottenham Hotspur', 'Manchester City', 'Napoli'
);

-- League One (Third Tier)
UPDATE teams SET division = 'League One' 
WHERE name IN (
    'AS Roma', 'Lazio', 'Valencia CF', 'Sevilla FC',
    'RB Leipzig', 'Bayer Leverkusen', 'Newcastle United', 'West Ham United'
);

-- 3. Assign any remaining teams to League One (default)
UPDATE teams SET division = 'League One' 
WHERE division IS NULL OR division = '';

-- 4. Update system settings (handle existing records)
INSERT INTO system_settings (key, value) VALUES
('division_system_enabled', 'true'),
('premier_playoff_spots', '4'),
('championship_playoff_spots', '2'),
('league_one_playoff_spots', '2')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Alternative approach if the above still fails:
-- UPDATE system_settings SET value = 'true' WHERE key = 'division_system_enabled';
-- UPDATE system_settings SET value = '4' WHERE key = 'premier_playoff_spots';
-- UPDATE system_settings SET value = '2' WHERE key = 'championship_playoff_spots';
-- UPDATE system_settings SET value = '2' WHERE key = 'league_one_playoff_spots';

-- 5. Verify the setup
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
