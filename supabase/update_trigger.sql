-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the existing function
DROP FUNCTION IF EXISTS handle_new_user_signup();

-- Create updated function to handle new user signup with proper role validation
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
