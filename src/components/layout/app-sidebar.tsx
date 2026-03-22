'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useLayout } from '@/components/layout/layout-context'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import {
    LayoutDashboard,
    FolderGit2,
    Rocket,
    Network,
    Sparkles,
    Settings,
    Menu,
} from 'lucide-react'

const navigationItems = [
    // ... (rest of items)
    // ... (same as before)
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
]

export function AppSidebar() {
    const pathname = usePathname()
    const { sidebarCollapsed, toggleSidebar } = useLayout()

    return (
        <aside className={cn(
            "hidden lg:flex flex-col fixed left-0 top-16 bottom-0 border-r border-sidebar-border bg-sidebar transition-all duration-300 z-40",
            sidebarCollapsed ? "w-20" : "w-64"
        )}>
            {/* Header with Toggle only */}
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
                            sidebarCollapsed ? "" : ""
                        )}
                        title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    {sidebarCollapsed && <div className="hidden group-hover/sidebar:block absolute left-full ml-2"><ThemeToggle /></div>}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navigationItems.map((item) => {
                    // ... (rest of nav code stays same)
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
                                        ? 'gradient-ai text-white shadow-md'
                                        : 'bg-sidebar-primary text-sidebar-primary-foreground'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                item.special && !isActive && 'hover:gradient-ai hover:text-white',
                                sidebarCollapsed && "justify-center px-2"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 shrink-0", !isActive && item.special && "text-ai-accent group-hover:text-white")} />
                            {!sidebarCollapsed && <span className="animate-in slide-in-from-left-2 duration-300">{item.title}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* User Section (Hidden when collapsed for cleaner look, or small icon) */}
            {!sidebarCollapsed && (
                <div className="p-4 border-t border-sidebar-border animate-in fade-in duration-500">
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
            )}
        </aside>
    )
}
