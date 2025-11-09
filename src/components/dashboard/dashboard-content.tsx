'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Filter, Search, Grid, List } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { TaskList } from '@/components/tasks/task-list'
import { TaskFilters } from '@/components/tasks/task-filters'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { Task } from '@/types'

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
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    category_id: '',
  })

  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isGuestMode = searchParams.get('mode') === 'guest'

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-pulse h-8 w-32 rounded"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-blue-50 dark:from-dark-bg dark:via-primary-900 dark:to-dark-bg">
      {/* Header */}
      <header className="neo-card m-4 p-4 bg-white/50 dark:bg-dark-card/50">
        <div className="flex justify-between items-center">
          <DashboardHeader
            isGuestMode={isGuestMode}
            user={user}
            taskCount={tasks.length}
          />
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-accent-blue-500 text-white' : 'bg-primary-200 dark:bg-primary-700'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-accent-blue-500 text-white' : 'bg-primary-200 dark:bg-primary-700'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="neo-button px-4 py-2 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 p-4">
          <TaskFilters
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={setSearchQuery}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          <div className="space-y-6">
            {/* Stats */}
            <DashboardStats tasks={tasks} />

            {/* Task List */}
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="neo-card p-6 loading-pulse h-24"></div>
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
        </main>
      </div>

      {/* Modals */}
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