-- Create audit schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS audit;

-- Create audit log table for tracking changes
CREATE TABLE IF NOT EXISTS audit.logged_actions (
    event_id BIGSERIAL PRIMARY KEY,
    schema_name TEXT NOT NULL,
    table_name TEXT NOT NULL,
    user_name TEXT,
    action_tstamp TIMESTAMPTZ NOT NULL DEFAULT current_timestamp,
    action TEXT NOT NULL CHECK (action IN ('I','D','U')),
    original_data JSONB,
    new_data JSONB,
    query TEXT
);

-- Create a function to log changes
CREATE OR REPLACE FUNCTION audit.if_modified_func()
RETURNS TRIGGER AS $func$
BEGIN
    IF TG_WHEN <> 'AFTER' THEN
        RAISE EXCEPTION 'audit.if_modified_func() may only run as an AFTER trigger';
    END IF;

    IF (TG_LEVEL = 'STATEMENT') THEN
        RAISE EXCEPTION 'audit.if_modified_func() does not support statement-level triggers';
    END IF;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit.logged_actions (
            schema_name, table_name, user_name, action, new_data, query
        ) VALUES (
            TG_TABLE_SCHEMA::TEXT,
            TG_TABLE_NAME::TEXT,
            session_user::TEXT,
            'I',
            to_jsonb(NEW),
            current_query()
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit.logged_actions (
            schema_name, table_name, user_name, action, original_data, new_data, query
        ) VALUES (
            TG_TABLE_SCHEMA::TEXT,
            TG_TABLE_NAME::TEXT,
            session_user::TEXT,
            'U',
            to_jsonb(OLD),
            to_jsonb(NEW),
            current_query()
        );
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit.logged_actions (
            schema_name, table_name, user_name, action, original_data, query
        ) VALUES (
            TG_TABLE_SCHEMA::TEXT,
            TG_TABLE_NAME::TEXT,
            session_user::TEXT,
            'D',
            to_jsonb(OLD),
            current_query()
        );
        RETURN OLD;
    ELSE
        RAISE EXCEPTION '[audit.if_modified_func] - Trigger func added as trigger for unhandled op: %', TG_OP;
        RETURN NULL;
    END IF;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example of creating a trigger for the users table
-- Uncomment and modify as needed
/*
CREATE TRIGGER users_audit
AFTER INSERT OR UPDATE OR DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();
*/

-- Replace any JavaScript-style comments with SQL-style comments
-- Example of proper SQL comments below:

-- This is a proper SQL comment
-- Another line of comment

/*
 * This is a multi-line
 * SQL comment
 */

-- Note: The following are examples of comments that would cause errors in SQL:
-- // This would cause an error
-- /* This is fine */

-- Make sure all your SQL files use -- or /* */ for comments, not //
