'use client'

import { useState } from 'react'
import { UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { userAnalytics, simpleTrack } from '@/lib/analytics'
import toast from 'react-hot-toast'

export function GuestModeButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGuestMode = async () => {
    setLoading(true)
    try {
      // Generate a simple guest session ID
      const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Track guest mode start
      userAnalytics.guestModeStarted(sessionId, 'landing_page')
      
      // Store guest session in localStorage for now
      localStorage.setItem('guest_session', sessionId)
      
      // Redirect to guest dashboard
      router.push(`/dashboard?mode=guest&session=${sessionId}`)
      toast.success('Welcome to PitStop Guest Mode!')
    } catch (error) {
      toast.error('Failed to start guest mode')
      // Track error
      simpleTrack('guest_mode_error', { error: String(error), timestamp: new Date().toISOString() })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGuestMode}
      disabled={loading}
      className={`px-6 py-3 border-2 border-accent-blue-500 text-white font-semibold rounded-xl hover:bg-accent-blue-50 dark:hover:bg-accent-blue-900/20 transition-colors transform hover:scale-105 disabled:opacity-50 ${className}`}
    >
      <div className="flex items-center space-x-2">
        <UserCheck className="h-4 w-4" />
        <span>{loading ? 'Loading...' : 'Try Guest Mode'}</span>
      </div>
      <div className="text-xs mt-1.5 opacity-75"> 1 task • 3 comments</div>
    </button>
  )
}