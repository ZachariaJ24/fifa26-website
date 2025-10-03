-- Fix League Management Schema Issues
-- This script fixes the database structure to properly support league management

-- 1. First, let's check what divisions exist and fix the teams table structure
DO $$ 
BEGIN
    -- Add proper foreign key constraint for teams.division if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'teams_division_fkey' 
        AND table_name = 'teams'
    ) THEN
        -- We'll add this constraint after ensuring data integrity
        RAISE NOTICE 'Will add foreign key constraint for teams.division';
    END IF;
END $$;

-- 2. Fix the division_standings view to work with actual schema
DROP VIEW IF EXISTS division_standings;

CREATE OR REPLACE VIEW division_standings AS
SELECT 
    t.id,
    t.name,
    t.logo_url,
    t.division,
    d.tier,
    d.color as division_color,
    d.description as division_description,
    COALESCE(t.wins, 0) as wins,
    COALESCE(t.losses, 0) as losses,
    COALESCE(t.otl, 0) as otl,
    COALESCE(t.games_played, 0) as games_played,
    COALESCE(t.points, 0) as points,
    COALESCE(t.goals_for, 0) as goals_for,
    COALESCE(t.goals_against, 0) as goals_against,
    COALESCE(t.goals_for - t.goals_against, 0) as goal_differential,
    t.conference_id,
    c.name as conference_name,
    c.color as conference_color
FROM teams t
LEFT JOIN divisions d ON t.division = d.name
LEFT JOIN conferences c ON t.conference_id = c.id
WHERE t.is_active = true
ORDER BY 
    COALESCE(d.tier, 999), 
    COALESCE(t.points, 0) DESC, 
    COALESCE(t.wins, 0) DESC, 
    COALESCE(t.goals_for - t.goals_against, 0) DESC;

-- 3. Create a function to get promotion/relegation status that works with actual schema
-- First drop the existing function if it exists
DROP FUNCTION IF EXISTS get_promotion_relegation_status();

CREATE OR REPLACE FUNCTION get_promotion_relegation_status()
RETURNS TABLE (
    team_id uuid,
    team_name text,
    current_division text,
    current_tier integer,
    team_position integer,
    promotion_status text,
    relegation_status text,
    new_division text,
    new_tier integer
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH team_positions AS (
        SELECT 
            t.id as team_id,
            t.name as team_name,
            t.division as current_division,
            d.tier as current_tier,
            ROW_NUMBER() OVER (
                PARTITION BY t.division 
                ORDER BY COALESCE(t.points, 0) DESC, COALESCE(t.wins, 0) DESC
            ) as team_position
        FROM teams t
        LEFT JOIN divisions d ON t.division = d.name
        WHERE t.is_active = true
    ),
    division_rules AS (
        SELECT 
            tp.*,
            CASE 
                WHEN tp.current_tier = 1 AND tp.team_position <= 2 THEN 'promote'
                WHEN tp.current_tier = 2 AND tp.team_position <= 2 THEN 'promote'
                WHEN tp.current_tier = 3 AND tp.team_position <= 2 THEN 'promote'
                ELSE 'stay'
            END as promotion_status,
            CASE 
                WHEN tp.current_tier = 1 AND tp.team_position >= (SELECT COUNT(*) FROM teams WHERE division = tp.current_division AND is_active = true) - 1 THEN 'relegate'
                WHEN tp.current_tier = 2 AND tp.team_position >= (SELECT COUNT(*) FROM teams WHERE division = tp.current_division AND is_active = true) - 1 THEN 'relegate'
                WHEN tp.current_tier = 3 AND tp.team_position >= (SELECT COUNT(*) FROM teams WHERE division = tp.current_division AND is_active = true) - 1 THEN 'relegate'
                ELSE 'stay'
            END as relegation_status
        FROM team_positions tp
    )
    SELECT 
        dr.team_id,
        dr.team_name,
        dr.current_division,
        dr.current_tier,
        dr.team_position,
        dr.promotion_status,
        dr.relegation_status,
        CASE 
            WHEN dr.promotion_status = 'promote' THEN 
                CASE dr.current_tier
                    WHEN 1 THEN 'Premier Division'
                    WHEN 2 THEN 'Championship Division'
                    WHEN 3 THEN 'League One'
                END
            WHEN dr.relegation_status = 'relegate' THEN 
                CASE dr.current_tier
                    WHEN 1 THEN 'Championship Division'
                    WHEN 2 THEN 'League One'
                    WHEN 3 THEN 'League Two'
                END
            ELSE dr.current_division
        END as new_division,
        CASE 
            WHEN dr.promotion_status = 'promote' THEN dr.current_tier - 1
            WHEN dr.relegation_status = 'relegate' THEN dr.current_tier + 1
            ELSE dr.current_tier
        END as new_tier
    FROM division_rules dr
    WHERE dr.promotion_status != 'stay' OR dr.relegation_status != 'stay';
END $$;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_division ON teams(division);
CREATE INDEX IF NOT EXISTS idx_teams_conference_id ON teams(conference_id);
CREATE INDEX IF NOT EXISTS idx_teams_is_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_teams_points ON teams(points DESC);

-- 5. Ensure RLS policies exist for underlying tables
DO $$ 
BEGIN
    -- Enable RLS on teams table if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'teams' AND relrowsecurity = true
    ) THEN
        ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Create policy for teams table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'teams' 
        AND policyname = 'Teams are viewable by everyone'
    ) THEN
        CREATE POLICY "Teams are viewable by everyone" ON teams
            FOR SELECT USING (true);
    END IF;
    
    -- Enable RLS on divisions table if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'divisions' AND relrowsecurity = true
    ) THEN
        ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Create policy for divisions table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'divisions' 
        AND policyname = 'Divisions are viewable by everyone'
    ) THEN
        CREATE POLICY "Divisions are viewable by everyone" ON divisions
            FOR SELECT USING (true);
    END IF;
    
    -- Enable RLS on conferences table if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'conferences' AND relrowsecurity = true
    ) THEN
        ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Create policy for conferences table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conferences' 
        AND policyname = 'Conferences are viewable by everyone'
    ) THEN
        CREATE POLICY "Conferences are viewable by everyone" ON conferences
            FOR SELECT USING (true);
    END IF;
