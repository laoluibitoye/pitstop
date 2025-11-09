// TypeScript types for PitStop application

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'ongoing' | 'completed' | 'delayed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category_id?: string
  assigned_to?: string
  created_by: string
  due_date?: string
  completed_at?: string
  position: number
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  assigned_user?: Profile
  created_user?: Profile
  tags?: Tag[]
  comments?: TaskComment[]
  files?: TaskFile[]
  progress?: number // Calculated field for sub-tasks
}

export interface TaskComment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  // Relations
  user?: Profile
}

export interface TaskFile {
  id: string
  task_id: string
  user_id: string
  file_name: string
  file_path: string
  file_size?: number
  file_type?: string
  created_at: string
  // Relations
  user?: Profile
}

export interface ActivityLog {
  id: string
  user_id: string
  task_id?: string
  action: string
  details?: string
  created_at: string
  // Relations
  user?: Profile
  task?: Task
}

export interface GuestSession {
  id: string
  session_id: string
  email?: string
  tasks_created: number
  comments_created: number
  expires_at: string
  created_at: string
}

// Dashboard types
export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  ongoingTasks: number
  overdueTasks: number
  recentActivity: ActivityLog[]
  tasksByPriority: Record<string, number>
  tasksByStatus: Record<string, number>
}

export interface TaskFilters {
  status?: Task['status'][]
  priority?: Task['priority'][]
  category_id?: string
  assigned_to?: string
  due_date_from?: string
  due_date_to?: string
  search?: string
}

export interface TaskSort {
  field: keyof Task
  direction: 'asc' | 'desc'
}

export interface CreateTaskData {
  title: string
  description?: string
  priority?: Task['priority']
  category_id?: string
  assigned_to?: string
  due_date?: string
  tags?: string[] // Tag IDs
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: Task['status']
  priority?: Task['priority']
  category_id?: string
  assigned_to?: string
  due_date?: string
  position?: number
  tags?: string[] // Tag IDs
}

export interface CreateCommentData {
  task_id: string
  content: string
}

export interface CreateCategoryData {
  name: string
  color: string
}

export interface CreateTagData {
  name: string
  color: string
}

export interface CreateGuestSessionData {
  email?: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}

// Form validation types
export interface FormErrors {
  [key: string]: string
}

export interface ValidationResult {
  isValid: boolean
  errors: FormErrors
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  created_at: string
}