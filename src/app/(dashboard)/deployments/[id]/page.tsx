'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AIAssistantPanel } from '@/components/deploy/ai-assistant-panel'
import {
    ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, ExternalLink,
    Terminal, GitBranch, GitCommit, MessageCircle,
    AlertTriangle, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface Deployment {
    id: string
    status: string
    commitSha: string
    commitMessage: string
    branch: string
    buildLogs: string | null
    buildTime: number | null
    url: string | null
    deployedAt: string | null
    createdAt: string
    project: { id: string; name: string }
}

const statusConfig: Record<string, { badge: string; icon: any; label: string; pulse?: boolean }> = {
    PENDING: { badge: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Clock, label: 'Pending' },
    QUEUED: { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock, label: 'Queued' },
    BUILDING: { badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Loader2, label: 'Building', pulse: true },
    DEPLOYING: { badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Loader2, label: 'Deploying', pulse: true },
    SUCCESS: { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2, label: 'Success' },
    FAILED: { badge: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Failed' },
    CANCELLED: { badge: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: XCircle, label: 'Cancelled' },
}

const IN_PROGRESS = ['PENDING', 'QUEUED', 'BUILDING', 'DEPLOYING']

export default function DeploymentDetailPage() {
    const params = useParams()
    const router = useRouter()
    const deploymentId = params.id as string

    const [deployment, setDeployment] = useState<Deployment | null>(null)
    const [loading, setLoading] = useState(true)
    const [logsExpanded, setLogsExpanded] = useState(true)
    const [showAssistant, setShowAssistant] = useState(false)
    const logsEndRef = useRef<HTMLDivElement>(null)

    const fetchDeployment = useCallback(async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/deployments/${id}`)
            if (res.ok) {
                const data: Deployment = await res.json()
                setDeployment(data)
            }
        } catch { /* silent */ }
    }, [])

    // Initial load
    useEffect(() => {
        const init = async () => {
            setLoading(true)
            await fetchDeployment(deploymentId)
            setLoading(false)
        }
        init()
    }, [deploymentId, fetchDeployment])

    // Polling for live updates while in progress
    useEffect(() => {
        if (!deployment || !IN_PROGRESS.includes(deployment.status)) return
        const timer = setInterval(() => fetchDeployment(deploymentId), 3000)
        return () => clearInterval(timer)
    }, [deployment, deploymentId, fetchDeployment])

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current && logsExpanded) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [deployment?.buildLogs, logsExpanded])

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                        <p className="text-sm text-slate-400">Loading deployment...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!deployment) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Deployment not found</p>
                    <Button variant="outline" onClick={() => router.push('/dashboard')} className="mt-4">
                        Back to Dashboard
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    const statusInfo = statusConfig[deployment.status] || statusConfig.PENDING
    const StatusIcon = statusInfo.icon
    const isInProgress = IN_PROGRESS.includes(deployment.status)
    const hasFailed = deployment.status === 'FAILED'

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-5 space-y-6  ">

                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/projects/${deployment.project.id}`)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{deployment.project.name}</h1>
                            <span className="text-sm text-muted-foreground font-mono">#{deployment.id.slice(0, 8)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Status badge */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${statusInfo.badge}`}>
                            <StatusIcon className={`h-4 w-4 ${statusInfo.pulse ? 'animate-spin' : ''}`} />
                            {statusInfo.label}
                        </div>

                        {/* Chat with AI — shown when failed */}
                        {hasFailed && (
                            <Button
                                onClick={() => setShowAssistant(true)}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white gap-2"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Chat with AI
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.location.reload()}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left column — main content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* ── Success banner ── */}
                        {deployment.status === 'SUCCESS' && deployment.url && (
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-300">Deployment Live</p>
                                        <code className="text-xs text-slate-400 font-mono">{deployment.url}</code>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => window.open(deployment.url!, '_blank')}
                                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-2 shrink-0">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Open
                                </Button>
                            </div>
                        )}

                        {/* ── Meta cards ── */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Card className="shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                        <GitBranch className="h-3.5 w-3.5" /> Branch
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-base font-semibold text-foreground">{deployment.branch}</p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                        <GitCommit className="h-3.5 w-3.5" /> Commit
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm font-mono text-foreground">{deployment.commitSha.slice(0, 8)}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{deployment.commitMessage}</p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" /> Build Time
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-base font-semibold text-foreground">
                                        {deployment.buildTime ? `${deployment.buildTime}s` : isInProgress ? '...' : '-'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ── Build Logs ── */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Terminal className="h-4 w-4 text-muted-foreground" />
                                        Build Logs
                                        {isInProgress && (
                                            <span className="flex items-center gap-1 text-xs text-amber-500">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                Live
                                            </span>
                                        )}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setLogsExpanded(!logsExpanded)}
                                        className="text-muted-foreground h-7 px-2 gap-1 text-xs"
                                    >
                                        {logsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        {logsExpanded ? 'Collapse' : 'Expand'}
                                    </Button>
                                </div>
                            </CardHeader>
                            {logsExpanded && (
                                <CardContent>
                                    <div className="bg-zinc-950 rounded-lg border p-4 font-mono text-xs text-emerald-400 max-h-[500px] overflow-y-auto shadow-inner">
                                        {deployment.buildLogs ? (
                                            <>
                                                <pre className="whitespace-pre-wrap leading-relaxed">{deployment.buildLogs}</pre>
                                                <div ref={logsEndRef} />
                                            </>
                                        ) : (
                                            <p className="text-zinc-500">No logs yet...</p>
                                        )}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </div>

                    {/* Right column — sidebar */}
                    <div className="space-y-6">

                        {/* ── Deployment metadata ── */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {[
                                    { label: 'Deployment ID', value: deployment.id.slice(0, 12) + '…', mono: true },
                                    { label: 'Created', value: new Date(deployment.createdAt).toLocaleString() },
                                    { label: 'Deployed At', value: deployment.deployedAt ? new Date(deployment.deployedAt).toLocaleString() : '-' },
                                ].map(item => (
                                    <div key={item.label} className="flex justify-between gap-2">
                                        <span className="text-muted-foreground shrink-0">{item.label}</span>
                                        <span className={`text-foreground text-right truncate ${item.mono ? 'font-mono text-xs' : ''}`}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* ── Failed action card ── */}
                        {hasFailed && (
                            <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-4 space-y-3">
                                <p className="text-xs font-semibold text-red-500 uppercase tracking-wide flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Deployment Failed
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Check the build logs for error details. You can chat with the AI assistant to understand the error and get suggestions for a fix.
                                </p>
                                <Button
                                    onClick={() => setShowAssistant(true)}
                                    size="sm"
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white gap-2"
                                >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    Chat with AI
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── AI Chat Panel (overlay) ── */}
            {showAssistant && (
                <AIAssistantPanel
                    deploymentId={deploymentId}
                    projectName={deployment.project.name}
                    buildLogs={deployment.buildLogs || ''}
                    onClose={() => setShowAssistant(false)}
                />
            )}
        </DashboardLayout>
    )
}
