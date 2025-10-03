-- Setup conferences and assign teams (Fixed for FIFA 26 teams)
-- Run this in Supabase SQL Editor

-- 1. Create conferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.conferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on conferences table
ALTER TABLE public.conferences ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for conferences (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conferences' AND policyname = 'Conferences are viewable by everyone') THEN
        CREATE POLICY "Conferences are viewable by everyone" ON public.conferences
            FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conferences' AND policyname = 'Conferences are manageable by admins') THEN
        CREATE POLICY "Conferences are manageable by admins" ON public.conferences
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles 
                    WHERE user_id = auth.uid() 
                    AND role = 'Admin'
                )
            );
    END IF;
END $$;

-- 4. Insert default conferences if they don't exist
INSERT INTO public.conferences (name, description, color, created_at, updated_at)
VALUES
    ('Eastern Conference', 'Eastern Conference teams', '#3b82f6', NOW(), NOW()),
    ('Western Conference', 'Western Conference teams', '#ef4444', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 5. Add conference_id column to teams table if it doesn't exist
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS conference_id UUID REFERENCES public.conferences(id);

-- 6. Assign teams to conferences (using actual FIFA 26 team names)
-- Get Eastern Conference ID and assign teams
WITH eastern_conf AS (
    SELECT id FROM public.conferences WHERE name = 'Eastern Conference' LIMIT 1
)
UPDATE public.teams
SET conference_id = (SELECT id FROM eastern_conf)
WHERE name IN (
    'Manchester United FC', 'Liverpool FC', 'Chelsea FC', 'Arsenal FC',
    'Tottenham Hotspur', 'Manchester City', 'Newcastle United', 'West Ham United',
    'AC Milan', 'Juventus FC', 'Inter Milan', 'Napoli',
    'AS Roma', 'Lazio', 'Valencia CF', 'Sevilla FC'
)
AND conference_id IS NULL;

-- Get Western Conference ID and assign teams
WITH western_conf AS (
    SELECT id FROM public.conferences WHERE name = 'Western Conference' LIMIT 1
)
UPDATE public.teams
SET conference_id = (SELECT id FROM western_conf)
WHERE name IN (
    'Real Madrid CF', 'FC Barcelona', 'Bayern Munich', 'Borussia Dortmund',
    'RB Leipzig', 'Bayer Leverkusen', 'Atletico Madrid', 'Paris Saint-Germain'
)
AND conference_id IS NULL;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_conference_id ON public.teams(conference_id);
CREATE INDEX IF NOT EXISTS idx_conferences_name ON public.conferences(name);

-- 8. Verify the setup
SELECT 
    'Conferences and Teams Setup Complete' as status,
    (SELECT COUNT(*) FROM public.conferences) as conferences_count,
    (SELECT COUNT(*) FROM public.teams WHERE conference_id IS NOT NULL) as teams_with_conferences,
    (SELECT COUNT(*) FROM public.teams WHERE conference_id IS NULL) as teams_without_conferences;

-- Show conference assignments
SELECT 
    c.name as conference,
    COUNT(t.id) as team_count,
    STRING_AGG(t.name, ', ') as teams
FROM public.conferences c
LEFT JOIN public.teams t ON c.id = t.conference_id
GROUP BY c.id, c.name
ORDER BY c.name;
