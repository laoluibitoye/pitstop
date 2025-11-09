'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import { RoleBasedAccess } from '@/types'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  userRole: 'user' | 'admin' | null
  access: RoleBasedAccess
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
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
  signIn: async () => {},
  signUp: async () => {},
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
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
  
  // Add console logs to debug environment variables
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key exists:', !!supabaseAnonKey)
  
  // Create Supabase client with error handling
  const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

  useEffect(() => {
    // Always set loading to false after 2 seconds as fallback
    const loadingTimeout = setTimeout(() => {
      console.log('Auth loading timeout - setting loading to false')
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

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
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