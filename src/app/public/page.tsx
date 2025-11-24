import { AppNavigation } from '@/components/layout/app-navigation'
import { EnhancedPublicDashboard } from '@/components/dashboard/enhanced-public-dashboard'

export const metadata = {
  title: 'Community Dashboard - PitStop',
  description: 'Discover public tasks from the PitStop community.',
}

export default function PublicPage() {
  return (
    <AppNavigation>
      <div className="px-4 sm:px-6 lg:px-8 lg:pr-8 py-8">
        <EnhancedPublicDashboard />
      </div>
    </AppNavigation>
  )
}