'use client'

// Vercel Analytics tracking functions
export const trackEvent = (eventName: string, eventProps?: Record<string, any>) => {
  // Track custom events for Vercel Analytics
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('track', eventName, eventProps)
  }
}

// Task-related event tracking
export const taskAnalytics = {
  // Task creation events
  taskCreated: (taskType: 'regular' | 'guest' | 'sub-task', priority: string, hasDeadline: boolean) => {
    trackEvent('task_created', {
      task_type: taskType,
      priority: priority,
      has_deadline: hasDeadline,
      timestamp: new Date().toISOString()
    })
  },

  // Task status changes
  taskStatusChanged: (taskId: string, oldStatus: string, newStatus: string, taskType: 'regular' | 'guest') => {
    trackEvent('task_status_changed', {
      task_id: taskId,
      old_status: oldStatus,
      new_status: newStatus,
      task_type: taskType,
      timestamp: new Date().toISOString()
    })
  },

  // Task completion events
  taskCompleted: (taskId: string, timeSpent?: number, subTasksCount?: number) => {
    trackEvent('task_completed', {
      task_id: taskId,
      time_spent_minutes: timeSpent,
      subtasks_count: subTasksCount,
      timestamp: new Date().toISOString()
    })
  },

  // Task assignment events
  taskAssigned: (taskId: string, assigneeId: string, assignerRole: string) => {
    trackEvent('task_assigned', {
      task_id: taskId,
      assignee_id: assigneeId,
      assigner_role: assignerRole,
      timestamp: new Date().toISOString()
    })
  }
}

// User engagement events
export const userAnalytics = {
  // User authentication
  userSignedUp: (method: 'email' | 'google' | 'github', userType: 'regular' | 'admin') => {
    trackEvent('user_signed_up', {
      signup_method: method,
      user_type: userType,
      timestamp: new Date().toISOString()
    })
  },

  userSignedIn: (method: 'email' | 'google' | 'github', userType: 'regular' | 'admin') => {
    trackEvent('user_signed_in', {
      signin_method: method,
      user_type: userType,
      timestamp: new Date().toISOString()
    })
  },

  // Guest mode usage
  guestModeStarted: (sessionId: string, source: 'landing_page' | 'dashboard') => {
    trackEvent('guest_mode_started', {
      session_id: sessionId,
      source: source,
      timestamp: new Date().toISOString()
    })
  },

  guestModeExpired: (sessionId: string, tasksCreated: number, commentsMade: number) => {
    trackEvent('guest_mode_expired', {
      session_id: sessionId,
      tasks_created: tasksCreated,
      comments_made: commentsMade,
      timestamp: new Date().toISOString()
    })
  }
}

// Feature usage events
export const featureAnalytics = {
  // Dashboard features
  dashboardViewed: (viewType: 'main' | 'admin', userType: 'regular' | 'admin') => {
    trackEvent('dashboard_viewed', {
      view_type: viewType,
      user_type: userType,
      timestamp: new Date().toISOString()
    })
  },

  // Filter usage
  filterUsed: (filterType: 'status' | 'priority' | 'assignee' | 'category', value: string) => {
    trackEvent('filter_used', {
      filter_type: filterType,
      filter_value: value,
      timestamp: new Date().toISOString()
    })
  },

  // Search functionality
  searchUsed: (query: string, resultsCount: number, userType: 'regular' | 'guest') => {
    trackEvent('search_performed', {
      search_query: query,
      results_count: resultsCount,
      user_type: userType,
      timestamp: new Date().toISOString()
    })
  },

  // Comment system
  commentAdded: (taskId: string, commentLength: number, userType: 'regular' | 'guest') => {
    trackEvent('comment_added', {
      task_id: taskId,
      comment_length: commentLength,
      user_type: userType,
      timestamp: new Date().toISOString()
    })
  },

  // Sub-tasks usage
  subTaskCreated: (parentTaskId: string, subTaskCount: number) => {
    trackEvent('subtask_created', {
      parent_task_id: parentTaskId,
      subtask_count: subTaskCount,
      timestamp: new Date().toISOString()
    })
  },

  subTaskCompleted: (parentTaskId: string, subTaskId: string, progressUpdated: boolean) => {
    trackEvent('subtask_completed', {
      parent_task_id: parentTaskId,
      subtask_id: subTaskId,
      progress_updated: progressUpdated,
      timestamp: new Date().toISOString()
    })
  },

  // Time extension usage
  timeExtensionRequested: (taskId: string, extensionType: 'hours' | 'days', reason: string) => {
    trackEvent('time_extension_requested', {
      task_id: taskId,
      extension_type: extensionType,
      reason_category: reason,
      timestamp: new Date().toISOString()
    })
  },

  timeExtensionApproved: (taskId: string, extensionType: 'hours' | 'days', daysExtended: number) => {
    trackEvent('time_extension_approved', {
      task_id: taskId,
      extension_type: extensionType,
      days_extended: daysExtended,
      timestamp: new Date().toISOString()
    })
  }
}

// Performance tracking
export const performanceAnalytics = {
  // Page load times
  pageLoadTime: (page: string, loadTime: number, connectionType: string) => {
    trackEvent('page_load_time', {
      page: page,
      load_time_ms: loadTime,
      connection_type: connectionType,
      timestamp: new Date().toISOString()
    })
  },

  // User session metrics
  sessionDuration: (duration: number, actionsPerformed: number, userType: 'regular' | 'guest') => {
    trackEvent('session_duration', {
      duration_minutes: duration,
      actions_performed: actionsPerformed,
      user_type: userType,
      timestamp: new Date().toISOString()
    })
  }
}

// Admin-specific analytics
export const adminAnalytics = {
  // Admin dashboard access
  adminDashboardViewed: (userId: string, adminRole: string) => {
    trackEvent('admin_dashboard_viewed', {
      admin_id: userId,
      admin_role: adminRole,
      timestamp: new Date().toISOString()
    })
  },

  // User management actions
  userAction: (action: 'suspend' | 'activate' | 'role_change' | 'delete', targetUserId: string, adminId: string) => {
    trackEvent('user_management_action', {
      action: action,
      target_user_id: targetUserId,
      admin_id: adminId,
      timestamp: new Date().toISOString()
    })
  },

  // Task moderation
  taskModeration: (action: 'edit' | 'archive' | 'delete', taskId: string, adminId: string, reason?: string) => {
    trackEvent('task_moderation', {
      action: action,
      task_id: taskId,
      admin_id: adminId,
      reason: reason,
      timestamp: new Date().toISOString()
    })
  },

  // System settings changes
  settingsChanged: (settingType: string, newValue: string, adminId: string) => {
    trackEvent('settings_changed', {
      setting_type: settingType,
      new_value: newValue,
      admin_id: adminId,
      timestamp: new Date().toISOString()
    })
  }
}

// Error tracking
export const errorAnalytics = {
  // JavaScript errors
  jsError: (error: string, page: string, userAgent: string, userType: 'regular' | 'guest') => {
    trackEvent('javascript_error', {
      error_message: error,
      page: page,
      user_agent: userAgent,
      user_type: userType,
      timestamp: new Date().toISOString()
    })
  },

  // API errors
  apiError: (endpoint: string, errorCode: number, errorMessage: string, userId?: string) => {
    trackEvent('api_error', {
      endpoint: endpoint,
      error_code: errorCode,
      error_message: errorMessage,
      user_id: userId,
      timestamp: new Date().toISOString()
    })
  }
}

// Simple event tracking for basic usage
export const simpleTrack = (eventName: string, properties?: Record<string, any>) => {
  trackEvent(eventName, properties)
}