-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('task_files', 'sub_task_files');

-- Verify columns in sub_tasks
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sub_tasks' 
  AND column_name IN ('assigned_to');

-- Verify policies
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename IN ('task_files', 'sub_task_files');
