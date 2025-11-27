'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Mail, Bell, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/auth-provider'
import { toast } from 'react-hot-toast'

type NotificationCategory = 'comment' | 'like' | 'deadline' | 'collaboration' | 'task_update' | 'subtask_update' | 'system'

type ChannelPreferences = {
    email: boolean
    in_app: boolean
}

type NotificationPreferences = Record<NotificationCategory, ChannelPreferences>

const DEFAULT_PREFERENCES: NotificationPreferences = {
    comment: { email: true, in_app: true },
    like: { email: true, in_app: true },
    deadline: { email: true, in_app: true },
    collaboration: { email: true, in_app: true },
    task_update: { email: true, in_app: true },
    subtask_update: { email: true, in_app: true },
    system: { email: true, in_app: true }
}

const CATEGORY_LABELS: Record<NotificationCategory, { label: string; description: string }> = {
    comment: { label: 'Comments', description: 'When someone comments on your tasks' },
    like: { label: 'Likes', description: 'When someone likes your activity' },
    deadline: { label: 'Deadlines', description: 'Reminders for upcoming task deadlines' },
    collaboration: { label: 'Collaboration', description: 'Invites and updates from collaborators' },
    task_update: { label: 'Task Updates', description: 'Changes to tasks you are watching' },
    subtask_update: { label: 'Subtask Updates', description: 'Progress on subtasks' },
    system: { label: 'System', description: 'Important system announcements' }
}

export function NotificationSettings() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)

    useEffect(() => {
        if (user) {
            fetchSettings()
        }
    }, [user])

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('notification_settings')
                .select('preferences')
                .eq('user_id', user?.id)
                .single()

            if (error && error.code !== 'PGRST116') throw error

            if (data?.preferences) {
                // Merge with default to handle potential new categories
                setPreferences({ ...DEFAULT_PREFERENCES, ...data.preferences })
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
            toast.error('Failed to load notification settings')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!user) return
        setSaving(true)

        try {
            const { error } = await supabase
                .from('notification_settings')
                .upsert({
                    user_id: user.id,
                    preferences: preferences,
                    updated_at: new Date().toISOString()
                })

            if (error) throw error
            toast.success('Settings saved successfully')
        } catch (error) {
            console.error('Error saving settings:', error)
            toast.error('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const togglePreference = (category: NotificationCategory, channel: keyof ChannelPreferences) => {
        setPreferences(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [channel]: !prev[category][channel]
            }
        }))
    }

    const toggleAll = (channel: keyof ChannelPreferences, enabled: boolean) => {
        setPreferences(prev => {
            const nextPreferences: NotificationPreferences = { ...prev }
            const categories = Object.keys(nextPreferences) as NotificationCategory[]

            categories.forEach(cat => {
                nextPreferences[cat] = { ...nextPreferences[cat], [channel]: enabled }
            })

            return nextPreferences
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-muted/30 border-b border-border text-sm font-medium text-muted-foreground">
                    <div className="col-span-6 sm:col-span-8">Notification Type</div>
                    <div className="col-span-3 sm:col-span-2 text-center flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span className="hidden sm:inline">Email</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => toggleAll('email', true)} className="text-[10px] text-primary hover:underline">All</button>
                            <button onClick={() => toggleAll('email', false)} className="text-[10px] text-muted-foreground hover:underline">None</button>
                        </div>
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-center flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Bell className="h-4 w-4" />
                            <span className="hidden sm:inline">In-App</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => toggleAll('in_app', true)} className="text-[10px] text-primary hover:underline">All</button>
                            <button onClick={() => toggleAll('in_app', false)} className="text-[10px] text-muted-foreground hover:underline">None</button>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-border">
                    {(Object.keys(CATEGORY_LABELS) as NotificationCategory[]).map((category) => (
                        <div key={category} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-accent/20 transition-colors">
                            <div className="col-span-6 sm:col-span-8">
                                <p className="font-medium text-foreground">{CATEGORY_LABELS[category].label}</p>
                                <p className="text-xs text-muted-foreground hidden sm:block">{CATEGORY_LABELS[category].description}</p>
                            </div>

                            <div className="col-span-3 sm:col-span-2 flex justify-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences[category]?.email ?? true}
                                        onChange={() => togglePreference(category, 'email')}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="col-span-3 sm:col-span-2 flex justify-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={preferences[category]?.in_app ?? true}
                                        onChange={() => togglePreference(category, 'in_app')}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Save Preferences
                </button>
            </div>
        </div>
    )
}
