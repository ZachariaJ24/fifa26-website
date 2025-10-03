-- To apply this migration, please run the following SQL query in your Supabase dashboard:

-- Create the transfer_listings table
CREATE TABLE public.transfer_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  listing_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL, -- active, completed, cancelled
  asking_price TEXT
);

-- Create the transfer_offers table
CREATE TABLE public.transfer_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.transfer_listings(id) ON DELETE CASCADE,
  offering_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  offer_details TEXT NOT NULL,
  offer_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL -- pending, accepted, rejected
);

-- Add RLS policies
ALTER TABLE public.transfer_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.transfer_listings FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.transfer_offers FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.transfer_listings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON public.transfer_offers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for users who own the listing" ON public.transfer_listings FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.players WHERE id = player_id));
CREATE POLICY "Enable update for users who own the offer" ON public.transfer_offers FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.teams WHERE id = offering_team_id));
