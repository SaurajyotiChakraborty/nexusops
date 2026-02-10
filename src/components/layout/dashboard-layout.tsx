'use client'

import { ReactNode } from 'react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Topbar } from '@/components/layout/topbar'
import { useLayout } from '@/components/layout/layout-context'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
    children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { sidebarCollapsed } = useLayout()

    return (
        <div className="min-h-screen bg-background">
            {/* Topbar is now global at the top */}
            <Topbar />

            <div className="flex pt-16">
                {/* Sidebar starts below Topbar (pt-16) */}
                <AppSidebar />

                <main className={cn(
                    "flex-1 transition-all duration-300 p-4 lg:p-6",
                    sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
                )}>
                    {children}
                </main>
            </div>
        </div>
    )
}
