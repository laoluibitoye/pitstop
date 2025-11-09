# Secure Database Setup for PitStop

## 🔐 Database Configuration

Your database is already configured at:
- **Database URL**: `postgresql://postgres:xSHonjyzhlbMMcb0@db.gcrexljiaybcredenfvb.supabase.co:5432/postgres`
- **Supabase Project**: `gcrexljiaybcredenfvb.supabase.co`

## 🛠 Required API Keys

To complete the secure connection, you need to get the API keys from your Supabase dashboard:

### 1. Get Your Supabase API Keys
1. Go to [supabase.com](https://supabase.com/dashboard)
2. Select your project: `gcrexljiaybcredenfvb`
3. Go to **Settings** → **API**
4. Copy the following keys:
   - **anon public** (this is safe for client-side)
   - **service_role** (this is for server-side only - keep secret!)

### 2. Update Environment Variables
Replace the placeholder keys in `.env.local` with your real keys:

```env
# Replace these placeholder values with your real keys from Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://gcrexljiaybcredenfvb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_real_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_real_service_role_key_here
```

## 🔒 Security Best Practices

### Environment Variables Protection
- ✅ Never commit `.env.local` to Git
- ✅ Use different keys for development/production
- ✅ Rotate API keys regularly
- ✅ Enable Row Level Security (RLS) in Supabase

### Database Security
- ✅ Use Supabase client library (not direct PostgreSQL)
- ✅ Implement user authentication
- ✅ Set up Row Level Security policies
- ✅ Enable SSL connections
- ✅ Limit database access to authenticated users only

## 📊 Database Schema

The PitStop application expects these tables:
- `profiles` - User profiles
- `tasks` - Task management
- `categories` - Task categories
- `tags` - Task tags
- `task_comments` - Task comments
- `activity_logs` - User activity tracking
- `guest_sessions` - Guest mode sessions

## 🚀 Testing the Connection

Once you've added the real API keys:

1. **Restart the development server**
2. **Test authentication** - Try signing up/logging in
3. **Test database operations** - Create a task in the dashboard
4. **Verify real-time sync** - Open multiple browser tabs

## 🔧 Troubleshooting

### Common Issues
- **"Invalid API key"** - Check that you copied the complete key from Supabase
- **"Database connection failed"** - Verify the Supabase URL is correct
- **"Row Level Security violation"** - Ensure RLS policies are set up correctly

### Support
- Check the [Supabase documentation](https://supabase.com/docs)
- Verify your project is active in the Supabase dashboard
- Ensure billing is set up (if required for your project size)

## 🛡 Production Deployment

For production deployment on Vercel:
1. Add environment variables in Vercel dashboard
2. Use production API keys
3. Enable Supabase production features
4. Set up monitoring and backups

## 📝 Next Steps

1. Get your real API keys from Supabase dashboard
2. Update `.env.local` with the real keys
3. Test the connection
4. Deploy to production

**Security Note**: The PostgreSQL connection string you provided should be used internally by Supabase only. The web application will connect through the Supabase client library with the API keys.