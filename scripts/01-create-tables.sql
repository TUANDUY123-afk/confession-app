-- Create love_story table
CREATE TABLE IF NOT EXISTS public.love_story (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  filename TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (photo_url) REFERENCES public.photos(url) ON DELETE CASCADE
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url TEXT NOT NULL,
  text TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (photo_url) REFERENCES public.photos(url) ON DELETE CASCADE
);

-- Create diary_entries table
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON public.photos(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON public.diary_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_comments_photo_url ON public.comments(photo_url);
CREATE INDEX IF NOT EXISTS idx_likes_photo_url ON public.likes(photo_url);

-- Enable Row Level Security (RLS) for security
ALTER TABLE public.love_story ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read/write (adjust as needed for your security requirements)
CREATE POLICY "Allow public read on love_story" ON public.love_story FOR SELECT USING (true);
CREATE POLICY "Allow public insert on love_story" ON public.love_story FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on love_story" ON public.love_story FOR UPDATE USING (true);

CREATE POLICY "Allow public read on photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Allow public insert on photos" ON public.photos FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on likes" ON public.likes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on comments" ON public.comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on diary_entries" ON public.diary_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert on diary_entries" ON public.diary_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on diary_entries" ON public.diary_entries FOR UPDATE USING (true);
