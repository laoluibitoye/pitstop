'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Lock, Users, Eye, EyeOff } from 'lucide-react'

interface PrivacyControlsProps {
  visibility: 'public' | 'private'
  onVisibilityChange: (visibility: 'public' | 'private') => void
  className?: string
}

export function PrivacyControls({ visibility, onVisibilityChange, className }: PrivacyControlsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors"
        title="Task Privacy Settings"
      >
        {visibility === 'public' ? (
          <>
            <Globe className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-foreground">Public</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-foreground">Private</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg p-4 z-20 min-w-[280px]"
            >
              <h3 className="font-medium text-foreground mb-3">Task Privacy</h3>
              
              <div className="space-y-3">
                {/* Public Option */}
                <button
                  onClick={() => {
                    onVisibilityChange('public')
                    setIsOpen(false)
                  }}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    visibility === 'public'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">Public</div>
                      <div className="text-sm text-muted-foreground">
                        Visible to all users on the public dashboard
                      </div>
                    </div>
                    {visibility === 'public' && (
                      <Eye className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                </button>

                {/* Private Option */}
                <button
                  onClick={() => {
                    onVisibilityChange('private')
                    setIsOpen(false)
                  }}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    visibility === 'private'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Lock className="h-5 w-5 text-orange-500" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">Private</div>
                      <div className="text-sm text-muted-foreground">
                        Only visible to you and selected collaborators
                      </div>
                    </div>
                    {visibility === 'private' && (
                      <EyeOff className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  You can change this setting anytime. Public tasks will appear on the community dashboard.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}