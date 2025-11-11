// Enhanced TypeScript interfaces for Active Users feature

export interface UserActivity {
  userId: string
  userName: string
  userType: 'user' | 'guest'
  currentPage: string
  lastActivity: string
  isOnline: boolean
  avatarUrl?: string
  email?: string
  status: 'active' | 'idle' | 'offline'
  sessionId?: string
  deviceType?: 'desktop' | 'mobile' | 'tablet'
  browserInfo?: string
}

export interface ActivityEvent {
  userId: string
  eventType: 'page_view' | 'click' | 'scroll' | 'keydown' | 'focus' | 'blur'
  timestamp: string
  page: string
  data?: Record<string, any>
}

export interface UserPresence {
  userId: string
  isActive: boolean
  lastSeen: string
  currentPage: string
  activityLevel: 'high' | 'medium' | 'low'
  consecutiveActions: number
}

export interface ActiveUsersConfig {
  maxVisibleUsers: number
  activityWindowMinutes: number
  updateIntervalMs: number
  enableDeviceDetection: boolean
  showOfflineUsers: boolean
  enablePresenceIndicator: boolean
}

export interface UserProfile {
  id: string
  name: string
  email?: string
  type: 'user' | 'guest'
  avatarUrl?: string
  isOnline: boolean
  lastActivity: string
  currentPage: string
  presence: UserPresence
  activityHistory: ActivityEvent[]
  metadata: {
    deviceType?: 'desktop' | 'mobile' | 'tablet'
    browserInfo?: string
    location?: string
    sessionDuration?: number
  }
}

export interface ActiveUsersState {
  users: UserProfile[]
  isLoading: boolean
  error: string | null
  lastUpdate: string | null
  isConnected: boolean
  config: ActiveUsersConfig
}

export interface ActiveUsersActions {
  trackActivity: (event: Omit<ActivityEvent, 'timestamp'>) => void
  updateUserStatus: (userId: string, status: UserPresence['activityLevel']) => void
  removeUser: (userId: string) => void
  addUser: (user: Omit<UserProfile, 'activityHistory'>) => void
  refreshUsers: () => Promise<void>
  setConfig: (config: Partial<ActiveUsersConfig>) => void
}

export type ActiveUsersHook = ActiveUsersState & ActiveUsersActions

export interface UserListItemProps {
  user: UserProfile
  isOwnUser: boolean
  onUserClick?: (userId: string) => void
  showPresenceIndicator?: boolean
}

export interface ActiveUsersSidebarProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
  position?: 'left' | 'right'
  maxHeight?: string
  showSearch?: boolean
  onSearchChange?: (query: string) => void
}

export interface ActivityIndicatorProps {
  level: 'high' | 'medium' | 'low'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export interface UserStatusBadgeProps {
  status: UserPresence['activityLevel']
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}