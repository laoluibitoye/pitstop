'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Plus,
  Home,
  Settings,
  Search,
  Filter,
  Grid,
  Bell,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ArrowLeft,
  Users
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useTheme } from 'next-themes'
import { TaskList } from '@/components/tasks/task-list'
import { TaskFilterRow } from '@/components/tasks/task-filter-row'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { ActiveUsersSidebar } from '@/components/ui/active-users/active-users-sidebar'
import { useActiveUsers } from '@/hooks/use-active-users'
import { Task } from '@/types'
import { ThemeToggle } from '@/components/theme-toggle'

type TaskStatus = 'ongoing' | 'completed' | 'delayed' | 'cancelled'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

interface TaskFilters {
  status: TaskStatus[]
  priority: TaskPriority[]
  category_id: string
  created_date_from?: string
  created_date_to?: string
  updated_date_from?: string
  updated_date_to?: string
}

export function DashboardContentWithSuspense({
  initialGuestName = null,
  initialIsGuestMode = false
}: {
  initialGuestName?: string | null,
  initialIsGuestMode?: boolean
} = {}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeUsersSidebarOpen, setActiveUsersSidebarOpen] = useState(false)

  // Initialize Active Users hook
  const activeUsers = useActiveUsers({
    maxVisibleUsers: 20,
    activityWindowMinutes: 5,
    updateIntervalMs: 30000,
    enableDeviceDetection: true
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [guestName, setGuestName] = useState<string | null>(initialGuestName)
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    category_id: '',
    created_date_from: '',
    created_date_to: '',
    updated_date_from: '',
    updated_date_to: '',
  })

  const { user, loading: authLoading, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isGuestMode = searchParams.get('mode') === 'guest' || initialIsGuestMode

  useEffect(() => {
    // Only access localStorage on client side
    if (isGuestMode && typeof window !== 'undefined' && window.localStorage) {
      try {
        let guestName = localStorage.getItem('guest_name')
        if (!guestName) {
          guestName = 'Guest User'
          localStorage.setItem('guest_name', guestName)
        }
        setGuestName(guestName)
      } catch (error) {
        console.warn('localStorage not available:', error)
        setGuestName('Guest User')
      }
    }
    
    // Initialize demo activity data for active users feature
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const existingActivities = localStorage.getItem('user_activities')
        if (!existingActivities) {
          const demoActivities = [
            {
              userKey: 'demo_user_1',
              userName: 'Sarah Johnson',
              timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
              page: '/dashboard',
              type: 'user'
            },
            {
              userKey: 'demo_user_2',
              userName: 'Mike Chen',
              timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 minutes ago
              page: '/tasks',
              type: 'user'
            },
            {
              userKey: 'demo_guest_1',
              userName: 'Guest Explorer',
              timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 minute ago
              page: '/dashboard?mode=guest',
              type: 'guest'
            }
          ]
          localStorage.setItem('user_activities', JSON.stringify(demoActivities))
        }
      } catch (error) {
        console.warn('Failed to initialize demo activities:', error)
      }
    }
  }, [isGuestMode])

  useEffect(() => {
    // Only redirect if not in guest mode and no user
    if (!authLoading && !user && !isGuestMode) {
      router.push('/')
      return
    }

    // Load tasks based on mode
    loadTasks()
  }, [user, authLoading, isGuestMode])

  // Filter tasks based on search query and filters
  const filteredTasks = tasks.filter(task => {
    // Text search
    const matchesSearch = !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Status filter
    const matchesStatus = filters.status.length === 0 || filters.status.includes(task.status)
    
    // Priority filter
    const matchesPriority = filters.priority.length === 0 || filters.priority.includes(task.priority)
    
    // Created date filter
    let matchesCreatedDate = true
    if (filters.created_date_from || filters.created_date_to) {
      const taskCreatedDate = new Date(task.created_at)
      if (filters.created_date_from) {
        const fromDate = new Date(filters.created_date_from)
        matchesCreatedDate = matchesCreatedDate && taskCreatedDate >= fromDate
      }
      if (filters.created_date_to) {
        const toDate = new Date(filters.created_date_to)
        toDate.setHours(23, 59, 59, 999) // Include the entire day
        matchesCreatedDate = matchesCreatedDate && taskCreatedDate <= toDate
      }
    }
    
    // Updated date filter
    let matchesUpdatedDate = true
    if (filters.updated_date_from || filters.updated_date_to) {
      const taskUpdatedDate = new Date(task.updated_at)
      if (filters.updated_date_from) {
        const fromDate = new Date(filters.updated_date_from)
        matchesUpdatedDate = matchesUpdatedDate && taskUpdatedDate >= fromDate
      }
      if (filters.updated_date_to) {
        const toDate = new Date(filters.updated_date_to)
        toDate.setHours(23, 59, 59, 999) // Include the entire day
        matchesUpdatedDate = matchesUpdatedDate && taskUpdatedDate <= toDate
      }
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCreatedDate && matchesUpdatedDate
  })

  // Update tasks when filters change
  useEffect(() => {
    if (searchQuery || filters.status.length > 0 || filters.priority.length > 0) {
      // Don't reload from storage, just filter existing tasks
      // This keeps the state in sync without additional API calls
    }
  }, [searchQuery, filters, tasks])

  // Auto-update overdue tasks
  useEffect(() => {
    if (tasks.length === 0) return

    const checkOverdueTasks = () => {
      const now = new Date()
      const updatedTasks = tasks.map(task => {
        if (
          task.status === 'ongoing' &&
          task.due_date &&
          new Date(task.due_date) < now
        ) {
          return {
            ...task,
            status: 'delayed' as const,
            updated_at: new Date().toISOString()
          }
        }
        return task
      })

      const hasChanges = updatedTasks.some((task, index) =>
        task.status !== tasks[index].status
      )

      if (hasChanges) {
        setTasks(updatedTasks)
        
        // Save to localStorage if guest mode
        if (isGuestMode) {
          localStorage.setItem('guest_tasks', JSON.stringify(updatedTasks))
        }
      }
    }

    // Check immediately
    checkOverdueTasks()

    // Check every minute
    const interval = setInterval(checkOverdueTasks, 60000)

    return () => clearInterval(interval)
  }, [tasks, isGuestMode])

  const loadTasks = async () => {
    setLoading(true)
    try {
      if (isGuestMode) {
        // Load guest tasks from localStorage
        let guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]')
        
        // Add sample tasks if no tasks exist
        if (guestTasks.length === 0 && typeof window !== 'undefined') {
          const sampleTasks = [
            {
              id: 'sample_1',
              title: 'Welcome to PitStop!',
              description: 'This is your first task. You can edit, complete, or delete it. Click to view details!',
              status: 'ongoing',
              priority: 'medium',
              visibility: 'public',
              created_by: 'guest',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              position: 0,
              comments: [
                {
                  id: 'comment_1',
                  task_id: 'sample_1',
                  user_id: 'system',
                  content: 'This is a comment on the task!',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  user: {
                    id: 'system',
                    email: 'system@pitstop.com',
                    full_name: 'System',
                    role: 'user',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }
                }
              ],
              sub_tasks: [
                {
                  id: 'sub_1',
                  task_id: 'sample_1',
                  title: 'Review welcome message',
                  description: 'Read through the welcome instructions',
                  status: 'completed',
                  position: 0,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  completed_at: new Date().toISOString()
                },
                {
                  id: 'sub_2',
                  task_id: 'sample_1',
                  title: 'Create your first task',
                  description: 'Click the Create New Task button',
                  status: 'ongoing',
                  position: 1,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ]
            },
            {
              id: 'sample_2',
              title: 'Try creating a new task',
              description: 'Click the "Create New Task" button to add your own tasks. You can also delete tasks!',
              status: 'completed',
              priority: 'low',
              visibility: 'private',
              created_by: 'guest',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              position: 1,
              comments: [
                {
                  id: 'comment_2',
                  task_id: 'sample_2',
                  user_id: 'system',
                  content: 'Great job completing this task!',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  user: {
                    id: 'system',
                    email: 'system@pitstop.com',
                    full_name: 'System',
                    role: 'user',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }
                },
                {
                  id: 'comment_3',
                  task_id: 'sample_2',
                  user_id: 'system',
                  content: 'You can add multiple comments to tasks!',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  user: {
                    id: 'system',
                    email: 'system@pitstop.com',
                    full_name: 'System',
                    role: 'user',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }
                }
              ],
              sub_tasks: []
            },
            {
              id: 'sample_3',
              title: 'Explore the features',
              description: 'Try the search, filters, and different view modes. Tasks are now only in grid view!',
              status: 'ongoing',
              priority: 'high',
              visibility: 'public',
              created_by: 'guest',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              position: 2,
              comments: [],
              sub_tasks: [
                {
                  id: 'sub_3',
                  task_id: 'sample_3',
                  title: 'Test search functionality',
                  description: 'Use the search bar to find tasks',
                  status: 'completed',
                  position: 0,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  completed_at: new Date().toISOString()
                },
                {
                  id: 'sub_4',
                  task_id: 'sample_3',
                  title: 'Try filter options',
                  description: 'Use status and priority filters',
                  status: 'completed',
                  position: 1,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  completed_at: new Date().toISOString()
                },
                {
                  id: 'sub_5',
                  task_id: 'sample_3',
                  title: 'Click on task cards',
                  description: 'Tasks are now clickable and lead to detail pages',
                  status: 'ongoing',
                  position: 2,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ]
            }
          ]
          localStorage.setItem('guest_tasks', JSON.stringify(sampleTasks))
          guestTasks = sampleTasks
        }
        
        setTasks(guestTasks)
      } else {
        // Load tasks from Supabase
        // const { data } = await db.getTasks({ search: searchQuery, ...filters })
        // setTasks(data || [])
        
        // Mock data for now
        setTasks([])
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTask = (taskData: any) => {
    if (isGuestMode) {
      const guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]')
      const newTask = {
        id: `task_${Date.now()}`,
        ...taskData,
        status: 'ongoing',
        priority: 'medium',
        created_by: 'guest',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      guestTasks.push(newTask)
      localStorage.setItem('guest_tasks', JSON.stringify(guestTasks))
      setTasks(guestTasks)
    } else {
      // Create task in Supabase
      setTasks(prev => [...prev, { ...taskData, id: `task_${Date.now()}` }])
    }
    setShowCreateModal(false)
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    if (isGuestMode) {
      const guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]')
      const updatedTasks = guestTasks.map((task: Task) =>
        task.id === taskId ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
      )
      localStorage.setItem('guest_tasks', JSON.stringify(updatedTasks))
      setTasks(updatedTasks)
    } else {
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
      ))
    }
  }

  const deleteTask = (taskId: string) => {
    if (isGuestMode) {
      const guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]')
      const taskToDelete = guestTasks.find((task: Task) => task.id === taskId)
      
      // Only allow guests to delete their own tasks (not sample tasks)
      if (taskToDelete && taskToDelete.created_by === 'guest') {
        const filteredTasks = guestTasks.filter((task: Task) => task.id !== taskId)
        localStorage.setItem('guest_tasks', JSON.stringify(filteredTasks))
        setTasks(filteredTasks)
      } else {
        // Show a message that they can only delete their own tasks
        console.log('You can only delete tasks you created.')
      }
    } else {
      setTasks(prev => prev.filter(task => task.id !== taskId))
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const handleGoHome = () => {
    // Clear any guest mode parameters and go to landing page
    if (isGuestMode) {
      // Clear guest session data
      localStorage.removeItem('guest_session')
      // Navigate to landing page
      router.push('/')
    } else {
      router.push('/')
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              className="fixed left-0 top-0 z-50 h-full w-64 border-r border-border bg-card"
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-6">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">P</span>
                    </div>
                    <span className="text-lg font-semibold">PitStop</span>
                  </div>
                  <div className="ml-10 mt-1">
                    <p className="text-sm text-muted-foreground">
                      {isGuestMode ? `Welcome, ${guestName}!` : 'Dashboard'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-accent rounded-lg lg:hidden"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="p-4 space-y-2">
                <button onClick={handleGoHome} className="nav-link w-full justify-start">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </button>
                <button className="nav-link w-full justify-start active">
                  <Grid className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
                <button className="nav-link w-full justify-start">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Modern Top Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-accent rounded-lg lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
              
              {/* Back to Home Button */}
              <button
                onClick={handleGoHome}
                className="p-1 rounded-md hover:bg-accent flex items-center mr-2"
                title="Back to Home"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    {isGuestMode ? `Welcome, ${guestName}!` : 'Dashboard'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input h-9 w-64 pl-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Grid View - Only view mode */}
              <div className="flex items-center border border-border rounded-lg">
                <div className="p-2 bg-accent text-accent-foreground rounded-l-lg">
                  <Grid className="h-4 w-4" />
                </div>
              </div>

              {/* Active Users Count in Header (Secondary Indicator) */}
              {activeUsers.users.length > 0 && (
                <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{activeUsers.users.length} active</span>
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-accent rounded-lg"
                title="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                {isGuestMode ? (
                  <button
                    onClick={() => router.push('/auth/signin')}
                    className="btn-primary"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </button>
                ) : user ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="btn-ghost"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => router.push('/auth/signin')}
                    className="btn-ghost"
                  >
                    <User className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-full space-y-6">
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
                title="Create a new task"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </motion.button>
            </div>

            {/* Dashboard Stats */}
            <DashboardStats tasks={filteredTasks} />

            {/* Content Area */}
            <div className="space-y-6">
              {/* Horizontal Filter Row */}
              <TaskFilterRow
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={setSearchQuery}
              />

              {/* Task List */}
              <div>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="card p-6 loading-pulse h-24"></div>
                    ))}
                  </div>
                ) : filteredTasks.length === 0 && (searchQuery || filters.status.length > 0 || filters.priority.length > 0 || filters.created_date_from || filters.created_date_to || filters.updated_date_from || filters.updated_date_to) ? (
                  <div className="text-left py-12">
                    <div className="card p-8">
                      <Filter className="h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No tasks match your criteria</h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your search or filters to find what you're looking for.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setFilters({ 
                            status: [], 
                            priority: [], 
                            category_id: '',
                            created_date_from: '',
                            created_date_to: '',
                            updated_date_from: '',
                            updated_date_to: ''
                          })
                        }}
                        className="btn-secondary"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                ) : (
                  <TaskList
                    tasks={filteredTasks}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                    viewMode="grid"
                    searchQuery={searchQuery}
                    isGuestMode={isGuestMode}
                  />
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/20 py-6 mt-12">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-lg font-semibold">PitStop</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  100% FREE
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                © 2025 PitStop. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreateTask={createTask}
          isGuestMode={isGuestMode}
        />
      )}

      {/* Active Users Sidebar */}
      <ActiveUsersSidebar
        isOpen={activeUsersSidebarOpen}
        onToggle={() => setActiveUsersSidebarOpen(!activeUsersSidebarOpen)}
        users={activeUsers.users}
        isLoading={activeUsers.isLoading}
        error={activeUsers.error}
        lastUpdate={activeUsers.lastUpdate}
        isConnected={activeUsers.isConnected}
        position="right"
        className="hidden lg:block"
      />
    </div>
  )
}