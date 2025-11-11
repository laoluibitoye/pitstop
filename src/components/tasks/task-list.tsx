'use client'

import { Task } from '@/types'
import { useRouter } from 'next/navigation'
import { CheckCircle, Clock, User, Trash2, Edit, MessageCircle, CheckSquare, Users } from 'lucide-react'

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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent task click when deleting
    if (isGuestMode || task.created_by === 'guest' || task.created_by === 'sample') {
      onDeleteTask(task.id) // Allow guests to delete their created tasks
    } else {
      onDeleteTask(task.id) // For now, allow all deletions (can be restricted later)
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
    // Count unique comment authors
    if (task.comments) {
      task.comments.forEach((comment: any) => {
        if (comment.user_id) uniqueUsers.add(comment.user_id)
      })
    }
    // Count task creator
    if (task.created_by) uniqueUsers.add(task.created_by)
    // Count assigned user
    if (task.assigned_to) uniqueUsers.add(task.assigned_to)
    return uniqueUsers.size
  }

  if (viewMode === 'grid') {
    const subTaskProgress = getSubTaskProgress()
    const commentCount = getCommentCount()
    const participantCount = getParticipantCount()
    const lastModified = new Date(task.updated_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    return (
      <div
        className="neo-card p-6 bg-white/50 dark:bg-dark-card/50 hover:scale-105 transition-transform duration-200 cursor-pointer"
        onClick={handleTaskClick}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-primary-900 dark:text-dark-text text-lg pr-2 flex-1">{task.title}</h3>
        </div>
        {task.description && (
          <p className="text-primary-600 dark:text-primary-300 mb-4 text-sm line-clamp-2">{task.description}</p>
        )}
        
        {/* Task Metadata Row - Status/Priority Left, Icons Right */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          
          {/* Icons Inline on Right */}
          <div className="flex items-center space-x-2">
            {/* Participants Count */}
            <div className="flex items-center space-x-1 text-blue-600">
              <Users className="h-3 w-3" />
              <span className="text-xs font-medium">{participantCount}</span>
            </div>
            {/* Comment Count */}
            <div className="flex items-center space-x-1 text-green-600">
              <MessageCircle className="h-3 w-3" />
              <span className="text-xs font-medium">{commentCount}</span>
            </div>
            {/* Sub-task Progress */}
            <div className="flex items-center space-x-1 text-purple-600">
              <CheckSquare className="h-3 w-3" />
              <span className="text-xs font-medium">{subTaskProgress ? `${subTaskProgress.completed}/${subTaskProgress.total}` : '0/0'}</span>
            </div>
            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title={isGuestMode ? "Delete task" : "Delete task"}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Last Modified Date */}
        <div className="text-xs text-muted-foreground mb-3">
          Modified: {lastModified}
        </div>

        {/* Sub-task Progress Bar */}
        {subTaskProgress && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{Math.round((subTaskProgress.completed / subTaskProgress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(subTaskProgress.completed / subTaskProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent task click when toggling status
    onUpdateTask(task.id, { status: task.status === 'completed' ? 'ongoing' : 'completed' })
  }

  const subTaskProgress = getSubTaskProgress()
  const commentCount = getCommentCount()
  const participantCount = getParticipantCount()
  const lastModified = new Date(task.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div
      className="neo-card p-4 bg-white/50 dark:bg-dark-card/50 hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
      onClick={handleTaskClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <button
            onClick={handleToggleStatus}
            className={`p-1 rounded-full ${
              task.status === 'completed' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
            }`}
          >
            <CheckCircle className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-primary-900 dark:text-dark-text'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-primary-600 dark:text-primary-300 mb-2">{task.description}</p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              
              {/* Icons Inline on Right */}
              <div className="flex items-center space-x-2">
                {/* Participants Count */}
                <div className="flex items-center space-x-1 text-blue-600">
                  <Users className="h-3 w-3" />
                  <span className="text-xs font-medium">{participantCount}</span>
                </div>
                {/* Comment Count */}
                <div className="flex items-center space-x-1 text-green-600">
                  <MessageCircle className="h-3 w-3" />
                  <span className="text-xs font-medium">{commentCount}</span>
                </div>
                {/* Sub-task Progress */}
                <div className="flex items-center space-x-1 text-purple-600">
                  <CheckSquare className="h-3 w-3" />
                  <span className="text-xs font-medium">{subTaskProgress ? `${subTaskProgress.completed}/${subTaskProgress.total}` : '0/0'}</span>
                </div>
                {/* Delete Button */}
                <button
                  onClick={handleDelete}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title={isGuestMode ? "Delete task" : "Delete task"}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Modified Date */}
      <div className="text-xs text-muted-foreground mt-2 ml-9">
        Modified: {lastModified}
      </div>
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
          <h3 className="text-lg font-semibold text-primary-900 dark:text-dark-text mb-2">No tasks yet</h3>
          <p className="text-primary-600 dark:text-primary-300">
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