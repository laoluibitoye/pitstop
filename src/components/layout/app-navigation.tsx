'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  LayoutDashboard,
  Globe,
  Settings,
  Menu,
  X,
  User,
  LogOut,
  Bell,
  Search
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { DashboardFooter } from './dashboard-footer'

interface AppNavigationProps {
  children?: React.ReactNode
}

export function AppNavigation({ children }: AppNavigationProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      href: '/',
      public: true
    },
    {
      id: 'public',
      label: 'Community',
      icon: Globe,
      href: '/public',
      public: false
    },
    {
      id: 'dashboard',
      label: 'My Tasks',
      icon: LayoutDashboard,
      href: '/dashboard',
      public: false
    },
    {
      id: 'settings',
      label: 'My Profile',
      icon: Settings,
      href: '/settings',
      public: false
    },
  ]

  const filteredNavItems = navigationItems.filter(item =>
    item.public || user
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              className="fixed left-0 top-0 z-50 h-full w-64 border-r border-border bg-background"
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <span className="text-lg font-semibold">PitStop</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-accent rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex-1 p-4">
                <div className="space-y-2">
                  {filteredNavItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        router.push(item.href)
                        setSidebarOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${pathname === item.href
                          ? 'bg-blue-500 text-white'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </nav>

              {/* User Section */}
              {user && (
                <div className="border-t border-border p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {(user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.user_metadata?.full_name || user.email || 'Guest User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email || 'Guest Mode'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pl-32 lg:pr-32">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-lg font-semibold">PitStop</span>
                <span className="hidden sm:inline px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  100% FREE
                </span>
              </div>

              {/* Navigation Links */}
              {user && (
                <nav className="hidden lg:flex items-center space-x-1 ml-6">
                  <button
                    onClick={() => router.push('/public')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/public'
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                  >
                    Community
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === '/dashboard'
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                  >
                    My Tasks
                  </button>
                </nav>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Search (for authenticated users) */}
              {user && (
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    className="w-64 pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Actions */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-accent rounded-lg relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <button
                    onClick={() => router.push('/settings')}
                    className="p-2 hover:bg-accent rounded-lg"
                  >
                    <User className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push('/auth/signin')}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/auth/signup')}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Dashboard Footer */}
        <DashboardFooter />
      </div>
    </div>
  )
}