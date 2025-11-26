-- Drop existing select policy if it exists (to avoid conflicts or duplicates)
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Public tasks are visible to everyone" ON tasks;

-- Create a comprehensive select policy
CREATE POLICY "Users can view their own tasks or public tasks"
ON tasks FOR SELECT
USING (
  auth.uid() = created_by -- User is the owner
  OR 
  visibility = 'public' -- Task is public
);

-- Ensure other policies remain (or recreate them to be safe)
-- Insert: Authenticated users can create tasks
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
CREATE POLICY "Users can create tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Update: Users can update their own tasks
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
CREATE POLICY "Users can update their own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = created_by);

-- Delete: Users can delete their own tasks
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
CREATE POLICY "Users can delete their own tasks"
ON tasks FOR DELETE
USING (auth.uid() = created_by);
