'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { UserProfile, ActivityEvent, ActiveUsersConfig, ActiveUsersState, ActiveUsersActions } from '@/types/active-users'
import { useAuth } from '@/components/providers/auth-provider'
import { simpleTrack } from '@/lib/analytics'

// Default configuration
const DEFAULT_CONFIG: ActiveUsersConfig = {
  maxVisibleUsers: 20,
  activityWindowMinutes: 5,
  updateIntervalMs: 30000,
  enableDeviceDetection: true,
  showOfflineUsers: false,
  enablePresenceIndicator: true
}

// Utility function for throttling
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean
  let lastFunc: NodeJS.Timeout | number
  let lastRan: number
  
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(null, args)
      lastRan = Date.now()
      inThrottle = true
    } else {
      clearTimeout(lastFunc as NodeJS.Timeout)
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(null, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }) as T
}

// Generate unique user ID
const generateUserId = (user: any, isGuestMode: boolean): string => {
  if (isGuestMode) {
    return `guest_${user?.email || 'anonymous'}`
  }
  return user?.id || 'anonymous'
}

export function useActiveUsers(config: Partial<ActiveUsersConfig> = {}): ActiveUsersState & ActiveUsersActions {
  const { user } = useAuth()
  const [state, setState] = useState<ActiveUsersState>({
    users: [],
    isLoading: true,
    error: null,
    lastUpdate: null,
    isConnected: true,
    config: { ...DEFAULT_CONFIG, ...config }
  })

  const eventListenersRef = useRef<Array<() => void>>([])
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get current page URL
  const getCurrentPage = useCallback(() => {
    if (typeof window === 'undefined') return '/'
    return window.location.pathname + window.location.search
  }, [])

  // Get user name and type
  const getUserInfo = useCallback(() => {
    const isGuestMode = localStorage.getItem('guest_session') !== null || 
                       window.location.search.includes('mode=guest')
    
    const userId = generateUserId(user, isGuestMode)
    const userName = isGuestMode 
      ? (localStorage.getItem('guest_name') || 'Guest User')
      : (user?.user_metadata?.full_name || user?.email || 'Anonymous')
    
    return {
      id: userId,
      name: userName,
      type: isGuestMode ? 'guest' as const : 'user' as const,
      email: user?.email || undefined
    }
  }, [user])

  // Track user activity
  const trackActivity = useCallback((event: Omit<ActivityEvent, 'timestamp'>) => {
    const now = new Date().toISOString()
    const eventData: ActivityEvent = {
      ...event,
      timestamp: now
    }

    // Store activity in localStorage
    try {
      const activities = JSON.parse(localStorage.getItem('user_activities') || '[]')
      activities.push(eventData)
      
      // Keep only recent activities (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const recentActivities = activities.filter((a: ActivityEvent) => a.timestamp > oneDayAgo)
      
      localStorage.setItem('user_activities', JSON.stringify(recentActivities))
    } catch (error) {
      console.warn('Failed to track activity:', error)
    }

    // Update analytics
    simpleTrack('user_activity', {
      event_type: event.eventType,
      page: event.page,
      user_type: getUserInfo().type
    })
  }, [getUserInfo])

  // Fetch and process active users
  const fetchActiveUsers = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // Get activities from localStorage
      const activities = JSON.parse(localStorage.getItem('user_activities') || '[]')
      const { maxVisibleUsers, activityWindowMinutes } = state.config
      
      const cutoffTime = new Date(Date.now() - activityWindowMinutes * 60 * 1000).toISOString()
      
      // Filter activities within the activity window
      const recentActivities = activities.filter((activity: ActivityEvent) => 
        activity.timestamp > cutoffTime
      )

      // Group activities by user and get latest activity
      const userMap = new Map<string, { 
        activities: ActivityEvent[], 
        lastActivity: string,
        userInfo: ReturnType<typeof getUserInfo>
      }>()

      // Process recent activities
      recentActivities.forEach((activity: ActivityEvent) => {
        const userId = activity.userId
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            activities: [],
            lastActivity: activity.timestamp,
            userInfo: getUserInfo()
          })
        }
        
        const userData = userMap.get(userId)!
        userData.activities.push(activity)
        if (activity.timestamp > userData.lastActivity) {
          userData.lastActivity = activity.timestamp
        }
      })

      // Convert to UserProfile objects
      const users: UserProfile[] = Array.from(userMap.entries()).slice(0, maxVisibleUsers).map(([userId, data]) => {
        const activityCount = data.activities.length
        const consecutiveActions = data.activities.length // Simplified for demo
        
        // Determine activity level based on recent actions
        let activityLevel: 'high' | 'medium' | 'low' = 'low'
        if (activityCount > 10) activityLevel = 'high'
        else if (activityCount > 3) activityLevel = 'medium'

        // Get device type (simplified detection)
        const deviceType = state.config.enableDeviceDetection 
          ? (navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop')
          : 'desktop'

        return {
          id: userId,
          name: data.userInfo.name,
          email: data.userInfo.email,
          type: data.userInfo.type,
          isOnline: true,
          lastActivity: data.lastActivity,
          currentPage: data.activities[data.activities.length - 1]?.page || '/',
          presence: {
            userId,
            isActive: true,
            lastSeen: data.lastActivity,
            currentPage: data.activities[data.activities.length - 1]?.page || '/',
            activityLevel,
            consecutiveActions
          },
          activityHistory: data.activities,
          metadata: {
            deviceType,
            browserInfo: navigator.userAgent,
            sessionDuration: Math.floor((Date.now() - new Date(data.lastActivity).getTime()) / 60000)
          }
        }
      })

      // Add current user if not already in the list
      const currentUserInfo = getUserInfo()
      const currentUserExists = users.some(u => u.id === currentUserInfo.id)
      
      if (!currentUserExists) {
        const now = new Date().toISOString()
        users.unshift({
          id: currentUserInfo.id,
          name: currentUserInfo.name,
          email: currentUserInfo.email,
          type: currentUserInfo.type,
          isOnline: true,
          lastActivity: now,
          currentPage: getCurrentPage(),
          presence: {
            userId: currentUserInfo.id,
            isActive: true,
            lastSeen: now,
            currentPage: getCurrentPage(),
            activityLevel: 'high',
            consecutiveActions: 1
          },
          activityHistory: [],
          metadata: {
            deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
            browserInfo: navigator.userAgent
          }
        })
      }

      setState(prev => ({
        ...prev,
        users,
        isLoading: false,
        lastUpdate: new Date().toISOString(),
        isConnected: true
      }))

    } catch (error) {
      console.error('Error fetching active users:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load active users',
        isConnected: false
      }))
    }
  }, [state.config, getUserInfo, getCurrentPage])

  // Update user status
  const updateUserStatus = useCallback((userId: string, status: 'high' | 'medium' | 'low') => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              presence: { ...user.presence, activityLevel: status },
              lastActivity: new Date().toISOString()
            }
          : user
      )
    }))
  }, [])

  // Remove user
  const removeUser = useCallback((userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.filter(user => user.id !== userId)
    }))
  }, [])

  // Add user
  const addUser = useCallback((userData: Omit<UserProfile, 'activityHistory'>) => {
    setState(prev => ({
      ...prev,
      users: [...prev.users, { ...userData, activityHistory: [] }]
    }))
  }, [])

  // Set configuration
  const setConfig = useCallback((newConfig: Partial<ActiveUsersConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...newConfig }
    }))
  }, [])

  // Refresh users
  const refreshUsers = useCallback(async () => {
    await fetchActiveUsers()
  }, [fetchActiveUsers])

  // Set up activity tracking
  useEffect(() => {
    if (typeof window === 'undefined') return

    const userInfo = getUserInfo()
    const currentPage = getCurrentPage()

    // Track initial page view
    trackActivity({
      userId: userInfo.id,
      eventType: 'page_view',
      page: currentPage
    })

    // Set up throttled event listeners
    const throttledTrack = throttle((eventType: ActivityEvent['eventType'], data?: Record<string, any>) => {
      trackActivity({
        userId: userInfo.id,
        eventType,
        page: getCurrentPage(),
        data
      })
    }, 10000) // Track at most every 10 seconds

    // Add event listeners
    const events: Array<[string, EventListener]> = [
      ['click', () => throttledTrack('click')],
      ['keydown', () => throttledTrack('keydown')],
      ['scroll', () => throttledTrack('scroll')],
      ['focus', () => throttledTrack('focus')],
      ['blur', () => throttledTrack('blur')]
    ]

    events.forEach(([eventName, handler]) => {
      document.addEventListener(eventName, handler, { passive: true })
      eventListenersRef.current.push(() => {
        document.removeEventListener(eventName, handler)
      })
    })

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        throttledTrack('blur')
      } else {
        throttledTrack('focus')
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    eventListenersRef.current.push(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })

    // Set up periodic updates
    updateIntervalRef.current = setInterval(fetchActiveUsers, state.config.updateIntervalMs)

    // Set up cleanup interval (remove old activities)
    cleanupIntervalRef.current = setInterval(() => {
      try {
        const activities = JSON.parse(localStorage.getItem('user_activities') || '[]')
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const recentActivities = activities.filter((a: ActivityEvent) => a.timestamp > oneDayAgo)
        localStorage.setItem('user_activities', JSON.stringify(recentActivities))
      } catch (error) {
        console.warn('Failed to cleanup old activities:', error)
      }
    }, 5 * 60 * 1000) // Clean up every 5 minutes

    // Initial fetch
    fetchActiveUsers()

    return () => {
      // Cleanup event listeners
      eventListenersRef.current.forEach(cleanup => cleanup())
      eventListenersRef.current = []
      
      // Clear intervals
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current)
      if (cleanupIntervalRef.current) clearInterval(cleanupIntervalRef.current)
    }
  }, [getUserInfo, getCurrentPage, trackActivity, fetchActiveUsers, state.config.updateIntervalMs])

  return {
    ...state,
    trackActivity,
    updateUserStatus,
    removeUser,
    addUser,
    refreshUsers,
    setConfig
  }
}