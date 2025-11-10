'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Simple, working dashboard client
 * Renders immediately without complex state that can cause loading issues
 */
export function DashboardClient() {
  const searchParams = useSearchParams()
  const isGuestMode = searchParams.get('mode') === 'guest'

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <div className="loading-pulse h-8 w-32 rounded-lg"></div>
            </div>
          }>
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Dashboard
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {isGuestMode ? 'Guest Mode - Limited Access' : 'Welcome to your dashboard'}
                    </p>
                  </div>
                  <button className="btn-primary">
                    Create New Task
                  </button>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                        All Tasks
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                        In Progress
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                        Completed
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Tasks</h3>
                    <div className="space-y-3">
                      <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Welcome to PitStop</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Your task management dashboard is ready!</p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                            New
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Get Started</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Create your first task to begin</p>
                          </div>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                            Onboarding
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  )
}