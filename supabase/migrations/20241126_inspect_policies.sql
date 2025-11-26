-- Check columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks';

-- Check policies
SELECT tablename, policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'tasks';
