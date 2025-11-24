'use client'

import { Task } from '@/types'
import { useRouter } from 'next/navigation'
import { CheckCircle, Clock, User, Trash2, Edit, MessageCircle, CheckSquare, Users, Globe, Lock, Share2 } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
  viewMode: 'grid' | 'list'
  searchQuery: string
  isGuestMode?: boolean
}

const TaskItem = ({ task, onUpdateTask, onDeleteTask, viewMode, isGuestMode = false }: any) => {
  const router = useRouter()
  
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

  const handleTaskClick = () => {
    router.push(`/tasks/${task.id}`)
  }

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newVisibility = task.visibility === 'public' ? 'private' : 'public'
    onUpdateTask(task.id, { visibility: newVisibility })
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement share functionality
    console.log('Share task:', task.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isGuestMode || task.created_by === 'guest' || task.created_by === 'sample') {
      onDeleteTask(task.id)
    } else {
      onDeleteTask(task.id)
    }
  }

  const getCommentCount = () => {
    return task.comments?.length || 0
  }

  const getSubTaskProgress = () => {
    if (!task.sub_tasks || task.sub_tasks.length === 0) return null
    const completed = task.sub_tasks.filter((st: any) => st.status === 'completed').length
    const total = task.sub_tasks.length
    return { completed, total }
  }

  const getParticipantCount = () => {
    const uniqueUsers = new Set()
    if (task.comments) {
      task.comments.forEach((comment: any) => {
        if (comment.user_id) uniqueUsers.add(comment.user_id)
      })
    }
    if (task.created_by) uniqueUsers.add(task.created_by)
    if (task.assigned_to) uniqueUsers.add(task.assigned_to)
    return uniqueUsers.size
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isOverdue = () => {
    if (!task.due_date) return false
    return new Date(task.due_date) < new Date()
  }

  if (viewMode === 'grid') {
    const subTaskProgress = getSubTaskProgress()
    const commentCount = getCommentCount()
    const participantCount = getParticipantCount()

    return (
      <div
        className="neo-card p-6 bg-white/50 dark:bg-dark-card/50 hover:scale-105 transition-all duration-200 cursor-pointer group"
        onClick={handleTaskClick}
      >
        {/* Top Row: Status and Privacy Toggle */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          <button
            onClick={handleToggleVisibility}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title={task.visibility === 'public' ? 'Switch to private' : 'Switch to public'}
          >
            {task.visibility === 'public' ? (
              <Globe className="h-4 w-4 text-blue-600" />
            ) : (
              <Lock className="h-4 w-4 text-orange-600" />
            )}
          </button>
        </div>

        {/* Middle Section: Title and Description */}
        <div className="mb-4">
          <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-2">{task.title}</h3>
          {task.description && (
            <p className="text-muted-foreground text-sm line-clamp-3">{task.description}</p>
          )}
        </div>

        {/* Due Date */}
        {task.due_date && (
          <div className="flex items-center space-x-2 mb-4 text-sm">
            <Clock className={`h-4 w-4 ${isOverdue() ? 'text-red-500' : 'text-muted-foreground'}`} />
            <span className={isOverdue() ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
              Due {formatDate(task.due_date)}
              {isOverdue() && ' (Overdue)'}
            </span>
          </div>
        )}

        {/* Bottom Section: Action Icons */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {/* Comment Count */}
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{commentCount}</span>
            </div>
            {/* Collaborator Count */}
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{participantCount}</span>
            </div>
            {/* Sub-task Progress */}
            {subTaskProgress && (
              <div className="flex items-center space-x-1">
                <CheckSquare className="h-4 w-4" />
                <span>{subTaskProgress.completed}/{subTaskProgress.total}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-1 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Share task"
            >
              <Share2 className="h-4 w-4" />
            </button>
            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sub-task Progress Bar */}
        {subTaskProgress && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{Math.round((subTaskProgress.completed / subTaskProgress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(subTaskProgress.completed / subTaskProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  const subTaskProgress = getSubTaskProgress()
  const commentCount = getCommentCount()
  const participantCount = getParticipantCount()

  return (
    <div
      className="neo-card p-4 bg-white/50 dark:bg-dark-card/50 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
      onClick={handleTaskClick}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
        <button
          onClick={handleToggleVisibility}
          className="p-1 hover:bg-accent rounded transition-colors"
          title={task.visibility === 'public' ? 'Switch to private' : 'Switch to public'}
        >
          {task.visibility === 'public' ? (
            <Globe className="h-4 w-4 text-blue-600" />
          ) : (
            <Lock className="h-4 w-4 text-orange-600" />
          )}
        </button>
      </div>

      <div className="mb-3">
        <h3 className={`font-semibold text-lg mb-2 ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-foreground'}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{task.description}</p>
        )}
        
        {/* Due Date for List View */}
        {task.due_date && (
          <div className="flex items-center space-x-2 text-sm">
            <Clock className={`h-4 w-4 ${isOverdue() ? 'text-red-500' : 'text-muted-foreground'}`} />
            <span className={isOverdue() ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
              Due {formatDate(task.due_date)}
              {isOverdue() && ' (Overdue)'}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          {/* Comment Count */}
          <div className="flex items-center space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span>{commentCount}</span>
          </div>
          {/* Collaborator Count */}
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{participantCount}</span>
          </div>
          {/* Sub-task Progress */}
          {subTaskProgress && (
            <div className="flex items-center space-x-1">
              <CheckSquare className="h-4 w-4" />
              <span>{subTaskProgress.completed}/{subTaskProgress.total}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-1 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title="Share task"
          >
            <Share2 className="h-4 w-4" />
          </button>
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sub-task Progress Bar for List View */}
      {subTaskProgress && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{Math.round((subTaskProgress.completed / subTaskProgress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(subTaskProgress.completed / subTaskProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function TaskList({ tasks, onUpdateTask, onDeleteTask, viewMode, searchQuery, isGuestMode = false }: TaskListProps) {
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="neo-card p-8 bg-white/50 dark:bg-dark-card/50">
          <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No tasks yet</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'No tasks match your search' : 'Create your first task to get started'}
          </p>
        </div>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            viewMode={viewMode}
            isGuestMode={isGuestMode}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredTasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          viewMode={viewMode}
          isGuestMode={isGuestMode}
        />
      ))}
    </div>
  )
}