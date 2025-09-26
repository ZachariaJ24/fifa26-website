-- Performance indexes for audit and banned users tables

-- Audit logged actions indexes
CREATE INDEX IF NOT EXISTS idx_audit_logged_actions_tstamp ON audit.logged_actions(action_tstamp);
CREATE INDEX IF NOT EXISTS idx_audit_logged_actions_table ON audit.logged_actions(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logged_actions_user ON audit.logged_actions(user_name);

-- Banned users indexes
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON public.banned_users(user_id);
CREATE INDEX IF NOT EXISTS idx_banned_users_created_at ON public.banned_users(created_at);
