'use client'

import { useState, useEffect, useCallback, use } from 'react'
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
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    XCircle,
    Search,
    Copy,
    Check,
    Timer,
    Activity,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AdvancedModePanel } from '@/components/deploy/AdvancedModePanel'
import { useModeStore } from '@/stores/useModeStore'
import Link from 'next/link'

/* ============================================================
   Types
   ============================================================ */

interface Project {
    id: string
    name: string
    description: string | null
    framework: string | null
    repositoryUrl: string | null
    branch: string
    createdAt: string
    updatedAt: string
}

interface Deployment {
    id: string
    status: string
    commitSha: string
    commitMessage: string | null
    branch: string
    buildLogs: string | null
    buildTime: number | null
    dockerImage: string | null
    containerId: string | null
    containerPort: number | null
    url: string | null
    deployedAt: string | null
    createdAt: string
    updatedAt: string
}

/* ============================================================
   Helpers
   ============================================================ */

function getStatusVariant(status: string): 'success' | 'danger' | 'info' | 'secondary' {
    switch (status) {
        case 'SUCCESS': return 'success'
        case 'FAILED': return 'danger'
        case 'BUILDING': case 'DEPLOYING': return 'info'
        default: return 'secondary'
    }
}

function getStatusLabel(status: string): string {
    switch (status) {
        case 'SUCCESS': return 'Success'
        case 'FAILED': return 'Failed'
        case 'BUILDING': return 'Building'
        case 'DEPLOYING': return 'Deploying'
        case 'PENDING': return 'Pending'
        case 'QUEUED': return 'Queued'
        case 'CANCELLED': return 'Cancelled'
        default: return status
    }
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'SUCCESS':
            return <CheckCircle className="w-5 h-5 text-emerald-400" />
        case 'BUILDING':
        case 'DEPLOYING':
            return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        case 'FAILED':
            return <XCircle className="w-5 h-5 text-red-400" />
        default:
            return <Clock className="w-5 h-5 text-muted-foreground" />
    }
}

function timeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return date.toLocaleDateString()
}

/* ============================================================
   Copy Button
   ============================================================ */

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    return (
        <button
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigator.clipboard.writeText(text)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }}
            className="p-1 rounded hover:bg-muted/50 transition-colors"
            title="Copy"
        >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
        </button>
    )
}

/* ============================================================
   Log Viewer Component
   ============================================================ */

function LogViewer({ logs, status }: { logs: string; status: string }) {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'error' | 'info'>('all')
    const [expanded, setExpanded] = useState(false)

    const lines = logs.split('\n').filter(Boolean)
    const filteredLines = lines.filter((line) => {
        const matchesSearch = !search || line.toLowerCase().includes(search.toLowerCase())
        if (!matchesSearch) return false
        if (filter === 'error')
            return (
                line.includes('❌') ||
                line.toLowerCase().includes('error') ||
                line.toLowerCase().includes('fail') ||
                line.toLowerCase().includes('warn')
            )
        if (filter === 'info')
            return (
                line.includes('✓') ||
                line.includes('✅') ||
                line.toLowerCase().includes('success') ||
                line.toLowerCase().includes('done')
            )
        return true
    })
    const displayLines = expanded ? filteredLines : filteredLines.slice(-40)

    return (
        <div className="space-y-3 mt-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search logs..."
                        className="pl-8 h-8 text-xs"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-1">
                    {(['all', 'error', 'info'] as const).map((f) => (
                        <Button
                            key={f}
                            size="sm"
                            variant={filter === f ? 'default' : 'outline'}
                            className="h-8 text-xs capitalize px-2"
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="bg-[#0d1117] rounded-xl p-4 font-mono text-xs leading-relaxed max-h-[400px] overflow-y-auto border border-border/10 shadow-inner">
                {displayLines.length === 0 ? (
                    <div className="text-muted-foreground/50 text-center py-6">No matching log lines</div>
                ) : (
                    displayLines.map((line, i) => (
                        <div
                            key={i}
                            className={`py-0.5 hover:bg-white/5 px-1 rounded ${
                                line.includes('❌') ||
                                line.toLowerCase().includes('error') ||
                                line.toLowerCase().includes('fail')
                                    ? 'text-red-400'
                                    : line.includes('✓') ||
                                      line.includes('✅') ||
                                      line.toLowerCase().includes('success')
                                    ? 'text-emerald-400'
                                    : line.includes('⚠') || line.toLowerCase().includes('warn')
                                    ? 'text-amber-400'
                                    : 'text-gray-400'
                            }`}
                        >
                            <span className="text-gray-600 mr-3 select-none inline-block w-8 text-right">
                                {String(i + 1).padStart(3, ' ')}
                            </span>
                            {line}
                        </div>
                    ))
                )}
            </div>

            {filteredLines.length > 40 && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs gap-1"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="w-3 h-3" /> Show recent only
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-3 h-3" /> Show all {filteredLines.length} lines
                        </>
                    )}
                </Button>
            )}
        </div>
    )
}

