-- Combined Migration Script

-- To apply this migration, please run the following SQL query in your Supabase dashboard.
-- This script is idempotent; it will not fail if parts of it have been run before.

-- Migration 1: Add match_date to matches table
-- This will add the column only if it does not already exist.
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='matches' AND column_name='match_date') THEN
    ALTER TABLE public.matches ADD COLUMN match_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Migration 2: Create tables for Transfer Market
-- Create the transfer_listings table
CREATE TABLE IF NOT EXISTS public.transfer_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  listing_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL, -- active, completed, cancelled
  asking_price TEXT
);

-- Create the transfer_offers table
CREATE TABLE IF NOT EXISTS public.transfer_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.transfer_listings(id) ON DELETE CASCADE,
  offering_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  offer_details TEXT NOT NULL,
  offer_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL -- pending, accepted, rejected
);

-- Add RLS policies for Transfer Market
ALTER TABLE public.transfer_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.transfer_listings;
CREATE POLICY "Enable read access for all users" ON public.transfer_listings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.transfer_offers;
CREATE POLICY "Enable read access for all users" ON public.transfer_offers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.transfer_listings;
CREATE POLICY "Enable insert for authenticated users" ON public.transfer_listings FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.transfer_offers;
CREATE POLICY "Enable insert for authenticated users" ON public.transfer_offers FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for users who own the listing" ON public.transfer_listings;
CREATE POLICY "Enable update for users who own the listing" ON public.transfer_listings FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.players WHERE id = player_id));

DROP POLICY IF EXISTS "Enable update for users who own the offer" ON public.transfer_offers;
CREATE POLICY "Enable update for users who own the offer" ON public.transfer_offers FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE team_id = offering_team_id AND role = 'Manager'));


-- Migration 3: Create tables for Forums
-- Create the forums table
CREATE TABLE IF NOT EXISTS public.forums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create the threads table
CREATE TABLE IF NOT EXISTS public.threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID NOT NULL REFERENCES public.forums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create the posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add RLS policies for Forums
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.forums;
CREATE POLICY "Enable read access for all users" ON public.forums FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.threads;
CREATE POLICY "Enable read access for all users" ON public.threads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.posts;
CREATE POLICY "Enable read access for all users" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.forums;
CREATE POLICY "Enable insert for authenticated users" ON public.forums FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.threads;
CREATE POLICY "Enable insert for authenticated users" ON public.threads FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.posts;
CREATE POLICY "Enable insert for authenticated users" ON public.posts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for users who own the thread" ON public.threads;
CREATE POLICY "Enable update for users who own the thread" ON public.threads FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable update for users who own the post" ON public.posts;
CREATE POLICY "Enable update for users who own the post" ON public.posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable delete for users who own the thread" ON public.threads;
CREATE POLICY "Enable delete for users who own the thread" ON public.threads FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable delete for users who own the post" ON public.posts;
CREATE POLICY "Enable delete for users who own the post" ON public.posts FOR DELETE USING (auth.uid() = user_id);
