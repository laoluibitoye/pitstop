-- Add guest_id to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS guest_id UUID;
CREATE INDEX IF NOT EXISTS idx_tasks_guest_id ON tasks(guest_id);

-- Function to cleanup expired guest data (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_expired_guest_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM tasks
  WHERE guest_id IS NOT NULL
  AND created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Function to claim guest data when signing up
CREATE OR REPLACE FUNCTION claim_guest_data(current_guest_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update tasks belonging to the guest_id
  -- Set created_by to the current authenticated user
  -- Set guest_id to NULL (so it's no longer treated as guest data)
  UPDATE tasks
  SET 
    created_by = auth.uid(),
    guest_id = NULL
  WHERE guest_id = current_guest_id;
END;
$$;

-- Update RLS policies for tasks to support guest access
-- First, drop existing policies to avoid conflicts or confusion
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks; -- Drop the one causing error
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

-- Also drop the new policies in case of re-run
DROP POLICY IF EXISTS "Users can view own or guest tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own or guest tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own or guest tasks" ON tasks;

-- Policy: Users can view their own tasks OR tasks matching their guest_id header
CREATE POLICY "Users can view own or guest tasks"
ON tasks FOR SELECT
USING (
  auth.uid() = created_by 
  OR 
  (guest_id IS NOT NULL AND guest_id::text = current_setting('request.headers', true)::json->>'x-guest-id')
  OR
  visibility = 'public'
);

-- Policy: Users can create tasks (auth user or guest)
CREATE POLICY "Users can create tasks"
ON tasks FOR INSERT
WITH CHECK (
  auth.uid() = created_by
  OR
  (guest_id IS NOT NULL AND guest_id::text = current_setting('request.headers', true)::json->>'x-guest-id')
);

-- Policy: Users can update their own tasks or guest tasks
CREATE POLICY "Users can update own or guest tasks"
ON tasks FOR UPDATE
USING (
  auth.uid() = created_by
  OR
  (guest_id IS NOT NULL AND guest_id::text = current_setting('request.headers', true)::json->>'x-guest-id')
);

-- Policy: Users can delete their own tasks or guest tasks
CREATE POLICY "Users can delete own or guest tasks"
ON tasks FOR DELETE
USING (
  auth.uid() = created_by
  OR
  (guest_id IS NOT NULL AND guest_id::text = current_setting('request.headers', true)::json->>'x-guest-id')
);
