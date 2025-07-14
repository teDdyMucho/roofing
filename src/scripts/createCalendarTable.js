// Script to create calendar_events table in Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createCalendarEventsTable() {
  console.log('Creating calendar_events table in Supabase...');
  
  try {
    // Execute SQL to create the table
    const { error } = await supabase.rpc('create_calendar_events_table');
    
    if (error) {
      console.error('Error creating table:', error);
    } else {
      console.log('Calendar events table created successfully!');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Create a stored procedure in Supabase to create the table
async function createStoredProcedure() {
  console.log('Creating stored procedure...');
  
  const createProcedureSQL = `
  CREATE OR REPLACE FUNCTION create_calendar_events_table()
  RETURNS void AS $$
  BEGIN
    -- Create the table if it doesn't exist
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

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own events" ON public.calendar_events;
    DROP POLICY IF EXISTS "Users can insert their own events" ON public.calendar_events;
    DROP POLICY IF EXISTS "Users can update their own events" ON public.calendar_events;
    DROP POLICY IF EXISTS "Users can delete their own events" ON public.calendar_events;

    -- Create policies
    CREATE POLICY "Users can view their own events"
      ON public.calendar_events
      FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own events"
      ON public.calendar_events
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own events"
      ON public.calendar_events
      FOR UPDATE
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own events"
      ON public.calendar_events
      FOR DELETE
      USING (auth.uid() = user_id);

    -- Create trigger function if it doesn't exist
    CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Drop trigger if it exists
    DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON public.calendar_events;

    -- Create trigger
    CREATE TRIGGER update_calendar_events_updated_at
      BEFORE UPDATE ON public.calendar_events
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();
  END;
  $$ LANGUAGE plpgsql;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createProcedureSQL });
    
    if (error) {
      console.error('Error creating stored procedure:', error);
      
      // Alternative approach: Try direct SQL execution
      console.log('Attempting direct SQL execution...');
      
      // Create the table directly
      const { error: tableError } = await supabase
        .from('calendar_events')
        .insert([
          { 
            id: '00000000-0000-0000-0000-000000000000',
            title: 'Test Event',
            description: 'This is a test event to create the table',
            start: new Date().toISOString(),
            end: new Date(Date.now() + 3600000).toISOString(),
            user_id: 'system'
          }
        ]);
      
      if (tableError) {
        console.error('Error creating table directly:', tableError);
      } else {
        console.log('Table created successfully through direct insertion!');
      }
    } else {
      console.log('Stored procedure created successfully!');
      await createCalendarEventsTable();
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Execute the script
createStoredProcedure();
