# Vercel Deployment Configuration Guide

## Environment Variables Setup for Vercel

To fix the "authentication service is not available" error, you need to configure the environment variables in your Vercel dashboard.

### Step 1: Access Vercel Environment Variables

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your PitStop project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Required Environment Variables

Add the following environment variables in Vercel:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://gcrexljiaybcredenfvb.supabase.co`
- **Environment**: Select all environments (Development, Preview, Production)

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcmV4bGppYXliY3JlZGVuZnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MTY3MTcsImV4cCI6MjA3ODI5MjcxN30.coEDZkco2W2tjdEV3uvR5XfROpfcaUVt0rcZhUdjEq4`
- **Environment**: Select all environments (Development, Preview, Production)

### Step 3: Redeploy

After adding the environment variables:
1. Go to the **Deployments** tab in Vercel
2. Click **Redeploy** on your latest deployment
3. Wait for the redeployment to complete

### Step 4: Verify the Fix

Once redeployed, test the authentication:
1. Visit your deployed app
2. Navigate to `/auth/signup`
3. Try to create a new account
4. You should no longer see the "authentication service is not available" error

## Alternative: Using Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter: https://gcrexljiaybcredenfvb.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcmV4bGppYXliY3JlZGVuZnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MTY3MTcsImV4cCI6MjA3ODI5MjcxN30.coEDZkco2W2tjdEV3uvR5XfROpfcaUVt0rcZhUdjEq4

# Redeploy
vercel --prod
```

## Troubleshooting

If you still see issues after adding environment variables:

1. **Check Vercel Build Logs**: Look for any build errors
2. **Verify Variable Names**: Make sure the variable names match exactly (case-sensitive)
3. **Clear Browser Cache**: Hard refresh your browser (Ctrl+F5)
4. **Check Supabase Settings**: Ensure your Supabase project allows anonymous access

## Security Notes

- The anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is safe to expose publicly
- This key only has limited permissions and cannot access sensitive data
- For production, ensure Row Level Security is enabled in your Supabase database
- Consider setting up email confirmation in Supabase Auth settings

## Current Status

- ✅ Supabase project URL: `https://gcrexljiaybcredenfvb.supabase.co`
- ✅ Supabase anon key: Configured and ready
- ✅ Application code: Updated with proper error handling
- ⏳ Vercel environment variables: **NEEDS TO BE CONFIGURED**

Once you complete the Vercel environment variable setup, the authentication will work correctly on your deployed application.