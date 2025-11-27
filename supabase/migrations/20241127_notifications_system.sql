-- Drop policies if they exist to avoid errors
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications (mark as read)" ON notifications;
DROP POLICY IF EXISTS "Users can view their own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can update their own notification settings" ON notification_settings;
DROP POLICY IF EXISTS "Users can insert their own notification settings" ON notification_settings;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'email')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist (idempotent schema updates)
DO $$
BEGIN
    -- Add category to notifications if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'category') THEN
        ALTER TABLE notifications ADD COLUMN category TEXT CHECK (category IN ('comment', 'like', 'deadline', 'collaboration', 'task_update', 'subtask_update', 'system'));
        -- Set default for existing rows if any
        UPDATE notifications SET category = 'system' WHERE category IS NULL;
        ALTER TABLE notifications ALTER COLUMN category SET NOT NULL;
    END IF;

    -- Add preferences to notification_settings if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_settings' AND column_name = 'preferences') THEN
        ALTER TABLE notification_settings ADD COLUMN preferences JSONB DEFAULT '{
            "comment": { "email": true, "in_app": true },
            "like": { "email": true, "in_app": true },
            "deadline": { "email": true, "in_app": true },
            "collaboration": { "email": true, "in_app": true },
            "task_update": { "email": true, "in_app": true },
            "subtask_update": { "email": true, "in_app": true },
            "system": { "email": true, "in_app": true }
        }'::jsonb;
    END IF;

    -- Drop old 'types' column if it exists (cleanup from previous version)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_settings' AND column_name = 'types') THEN
        ALTER TABLE notification_settings DROP COLUMN types;
    END IF;
    
    -- Drop old boolean columns if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_settings' AND column_name = 'email_notifications') THEN
        ALTER TABLE notification_settings DROP COLUMN email_notifications;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_settings' AND column_name = 'in_app_notifications') THEN
        ALTER TABLE notification_settings DROP COLUMN in_app_notifications;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Re-create policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notification settings"
  ON notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
  ON notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
  ON notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger logic
CREATE OR REPLACE FUNCTION public.handle_new_user_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_settings (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_notification_settings();
