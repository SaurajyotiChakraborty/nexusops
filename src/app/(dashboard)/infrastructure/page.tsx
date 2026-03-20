'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useApi } from '@/lib/api'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Network,
    Search,
    Loader2,
    Server,
    Activity,
    Clock,
    ArrowRight,
    Cpu,
    MemoryStick,
    Container,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Rocket,
    RefreshCw,
} from 'lucide-react'
import Link from 'next/link'

function getStatusConfig(status: string) {
    switch (status) {
        case 'SUCCESS':
            return { variant: 'success' as const, icon: CheckCircle2, label: 'Running', color: 'text-emerald-400' }
        case 'BUILDING':
        case 'DEPLOYING':
            return { variant: 'info' as const, icon: Loader2, label: status === 'BUILDING' ? 'Building' : 'Deploying', color: 'text-blue-400' }
        case 'FAILED':
            return { variant: 'danger' as const, icon: XCircle, label: 'Failed', color: 'text-red-400' }
        case 'PENDING':
        case 'QUEUED':
            return { variant: 'warning' as const, icon: AlertTriangle, label: 'Queued', color: 'text-amber-400' }
        default:
            return { variant: 'secondary' as const, icon: Clock, label: 'Idle', color: 'text-muted-foreground' }
    }
}

function formatTimeAgo(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

export default function InfrastructurePage() {
    const { isLoaded, isSignedIn } = useAuth()
    const api = useApi()
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<'all' | 'running' | 'failed' | 'idle'>('all')

    useEffect(() => {
        const loadProjects = async () => {
            try {
                const data = await api.get<any[]>('/projects')
                setProjects(data)
            } catch (error) {
                console.error('Failed to load projects:', error)
            } finally {
                setLoading(false)
            }
        }

        if (isLoaded && isSignedIn) {
            loadProjects()
        }
    }, [isLoaded, isSignedIn, api])

    const deployedProjects = projects.filter(p => p.deployments?.length > 0)
    const filteredProjects = deployedProjects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
        if (!matchesSearch) return false
        if (filter === 'all') return true
        const status = p.deployments?.[0]?.status
        if (filter === 'running') return status === 'SUCCESS'
        if (filter === 'failed') return status === 'FAILED'
        if (filter === 'idle') return !['SUCCESS', 'FAILED', 'BUILDING', 'DEPLOYING'].includes(status)
        return true
    })

    const totalRunning = deployedProjects.filter(p => p.deployments?.[0]?.status === 'SUCCESS').length
    const totalFailed = deployedProjects.filter(p => p.deployments?.[0]?.status === 'FAILED').length
    const totalServices = deployedProjects.reduce((acc: number, p: any) =>
        acc + (p.deployments?.[0]?.services?.length || 0), 0)

    if (!isLoaded || loading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading infrastructure...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <Network className="w-5 h-5 text-primary" />
                            </div>
                            Infrastructure
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor and manage your deployed services
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.reload()}>
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Projects</p>
                                    <p className="text-2xl font-bold mt-1">{deployedProjects.length}</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Container className="w-5 h-5 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Running</p>
                                    <p className="text-2xl font-bold mt-1 text-emerald-400">{totalRunning}</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Failed</p>
                                    <p className="text-2xl font-bold mt-1 text-red-400">{totalFailed}</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                    <XCircle className="w-5 h-5 text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Services</p>
                                    <p className="text-2xl font-bold mt-1">{totalServices}</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Server className="w-5 h-5 text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 px-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search deployed projects..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {(['all', 'running', 'failed', 'idle'] as const).map(f => (
                            <Button
                                key={f}
                                variant={filter === f ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter(f)}
                                className="capitalize"
                            >
                                {f}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Deployed Projects Grid */}
                {filteredProjects.length === 0 ? (
                    <Card className="mx-4 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                                <Network className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">
                                {searchQuery || filter !== 'all' ? 'No matching projects' : 'No deployed projects'}
                            </h3>
                            <p className="text-sm text-muted-foreground text-center max-w-sm">
                                {searchQuery || filter !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'Deploy a project first to see it here in the infrastructure view'
                                }
                            </p>
                            {!searchQuery && filter === 'all' && (
                                <Link href="/deploy">
                                    <Button variant="accent" className="mt-4 gap-2">
                                        <Rocket className="w-4 h-4" />
                                        Deploy a Project
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 px-4">
                        {filteredProjects.map((project) => {
                            const lastDeploy = project.deployments?.[0]
                            const statusConfig = getStatusConfig(lastDeploy?.status || '')
                            const StatusIcon = statusConfig.icon
                            const serviceCount = lastDeploy?.services?.length || 0

                            return (
                                <Link key={project.id} href={`/infrastructure/${project.id}`}>
                                    <Card className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:border-primary/30 cursor-pointer h-full relative overflow-hidden">
                                        {/* Status Indicator Line */}
                                        <div className={`absolute top-0 left-0 right-0 h-0.5 ${
                                            lastDeploy?.status === 'SUCCESS' ? 'bg-emerald-500' :
                                            lastDeploy?.status === 'FAILED' ? 'bg-red-500' :
                                            lastDeploy?.status === 'BUILDING' || lastDeploy?.status === 'DEPLOYING' ? 'bg-blue-500 animate-pulse' :
                                            'bg-muted-foreground/30'
                                        }`} />

                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 flex-1 min-w-0">
                                                    <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                                                        {project.name}
                                                    </CardTitle>
                                                    <CardDescription className="line-clamp-1">
                                                        {project.framework || 'Unknown framework'}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant={statusConfig.variant} className="shrink-0 gap-1">
                                                    <StatusIcon className={`w-3 h-3 ${lastDeploy?.status === 'BUILDING' || lastDeploy?.status === 'DEPLOYING' ? 'animate-spin' : ''}`} />
                                                    {statusConfig.label}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            {/* Service / Resource quick info */}
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
                                                    <Server className="w-4 h-4 text-muted-foreground mb-1" />
                                                    <span className="text-sm font-semibold">{serviceCount}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">Services</span>
                                                </div>
                                                <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
                                                    <Cpu className="w-4 h-4 text-muted-foreground mb-1" />
                                                    <span className="text-sm font-semibold">{lastDeploy?.cpuLimit || '0.5'}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">CPU</span>
                                                </div>
                                                <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
                                                    <MemoryStick className="w-4 h-4 text-muted-foreground mb-1" />
                                                    <span className="text-sm font-semibold">{lastDeploy?.memoryLimit || '512m'}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">Memory</span>
                                                </div>
                                            </div>

                                            {/* Last deployed timestamp */}
                                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/30">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {lastDeploy?.createdAt ? formatTimeAgo(lastDeploy.createdAt) : 'Never'}
                                                </div>
                                                <div className="flex items-center gap-1 text-primary group-hover:translate-x-0.5 transition-transform">
                                                    View Details
                                                    <ArrowRight className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
