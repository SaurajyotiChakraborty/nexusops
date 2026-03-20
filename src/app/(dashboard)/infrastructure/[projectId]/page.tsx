'use client'

import { useState, useEffect, useCallback, useRef, use } from 'react'
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
    ArrowLeft,
    Loader2,
    Server,
    Cpu,
    MemoryStick,
    Clock,
    Activity,
    Network,
    Globe,
    Lock,
    ExternalLink,
    RefreshCw,
    Terminal,
    Search,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Container,
    ChevronDown,
    ChevronUp,
    Wifi,
    Copy,
    Check,
    Sparkles,
    Lightbulb,
    Wrench,
    AlertCircle,
    ShieldAlert,
    Zap,
    Bot,
} from 'lucide-react'
import Link from 'next/link'

/* ============================================================
   Types
   ============================================================ */

interface ServiceData {
    id: string
    name: string
    type: string
    status: string
    health: string
    replicas: number
    port: number | null
    url: string | null
    uptime: number | null
    cpu: number
    memoryMB: number
    memoryLimitMB: number
    networkRx: number
    networkTx: number
}

interface ErrorAnalysis {
    errorTitle: string
    simpleExplanation: string
    suggestedFixes: string[]
    improvementTips: string[]
    severity: 'low' | 'medium' | 'high' | 'critical'
    category: string
    source: 'rules' | 'ai'
}

/* ============================================================
   Helpers
   ============================================================ */

