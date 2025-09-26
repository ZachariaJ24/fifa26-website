-- Enable audit logging for critical tables

-- 1. Users table
CREATE TRIGGER users_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();

-- 2. Teams table
CREATE TRIGGER teams_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.teams
FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();

-- 3. Matches table
CREATE TRIGGER matches_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.matches
FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();

-- 4. Forum posts
CREATE TRIGGER forum_posts_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.forum_posts
FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();

-- 5. User roles
CREATE TRIGGER user_roles_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();

-- 6. Match events
CREATE TRIGGER match_events_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.match_events
FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();

-- 7. Forum categories
CREATE TRIGGER forum_categories_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.forum_categories
FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();

-- 8. Banned users
CREATE TRIGGER banned_users_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.banned_users
FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();

-- 9. EA Player Stats
CREATE TRIGGER ea_player_stats_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.ea_player_stats
FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();

-- 10. EA Team Stats
CREATE TRIGGER ea_team_stats_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.ea_team_stats
FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();

-- Drop the view or table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        EXECUTE 'DROP TABLE IF EXISTS public.audit_logs CASCADE';
    ELSIF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        EXECUTE 'DROP VIEW IF EXISTS public.audit_logs CASCADE';
    END IF;
END $$;

-- Create a view for easy access to audit logs
CREATE OR REPLACE VIEW public.audit_logs AS
SELECT 
    event_id,
    action_tstamp as action_timestamp,
    user_name,
    action,
    schema_name,
    table_name,
    original_data,
    new_data,
    query
FROM audit.logged_actions
ORDER BY event_id DESC;

-- Grant permissions to authenticated users
GRANT SELECT ON public.audit_logs TO authenticated;

-- Create a function to search audit logs
CREATE OR REPLACE FUNCTION public.search_audit_logs(
    p_search_text TEXT DEFAULT NULL,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL,
    p_user_name TEXT DEFAULT NULL,
    p_action TEXT DEFAULT NULL,
    p_table_name TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    event_id BIGINT,
    action_timestamp TIMESTAMPTZ,
    user_name TEXT,
    action TEXT,
    schema_name TEXT,
    table_name TEXT,
    original_data JSONB,
    new_data JSONB,
    query TEXT,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_logs AS (
        SELECT 
            event_id,
            action_tstamp as action_timestamp,
            user_name,
            action,
            schema_name,
            table_name,
            original_data,
            new_data,
            query,
            COUNT(*) OVER() as total_count
        FROM audit.logged_actions
        WHERE 
            (p_search_text IS NULL OR 
             user_name ILIKE '%' || p_search_text || '%' OR
             query ILIKE '%' || p_search_text || '%' OR
             original_data::TEXT ILIKE '%' || p_search_text || '%' OR
             new_data::TEXT ILIKE '%' || p_search_text || '%')
            AND (p_start_date IS NULL OR action_tstamp >= p_start_date)
            AND (p_end_date IS NULL OR action_tstamp <= p_end_date)
            AND (p_user_name IS NULL OR user_name = p_user_name)
            AND (p_action IS NULL OR action = p_action)
            AND (p_table_name IS NULL OR table_name = p_table_name)
        ORDER BY action_tstamp DESC
        LIMIT p_limit
        OFFSET p_offset
    )
    SELECT 
        event_id,
        action_timestamp,
        user_name,
        action,
        schema_name,
        table_name,
        original_data,
        new_data,
        query,
        MAX(total_count) OVER() as total_count
    FROM filtered_logs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
