-- Create enums for role types, status types, and project status (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Administrator', 'User');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_member_status') THEN
        CREATE TYPE team_member_status AS ENUM ('online', 'away', 'offline');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE project_status AS ENUM ('Estimate', 'Scheduled', 'In Progress', 'Completed');
    END IF;
END $$;

-- Add columns to users table if it exists, otherwise create it
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    -- Table exists, check for and add missing columns
    BEGIN
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'first_name') THEN
        ALTER TABLE users ADD COLUMN first_name TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_name') THEN
        ALTER TABLE users ADD COLUMN last_name TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role user_role DEFAULT 'User' NOT NULL;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'last_sign_in') THEN
        ALTER TABLE users ADD COLUMN last_sign_in TIMESTAMP WITH TIME ZONE;
      END IF;
    END;
  ELSE
    -- Create users table with all required fields
    CREATE TABLE users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      first_name TEXT,
      last_name TEXT,
      role user_role DEFAULT 'User' NOT NULL,
      avatar_url TEXT,
      last_sign_in TIMESTAMP WITH TIME ZONE
    );
  END IF;
END $$;

-- Add projects table if it doesn't exist, or add missing columns if it does
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    -- Table exists, check for and add missing columns
    BEGIN
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'name') THEN
        ALTER TABLE projects ADD COLUMN name TEXT NOT NULL DEFAULT 'Unnamed Project';
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'client') THEN
        ALTER TABLE projects ADD COLUMN client TEXT NOT NULL DEFAULT 'Unknown Client';
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'address') THEN
        ALTER TABLE projects ADD COLUMN address TEXT NOT NULL DEFAULT 'No Address';
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'status') THEN
        ALTER TABLE projects ADD COLUMN status project_status DEFAULT 'Estimate' NOT NULL;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'start_date') THEN
        ALTER TABLE projects ADD COLUMN start_date DATE;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'end_date') THEN
        ALTER TABLE projects ADD COLUMN end_date DATE;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'value') THEN
        ALTER TABLE projects ADD COLUMN value DECIMAL(12,2);
      END IF;
    END;
  ELSE
    -- Create projects table with all required fields
    CREATE TABLE projects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      name TEXT NOT NULL,
      client TEXT NOT NULL,
      address TEXT NOT NULL,
      status project_status DEFAULT 'Estimate' NOT NULL,
      start_date DATE,
      end_date DATE,
      value DECIMAL(12,2)
    );
  END IF;
END $$;

-- Add team_members table if it doesn't exist, or add missing columns if it does
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_members') THEN
    -- Table exists, check for and add missing columns
    BEGIN
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'name') THEN
        ALTER TABLE team_members ADD COLUMN name TEXT NOT NULL DEFAULT 'Unnamed Member';
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'role') THEN
        ALTER TABLE team_members ADD COLUMN role TEXT NOT NULL DEFAULT 'Staff';
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'status') THEN
        ALTER TABLE team_members ADD COLUMN status team_member_status DEFAULT 'offline' NOT NULL;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'avatar_url') THEN
        ALTER TABLE team_members ADD COLUMN avatar_url TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'last_active') THEN
        ALTER TABLE team_members ADD COLUMN last_active TIMESTAMP WITH TIME ZONE;
      END IF;
      
      IF NOT EXISTS (SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'project_id') THEN
        ALTER TABLE team_members ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
      END IF;
    END;
  ELSE
    -- Create team_members table with all required fields
    CREATE TABLE team_members (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      status team_member_status DEFAULT 'offline' NOT NULL,
      avatar_url TEXT,
      last_active TIMESTAMP WITH TIME ZONE,
      project_id UUID REFERENCES projects(id) ON DELETE SET NULL
    );
  END IF;
END $$;

-- Create or replace the view for active team members
DO $$ 
BEGIN
  -- Drop the view if it exists
  DROP VIEW IF EXISTS active_team_members;
  
  -- Create the view
  CREATE VIEW active_team_members AS
  SELECT * FROM team_members
  WHERE status = 'online' OR status = 'away';
END $$;

-- No Row Level Security (RLS) policies as per client request

