'use client'

import { ReactNode } from 'react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Topbar } from '@/components/layout/topbar'

interface DashboardLayoutProps {
    children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <AppSidebar />

            <div className="lg:pl-64">
                <Topbar />

                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
