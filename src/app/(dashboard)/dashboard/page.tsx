'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Rocket,
    TrendingUp,
    Activity,
    AlertCircle,
    Sparkles,
    ArrowRight,
    Loader2
} from 'lucide-react'
import { useApi } from '@/lib/api'

interface Stats {
    projects: number;
    totalDeployments: number;
    successfulDeployments: number;
    successRate: number;
}

interface Deployment {
    id: string;
    status: string;
    branch: string;
    createdAt: string;
    project: {
        name: string;
    };
}

export default function DashboardPage() {
    const { isLoaded, isSignedIn } = useAuth()
    const api = useApi()
    const [stats, setStats] = useState<Stats | null>(null)
    const [recentDeployments, setRecentDeployments] = useState<Deployment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            if (!isLoaded || !isSignedIn) {
                setLoading(false)
                return
            }

            try {
                // useApi automatically fetches fresh token per request
                const [statsData, deploymentsData] = await Promise.all([
                    api.get<Stats>('/projects/stats'),
                    api.get<Deployment[]>('/deployments/recent?limit=5')
                ])

                setStats(statsData)
                setRecentDeployments(deploymentsData)
            } catch (error: any) {
                console.error('Failed to load dashboard data:', error)
                // IMPORTANT: Only clear data if it's the VERY FIRST load
                // If we already have data (from polling), keep it to avoid UI flicker
                if (!stats || recentDeployments.length === 0) {
                    setStats({
                        projects: 0,
                        totalDeployments: 0,
                        successfulDeployments: 0,
                        successRate: 0
                    })
                    setRecentDeployments([])
                }
            } finally {
                setLoading(false)
            }
        }

        loadData()

        // Poll every 30 seconds for realtime updates
        if (isLoaded && isSignedIn) {
            const interval = setInterval(loadData, 30000)
            return () => clearInterval(interval)
        }
    }, [isLoaded, isSignedIn, api])

    if (!isLoaded || loading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2 pl-4">Welcome back!</h1>
                    <p className="text-muted-foreground pl-4">
                        Here's what's happening with your projects today.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pl-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Active Projects
                            </CardTitle>
                            <Rocket className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.projects || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Total projects
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Deployments
                            </CardTitle>
                            <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalDeployments || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats?.successRate ? `${stats.successRate.toFixed(1)}% success rate` : 'No deployments yet'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Success Rate
                            </CardTitle>
                            <Activity className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.successRate ? `${stats.successRate.toFixed(1)}%` : 'N/A'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Last 30 days
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-ai-accent/20 bg-primary/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-ai-accent">
                                Running Containers
                            </CardTitle>
                            <Activity className="w-4 h-4 text-ai-accent" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{recentDeployments.filter(d => d.status === 'SUCCESS').length}</div>
                            <p className="text-xs text-ai-accent mt-1">Active deployments</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-6 pl-4">
                    {/* Recent Deployments */}
                    <Card>
                        <CardHeader>
                            <CardTitle >Recent Deployments</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recentDeployments.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No recent deployments.</p>
                            ) : (
                                recentDeployments.map((deployment) => (
                                    <div key={deployment.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{deployment.project.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {deployment.branch} • {new Date(deployment.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                deployment.status === 'SUCCESS' ? 'success' :
                                                    deployment.status === 'FAILED' ? 'danger' : 'secondary'
                                            }
                                        >
                                            {deployment.status}
                                        </Badge>
                                    </div>
                                ))
                            )}
                            <Button variant="ghost" className="w-full gap-2" onClick={() => window.location.href = '/deployments'}>
                                View All
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* System Status */}
                    <Card className="border-ai-accent/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-ai-accent" />
                                System Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {stats?.successfulDeployments !== undefined && stats.successfulDeployments > 0 ? (
                                <>
                                    <div className="flex gap-3 items-center">
                                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                        <div className="flex-1">
                                            <p className="font-medium">All Systems Operational</p>
                                            <p className="text-sm text-muted-foreground">
                                                {stats?.successfulDeployments || 0} successful deployments
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <Rocket className="w-5 h-5 text-primary" />
                                        <div className="flex-1">
                                            <p className="font-medium">Active Containers</p>
                                            <p className="text-sm text-muted-foreground">
                                                {recentDeployments.filter(d => d.status === 'SUCCESS').length} running
                                            </p>
                                        </div>
                                    </div>
                                    {recentDeployments.filter(d => d.status === 'FAILED').length > 0 && (
                                        <div className="flex gap-3 items-center">
                                            <AlertCircle className="w-5 h-5 text-danger" />
                                            <div className="flex-1">
                                                <p className="font-medium">Failed Deployments</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {recentDeployments.filter(d => d.status === 'FAILED').length} need attention
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <Sparkles className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        No deployments yet. Deploy your first project to see status updates!
                                    </p>
                                </div>
                            )}
                            <Button variant="outline" className="w-full gap-2" onClick={() => window.location.href = '/deployments'}>
                                View All Deployments
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Deploy */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 ml-4">
                    <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Ready to deploy?</h3>
                            <p className="text-muted-foreground">
                                Connect your repository and deploy in seconds
                            </p>
                        </div>
                        <Button variant="accent" size="lg" className="gap-2" onClick={() => window.location.href = '/deploy'}>
                            <Rocket className="w-5 h-5" />
                            New Deployment
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