-- Create or replace function to update user last active timestamp
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE team_members
  SET last_active = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to update last active timestamp when status changes
DO $$
BEGIN
  -- Drop the trigger if it exists
  DROP TRIGGER IF EXISTS update_last_active_trigger ON team_members;
  
  -- Create the trigger
  CREATE TRIGGER update_last_active_trigger
  AFTER UPDATE OF status ON team_members
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_last_active();
END
$$;

-- Create or replace function to handle new user signup with first_name and last_name
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role;
  username_val TEXT;
  first_name_val TEXT;
  last_name_val TEXT;
  avatar_url_val TEXT;
  existing_user_count INTEGER;
BEGIN
  -- Safety check - if the trigger is called without proper metadata, log and exit gracefully
  IF NEW.raw_user_meta_data IS NULL THEN
    RAISE NOTICE 'No user metadata provided for user %', NEW.id;
    RETURN NEW;
  END IF;

  -- Extract and validate metadata values with fallbacks
  username_val := COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8));
  first_name_val := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  last_name_val := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  avatar_url_val := COALESCE(NEW.raw_user_meta_data->>'avatar_url', '');
  
  -- Validate role from metadata, defaulting to 'User' if invalid
  IF NEW.raw_user_meta_data->>'role' = 'Administrator' THEN
    user_role_value := 'Administrator'::user_role;
  ELSE
    user_role_value := 'User'::user_role;
  END IF;
  
  -- Log the values being used
  RAISE NOTICE 'Creating user with id: %, email: %, username: %, first_name: %, last_name: %, role: %, avatar_url: %', 
    NEW.id, NEW.email, username_val, first_name_val, last_name_val, user_role_value, avatar_url_val;
  
  -- Check if user already exists to avoid unique constraint violations
  SELECT COUNT(*) INTO existing_user_count FROM users WHERE id = NEW.id;
  
  -- Insert or update user data based on existence
  IF existing_user_count > 0 THEN
    -- User exists, update
    RAISE NOTICE 'User % already exists, updating record', NEW.id;
    UPDATE users SET
      email = NEW.email,
      username = username_val,
      first_name = first_name_val,
      last_name = last_name_val,
      role = user_role_value,
      avatar_url = avatar_url_val
    WHERE id = NEW.id;
  ELSE
    -- New user, insert
    BEGIN
      INSERT INTO users (
        id, 
        email, 
        username, 
        first_name, 
        last_name, 
        role,
        avatar_url,
        created_at
      )
      VALUES (
        NEW.id, 
        NEW.email, 
        username_val, 
        first_name_val,
        last_name_val,
        user_role_value,
        avatar_url_val,
        NOW()
      );
      RAISE NOTICE 'Successfully inserted new user %', NEW.id;
    EXCEPTION
      WHEN unique_violation THEN
        -- Handle specific unique violations
        RAISE NOTICE 'Unique violation encountered for user %', NEW.id;
        -- Try to identify which constraint was violated
        IF EXISTS (SELECT 1 FROM users WHERE email = NEW.email AND id != NEW.id) THEN
          RAISE NOTICE 'Email % already in use by another user', NEW.email;
        END IF;
        IF EXISTS (SELECT 1 FROM users WHERE username = username_val AND id != NEW.id) THEN
          RAISE NOTICE 'Username % already in use by another user', username_val;
        END IF;
        
        -- Update instead of insert
        UPDATE users SET
          email = NEW.email,
          username = username_val,
          first_name = first_name_val,
          last_name = last_name_val,
          role = user_role_value,
          avatar_url = avatar_url_val
        WHERE id = NEW.id;
      WHEN OTHERS THEN
        -- Log any other errors but don't fail the transaction
        RAISE NOTICE 'Error in handle_new_user_signup: %', SQLERRM;
        RAISE NOTICE 'Error details: %', SQLSTATE;
        RAISE NOTICE 'User data: id=%, email=%, username=%', NEW.id, NEW.email, username_val;
        RAISE NOTICE 'Raw metadata: %', NEW.raw_user_meta_data;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists and recreate it
DO $$
BEGIN
  -- Drop the trigger if it exists
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  
  -- Create the trigger
  CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_signup();
END
$$;