/* ============================================================
   Deployment Card
   ============================================================ */

function DeploymentCard({
    deployment,
    isExpanded,
    onToggle,
    logsData,
    logsLoading,
    logsError,
}: {
    deployment: Deployment
    isExpanded: boolean
    onToggle: () => void
    logsData: string | null
    logsLoading: boolean
    logsError: string | null
}) {
    return (
        <div
            className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                deployment.status === 'FAILED'
                    ? 'border-red-500/20 bg-red-500/5'
                    : isExpanded
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border/50 hover:bg-muted/30'
            }`}
        >
            {/* Header row */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {getStatusIcon(deployment.status)}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate">
                                {deployment.commitMessage || 'No commit message'}
                            </span>
                            <Badge variant={getStatusVariant(deployment.status)}>
                                {getStatusLabel(deployment.status)}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                                <GitCommit className="w-3 h-3" />
                                <span className="font-mono text-xs">
                                    {deployment.commitSha?.slice(0, 7) || '—'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <GitBranch className="w-3 h-3" />
                                {deployment.branch}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {timeAgo(deployment.createdAt)}
                            </div>
                            {deployment.buildTime && (
                                <div className="flex items-center gap-1">
                                    <Timer className="w-3 h-3" />
                                    {deployment.buildTime}s
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggle()
                        }}
                    >
                        <Terminal className="w-4 h-4" />
                        Logs
                        {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                        ) : (
                            <ChevronDown className="w-3 h-3" />
                        )}
                    </Button>
                    {deployment.url && (
                        <a
                            href={deployment.url.startsWith('http') ? deployment.url : `http://${deployment.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </a>
                    )}
                </div>
            </div>

            {/* Expandable Logs Section */}
            {isExpanded && (
                <div className="border-t border-border/30 px-4 pb-4">
                    {logsLoading ? (
                        <div className="flex items-center justify-center py-8 gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Fetching logs...
                        </div>
                    ) : logsError ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <AlertCircle className="w-6 h-6 text-red-400/50" />
                            <p className="text-sm text-red-400">{logsError}</p>
                        </div>
                    ) : logsData ? (
                        <LogViewer logs={logsData} status={deployment.status} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                            <Terminal className="w-6 h-6 opacity-30" />
                            <p className="text-sm">No logs available for this deployment</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

/* ============================================================
   Main Page
   ============================================================ */

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const { isLoaded, isSignedIn } = useAuth()
    const api = useApi()
    const { mode } = useModeStore()

    const [project, setProject] = useState<Project | null>(null)
    const [deployments, setDeployments] = useState<Deployment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Logs state: keyed by deployment ID
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [logsCache, setLogsCache] = useState<Record<string, string>>({})
    const [logsLoading, setLogsLoading] = useState<Record<string, boolean>>({})
    const [logsError, setLogsError] = useState<Record<string, string>>({})

    // Load project and deployments
    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const [projectData, deploymentsData] = await Promise.all([
                api.get<Project>(`/projects/${resolvedParams.id}`),
                api.get<Deployment[]>(`/deployments/project/${resolvedParams.id}`),
            ])
            setProject(projectData)
            setDeployments(deploymentsData || [])

            // Auto-expand logs for the most recent failed deployment
            const firstFailed = (deploymentsData || []).find((d) => d.status === 'FAILED')
            if (firstFailed) {
                setExpandedId(firstFailed.id)
                fetchLogs(firstFailed.id)
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load project')
        } finally {
            setLoading(false)
        }
    }, [api, resolvedParams.id])

    // Fetch logs for a specific deployment
    const fetchLogs = useCallback(
        async (deploymentId: string) => {
            // Already cached
            if (logsCache[deploymentId]) return

            setLogsLoading((prev) => ({ ...prev, [deploymentId]: true }))
            setLogsError((prev) => ({ ...prev, [deploymentId]: '' }))

            try {
                const data = await api.get<Deployment>(`/deployments/${deploymentId}`)
                const logs = data?.buildLogs || ''
                setLogsCache((prev) => ({ ...prev, [deploymentId]: logs }))
            } catch (err: any) {
                setLogsError((prev) => ({
                    ...prev,
                    [deploymentId]: err.message || 'Failed to fetch logs',
                }))
            } finally {
                setLogsLoading((prev) => ({ ...prev, [deploymentId]: false }))
            }
        },
        [api, logsCache],
    )

    // Toggle log expansion
    const toggleLogs = useCallback(
        (deploymentId: string) => {
            if (expandedId === deploymentId) {
                setExpandedId(null)
            } else {
                setExpandedId(deploymentId)
                fetchLogs(deploymentId)
            }
        },
        [expandedId, fetchLogs],
    )

    useEffect(() => {
        if (isLoaded && isSignedIn) loadData()
    }, [isLoaded, isSignedIn, loadData])

    // --- Loading & Error States ---

    if (!isLoaded || loading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading project...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (error || !project) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
                    <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                    <p className="text-muted-foreground">{error || 'Project not found'}</p>
                    <Link href="/projects">
                        <Button variant="outline" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to Projects
                        </Button>
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    // --- Derived Stats ---
    const latestDeployment = deployments[0]
    const latestUrl = latestDeployment?.url
    const totalDeployments = deployments.length
    const successCount = deployments.filter((d) => d.status === 'SUCCESS').length
    const successRate = totalDeployments > 0 ? Math.round((successCount / totalDeployments) * 100) : 0
    const avgBuildTime =
        deployments.filter((d) => d.buildTime).length > 0
            ? Math.round(
                  deployments
                      .filter((d) => d.buildTime)
                      .reduce((sum, d) => sum + (d.buildTime || 0), 0) /
                      deployments.filter((d) => d.buildTime).length,
              )
            : null
    const isLive = latestDeployment?.status === 'SUCCESS'

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Project Header */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 px-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Link href="/projects">
                                <Button variant="ghost" size="icon" className="shrink-0 -ml-2">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <h1 className="text-3xl font-bold">{project.name}</h1>
                            {project.framework && (
                                <Badge variant="secondary">{project.framework}</Badge>
                            )}
                        </div>
                        {project.description && (
                            <p className="text-muted-foreground">{project.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <GitBranch className="w-4 h-4" />
                                {project.branch || 'main'}
                            </div>
                            <div className="flex items-center gap-1">
                                <Globe className="w-4 h-4" />
                                {latestUrl ? (
                                    <div className="flex items-center gap-1">
                                        <a
                                            href={latestUrl.startsWith('http') ? latestUrl : `http://${latestUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline transition-colors flex items-center gap-1"
                                        >
                                            {latestUrl}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                        <CopyButton text={latestUrl} />
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground/60 italic">
                                        No domain assigned
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" className="gap-2">
                            <Settings className="w-4 h-4" />
                            Settings
                        </Button>
                        <Button variant="accent" className="gap-2" onClick={loadData}>
                            <RefreshCw className="w-4 h-4" />
                            Redeploy
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                {isLive ? (
                                    <>
                                        <div className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                                        </div>
                                        <span className="text-xl font-semibold text-emerald-400">Live</span>
                                    </>
                                ) : latestDeployment?.status === 'FAILED' ? (
                                    <>
                                        <XCircle className="w-5 h-5 text-red-400" />
                                        <span className="text-xl font-semibold text-red-400">Failed</span>
                                    </>
                                ) : latestDeployment?.status === 'BUILDING' || latestDeployment?.status === 'DEPLOYING' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                        <span className="text-xl font-semibold text-blue-400">
                                            {getStatusLabel(latestDeployment.status)}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Clock className="w-5 h-5 text-muted-foreground" />
                                        <span className="text-xl font-semibold">
                                            {latestDeployment ? getStatusLabel(latestDeployment.status) : 'No deploys'}
                                        </span>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Deployments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold">{totalDeployments}</span>
                            <span className="text-sm text-muted-foreground ml-2">total</span>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Avg Build Time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold">
                                {avgBuildTime !== null ? `${avgBuildTime}s` : '—'}
                            </span>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Success Rate</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span
                                className={`text-2xl font-bold ${
                                    successRate >= 80
                                        ? 'text-emerald-400'
                                        : successRate >= 50
                                        ? 'text-amber-400'
                                        : 'text-red-400'
                                }`}
                            >
                                {totalDeployments > 0 ? `${successRate}%` : '—'}
                            </span>
                        </CardContent>
                    </Card>
                </div>

                {/* Deployment History */}
                <Card className="mx-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Deployment History
                                </CardTitle>
                                <CardDescription>
                                    Recent deployments for this project
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2" onClick={loadData}>
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {deployments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Terminal className="w-10 h-10 opacity-20 mb-3" />
                                <p className="text-sm">No deployments yet</p>
                                <p className="text-xs mt-1">
                                    Deploy your project from the Deploy tab to see history here
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {deployments.map((deployment) => (
                                    <DeploymentCard
                                        key={deployment.id}
                                        deployment={deployment}
                                        isExpanded={expandedId === deployment.id}
                                        onToggle={() => toggleLogs(deployment.id)}
                                        logsData={logsCache[deployment.id] || null}
                                        logsLoading={logsLoading[deployment.id] || false}
                                        logsError={logsError[deployment.id] || null}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Advanced Mode Panel */}
                {mode === 'advanced' && <AdvancedModePanel />}
            </div>
        </DashboardLayout>
    )
}
