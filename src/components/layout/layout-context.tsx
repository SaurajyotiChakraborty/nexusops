'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'

const NOTIFICATIONS_STORAGE_KEY = 'nexusops_notifications'

export interface Notification {
    id: string
    title: string
    description: string
    time: string
    read: boolean
}

interface LayoutContextType {
    sidebarCollapsed: boolean
    toggleSidebar: () => void
    notifications: Notification[]
    unreadCount: number
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    clearViewed: () => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

const defaultNotifications: Notification[] = [
    {
        id: '1',
        title: 'Deployment Successful',
        description: 'Your project "nexus-api" has been deployed.',
        time: '2 mins ago',
        read: false,
    },
    {
        id: '2',
        title: 'New Recommendation',
        description: 'AI detected a potential optimization for your cluster.',
        time: '1 hour ago',
        read: false,
    },
    {
        id: '3',
        title: 'System Update',
        description: 'NexusOps Platform v1.2.0 is now live.',
        time: '5 hours ago',
        read: false,
    },
    {
        id: '4',
        title: 'Welcome to NexusOps',
        description: 'Get started by connecting your GitHub account.',
        time: '1 day ago',
        read: true,
    },
]

function loadNotifications(): Notification[] {
    if (typeof window === 'undefined') return defaultNotifications
    try {
        const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored) as Notification[]
            if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
    } catch {}
    return defaultNotifications
}

function saveNotifications(notifications: Notification[]) {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
    } catch {}
}

export function LayoutProvider({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications)
    const [hydrated, setHydrated] = useState(false)

    // Hydrate from localStorage on mount
    useEffect(() => {
        setNotifications(loadNotifications())
        setHydrated(true)
    }, [])

    // Persist to localStorage on change
    useEffect(() => {
        if (hydrated) saveNotifications(notifications)
    }, [notifications, hydrated])

    const toggleSidebar = useCallback(() => {
        setSidebarCollapsed((prev) => !prev)
    }, [])

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.read).length,
        [notifications]
    )

    const markAsRead = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
    }, [])

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: true }))
        )
    }, [])

    const clearViewed = useCallback(() => {
        setNotifications((prev) => {
            const unread = prev.filter((n) => !n.read)
            const read = prev.filter((n) => n.read).slice(0, 3)
            return [...unread, ...read].slice(0, 3)
        })
    }, [])

    return (
        <LayoutContext.Provider
            value={{
                sidebarCollapsed,
                toggleSidebar,
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                clearViewed,
            }}
        >
            {children}
        </LayoutContext.Provider>
    )
}

export function useLayout() {
    const context = useContext(LayoutContext)
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider')
    }
    return context
}
