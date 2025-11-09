'use client'

import { Task } from '@/types'
import { CheckCircle, Clock, User, Trash2, Edit } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
  viewMode: 'grid' | 'list'
  searchQuery: string
}

const TaskItem = ({ task, onUpdateTask, onDeleteTask, viewMode }: any) => {
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

  if (viewMode === 'grid') {
    return (
      <div className="neo-card p-6 bg-white/50 dark:bg-dark-card/50 hover:scale-105 transition-transform duration-200">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-primary-900 dark:text-dark-text text-lg">{task.title}</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1 text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {task.description && (
          <p className="text-primary-600 dark:text-primary-300 mb-4 text-sm">{task.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="neo-card p-4 bg-white/50 dark:bg-dark-card/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onUpdateTask(task.id, { status: task.status === 'completed' ? 'ongoing' : 'completed' })}
            className={`p-1 rounded-full ${
              task.status === 'completed' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
            }`}
          >
            <CheckCircle className="h-5 w-5" />
          </button>
          <div>
            <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-primary-900 dark:text-dark-text'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-primary-600 dark:text-primary-300">{task.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <button
            onClick={() => onDeleteTask(task.id)}
            className="p-1 text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function TaskList({ tasks, onUpdateTask, onDeleteTask, viewMode, searchQuery }: TaskListProps) {
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
        />
      ))}
    </div>
  )
}