END $$;

-- 6. Create a function to validate team division assignments
DROP FUNCTION IF EXISTS validate_team_division();

CREATE OR REPLACE FUNCTION validate_team_division()
RETURNS TABLE (
    team_id uuid,
    team_name text,
    current_division text,
    division_exists boolean,
    division_tier integer
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as team_id,
        t.name as team_name,
        t.division as current_division,
        (d.name IS NOT NULL) as division_exists,
        COALESCE(d.tier, 0) as division_tier
    FROM teams t
    LEFT JOIN divisions d ON t.division = d.name
    WHERE t.is_active = true;
END $$;

-- 7. Create a function to get division summary
DROP FUNCTION IF EXISTS get_division_summary();

CREATE OR REPLACE FUNCTION get_division_summary()
RETURNS TABLE (
    division_name text,
    tier integer,
    team_count integer,
    total_points integer,
    avg_points numeric
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.name as division_name,
        d.tier,
        COUNT(t.id)::integer as team_count,
        COALESCE(SUM(t.points), 0)::integer as total_points,
        COALESCE(AVG(t.points), 0) as avg_points
    FROM divisions d
    LEFT JOIN teams t ON d.name = t.division AND t.is_active = true
    GROUP BY d.name, d.tier
    ORDER BY d.tier, d.name;
END $$;

-- 8. Update system settings to ensure they exist
INSERT INTO system_settings (key, value) 
SELECT 'transfer_market_enabled', 'false'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings WHERE key = 'transfer_market_enabled'
);

INSERT INTO system_settings (key, value) 
SELECT 'signing_market_enabled', 'false'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings WHERE key = 'signing_market_enabled'
);

INSERT INTO system_settings (key, value) 
SELECT 'transfer_offer_duration_hours', '4'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings WHERE key = 'transfer_offer_duration_hours'
);

-- 9. Create a comprehensive league management status function
DROP FUNCTION IF EXISTS get_league_management_status();

