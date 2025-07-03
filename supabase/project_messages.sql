-- Create project_messages table for storing chat messages related to projects
CREATE TABLE public.project_messages (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  CONSTRAINT project_messages_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Disable Row Level Security for project_messages
ALTER TABLE public.project_messages DISABLE ROW LEVEL SECURITY;

-- Comment out RLS policies (keeping for reference)
/*
CREATE POLICY "Users can view project messages" ON public.project_messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM project_members WHERE project_id = project_messages.project_id
    ) OR 
    auth.uid() IN (
      SELECT id FROM public.users WHERE public.users.role = 'admin'
    )
  );

CREATE POLICY "Users can insert project messages" ON public.project_messages
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM project_members WHERE project_id = project_messages.project_id
    ) OR 
    auth.uid() IN (
      SELECT id FROM public.users WHERE public.users.role = 'admin'
    )
  );
*/

-- Create project_members table to track which users have access to which projects
CREATE TABLE public.project_members (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  CONSTRAINT project_members_pkey PRIMARY KEY (id),
  CONSTRAINT project_members_project_user_unique UNIQUE (project_id, user_id)
) TABLESPACE pg_default;

-- Set up RLS policies for project_members
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage project members
CREATE POLICY "Admins can manage project members" ON public.project_members
  USING (auth.uid() IN (SELECT id FROM public.users WHERE public.users.role = 'admin'));

-- Allow users to view their own project memberships
CREATE POLICY "Users can view their own project memberships" ON public.project_members
  FOR SELECT USING (auth.uid() = user_id);

-- Create function to automatically add project creator as a member
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

-- Create trigger to call the function when a new project is created
CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_project();

-- Enable realtime for project_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_messages;
