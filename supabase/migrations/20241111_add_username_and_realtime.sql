-- Migration: Add username support and real-time features
-- Created: 2024-11-11

-- Add username field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add real-time presence fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

-- Update handle_new_user function to include username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    full_name, 
    avatar_url, 
    is_online
  )
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create online status tracking function
CREATE OR REPLACE FUNCTION public.update_user_online_status()
RETURNS trigger AS $$
BEGIN
  -- Update online status when user signs in
  IF NEW.raw_user_meta_data->>'event_type' = 'SIGNED_IN' THEN
    UPDATE public.profiles 
    SET is_online = true, last_seen = NOW()
    WHERE id = NEW.id;
  END IF;
  
  -- Update offline status when user signs out
  IF NEW.raw_user_meta_data->>'event_type' = 'SIGNED_OUT' THEN
    UPDATE public.profiles 
    SET is_online = false, last_seen = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for online status updates
DROP TRIGGER IF EXISTS on_auth_user_online_status ON auth.users;
CREATE TRIGGER on_auth_user_online_status
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update existing profiles with usernames from email if not already set
UPDATE public.profiles 
SET username = split_part(email, '@', 1)
WHERE username IS NULL;

-- Create a view for active users (online in last 5 minutes)
CREATE OR REPLACE VIEW public.active_users AS
SELECT 
  id,
  email,
  username,
  full_name,
  avatar_url,
  is_online,
  last_seen,
  CASE 
    WHEN last_seen > NOW() - INTERVAL '5 minutes' AND is_online = true THEN true
    ELSE false
  END as is_recently_active
FROM public.profiles;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON public.profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles(last_seen);

-- Enable real-time for profiles table
ALTER publication supabase_realtime ADD TABLE public.profiles;

-- Create function to manually update online status (for page refresh/unload)
CREATE OR REPLACE FUNCTION public.set_user_online_status(user_id UUID, online_status BOOLEAN)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    is_online = online_status,
    last_seen = CASE WHEN online_status = false THEN NOW() ELSE last_seen END,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.set_user_online_status(UUID, BOOLEAN) TO anon, authenticated;

-- Add RLS policy for viewing active users
CREATE POLICY "Users can view active users" ON public.active_users
  FOR SELECT USING (auth.uid() IS NOT NULL);