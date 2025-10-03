-- FIFA 26 Website - Concurrent Index Creation
-- Run this AFTER the main DATABASE_SYNC_FIXES.sql script
-- These indexes must be created outside of a transaction block

-- =====================================================
-- CONCURRENT INDEX CREATION
-- =====================================================

-- Note: Run each command separately, not as a batch
-- These provide better performance for commonly queried fields

-- Index for user searches by gamer tag
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_gamer_tag_id_concurrent ON users(gamer_tag_id);

-- Index for banned user queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_ban_reason_concurrent ON users(ban_reason) WHERE ban_reason IS NOT NULL;

-- Index for player-club relationships
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_players_club_id_concurrent ON players(club_id);

-- Index for player status queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_players_status_concurrent ON players(status);

-- Index for user role queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_id_role_concurrent ON user_roles(user_id, role);

-- Index for club searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clubs_name_concurrent ON clubs(name);

-- Index for fixture queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fixtures_match_date_concurrent ON fixtures(match_date);

-- Index for season queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_seasons_is_active_concurrent ON seasons(is_active) WHERE is_active = true;

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================

/*
To run these concurrent indexes:

1. Connect to your database
2. Run each CREATE INDEX command individually
3. Monitor progress with:
   SELECT * FROM pg_stat_progress_create_index;

Example:
psql -d your_database -c "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_gamer_tag_id_concurrent ON users(gamer_tag_id);"

Or run them one by one in your database client.
*/
