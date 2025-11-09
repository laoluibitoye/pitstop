'use client'

import { Suspense } from 'react'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-pulse h-8 w-32 rounded"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}