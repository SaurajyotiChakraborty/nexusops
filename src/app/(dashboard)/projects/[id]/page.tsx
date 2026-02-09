'use client'

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
import {
    GitBranch,
    Globe,
    Settings,
    RefreshCw,
    ExternalLink,
    Clock,
    GitCommit,
    Terminal,
    AlertCircle,
    CheckCircle,
    Loader2,
} from 'lucide-react'

// Mock project data
const project = {
    id: '1',
    name: 'my-next-app',
    description: 'A Next.js application with AI features',
    framework: 'Next.js',
    repository: 'github.com/user/my-next-app',
    branch: 'main',
    url: 'my-next-app.nexusops.dev',
    createdAt: '2025-12-15',
}

const deployments = [
    {
        id: '1',
        status: 'Success',
        commitSha: 'a1b2c3d',
        commitMessage: 'feat: add user authentication',
        branch: 'main',
        createdAt: '2 hours ago',
        buildTime: '45s',
    },
    {
        id: '2',
        status: 'Success',
        commitSha: 'e4f5g6h',
        commitMessage: 'fix: resolve memory leak in dashboard',
        branch: 'main',
        createdAt: '1 day ago',
        buildTime: '52s',
    },
    {
        id: '3',
        status: 'Failed',
        commitSha: 'i7j8k9l',
        commitMessage: 'refactor: update dependencies',
        branch: 'develop',
        createdAt: '3 days ago',
        buildTime: '23s',
    },
]

function getStatusIcon(status: string) {
    switch (status) {
        case 'Success':
            return <CheckCircle className="w-4 h-4 text-success" />
        case 'Building':
            return <Loader2 className="w-4 h-4 text-info animate-spin" />
        case 'Failed':
            return <AlertCircle className="w-4 h-4 text-danger" />
        default:
            return <Clock className="w-4 h-4 text-muted-foreground" />
    }
}

export default function ProjectDetailPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Project Header */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{project.name}</h1>
                            <Badge variant="secondary">{project.framework}</Badge>
                        </div>
                        <p className="text-muted-foreground">{project.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <GitBranch className="w-4 h-4" />
                                {project.branch}
                            </div>
                            <div className="flex items-center gap-1">
                                <Globe className="w-4 h-4" />
                                <a
                                    href={`https://${project.url}`}
                                    target="_blank"
                                    className="hover:text-primary transition-colors"
                                >
                                    {project.url}
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2">
                            <Settings className="w-4 h-4" />
                            Settings
                        </Button>
                        <Button variant="accent" className="gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Redeploy
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-success" />
                                <span className="text-xl font-semibold">Live</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Deployments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold">47</span>
                            <span className="text-sm text-muted-foreground ml-2">total</span>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Avg Build Time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold">42s</span>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Success Rate</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold text-success">94%</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Deployment History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Deployment History</CardTitle>
                        <CardDescription>Recent deployments for this project</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {deployments.map((deployment) => (
                                <div
                                    key={deployment.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        {getStatusIcon(deployment.status)}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {deployment.commitMessage}
                                                </span>
                                                <Badge
                                                    variant={
                                                        deployment.status === 'Success'
                                                            ? 'success'
                                                            : deployment.status === 'Failed'
                                                                ? 'danger'
                                                                : 'info'
                                                    }
                                                >
                                                    {deployment.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <GitCommit className="w-3 h-3" />
                                                    {deployment.commitSha}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <GitBranch className="w-3 h-3" />
                                                    {deployment.branch}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {deployment.createdAt}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="gap-1">
                                            <Terminal className="w-4 h-4" />
                                            Logs
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
