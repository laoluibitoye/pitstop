-- Subtasks table
CREATE TABLE IF NOT EXISTS public.sub_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'cancelled')),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.sub_tasks ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view subtasks for tasks they can view
CREATE POLICY "Users can view subtasks for accessible tasks" ON public.sub_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND (
        t.created_by = auth.uid() OR
        t.assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Users can create subtasks for tasks they can edit (own or assigned)
CREATE POLICY "Users can create subtasks for accessible tasks" ON public.sub_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND (
        t.created_by = auth.uid() OR
        t.assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Users can update subtasks for tasks they can edit
CREATE POLICY "Users can update subtasks for accessible tasks" ON public.sub_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND (
        t.created_by = auth.uid() OR
        t.assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Users can delete subtasks for tasks they can edit
CREATE POLICY "Users can delete subtasks for accessible tasks" ON public.sub_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND (
        t.created_by = auth.uid() OR
        t.assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sub_tasks_task_id ON public.sub_tasks(task_id);
