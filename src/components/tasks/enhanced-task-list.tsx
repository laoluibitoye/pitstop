'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  User,
  Trash2,
  Edit,
  Circle,
  MessageSquare,
  UserCheck,
  UserX,
  Activity,
  TrendingUp,
  ExternalLink,
  Globe,
  Lock
} from 'lucide-react'
import { Task, TaskWithMetrics, ViewModePreferences } from '@/types'

interface EnhancedTaskListProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
  searchQuery: string
  isGuestMode?: boolean
}

interface TaskItemProps {
  task: TaskWithMetrics
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
  viewMode: 'grid' | 'list'
  isGuestMode?: boolean
  router: any
}

const generateSampleMetrics = (taskId: string, index: number): TaskWithMetrics['metrics'] => {
  const commentCount = Math.floor(Math.random() * 10) + (index % 3 === 0 ? 5 : 0)
  const totalSubTasks = Math.floor(Math.random() * 8) + 1
  const completedSubTasks = Math.floor(Math.random() * totalSubTasks)
  const participantCount = Math.floor(Math.random() * 5) + 1

  return {
    commentCount,
    participantCount,
    subTaskProgress: {
      completed: completedSubTasks,
      total: totalSubTasks
    },
    activeParticipants: Array.from({ length: Math.min(participantCount, 3) }, (_, i) => ({
      id: `participant_${taskId}_${i}`,
      user_id: `user_${i + 1}`,
      role: ['assignee', 'commenter', 'editor'][i % 3] as 'assignee' | 'commenter' | 'editor',
      isActive: i === 0 || Math.random() > 0.3,
      lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      user: {
        id: `user_${i + 1}`,
        email: `user${i + 1}@example.com`,
        full_name: `User ${i + 1}`,
        avatar_url: undefined,
        role: 'user' as const,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      }
    })),
    lastActivity: new Date(Date.now() - Math.random() * 86400000).toISOString()
  }
}

