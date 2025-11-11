'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  CheckSquare
} from 'lucide-react'
import { Task, TaskComment, SubTask } from '@/types'
import { useAuth } from '@/components/providers/auth-provider'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'

export function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isGuestMode, setIsGuestMode] = useState(false)
  
  // Comments state
  const [comments, setComments] = useState<TaskComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [showCommentForm, setShowCommentForm] = useState(false)
  
  // Sub-tasks state
  const [subTasks, setSubTasks] = useState<SubTask[]>([])
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('')
  const [showSubTaskForm, setShowSubTaskForm] = useState(false)

  const taskId = params?.taskId as string

  useEffect(() => {
    loadTask()
  }, [taskId])

  useEffect(() => {
    // Check if in guest mode
    const urlParams = new URLSearchParams(window.location.search)
    setIsGuestMode(urlParams.get('mode') === 'guest')
  }, [])

  const loadTask = async () => {
    setLoading(true)
    try {
      if (isGuestMode) {
        // Load from localStorage for guest mode
        const guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]')
        const foundTask = guestTasks.find((t: any) => t.id === taskId)
        if (foundTask) {
          setTask(foundTask)
          setEditTitle(foundTask.title)
          setEditDescription(foundTask.description || '')
          setComments(foundTask.comments || [])
          setSubTasks(foundTask.sub_tasks || [])
        }
      } else {
        // Load from database for authenticated users
        // For now, using mock data - replace with actual API call
        const mockTask: Task = {
          id: taskId,
          title: 'Sample Task',
          description: 'This is a sample task description',
          status: 'ongoing' as const,
          priority: 'medium' as const,
          created_by: user?.id || 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          position: 0,
          visibility: 'private' as const,
          comments: [],
          sub_tasks: []
        }
        setTask(mockTask)
        setEditTitle(mockTask.title)
        setEditDescription(mockTask.description || '')
        setComments(mockTask.comments || [])
        setSubTasks(mockTask.sub_tasks || [])
      }
    } catch (error) {
      console.error('Error loading task:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveTask = () => {
    if (!task) return
    
    const updatedTask = {
      ...task,
      title: editTitle,
      description: editDescription,
      updated_at: new Date().toISOString()
    }
    
    if (isGuestMode) {
      // Update in localStorage
      const guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]')
      const updatedTasks = guestTasks.map((t: any) => 
        t.id === taskId ? { ...t, ...updatedTask } : t
      )
      localStorage.setItem('guest_tasks', JSON.stringify(updatedTasks))
    }
    
    setTask(updatedTask)
    setIsEditing(false)
  }

  const toggleTaskStatus = () => {
    if (!task) return
    
    const newStatus: Task['status'] = task.status === 'completed' ? 'ongoing' : 'completed'
    const updatedTask: Task = {
      ...task,
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString()
    }
    
    if (isGuestMode) {
      // Update in localStorage
      const guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]')
      const updatedTasks = guestTasks.map((t: any) => 
        t.id === taskId ? { ...t, ...updatedTask } : t
      )
      localStorage.setItem('guest_tasks', JSON.stringify(updatedTasks))
    }
    
    setTask(updatedTask)
  }

  // Comments functionality
  const addComment = () => {
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
    
    const updatedComments = [...comments, comment]
    setComments(updatedComments)
    setNewComment('')
    setShowCommentForm(false)
    
    // Update task in localStorage
    if (isGuestMode) {
      const guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]')
      const updatedTasks = guestTasks.map((t: any) => 
        t.id === taskId ? { ...t, comments: updatedComments } : t
      )
      localStorage.setItem('guest_tasks', JSON.stringify(updatedTasks))
    }
  }

  const deleteComment = (commentId: string) => {
    const updatedComments = comments.filter(c => c.id !== commentId)
    setComments(updatedComments)
    
    // Update task in localStorage
    if (isGuestMode) {
      const guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]')
      const updatedTasks = guestTasks.map((t: any) => 
        t.id === taskId ? { ...t, comments: updatedComments } : t
      )
      localStorage.setItem('guest_tasks', JSON.stringify(updatedTasks))
    }
  }

  // Sub-tasks functionality
  const addSubTask = () => {
    if (!newSubTaskTitle.trim() || !task) return
    
    const subTask: SubTask = {
      id: `subtask_${Date.now()}`,
      task_id: taskId,
      title: newSubTaskTitle.trim(),
      status: 'ongoing',
      position: subTasks.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const updatedSubTasks = [...subTasks, subTask]
    setSubTasks(updatedSubTasks)
    setNewSubTaskTitle('')
    setShowSubTaskForm(false)
    
    // Update task in localStorage
    if (isGuestMode) {
      const guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]')
      const updatedTasks = guestTasks.map((t: any) => 
        t.id === taskId ? { ...t, sub_tasks: updatedSubTasks } : t
      )
      localStorage.setItem('guest_tasks', JSON.stringify(updatedTasks))
    }
  }

  const toggleSubTaskStatus = (subTaskId: string) => {
    const updatedSubTasks = subTasks.map(st => {
      if (st.id === subTaskId) {
        const newStatus: SubTask['status'] = st.status === 'completed' ? 'ongoing' : 'completed'
        return {
          ...st,
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
          updated_at: new Date().toISOString()
        }
      }
      return st
    })
    setSubTasks(updatedSubTasks)
    
    // Update task in localStorage
    if (isGuestMode) {
      const guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]')
      const updatedTasks = guestTasks.map((t: any) => 
        t.id === taskId ? { ...t, sub_tasks: updatedSubTasks } : t
      )
      localStorage.setItem('guest_tasks', JSON.stringify(updatedTasks))
    }
  }

  const deleteSubTask = (subTaskId: string) => {
    const updatedSubTasks = subTasks.filter(st => st.id !== subTaskId)
    setSubTasks(updatedSubTasks)
    
    // Update task in localStorage
    if (isGuestMode) {
      const guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]')
      const updatedTasks = guestTasks.map((t: any) => 
        t.id === taskId ? { ...t, sub_tasks: updatedSubTasks } : t
      )
      localStorage.setItem('guest_tasks', JSON.stringify(updatedTasks))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'ongoing': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'delayed': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-blue-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Task Not Found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const completedSubTasks = subTasks.filter(st => st.status === 'completed').length
  const totalSubTasks = subTasks.length
  const subTaskProgress = totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0

  const getParticipantCount = () => {
    const uniqueUsers = new Set()
    // Count unique comment authors
    if (comments) {
      comments.forEach((comment) => {
        if (comment.user_id) uniqueUsers.add(comment.user_id)
      })
    }
    // Count task creator
    if (task?.created_by) uniqueUsers.add(task.created_by)
    // Count assigned user
    if (task?.assigned_to) uniqueUsers.add(task.assigned_to)
    return uniqueUsers.size
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Identical to Dashboard */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Back to Dashboard Button */}
            <button
              onClick={() => {
                if (isGuestMode) {
                  router.push('/dashboard?mode=guest')
                } else {
                  router.push('/dashboard')
                }
              }}
              className="p-1 rounded-md hover:bg-accent flex items-center mr-2"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            
            {/* PitStop Branding */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {task.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isGuestMode ? 'Task Details • Guest Mode' : 'Task Details'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Theme Toggle - Exactly like dashboard */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-accent rounded-lg"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun h-4 w-4">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon h-4 w-4">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
              )}
            </button>
            
            {/* User Menu - Exactly like dashboard */}
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
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
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

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Task Header */}
          <div className="neo-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="neo-input text-2xl font-bold w-full"
                      placeholder="Task title"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="neo-input w-full h-24"
                      placeholder="Task description"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={saveTask}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditTitle(task.title)
                          setEditDescription(task.description || '')
                        }}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      {task.title}
                    </h1>
                    {task.description && (
                      <p className="text-muted-foreground mb-4">{task.description}</p>
                    )}
                  </div>
                )}
              </div>
              
              {!isEditing && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleTaskStatus}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                    <span>{task.status === 'completed' ? 'Completed' : 'Mark Complete'}</span>
                  </button>
                  
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                </div>
              )}
            </div>

            {/* Task Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority} priority
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(task.created_at)}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Modified {formatDate(task.updated_at)}</span>
              </div>
            </div>

            {/* Task Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{getParticipantCount()} participants</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{comments.length} comments</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckSquare className="h-4 w-4" />
                <span>{completedSubTasks}/{totalSubTasks} sub-tasks</span>
              </div>
            </div>
          </div>

          {/* Sub-tasks Section */}
          <div className="neo-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Sub-tasks ({completedSubTasks}/{totalSubTasks})</span>
              </h2>
              
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-primary transition-all duration-500"
                  style={{ width: `${subTaskProgress}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {subTasks.map((subTask) => (
                <div
                  key={subTask.id}
                  className="flex items-center space-x-3 p-3 bg-accent/20 rounded-lg"
                >
                  <button
                    onClick={() => toggleSubTaskStatus(subTask.id)}
                    className={`flex-shrink-0 ${
                      subTask.status === 'completed'
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
                      className={`text-sm ${
                        subTask.status === 'completed'
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {subTask.title}
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
              
              {showSubTaskForm ? (
                <div className="flex items-center space-x-2 p-3 border-2 border-dashed border-border rounded-lg">
                  <input
                    type="text"
                    value={newSubTaskTitle}
                    onChange={(e) => setNewSubTaskTitle(e.target.value)}
                    className="flex-1 neo-input"
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
              ) : (
                <button
                  onClick={() => setShowSubTaskForm(true)}
                  className="w-full p-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add sub-task
                </button>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="neo-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Comments ({comments.length})</span>
              </h2>
            </div>

            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start space-x-3 p-4 bg-accent/20 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {comment.user?.full_name?.charAt(0) || 'U'}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {comment.user?.full_name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                  
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="p-1 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              {showCommentForm ? (
                <div className="p-4 border-2 border-dashed border-border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 space-y-2">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="neo-input w-full h-20"
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
              ) : (
                <button
                  onClick={() => setShowCommentForm(true)}
                  className="w-full p-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                >
                  <MessageCircle className="h-4 w-4 inline mr-2" />
                  Add a comment
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}