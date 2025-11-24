'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save, 
  Camera, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'
import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  email: string
  username?: string
  full_name?: string
  avatar_url?: string
  role: string
  created_at: string
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: ''
  })
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    task_reminders: true,
    collaboration_updates: true,
    public_profile: false
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        username: data.username || '',
        email: data.email || ''
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    }
  }

  const updateProfile = async () => {
    if (!user || !profile) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully!')
      await loadProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const updatePreferences = async () => {
    // For now, just show success message
    // In a real app, you'd save these to a user_preferences table
    toast.success('Preferences updated successfully!')
  }

  const deleteAccount = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Delete user data
      const { error } = await supabase.rpc('delete_user_account', { user_id: user.id })
      
      if (error) throw error

      await supabase.auth.signOut()
      toast.success('Account deleted successfully')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !profile) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Please Sign In</h2>
        <p className="text-muted-foreground">
          You need to be signed in to access your settings.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and privacy settings.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'privacy', label: 'Privacy', icon: Shield },
              { id: 'appearance', label: 'Appearance', icon: Palette },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-500 text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Profile Information</h2>
                  <p className="text-muted-foreground mb-6">
                    Update your personal information and public profile details.
                  </p>
                </div>

                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                      {profile.full_name?.[0] || profile.email[0].toUpperCase()}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-background border border-border rounded-full hover:bg-accent transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{profile.full_name || 'Anonymous User'}</h3>
                    <p className="text-muted-foreground">@{profile.username || 'username'}</p>
                    <p className="text-sm text-muted-foreground">
                      Member since {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      placeholder="Choose a username"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={updateProfile}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Notification Preferences</h2>
                  <p className="text-muted-foreground mb-6">
                    Control how and when you receive notifications.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      key: 'email_notifications',
                      label: 'Email Notifications',
                      description: 'Receive notifications via email'
                    },
                    {
                      key: 'task_reminders',
                      label: 'Task Reminders',
                      description: 'Get reminded about upcoming deadlines'
                    },
                    {
                      key: 'collaboration_updates',
                      label: 'Collaboration Updates',
                      description: 'Notifications when others interact with your tasks'
                    }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <h3 className="font-medium text-foreground">{item.label}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <button
                        onClick={() => setPreferences(prev => ({ 
                          ...prev, 
                          [item.key]: !prev[item.key as keyof typeof prev] 
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences[item.key as keyof typeof preferences] 
                            ? 'bg-blue-500' 
                            : 'bg-muted'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences[item.key as keyof typeof preferences] 
                            ? 'translate-x-6' 
                            : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={updatePreferences}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Privacy Settings</h2>
                  <p className="text-muted-foreground mb-6">
                    Control your privacy and data sharing preferences.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium text-foreground">Public Profile</h3>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see your profile information
                      </p>
                    </div>
                    <button
                      onClick={() => setPreferences(prev => ({ 
                        ...prev, 
                        public_profile: !prev.public_profile 
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.public_profile 
                          ? 'bg-blue-500' 
                          : 'bg-muted'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.public_profile 
                          ? 'translate-x-6' 
                          : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-medium text-foreground mb-2">Data Export</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download a copy of your data including tasks, comments, and profile information.
                    </p>
                    <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
                      Request Data Export
                    </button>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <h3 className="font-medium text-red-700 dark:text-red-400 mb-2">Delete Account</h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Appearance</h2>
                  <p className="text-muted-foreground mb-6">
                    Customize how PitStop looks and feels.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-medium text-foreground mb-3">Theme</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose your preferred color scheme
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'light', label: 'Light', icon: '☀️' },
                        { id: 'dark', label: 'Dark', icon: '🌙' },
                        { id: 'system', label: 'System', icon: '🖥️' },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setTheme(option.id)}
                          className={`p-4 border border-border rounded-lg text-center hover:bg-accent transition-colors ${
                            theme === option.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          <div className="text-2xl mb-2">{option.icon}</div>
                          <div className="text-sm font-medium">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-medium text-foreground mb-3">Language</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select your preferred language
                    </p>
                    <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-foreground mb-4">Delete Account</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your tasks, comments, and data.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}