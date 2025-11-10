# 🚀 PitStop Deployment Guide

## Quick Deploy to Vercel

### 1. Prerequisites
- Vercel account (free)
- GitHub repository with your PitStop code
- Supabase project (free tier available)

### 2. Environment Variables Setup

Before deploying, you need to configure these environment variables in Vercel:

**Required Environment Variables:**
```bash
# Supabase Configuration (Critical - Get from your Supabase project)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional for enhanced functionality
NEXTAUTH_URL=https://your-app.vercel.app
```

**Where to find Supabase credentials:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Vercel Deployment Steps

#### Option A: Deploy via Vercel Dashboard
1. Visit [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables in the deploy settings:
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from your project root)
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Redeploy with environment variables
vercel --prod
```

### 4. Post-Deployment Configuration

#### Verify Environment Variables
After deployment, check your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Verify both Supabase variables are set correctly

#### Test Authentication
1. Visit your deployed app
2. Try signing up for a new account
3. Verify the signup process works without "client not initialized" errors

#### Test Guest Mode
1. Try the guest mode functionality
2. Verify task creation and management works
3. Check that all UI elements load properly

### 5. Custom Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Update `NEXTAUTH_URL` environment variable to match your domain
4. DNS will be configured automatically

### 6. Supabase Database Setup

If your Supabase project is new, you may need to set up the database schema:

```sql
-- Run these SQL commands in your Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

### 7. Troubleshooting

#### Common Issues & Solutions

**"Supabase client not initialized" Error:**
- ✅ **FIXED**: Environment variable name changed from `SUPABASE_ANON_KEY` to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ensure both Supabase variables are set in Vercel environment settings
- Redeploy after adding environment variables

**Authentication not working:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the anon/public key (not service_role)
- Ensure Supabase authentication is enabled in your project settings

**Build failures:**
- Clear Vercel build cache: Go to Deployments → Clear Cache
- Check for missing environment variables
- Verify all TypeScript errors are resolved locally first

**Environment variables not loading:**
- Environment variables are only available in the deployed app, not in local development
- Use `.env.local` file for local development (not committed to git)
- Environment variable names must match exactly (case-sensitive)

### 8. Production Checklist

- [ ] Environment variables configured in Vercel
- [ ] Supabase project setup with database schema
- [ ] Authentication working (signup/login)
- [ ] Guest mode functionality tested
- [ ] Task creation and management working
- [ ] UI/UX elements loading properly
- [ ] Mobile responsiveness verified
- [ ] Error handling tested

### 9. Support

If you encounter issues:

1. Check the Vercel function logs in the dashboard
2. Verify environment variables are set correctly
3. Test locally with production build: `npm run build && npm start`
4. Check Supabase project settings and RLS policies

---

**Deployment Success!** 🎉

Your PitStop app should now be fully functional on Vercel with proper Supabase integration!