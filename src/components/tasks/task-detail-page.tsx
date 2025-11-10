'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Edit,
  MessageSquare,
  Users,
  Paperclip,
  Clock,
  CheckSquare,
  Activity,
  Plus,
  MoreVertical,
  Share,
  Archive,
  Star,
  Flag,
  Calendar,
  User,
  UserCheck,
  Download,
  X,
  Reply,
  Edit2,
  Trash2,
  AlertCircle,
  Send,
  FileText,
  Image,
  Code,
  File,
  ChevronRight,
  Link,
  ExternalLink,
  UserPlus
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { Task, TaskComment, SubTask, TaskFile, ActivityLog, Profile } from '@/types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SharedHeader } from '@/components/layout/shared-header'
import { SharedFooter } from '@/components/layout/shared-footer'

interface TaskDetailPageProps {
  taskId: string
}

interface ThreadedComment extends TaskComment {
  replies: ThreadedComment[]
  isEditing: boolean
}

interface TaskDependency {
  id: string
  type: 'blocks' | 'blocked_by' | 'relates_to'
  task: Task
}

interface FileUpload {
  file: File
  preview?: string
  progress?: number
}

export function TaskDetailPage({ taskId }: TaskDetailPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Task data state
  const [comments, setComments] = useState<ThreadedComment[]>([])
  const [subTasks, setSubTasks] = useState<SubTask[]>([])
  const [files, setFiles] = useState<TaskFile[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([])
  const [participants, setParticipants] = useState<Profile[]>([])
  const [dependencies, setDependencies] = useState<TaskDependency[]>([])
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditingTask, setIsEditingTask] = useState(false)
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [isAddingSubTask, setIsAddingSubTask] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  
  // Form states
  const [newComment, setNewComment] = useState('')
  const [newSubTask, setNewSubTask] = useState('')
  const [editCommentId, setEditCommentId] = useState<string | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')

  // View mode from URL params
  const viewMode = searchParams.get('view') || 'list'

  // Load task data
  useEffect(() => {
    loadTask()
  }, [taskId])

  const loadTask = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // In a real app, this would fetch from API
      const taskData = await mockTaskData(taskId)
      setTask(taskData)
      
      // Load related data
      await Promise.all([
        loadComments(taskId),
        loadSubTasks(taskId),
        loadFiles(taskId),
        loadActivityLog(taskId),
        loadParticipants(taskId),
        loadDependencies(taskId)
      ])
    } catch (err) {
      setError('Failed to load task')
      console.error('Error loading task:', err)
    } finally {
      setLoading(false)
    }
  }

  // Mock data functions (replace with actual API calls)
  const mockTaskData = async (id: string): Promise<Task> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      id,
      title: `Task ${id}`,
      description: 'This is a detailed task description with rich content and context.',
      status: 'ongoing',
      priority: 'high',
      created_by: 'user_1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      position: 0,
      visibility: 'public'
    }
  }

  const loadComments = async (taskId: string) => {
    const mockComments: ThreadedComment[] = [
      {
        id: '1',
        task_id: taskId,
        user_id: 'user_1',
        content: 'Initial discussion about this task',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        replies: [
          {
            id: '2',
            task_id: taskId,
            user_id: 'user_2',
            content: 'Good point! I agree with this approach.',
            created_at: '2024-01-01T00:30:00Z',
            updated_at: '2024-01-01T00:30:00Z',
            replies: [],
            isEditing: false
          }
        ],
        isEditing: false
      }
    ]
    setComments(mockComments)
  }

  const loadSubTasks = async (taskId: string) => {
    const mockSubTasks: SubTask[] = [
      {
        id: '1',
        task_id: taskId,
        title: 'Design mockups',
        description: 'Create initial design concepts',
        status: 'completed',
        position: 0,
        completed_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        task_id: taskId,
        title: 'Implementation',
        description: 'Code the features',
        status: 'ongoing',
        position: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]
    setSubTasks(mockSubTasks)
  }

  const loadFiles = async (taskId: string) => {
    setFiles([])
  }

  const loadActivityLog = async (taskId: string) => {
    const mockActivity: ActivityLog[] = [
      {
        id: '1',
        user_id: 'user_1',
        task_id: taskId,
        action: 'created',
        details: 'Created the task',
        created_at: '2024-01-01T00:00:00Z'
      }
    ]
    setActivityLog(mockActivity)
  }

  const loadParticipants = async (taskId: string) => {
    setParticipants([])
  }

  const loadDependencies = async (taskId: string) => {
    setDependencies([])
  }

  // Event handlers
  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return

    const comment: ThreadedComment = {
      id: Date.now().toString(),
      task_id: taskId,
      user_id: user.id,
      content: newComment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      replies: [],
      isEditing: false
    }

    setComments(prev => [...prev, comment])
    setNewComment('')
    setIsAddingComment(false)
  }

  const handleAddSubTask = async () => {
    if (!newSubTask.trim() || !task) return

    const subTask: SubTask = {
      id: Date.now().toString(),
      task_id: task.id,
      title: newSubTask,
      status: 'ongoing',
      position: subTasks.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setSubTasks(prev => [...prev, subTask])
    setNewSubTask('')
    setIsAddingSubTask(false)
  }

  const handleSubTaskToggle = async (subTaskId: string, completed: boolean) => {
    setSubTasks(prev => prev.map(st => 
      st.id === subTaskId 
        ? { 
            ...st, 
            status: completed ? 'completed' : 'ongoing',
            completed_at: completed ? new Date().toISOString() : undefined
          }
        : st
    ))
  }

  // Drag and drop for file uploads
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    // Process file uploads here
    console.log('Files dropped:', files)
  }

  // Edit handlers
  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId)
    if (comment) {
      setEditCommentId(commentId)
      setEditCommentContent(comment.content)
    }
  }

  const handleSaveCommentEdit = () => {
    if (!editCommentId) return
    
    setComments(prev => prev.map(c => 
      c.id === editCommentId 
        ? { ...c, content: editCommentContent }
        : c
    ))
    setEditCommentId(null)
    setEditCommentContent('')
  }

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  // Mock data preview content
  const subTaskProgress = useMemo(() => {
    const total = subTasks.length
    const completed = subTasks.filter(st => st.status === 'completed').length
    return { total, completed, percentage: total > 0 ? (completed / total) * 100 : 0 }
  }, [subTasks])

  if (loading) return <LoadingSpinner />
  
  if (error || !task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error loading task</h2>
          <p className="text-muted-foreground mb-4">{error || 'Task not found'}</p>
          <button
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Shared Header */}
      <SharedHeader
        title={task.title}
        subtitle={`${subTaskProgress.completed}/${subTaskProgress.total} sub-tasks • ${comments.length} comments`}
        showBackButton={true}
        showSearch={true}
      />

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Task Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="neo-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'delayed' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {task.status}
                    </span>
                    <span className={`text-xs font-medium ${
                      task.priority === 'urgent' ? 'text-red-600' :
                      task.priority === 'high' ? 'text-orange-600' :
                      task.priority === 'medium' ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {task.priority} priority
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-foreground mb-4">{task.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Activity className="h-4 w-4" />
                      <span>Updated {new Date(task.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              {subTaskProgress.total > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {subTaskProgress.completed}/{subTaskProgress.total} ({Math.round(subTaskProgress.percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${subTaskProgress.percentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Tabs */}
            <div className="border-b border-border">
              <nav className="flex space-x-8">
                {[
                  { id: 'comments', label: 'Comments', icon: MessageSquare, count: comments.length },
                  { id: 'subtasks', label: 'Sub-tasks', icon: CheckSquare, count: subTasks.length },
                  { id: 'activity', label: 'Activity', icon: Activity, count: activityLog.length },
                  { id: 'files', label: 'Files', icon: Paperclip, count: files.length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'comments' && (
                <motion.div
                  key="comments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Add Comment */}
                  <div className="neo-card p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {user?.user_metadata?.full_name?.[0] || 'U'}
                      </div>
                      <div className="flex-1">
                        {isAddingComment ? (
                          <div className="space-y-3">
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Add a comment..."
                              className="w-full p-3 border border-border rounded-lg resize-none"
                              rows={3}
                            />
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={handleAddComment}
                                className="btn-primary"
                                disabled={!newComment.trim()}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Comment
                              </button>
                              <button
                                onClick={() => {
                                  setIsAddingComment(false)
                                  setNewComment('')
                                }}
                                className="btn-ghost"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsAddingComment(true)}
                            className="w-full text-left p-3 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Add a comment...
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Comments Thread */}
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        onEdit={handleEditComment}
                        onDelete={handleDeleteComment}
                        onReply={setReplyTo}
                        editCommentId={editCommentId}
                        editCommentContent={editCommentContent}
                        setEditCommentContent={setEditCommentContent}
                        onSaveEdit={handleSaveCommentEdit}
                        onCancelEdit={() => {
                          setEditCommentId(null)
                          setEditCommentContent('')
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'subtasks' && (
                <motion.div
                  key="subtasks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Add Sub-task */}
                  <div className="neo-card p-4">
                    {isAddingSubTask ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={newSubTask}
                          onChange={(e) => setNewSubTask(e.target.value)}
                          placeholder="Sub-task title..."
                          className="w-full p-3 border border-border rounded-lg"
                          autoFocus
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleAddSubTask}
                            className="btn-primary"
                            disabled={!newSubTask.trim()}
                          >
                            Add Sub-task
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingSubTask(false)
                              setNewSubTask('')
                            }}
                            className="btn-ghost"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsAddingSubTask(true)}
                        className="w-full text-left p-3 text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add a sub-task...</span>
                      </button>
                    )}
                  </div>

                  {/* Sub-tasks List */}
                  <div className="space-y-2">
                    {subTasks.map(subTask => (
                      <div key={subTask.id} className="neo-card p-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleSubTaskToggle(subTask.id, subTask.status !== 'completed')}
                            className={`p-1 rounded-full transition-colors ${
                              subTask.status === 'completed' 
                                ? 'text-green-600' 
                                : 'text-gray-400 hover:text-green-600'
                            }`}
                          >
                            <CheckSquare className="h-5 w-5" />
                          </button>
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              subTask.status === 'completed' 
                                ? 'line-through text-muted-foreground' 
                                : ''
                            }`}>
                              {subTask.title}
                            </h4>
                            {subTask.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {subTask.description}
                              </p>
                            )}
                            {subTask.completed_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Completed {new Date(subTask.completed_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'activity' && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="neo-card p-4">
                    <h3 className="font-semibold mb-4">Activity Timeline</h3>
                    <div className="space-y-4">
                      {activityLog.map(activity => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">Activity:</span> {activity.action}
                            </p>
                            {activity.details && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {activity.details}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'files' && (
                <motion.div
                  key="files"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div
                    className={`neo-card p-8 border-2 border-dashed transition-colors ${
                      isDragging 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="text-center">
                      <Paperclip className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Upload Files</h3>
                      <p className="text-muted-foreground mb-4">
                        Drag and drop files here, or click to browse
                      </p>
                      <button className="btn-primary">
                        Choose Files
                      </button>
                    </div>
                  </div>
                  
                  {/* Files List */}
                  {files.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-4">Attachments</h3>
                      <div className="space-y-2">
                        {files.map(file => (
                          <div key={file.id} className="neo-card p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <File className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{file.file_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(file.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <button className="p-1 hover:bg-accent rounded">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Participants */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="neo-card p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Participants</h3>
                <button className="p-1 hover:bg-accent rounded">
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {participants.map(participant => (
                  <div key={participant.id} className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                      {participant.full_name?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{participant.full_name}</p>
                      <p className="text-xs text-muted-foreground">{participant.email}</p>
                    </div>
                  </div>
                ))}
                
                {participants.length === 0 && (
                  <p className="text-sm text-muted-foreground">No participants yet</p>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="neo-card p-4"
            >
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 hover:bg-accent rounded transition-colors flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>Mark as favorite</span>
                </button>
                <button className="w-full text-left p-2 hover:bg-accent rounded transition-colors flex items-center space-x-2">
                  <Flag className="h-4 w-4" />
                  <span>Change priority</span>
                </button>
                <button className="w-full text-left p-2 hover:bg-accent rounded transition-colors flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Set due date</span>
                </button>
                <button className="w-full text-left p-2 hover:bg-accent rounded transition-colors flex items-center space-x-2">
                  <Link className="h-4 w-4" />
                  <span>Add dependency</span>
                </button>
              </div>
            </motion.div>

            {/* Dependencies */}
            {dependencies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="neo-card p-4"
              >
                <h3 className="font-semibold mb-4">Dependencies</h3>
                <div className="space-y-2">
                  {dependencies.map(dep => (
                    <div key={dep.id} className="flex items-center space-x-2">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{dep.task.title}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Shared Footer */}
      <SharedFooter />
    </div>
  )
}

// Comment Item Component
interface CommentItemProps {
  comment: ThreadedComment
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onReply: (id: string) => void
  editCommentId: string | null
  editCommentContent: string
  setEditCommentContent: (content: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}

const CommentItem = ({ 
  comment, 
  onEdit, 
  onDelete, 
  onReply, 
  editCommentId, 
  editCommentContent, 
  setEditCommentContent, 
  onSaveEdit, 
  onCancelEdit 
}: CommentItemProps) => {
  const isEditing = editCommentId === comment.id
  
  return (
    <div className="neo-card p-4">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
          {comment.user?.full_name?.[0] || comment.user?.email?.[0] || 'U'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">User</p>
              <p className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onReply(comment.id)}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <Reply className="h-3 w-3" />
              </button>
              <button
                onClick={() => onEdit(comment.id)}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <button
                onClick={() => onDelete(comment.id)}
                className="p-1 hover:bg-accent rounded transition-colors text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          {isEditing ? (
            <div className="mt-3 space-y-2">
              <textarea
                value={editCommentContent}
                onChange={(e) => setEditCommentContent(e.target.value)}
                className="w-full p-2 border border-border rounded resize-none"
                rows={3}
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={onSaveEdit}
                  className="btn-primary btn-sm"
                >
                  Save
                </button>
                <button
                  onClick={onCancelEdit}
                  className="btn-ghost btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-2">{comment.content}</p>
          )}
          
          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-4 ml-6 space-y-3">
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReply={onReply}
                  editCommentId={editCommentId}
                  editCommentContent={editCommentContent}
                  setEditCommentContent={setEditCommentContent}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}