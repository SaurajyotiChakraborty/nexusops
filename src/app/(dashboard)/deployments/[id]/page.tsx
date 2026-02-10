'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useApi } from '@/lib/api'
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    ExternalLink,
    Terminal,
    GitBranch,
    GitCommit
} from 'lucide-react'

interface Deployment {
    id: string
    status: string
    commitSha: string
    commitMessage: string
    branch: string
    buildLogs: string
    buildTime: number
    url: string
    deployedAt: string
    createdAt: string
    project: {
        id: string
        name: string
    }
}

const statusConfig = {
    PENDING: { color: 'bg-gray-500', icon: Clock, label: 'Pending' },
    QUEUED: { color: 'bg-blue-500', icon: Clock, label: 'Queued' },
    BUILDING: { color: 'bg-yellow-500', icon: Loader2, label: 'Building' },
    DEPLOYING: { color: 'bg-purple-500', icon: Loader2, label: 'Deploying' },
    SUCCESS: { color: 'bg-green-500', icon: CheckCircle2, label: 'Success' },
    FAILED: { color: 'bg-red-500', icon: XCircle, label: 'Failed' },
    CANCELLED: { color: 'bg-gray-500', icon: XCircle, label: 'Cancelled' },
}

export default function DeploymentDetailPage() {
    const params = useParams()
    const router = useRouter()
    const api = useApi()
    const [deployment, setDeployment] = useState<Deployment | null>(null)
    const [loading, setLoading] = useState(true)

    const deploymentId = params.id as string

    useEffect(() => {
        const loadDeployment = async () => {
            try {
                const data = await api.get<Deployment>(`/deployments/${deploymentId}`)
                setDeployment(data)
            } catch (error) {
                console.error('Failed to load deployment:', error)
            } finally {
                setLoading(false)
            }
        }

        loadDeployment()

        // Poll every 3 seconds while deployment is in progress
        const interval = setInterval(() => {
            if (deployment && ['PENDING', 'QUEUED', 'BUILDING', 'DEPLOYING'].includes(deployment.status)) {
                loadDeployment()
            }
        }, 3000)

        return () => clearInterval(interval)
    }, [deploymentId, api, deployment?.status])

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        )
    }

    if (!deployment) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Deployment not found</p>
                    <Button variant="outline" onClick={() => router.push('/dashboard')} className="mt-4">
                        Back to Dashboard
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    const statusInfo = statusConfig[deployment.status as keyof typeof statusConfig] || statusConfig.PENDING
    const StatusIcon = statusInfo.icon

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/projects/${deployment.project.id}`)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{deployment.project.name}</h1>
                            <p className="text-sm text-muted-foreground">Deployment #{deployment.id.slice(0, 8)}</p>
                        </div>
                    </div>
                    <Badge className={`${statusInfo.color} text-white`}>
                        <StatusIcon className={`h-3 w-3 mr-1 ${['BUILDING', 'DEPLOYING'].includes(deployment.status) ? 'animate-spin' : ''}`} />
                        {statusInfo.label}
                    </Badge>
                </div>

                {/* Deployment Info */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <GitBranch className="h-4 w-4" />
                                Branch
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-semibold">{deployment.branch}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <GitCommit className="h-4 w-4" />
                                Commit
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-mono">{deployment.commitSha.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground mt-1">{deployment.commitMessage}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Build Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-semibold">
                                {deployment.buildTime ? `${deployment.buildTime}s` : 'In progress...'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Deployment URL */}
                {deployment.url && deployment.status === 'SUCCESS' && (
                    <Card className="border-green-500/50 bg-green-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                Deployment URL
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 px-3 py-2 bg-background rounded-md border">
                                    {deployment.url}
                                </code>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => window.open(deployment.url, '_blank')}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Build Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Terminal className="h-5 w-5" />
                            Build Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-black/90 rounded-lg p-4 font-mono text-sm text-green-400 max-h-[500px] overflow-y-auto">
                            {deployment.buildLogs ? (
                                <pre className="whitespace-pre-wrap">{deployment.buildLogs}</pre>
                            ) : (
                                <p className="text-gray-500">No logs available yet...</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
