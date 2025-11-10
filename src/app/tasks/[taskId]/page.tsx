'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { TaskDetailPage } from '@/components/tasks/task-detail-page'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface TaskPageProps {
  params: {
    taskId: string
  }
}

export default function TaskDetailPageWrapper({ params }: TaskPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingSpinner />}>
        <TaskDetailPage />
      </Suspense>
    </div>
  )
}