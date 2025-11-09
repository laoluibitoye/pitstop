'use client'

import { useState } from 'react'
import { Shield, Users, BarChart3, Settings, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'

export function AdminDashboard() {
  const { access, user, checkPermission } = useAuth()
  const [activeTab, setActiveTab] = useState<'users' | 'tasks' | 'analytics' | 'settings'>('users')

  // Check if user has admin access
  if (!checkPermission('isAdmin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-900/20 dark:via-dark-bg dark:to-red-900/20 flex items-center justify-center">
        <div className="neo-card bg-white dark:bg-dark-card p-8 max-w-md w-full text-center">
          <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary-900 dark:text-dark-text mb-2">
            Access Denied
          </h1>
          <p className="text-primary-600 dark:text-primary-400 mb-4">
            You don't have permission to access the admin dashboard.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-primary-500 dark:text-primary-500">
            <AlertCircle className="h-4 w-4" />
            <span>Administrator privileges required</span>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users, permission: 'canManageUsers' as const },
    { id: 'tasks', label: 'Task Moderation', icon: Shield, permission: 'canModerateTasks' as const },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'canViewAnalytics' as const },
    { id: 'settings', label: 'Settings', icon: Settings, permission: 'canManageSettings' as const },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-blue-50 dark:from-dark-bg dark:via-primary-900 dark:to-dark-bg">
      {/* Admin Header */}
      <header className="neo-card m-4 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-purple-100">Welcome, {user?.email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              Administrator
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Admin Sidebar */}
        <aside className="w-64 p-4">
          <div className="neo-card bg-white dark:bg-dark-card p-4">
            <h2 className="font-semibold text-primary-900 dark:text-dark-text mb-4">
              Admin Panel
            </h2>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const hasPermission = checkPermission(tab.permission)
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => hasPermission ? setActiveTab(tab.id as any) : null}
                    disabled={!hasPermission}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id && hasPermission
                        ? 'bg-accent-blue-500 text-white'
                        : hasPermission
                        ? 'text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800'
                        : 'text-primary-400 dark:text-primary-600 cursor-not-allowed'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                    {!hasPermission && <Lock className="h-3 w-3 ml-auto" />}
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Admin Content */}
        <main className="flex-1 p-4">
          <AdminContent activeTab={activeTab} />
        </main>
      </div>
    </div>
  )
}

function AdminContent({ activeTab }: { activeTab: string }) {
  const content = {
    users: {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: Users,
      color: 'blue'
    },
    tasks: {
      title: 'Task Moderation',
      description: 'Review, edit, archive, and delete any task across the platform',
      icon: Shield,
      color: 'green'
    },
    analytics: {
      title: 'Analytics Dashboard',
      description: 'View platform usage statistics and user activity',
      icon: BarChart3,
      color: 'purple'
    },
    settings: {
      title: 'System Settings',
      description: 'Configure platform settings and admin preferences',
      icon: Settings,
      color: 'gray'
    }
  }

  const tabContent = content[activeTab as keyof typeof content]
  const Icon = tabContent.icon

  return (
    <div className="space-y-6">
      <div className="neo-card bg-white dark:bg-dark-card p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-${tabContent.color}-500 flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary-900 dark:text-dark-text">
              {tabContent.title}
            </h2>
            <p className="text-primary-600 dark:text-primary-400">
              {tabContent.description}
            </p>
          </div>
        </div>

        <div className="border-t border-primary-200 dark:border-primary-700 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards */}
            {getFeatureCards(activeTab)}
          </div>
        </div>
      </div>
    </div>
  )
}

function getFeatureCards(activeTab: string) {
  const features = {
    users: [
      {
        title: 'View All Users',
        description: 'See all registered users with their roles and activity status',
        action: 'View Users',
        color: 'blue'
      },
      {
        title: 'Manage Roles',
        description: 'Promote users to admin or demote admins to regular users',
        action: 'Manage Roles',
        color: 'indigo'
      },
      {
        title: 'Suspend Accounts',
        description: 'Temporarily or permanently suspend user accounts',
        action: 'Suspend Users',
        color: 'red'
      }
    ],
    tasks: [
      {
        title: 'Edit Any Task',
        description: 'Modify task details, status, and assignments across the platform',
        action: 'Edit Tasks',
        color: 'green'
      },
      {
        title: 'Archive Tasks',
        description: 'Archive completed or irrelevant tasks to keep the platform clean',
        action: 'Archive Tasks',
        color: 'yellow'
      },
      {
        title: 'Delete Tasks',
        description: 'Permanently remove inappropriate or spam tasks',
        action: 'Delete Tasks',
        color: 'red'
      }
    ],
    analytics: [
      {
        title: 'User Statistics',
        description: 'View user registration trends and activity metrics',
        action: 'View Stats',
        color: 'purple'
      },
      {
        title: 'Task Metrics',
        description: 'Analyze task completion rates and productivity trends',
        action: 'View Metrics',
        color: 'pink'
      },
      {
        title: 'Activity Logs',
        description: 'Monitor all user actions and system events',
        action: 'View Logs',
        color: 'gray'
      }
    ],
    settings: [
      {
        title: 'App Configuration',
        description: 'Customize app title, colors, and branding options',
        action: 'Configure App',
        color: 'blue'
      },
      {
        title: 'Feature Toggles',
        description: 'Enable or disable features without code deployment',
        action: 'Toggle Features',
        color: 'green'
      },
      {
        title: 'Security Settings',
        description: 'Configure password policies and security options',
        action: 'Security Settings',
        color: 'red'
      }
    ]
  }

  return features[activeTab as keyof typeof features]?.map((feature, index) => (
    <div key={index} className="neo-card p-4 hover:shadow-lg transition-shadow">
      <div className={`w-8 h-8 rounded-lg bg-${feature.color}-500 flex items-center justify-center mb-3`}>
        <div className="w-3 h-3 bg-white rounded"></div>
      </div>
      <h3 className="font-semibold text-primary-900 dark:text-dark-text mb-2">
        {feature.title}
      </h3>
      <p className="text-sm text-primary-600 dark:text-primary-400 mb-3">
        {feature.description}
      </p>
      <button className={`w-full py-2 px-4 bg-${feature.color}-500 hover:bg-${feature.color}-600 text-white text-sm font-medium rounded-lg transition-colors`}>
        {feature.action}
      </button>
    </div>
  )) || []
}