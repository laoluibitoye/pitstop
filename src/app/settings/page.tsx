'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  LogOut,
  Edit,
  Save,
  X,
  Mail,
  Calendar,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy'>('profile')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: ''
  })

  const { user, signOut, isGuest } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    loadProfile()
  }, [user, router])

  const loadProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
      } else if (data) {
        setProfile(data)
        setEditForm({
          full_name: data.full_name || '',
          username: data.username || ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!user || !profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name.trim() || null,
          username: editForm.username.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile(prev => prev ? {
        ...prev,
        full_name: editForm.full_name.trim() || undefined,
        username: editForm.username.trim() || undefined,
        updated_at: new Date().toISOString()
      } : null)

      setIsEditing(false)
    } catch (error: any) {
      console.error('Error saving profile:', error)
      alert(`Failed to save profile: ${error?.message || 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ]

  if (!user && !isGuest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to access your settings.</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="neo-button px-6 py-3"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-1 rounded-md hover:bg-accent flex items-center"
              title="Back to Dashboard"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your account preferences</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="neo-card p-6"
              >
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
                      <button
                        onClick={() => {
                          if (isEditing) {
                            saveProfile()
                          } else {
                            setIsEditing(true)
                          }
                        }}
                        disabled={saving}
                        className="neo-button px-4 py-2 flex items-center space-x-2"
                      >
                        {isEditing ? (
                          <>
                            <Save className="h-4 w-4" />
                            <span>{saving ? 'Saving...' : 'Save'}</span>
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Profile Avatar */}
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {(editForm.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {profile?.full_name || 'No name set'}
                        </h3>
                        <p className="text-muted-foreground">{user?.email || 'Guest User'}</p>
                        <p className="text-sm text-muted-foreground">
                          Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}
                        </p>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Mail className="h-4 w-4 inline mr-2" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="neo-input w-full opacity-60 cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Email cannot be changed. Contact support if needed.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                          disabled={!isEditing}
                          className={`neo-input w-full ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={editForm.username}
                          onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                          disabled={!isEditing}
                          className={`neo-input w-full ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                          placeholder="Enter your username"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Username is optional and helps others identify you.
                        </p>
                      </div>
                    </div>

                    {/* Account Status */}
                    {isGuest ? (
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-5 w-5 text-amber-600" />
                          <span className="text-amber-800 dark:text-amber-200 font-medium">
                            Guest Account
                          </span>
                        </div>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                          You are currently using a temporary guest account. Your data will be deleted in 24 hours.
                        </p>
                        <button
                          onClick={() => router.push('/auth/signup')}
                          className="mt-3 text-sm font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline"
                        >
                          Create an account to save your data
                        </button>
                      </div>
                    ) : (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-green-800 dark:text-green-200 font-medium">
                            Account Active
                          </span>
                        </div>
                        <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                          Your account is fully active with all features enabled.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-foreground">Notification Preferences</h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground">Task Updates</h3>
                          <p className="text-sm text-muted-foreground">Get notified when tasks you're involved with are updated</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground">New Comments</h3>
                          <p className="text-sm text-muted-foreground">Get notified when someone comments on your tasks</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground">Community Activity</h3>
                          <p className="text-sm text-muted-foreground">Get notified about trending tasks and community updates</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-foreground">Privacy Settings</h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground">Profile Visibility</h3>
                          <p className="text-sm text-muted-foreground">Allow others to see your profile information</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground">Task Discovery</h3>
                          <p className="text-sm text-muted-foreground">Allow your public tasks to appear in community discovery</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground">Analytics Sharing</h3>
                          <p className="text-sm text-muted-foreground">Help improve PitStop by sharing anonymous usage data</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Sign Out Section */}
          <div className="mt-8">
            <div className="neo-card p-6 border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <LogOut className="h-5 w-5 mr-2 text-red-500" />
                    Sign Out
                  </h3>
                  <p className="text-muted-foreground">Sign out of your PitStop account</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}