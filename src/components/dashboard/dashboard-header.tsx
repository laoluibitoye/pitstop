'use client'

import { motion } from 'framer-motion'
import { User, Clock, Settings, Home, LogOut, LogIn, Moon, Sun } from 'lucide-react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { useAuth } from '@/components/providers/auth-provider'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'

interface DashboardHeaderProps {
  isGuestMode: boolean
  user?: SupabaseUser | null
  taskCount: number
}

export function DashboardHeader({ isGuestMode, user, taskCount }: DashboardHeaderProps) {
  const { signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between w-full"
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
          {isGuestMode ? (
            <span className="text-white font-bold text-xl">G</span>
          ) : (
            <User className="h-6 w-6 text-white" />
          )}
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-primary-900 dark:text-dark-text">
            {isGuestMode ? 'Guest Mode' : 'Dashboard'}
          </h1>
          <div className="flex items-center space-x-2 text-sm text-primary-600 dark:text-primary-300">
            <Clock className="h-4 w-4" />
            <span>{taskCount} active tasks</span>
            {isGuestMode && (
              <>
                <span>•</span>
                <span className="text-accent-blue-600">Limited Access</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation and User Actions */}
      <div className="flex items-center space-x-4">
        {/* Home Navigation */}
        <button
          onClick={handleGoHome}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary-100 dark:bg-primary-800 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors"
          title="Go to Home"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* User Info and Authentication */}
        {isGuestMode ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-primary-600 dark:text-primary-300">Guest</span>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push('/auth/signin')}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-accent-blue-500 hover:bg-accent-blue-600 text-white rounded-lg transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-primary-600 dark:text-primary-300">
              Welcome, {user.user_metadata?.full_name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => router.push('/auth/signin')}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}