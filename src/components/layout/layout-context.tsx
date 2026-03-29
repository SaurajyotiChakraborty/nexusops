'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'

export interface Notification {
    id: string
    title: string
    description: string
    createdAt: string
    read: boolean
}

interface LayoutContextType {
    sidebarCollapsed: boolean
    toggleSidebar: () => void
    notifications: Notification[]
    unreadCount: number
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    addNotification: (n: Notification) => void
    refreshNotifications: () => Promise<void>
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
const TOKEN_KEY = 'nexusops_auth_token'

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
    if (!token) return { 'Content-Type': 'application/json' }
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
}

import { useApi } from '@/lib/api'

export function LayoutProvider({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const api = useApi()

    // Fetch notifications from backend
    const refreshNotifications = useCallback(async () => {
        try {
            const data = await api.get<Notification[]>('/notifications')
            setNotifications(data)
        } catch {
            // Silently fail — user may not be authenticated yet
        }
    }, [api])

    // Fetch on mount + poll every 30 seconds
    useEffect(() => {
        refreshNotifications()
        const interval = setInterval(refreshNotifications, 30000)
        return () => clearInterval(interval)
    }, [refreshNotifications])

    const toggleSidebar = useCallback(() => {
        setSidebarCollapsed((prev) => !prev)
    }, [])

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.read).length,
        [notifications]
    )

    const markAsRead = useCallback(async (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
        try {
            await api.patch(`/notifications/${id}/read`, {})
        } catch {}
    }, [api])

    const markAllAsRead = useCallback(async () => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: true }))
        )
        try {
            await api.patch('/notifications/read-all', {})
        } catch {}
    }, [api])

    const addNotification = useCallback((n: Notification) => {
        setNotifications((prev) => [n, ...prev])
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
                addNotification,
                refreshNotifications,
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
