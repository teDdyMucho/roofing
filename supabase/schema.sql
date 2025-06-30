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

-- Create users table with first_name and last_name fields
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

-- Create projects table
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

-- Create team_members table
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

-- Create a view for active team members
CREATE VIEW active_team_members AS
SELECT * FROM team_members
WHERE status = 'online' OR status = 'away';

-- No Row Level Security (RLS) policies as per client request

-- Create function to update user last active timestamp
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE team_members
  SET last_active = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last active timestamp when status changes
CREATE TRIGGER update_last_active_trigger
AFTER UPDATE OF status ON team_members
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_last_active();

-- Create function to handle new user signup with first_name and last_name
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role;
BEGIN
  -- Validate role from metadata, defaulting to 'User' if invalid
  IF NEW.raw_user_meta_data->>'role' = 'Administrator' THEN
    user_role_value := 'Administrator'::user_role;
  ELSE
    user_role_value := 'User'::user_role;
  END IF;
  
  INSERT INTO users (
    id, 
    email, 
    username, 
    first_name, 
    last_name, 
    role
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'username', 
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    user_role_value
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user_signup();
