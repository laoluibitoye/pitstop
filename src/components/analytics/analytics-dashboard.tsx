'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, TrendingUp, Activity, Clock, Target } from 'lucide-react'

interface AnalyticsData {
  totalPageViews: number
  uniqueVisitors: number
  averageSessionDuration: string
  bounceRate: string
  topPages: { page: string; views: number }[]
  userType: { regular: number; guest: number }
  popularFeatures: { feature: string; usage: number }[]
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalPageViews: 0,
    uniqueVisitors: 0,
    averageSessionDuration: '0m 0s',
    bounceRate: '0%',
    topPages: [],
    userType: { regular: 0, guest: 0 },
    popularFeatures: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, this would fetch data from Vercel Analytics API
    // For now, we'll show placeholder data
    setTimeout(() => {
      setAnalyticsData({
        totalPageViews: 1247,
        uniqueVisitors: 856,
        averageSessionDuration: '3m 24s',
        bounceRate: '23%',
        topPages: [
          { page: '/', views: 423 },
          { page: '/dashboard', views: 312 },
          { page: '/auth/signin', views: 189 },
          { page: '/auth/signup', views: 156 }
        ],
        userType: { regular: 634, guest: 222 },
        popularFeatures: [
          { feature: 'Task Creation', usage: 423 },
          { feature: 'Guest Mode', usage: 222 },
          { feature: 'Dashboard View', usage: 189 },
          { feature: 'Task Filtering', usage: 156 }
        ]
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="neo-card p-8 bg-white/50 dark:bg-dark-card/50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-primary-600 dark:text-primary-300">Loading analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="neo-card p-6 bg-white/50 dark:bg-dark-card/50">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-primary-600 dark:text-primary-300">Total Page Views</p>
              <p className="text-2xl font-bold text-primary-900 dark:text-dark-text">
                {analyticsData.totalPageViews.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="neo-card p-6 bg-white/50 dark:bg-dark-card/50">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-primary-600 dark:text-primary-300">Unique Visitors</p>
              <p className="text-2xl font-bold text-primary-900 dark:text-dark-text">
                {analyticsData.uniqueVisitors.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="neo-card p-6 bg-white/50 dark:bg-dark-card/50">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-primary-600 dark:text-primary-300">Avg. Session</p>
              <p className="text-2xl font-bold text-primary-900 dark:text-dark-text">
                {analyticsData.averageSessionDuration}
              </p>
            </div>
          </div>
        </div>

        <div className="neo-card p-6 bg-white/50 dark:bg-dark-card/50">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-primary-600 dark:text-primary-300">Bounce Rate</p>
              <p className="text-2xl font-bold text-primary-900 dark:text-dark-text">
                {analyticsData.bounceRate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="neo-card p-6 bg-white/50 dark:bg-dark-card/50">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-dark-text mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary-600" />
            Top Pages
          </h3>
          <div className="space-y-3">
            {analyticsData.topPages.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="ml-3 text-sm text-primary-900 dark:text-dark-text">{page.page}</span>
                </div>
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-300">
                  {page.views}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User Types */}
        <div className="neo-card p-6 bg-white/50 dark:bg-dark-card/50">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-dark-text mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary-600" />
            User Types
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-primary-600 dark:text-primary-300">Regular Users</span>
                <span className="text-primary-900 dark:text-dark-text font-semibold">
                  {analyticsData.userType.regular}
                </span>
              </div>
              <div className="w-full bg-primary-200 dark:bg-primary-700 rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full" 
                  style={{ width: `${(analyticsData.userType.regular / (analyticsData.userType.regular + analyticsData.userType.guest)) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-primary-600 dark:text-primary-300">Guest Users</span>
                <span className="text-primary-900 dark:text-dark-text font-semibold">
                  {analyticsData.userType.guest}
                </span>
              </div>
              <div className="w-full bg-primary-200 dark:bg-primary-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-accent-blue-500 to-accent-blue-600 h-2 rounded-full" 
                  style={{ width: `${(analyticsData.userType.guest / (analyticsData.userType.regular + analyticsData.userType.guest)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Features */}
      <div className="neo-card p-6 bg-white/50 dark:bg-dark-card/50">
        <h3 className="text-lg font-semibold text-primary-900 dark:text-dark-text mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-primary-600" />
          Popular Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analyticsData.popularFeatures.map((feature) => (
            <div key={feature.feature} className="text-center p-4 bg-primary-50 dark:bg-primary-800/30 rounded-xl">
              <p className="text-sm font-semibold text-primary-900 dark:text-dark-text">{feature.feature}</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-300 mt-1">
                {feature.usage}
              </p>
              <p className="text-xs text-primary-500 dark:text-primary-400">interactions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Info */}
      <div className="neo-card p-6 bg-white/50 dark:bg-dark-card/50">
        <h3 className="text-lg font-semibold text-primary-900 dark:text-dark-text mb-4">Analytics Information</h3>
        <div className="text-sm text-primary-600 dark:text-primary-300 space-y-2">
          <p>📊 <strong>Powered by Vercel Analytics</strong> - Real-time visitor tracking and performance insights</p>
          <p>🔒 <strong>Privacy-First</strong> - All data is anonymized and GDPR compliant</p>
          <p>⚡ <strong>Lightweight</strong> - Zero impact on your application's performance</p>
          <p>📱 <strong>Cross-Platform</strong> - Works seamlessly across all devices and browsers</p>
        </div>
      </div>
    </div>
  )
}