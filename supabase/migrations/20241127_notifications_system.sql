-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'email')),
  category TEXT NOT NULL CHECK (category IN ('comment', 'like', 'deadline', 'collaboration', 'task_update', 'subtask_update', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  preferences JSONB DEFAULT '{
    "comment": { "email": true, "in_app": true },
    "like": { "email": true, "in_app": true },
    "deadline": { "email": true, "in_app": true },
    "collaboration": { "email": true, "in_app": true },
    "task_update": { "email": true, "in_app": true },
    "subtask_update": { "email": true, "in_app": true },
    "system": { "email": true, "in_app": true }
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for notification_settings
CREATE POLICY "Users can view their own notification settings"
  ON notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
  ON notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings"
  ON notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger to create default settings for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_settings (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_notification_settings();
