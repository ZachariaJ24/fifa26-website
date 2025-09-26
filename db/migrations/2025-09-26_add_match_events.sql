-- Create match_events table for card and event tracking
-- Note: This file is a reference migration script. Apply via your SQL migration process.

CREATE TABLE IF NOT EXISTS public.match_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id),
  player_name text,
  event_type text NOT NULL CHECK (event_type IN (
    'yellow_card',
    'red_card',
    'second_yellow',
    'goal',
    'own_goal',
    'penalty_scored',
    'penalty_missed',
    'substitution'
  )),
  minute integer,
  extra_time boolean DEFAULT false,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Helpful index for querying by match
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON public.match_events(match_id);

-- Helpful index for league-conference scoping via team_id
CREATE INDEX IF NOT EXISTS idx_match_events_team_id ON public.match_events(team_id);
