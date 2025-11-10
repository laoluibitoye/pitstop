import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.taskId as string

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <span className="mr-2">←</span>
              Back
            </button>
          </div>
          
          <div className="card p-8">
            <h1 className="text-2xl font-bold mb-4">Task Details</h1>
            <p className="text-muted-foreground">
              Task ID: {taskId}
            </p>
            <p className="text-muted-foreground mt-2">
              This is a placeholder for the task detail page component.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}