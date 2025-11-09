'use client'

import { useState } from 'react'
import { X, Calendar, Info, Clock } from 'lucide-react'
import { CreateTimeExtensionData } from '@/types'

interface CreateTimeExtensionModalProps {
  taskId: string
  originalDueDate?: string
  onClose: () => void
  onCreate: (data: CreateTimeExtensionData) => void
}

export function CreateTimeExtensionModal({ 
  taskId, 
  originalDueDate, 
  onClose, 
  onCreate 
}: CreateTimeExtensionModalProps) {
  const [newDueDate, setNewDueDate] = useState('')
  const [reason, setReason] = useState('')
  const [timeUnit, setTimeUnit] = useState<'hours' | 'days'>('days')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newDueDate || !reason.trim()) return

    setLoading(true)
    try {
      onCreate({
        task_id: taskId,
        new_due_date: newDueDate,
        reason: reason.trim()
      })
    } catch (error) {
      console.error('Error creating time extension:', error)
    } finally {
      setLoading(false)
    }
  }

  const setQuickExtension = (amount: number, unit: 'hours' | 'days') => {
    const now = new Date()
    const extension = new Date(now.getTime() + (amount * (unit === 'hours' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)))
    setNewDueDate(extension.toISOString().slice(0, 16))
    setReason(`${amount} ${unit} extension due to unforeseen circumstances`)
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="neo-card bg-white dark:bg-dark-card max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-primary-900 dark:text-dark-text">
              Extend Deadline
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-primary-100 dark:hover:bg-primary-700 rounded"
          >
            <X className="h-5 w-5 text-primary-500" />
          </button>
        </div>

        {/* Original due date info */}
        {originalDueDate && (
          <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center space-x-2 mb-1">
              <Info className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Original Due Date
              </span>
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-400">
              {formatDate(originalDueDate)}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              New Due Date & Time *
            </label>
            <input
              type="datetime-local"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-dark-bg text-primary-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Quick extension buttons */}
          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Quick Extensions
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setQuickExtension(1, 'hours')}
                className="px-3 py-2 text-xs border border-primary-300 dark:border-primary-600 rounded hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
              >
                +1 Hour
              </button>
              <button
                type="button"
                onClick={() => setQuickExtension(1, 'days')}
                className="px-3 py-2 text-xs border border-primary-300 dark:border-primary-600 rounded hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
              >
                +1 Day
              </button>
              <button
                type="button"
                onClick={() => setQuickExtension(3, 'days')}
                className="px-3 py-2 text-xs border border-primary-300 dark:border-primary-600 rounded hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
              >
                +3 Days
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Reason for Extension *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for extending the deadline"
              rows={3}
              className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-dark-bg text-primary-900 dark:text-dark-text placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <p className="text-xs text-primary-500 dark:text-primary-400 mt-1">
              This will be recorded in the extension history for transparency.
            </p>
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
              disabled={!newDueDate || !reason.trim() || loading}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Extending...' : 'Extend Deadline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}