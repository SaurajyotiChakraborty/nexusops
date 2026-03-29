'use client'

import Link from 'next/link'
import { Search, LogOut } from 'lucide-react'
import { UserButton, useClerk } from '@clerk/nextjs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { NotificationPopover } from './notification-popover'
import { AdvancedBadge } from '@/components/mode/AdvancedBadge'
import { ModeToggle } from '@/components/mode/ModeToggle'
import { useUserProfile } from '@/components/auth/user-profile-context'
import { useUser } from '@clerk/nextjs'

interface TopbarProps {
    onMenuClick?: () => void
}

function UserAvatar({ imageUrl, name }: { imageUrl?: string | null; name?: string | null }) {
    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name ?? 'Avatar'}
                className="w-9 h-9 rounded-full object-cover border border-sidebar-border shadow-sm"
            />
        )
    }
    const initials = name
        ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
        : '?'
    return (
        <div className="w-9 h-9 rounded-full gradient-accent flex items-center justify-center text-white text-sm font-bold border border-sidebar-border shadow-sm shrink-0">
            {initials}
        </div>
    )
}

export function Topbar({ onMenuClick }: TopbarProps) {
    const { profile } = useUserProfile()
    const { user: clerkUser } = useUser()
    const { signOut } = useClerk()

    // Prefer DB profile, fall back to Clerk
    const displayName = profile?.name ?? clerkUser?.fullName ?? 'User'
    const displayImage = profile?.imageUrl ?? clerkUser?.imageUrl ?? null

    const handleLogout = async () => {
        localStorage.removeItem('nexusops_auth_token')
        localStorage.removeItem('nexusops_notifications')
        await signOut({ redirectUrl: '/' })
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-full items-center px-4 lg:px-6 gap-4">
                {/* Logo */}
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
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center">
                        <ModeToggle />
                    </div>
                    <AdvancedBadge />
                    <div className="w-px h-6 bg-border" />
                    <NotificationPopover />

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-sidebar-foreground truncate max-w-[120px]">
                                {displayName}
                            </p>
                        </div>
                        {/* Use custom avatar when DB image exists, else Clerk UserButton */}
                        {displayImage && displayImage !== clerkUser?.imageUrl ? (
                            <UserAvatar imageUrl={displayImage} name={displayName} />
                        ) : (
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: 'w-9 h-9 border border-sidebar-border shadow-sm',
                                    },
                                }}
                            />
                        )}
                    </div>

                    {/* Logout Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        title="Sign Out"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
