'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import { Task, TaskWithMetrics } from '@/types'
import { useAuth } from '@/components/providers/auth-provider'
import { TaskCard } from '@/components/tasks/task-card'
import { ShareModal } from '@/components/tasks/share-modal'

interface EnhancedTaskListProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
  searchQuery: string
  isGuestMode?: boolean
  viewMode?: 'grid' | 'list'
}

export function EnhancedTaskList({
  tasks,
  onUpdateTask,
  onDeleteTask,
  searchQuery,
  isGuestMode = false,
  viewMode = 'grid'
}: EnhancedTaskListProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

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
          activeParticipants: [],
          lastActivity: task.updated_at
        }
      }
    })
  }, [tasks])

  const filteredTasks = tasksWithMetrics.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleShare = (task: Task) => {
    setSelectedTask(task)
    setShowShareModal(true)
  }

  const handleView = (taskId: string) => {
    router.push(`/tasks/${taskId}`)
  }

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

      {/* Task Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={viewMode === 'grid'
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }
      >
        {filteredTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            viewMode={viewMode}
            isGuestMode={isGuestMode}
            currentUserId={user?.id}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onShare={handleShare}
            onView={handleView}
          />
        ))}
      </motion.div>

      {/* Share Modal */}
      {selectedTask && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false)
            setSelectedTask(null)
          }}
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
        />
      )}
    </div>
  )
}