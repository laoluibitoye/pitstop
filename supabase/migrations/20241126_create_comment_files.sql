-- Create comment_files table
CREATE TABLE IF NOT EXISTS public.comment_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES public.task_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.comment_files ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comment_files_comment_id ON public.comment_files(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_files_user_id ON public.comment_files(user_id);

-- Policies

-- Users can view files for comments on tasks they can view
CREATE POLICY "Users can view files for accessible comments" ON public.comment_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.task_comments c
      JOIN public.tasks t ON t.id = c.task_id
      WHERE c.id = comment_id AND (
        t.created_by = auth.uid() OR 
        t.assigned_to = auth.uid() OR
        t.visibility = 'public' OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
        (t.guest_id IS NOT NULL AND t.guest_id::text = current_setting('request.headers', true)::json->>'x-guest-id')
      )
    )
  );

-- Users can upload files to comments they are creating (or have created)
CREATE POLICY "Users can upload files to comments" ON public.comment_files
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    (auth.role() = 'anon') -- Allow guests
  );

-- Users can delete their own files
CREATE POLICY "Users can delete own comment files" ON public.comment_files
  FOR DELETE USING (
    auth.uid() = user_id OR
    (auth.role() = 'anon') -- Allow guests (simplified)
  );
