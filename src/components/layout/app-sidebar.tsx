'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    FolderGit2,
    Rocket,
    Network,
    Sparkles,
    BarChart3,
    CreditCard,
    Settings,
    ChevronDown,
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
        title: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
    },
    {
        title: 'Billing',
        href: '/billing',
        icon: CreditCard,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden lg:flex w-64 flex-col fixed left-0 top-0 h-full border-r border-sidebar-border bg-sidebar">
            {/* Logo / Header */}
            <div className="p-6 border-b border-sidebar-border">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                        <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <div>
                        <span className="font-bold text-lg text-gradient-primary">
                            NexusOps
                        </span>
                        <p className="text-xs text-muted-foreground">Cloud Platform</p>
                    </div>
                </Link>
            </div>

            {/* Project Switcher */}
            <div className="px-4 py-3 border-b border-sidebar-border">
                <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sm transition-colors">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">MY</span>
                        </div>
                        <span className="font-medium">My Projects</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
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
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                                isActive
                                    ? item.special
                                        ? 'gradient-ai text-white shadow-md'
                                        : 'bg-sidebar-primary text-sidebar-primary-foreground'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                item.special && !isActive && 'hover:gradient-ai hover:text-white'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.title}
                        </Link>
                    )
                })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-sidebar-border">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">User Name</p>
                        <p className="text-xs text-muted-foreground truncate">
                            user@email.com
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
