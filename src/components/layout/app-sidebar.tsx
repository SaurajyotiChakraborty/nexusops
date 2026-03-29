'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useLayout } from '@/components/layout/layout-context'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { useUserProfile } from '@/components/auth/user-profile-context'
import { useUser, useClerk } from '@clerk/nextjs'
import {
    LayoutDashboard,
    FolderGit2,
    Rocket,
    Network,
    Sparkles,
    Settings,
    Menu,
    LogOut,
    BookOpen,
} from 'lucide-react'

const navigationItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Projects',
        href: '/projects',
        icon: FolderGit2,
    },
    {
        title: 'Deploy',
        href: '/deploy',
        icon: Rocket,
    },
    {
        title: 'Infrastructure',
        href: '/infrastructure',
        icon: Network,
    },
    {
        title: 'AI Ops',
        href: '/ai-ops',
        icon: Sparkles,
        special: true,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
    {
        title: 'Docs',
        href: '/docs',
        icon: BookOpen,
    },
]

function SidebarAvatar({ imageUrl, name }: { imageUrl?: string | null; name?: string | null }) {
    const initials = name
        ? name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
        : '?'
    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name ?? 'Avatar'}
                className="w-8 h-8 rounded-full object-cover shrink-0"
            />
        )
    }
    return (
        <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
        </div>
    )
}

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { sidebarCollapsed, toggleSidebar } = useLayout()
    const { profile } = useUserProfile()
    const { user: clerkUser } = useUser()
    const { signOut } = useClerk()

    const displayName = profile?.name ?? clerkUser?.fullName ?? 'User'
    const displayImage = profile?.imageUrl ?? clerkUser?.imageUrl ?? null

    const handleLogout = async () => {
        // Clear all auth tokens from localStorage
        localStorage.removeItem('nexusops_auth_token')
        localStorage.removeItem('nexusops_notifications')
        // Sign out from Clerk and redirect to landing page
        await signOut({ redirectUrl: '/' })
    }

    return (
        <aside className={cn(
            "hidden lg:flex flex-col fixed left-0 top-16 bottom-0 border-r border-sidebar-border bg-sidebar transition-all duration-300 z-40",
            sidebarCollapsed ? "w-20" : "w-64"
        )}>
            {/* Header with Toggle */}
            <div className={cn(
                "p-4 border-b border-sidebar-border flex items-center shrink-0 h-16 transition-all duration-300",
                sidebarCollapsed ? "justify-center" : "justify-between"
            )}>
                {!sidebarCollapsed && <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 px-2 animate-in fade-in duration-500">Menu</span>}

                <div className="flex items-center gap-2">
                    {!sidebarCollapsed && <ThemeToggle />}
                    <button
                        onClick={toggleSidebar}
                        className={cn(
                            "p-2 hover:bg-sidebar-accent rounded-lg text-muted-foreground transition-colors shrink-0",
                        )}
                        title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navigationItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={sidebarCollapsed ? item.title : ''}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative',
                                isActive
                                    ? item.special
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-sidebar-primary text-sidebar-primary-foreground'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                item.special && !isActive && 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                sidebarCollapsed && "justify-center px-2"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 shrink-0", !isActive && item.special && "text-ai-accent group-hover:text-white")} />
                            {!sidebarCollapsed && <span className="animate-in slide-in-from-left-2 duration-300">{item.title}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* User Section with Logout */}
            <div className="p-4 border-t border-sidebar-border">
                {!sidebarCollapsed ? (
                    <div className="space-y-1 animate-in fade-in duration-500">
                        <Link
                            href="/settings"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors"
                        >
                            <SidebarAvatar imageUrl={displayImage} name={displayName} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{displayName}</p>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleLogout}
                        title="Sign Out"
                        className="flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                )}
            </div>
        </aside>
    )
}
