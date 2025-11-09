'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Plus, TreePine, CheckCircle2, Circle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SubTask, CreateSubTaskData, UpdateSubTaskData } from '@/types'
import { CreateSubTaskModal } from './create-sub-task-modal'

interface SubTaskManagerProps {
  taskId: string
  subTasks: SubTask[]
  onCreateSubTask: (data: CreateSubTaskData) => void
  onUpdateSubTask: (id: string, updates: UpdateSubTaskData) => void
  onDeleteSubTask: (id: string) => void
  isGuestMode?: boolean
  className?: string
}

export function SubTaskManager({ 
  taskId, 
  subTasks, 
  onCreateSubTask, 
  onUpdateSubTask, 
  onDeleteSubTask, 
  isGuestMode = false,
  className = '' 
}: SubTaskManagerProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [expandedSubTasks, setExpandedSubTasks] = useState<Set<string>>(new Set())

  // Calculate progress from sub-tasks
  const progress = subTasks.length > 0 
    ? Math.round((subTasks.filter(st => st.status === 'completed').length / subTasks.length) * 100)
    : 0

  const completedCount = subTasks.filter(st => st.status === 'completed').length

  const toggleSubTaskExpansion = (subTaskId: string) => {
    setExpandedSubTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(subTaskId)) {
        newSet.delete(subTaskId)
      } else {
        newSet.add(subTaskId)
      }
      return newSet
    })
  }

  const handleToggleSubTask = (subTaskId: string, currentStatus: SubTask['status']) => {
    const newStatus = currentStatus === 'completed' ? 'ongoing' : 'completed'
    onUpdateSubTask(subTaskId, { 
      status: newStatus,
      ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
    })
  }

  const handleCreateSubTask = (data: CreateSubTaskData) => {
    onCreateSubTask(data)
    setShowCreateModal(false)
  }

  return (
    <div className={`border border-primary-200 dark:border-primary-700 rounded-xl overflow-hidden ${className}`}>
      {/* Sub-task Header */}
      <div className="p-4 bg-primary-50 dark:bg-primary-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-primary-200 dark:hover:bg-primary-700 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              )}
            </button>
            
            <TreePine className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            
            <div>
              <h3 className="font-semibold text-primary-900 dark:text-dark-text">
                Sub-Tasks ({completedCount}/{subTasks.length})
              </h3>
              {subTasks.length > 0 && (
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-20 h-2 bg-primary-200 dark:bg-primary-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-primary-600 dark:text-primary-400">
                    {progress}% complete
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="neo-button px-3 py-1 text-sm flex items-center space-x-1"
            disabled={isGuestMode && subTasks.length >= 3}
          >
            <Plus className="h-3 w-3" />
            <span>Add Sub-Task</span>
          </button>
        </div>
      </div>

      {/* Sub-task List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-primary-200 dark:border-primary-700"
          >
            {subTasks.length === 0 ? (
              <div className="p-6 text-center text-primary-500 dark:text-primary-400">
                <TreePine className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No sub-tasks yet. Add one to get started!</p>
              </div>
            ) : (
              <div className="divide-y divide-primary-200 dark:divide-primary-700">
                {subTasks.map((subTask, index) => (
                  <SubTaskItem
                    key={subTask.id}
                    subTask={subTask}
                    depth={0}
                    isExpanded={expandedSubTasks.has(subTask.id)}
                    onToggleExpand={() => toggleSubTaskExpansion(subTask.id)}
                    onToggleStatus={() => handleToggleSubTask(subTask.id, subTask.status)}
                    onUpdate={(updates) => onUpdateSubTask(subTask.id, updates)}
                    onDelete={() => onDeleteSubTask(subTask.id)}
                    isGuestMode={isGuestMode}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Sub-task Modal */}
      {showCreateModal && (
        <CreateSubTaskModal
          taskId={taskId}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateSubTask}
        />
      )}
    </div>
  )
}

interface SubTaskItemProps {
  subTask: SubTask
  depth: number
  isExpanded: boolean
  onToggleExpand: () => void
  onToggleStatus: () => void
  onUpdate: (updates: UpdateSubTaskData) => void
  onDelete: () => void
  isGuestMode: boolean
}

function SubTaskItem({ 
  subTask, 
  depth, 
  isExpanded, 
  onToggleExpand, 
  onToggleStatus, 
  onUpdate, 
  onDelete, 
  isGuestMode 
}: SubTaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(subTask.title)

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== subTask.title) {
      onUpdate({ title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      setEditTitle(subTask.title)
      setIsEditing(false)
    }
  }

  const handleTitleClick = () => {
    if (!isGuestMode) {
      setIsEditing(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-3 hover:bg-primary-25 dark:hover:bg-primary-800/30 transition-colors"
      style={{ paddingLeft: `${depth * 20 + 12}px` }}
    >
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleStatus}
          className="flex-shrink-0"
          disabled={isGuestMode}
        >
          {subTask.status === 'completed' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-primary-400 hover:text-primary-600" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyPress}
              className="w-full px-2 py-1 text-sm border border-primary-300 dark:border-primary-600 rounded bg-white dark:bg-dark-card text-primary-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-blue-500"
              autoFocus
            />
          ) : (
            <h4 
              className={`text-sm font-medium cursor-pointer hover:text-primary-700 dark:hover:text-dark-text ${
                subTask.status === 'completed' 
                  ? 'line-through text-primary-500 dark:text-primary-400' 
                  : 'text-primary-900 dark:text-dark-text'
              }`}
              onClick={handleTitleClick}
            >
              {subTask.title}
            </h4>
          )}
          
          {subTask.description && (
            <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
              {subTask.description}
            </p>
          )}
        </div>

        {!isGuestMode && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500 transition-all"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </motion.div>
  )
}