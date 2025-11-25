'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Settings,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Target
} from 'lucide-react'
import { Task } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/auth-provider'
import { EnhancedTaskList } from '@/components/tasks/enhanced-task-list'
import { TaskFilterRow } from '@/components/tasks/task-filter-row'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { PrivacyControls } from '@/components/tasks/privacy-controls'
import { ShareModal } from '@/components/tasks/share-modal'

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

export function PersonalDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    priority: [],
    category_id: '',
    created_date_from: '',
    created_date_to: '',
    updated_date_from: '',
    updated_date_to: '',
  })

  const { user, isGuest, loading: authLoading } = useAuth()

  useEffect(() => {
    if (user) {
      loadTasks()
    }
  }, [user])

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
        if (isGuest) {
          localStorage.setItem('pitstop_guest_tasks', JSON.stringify(updatedTasks))
        }
      }
    }

    checkOverdueTasks()
    const interval = setInterval(checkOverdueTasks, 60000)

    return () => clearInterval(interval)
  }, [tasks, isGuest])

  const loadTasks = async () => {
    if (!user) return

    setLoading(true)
    try {
      if (isGuest) {
        const savedTasks = localStorage.getItem('pitstop_guest_tasks')
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks))
        } else {
          setTasks([])
        }
        setLoading(false)
        return
      }

      // Try to select with all fields first
      let query = supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          created_by,
          created_at,
          updated_at,
          position,
          due_date,
          category_id,
          assigned_to,
          completed_at,
          category:categories(*),
          assigned_user:profiles!tasks_assigned_to_fkey(*),
          created_user:profiles!tasks_created_by_fkey(*)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error loading tasks:', error)
        // If the query fails, try a simpler query
        const { data: simpleData, error: simpleError } = await supabase
          .from('tasks')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })

        if (simpleError) throw simpleError
        setTasks(simpleData || [])
        return
      }

      // Ensure all tasks have proper default values
      const tasksWithDefaults = (data || []).map((task: any) => ({
        ...task,
        visibility: task.visibility || 'private',
        tags: task.tags || []
      }))

      setTasks(tasksWithDefaults)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: any) => {
    if (!user) return

    try {
      console.log('Creating task with data:', taskData)

      // Prepare task data with only core fields that definitely exist
      const taskToCreate: any = {
        title: taskData.title,
        description: taskData.description || null,
        priority: taskData.priority || 'medium',
        status: 'ongoing',
        created_by: user.id,
        position: tasks.length, // Set position to end of list
        // Only try to add visibility if it exists in the database
        ...(taskData.visibility && { visibility: taskData.visibility }),
      }

      // Only add due_date if provided (and make sure it's valid)
      if (taskData.due_date && taskData.due_date.trim()) {
        try {
          // Validate date format
          const date = new Date(taskData.due_date)
          if (!isNaN(date.getTime())) {
            taskToCreate.due_date = taskData.due_date
          }
        } catch (e) {
          console.warn('Invalid due date format:', taskData.due_date)
        }
      }

      if (isGuest) {
        const newTask = {
          ...taskToCreate,
          id: `guest-task-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: taskData.tags || []
        }
        const updatedTasks = [newTask, ...tasks]
        setTasks(updatedTasks)
        localStorage.setItem('pitstop_guest_tasks', JSON.stringify(updatedTasks))
        setShowCreateModal(false)
        return
      }

      console.log('Task to create:', taskToCreate)

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskToCreate)
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Task created successfully:', data)

      // Refresh tasks list to get the latest data
      await loadTasks()
      setShowCreateModal(false)
    } catch (error: any) {
      console.error('Error creating task:', error)
      // You might want to show a toast notification here
      alert(`Failed to create task. Error: ${error?.message || 'Unknown error'}`)
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      if (isGuest) {
        const updatedTasks = tasks.map(task =>
          task.id === taskId ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
        )
        setTasks(updatedTasks)
        localStorage.setItem('pitstop_guest_tasks', JSON.stringify(updatedTasks))
        return
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select(`
          *,
          category:categories(*),
          assigned_user:profiles!tasks_assigned_to_fkey(*),
          created_user:profiles!tasks_created_by_fkey(*)
        `)
        .single()

      if (error) throw error

      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, ...data } : task
      ))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      if (isGuest) {
        const updatedTasks = tasks.filter(task => task.id !== taskId)
        setTasks(updatedTasks)
        localStorage.setItem('pitstop_guest_tasks', JSON.stringify(updatedTasks))
        return
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleShareTask = (task: Task) => {
    setSelectedTask(task)
    setShowShareModal(true)
  }

  const handleVisibilityChange = async (taskId: string, visibility: 'public' | 'private') => {
    await updateTask(taskId, { visibility })
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user && !isGuest) {
    return (
      <div className="text-center py-12">
        <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Sign In Required</h2>
        <p className="text-muted-foreground mb-6">
          Please sign in to access your personal dashboard and manage your tasks.
        </p>
        <button
          onClick={() => window.location.href = '/auth/signin'}
          className="btn-primary"
        >
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground">
            Manage your personal tasks and collaborate with others.
          </p>
        </div>

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

      {/* Intro Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Guest'}!</h2>
            <p className="max-w-xl text-blue-100">
              Track your progress, manage your tasks, and stay organized. You have {tasks.filter(t => t.status === 'ongoing').length} ongoing tasks today.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Task</span>
          </motion.button>
        </div>

        {/* Decorative background elements */}
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-purple-500/30 blur-3xl"></div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats tasks={tasks} />

      {/* Content Area */}
      <div className="space-y-6">
        {/* Filter Row */}
        <TaskFilterRow
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Task List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-6 loading-pulse h-24"></div>
            ))}
          </div>
        ) : (
          <EnhancedTaskList
            tasks={tasks}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            searchQuery={searchQuery}
            viewMode={viewMode}
            isGuestMode={isGuest}
          />
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreateTask={createTask}
          isGuestMode={isGuest}
        />
      )}

      {selectedTask && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false)
            setSelectedTask(null)
          }}
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
        />
      )}
    </div>
  )
}