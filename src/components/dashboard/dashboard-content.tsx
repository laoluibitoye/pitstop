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
  List,
  Bell,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useTheme } from 'next-themes'
import { TaskList } from '@/components/tasks/task-list'
import { TaskFilters } from '@/components/tasks/task-filters'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { Task } from '@/types'
import { ThemeToggle } from '@/components/theme-toggle'

type TaskStatus = 'ongoing' | 'completed' | 'delayed' | 'cancelled'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

interface TaskFilters {
  status: TaskStatus[]
  priority: TaskPriority[]
  category_id: string
}

export function DashboardContent() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [guestName, setGuestName] = useState<string | null>(null)
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    category_id: '',
  })

  const { user, loading: authLoading, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isGuestMode = searchParams.get('mode') === 'guest'

  useEffect(() => {
    // Only access localStorage on client side
    if (isGuestMode && typeof window !== 'undefined' && window.localStorage) {
      try {
        setGuestName(localStorage.getItem('guest_name'))
      } catch (error) {
        console.warn('localStorage not available:', error)
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
        const guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]')
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
      const filteredTasks = guestTasks.filter((task: Task) => task.id !== taskId)
      localStorage.setItem('guest_tasks', JSON.stringify(filteredTasks))
      setTasks(filteredTasks)
    } else {
      setTasks(prev => prev.filter(task => task.id !== taskId))
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const handleGoHome = () => {
    router.push('/')
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
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <span className="text-lg font-semibold">PitStop</span>
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
      <div className="lg:pl-64">
        {/* Modern Top Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-accent rounded-lg lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
              
              {/* Logo in header */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    {isGuestMode ? `Welcome, ${guestName}!` : 'Dashboard'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                    {isGuestMode && ' • Guest Mode • Limited Access'}
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
              </div>

              {/* View Toggle */}
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>

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
                      {user.user_metadata?.full_name || user.email}
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
        <main className="flex-1 p-6 lg:pl-72">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </motion.button>
            </div>

            {/* Dashboard Stats */}
            <DashboardStats tasks={tasks} />

            {/* Content Area */}
            <div className="grid gap-6 lg:grid-cols-4">
              {/* Sidebar Filters */}
              <div className="lg:col-span-1">
                <TaskFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onSearch={setSearchQuery}
                />
              </div>

              {/* Task List */}
              <div className="lg:col-span-3">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="card p-6 loading-pulse h-24"></div>
                    ))}
                  </div>
                ) : (
                  <TaskList
                    tasks={tasks}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                    viewMode={viewMode}
                    searchQuery={searchQuery}
                  />
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/20 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-lg font-semibold">PitStop</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  100% FREE
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground text-center">
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
    </div>
  )
}