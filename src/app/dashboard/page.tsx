'use client'

import { useSearchParams } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default function Dashboard() {
  const searchParams = useSearchParams()
  const isGuestMode = searchParams.get('mode') === 'guest'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-blue-50 dark:from-dark-bg dark:via-primary-900 dark:to-dark-bg">
      <DashboardContent />
    </div>
  )
}