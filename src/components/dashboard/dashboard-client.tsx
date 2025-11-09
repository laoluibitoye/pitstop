'use client'

import { DashboardContent } from '@/components/dashboard/dashboard-content'

export function DashboardClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-blue-50 dark:from-dark-bg dark:via-primary-900 dark:to-dark-bg">
      <DashboardContent />
    </div>
  )
}