'use client'

import { motion } from 'framer-motion'
import {
    Clock,
    MessageCircle,
    Users,
    CheckCircle,
    Share2,
    Trash2,
    Eye,
    Heart,
    Flame as Fire,
    MoreVertical,
    Calendar
} from 'lucide-react'
import { Task, TaskWithMetrics } from '@/types'
import { PrivacyControls } from '@/components/tasks/privacy-controls'
import { useState } from 'react'

interface TaskCardProps {
    task: TaskWithMetrics | any // Using any to support the PublicTask shape which has extra stats
    viewMode?: 'grid' | 'list'
    isGuestMode?: boolean
    currentUserId?: string
    onUpdate?: (taskId: string, updates: Partial<Task>) => void
    onDelete?: (taskId: string) => void
    onShare?: (task: any) => void
    onView?: (taskId: string) => void
    showActions?: boolean
    isPublic?: boolean
}

export function TaskCard({
    task,
    viewMode = 'grid',
    isGuestMode = false,
    currentUserId,
    onUpdate,
    onDelete,
    onShare,
    onView,
    showActions = true,
    isPublic = false
}: TaskCardProps) {
    const [showMenu, setShowMenu] = useState(false)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
            case 'ongoing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
            case 'delayed': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800'
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
            case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
            case 'medium': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
            case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
            default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
        }
    }

    const subTaskProgress = task.metrics?.subTaskProgress || { completed: 0, total: 0 }
    const progressPercentage = subTaskProgress.total > 0
        ? (subTaskProgress.completed / subTaskProgress.total) * 100
        : 0

    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent navigation if clicking on interactive elements
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.interactive')) {
            return
        }
        onView?.(task.id)
    }

    // Grid View
    if (viewMode === 'grid') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group relative bg-card hover:bg-accent/5 dark:hover:bg-accent/10 border border-border rounded-xl p-5 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
                onClick={handleCardClick}
            >
                {/* Status Stripe */}
                <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'ongoing' ? 'bg-blue-500' :
                        task.status === 'delayed' ? 'bg-orange-500' :
                            'bg-gray-500'
                    }`} />

                {/* Header */}
                <div className="flex items-start justify-between mb-3 pl-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                            {task.created_user?.full_name?.[0] || task.created_user?.username?.[0] || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                                {task.created_user?.full_name || task.created_user?.username || 'User'}
                            </p>
                            <p className="text-[10px] text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(task.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Priority Badge */}
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                    </div>
                </div>

                {/* Content */}
                <div className="pl-3 flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {task.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
                        {task.description || 'No description provided'}
                    </p>

                    {/* Progress Bar (if subtasks exist) */}
                    {subTaskProgress.total > 0 && (
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="pl-3 mt-auto pt-4 border-t border-border flex items-center justify-between">
                    {/* Stats */}
                    <div className="flex items-center space-x-3 text-muted-foreground">
                        {isPublic ? (
                            <>
                                <div className="flex items-center space-x-1 text-xs" title="Likes">
                                    <Heart className="h-3.5 w-3.5" />
                                    <span>{task.stats?.likes || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-xs" title="Views">
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>{task.stats?.views || 0}</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-1 text-xs" title="Participants">
                                <Users className="h-3.5 w-3.5" />
                                <span>{task.metrics?.participantCount || 0}</span>
                            </div>
                        )}
                        <div className="flex items-center space-x-1 text-xs" title="Comments">
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>{task.metrics?.commentCount || task.stats?.comments || 0}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1">
                        {!isPublic && onUpdate && (
                            <PrivacyControls
                                visibility={task.visibility}
                                onVisibilityChange={(visibility) => onUpdate(task.id, { visibility })}
                                compact
                            />
                        )}

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onShare?.(task)
                            }}
                            className="p-1.5 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors interactive"
                            title="Share"
                        >
                            <Share2 className="h-4 w-4" />
                        </button>

                        {showActions && onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (isGuestMode && task.created_by !== 'guest') return
                                    onDelete(task.id)
                                }}
                                className={`p-1.5 rounded-lg transition-colors interactive ${isGuestMode && task.created_by !== 'guest'
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    }`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        )
    }

    // List View
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="group bg-card hover:bg-accent/5 dark:hover:bg-accent/10 border border-border rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="flex items-center gap-4">
                {/* Status Indicator */}
                <div className={`w-1.5 h-12 rounded-full ${task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'ongoing' ? 'bg-blue-500' :
                        task.status === 'delayed' ? 'bg-orange-500' :
                            'bg-gray-500'
                    }`} />

                {/* Main Info */}
                <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 md:col-span-5">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {task.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                            {task.description || 'No description'}
                        </p>
                    </div>

                    {/* Meta Info */}
                    <div className="col-span-6 md:col-span-3 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px]">
                                {task.created_user?.full_name?.[0] || 'U'}
                            </div>
                            <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                                {task.created_user?.full_name || 'User'}
                            </span>
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="col-span-6 md:col-span-2 flex items-center space-x-4 text-muted-foreground">
                        <div className="flex items-center space-x-1 text-xs" title="Comments">
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>{task.metrics?.commentCount || task.stats?.comments || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs" title="Collaborators">
                            <Users className="h-3.5 w-3.5" />
                            <span>{task.metrics?.participantCount || 0}</span>
                        </div>
                        {subTaskProgress.total > 0 && (
                            <div className="flex items-center space-x-1 text-xs">
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>{Math.round(progressPercentage)}%</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-12 md:col-span-2 flex items-center justify-end space-x-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onShare?.(task)
                            }}
                            className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors interactive"
                        >
                            <Share2 className="h-4 w-4" />
                        </button>
                        {showActions && onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (isGuestMode && task.created_by !== 'guest') return
                                    onDelete(task.id)
                                }}
                                className={`p-2 rounded-lg transition-colors interactive ${isGuestMode && task.created_by !== 'guest'
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    }`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
