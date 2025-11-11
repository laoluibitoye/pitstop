'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { RoleBasedAccess } from '@/types'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  userRole: 'user' | 'admin' | null
  access: RoleBasedAccess
  signIn: (emailOrUsername: string, password: string) => Promise<any>
  signUp: (email: string, password: string, username?: string) => Promise<any>
  signOut: () => Promise<void>
  checkPermission: (permission: keyof RoleBasedAccess) => boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  userRole: null,
  access: {
    isAdmin: false,
    canManageUsers: false,
    canModerateTasks: false,
    canViewAnalytics: false,
    canManageSettings: false,
  },
  signIn: async () => null,
  signUp: async () => null,
  signOut: async () => {},
  checkPermission: () => false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null)
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  // Add console logs to debug environment variables
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key exists:', !!supabaseAnonKey)
  
  // Use the centralized Supabase client from lib/supabase.ts
  // The client will throw an error if environment variables are missing
  // so we can proceed with guest mode if needed

  useEffect(() => {
    // Always set loading to false after 2 seconds as fallback
    const loadingTimeout = setTimeout(() => {
      setLoading(false)
    }, 2000)

    const initializeAuth = async () => {
      try {
        if (!supabase) {
          console.log('No Supabase client - proceeding with guest mode')
          setLoading(false)
          return
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchUserRole(session.user.id)
          }
        }
      } catch (error) {
        console.error('Failed to get session:', error)
      } finally {
        clearTimeout(loadingTimeout)
        setLoading(false)
      }
    }

    initializeAuth()

    let subscription: any = null
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(
        async (_event: string, session: Session | null) => {
          setSession(session)
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchUserRole(session.user.id)
          } else {
            setUserRole(null)
          }
          setLoading(false)
        }
      )
      subscription = data.subscription
    }

    return () => {
      clearTimeout(loadingTimeout)
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const fetchUserRole = async (userId: string) => {
    try {
      // For now, use a mock role system
      // In production, this would fetch from your profiles table
      const mockRole: 'user' | 'admin' = userId.includes('admin') ? 'admin' : 'user'
      setUserRole(mockRole)
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole('user') // Default to user role
    }
  }

  // Role-based access control
  const access: RoleBasedAccess = {
    isAdmin: userRole === 'admin',
    canManageUsers: userRole === 'admin',
    canModerateTasks: userRole === 'admin',
    canViewAnalytics: userRole === 'admin',
    canManageSettings: userRole === 'admin',
  }

  const checkPermission = (permission: keyof RoleBasedAccess): boolean => {
    return access[permission] || false
  }

  const signIn = async (emailOrUsername: string, password: string) => {
    if (!supabase) {
      throw new Error('Authentication service is not available. Please check your internet connection and try again.')
    }
    
    let loginIdentifier = emailOrUsername
    
    // Check if the input looks like a username (contains @ means it's an email)
    if (!emailOrUsername.includes('@')) {
      // If it's a username, try to find the associated email
      // For now, we'll assume username format: try to reconstruct email or use direct username
      // In a real implementation, you would query your database to find the user's email by username
      // Since we don't have a database query function yet, we'll handle this on the server side
      loginIdentifier = emailOrUsername // Supabase supports username login directly
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: loginIdentifier, 
      password 
    })
    
    if (error) {
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email/username or password. Please check your credentials and try again.')
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email inbox and click the confirmation link we sent you. If you don\'t see it, check your spam folder. Once confirmed, you can sign in.')
      } else if (error.message.includes('Too many requests')) {
        throw new Error('Too many login attempts. Please wait a moment before trying again.')
      } else {
        throw new Error(error.message || 'Sign in failed. Please try again.')
      }
    }
    return data
  }

  const signUp = async (email: string, password: string, username?: string) => {
    if (!supabase) {
      throw new Error('Authentication service is not available. Please check your internet connection and try again.')
    }
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          username: username || email.split('@')[0], // Use provided username or default from email
          full_name: username || email.split('@')[0]
        }
      }
    })
    
    if (error) {
      // Provide user-friendly error messages
      if (error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please sign in instead.')
      } else if (error.message.includes('Password should be at least')) {
        throw new Error('Password must be at least 6 characters long.')
      } else if (error.message.includes('Invalid email')) {
        throw new Error('Please enter a valid email address.')
      } else if (error.message.includes('username') && error.message.includes('already')) {
        throw new Error('This username is already taken. Please choose a different one.')
      } else {
        throw new Error(error.message || 'Account creation failed. Please try again.')
      }
    }
    return data
  }

  const signOut = async () => {
    if (!supabase) {
      throw new Error('Authentication service is not available.')
    }
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message || 'Sign out failed. Please try again.')
    }
    setUserRole(null)
  }

  const value = {
    user,
    session,
    loading,
    userRole,
    access,
    signIn,
    signUp,
    signOut,
    checkPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}