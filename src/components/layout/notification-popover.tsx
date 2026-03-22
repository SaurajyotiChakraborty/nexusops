'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCircle2, Info, AlertCircle, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLayout, Notification } from '@/components/layout/layout-context'

export function NotificationPopover() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearViewed } = useLayout()
    const [isOpen, setIsOpen] = useState(false)
    const popoverRef = useRef<HTMLDivElement>(null)

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                if (isOpen) {
                    setIsOpen(false)
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const getIcon = (title: string) => {
        if (title.toLowerCase().includes('success')) return <CheckCircle2 className="h-4 w-4 text-green-500" />
        if (title.toLowerCase().includes('recommendation')) return <Info className="h-4 w-4 text-ai-accent" />
        return <AlertCircle className="h-4 w-4 text-primary" />
    }

    const handleNotificationClick = (id: string, read: boolean) => {
        if (!read) markAsRead(id)
    }

    const handleMarkAllAsRead = () => {
        markAllAsRead()
    }

    return (
        <div className="relative" ref={popoverRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-danger text-[10px] font-bold text-white rounded-full px-1 animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-sidebar border border-sidebar-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
                        <h3 className="font-bold">Notifications</h3>
                        <NotifBadge count={unreadCount} />
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                No new notifications
                            </div>
                        ) : (
                            <div className="divide-y divide-sidebar-border/50">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n.id, n.read)}
                                        className={cn(
                                            "p-4 transition-all duration-300 cursor-pointer hover:bg-sidebar-accent relative group",
                                            !n.read && "bg-primary/5"
                                        )}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-0.5 shrink-0">
                                                {getIcon(n.title)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-medium truncate transition-colors duration-300",
                                                    !n.read ? "text-sidebar-foreground" : "text-muted-foreground"
                                                )}>
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                    {n.description}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-tighter">
                                                    {n.time}
                                                </p>
                                            </div>
                                            {!n.read && (
                                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 transition-opacity duration-300" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {unreadCount > 0 && (
                        <div className="p-2 border-t border-sidebar-border">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs text-muted-foreground gap-1.5 hover:text-foreground"
                                onClick={handleMarkAllAsRead}
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Mark all as read
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function NotifBadge({ count }: { count: number }) {
    return (
        <span className={cn(
            "px-1.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-300",
            count > 0
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-sidebar-border text-muted-foreground"
        )}>
            {count > 0 ? `${count} New` : 'All read'}
        </span>
    )
}
