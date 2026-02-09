'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface TopbarProps {
    onMenuClick?: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-4 lg:px-6">
                {/* Mobile Menu Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden mr-2"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Search */}
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search projects, deployments..."
                            className="pl-9 bg-muted/50"
                        />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 ml-4">
                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
                    </Button>

                    {/* User Menu */}
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: 'w-8 h-8',
                            },
                        }}
                    />
                </div>
            </div>
        </header>
    )
}
