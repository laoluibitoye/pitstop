-- Migration: Add missing columns for privacy and tagging features
-- Date: 2024-11-11
-- Purpose: Add visibility and tags columns to tasks table

-- Add visibility column to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private'));

-- Add tags column to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for tags array search
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON public.tasks USING gin(tags);

-- Create index for visibility lookup
CREATE INDEX IF NOT EXISTS idx_tasks_visibility ON public.tasks(visibility);

-- Create sub_tasks table if it doesn't exist
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

-- Enable RLS on sub_tasks
ALTER TABLE public.sub_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sub_tasks
CREATE POLICY "Users can view sub-tasks for accessible tasks" ON public.sub_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE id = task_id AND (
        created_by = auth.uid() OR 
        assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

CREATE POLICY "Users can manage sub-tasks for own tasks" ON public.sub_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND created_by = auth.uid())
  );

-- Update existing tasks to have proper default values
UPDATE public.tasks 
SET 
  visibility = COALESCE(visibility, 'private'),
  tags = COALESCE(tags, '{}')
WHERE visibility IS NULL OR tags IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sub_tasks_task_id ON public.sub_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_sub_tasks_status ON public.sub_tasks(status);
CREATE INDEX IF NOT EXISTS idx_sub_tasks_position ON public.sub_tasks(task_id, position);