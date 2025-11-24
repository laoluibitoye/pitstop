-- Migration: Add Privacy and Sharing Features to Tasks
-- Date: 2024-11-11

-- Add visibility and collaboration fields to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS collaborators JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS shared_with JSONB DEFAULT '[]'::jsonb;

-- Create task_permissions table
CREATE TABLE IF NOT EXISTS public.task_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_type TEXT CHECK (permission_type IN ('view', 'comment', 'edit', 'admin')),
  granted_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(task_id, user_id)
);

-- Create share_links table
CREATE TABLE IF NOT EXISTS public.share_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  name TEXT,
  permission_type TEXT DEFAULT 'view' CHECK (permission_type IN ('view', 'comment', 'edit')),
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task_access_log table
CREATE TABLE IF NOT EXISTS public.task_access_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_type TEXT CHECK (access_type IN ('view', 'comment', 'edit', 'share')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.task_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_access_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_permissions
CREATE POLICY "Users can view task permissions for accessible tasks" ON public.task_permissions
  FOR SELECT USING (
    auth.uid() = granted_by OR 
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE id = task_id AND (
        created_by = auth.uid() OR 
        created_by = granted_by OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

CREATE POLICY "Task creators can manage permissions" ON public.task_permissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND created_by = auth.uid())
  );

-- RLS Policies for share_links
CREATE POLICY "Users can view own share links" ON public.share_links
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create share links for own tasks" ON public.share_links
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND created_by = auth.uid())
  );

CREATE POLICY "Users can update own share links" ON public.share_links
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own share links" ON public.share_links
  FOR DELETE USING (auth.uid() = created_by);

-- Public read access for active share links
CREATE POLICY "Anyone can read active share links" ON public.share_links
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- RLS Policies for task_access_log
CREATE POLICY "Users can view own access logs" ON public.task_access_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Task creators can view access logs for their tasks" ON public.task_access_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND created_by = auth.uid())
  );

CREATE POLICY "Users can create access logs" ON public.task_access_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update existing RLS policies for tasks to include visibility
DROP POLICY IF EXISTS "Users can view assigned or own tasks" ON public.tasks;
CREATE POLICY "Users can view accessible tasks" ON public.tasks
  FOR SELECT USING (
    visibility = 'public' OR
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM public.task_permissions 
      WHERE task_id = tasks.id AND user_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_visibility ON public.tasks(visibility);
CREATE INDEX IF NOT EXISTS idx_task_permissions_task_id ON public.task_permissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_permissions_user_id ON public.task_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_share_links_task_id ON public.share_links(task_id);
CREATE INDEX IF NOT EXISTS idx_share_links_token ON public.share_links(token);
CREATE INDEX IF NOT EXISTS idx_task_access_log_task_id ON public.task_access_log(task_id);
CREATE INDEX IF NOT EXISTS idx_task_access_log_user_id ON public.task_access_log(user_id);

-- Function to generate secure share tokens
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER := 0;
  length INTEGER := 32;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to log task access
CREATE OR REPLACE FUNCTION public.log_task_access(
  p_task_id UUID,
  p_user_id UUID,
  p_access_type TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.task_access_log (
    task_id, user_id, access_type, ip_address, user_agent
  ) VALUES (
    p_task_id, p_user_id, p_access_type, p_ip_address, p_user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing tasks to be private by default (safe default)
UPDATE public.tasks SET visibility = 'private' WHERE visibility IS NULL;