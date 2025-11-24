import { AppNavigation } from '@/components/layout/app-navigation'
import { PersonalDashboard } from '@/components/dashboard/personal-dashboard'

export const metadata = {
  title: 'My Dashboard - PitStop',
  description: 'Manage your personal tasks and collaborate with others.',
}

export default function DashboardPage() {
  return (
    <AppNavigation>
      <div className="px-4 sm:px-6 lg:px-8 lg:pr-8 py-8">
        <PersonalDashboard />
      </div>
    </AppNavigation>
  )
}