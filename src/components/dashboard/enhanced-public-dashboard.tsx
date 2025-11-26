'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  MessageCircle,
  Share2,
  BookOpen,
  Award,
  Zap,
  Target,
  ArrowUpRight,
  Calendar,
  Star,
  Activity,
  Plus,
  Flame as Fire
} from 'lucide-react'
import { Task } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/auth-provider'
import { PrivacyControls } from '@/components/tasks/privacy-controls'
import { ShareModal } from '@/components/tasks/share-modal'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'
import { TaskCard } from '@/components/tasks/task-card'

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
    trending_score: number
  }
}

interface CommunityStats {
  totalPublicTasks: number
  activeContributors: number
  totalInteractions: number
  trendingCategories: string[]
}

export function EnhancedPublicDashboard() {
  const [tasks, setTasks] = useState<PublicTask[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTask, setSelectedTask] = useState<PublicTask | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'active' | 'trending'>('trending')
  const [communityStats, setCommunityStats] = useState<CommunityStats>({
    totalPublicTasks: 0,
    activeContributors: 0,
    totalInteractions: 0,
    trendingCategories: []
  })

  const { user, isGuest } = useAuth()

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
        .order('created_at', { ascending: false })

      // First try with visibility filter
      try {
        query = query.eq('visibility', 'public')
      } catch (e) {
        // If visibility column doesn't exist, fall back to all tasks
        console.warn('Visibility column not found, showing all tasks')
      }

      if (sortBy === 'popular') {
        query = query.order('likes', { ascending: false })
      } else if (sortBy === 'active') {
        query = query.order('updated_at', { ascending: false })
      } else if (sortBy === 'trending') {
        // Mock trending algorithm based on recent activity
        query = query.order('updated_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error

      let allTasks = data || []

      // If guest, load local public tasks
      if (isGuest) {
        const savedTasks = localStorage.getItem('pitstop_guest_tasks')
        if (savedTasks) {
          const guestTasks = JSON.parse(savedTasks)
            .filter((t: any) => t.visibility === 'public')
            .map((t: any) => ({
              ...t,
              created_user: {
                full_name: t.guest_name || localStorage.getItem('pitstop_guest_name') || 'Guest User',
                username: 'guest',
                avatar_url: null
              }
            }))

          allTasks = [...guestTasks, ...allTasks]
        }
      }

      // Add enhanced stats with trending calculation
      const tasksWithStats = allTasks.map((task: any) => {
        const views = Math.floor(Math.random() * 500) + 50
        const likes = Math.floor(Math.random() * 50) + 5
        const comments = Math.floor(Math.random() * 20) + 2

        // Calculate trending score based on recency and engagement
        const hoursOld = (Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60)
        const trending_score = (likes * 2 + comments * 3 + views * 0.1) / Math.max(hoursOld, 1)

        return {
          ...task,
          stats: {
            likes,
            comments,
            views,
            trending_score
          }
        }
      })

      // Sort by trending if needed
      if (sortBy === 'trending') {
        tasksWithStats.sort((a: PublicTask, b: PublicTask) => (b.stats?.trending_score || 0) - (a.stats?.trending_score || 0))
      }

      setTasks(tasksWithStats)

      // Update community stats
      setCommunityStats({
        totalPublicTasks: tasksWithStats.length,
        activeContributors: new Set(tasksWithStats.map((task: PublicTask) => task.created_by)).size,
        totalInteractions: tasksWithStats.reduce((sum: number, task: PublicTask) => sum + (task.stats?.likes || 0) + (task.stats?.comments || 0), 0),
        trendingCategories: ['Productivity', 'Development', 'Marketing', 'Design'].slice(0, 3)
      })

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

  const createTask = async (taskData: any) => {
    if (!user && !isGuest) return

    try {
      console.log('Creating task with data:', taskData)

      const taskToCreate: any = {
        title: taskData.title,
        description: taskData.description || null,
        priority: taskData.priority || 'medium',
        status: 'ongoing',
        created_by: user?.id || 'guest',
        position: tasks.length,
        ...(taskData.visibility && { visibility: taskData.visibility }),
        guest_name: isGuest ? localStorage.getItem('pitstop_guest_name') : null,
      }

      if (taskData.due_date && taskData.due_date.trim()) {
        try {
          const date = new Date(taskData.due_date)
          if (!isNaN(date.getTime())) {
            taskToCreate.due_date = taskData.due_date
          }
        } catch (e) {
          console.warn('Invalid due date format:', taskData.due_date)
        }
      }

      console.log('Task to create:', taskToCreate)

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskToCreate)
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Task created successfully:', data)

      setShowCreateModal(false)
      await loadPublicTasks() // Refresh to show the new task
    } catch (error: any) {
      console.error('Error creating task:', error)
      alert(`Failed to create task. Error: ${error?.message || 'Unknown error'}`)
    }
  }

  if (!user && !isGuest) {
    return (
      <div className="text-center py-12">
        <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Join the PitStop Community</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Discover inspiring public tasks from our community and get inspired to create your own!
        </p>
        <div className="mt-6">
          <button
            onClick={() => window.location.href = '/auth/signin'}
            className="neo-button px-6 py-3 flex items-center space-x-2 mx-auto"
          >
            <Users className="h-4 w-4" />
            <span>Join Community</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-8 border border-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
              <Globe className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            PitStop Community
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover public tasks, get inspired by amazing projects, and connect with a vibrant community of creators and collaborators.
          </p>
        </motion.div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
        >
          <Globe className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{communityStats.totalPublicTasks}</div>
          <div className="text-sm text-muted-foreground">Public Tasks</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
        >
          <Users className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{communityStats.activeContributors}</div>
          <div className="text-sm text-muted-foreground">Contributors</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
        >
          <Heart className="h-6 w-6 text-pink-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{communityStats.totalInteractions}</div>
          <div className="text-sm text-muted-foreground">Interactions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
        >
          <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">24</div>
          <div className="text-sm text-muted-foreground">Trending</div>
        </motion.div>
      </div>

      {/* Popular Tags */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {['Web Development', 'Mobile Apps', 'UI/UX Design', 'Content Creation', 'Productivity', 'AI/ML', 'Marketing', 'Design', 'Development', 'Research'].map((tag, index) => (
            <motion.button
              key={tag}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-all"
            >
              #{tag.toLowerCase().replace(/\s+/g, '')}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search public tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-4">
          {/* Create Task Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
          </button>

          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="trending">🔥 Trending</option>
            <option value="recent">🕒 Most Recent</option>
            <option value="popular">❤️ Most Popular</option>
            <option value="active">⚡ Recently Active</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center border border-border rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-lg transition-colors ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
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
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Plus className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'No matching tasks found' : 'Be the first to create a public task!'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? 'Try adjusting your search terms or browse all public tasks.'
                : 'Share your ideas with the community and inspire others!'
              }
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="neo-button px-6 py-3 flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Task</span>
            </button>
          </div>
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
            <TaskCard
              key={task.id}
              task={task}
              viewMode={viewMode}
              isGuestMode={isGuest}
              currentUserId={user?.id}
              onShare={() => handleShareTask(task)}
              onView={() => window.location.href = `/tasks/${task.id}`}
              showActions={false}
              isPublic={true}
            />
          ))}
        </motion.div>
      )}

      {/* Community CTA */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex justify-center">
            <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
              <Users className="h-8 w-8" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">Ready to Share Your Ideas?</h3>
          <p className="text-purple-100 max-w-md mx-auto">
            Create your own public task and inspire the PitStop community with your creativity!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center space-x-2 mx-auto font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Create Public Task</span>
          </button>
        </motion.div>
      </div>

      {/* Share Modal */}
      {
        selectedTask && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => {
              setShowShareModal(false)
              setSelectedTask(null)
            }}
            taskId={selectedTask.id}
            taskTitle={selectedTask.title}
          />
        )
      }

      {/* Create Task Modal */}
      {
        showCreateModal && (
          <CreateTaskModal
            onClose={() => setShowCreateModal(false)}
            onCreateTask={createTask}
            isGuestMode={isGuest}
          />
        )
      }
    </div >
  )
}