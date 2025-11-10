'use client'

import React, { Suspense } from 'react'
import { DashboardClient } from './dashboard-client'

/**
 * Main wrapper for the dashboard with proper error handling
 * and client-side rendering to avoid hydration issues
 */
export function DashboardWrapper() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="loading-pulse h-8 w-32 rounded-lg"></div>
        </div>
      }>
        <DashboardClient />
      </Suspense>
    </ErrorBoundary>
  )
}

/**
 * Error Boundary Component
 * Catches React errors and provides fallback UI
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean, error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full p-6 bg-card rounded-lg border border-border">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}