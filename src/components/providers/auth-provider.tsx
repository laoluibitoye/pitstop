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
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  useEffect(() => {
    const getInitialSession = async () => {
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
      setLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
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

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
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