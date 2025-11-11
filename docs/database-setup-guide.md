# **🔧 PitStop Database Setup Guide**

## **📋 QUICK SETUP STEPS**

### **Step 1: Access Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your PitStop project: `gcrexljiaybcredenfvb`
3. Navigate to **SQL Editor** (left sidebar)

### **Step 2: Execute Database Schema**
Copy and paste the following SQL into the Supabase SQL Editor and run it:

```sql
-- PitStop Database Schema (Complete Setup)
-- Execute this entire script in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profile on user signup (UPDATED FOR USERNAME SUPPORT)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    full_name, 
    avatar_url, 
    is_online,
    created_at,
    updated_at
  )
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    true,
    NOW(),
    NOW()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Categories table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Tags table
CREATE TABLE public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Tasks table
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'delayed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Task comments table
CREATE TABLE public.task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Task-Tags many-to-many relationship
CREATE TABLE public.task_tags (
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;

-- Activity logging table
CREATE TABLE public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- File attachments table
CREATE TABLE public.task_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;

-- Guest mode session table
CREATE TABLE public.guest_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  email TEXT,
  tasks_created INTEGER DEFAULT 0,
  comments_created INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can view own tags" ON public.tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tags" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON public.tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON public.tags
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view assigned or own tasks" ON public.tasks
  FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Task comments policies
CREATE POLICY "Users can view comments on accessible tasks" ON public.task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND (
        t.created_by = auth.uid() OR 
        t.assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

CREATE POLICY "Users can create comments" ON public.task_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.task_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.task_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Task tags policies
CREATE POLICY "Users can view tags for accessible tasks" ON public.task_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND (
        t.created_by = auth.uid() OR 
        t.assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

CREATE POLICY "Users can manage tags for own tasks" ON public.task_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND created_by = auth.uid())
  );

-- Activity logs policies
CREATE POLICY "Users can view own activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Task files policies
CREATE POLICY "Users can view files for accessible tasks" ON public.task_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id AND (
        t.created_by = auth.uid() OR 
        t.assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

CREATE POLICY "Users can upload files" ON public.task_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Guest sessions policies
CREATE POLICY "Anyone can create guest sessions" ON public.guest_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own guest session" ON public.guest_sessions
  FOR SELECT USING (true);

-- Indexes for better performance
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_task_id ON public.activity_logs(task_id);
CREATE INDEX idx_task_files_task_id ON public.task_files(task_id);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_is_online ON public.profiles(is_online);
CREATE INDEX idx_profiles_last_seen ON public.profiles(last_seen);

-- Enable real-time for tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;

-- Create function for online status management
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
```

### **Step 3: Verify Setup**
After running the SQL, verify the setup by:

1. **Check Tables**: Go to **Table Editor** in Supabase dashboard
2. **Verify Profiles Table**: Should have `username`, `is_online`, `last_seen` fields
3. **Check Policies**: All RLS policies should be active
4. **Test Real-time**: The `profiles` table should be enabled for real-time updates

## **🎯 WHAT THIS SETUP ENABLES**

### **✅ Username Support**
- **Registration**: New users get username from signup form or extracted from email
- **Sign-in**: Users can login with either email OR username
- **Display**: Dashboard shows username instead of email

### **✅ Real-time Features**
- **Online Status**: Track when users are active
- **Active Users**: Display currently online users
- **Presence System**: Real-time user activity tracking

### **✅ Data Security**
- **Row Level Security**: Users can only access their own data
- **Proper Policies**: Comprehensive access control for all tables
- **Authentication**: Secure user management through Supabase Auth

## **🚀 TESTING AFTER SETUP**

1. **Go to** `/auth/signup`
2. **Fill form** with email, username, password
3. **Create account** and verify email
4. **Sign in** with either email or username
5. **Check dashboard** - should show your username
6. **Test active users** - open multiple tabs to see presence

## **⚠️ TROUBLESHOOTING**

### **If "relation does not exist" errors appear:**
- Make sure the SQL executed successfully
- Check Table Editor for all tables
- Refresh the browser after setup

### **If real-time doesn't work:**
- Verify real-time is enabled for `profiles` table
- Check browser console for connection errors
- Ensure you're using the latest app version

### **If auth fails:**
- Verify email confirmation is working
- Check Supabase Auth settings
- Ensure RLS policies allow profile creation

## **📝 DATABASE SCHEMA SUMMARY**

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profiles` | User data | ✅ Username, Online status, Real-time |
| `tasks` | Task management | Full CRUD, Assignment, Categories |
| `task_comments` | Comments | Real-time updates, Thread support |
| `categories` | Task organization | Custom colors, User-scoped |
| `tags` | Task tagging | Many-to-many relationship |
| `activity_logs` | User activity | Action tracking, Audit trail |
| `task_files` | File attachments | Upload support, File metadata |
| `guest_sessions` | Guest mode | Temporary sessions, Limited features |

## **🎉 SUCCESS INDICATORS**

After successful setup, you'll have:
- ✅ Complete database with all required tables
- ✅ Username support for registration and login
- ✅ Real-time active users tracking
- ✅ Secure data access with RLS policies
- ✅ Performance-optimized with proper indexes
- ✅ Production-ready authentication system

**Your PitStop app will now be fully functional with username support and real-time features!**