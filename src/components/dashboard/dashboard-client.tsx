'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { DashboardContentWithSuspense } from './dashboard-content-with-suspense'

/**
 * Production-ready dashboard client component
 * Restored full feature set with stable client-side rendering
 */
export function DashboardClient() {
  const searchParams = useSearchParams()
  const isGuestMode = searchParams.get('mode') === 'guest'

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="loading-pulse h-8 w-32 rounded-lg"></div>
        </div>
      }>
        <DashboardContentWithSuspense />
      </Suspense>
    </div>
  )
}