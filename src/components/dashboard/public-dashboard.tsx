'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, 
  Users, 
  Clock, 
  TrendingUp, 
  Filter,
  Search,
  Grid,
  List,
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react'
import { Task } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/auth-provider'
import { PrivacyControls } from '@/components/tasks/privacy-controls'
import { ShareModal } from '@/components/tasks/share-modal'

interface PublicTask extends Omit<Task, 'created_user'> {
  created_user: {
    full_name?: string
    username?: string
    avatar_url?: string
  } | null
  stats?: {
    likes: number
    comments: number
    views: number
  }
}

export function PublicDashboard() {
  const [tasks, setTasks] = useState<PublicTask[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTask, setSelectedTask] = useState<PublicTask | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'active'>('recent')

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadPublicTasks()
    }
  }, [user, sortBy])

  const loadPublicTasks = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          created_user:profiles!tasks_created_by_fkey(
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('visibility', 'public')
        .neq('created_by', user?.id || '') // Exclude own tasks from public view
        .order('created_at', { ascending: false })

      if (sortBy === 'popular') {
        query = query.order('likes', { ascending: false })
      } else if (sortBy === 'active') {
        query = query.order('updated_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error

      // Add mock stats for now
      const tasksWithStats = (data || []).map((task: any) => ({
        ...task,
        stats: {
          likes: Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 20),
          views: Math.floor(Math.random() * 200)
        }
      }))

      setTasks(tasksWithStats)
    } catch (error) {
      console.error('Error loading public tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleShareTask = (task: PublicTask) => {
    setSelectedTask(task)
    setShowShareModal(true)
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Sign In Required</h2>
        <p className="text-muted-foreground">
          Please sign in to view the community dashboard and discover public tasks.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Community Dashboard
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover public tasks from the PitStop community. Get inspired, collaborate, and see what others are working on.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-6 text-center"
        >
          <Globe className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{filteredTasks.length}</div>
          <div className="text-sm text-muted-foreground">Public Tasks</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-6 text-center"
        >
          <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">
            {new Set(tasks.map(task => task.created_by)).size}
          </div>
          <div className="text-sm text-muted-foreground">Active Users</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-6 text-center"
        >
          <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">
            {tasks.reduce((sum, task) => sum + (task.stats?.views || 0), 0)}
          </div>
          <div className="text-sm text-muted-foreground">Total Views</div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search public tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'active')}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="active">Recently Active</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center border border-border rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Task Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-3"></div>
                <div className="h-3 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                <div className="flex space-x-2">
                  <div className="h-6 w-16 bg-muted rounded"></div>
                  <div className="h-6 w-16 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No public tasks yet</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'No tasks match your search' : 'Be the first to create a public task!'}
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }
        >
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'flex items-center space-x-6' : ''
              }`}
            >
              <div className={viewMode === 'list' ? 'flex-1' : ''}>
                {/* Task Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{task.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>by</span>
                      <span className="font-medium text-foreground">
                        {task.created_user?.full_name || task.created_user?.username || 'Anonymous'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      task.status === 'ongoing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                      task.status === 'delayed' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {task.status}
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                      task.priority === 'medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {task.priority}
                    </div>
                  </div>
                </div>

                {/* Task Description */}
                {task.description && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Task Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{task.stats?.views || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{task.stats?.likes || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{task.stats?.comments || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(task.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex items-center space-x-2 ${viewMode === 'list' ? '' : 'mt-4'}`}>
                <button
                  onClick={() => handleShareTask(task)}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Share
                </button>
                <button className="px-3 py-1.5 border border-border rounded text-sm hover:bg-accent transition-colors">
                  View
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

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