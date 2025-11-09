'use client'

import { useState } from 'react'
import { Calendar, Clock, Plus, History, Info } from 'lucide-react'
import { TimeExtension, CreateTimeExtensionData } from '@/types'
import { CreateTimeExtensionModal } from './create-time-extension-modal'

interface TimeExtensionManagerProps {
  taskId: string
  currentDueDate?: string
  extensions: TimeExtension[]
  onCreateExtension: (data: CreateTimeExtensionData) => void
  isGuestMode?: boolean
  className?: string
}

export function TimeExtensionManager({
  taskId,
  currentDueDate,
  extensions,
  onCreateExtension,
  isGuestMode = false,
  className = ''
}: TimeExtensionManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const handleCreateExtension = (data: CreateTimeExtensionData) => {
    onCreateExtension(data)
    setShowCreateModal(false)
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

  const getExtensionStatus = (newDate: string, isOverdue: boolean) => {
    if (isOverdue) return 'overdue'
    return 'extended'
  }

  return (
    <div className={`border border-primary-200 dark:border-primary-700 rounded-xl overflow-hidden ${className}`}>
      {/* Time Extension Header */}
      <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            
            <div>
              <h3 className="font-semibold text-primary-900 dark:text-dark-text">
                Time Management
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="h-3 w-3 text-primary-500" />
                <span className="text-xs text-primary-600 dark:text-primary-400">
                  Current due date: {currentDueDate ? formatDate(currentDueDate) : 'Not set'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {extensions.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-3 py-1 text-xs border border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors flex items-center space-x-1"
              >
                <History className="h-3 w-3" />
                <span>History ({extensions.length})</span>
              </button>
            )}
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="neo-button px-3 py-1 text-sm flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
              disabled={isGuestMode}
            >
              <Plus className="h-3 w-3" />
              <span>Extend</span>
            </button>
          </div>
        </div>
      </div>

      {/* Extension History */}
      {showHistory && extensions.length > 0 && (
        <div className="border-t border-primary-200 dark:border-primary-700">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/30">
            <h4 className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-3">
              Extension History
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {extensions.map((extension) => (
                <div
                  key={extension.id}
                  className="p-3 bg-white dark:bg-dark-card rounded-lg border border-primary-200 dark:border-primary-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                          {extension.user?.full_name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-primary-500 dark:text-primary-500">
                          {formatDate(extension.created_at)}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-red-500 line-through">{formatDate(extension.original_due_date)}</span>
                          <span className="text-primary-400">→</span>
                          <span className="text-green-500 font-medium">{formatDate(extension.new_due_date)}</span>
                        </div>
                        
                        <p className="text-sm text-primary-700 dark:text-primary-300">
                          {extension.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Extensions Message */}
      {extensions.length === 0 && (
        <div className="p-6 text-center text-primary-500 dark:text-primary-400">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No deadline extensions yet.</p>
          <p className="text-xs mt-1">Extend deadlines when needed with a reason.</p>
        </div>
      )}

      {/* Create Extension Modal */}
      {showCreateModal && (
        <CreateTimeExtensionModal
          taskId={taskId}
          originalDueDate={currentDueDate}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateExtension}
        />
      )}
    </div>
  )
}