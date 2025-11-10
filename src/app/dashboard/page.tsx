import { Suspense } from 'react'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-blue-50 dark:from-dark-bg dark:via-primary-900 dark:to-dark-bg">
        <div className="loading-pulse h-8 w-32 rounded"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}