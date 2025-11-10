import { createClient } from '@supabase/supabase-js'

// Securely load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create Supabase client with graceful error handling
let supabase: any = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error)
  }
}

export { supabase }

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  },

  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  }
}

// Database helper functions
export const db = {
  // Profiles
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  updateProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Tasks
  getTasks: async (filters?: any) => {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        category:categories(*),
        assigned_user:profiles!tasks_assigned_to_fkey(*),
        created_user:profiles!tasks_created_by_fkey(*),
        task_tags(
          tag:tags(*)
        )
      `)

    if (filters?.status) {
      query = query.in('status', filters.status)
    }
    if (filters?.priority) {
      query = query.in('priority', filters.priority)
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by)
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  createTask: async (task: any) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select(`
        *,
        category:categories(*),
        assigned_user:profiles!tasks_assigned_to_fkey(*),
        created_user:profiles!tasks_created_by_fkey(*)
      `)
      .single()
    return { data, error }
  },

  updateTask: async (taskId: string, updates: any) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select(`
        *,
        category:categories(*),
        assigned_user:profiles!tasks_assigned_to_fkey(*),
        created_user:profiles!tasks_created_by_fkey(*)
      `)
      .single()
    return { data, error }
  },

  deleteTask: async (taskId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    return { data, error }
  },

  // Categories
  getCategories: async (userId: string) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name')
    return { data, error }
  },

  createCategory: async (category: any) => {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()
    return { data, error }
  },

  // Tags
  getTags: async (userId: string) => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('name')
    return { data, error }
  },

  createTag: async (tag: any) => {
    const { data, error } = await supabase
      .from('tags')
      .insert(tag)
      .select()
      .single()
    return { data, error }
  },

  // Comments
  getComments: async (taskId: string) => {
    const { data, error } = await supabase
      .from('task_comments')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  createComment: async (comment: any) => {
    const { data, error } = await supabase
      .from('task_comments')
      .insert(comment)
      .select(`
        *,
        user:profiles(*)
      `)
      .single()
    return { data, error }
  },

  // Activity Logs
  getActivityLogs: async (userId: string, limit = 20) => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        user:profiles(*),
        task:tasks(title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  createActivityLog: async (log: any) => {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert(log)
    return { data, error }
  },

  // Guest Sessions
  createGuestSession: async (session: any) => {
    const { data, error } = await supabase
      .from('guest_sessions')
      .insert(session)
      .select()
      .single()
    return { data, error }
  },

  getGuestSession: async (sessionId: string) => {
    const { data, error } = await supabase
      .from('guest_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single()
    return { data, error }
  },

  updateGuestSession: async (sessionId: string, updates: any) => {
    const { data, error } = await supabase
      .from('guest_sessions')
      .update(updates)
      .eq('session_id', sessionId)
      .select()
      .single()
    return { data, error }
  }
}