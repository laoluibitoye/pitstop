'use client'

import { motion } from 'framer-motion'
import { User, Clock, Settings } from 'lucide-react'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface DashboardHeaderProps {
  isGuestMode: boolean
  user?: SupabaseUser | null
  taskCount: number
}

export function DashboardHeader({ isGuestMode, user, taskCount }: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-4"
    >
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
      
      {!isGuestMode && user && (
        <div className="ml-auto flex items-center space-x-2 text-sm text-primary-600 dark:text-primary-300">
          <span>Welcome, {user.user_metadata?.full_name || user.email}</span>
          <Settings className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  )
}