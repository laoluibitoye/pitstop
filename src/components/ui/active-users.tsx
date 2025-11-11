'use client'

import { useState, useEffect } from 'react'
import { Users, Clock } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { simpleTrack } from '@/lib/analytics'

interface ActiveUser {
  id: string
  name: string
  type: 'user' | 'guest'
  lastActive: string
}

interface ActiveUsersProps {
  className?: string
  showTimestamp?: boolean
}

export function ActiveUsers({ className = '', showTimestamp = true }: ActiveUsersProps) {
  const { user } = useAuth()
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track user activity
  const trackUserActivity = () => {
    if (typeof window === 'undefined') return

    const userKey = user ? `user_${user.id}` : 'guest_session'
    const userName = user ? 
      (user.user_metadata?.full_name || user.email || 'Anonymous') : 
      (localStorage.getItem('guest_name') || 'Guest User')
    
    const activityData = {
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      type: user ? 'user' : 'guest'
    }

    // Store in localStorage for demo purposes
    try {
      const currentActivities = JSON.parse(localStorage.getItem('user_activities') || '[]')
      const updatedActivities = [...currentActivities.filter((a: any) => a.userKey !== userKey), {
        userKey,
        userName,
        ...activityData
      }]
      localStorage.setItem('user_activities', JSON.stringify(updatedActivities))
    } catch (err) {
      console.warn('Failed to track user activity:', err)
    }
  }

  // Get active users (simulated for demo)
  const fetchActiveUsers = () => {
    try {
      setLoading(true)
      
      // Get activities from localStorage (simulated data)
      const activities = JSON.parse(localStorage.getItem('user_activities') || '[]')
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      
      // Filter active users from last 5 minutes
      const activeActivities = activities.filter((activity: any) => 
        new Date(activity.timestamp) > fiveMinutesAgo
      )

      // Group by user and get latest activity
      const userMap = new Map()
      activeActivities.forEach((activity: any) => {
        if (!userMap.has(activity.userKey) || 
            new Date(activity.timestamp) > new Date(userMap.get(activity.userKey).lastActive)) {
          userMap.set(activity.userKey, {
            id: activity.userKey,
            name: activity.userName,
            type: activity.type,
            lastActive: activity.timestamp
          })
        }
      })

      setActiveUsers(Array.from(userMap.values()))
      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      setError('Failed to load active users')
      console.error('Error fetching active users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Track page activity on mount
    trackUserActivity()
    fetchActiveUsers()

    // Track activity on user interactions
    const events = ['click', 'keydown', 'scroll']
    const throttledTrack = throttle(trackUserActivity, 30000) // Track at most every 30s
    
    events.forEach(event => {
      document.addEventListener(event, throttledTrack, { passive: true })
    })

    // Update active users every 30 seconds
    const interval = setInterval(() => {
      fetchActiveUsers()
    }, 30000)

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledTrack)
      })
      clearInterval(interval)
    }
  }, [user])

  // Clean up old activities periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      try {
        const activities = JSON.parse(localStorage.getItem('user_activities') || '[]')
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const recentActivities = activities.filter((activity: any) => 
          new Date(activity.timestamp) > oneDayAgo
        )
        localStorage.setItem('user_activities', JSON.stringify(recentActivities))
      } catch (err) {
        console.warn('Failed to cleanup old activities:', err)
      }
    }, 5 * 60 * 1000) // Clean up every 5 minutes

    return () => clearInterval(cleanupInterval)
  }, [])

  // Format time ago
  const getTimeAgo = (date: string) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffMs = now.getTime() - activityDate.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    
    if (diffMinutes < 1) return 'just now'
    if (diffMinutes === 1) return '1m ago'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours === 1) return '1h ago'
    return `${diffHours}h ago`
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading && activeUsers.length === 0) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse flex items-center space-x-2">
          <div className="w-8 h-8 bg-muted rounded-full"></div>
          <div className="w-12 h-4 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 ${className}`} title={error}>
        <div className="w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center">
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-sm text-muted-foreground">--</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Active Users Avatar Group */}
      <div className="flex items-center -space-x-2">
        {activeUsers.slice(0, 3).map((activeUser, index) => (
          <div
            key={activeUser.id}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-background ${
              activeUser.type === 'user' 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                : 'bg-gradient-to-br from-green-500 to-green-600'
            }`}
            title={`${activeUser.name} (${getTimeAgo(activeUser.lastActive)})`}
            style={{ zIndex: 10 - index }}
          >
            {getInitials(activeUser.name)}
          </div>
        ))}
        
        {/* Count badge */}
        {activeUsers.length > 3 && (
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-background">
            +{activeUsers.length - 3}
          </div>
        )}
      </div>

      {/* Count and timestamp */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">
          {activeUsers.length === 0 ? 'No' : activeUsers.length} active
        </span>
        {showTimestamp && lastUpdate && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Updated {getTimeAgo(lastUpdate.toISOString())}</span>
          </div>
        )}
      </div>

      {/* Screen reader only text */}
      <span className="sr-only">
        {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'} currently active
      </span>
    </div>
  )
}

// Utility function for throttling
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }) as T
}