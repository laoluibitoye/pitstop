'use client'

import { useState } from 'react'
import { UserCheck, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { userAnalytics, simpleTrack } from '@/lib/analytics'
import toast from 'react-hot-toast'

export function GuestModeButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)
  const [showNameInput, setShowNameInput] = useState(false)
  const [guestName, setGuestName] = useState('')
  const router = useRouter()

  const handleStartGuestMode = () => {
    setShowNameInput(true)
  }

  const handleSubmitGuestName = async () => {
    if (!guestName.trim()) {
      toast.error('Please enter your name to continue')
      return
    }

    setLoading(true)
    try {
      // Generate a simple guest session ID
      const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Track guest mode start
      userAnalytics.guestModeStarted(sessionId, 'landing_page')
      
      // Store guest session and name in localStorage
      localStorage.setItem('guest_session', sessionId)
      localStorage.setItem('guest_name', guestName.trim())
      
      // Redirect to guest dashboard
      router.push(`/dashboard?mode=guest&session=${sessionId}`)
      toast.success(`Welcome to PitStop, ${guestName.trim()}!`)
    } catch (error) {
      toast.error('Failed to start guest mode')
      // Track error
      simpleTrack('guest_mode_error', { error: String(error), timestamp: new Date().toISOString() })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitGuestName()
    }
  }

  const handleCancel = () => {
    setShowNameInput(false)
    setGuestName('')
  }

  return (
    <div className="relative">
      <motion.button
        onClick={handleStartGuestMode}
        disabled={loading}
        className={`glass-button px-6 py-3 border-2 border-blue-500/30 text-blue-600 dark:text-blue-400 font-semibold rounded-xl hover:bg-blue-500/10 transition-colors transform hover:scale-105 disabled:opacity-50 ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center space-x-2">
          <UserCheck className="h-4 w-4" />
          <span>Try Guest Mode</span>
        </div>
      </motion.button>

      <AnimatePresence>
        {showNameInput && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card p-4 z-50 border border-white/20"
          >
            <div className="mb-3">
              <label className="text-sm font-medium text-foreground mb-2 block">
                <User className="h-4 w-4 inline mr-1" />
                Enter your name to continue:
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Your name..."
                className="glass-input w-full px-3 py-2 text-sm rounded-lg border-none focus:outline-none"
                autoFocus
                maxLength={50}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSubmitGuestName}
                disabled={loading || !guestName.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Starting...' : 'Continue as Guest'}
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}