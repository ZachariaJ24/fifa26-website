-- To apply this migration, please run the following SQL query in your Supabase dashboard:

-- Add the match_date column to the matches table
ALTER TABLE public.matches
ADD COLUMN match_date TIMESTAMP WITH TIME ZONE;

-- Optional: Backfill the new column with existing data if you have a relevant timestamp.
-- If your 'created_at' timestamps are a good proxy for the match date, you can use this query:
-- UPDATE public.matches
-- SET match_date = created_at;