const TaskItem = ({ task, onUpdateTask, onDeleteTask, viewMode, isGuestMode = false, router }: TaskItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCommentPreview, setShowCommentPreview] = useState(false)

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'assignee': return <UserCheck className="h-3 w-3" />
      case 'editor': return <Edit className="h-3 w-3" />
      case 'commenter': return <MessageSquare className="h-3 w-3" />
      default: return <User className="h-3 w-3" />
    }
  }

  const subTaskProgress = task.metrics.subTaskProgress
  const progressPercentage = subTaskProgress.total > 0
    ? (subTaskProgress.completed / subTaskProgress.total) * 100
    : 0

  const handleTaskClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/tasks/${task.id}?view=${viewMode}`)
  }

  // Grid View Component
  if (viewMode === 'grid') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="neo-card p-6 bg-white/50 dark:bg-dark-card/50 hover:scale-105 transition-transform duration-200 cursor-pointer"
        onClick={handleTaskClick}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-primary-900 dark:text-dark-text text-lg leading-tight">
              {task.title}
            </h3>
            <div className="flex items-center space-x-1 mt-1">
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Click to view details</span>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteTask(task.id)
              }}
              className="p-1 text-red-500 hover:text-red-600 transition-colors"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {task.description && (
          <p className="text-primary-600 dark:text-primary-300 mb-4 text-sm line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Metrics Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Comments Indicator */}
            <div
              className="relative flex items-center space-x-1"
              onMouseEnter={() => setShowCommentPreview(true)}
              onMouseLeave={() => setShowCommentPreview(false)}
            >
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {task.metrics.commentCount}
              </span>
              
              {/* Comment Preview Tooltip */}
              <AnimatePresence>
                {showCommentPreview && task.metrics.commentCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 p-3 bg-background border border-border rounded-lg shadow-lg z-10 w-64"
                  >
                    <div className="text-sm font-medium mb-2">Recent Comments</div>
                    <div className="space-y-1">
                      {Array.from({ length: Math.min(task.metrics.commentCount, 3) }).map((_, i) => (
                        <div key={i} className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                          Comment preview {i + 1}...
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Participants Counter */}
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {task.metrics.participantCount}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-task Progress */}
        {subTaskProgress.total > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Sub-tasks
              </span>
              <span className="text-xs text-muted-foreground">
                {subTaskProgress.completed}/{subTaskProgress.total}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Participant Avatars */}
        <div className="mb-4">
          <div className="flex -space-x-2">
            {task.metrics.activeParticipants.slice(0, 3).map((participant, index) => (
              <div
                key={participant.id}
                className={`w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium ${
                  participant.isActive 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}
                title={`${participant.user?.full_name} (${participant.role})`}
              >
                {participant.user?.full_name?.[0] || 'U'}
              </div>
            ))}
            {task.metrics.participantCount > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                +{task.metrics.participantCount - 3}
              </div>
            )}
          </div>
        </div>

        {/* Status, Priority, and Visibility */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Visibility Indicator */}
            <div className="flex items-center space-x-1">
              {task.visibility === 'public' ? (
                <Globe className="h-3 w-3 text-blue-500" />
              ) : (
                <Lock className="h-3 w-3 text-orange-500" />
              )}
              <span className="text-xs text-muted-foreground">
                {task.visibility}
              </span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {/* Delete button with permission check */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Check permissions: guests can only delete if they created, users can only delete their own
                if (isGuestMode && task.created_by !== 'guest') {
                  return
                }
                onDeleteTask(task.id)
              }}
              className={`p-1 transition-colors ${
                isGuestMode && task.created_by !== 'guest'
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-red-500 hover:text-red-600'
              }`}
              title={
                isGuestMode && task.created_by !== 'guest'
                  ? "Guests can only delete their own tasks"
                  : "Delete task"
              }
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // List View Component
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="neo-card p-4 bg-white/50 dark:bg-dark-card/50 hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <button
            onClick={() => onUpdateTask(task.id, { status: task.status === 'completed' ? 'ongoing' : 'completed' })}
            className={`p-1 rounded-full transition-colors ${
              task.status === 'completed' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
            }`}
          >
            <CheckCircle className="h-5 w-5" />
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold truncate ${
              task.status === 'completed' ? 'line-through text-gray-500' : 'text-primary-900 dark:text-dark-text'
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-primary-600 dark:text-primary-300 truncate">
                {task.description}
              </p>
            )}
            
            {/* Enhanced Metrics Row */}
            <div className="flex items-center space-x-4 mt-2">
              {/* Comments */}
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{task.metrics.commentCount}</span>
              </div>
              
              {/* Participants */}
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{task.metrics.participantCount}</span>
              </div>
              
              {/* Sub-task Progress */}
              {subTaskProgress.total > 0 && (
                <div className="flex items-center space-x-1">
                  <Circle className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {subTaskProgress.completed}/{subTaskProgress.total}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status and Priority */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          
          {/* Sub-task Progress Bar (if applicable) */}
          {subTaskProgress.total > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-muted rounded"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
          
          <button
            onClick={() => onDeleteTask(task.id)}
            className="p-1 text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expandable Sub-tasks */}
      <AnimatePresence>
        {isExpanded && subTaskProgress.total > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border"
          >
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Sub-tasks ({subTaskProgress.completed}/{subTaskProgress.total})
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-3">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {Array.from({ length: subTaskProgress.total }).map((_, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Circle 
                    className={`h-3 w-3 ${
                      index < subTaskProgress.completed 
                        ? 'text-green-600 fill-current' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                  <span className={index < subTaskProgress.completed ? 'line-through text-muted-foreground' : ''}>
                    Sub-task {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function EnhancedTaskList({
  tasks,
  onUpdateTask,
  onDeleteTask,
  searchQuery,
  isGuestMode = false
}: EnhancedTaskListProps) {
  const router = useRouter()

  // Load view mode preference (always grid)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pitstop_view_mode', 'grid')
    }
  }, [])

  // Enhance tasks with sample metrics data
  const tasksWithMetrics: TaskWithMetrics[] = useMemo(() => {
    return tasks.map((task, index) => ({
      ...task,
      metrics: generateSampleMetrics(task.id, index)
    }))
  }, [tasks])

  const filteredTasks = tasksWithMetrics.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="neo-card p-8 bg-white/50 dark:bg-dark-card/50">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-primary-900 dark:text-dark-text mb-2">No tasks yet</h3>
          <p className="text-primary-600 dark:text-primary-300">
            {searchQuery ? 'No tasks match your search' : 'Create your first task to get started'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Task Count */}
      <div className="text-sm text-muted-foreground">
        {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
      </div>

      {/* Task Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            viewMode="grid"
            isGuestMode={isGuestMode}
            router={router}
          />
        ))}
      </motion.div>
    </div>
  )
}