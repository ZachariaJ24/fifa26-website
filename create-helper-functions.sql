-- Helper Functions for Homepage Stats
-- These functions bypass RLS and provide direct access to counts

-- Function to get players count
CREATE OR REPLACE FUNCTION get_players_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER -- This runs with the privileges of the function owner
AS $$
  SELECT COUNT(*)::INTEGER FROM players;
$$;

-- Function to get clubs count
CREATE OR REPLACE FUNCTION get_clubs_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER FROM clubs WHERE is_active = true;
$$;

-- Function to get fixtures count
CREATE OR REPLACE FUNCTION get_fixtures_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER FROM fixtures;
$$;

-- Function to get all homepage stats at once
CREATE OR REPLACE FUNCTION get_homepage_stats()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'players', (SELECT COUNT(*) FROM players),
    'clubs', (SELECT COUNT(*) FROM clubs WHERE is_active = true),
    'fixtures', (SELECT COUNT(*) FROM fixtures)
  );
$$;

-- Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_players_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_clubs_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_fixtures_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_homepage_stats() TO anon, authenticated;

-- Test the functions
SELECT get_players_count() as players_count;
SELECT get_clubs_count() as clubs_count;
SELECT get_fixtures_count() as fixtures_count;
SELECT get_homepage_stats() as homepage_stats;
