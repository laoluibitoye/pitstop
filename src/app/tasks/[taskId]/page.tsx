'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { TaskDetailPage } from '@/components/tasks/task-detail-page'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AppNavigation } from '@/components/layout/app-navigation'

interface TaskPageProps {
  params: {
    taskId: string
  }
}

export default function TaskDetailPageWrapper({ params }: TaskPageProps) {
  return (
    <AppNavigation>
      <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 lg:pr-8 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <TaskDetailPage />
        </Suspense>
      </div>
    </AppNavigation>
  )
}