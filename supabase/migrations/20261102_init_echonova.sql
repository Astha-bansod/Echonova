-- ==============================================================================
-- ECHONOVA DATABASE MIGRATION SCRIPT
-- Jagadambha College of Engineering & Technology (JCOET)
-- Platform: ECHONOVA — Your Voice. Your Universe.
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_path TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 24),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Index for username lookups
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- 2. EPISODES TABLE
CREATE TABLE IF NOT EXISTS public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  language TEXT NOT NULL,
  media_path TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('audio', 'video')),
  media_size BIGINT NOT NULL DEFAULT 0,
  cover_path TEXT,
  duration_seconds NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for lightning-fast discovery & creator queries
CREATE INDEX IF NOT EXISTS episodes_creator_idx ON public.episodes(creator_id);
CREATE INDEX IF NOT EXISTS episodes_status_published_idx ON public.episodes(status, published_at DESC);
CREATE INDEX IF NOT EXISTS episodes_media_type_idx ON public.episodes(media_type);
CREATE INDEX IF NOT EXISTS episodes_category_idx ON public.episodes(category);
CREATE INDEX IF NOT EXISTS episodes_slug_idx ON public.episodes(slug);

-- 3. AUTOMATIC PROFILE TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_path, bio)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'creator_' || substr(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_path',
    new.raw_user_meta_data->>'bio'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Episodes policies
CREATE POLICY "Published episodes are viewable by everyone."
  ON public.episodes FOR SELECT
  USING (status = 'published');

CREATE POLICY "Creators can view all of their own episodes (including drafts)."
  ON public.episodes FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Authenticated creators can insert their own episodes."
  ON public.episodes FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own episodes."
  ON public.episodes FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own episodes."
  ON public.episodes FOR DELETE
  USING (auth.uid() = creator_id);

-- 5. STORAGE BUCKET CONFIGURATION & POLICIES
-- Create buckets if they do not exist (via storage schema)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for media bucket
CREATE POLICY "Public media access"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('media', 'covers'));

CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('media', 'covers')
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update or delete their own media files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('media', 'covers')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
