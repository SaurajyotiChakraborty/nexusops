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
    Plus,
    Search,
    GitBranch,
    Clock,
    ExternalLink,
    MoreVertical,
    Loader2,
} from 'lucide-react'
import Link from 'next/link'



function getStatusVariant(status: string) {
    switch (status) {
        case 'SUCCESS':
            return 'success'
        case 'BUILDING':
        case 'DEPLOYING':
            return 'info'
        case 'FAILED':
            return 'danger'
        default:
            return 'secondary'
    }
}

export default function ProjectsPage() {
    const { isLoaded, isSignedIn } = useAuth()
    const api = useApi()
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
                    <div>
                        <h1 className="text-3xl font-bold">Projects</h1>
                        <p className="text-muted-foreground">
                            Manage and deploy your applications
                        </p>
                    </div>
                    <Link href="/deploy">
                        <Button variant="accent" className="gap-2">
                            <Plus className="w-4 h-4" />
                            New Project
                        </Button>
                    </Link>
                </div>

                {/* Search & Filter */}
                <div className="flex gap-4 px-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search projects..."
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                    {projects.map((project) => {
                        const lastDeployment = project.deployments?.[0]
                        return (
                            <Card
                                key={project.id}
                                className="group hover:shadow-lg transition-all hover:border-primary/30"
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                                {project.name}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {project.description || 'No description'}
                                            </CardDescription>
                                        </div>
                                        <Button variant="ghost" size="icon" className="shrink-0">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Framework & Status */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="secondary">{project.framework || 'Unknown'}</Badge>
                                        {lastDeployment && (
                                            <Badge variant={getStatusVariant(lastDeployment.status)}>
                                                {lastDeployment.status}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Repository */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <GitBranch className="w-4 h-4" />
                                        <span className="truncate">{project.repositoryUrl || 'No repository'}</span>
                                    </div>

                                    {/* Last Deployed */}
                                    {lastDeployment && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4" />
                                            <span>Deployed {new Date(lastDeployment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-2">
                                        <Link href={`/projects/${project.id}`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                View Details
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="icon">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}

                    {/* Add New Project Card */}
                    <Link href="/deploy">
                        <Card className="border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer h-full min-h-[280px] flex items-center justify-center">
                            <CardContent className="flex flex-col items-center gap-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Plus className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">Create New Project</p>
                                    <p className="text-sm text-muted-foreground">
                                        Deploy from GitHub or Bitbucket
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    )
}
