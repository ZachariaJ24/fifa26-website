-- Create banned_users table for tracking banned users
CREATE TABLE IF NOT EXISTS public.banned_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    banned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON public.banned_users(user_id);
CREATE INDEX IF NOT EXISTS idx_banned_users_expires ON public.banned_users(expires_at);

-- Add comments for documentation
COMMENT ON TABLE public.banned_users IS 'Tracks users who have been banned from the platform';
COMMENT ON COLUMN public.banned_users.user_id IS 'Reference to the users table';
COMMENT ON COLUMN public.banned_users.banned_by IS 'Admin who issued the ban';
COMMENT ON COLUMN public.banned_users.reason IS 'Reason for the ban';
COMMENT ON COLUMN public.banned_users.expires_at IS 'When the ban expires (NULL means permanent)';

-- Add RLS policies
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to view all bans
CREATE POLICY "Admins can view all bans"
ON public.banned_users
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'Admin'
));

-- Policy to allow admins to create bans
CREATE POLICY "Admins can create bans"
ON public.banned_users
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'Admin'
));

-- Policy to allow admins to update bans
CREATE POLICY "Admins can update bans"
ON public.banned_users
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'Admin'
));

-- Policy to allow admins to delete bans
CREATE POLICY "Admins can delete bans"
ON public.banned_users
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role = 'Admin'
));

-- Create a function to check if a user is currently banned
CREATE OR REPLACE FUNCTION public.is_user_banned(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.banned_users 
    WHERE user_id = p_user_id 
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_banned_users_updated_at
BEFORE UPDATE ON public.banned_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
