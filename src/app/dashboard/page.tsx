import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper'

// Force dynamic rendering to prevent SSG issues with localStorage
export const dynamic = 'force-dynamic'

export default function Dashboard() {
  return <DashboardWrapper />
}