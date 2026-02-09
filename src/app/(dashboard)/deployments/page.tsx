'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api, setAuthToken } from '@/lib/api'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Rocket,
    Clock,
    ExternalLink,
    Loader2,
    CheckCircle,
    XCircle,
    RefreshCw,
} from 'lucide-react'
import Link from 'next/link'

interface Deployment {
    id: string
    status: string
    branch: string
    commitSha: string
    commitMessage: string
    url?: string
    createdAt: string
    deployedAt?: string
    buildTime?: number
    project: {
        id: string
        name: string
    }
}

function getStatusVariant(status: string) {
    switch (status) {
        case 'SUCCESS':
            return 'success'
        case 'BUILDING':
        case 'DEPLOYING':
        case 'QUEUED':
            return 'info'
        case 'FAILED':
            return 'danger'
        default:
            return 'secondary'
    }
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'SUCCESS':
            return <CheckCircle className="w-4 h-4 text-green-500" />
        case 'BUILDING':
        case 'DEPLOYING':
        case 'QUEUED':
            return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
        case 'FAILED':
            return <XCircle className="w-4 h-4 text-red-500" />
        default:
            return <Clock className="w-4 h-4 text-gray-500" />
    }
}

export default function DeploymentsPage() {
    const { getToken, isLoaded, isSignedIn } = useAuth()
    const [deployments, setDeployments] = useState<Deployment[]>([])
    const [loading, setLoading] = useState(true)

    const loadDeployments = async () => {
        try {
            const token = await getToken()
            if (token) {
                setAuthToken(token)
                const data = await api.get<Deployment[]>('/deployments/recent?limit=50')
                setDeployments(data)
            }
        } catch (error) {
            console.error('Failed to load deployments:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            loadDeployments()
            // Poll every 10 seconds for real-time updates
            const interval = setInterval(loadDeployments, 10000)
            return () => clearInterval(interval)
        }
    }, [isLoaded, isSignedIn, getToken])

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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Deployments</h1>
                        <p className="text-muted-foreground">
                            View and manage all your deployments
                        </p>
                    </div>
                    <Link href="/deploy">
                        <Button variant="accent" className="gap-2">
                            <Rocket className="w-4 h-4" />
                            New Deployment
                        </Button>
                    </Link>
                </div>

                {/* Deployments List */}
                {deployments.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Rocket className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No deployments yet</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Deploy your first project to see it here
                            </p>
                            <Link href="/deploy">
                                <Button variant="accent">Create Deployment</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {deployments.map((deployment) => (
                            <Card
                                key={deployment.id}
                                className="hover:border-primary/50 transition-colors cursor-pointer"
                                onClick={() => window.location.href = `/deployments/${deployment.id}`}
                            >
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        {getStatusIcon(deployment.status)}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{deployment.project.name}</span>
                                                <Badge variant={getStatusVariant(deployment.status)}>
                                                    {deployment.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {deployment.branch} • {deployment.commitMessage?.substring(0, 50) || deployment.commitSha?.substring(0, 7)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        {deployment.buildTime && (
                                            <span>{deployment.buildTime}s</span>
                                        )}
                                        <span>{new Date(deployment.createdAt).toLocaleString()}</span>
                                        {deployment.url && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    window.open(deployment.url, '_blank')
                                                }}
                                                className="hover:text-primary"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
