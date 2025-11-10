'use client'

import { DashboardClient } from './dashboard-client'

/**
 * Simplified layout component that delegates to the stable DashboardClient
 */
export function DashboardLayout() {
  return <DashboardClient />
}