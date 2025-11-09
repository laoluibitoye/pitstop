'use client'

import { useState } from 'react'
import { X, Plus, Calendar, Flag } from 'lucide-react'
import { Task } from '@/types'

interface CreateTaskModalProps {
  onClose: () => void
  onCreateTask: (taskData: any) => void
  isGuestMode: boolean
}

export function CreateTaskModal({ onClose, onCreateTask, isGuestMode }: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return

    const taskData: any = {
      title: title.trim(),
      description: description.trim(),
      priority,
    }

    if (dueDate) {
      taskData.due_date = dueDate
    }

    onCreateTask(taskData)
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="neo-card bg-white/90 dark:bg-dark-card/90 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary-900 dark:text-dark-text">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-1 text-primary-600 dark:text-primary-300 hover:text-primary-900 dark:hover:text-dark-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary-900 dark:text-dark-text mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="neo-input w-full"
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-900 dark:text-dark-text mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="neo-input w-full"
              placeholder="Add more details about this task..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-900 dark:text-dark-text mb-2">
                <Flag className="h-4 w-4 inline mr-1" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="neo-input w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-900 dark:text-dark-text mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Due Date
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="neo-input w-full"
              />
            </div>
          </div>

          {isGuestMode && (
            <div className="neo-card p-3 bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Guest Mode: You can create up to 1 task and 3 comments. 
                Sign up for unlimited features.
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-primary-600 dark:text-primary-300 hover:text-primary-900 dark:hover:text-dark-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 neo-button flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}