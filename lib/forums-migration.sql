-- To apply this migration, please run the following SQL query in your Supabase dashboard:

-- Create the forums table
CREATE TABLE public.forums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create the threads table
CREATE TABLE public.threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID NOT NULL REFERENCES public.forums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create the posts table
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.forums FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.threads FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.posts FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.forums FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON public.threads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON public.posts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for users who own the thread" ON public.threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable update for users who own the post" ON public.posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users who own the thread" ON public.threads FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for users who own the post" ON public.posts FOR DELETE USING (auth.uid() = user_id);
