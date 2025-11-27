'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, Trash2, Settings, X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Notification = {
    id: string
    type: 'info' | 'success' | 'warning' | 'error' | 'email'
    category: 'comment' | 'like' | 'deadline' | 'collaboration' | 'task_update' | 'subtask_update' | 'system'
    title: string
    message: string
    read: boolean
    action_url?: string
    created_at: string
}

export function NotificationCenter() {
    const { user } = useAuth()
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!user) return

        fetchNotifications()

        // Subscribe to realtime changes
        const channel = supabase
            .channel('notifications_channel')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload: any) => {
                    if (payload.eventType === 'INSERT') {
                        setNotifications(prev => [payload.new as Notification, ...prev])
                        setUnreadCount(prev => prev + 1)
                    } else if (payload.eventType === 'UPDATE') {
                        setNotifications(prev => prev.map((n: Notification) => n.id === payload.new.id ? payload.new as Notification : n))
                        // Re-calculate unread count would be safer but let's just fetch for now or optimize later
                        fetchNotifications()
                    }
                }
            )
            .subscribe()

        // Click outside to close
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            supabase.removeChannel(channel)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [user])

    const fetchNotifications = async () => {
        if (!user) return

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) {
            setNotifications(data)
            setUnreadCount(data.filter((n: Notification) => !n.read).length)
        }
    }

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))

        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)
    }

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)

        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user?.id)
            .eq('read', false)
    }

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        // Optimistic update
        const notification = notifications.find(n => n.id === id)
        setNotifications(prev => prev.filter(n => n.id !== id))
        if (notification && !notification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1))
        }

        await supabase
            .from('notifications')
            .delete()
            .eq('id', id)
    }

    const getIcon = (type: string, category?: string) => {
        // Priority to category specific icons
        switch (category) {
            case 'comment': return <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600"><Info className="h-4 w-4" /></div>
            case 'like': return <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-full text-pink-600"><CheckCircle className="h-4 w-4" /></div> // Using CheckCircle as placeholder for Heart
            case 'deadline': return <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600"><AlertTriangle className="h-4 w-4" /></div>
            case 'collaboration': return <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600"><Info className="h-4 w-4" /></div>
            case 'task_update': return <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600"><Check className="h-4 w-4" /></div>
            case 'subtask_update': return <div className="p-1.5 bg-teal-100 dark:bg-teal-900/30 rounded-full text-teal-600"><Check className="h-4 w-4" /></div>
            case 'system': return <div className="p-1.5 bg-gray-100 dark:bg-gray-900/30 rounded-full text-gray-600"><Info className="h-4 w-4" /></div>
        }

        // Fallback to type based icons
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-500" />
            case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />
            default: return <Info className="h-5 w-5 text-blue-500" />
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                            <h3 className="font-semibold text-foreground">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <Link href="/settings" onClick={() => setIsOpen(false)}>
                                    <Settings className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                </Link>
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`relative p-4 hover:bg-accent/50 transition-colors ${!notification.read ? 'bg-accent/10' : ''
                                                }`}
                                            onClick={() => !notification.read && markAsRead(notification.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1 flex-shrink-0">
                                                    {getIcon(notification.type, notification.category)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <button
                                                            onClick={(e) => deleteNotification(notification.id, e)}
                                                            className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-muted-foreground/70">
                                                            {new Date(notification.created_at).toLocaleDateString()}
                                                        </span>
                                                        {notification.action_url && (
                                                            <Link
                                                                href={notification.action_url}
                                                                onClick={() => setIsOpen(false)}
                                                                className="text-xs text-primary hover:underline"
                                                            >
                                                                View Details
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                                {!notification.read && (
                                                    <div className="mt-2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
