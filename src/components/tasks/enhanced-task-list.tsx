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
  Lock,
  Share2,
  Eye,
  Heart
} from 'lucide-react'
import { Task, TaskWithMetrics, ViewModePreferences } from '@/types'
import { PrivacyControls } from '@/components/tasks/privacy-controls'
import { ShareModal } from '@/components/tasks/share-modal'
import { useAuth } from '@/components/providers/auth-provider'

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
  user: any
}

const TaskItem = ({ task, onUpdateTask, onDeleteTask, viewMode, isGuestMode = false, router, user }: TaskItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCommentPreview, setShowCommentPreview] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'ongoing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
      case 'delayed': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
      case 'medium': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const subTaskProgress = task.metrics.subTaskProgress
  const progressPercentage = subTaskProgress.total > 0
    ? (subTaskProgress.completed / subTaskProgress.total) * 100
    : 0

  const handleTaskClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.action-area')) {
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
        className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200 group cursor-pointer"
        onClick={handleTaskClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {user?.user_metadata?.full_name || 'You'}
              </p>
              <p className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(task.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status and Priority */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status}
            </div>

            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </div>
          </div>
        </div>

        {/* Content */}
        <h3 className="font-semibold text-foreground mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {task.title}
        </h3>

        {task.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Stats & Metrics */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{task.metrics.commentCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{task.metrics.participantCount}</span>
            </div>
            {subTaskProgress.total > 0 && (
              <div className="flex items-center space-x-1" title={`Subtasks: ${subTaskProgress.completed}/${subTaskProgress.total}`}>
                <CheckCircle className="h-4 w-4" />
                <span>{subTaskProgress.completed}/{subTaskProgress.total}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border action-area">
          <div className="flex items-center space-x-2">
            <PrivacyControls
              visibility={task.visibility}
              onVisibilityChange={(visibility) => onUpdateTask(task.id, { visibility })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowShareModal(true)
              }}
              className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Share task"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Check permissions: guests can only delete if they created, users can only delete their own
                if (isGuestMode && task.created_by !== 'guest') {
                  return
                }
                onDeleteTask(task.id)
              }}
              className={`p-2 rounded-lg transition-colors ${isGuestMode && task.created_by !== 'guest'
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
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

        {/* Share Modal */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          taskId={task.id}
          taskTitle={task.title}
        />
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
      className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200 group cursor-pointer"
      onClick={handleTaskClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* User Avatar */}
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
            {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onUpdateTask(task.id, { status: task.status === 'completed' ? 'ongoing' : 'completed' })
            }}
            className={`p-1 rounded-full transition-colors action-area ${task.status === 'completed' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
              }`}
          >
            <CheckCircle className="h-5 w-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold truncate ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'
              }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground truncate">
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

        <div className="flex items-center space-x-2 action-area">
          {/* Status and Priority */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>

          <PrivacyControls
            visibility={task.visibility}
            onVisibilityChange={(visibility) => onUpdateTask(task.id, { visibility })}
          />

          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowShareModal(true)
            }}
            className="p-1 text-muted-foreground hover:text-blue-500 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteTask(task.id)
            }}
            className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        taskId={task.id}
        taskTitle={task.title}
      />
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
  const { user } = useAuth()

  // Load view mode preference (always grid)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pitstop_view_mode', 'grid')
    }
  }, [])

  // Calculate real metrics from actual task data
  const tasksWithMetrics: TaskWithMetrics[] = useMemo(() => {
    return tasks.map((task) => {
      // Calculate real metrics from actual data
      const realCommentCount = task.comments?.length || 0
      const realSubTasks = task.sub_tasks || []
      const completedSubTasks = realSubTasks.filter(st => st.status === 'completed').length
      const totalSubTasks = realSubTasks.length

      // Calculate real participant count
      const uniqueParticipants = new Set()
      if (task.created_by) uniqueParticipants.add(task.created_by)
      if (task.assigned_to) uniqueParticipants.add(task.assigned_to)
      if (task.comments) {
        task.comments.forEach(comment => {
          if (comment.user_id) uniqueParticipants.add(comment.user_id)
        })
      }

      return {
        ...task,
        metrics: {
          commentCount: realCommentCount,
          participantCount: uniqueParticipants.size,
          subTaskProgress: {
            completed: completedSubTasks,
            total: totalSubTasks
          },
          activeParticipants: Array.from(uniqueParticipants).slice(0, 3).map((userId, index) => ({
            id: `participant_${userId}_${index}`,
            user_id: String(userId),
            role: ['assignee', 'commenter', 'editor'][index % 3] as 'assignee' | 'commenter' | 'editor',
            isActive: index === 0 || Math.random() > 0.3, // Keep some activity simulation
            lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            user: {
              id: String(userId),
              email: `${userId}@example.com`,
              full_name: `User ${index + 1}`,
              avatar_url: undefined,
              role: 'user' as const,
              created_at: '2024-01-01T00:00:00.000Z',
              updated_at: '2024-01-01T00:00:00.000Z'
            }
          })),
          lastActivity: task.updated_at
        }
      }
    })
  }, [tasks])

  const filteredTasks = tasksWithMetrics.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-card border border-border rounded-lg p-8">
          <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No tasks yet</h3>
          <p className="text-muted-foreground">
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
            user={user}
          />
        ))}
      </motion.div>
    </div>
  )
}