'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  RotateCcw,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react'
import { UserProfile, ActiveUsersConfig } from '@/types/active-users'
import { UserProfileItem } from './user-profile-item'
import { useAuth } from '@/components/providers/auth-provider'

interface ActiveUsersSidebarProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
  position?: 'left' | 'right'
  maxHeight?: string
  showSearch?: boolean
  users?: UserProfile[]
  onUsersChange?: (users: UserProfile[]) => void
  isLoading?: boolean
  error?: string | null
  lastUpdate?: string | null
  isConnected?: boolean
}

export function ActiveUsersSidebar({
  isOpen,
  onToggle,
  className = '',
  position = 'right',
  maxHeight = '80vh',
  showSearch = true,
  users = [],
  onUsersChange,
  isLoading = false,
  error = null,
  lastUpdate = null,
  isConnected = true
}: ActiveUsersSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'user' | 'guest'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'activity' | 'status'>('activity')
  const [showSettings, setShowSettings] = useState(false)

  const { user } = useAuth()

  // Filter and sort users based on current criteria
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(user => user.type === filterType)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'activity':
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        case 'status':
          const statusOrder = { high: 0, medium: 1, low: 2, offline: 3 }
          return statusOrder[a.presence.activityLevel] - statusOrder[b.presence.activityLevel]
        default:
          return 0
      }
    })

    return filtered
  }, [users, searchQuery, filterType, sortBy])

  // Get user count statistics
  const stats = useMemo(() => {
    const total = users.length
    const usersOnly = users.filter(u => u.type === 'user').length
    const guestsOnly = users.filter(u => u.type === 'guest').length
    const online = users.filter(u => u.presence.isActive).length

    return { total, users: usersOnly, guests: guestsOnly, online }
  }, [users])

  // Auto-hide tooltip
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : (position === 'right' ? 320 : -320)
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className={`fixed top-0 ${position}-0 z-50 h-full w-80 bg-background border-${position} border-border shadow-xl ${
          className
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Active Users</h2>
              
              {/* Connection Status */}
              <div className={`flex items-center space-x-1 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Collapse Button */}
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                title="Collapse sidebar"
              >
                {position === 'right' ? (
                  <ChevronRight className="h-4 w-4 text-foreground" />
                ) : (
                  <ChevronLeft className="h-4 w-4 text-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="p-4 bg-muted/20 border-b border-border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{stats.total}</div>
                <div className="text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.online}</div>
                <div className="text-muted-foreground">Online</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.users}</div>
                <div className="text-muted-foreground">Users</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.guests}</div>
                <div className="text-muted-foreground">Guests</div>
              </div>
            </div>
            
            {lastUpdate && (
              <div className="text-xs text-muted-foreground text-center mt-2">
                Last updated: {new Date(lastUpdate).toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Controls */}
          {showSearch && (
            <div className="p-4 space-y-3 border-b border-border">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="flex space-x-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                >
                  <option value="all">All Users</option>
                  <option value="users">Users Only</option>
                  <option value="guests">Guests Only</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                >
                  <option value="activity">By Activity</option>
                  <option value="name">By Name</option>
                  <option value="status">By Status</option>
                </select>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight }}>
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                    <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <div className="text-red-500 mb-2">
                  <X className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Retry
                </button>
              </div>
            ) : filteredAndSortedUsers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {users.length === 0 ? 'No active users' : 'No users match your filters'}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                <AnimatePresence>
                  {filteredAndSortedUsers.map((userProfile) => (
                    <UserProfileItem
                      key={userProfile.id}
                      user={userProfile}
                      isOwnUser={user?.id === userProfile.id}
                      onUserClick={(userId) => {
                        // TODO: Implement user interaction
                        console.log('User clicked:', userId)
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Real-time updates</span>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Toggle Button (when sidebar is closed) */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={onToggle}
          className={`fixed ${position}-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-background border border-border rounded-full shadow-lg hover:shadow-xl transition-all duration-200`}
          title="Show active users"
        >
          <Users className="h-5 w-5 text-foreground" />
          
          {/* User count badge */}
          {users.length > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {users.length > 9 ? '9+' : users.length}
            </div>
          )}
        </motion.button>
      )}
    </>
  )
}