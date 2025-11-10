'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Menu,
  X,
  Search,
  Grid,
  List,
  Moon,
  Sun,
  User,
  LogOut,
  Home,
  Settings,
  Bell
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useTheme } from 'next-themes'

interface SharedHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  showSearch?: boolean
  showViewToggle?: boolean
  onViewModeChange?: (mode: 'grid' | 'list') => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  viewMode?: 'grid' | 'list'
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export function SharedHeader({
  title,
  subtitle,
  showBackButton = false,
  showSearch = false,
  showViewToggle = false,
  onViewModeChange,
  searchQuery = '',
  onSearchChange,
  viewMode = 'list',
  breadcrumbs = []
}: SharedHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isGuestMode = searchParams?.get('mode') === 'guest'
  const guestName = typeof window !== 'undefined' ? localStorage.getItem('guest_name') : null

  const handleLogout = async () => {
    if (isGuestMode) {
      localStorage.removeItem('guest_session')
      localStorage.removeItem('guest_name')
      router.push('/')
    } else {
      await signOut()
      router.push('/')
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleGoHome = () => {
    if (isGuestMode) {
      localStorage.removeItem('guest_session')
    }
    router.push('/')
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-accent rounded-lg lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2">
              {/* Search */}
              {showSearch && (
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="input h-9 w-64 pl-9"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange?.('')}
                      className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}

              {/* View Toggle */}
              {showViewToggle && (
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => onViewModeChange?.('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onViewModeChange?.('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-accent rounded-lg"
                title="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                {isGuestMode ? (
                  <button
                    onClick={() => router.push('/auth/signin')}
                    className="btn-primary"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </button>
                ) : user ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="btn-ghost"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => router.push('/auth/signin')}
                    className="btn-ghost"
                  >
                    <User className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              className="fixed left-0 top-0 z-50 h-full w-64 border-r border-border bg-card"
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-6">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">P</span>
                    </div>
                    <span className="text-lg font-semibold">PitStop</span>
                  </div>
                  <div className="ml-10 mt-1">
                    <p className="text-sm text-muted-foreground">
                      {isGuestMode ? `Welcome, ${guestName}!` : title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-accent rounded-lg lg:hidden"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="p-4 space-y-2">
                <button onClick={handleGoHome} className="nav-link w-full justify-start">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </button>
                <button onClick={() => router.push('/dashboard')} className="nav-link w-full justify-start">
                  <Grid className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
                <button className="nav-link w-full justify-start">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}