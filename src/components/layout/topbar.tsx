'use client'

import Link from 'next/link'
import { Bell, Search, Menu } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { NotificationPopover } from './notification-popover'

interface TopbarProps {
    onMenuClick?: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-full items-center px-4 lg:px-6 gap-4">
                {/* Logo Section - Now in Header */}
                <Link href="/" className="flex items-center gap-2 shrink-0 mr-4">
                    <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center shrink-0 shadow-sm">
                        <span className="text-white font-bold text-xl">N</span>
                    </div>
                    <span className="font-bold text-xl text-gradient-primary hidden sm:block">
                        NexusOps
                    </span>
                </Link>

                {/* Search - Centered */}
                <div className="flex-1 flex justify-center">
                    <div className="relative w-full max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search projects, deployments..."
                            className="pl-9 bg-muted/50 w-full"
                        />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <NotificationPopover />

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <p className="text-xs font-medium text-sidebar-foreground truncate max-w-[100px]">User Name</p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">Free Plan</p>
                        </div>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: 'w-9 h-9 border border-sidebar-border shadow-sm',
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}
