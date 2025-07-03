-- Drop the existing foreign key constraint
ALTER TABLE public.project_messages 
  DROP CONSTRAINT IF EXISTS project_messages_user_id_fkey;

-- Add the new foreign key constraint referencing public.users
ALTER TABLE public.project_messages
  ADD CONSTRAINT project_messages_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Also update project_members table
ALTER TABLE public.project_members
  DROP CONSTRAINT IF EXISTS project_members_user_id_fkey;

ALTER TABLE public.project_members
  ADD CONSTRAINT project_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Update the admin policy to use public.users
DROP POLICY IF EXISTS "Admins can manage project members" ON public.project_members;

CREATE POLICY "Admins can manage project members" ON public.project_members
  USING (auth.uid() IN (SELECT id FROM public.users WHERE public.users.role = 'admin'));

-- Update the project creator function
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user's ID from auth.uid() and find matching public.users record
  SELECT id INTO current_user_id FROM public.users WHERE id = auth.uid();
  
  -- Insert the project membership
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (NEW.id, current_user_id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
