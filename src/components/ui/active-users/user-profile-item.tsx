'use client'

import { motion } from 'framer-motion'
import { User, MessageCircle, Settings, Clock, Monitor, Smartphone, Tablet } from 'lucide-react'
import { UserProfile, UserPresence } from '@/types/active-users'

interface UserProfileItemProps {
  user: UserProfile
  isOwnUser: boolean
  onUserClick?: (userId: string) => void
  className?: string
}

export function UserProfileItem({ user, isOwnUser, onUserClick, className = '' }: UserProfileItemProps) {
  // Get user's initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get status color and icon
  const getStatusInfo = (presence: UserPresence) => {
    switch (presence.activityLevel) {
      case 'high':
        return {
          color: 'bg-green-500',
          label: 'Active now',
          pulse: true
        }
      case 'medium':
        return {
          color: 'bg-yellow-500',
          label: 'Active',
          pulse: false
        }
      case 'low':
        return {
          color: 'bg-orange-500',
          label: 'Idle',
          pulse: false
        }
      default:
        return {
          color: 'bg-gray-400',
          label: 'Offline',
          pulse: false
        }
    }
  }

  // Get device icon
  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-3 w-3" />
      case 'tablet':
        return <Tablet className="h-3 w-3" />
      case 'desktop':
      default:
        return <Monitor className="h-3 w-3" />
    }
  }

  // Format time since last activity
  const getTimeSinceActivity = (timestamp: string) => {
    const now = new Date()
    const activityDate = new Date(timestamp)
    const diffMs = now.getTime() - activityDate.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    
    if (diffMinutes < 1) return 'just now'
    if (diffMinutes === 1) return '1 minute ago'
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  // Get current page display name
  const getPageDisplayName = (page: string) => {
    if (page.includes('/dashboard')) return 'Dashboard'
    if (page.includes('/tasks')) return 'Tasks'
    if (page.includes('/auth')) return 'Authentication'
    if (page === '/') return 'Home'
    return page.replace(/^\//, '').replace(/-/g, ' ') || 'Unknown'
  }

  const statusInfo = getStatusInfo(user.presence)
  const currentPageDisplay = getPageDisplayName(user.currentPage)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-all duration-200 ${
        isOwnUser ? 'ring-2 ring-blue-500/20' : ''
      } ${className}`}
      onClick={() => onUserClick?.(user.id)}
    >
      {/* User Avatar with Status Indicator */}
      <div className="relative flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
          user.type === 'user' 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
            : 'bg-gradient-to-br from-green-500 to-green-600'
        }`}>
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(user.name)
          )}
        </div>
        
        {/* Online Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${statusInfo.color} ${
          statusInfo.pulse ? 'animate-pulse' : ''
        }`} />
        
        {/* Own User Indicator */}
        {isOwnUser && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="h-2 w-2 text-white" />
          </div>
        )}
      </div>

      {/* User Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-foreground truncate">
            {user.name}
            {isOwnUser && <span className="text-blue-500 ml-1">(You)</span>}
          </p>
          
          {/* Type Badge */}
          <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
            user.type === 'user' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {user.type}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 mt-1">
          {/* Status */}
          <span className="text-xs text-muted-foreground">
            {statusInfo.label}
          </span>
          
          {/* Current Page */}
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground truncate">
            {currentPageDisplay}
          </span>
        </div>
        
        {/* Device and Time Info */}
        <div className="flex items-center space-x-3 mt-1">
          {user.metadata.deviceType && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getDeviceIcon(user.metadata.deviceType)}
              <span className="capitalize">{user.metadata.deviceType}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{getTimeSinceActivity(user.lastActivity)}</span>
          </div>
        </div>
      </div>

      {/* Action Menu (appears on hover) */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center space-x-1">
          <button 
            className="p-1 rounded-full hover:bg-accent transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Add message action
            }}
            title="Send message"
          >
            <MessageCircle className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          </button>
          
          {!isOwnUser && (
            <button 
              className="p-1 rounded-full hover:bg-accent transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // TODO: Add view profile action
              }}
              title="View profile"
            >
              <Settings className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Tooltip on hover */}
      <div className="absolute top-full left-0 mt-2 p-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 min-w-64">
        <div className="text-sm">
          <p className="font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {user.type === 'user' ? (user.email || 'No email') : 'Guest User'}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Current page:</span> {currentPageDisplay}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Last active:</span> {getTimeSinceActivity(user.lastActivity)}
            </p>
            {user.presence.consecutiveActions > 0 && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Actions:</span> {user.presence.consecutiveActions}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}