CREATE OR REPLACE FUNCTION get_league_management_status()
RETURNS TABLE (
    status_type text,
    status_value text,
    details jsonb
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    -- Check divisions
    SELECT 
        'divisions'::text as status_type,
        'active'::text as status_value,
        jsonb_build_object(
            'total_divisions', COUNT(*),
            'divisions', jsonb_agg(jsonb_build_object(
                'name', name,
                'tier', tier,
                'color', color
            ))
        ) as details
    FROM divisions
    
    UNION ALL
    
    -- Check teams with divisions
    SELECT 
        'teams_with_divisions'::text as status_type,
        'active'::text as status_value,
        jsonb_build_object(
            'total_teams', COUNT(*),
            'teams_with_divisions', COUNT(CASE WHEN division IS NOT NULL THEN 1 END),
            'teams_without_divisions', COUNT(CASE WHEN division IS NULL THEN 1 END)
        ) as details
    FROM teams
    WHERE is_active = true
    
    UNION ALL
    
    -- Check conferences
    SELECT 
        'conferences'::text as status_type,
        'active'::text as status_value,
        jsonb_build_object(
            'total_conferences', COUNT(*),
            'conferences', jsonb_agg(jsonb_build_object(
                'name', name,
                'color', color
            ))
        ) as details
    FROM conferences
    WHERE is_active = true;
END $$;

-- 10. Grant necessary permissions
-- Grant permissions on underlying tables
GRANT SELECT ON teams TO authenticated;
GRANT SELECT ON divisions TO authenticated;
GRANT SELECT ON conferences TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_promotion_relegation_status() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_team_division() TO authenticated;
GRANT EXECUTE ON FUNCTION get_division_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION get_league_management_status() TO authenticated;

-- 11. Create a trigger to update team stats when matches are updated
DROP FUNCTION IF EXISTS update_team_stats_from_matches();

CREATE OR REPLACE FUNCTION update_team_stats_from_matches()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update home team stats
    UPDATE teams 
    SET 
        wins = (
            SELECT COUNT(*) 
            FROM matches 
            WHERE home_team_id = teams.id 
            AND status = 'Completed' 
            AND home_score > away_score
        ) + (
            SELECT COUNT(*) 
            FROM matches 
            WHERE away_team_id = teams.id 
            AND status = 'Completed' 
            AND away_score > home_score
        ),
        losses = (
            SELECT COUNT(*) 
            FROM matches 
            WHERE home_team_id = teams.id 
            AND status = 'Completed' 
            AND home_score < away_score
        ) + (
            SELECT COUNT(*) 
            FROM matches 
            WHERE away_team_id = teams.id 
            AND status = 'Completed' 
            AND away_score < home_score
        ),
        otl = (
            SELECT COUNT(*) 
            FROM matches 
            WHERE (home_team_id = teams.id OR away_team_id = teams.id)
            AND status = 'Completed' 
            AND (overtime = true OR has_shootout = true)
            AND (
                (home_team_id = teams.id AND home_score < away_score) OR
                (away_team_id = teams.id AND away_score < home_score)
            )
        ),
        games_played = (
            SELECT COUNT(*) 
            FROM matches 
            WHERE (home_team_id = teams.id OR away_team_id = teams.id)
            AND status = 'Completed'
        ),
        points = (
            SELECT COUNT(*) 
            FROM matches 
            WHERE home_team_id = teams.id 
            AND status = 'Completed' 
            AND home_score > away_score
        ) * 2 + (
            SELECT COUNT(*) 
            FROM matches 
            WHERE away_team_id = teams.id 
            AND status = 'Completed' 
            AND away_score > home_score
        ) * 2 + (
            SELECT COUNT(*) 
            FROM matches 
            WHERE (home_team_id = teams.id OR away_team_id = teams.id)
            AND status = 'Completed' 
            AND (overtime = true OR has_shootout = true)
            AND (
                (home_team_id = teams.id AND home_score < away_score) OR
                (away_team_id = teams.id AND away_score < home_score)
            )
        ),
        goals_for = (
            SELECT COALESCE(SUM(CASE WHEN home_team_id = teams.id THEN home_score ELSE away_score END), 0)
            FROM matches 
            WHERE (home_team_id = teams.id OR away_team_id = teams.id)
            AND status = 'Completed'
        ),
        goals_against = (
            SELECT COALESCE(SUM(CASE WHEN home_team_id = teams.id THEN away_score ELSE home_score END), 0)
            FROM matches 
            WHERE (home_team_id = teams.id OR away_team_id = teams.id)
            AND status = 'Completed'
        )
    WHERE id IN (NEW.home_team_id, NEW.away_team_id);
    
    RETURN NEW;
END $$;

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_team_stats_trigger') THEN
        CREATE TRIGGER update_team_stats_trigger
            AFTER UPDATE ON matches
            FOR EACH ROW
            WHEN (OLD.status != NEW.status AND NEW.status = 'Completed')
            EXECUTE FUNCTION update_team_stats_from_matches();
    END IF;
END $$;

-- 12. Final validation query
SELECT 
    'Schema Fix Complete' as status,
    'League management system has been updated' as message,
    jsonb_build_object(
        'divisions_count', (SELECT COUNT(*) FROM divisions),
        'teams_count', (SELECT COUNT(*) FROM teams WHERE is_active = true),
        'conferences_count', (SELECT COUNT(*) FROM conferences WHERE is_active = true),
        'views_created', 'division_standings',
        'functions_created', 'get_promotion_relegation_status, validate_team_division, get_division_summary, get_league_management_status, update_team_stats_from_matches'
    ) as details;
