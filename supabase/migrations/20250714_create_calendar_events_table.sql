-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start TIMESTAMP WITH TIME ZONE NOT NULL,
  end TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  color TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own events
CREATE POLICY "Users can view their own events"
  ON public.calendar_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own events
CREATE POLICY "Users can insert their own events"
  ON public.calendar_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own events
CREATE POLICY "Users can update their own events"
  ON public.calendar_events
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own events
CREATE POLICY "Users can delete their own events"
  ON public.calendar_events
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();
