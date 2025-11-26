-- Add guest_name column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS guest_name TEXT;

-- Update RLS to allow guests to insert their name
-- (Existing insert policy uses auth.uid() = created_by, which works for 'guest-user' if we allow it)
-- We just need to make sure the new column is accessible.
-- By default, new columns are accessible if the table is accessible.