function formatUptime(seconds: number | null | undefined): string {
    if (!seconds) return '—'
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (d > 0) return `${d}d ${h}h`
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getHealthColor(health: string | null | undefined): string {
    switch (health) {
        case 'healthy': return 'text-emerald-400'
        case 'running': return 'text-emerald-400'
        case 'unhealthy': return 'text-red-400'
        case 'stopped': return 'text-red-400'
        case 'failed': return 'text-red-400'
        case 'starting': return 'text-amber-400'
        case 'deploying': return 'text-blue-400'
        default: return 'text-muted-foreground'
    }
}

function getHealthBg(health: string | null | undefined): string {
    switch (health) {
        case 'healthy': case 'running': return 'bg-emerald-500/10 border-emerald-500/20'
        case 'unhealthy': case 'stopped': case 'failed': return 'bg-red-500/10 border-red-500/20'
        case 'starting': case 'deploying': return 'bg-amber-500/10 border-amber-500/20'
        default: return 'bg-muted/30 border-border/50'
    }
}

function getStatusConfig(status: string) {
    switch (status) {
        case 'SUCCESS': return { variant: 'success' as const, label: 'Running', icon: CheckCircle2 }
        case 'FAILED': return { variant: 'danger' as const, label: 'Failed', icon: XCircle }
        case 'BUILDING': case 'DEPLOYING': return { variant: 'info' as const, label: status, icon: Loader2 }
        default: return { variant: 'secondary' as const, label: status || 'Unknown', icon: Clock }
    }
}

function getSeverityConfig(severity: string) {
    switch (severity) {
        case 'critical': return { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: ShieldAlert, label: 'Critical' }
        case 'high': return { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: AlertCircle, label: 'High' }
        case 'medium': return { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: AlertTriangle, label: 'Medium' }
        default: return { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: Lightbulb, label: 'Low' }
    }
}

/* ============================================================
   Progress Bar component
   ============================================================ */

function MetricBar({ value, max, color, label, icon: Icon, unit }: {
    value: number; max: number; color: string; label: string; icon: any; unit: string
}) {
    const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0
    const barColor = percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-amber-500' : color
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                </span>
                <span className="font-semibold tabular-nums">
                    {typeof value === 'number' ? value.toFixed(1) : '0'}{unit}
                </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-muted/40 overflow-hidden relative">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                    style={{ width: `${percent}%` }}
                />
                {percent > 90 && (
                    <div className="absolute inset-0 rounded-full animate-pulse bg-red-500/20" />
                )}
            </div>
        </div>
    )
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
   Live Status Indicator
   ============================================================ */

function LiveIndicator({ isLive }: { isLive: boolean }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <div className="relative flex h-2.5 w-2.5">
                {isLive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLive ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
            </div>
            <span className={isLive ? 'text-emerald-400' : 'text-muted-foreground'}>
                {isLive ? 'Live' : 'Offline'}
            </span>
        </div>
    )
}

/* ============================================================
   AI Error Analysis Card
   ============================================================ */

function AIErrorCard({ analysis }: { analysis: ErrorAnalysis }) {
    const severityConfig = getSeverityConfig(analysis.severity)
    const SeverityIcon = severityConfig.icon

    return (
        <div className={`rounded-xl border-2 ${severityConfig.bg} overflow-hidden`}>
            {/* Header */}
            <div className="p-4 pb-3">
                <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg ${severityConfig.bg} flex items-center justify-center shrink-0`}>
                        <SeverityIcon className={`w-5 h-5 ${severityConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{analysis.errorTitle}</h4>
                            <Badge variant="outline" className={`${severityConfig.color} text-[10px] px-1.5`}>{severityConfig.label}</Badge>
                            {analysis.source === 'ai' && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 gap-0.5">
                                    <Bot className="w-3 h-3" />
                                    AI
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {analysis.simpleExplanation}
                        </p>
                    </div>
                </div>
            </div>

            {/* Suggested Fixes */}
            <div className="px-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">How to Fix</span>
                </div>
                <div className="space-y-1.5">
                    {analysis.suggestedFixes.map((fix, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-primary mt-0.5">
                                {i + 1}
                            </span>
                            <span className="text-foreground/80">{fix}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Improvement Tips */}
            {analysis.improvementTips?.length > 0 && (
                <div className="px-4 pb-4 pt-2 border-t border-border/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Tips</span>
                    </div>
                    <div className="space-y-1">
                        {analysis.improvementTips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <Sparkles className="w-3 h-3 mt-0.5 text-amber-400/60 shrink-0" />
                                <span>{tip}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

/* ============================================================
   Logs Panel
   ============================================================ */

function LogsPanel({ buildLogs, runtimeLogs }: { buildLogs: string | null; runtimeLogs?: string | null }) {
    const [search, setSearch] = useState('')
    const [expanded, setExpanded] = useState(false)
    const [filter, setFilter] = useState<'all' | 'error' | 'info'>('all')
    const [logType, setLogType] = useState<'build' | 'runtime'>('build')

    const currentLogs = logType === 'build' ? (buildLogs || 'No build logs available') : (runtimeLogs || 'No runtime logs available')
    const lines = currentLogs.split('\n').filter(Boolean)
    const filteredLines = lines.filter(line => {
        const matchesSearch = !search || line.toLowerCase().includes(search.toLowerCase())
        if (!matchesSearch) return false
        if (filter === 'error') return line.includes('❌') || line.toLowerCase().includes('error') || line.toLowerCase().includes('fail') || line.toLowerCase().includes('warn')
        if (filter === 'info') return line.includes('✓') || line.includes('✅') || line.toLowerCase().includes('success')
        return true
    })
    const displayLines = expanded ? filteredLines : filteredLines.slice(-30)

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                {/* Log type toggle */}
                <div className="flex gap-1 bg-muted/30 rounded-lg p-0.5">
                    <button
                        onClick={() => setLogType('build')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${logType === 'build' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}
                    >
                        Build Logs
                    </button>
                    <button
                        onClick={() => setLogType('runtime')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${logType === 'runtime' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}
                    >
                        Runtime Logs
                    </button>
                </div>

                <div className="relative flex-1 w-full sm:w-auto">
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
                    {(['all', 'error', 'info'] as const).map(f => (
                        <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} className="h-8 text-xs capitalize px-2" onClick={() => setFilter(f)}>
                            {f}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="bg-[#0d1117] rounded-xl p-4 font-mono text-xs leading-relaxed max-h-[450px] overflow-y-auto border border-border/10 shadow-inner">
                {displayLines.length === 0 ? (
                    <div className="text-muted-foreground/50 text-center py-8">No matching log lines</div>
                ) : (
                    displayLines.map((line, i) => (
                        <div
                            key={i}
                            className={`py-0.5 hover:bg-white/5 px-1 rounded ${
                                line.includes('❌') || line.toLowerCase().includes('error') || line.toLowerCase().includes('fail')
                                    ? 'text-red-400'
                                    : line.includes('✓') || line.includes('✅') || line.toLowerCase().includes('success')
                                    ? 'text-emerald-400'
                                    : line.includes('⚠') || line.toLowerCase().includes('warn')
                                    ? 'text-amber-400'
                                    : 'text-gray-400'
                            }`}
                        >
                            <span className="text-gray-600 mr-3 select-none inline-block w-8 text-right">{String(i + 1).padStart(3, ' ')}</span>
                            {line}
                        </div>
                    ))
                )}
            </div>

            {filteredLines.length > 30 && (
                <Button variant="ghost" size="sm" className="w-full text-xs gap-1" onClick={() => setExpanded(!expanded)}>
                    {expanded ? <><ChevronUp className="w-3 h-3" /> Show recent only</> : <><ChevronDown className="w-3 h-3" /> Show all {filteredLines.length} lines</>}
                </Button>
            )}
        </div>
    )
}

/* ============================================================
   Service Topology — SVG visualization
   ============================================================ */

function ServiceTopology({ services, projectName }: { services: ServiceData[]; projectName: string }) {
    if (!services || services.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p className="text-sm">No services to visualize</p>
            </div>
        )
    }

    const width = 700
    const height = 320
    const centerX = width / 2

    const ingressNode = { x: centerX, y: 50, label: 'Ingress / Nginx', type: 'ingress' }
    const serviceNodes = services.map((svc, i) => {
        const angle = services.length === 1 ? Math.PI / 2 : (Math.PI / (services.length + 1)) * (i + 1)
        return {
            x: centerX + (services.length === 1 ? 0 : Math.cos(angle - Math.PI / 2) * 180),
            y: 170,
            label: svc.name || `Service ${i + 1}`,
            type: svc.type?.toLowerCase() || 'web',
            health: svc.health,
            port: svc.port,
            status: svc.status,
        }
    })

    const getNodeColor = (type: string, health?: string) => {
        if (health === 'unhealthy' || health === 'failed' || health === 'stopped') return '#ef4444'
        if (health === 'starting' || health === 'deploying') return '#f59e0b'
        switch (type) {
            case 'ingress': return '#8b5cf6'
            case 'web': return '#06b6d4'
            case 'api': return '#3b82f6'
            case 'database': return '#f59e0b'
            case 'worker': return '#10b981'
            case 'cache': return '#ec4899'
            default: return '#06b6d4'
        }
    }

    const getNodeIcon = (type: string) => {
        switch (type) {
            case 'ingress': return '🌐'
            case 'web': return '🖥️'
            case 'api': return '⚡'
            case 'database': return '🗄️'
            case 'worker': return '⚙️'
            case 'cache': return '💾'
            default: return '📦'
        }
    }

    return (
        <div className="relative w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 400, maxHeight: 320 }}>
                <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="currentColor" className="text-muted-foreground/40" />
                    </marker>
                </defs>

                {serviceNodes.map((node, i) => (
                    <line key={`edge-${i}`} x1={ingressNode.x} y1={ingressNode.y + 25} x2={node.x} y2={node.y - 25}
                        stroke="currentColor" className="text-muted-foreground/20" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#arrowhead)" />
                ))}

                <g>
                    <circle cx={ingressNode.x} cy={ingressNode.y} r="28" fill={getNodeColor('ingress')} fillOpacity="0.15" stroke={getNodeColor('ingress')} strokeWidth="2" />
                    <text x={ingressNode.x} y={ingressNode.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="18">{getNodeIcon('ingress')}</text>
                    <text x={ingressNode.x} y={ingressNode.y + 44} textAnchor="middle" fontSize="11" fill="currentColor" className="text-muted-foreground">{ingressNode.label}</text>
                </g>

                {serviceNodes.map((node, i) => (
                    <g key={`node-${i}`}>
                        {(node.health === 'healthy' || node.health === 'running') && (
                            <circle cx={node.x} cy={node.y} r="30" fill={getNodeColor(node.type, node.health)} fillOpacity="0.08">
                                <animate attributeName="r" from="30" to="42" dur="2s" repeatCount="indefinite" />
                                <animate attributeName="fillOpacity" from="0.08" to="0" dur="2s" repeatCount="indefinite" />
                            </circle>
                        )}
                        <circle cx={node.x} cy={node.y} r="28" fill={getNodeColor(node.type, node.health)} fillOpacity="0.15" stroke={getNodeColor(node.type, node.health)} strokeWidth="2" />
                        <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="18">{getNodeIcon(node.type)}</text>
                        <text x={node.x} y={node.y + 44} textAnchor="middle" fontSize="10" fill="currentColor" className="text-foreground">
                            {node.label.length > 20 ? node.label.slice(0, 18) + '…' : node.label}
                        </text>
                        {node.port && <text x={node.x} y={node.y + 58} textAnchor="middle" fontSize="9" fill="currentColor" className="text-muted-foreground">:{node.port}</text>}
                        <circle cx={node.x + 20} cy={node.y - 20} r="5"
                            fill={node.health === 'healthy' || node.health === 'running' ? '#10b981' : node.health === 'unhealthy' || node.health === 'failed' ? '#ef4444' : '#f59e0b'} />
                    </g>
                ))}

                <text x={width / 2} y={height - 10} textAnchor="middle" fontSize="11" fill="currentColor" className="text-muted-foreground/50">
                    {projectName} — Service Topology
                </text>
            </svg>
        </div>
    )
}

/* ============================================================
   Main Page
   ============================================================ */

export default function InfrastructureDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
    const resolvedParams = use(params)
    const { isLoaded, isSignedIn } = useAuth()
    const api = useApi()
    const [project, setProject] = useState<any>(null)
    const [deployment, setDeployment] = useState<any>(null)
    const [services, setServices] = useState<ServiceData[]>([])
    const [errorAnalysis, setErrorAnalysis] = useState<Record<string, ErrorAnalysis>>({})
    const [analysisLoading, setAnalysisLoading] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState(true)
    const [isLive, setIsLive] = useState(false)
    const [activeTab, setActiveTab] = useState<'topology' | 'status' | 'network' | 'health' | 'logs'>('status')
    const pollRef = useRef<NodeJS.Timeout | null>(null)
    const [lastUpdate, setLastUpdate] = useState<string>('')

    // Synthesize services from deployment data
    const synthesizeServices = useCallback((deploy: any): ServiceData[] => {
        const rawServices = deploy?.services || []
        if (rawServices.length > 0) {
            return rawServices.map((svc: any) => ({
                id: svc.id,
                name: svc.name,
                type: svc.type || 'WEB',
                status: svc.status || (deploy.status === 'SUCCESS' ? 'RUNNING' : 'STOPPED'),
                health: svc.health || (deploy.status === 'SUCCESS' ? 'healthy' : deploy.status === 'FAILED' ? 'unhealthy' : 'starting'),
                replicas: svc.replicas || 1,
                port: svc.port || 3000,
                url: svc.url || deploy.url,
                uptime: svc.uptime || null,
                cpu: 0,
                memoryMB: 0,
                memoryLimitMB: 512,
                networkRx: 0,
                networkTx: 0,
            }))
        }

        if (!deploy) return []

        return [{
            id: deploy.id,
            name: deploy.serviceName || `${(project?.name || 'app').toLowerCase().replace(/[^a-z0-9-]/g, '-')}-web`,
            type: 'WEB',
            status: deploy.status === 'SUCCESS' ? 'RUNNING' : deploy.status === 'FAILED' ? 'STOPPED' : 'STARTING',
            health: deploy.status === 'SUCCESS' ? 'healthy' : deploy.status === 'FAILED' ? 'unhealthy' : 'starting',
            replicas: deploy.replicas || 1,
            port: deploy.containerPort || 3000,
            url: deploy.url,
            uptime: deploy.deployedAt ? Math.floor((Date.now() - new Date(deploy.deployedAt).getTime()) / 1000) : null,
            cpu: 0,
            memoryMB: 0,
            memoryLimitMB: 512,
            networkRx: 0,
            networkTx: 0,
        }]
    }, [project?.name])

    // Load initial data
    const loadData = useCallback(async () => {
        try {
            const [projectData, deploymentsData] = await Promise.all([
                api.get<any>(`/projects/${resolvedParams.projectId}`),
                api.get<any[]>(`/deployments/project/${resolvedParams.projectId}`),
            ])
            setProject(projectData)

            const latestDeploy = deploymentsData?.[0]
            setDeployment(latestDeploy)
            setServices(synthesizeServices(latestDeploy))

            // Auto-analyze if failed
            if (latestDeploy?.status === 'FAILED' && !errorAnalysis[latestDeploy.id]) {
                analyzeError(latestDeploy.id)
            }
        } catch (error) {
            console.error('Failed to load infrastructure data:', error)
        } finally {
            setLoading(false)
        }
    }, [api, resolvedParams.projectId, synthesizeServices])

    // AI Error Analysis
    const analyzeError = useCallback(async (deploymentId: string) => {
        setAnalysisLoading(prev => ({ ...prev, [deploymentId]: true }))
        try {
            const result = await api.get<any>(`/infrastructure/analyze-error/${deploymentId}`)
            if (result?.analysis) {
                setErrorAnalysis(prev => ({ ...prev, [deploymentId]: result.analysis }))
            }
        } catch (error) {
            console.error('Error analysis failed:', error)
        } finally {
            setAnalysisLoading(prev => ({ ...prev, [deploymentId]: false }))
        }
    }, [api])

    // Polling for live metrics (every 5s)
    useEffect(() => {
        if (!isLoaded || !isSignedIn || !deployment) return

        const poll = async () => {
            try {
                const data = await api.get<any>(`/infrastructure/metrics/${resolvedParams.projectId}`)
                if (data?.live) {
                    setServices(prev => prev.map(svc => {
                        const live = data.live[svc.name]?.[0]
                        if (live) {
                            return {
                                ...svc,
                                cpu: live.cpuPercent || 0,
                                memoryMB: live.memoryUsageMB || 0,
                                memoryLimitMB: live.memoryLimitMB || 512,
                                networkRx: live.networkRxBytes || 0,
                                networkTx: live.networkTxBytes || 0,
                            }
                        }
                        return svc
                    }))
                    setIsLive(true)
                    setLastUpdate(new Date().toLocaleTimeString())
                }
            } catch {
                setIsLive(false)
            }
        }

        poll() // Initial poll
        pollRef.current = setInterval(poll, 5000)

        return () => {
            if (pollRef.current) clearInterval(pollRef.current)
        }
    }, [isLoaded, isSignedIn, deployment, api, resolvedParams.projectId])

    // Initial load
    useEffect(() => {
        if (isLoaded && isSignedIn) loadData()
    }, [isLoaded, isSignedIn, loadData])

    if (!isLoaded || loading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading infrastructure details...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!project) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center flex-col gap-3">
                    <AlertTriangle className="w-8 h-8 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Project not found</p>
                    <Link href="/infrastructure">
                        <Button variant="outline" size="sm" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    const statusConfig = getStatusConfig(deployment?.status || '')
    const StatusIcon = statusConfig.icon

    const tabs = [
        { id: 'topology' as const, label: 'Topology', icon: Network },
        { id: 'status' as const, label: 'Services', icon: Server },
        { id: 'network' as const, label: 'Networking', icon: Globe },
        { id: 'health' as const, label: 'Health', icon: Activity },
        { id: 'logs' as const, label: 'Logs', icon: Terminal },
    ]

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 px-4">
                    <div className="flex items-center gap-3">
                        <Link href="/infrastructure">
                            <Button variant="ghost" size="icon" className="shrink-0"><ArrowLeft className="w-4 h-4" /></Button>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold truncate">{project.name}</h1>
                                <Badge variant={statusConfig.variant} className="gap-1 shrink-0">
                                    <StatusIcon className={`w-3 h-3 ${deployment?.status === 'BUILDING' || deployment?.status === 'DEPLOYING' ? 'animate-spin' : ''}`} />
                                    {statusConfig.label}
                                </Badge>
                                <LiveIndicator isLive={isLive} />
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {project.framework || 'Unknown'} · {services.length} service{services.length !== 1 ? 's' : ''}
                                {deployment?.url && (
                                    <> · <a href={deployment.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">{deployment.url} <ExternalLink className="w-3 h-3" /></a></>
                                )}
                                {lastUpdate && <> · Updated {lastUpdate}</>}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => { setLoading(true); loadData() }}>
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </Button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Container className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Replicas</p>
                                <p className="font-semibold">{deployment?.replicas || 1}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                <Cpu className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">CPU Limit</p>
                                <p className="font-semibold">{deployment?.cpuLimit || '0.5'} cores</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <MemoryStick className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Memory</p>
                                <p className="font-semibold">{deployment?.memoryLimit || '512m'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Build Time</p>
                                <p className="font-semibold">{deployment?.buildTime ? `${deployment.buildTime}s` : '—'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Global Error Banner (if deployment failed) */}
                    {deployment?.status === 'FAILED' && (
                        <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                    <XCircle className="w-5 h-5 text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-red-400">Deployment Failed</h3>
                                    <p className="text-sm text-muted-foreground">Check the Services tab for AI-powered error analysis</p>
                                </div>
                                {!errorAnalysis[deployment.id] && !analysisLoading[deployment.id] && (
                                    <Button size="sm" variant="outline" className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => analyzeError(deployment.id)}>
                                        <Bot className="w-4 h-4" />
                                        Analyze Error
                                    </Button>
                                )}
                                {analysisLoading[deployment.id] && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Analyzing...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 px-4 overflow-x-auto">
                    {tabs.map(tab => {
                        const TabIcon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }`}
                            >
                                <TabIcon className="w-4 h-4" />
                                {tab.label}
                                {tab.id === 'status' && deployment?.status === 'FAILED' && (
                                    <span className="w-2 h-2 rounded-full bg-red-500 ml-1" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Tab Content */}
                <div className="px-4 pb-8">
                    {/* ── Topology ─── */}
                    {activeTab === 'topology' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Network className="w-5 h-5 text-primary" />
                                    Service Topology
                                </CardTitle>
                                <CardDescription>Visual overview of service connections and data flow</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ServiceTopology services={services} projectName={project.name} />
                                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/30">
                                    {[
                                        { color: 'bg-emerald-500', label: 'Healthy' },
                                        { color: 'bg-amber-500', label: 'Starting' },
                                        { color: 'bg-red-500', label: 'Unhealthy' },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ── Service Status (MAIN FEATURE) ─── */}
                    {activeTab === 'status' && (
                        <div className="space-y-4">
                            {/* AI Error Analysis */}
                            {deployment?.status === 'FAILED' && (
                                <div className="space-y-4">
                                    {errorAnalysis[deployment.id] ? (
                                        <AIErrorCard analysis={errorAnalysis[deployment.id]} />
                                    ) : (
                                        <Card className="border-red-500/20 border-2 border-dashed">
                                            <CardContent className="flex flex-col items-center justify-center py-8">
                                                <Bot className="w-10 h-10 text-red-400/40 mb-3" />
                                                <h3 className="font-semibold text-sm mb-1">Error Detected</h3>
                                                <p className="text-xs text-muted-foreground text-center max-w-sm mb-3">
                                                    Let AI analyze the logs and explain what went wrong in plain English
                                                </p>
                                                <Button
                                                    size="sm"
                                                    className="gap-2"
                                                    onClick={() => analyzeError(deployment.id)}
                                                    disabled={analysisLoading[deployment.id]}
                                                >
                                                    {analysisLoading[deployment.id] ? (
                                                        <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                                                    ) : (
                                                        <><Sparkles className="w-4 h-4" /> Analyze with AI</>
                                                    )}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}

                            {/* Service Cards */}
                            {services.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <Server className="w-10 h-10 text-muted-foreground/30 mb-3" />
                                        <p className="text-sm text-muted-foreground">No services deployed yet</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                services.map((svc) => (
                                    <Card key={svc.id} className={`border-2 transition-all duration-300 ${getHealthBg(svc.health)} hover:shadow-lg`}>
                                        {/* Status bar */}
                                        <div className={`h-1 ${
                                            svc.health === 'healthy' || svc.health === 'running' ? 'bg-emerald-500' :
                                            svc.health === 'unhealthy' || svc.health === 'failed' || svc.health === 'stopped' ? 'bg-red-500' :
                                            'bg-amber-500'
                                        }`} />

                                        <CardContent className="p-5">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                {/* Service info */}
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getHealthBg(svc.health)} relative`}>
                                                        <Server className={`w-6 h-6 ${getHealthColor(svc.health)}`} />
                                                        {/* Pulse dot */}
                                                        <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                                                            svc.health === 'healthy' || svc.health === 'running' ? 'bg-emerald-500' :
                                                            svc.health === 'unhealthy' || svc.health === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                                                        }`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-base truncate">{svc.name}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{svc.type}</Badge>
                                                            <span>·</span>
                                                            <span>{svc.replicas || 1} replica{(svc.replicas || 1) > 1 ? 's' : ''}</span>
                                                            <span>·</span>
                                                            <span className={`font-medium ${getHealthColor(svc.health)}`}>{svc.health || 'unknown'}</span>
                                                            {svc.port && (
                                                                <>
                                                                    <span>·</span>
                                                                    <span className="text-muted-foreground">:{svc.port}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Resource Metrics */}
                                                <div className="grid grid-cols-2 gap-4 lg:w-72 shrink-0">
                                                    <MetricBar
                                                        value={svc.cpu}
                                                        max={100}
                                                        color="bg-cyan-500"
                                                        label="CPU"
                                                        icon={Cpu}
                                                        unit="%"
                                                    />
                                                    <MetricBar
                                                        value={svc.memoryMB}
                                                        max={svc.memoryLimitMB}
                                                        color="bg-purple-500"
                                                        label="MEM"
                                                        icon={MemoryStick}
                                                        unit=" MB"
                                                    />
                                                </div>

                                                {/* Network + Uptime */}
                                                <div className="flex items-center gap-6 lg:gap-4 shrink-0">
                                                    <div className="text-center min-w-[60px]">
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Network</p>
                                                        <p className="font-semibold text-xs mt-0.5">
                                                            ↑{formatBytes(svc.networkTx)} ↓{formatBytes(svc.networkRx)}
                                                        </p>
                                                    </div>
                                                    <div className="text-center min-w-[50px]">
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Uptime</p>
                                                        <p className="font-semibold text-sm mt-0.5">{formatUptime(svc.uptime)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    {/* ── Networking ─── */}
                    {activeTab === 'network' && (
                        <div className="space-y-4">
                            {deployment?.url && (
                                <Card>
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                                <Globe className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Public URL</p>
                                                <a href={deployment.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 truncate">
                                                    {deployment.url} <ExternalLink className="w-3 h-3 shrink-0" />
                                                </a>
                                            </div>
                                            <CopyButton text={deployment.url} />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Wifi className="w-5 h-5 text-primary" />
                                        Service Endpoints
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {services.length > 0 ? (
                                        <div className="divide-y divide-border/30">
                                            {services.map((svc) => (
                                                <div key={svc.id} className="py-3 first:pt-0 last:pb-0">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Server className="w-4 h-4 text-muted-foreground" />
                                                            <div>
                                                                <p className="text-sm font-medium">{svc.name}</p>
                                                                <p className="text-xs text-muted-foreground">{svc.type}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {svc.port && (
                                                                <div className="flex items-center gap-1">
                                                                    <Badge variant="secondary" className="text-xs gap-1">
                                                                        <Globe className="w-3 h-3" />
                                                                        :{svc.port}
                                                                    </Badge>
                                                                    <span className="text-[10px] text-muted-foreground">External</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-1">
                                                                <Badge variant="outline" className="text-xs gap-1">
                                                                    <Lock className="w-3 h-3" />
                                                                    :3000
                                                                </Badge>
                                                                <span className="text-[10px] text-muted-foreground">Internal</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {svc.url && (
                                                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground pl-7">
                                                            <Globe className="w-3 h-3" />
                                                            <a href={svc.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{svc.url}</a>
                                                            <CopyButton text={svc.url} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground text-sm">No endpoints available</div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* ── Health Monitoring ─── */}
                    {activeTab === 'health' && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-primary" />
                                        Health Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <div className="flex flex-col items-center p-4 rounded-xl bg-muted/20 border border-border/30">
                                            <div className={`text-4xl font-bold ${
                                                services.every(s => s.health === 'healthy' || s.health === 'running') ? 'text-emerald-400' :
                                                services.some(s => s.health === 'unhealthy' || s.health === 'failed') ? 'text-red-400' : 'text-amber-400'
                                            }`}>
                                                {services.length > 0
                                                    ? Math.round((services.filter(s => s.health === 'healthy' || s.health === 'running').length / services.length) * 100)
                                                    : 0}%
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Health Score</p>
                                        </div>
                                        <div className="flex flex-col items-center p-4 rounded-xl bg-muted/20 border border-border/30">
                                            <div className="text-4xl font-bold text-blue-400">{deployment?.buildTime || '—'}</div>
                                            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Build Time (s)</p>
                                        </div>
                                        <div className="flex flex-col items-center p-4 rounded-xl bg-muted/20 border border-border/30">
                                            <div className="text-4xl font-bold text-emerald-400">
                                                {deployment?.status === 'SUCCESS' ? '0%' : deployment?.status === 'FAILED' ? '100%' : '—'}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Error Rate</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {services.map((svc) => (
                                <Card key={svc.id} className="overflow-hidden">
                                    <div className={`h-1 ${
                                        svc.health === 'healthy' || svc.health === 'running' ? 'bg-emerald-500' :
                                        svc.health === 'unhealthy' || svc.health === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                                    }`} />
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {svc.health === 'healthy' || svc.health === 'running'
                                                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                    : svc.health === 'unhealthy' || svc.health === 'failed'
                                                    ? <XCircle className="w-5 h-5 text-red-400" />
                                                    : <AlertTriangle className="w-5 h-5 text-amber-400" />
                                                }
                                                <div>
                                                    <p className="font-medium">{svc.name}</p>
                                                    <p className={`text-xs capitalize ${getHealthColor(svc.health)}`}>{svc.health || 'unknown'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground">Uptime</p>
                                                    <p className="font-medium">{formatUptime(svc.uptime)}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground">Replicas</p>
                                                    <p className="font-medium">{svc.replicas}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground">CPU</p>
                                                    <p className="font-medium tabular-nums">{svc.cpu.toFixed(1)}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* ── Logs ─── */}
                    {activeTab === 'logs' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Terminal className="w-5 h-5 text-primary" />
                                    Deployment & Runtime Logs
                                </CardTitle>
                                <CardDescription>Build output and runtime logs for debugging</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <LogsPanel buildLogs={deployment?.buildLogs} />

                                {/* AI Analyze button for logs */}
                                {deployment?.status === 'FAILED' && !errorAnalysis[deployment.id] && (
                                    <div className="mt-4 pt-4 border-t border-border/30">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-2 w-full"
                                            onClick={() => analyzeError(deployment.id)}
                                            disabled={analysisLoading[deployment.id]}
                                        >
                                            {analysisLoading[deployment.id] ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing logs...</>
                                            ) : (
                                                <><Bot className="w-4 h-4" /> Analyze Logs with AI</>
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {deployment?.status === 'FAILED' && errorAnalysis[deployment.id] && (
                                    <div className="mt-4 pt-4 border-t border-border/30">
                                        <AIErrorCard analysis={errorAnalysis[deployment.id]} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
