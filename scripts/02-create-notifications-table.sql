-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('photo', 'comment', 'like', 'diary', 'event')),
  message TEXT NOT NULL,
  author TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON public.notifications(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read notifications
CREATE POLICY "Allow all users to read notifications" ON public.notifications
  FOR SELECT USING (true);

-- Create policy to allow all users to insert notifications
CREATE POLICY "Allow all users to insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Create policy to allow all users to update notifications
CREATE POLICY "Allow all users to update notifications" ON public.notifications
  FOR UPDATE USING (true);

-- Create policy to allow all users to delete notifications
CREATE POLICY "Allow all users to delete notifications" ON public.notifications
  FOR DELETE USING (true);
