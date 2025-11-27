'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, Smartphone, Save, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/auth-provider'
import { toast } from 'react-hot-toast'

type NotificationSettings = {
    email_notifications: boolean
    in_app_notifications: boolean
    types: {
        info: boolean
        success: boolean
        warning: boolean
        error: boolean
    }
}

export function NotificationSettings() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<NotificationSettings>({
        email_notifications: true,
        in_app_notifications: true,
        types: {
            info: true,
            success: true,
            warning: true,
            error: true
        }
    })

    useEffect(() => {
        if (user) {
            fetchSettings()
        }
    }, [user])

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('notification_settings')
                .select('*')
                .eq('user_id', user?.id)
                .single()

            if (error && error.code !== 'PGRST116') throw error

            if (data) {
                setSettings({
                    email_notifications: data.email_notifications,
                    in_app_notifications: data.in_app_notifications,
                    types: data.types || settings.types
                })
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
                    email_notifications: settings.email_notifications,
                    in_app_notifications: settings.in_app_notifications,
                    types: settings.types,
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

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Notification Channels</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Email Notifications</p>
                                <p className="text-sm text-muted-foreground">Receive updates via email</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.email_notifications}
                                onChange={(e) => setSettings(prev => ({ ...prev, email_notifications: e.target.checked }))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">In-App Notifications</p>
                                <p className="text-sm text-muted-foreground">Show notifications within the app</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.in_app_notifications}
                                onChange={(e) => setSettings(prev => ({ ...prev, in_app_notifications: e.target.checked }))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Notification Types</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(settings.types).map(([type, enabled]) => (
                        <div key={type} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                            <span className="capitalize text-sm font-medium">{type}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        types: { ...prev.types, [type]: e.target.checked }
                                    }))}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
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
