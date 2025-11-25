'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  User,
  MessageCircle,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Edit,
  Save,
  X,
  Users,
  CheckSquare,
  Home,
  Settings,
  Search,
  Grid,
  List,
  Moon,
  Sun,
  Menu,
  LogOut,
  Clock,
  Flag,
  Tag
} from 'lucide-react'
import { Task, TaskComment, SubTask } from '@/types'
import { useAuth } from '@/components/providers/auth-provider'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'subtasks' | 'comments'>('overview')

  // Comments state
  const [comments, setComments] = useState<TaskComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [showCommentForm, setShowCommentForm] = useState(false)

  // Sub-tasks state
  const [subTasks, setSubTasks] = useState<SubTask[]>([])
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('')
  const [showSubTaskForm, setShowSubTaskForm] = useState(false)

  const taskId = params?.taskId as string
  const isGuestMode = searchParams.get('mode') === 'guest'

  useEffect(() => {
    loadTask()
  }, [taskId])

  const loadTask = async () => {
    setLoading(true)
    try {
      if (isGuestMode) {
        const guestTasks = JSON.parse(localStorage.getItem('pitstop_guest_tasks') || '[]')
        const foundTask = guestTasks.find((t: any) => t.id === taskId)
        if (foundTask) {
          setTask(foundTask)
          setEditTitle(foundTask.title)
          setEditDescription(foundTask.description || '')
          setComments(foundTask.comments || [])
          setSubTasks(foundTask.sub_tasks || [])
        }
      } else {
        try {
          const { data, error } = await supabase
            .from('tasks')
            .select(`
              *,
              created_user:profiles!tasks_created_by_fkey(
                id,
                email,
                full_name,
                username,
                avatar_url
              ),
              assigned_user:profiles!tasks_assigned_to_fkey(
                id,
                email,
                full_name,
                username,
                avatar_url
              ),
              category:categories(*)
            `)
            .eq('id', taskId)
            .single()

          if (error) throw error

          if (data) {
            setTask(data)
            setEditTitle(data.title)
            setEditDescription(data.description || '')

            const { data: commentsData } = await supabase
              .from('task_comments')
              .select(`
                *,
                user:profiles(*)
              `)
              .eq('task_id', taskId)
              .order('created_at', { ascending: true })

            setComments(commentsData || [])

            const { data: subTasksData } = await supabase
              .from('sub_tasks')
              .select('*')
              .eq('task_id', taskId)
              .order('position', { ascending: true })

            setSubTasks(subTasksData || [])
          }
        } catch (dbError) {
          console.error('Database error:', dbError)
          const mockTask: Task = {
            id: taskId,
            title: 'Task Not Found',
            description: 'Unable to load task details',
            status: 'ongoing' as const,
            priority: 'medium' as const,
            created_by: user?.id || 'unknown',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            position: 0,
            visibility: 'private' as const,
            comments: [],
            sub_tasks: []
          }
          setTask(mockTask)
          setComments([])
          setSubTasks([])
        }
      }
    } catch (error) {
      console.error('Error loading task:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveTask = async () => {
    if (!task) return

    const updatedTask = {
      ...task,
      title: editTitle,
      description: editDescription,
      updated_at: new Date().toISOString()
    }

    try {
      if (isGuestMode) {
        const guestTasks = JSON.parse(localStorage.getItem('pitstop_guest_tasks') || '[]')
        const updatedTasks = guestTasks.map((t: any) =>
          t.id === taskId ? { ...t, ...updatedTask } : t
        )
        localStorage.setItem('pitstop_guest_tasks', JSON.stringify(updatedTasks))
      } else {
        const { error } = await supabase
          .from('tasks')
          .update({
            title: editTitle,
            description: editDescription,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId)

        if (error) throw error
      }

      setTask(updatedTask)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save task:', error)
      alert('Failed to save task. Please try again.')
    }
  }

  const toggleTaskVisibility = async (newVisibility: 'public' | 'private') => {
    if (!task) return

    const updatedTask = {
      ...task,
      visibility: newVisibility,
      updated_at: new Date().toISOString()
    }

    try {
      if (isGuestMode) {
        const guestTasks = JSON.parse(localStorage.getItem('pitstop_guest_tasks') || '[]')
        const updatedTasks = guestTasks.map((t: any) =>
          t.id === taskId ? { ...t, visibility: newVisibility } : t
        )
        localStorage.setItem('pitstop_guest_tasks', JSON.stringify(updatedTasks))
      } else {
        const { error } = await supabase
          .from('tasks')
          .update({
            visibility: newVisibility,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId)

        if (error) throw error
      }

      setTask(updatedTask)
    } catch (error) {
      console.error('Failed to update task visibility:', error)
      alert('Failed to update task visibility. Please try again.')
    }
  }

  const toggleTaskStatus = async () => {
    if (!task) return

    const newStatus: Task['status'] = task.status === 'completed' ? 'ongoing' : 'completed'
    const updatedTask: Task = {
      ...task,
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString()
    }

    try {
      if (isGuestMode) {
        const guestTasks = JSON.parse(localStorage.getItem('pitstop_guest_tasks') || '[]')
        const updatedTasks = guestTasks.map((t: any) =>
          t.id === taskId ? { ...t, ...updatedTask } : t
        )
        localStorage.setItem('pitstop_guest_tasks', JSON.stringify(updatedTasks))
      } else {
        const { error } = await supabase
          .from('tasks')
          .update({
            status: newStatus,
            completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId)

        if (error) throw error
      }

      setTask(updatedTask)
    } catch (error) {
      console.error('Failed to update task status:', error)
      alert('Failed to update task status. Please try again.')
    }
  }

  const addComment = async () => {
    if (!newComment.trim() || !task) return

    const comment: TaskComment = {
      id: `comment_${Date.now()}`,
      task_id: taskId,
      user_id: user?.id || 'guest',
      content: newComment.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: user?.id || 'guest',
        email: user?.email || 'guest@example.com',
        full_name: user?.user_metadata?.full_name || 'Guest User',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    try {
      const updatedComments = [...comments, comment]

      if (isGuestMode) {
        const guestTasks = JSON.parse(localStorage.getItem('pitstop_guest_tasks') || '[]')
        const updatedTasks = guestTasks.map((t: any) =>
          t.id === taskId ? { ...t, comments: updatedComments } : t
        )
        localStorage.setItem('pitstop_guest_tasks', JSON.stringify(updatedTasks))
      } else {
        const { error } = await supabase
          .from('task_comments')
          .insert({
            task_id: taskId,
            user_id: user?.id,
            content: newComment.trim()
          })

        if (error) throw error
        await loadTask()
      }

      setComments(updatedComments)
      setNewComment('')
      setShowCommentForm(false)
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('Failed to add comment. Please try again.')
    }
  }

  const deleteComment = (commentId: string) => {
    const updatedComments = comments.filter(c => c.id !== commentId)
    setComments(updatedComments)

    if (isGuestMode) {
      const guestTasks = JSON.parse(localStorage.getItem('pitstop_guest_tasks') || '[]')
      const updatedTasks = guestTasks.map((t: any) =>
        t.id === taskId ? { ...t, comments: updatedComments } : t
      )
      localStorage.setItem('pitstop_guest_tasks', JSON.stringify(updatedTasks))
    }
  }

  const addSubTask = async () => {
    if (!newSubTaskTitle.trim() || !task) return

    // Optimistic update for UI
    const tempId = `temp_${Date.now()}`
    const subTask: SubTask = {
      id: tempId,
      task_id: taskId,
      title: newSubTaskTitle.trim(),
      status: 'ongoing',
      position: subTasks.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      if (isGuestMode) {
        const updatedSubTasks = [...subTasks, subTask]
        const guestTasks = JSON.parse(localStorage.getItem('pitstop_guest_tasks') || '[]')
        const updatedTasks = guestTasks.map((t: any) =>
          t.id === taskId ? { ...t, sub_tasks: updatedSubTasks } : t
        )
        localStorage.setItem('pitstop_guest_tasks', JSON.stringify(updatedTasks))
        setSubTasks(updatedSubTasks)
        setNewSubTaskTitle('')
        setShowSubTaskForm(false)
      } else {
        // For authenticated users, insert into DB first
        const { data, error } = await supabase
          .from('sub_tasks')
          .insert({
            task_id: taskId,
            title: newSubTaskTitle.trim(),
            status: 'ongoing',
            position: subTasks.length
          })
          .select()
          .single()

        if (error) {
          console.error('Supabase insert error:', error)
          throw error
        }

        // Update local state with returned data
        setSubTasks([...subTasks, data])
        setNewSubTaskTitle('')
        setShowSubTaskForm(false)

        // Reload task to ensure sync
        await loadTask()
      }
    } catch (error: any) {
      console.error('Failed to add sub-task:', error)
      alert(`Failed to add sub-task: ${error?.message || 'Unknown error'}`)
    }
  }

  const toggleSubTaskStatus = async (subTaskId: string) => {
    const subTask = subTasks.find(st => st.id === subTaskId)
    if (!subTask) return

    const newStatus: SubTask['status'] = subTask.status === 'completed' ? 'ongoing' : 'completed'
    const updatedSubTasks = subTasks.map(st => {
      if (st.id === subTaskId) {
        return {
          ...st,
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
          updated_at: new Date().toISOString()
        }
      }
      return st
    })

    try {
      if (isGuestMode) {
        const guestTasks = JSON.parse(localStorage.getItem('pitstop_guest_tasks') || '[]')
        const updatedTasks = guestTasks.map((t: any) =>
          t.id === taskId ? { ...t, sub_tasks: updatedSubTasks } : t
        )
        localStorage.setItem('pitstop_guest_tasks', JSON.stringify(updatedTasks))
      } else {
        const { error } = await supabase
          .from('sub_tasks')
          .update({
            status: newStatus,
            completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', subTaskId)

        if (error) throw error
      }

      setSubTasks(updatedSubTasks)
    } catch (error) {
      console.error('Failed to update sub-task status:', error)
      alert('Failed to update sub-task status. Please try again.')
    }
  }

  const deleteSubTask = (subTaskId: string) => {
    const updatedSubTasks = subTasks.filter(st => st.id !== subTaskId)
    setSubTasks(updatedSubTasks)

    if (isGuestMode) {
      const guestTasks = JSON.parse(localStorage.getItem('pitstop_guest_tasks') || '[]')
      const updatedTasks = guestTasks.map((t: any) =>
        t.id === taskId ? { ...t, sub_tasks: updatedSubTasks } : t
      )
      localStorage.setItem('pitstop_guest_tasks', JSON.stringify(updatedTasks))
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'ongoing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'delayed': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-spinner">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Task Not Found</h1>
          <p className="text-muted-foreground mb-4">The task you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const totalSubTasks = subTasks.length
  const completedSubTasks = subTasks.filter(st => st.status === 'completed').length
  const subTaskProgress = totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Modern Top Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  title="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Task Details</h1>
                  <p className="text-sm text-muted-foreground hidden sm:block">{task.title}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground"
                title="Dashboard"
              >
                <Grid className="h-4 w-4" />
              </button>

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

              <div className="flex items-center space-x-2">
                {user ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground hidden sm:block">
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

        {/* Main Task Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Hero Task Card */}
            <div className="relative overflow-hidden neo-card bg-white/50 dark:bg-dark-card/50 p-8">
              <div className="absolute top-4 right-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </div>
              </div>

              <div className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-3xl font-bold bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
                      placeholder="Task title"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full h-20 bg-transparent border border-border rounded-lg p-3 outline-none text-foreground placeholder-muted-foreground resize-none"
                      placeholder="Task description"
                    />
                    <div className="flex space-x-3">
                      <button onClick={saveTask} className="btn-primary">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditTitle(task.title)
                          setEditDescription(task.description || '')
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <h1 className="text-3xl font-bold text-foreground">{task.title}</h1>
                      {task.description && (
                        <p className="text-lg text-muted-foreground max-w-3xl">{task.description}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn-secondary"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Task
                      </button>

                      <button
                        onClick={toggleTaskStatus}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${task.status === 'completed'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
                          }`}
                      >
                        {task.status === 'completed' ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Mark Incomplete</span>
                          </>
                        ) : (
                          <>
                            <Circle className="h-4 w-4" />
                            <span>Mark Complete</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => toggleTaskVisibility(task.visibility === 'public' ? 'private' : 'public')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${task.visibility === 'public'
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
                          : 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30'
                          }`}
                      >
                        {task.visibility === 'public' ? (
                          <>
                            <Users className="h-4 w-4" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <User className="h-4 w-4" />
                            <span>Private</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Task Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="neo-card p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-3">
                  <Flag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Priority</h3>
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </div>
              </div>

              <div className="neo-card p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-3">
                  <CheckSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Progress</h3>
                <p className="text-lg font-bold text-foreground">{completedSubTasks}/{totalSubTasks}</p>
              </div>

              <div className="neo-card p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg mx-auto mb-3">
                  <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Comments</h3>
                <p className="text-lg font-bold text-foreground">{comments.length}</p>
              </div>

              {task.due_date && (
                <div className="neo-card p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg mx-auto mb-3">
                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
                  <p className="text-sm font-semibold text-foreground">{formatDate(task.due_date)}</p>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {totalSubTasks > 0 && (
              <div className="neo-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">Sub-task Progress</h3>
                  <span className="text-sm font-medium text-muted-foreground">{Math.round(subTaskProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${subTaskProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Tabbed Content */}
            <div className="neo-card">
              <div className="border-b border-border">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                      }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('subtasks')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'subtasks'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                      }`}
                  >
                    Sub-tasks ({totalSubTasks})
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'comments'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                      }`}
                  >
                    Comments ({comments.length})
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                          <Tag className="h-5 w-5 mr-2" />
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {task.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {typeof tag === 'string' ? tag : tag.name || 'Unknown Tag'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Collaborators */}
                    {(task.created_user || task.assigned_user) && (
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          Collaborators
                        </h3>
                        <div className="space-y-3">
                          {task.created_user && (
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {task.created_user.full_name?.charAt(0) || task.created_user.email?.charAt(0) || 'C'}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {task.created_user.full_name || task.created_user.email}
                                </p>
                                <p className="text-sm text-muted-foreground">Task Creator</p>
                              </div>
                            </div>
                          )}
                          {task.assigned_user && (
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {task.assigned_user.full_name?.charAt(0) || task.assigned_user.email?.charAt(0) || 'A'}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {task.assigned_user.full_name || task.assigned_user.email}
                                </p>
                                <p className="text-sm text-muted-foreground">Assigned To</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Timeline
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-foreground">Created</p>
                            <p className="text-sm text-muted-foreground">{formatDate(task.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-foreground">Last Modified</p>
                            <p className="text-sm text-muted-foreground">{formatDate(task.updated_at)}</p>
                          </div>
                        </div>
                        {task.completed_at && (
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="font-medium text-foreground">Completed</p>
                              <p className="text-sm text-muted-foreground">{formatDate(task.completed_at)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tasks Tab */}
                {activeTab === 'subtasks' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Sub-tasks</h3>
                      <button
                        onClick={() => setShowSubTaskForm(true)}
                        className="btn-primary"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Sub-task
                      </button>
                    </div>

                    {showSubTaskForm && (
                      <div className="flex items-center space-x-2 p-4 border-2 border-dashed border-border rounded-lg">
                        <input
                          type="text"
                          value={newSubTaskTitle}
                          onChange={(e) => setNewSubTaskTitle(e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none"
                          placeholder="New sub-task title"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addSubTask()
                            } else if (e.key === 'Escape') {
                              setShowSubTaskForm(false)
                              setNewSubTaskTitle('')
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={addSubTask}
                          className="btn-primary"
                          disabled={!newSubTaskTitle.trim()}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowSubTaskForm(false)
                            setNewSubTaskTitle('')
                          }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <div className="space-y-3">
                      {subTasks.map((subTask) => (
                        <div
                          key={subTask.id}
                          className="flex items-center space-x-4 p-4 bg-accent/20 rounded-lg hover:bg-accent/30 transition-colors"
                        >
                          <button
                            onClick={() => toggleSubTaskStatus(subTask.id)}
                            className={`flex-shrink-0 ${subTask.status === 'completed'
                              ? 'text-green-600 hover:text-green-700'
                              : 'text-gray-400 hover:text-green-600'
                              }`}
                          >
                            {subTask.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>

                          <div className="flex-1">
                            <p
                              className={`font-medium ${subTask.status === 'completed'
                                ? 'line-through text-muted-foreground'
                                : 'text-foreground'
                                }`}
                            >
                              {subTask.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Created {formatDate(subTask.created_at)}
                            </p>
                          </div>

                          <button
                            onClick={() => deleteSubTask(subTask.id)}
                            className="p-1 text-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {subTasks.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No sub-tasks yet. Add one to get started!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">Comments</h3>
                      <button
                        onClick={() => setShowCommentForm(true)}
                        className="btn-primary"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Add Comment
                      </button>
                    </div>

                    {showCommentForm && (
                      <div className="p-4 border-2 border-dashed border-border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1 space-y-3">
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="w-full h-20 bg-transparent border border-border rounded-lg p-3 outline-none resize-none"
                              placeholder="Add a comment..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                  addComment()
                                } else if (e.key === 'Escape') {
                                  setShowCommentForm(false)
                                  setNewComment('')
                                }
                              }}
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={addComment}
                                className="btn-primary"
                                disabled={!newComment.trim()}
                              >
                                Add Comment
                              </button>
                              <button
                                onClick={() => {
                                  setShowCommentForm(false)
                                  setNewComment('')
                                }}
                                className="btn-secondary"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="flex items-start space-x-4 p-4 bg-accent/20 rounded-lg"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {comment.user?.full_name?.charAt(0) || 'U'}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-foreground">
                                {comment.user?.full_name || 'Unknown User'}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-muted-foreground">{comment.content}</p>
                          </div>

                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="p-1 text-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {comments.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No comments yet. Start the conversation!</p>
                        </div>
                      )}
                    </div>
                  </div>
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
    </div>
  )
}