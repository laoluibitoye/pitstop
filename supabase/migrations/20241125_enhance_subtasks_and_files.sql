-- Add assigned_to to sub_tasks
ALTER TABLE public.sub_tasks 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create sub_task_files table
CREATE TABLE IF NOT EXISTS public.sub_task_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sub_task_id UUID REFERENCES public.sub_tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for sub_task_files
ALTER TABLE public.sub_task_files ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sub_tasks_assigned_to ON public.sub_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_sub_task_files_sub_task_id ON public.sub_task_files(sub_task_id);

-- Policies for sub_task_files

-- Users can view files for accessible subtasks
CREATE POLICY "Users can view files for accessible subtasks" ON public.sub_task_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sub_tasks st
      JOIN public.tasks t ON t.id = st.task_id
      WHERE st.id = sub_task_id AND (
        t.created_by = auth.uid() OR 
        t.assigned_to = auth.uid() OR
        st.assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Users can upload files to subtasks they can edit
CREATE POLICY "Users can upload files to accessible subtasks" ON public.sub_task_files
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.sub_tasks st
      JOIN public.tasks t ON t.id = st.task_id
      WHERE st.id = sub_task_id AND (
        t.created_by = auth.uid() OR 
        t.assigned_to = auth.uid() OR
        st.assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own subtask files" ON public.sub_task_files
  FOR DELETE USING (auth.uid() = user_id);
