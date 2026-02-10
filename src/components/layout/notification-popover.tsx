'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCircle2, Info, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLayout, Notification } from '@/components/layout/layout-context'

export function NotificationPopover() {
    const { notifications, unreadCount, markAsRead, clearViewed } = useLayout()
    const [isOpen, setIsOpen] = useState(false)
    const popoverRef = useRef<HTMLDivElement>(null)

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                if (isOpen) {
                    setIsOpen(false)
                    clearViewed() // Periodic cleanup as requested
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, clearViewed])

    const getIcon = (title: string) => {
        if (title.toLowerCase().includes('success')) return <CheckCircle2 className="h-4 w-4 text-green-500" />
        if (title.toLowerCase().includes('recommendation')) return <Info className="h-4 w-4 text-ai-accent" />
        return <AlertCircle className="h-4 w-4 text-primary" />
    }

    const handleNotificationClick = (id: string, read: boolean) => {
        if (!read) markAsRead(id)
    }

    return (
        <div className="relative" ref={popoverRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => {
                    if (isOpen) clearViewed() // Cleanup on close
                    setIsOpen(!isOpen)
                }}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full animate-pulse" />
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-sidebar border border-sidebar-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
                        <h3 className="font-bold">Notifications</h3>
                        <Badge variant="outline" className="text-[10px]">{unreadCount} New</Badge>
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
                                            "p-4 transition-colors cursor-pointer hover:bg-sidebar-accent relative group",
                                            !n.read && "bg-primary/5"
                                        )}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-0.5 shrink-0">
                                                {getIcon(n.title)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-medium truncate",
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
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-sidebar-border">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-muted-foreground"
                            onClick={() => {
                                setIsOpen(false)
                                clearViewed()
                            }}
                        >
                            Mark all as read
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

function Badge({ children, variant, className }: any) {
    return (
        <span className={cn(
            "px-1.5 py-0.5 rounded-full text-xs font-medium",
            variant === 'outline' ? 'border border-sidebar-border' : 'bg-primary text-primary-foreground',
            className
        )}>
            {children}
        </span>
    )
}
