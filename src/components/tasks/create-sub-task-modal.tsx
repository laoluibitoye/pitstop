'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { CreateSubTaskData } from '@/types'

interface CreateSubTaskModalProps {
  taskId: string
  onClose: () => void
  onCreate: (data: CreateSubTaskData) => void
}

export function CreateSubTaskModal({ taskId, onClose, onCreate }: CreateSubTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return

    setLoading(true)
    try {
      onCreate({
        task_id: taskId,
        title: title.trim(),
        description: description.trim() || undefined
      })
    } catch (error) {
      console.error('Error creating sub-task:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="neo-card bg-white dark:bg-dark-card max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary-900 dark:text-dark-text">
            Add Sub-Task
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-primary-100 dark:hover:bg-primary-700 rounded"
          >
            <X className="h-5 w-5 text-primary-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter sub-task title"
              className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-dark-bg text-primary-900 dark:text-dark-text placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-blue-500"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter sub-task description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-dark-bg text-primary-900 dark:text-dark-text placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="neo-button px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Sub-Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}