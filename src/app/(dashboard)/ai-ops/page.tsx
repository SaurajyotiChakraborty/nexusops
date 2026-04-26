'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useApi } from '@/lib/api'
import {
    Sparkles, Shield, ShieldAlert, AlertTriangle, Info, CheckCircle2,
    RefreshCw, Server, Container, Globe, Settings, Clock, Bot, Loader2,
    Activity, DollarSign, Zap, Radio, Eye, Lightbulb, ArrowRight
} from 'lucide-react'

interface SecurityFinding {
    id: string
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    category: 'container' | 'network' | 'dependencies' | 'configuration' | 'runtime'
    title: string
    description: string
    impact: string
    suggestion: string
    affectedService: string
    detectedAt: string
}

interface SecurityScanResult {
    projectId: string
    projectName?: string
    deploymentStatus?: string
    scanStatus?: string
    scannedAt: string
    totalFindings: number
    criticalCount: number
    highCount: number
    mediumCount: number
    lowCount: number
    overallRisk: 'low' | 'medium' | 'high' | 'critical'
    findings: SecurityFinding[]
    aiSummary?: string
    error?: string
}

interface AIRecommendation {
    id: string
    type: string
    title: string
    description: string
    explanation: string
    riskLevel: string
    suggestedAction: string
    confidenceScore: number
    projectName?: string
    projectId?: string
}

const riskColors: Record<string, { text: string; bg: string; border: string; glow: string }> = {
    critical: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/40', glow: 'shadow-red-500/20' },
    high: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/40', glow: 'shadow-orange-500/20' },
    medium: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/40', glow: 'shadow-amber-500/20' },
    low: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/40', glow: 'shadow-blue-500/20' },
}

const riskIcons: Record<string, any> = { critical: ShieldAlert, high: AlertTriangle, medium: Info, low: Shield }

const typeIcons: Record<string, any> = {
    DOWNTIME_PREVENTION: ShieldAlert, COST_OPTIMIZATION: DollarSign,
    PERFORMANCE: Zap, SCALING: Activity, SECURITY: Shield,
}

const catIcons: Record<string, any> = {
    container: Container, network: Globe, configuration: Settings, runtime: Clock,
}

export default function AIOpsPage() {
    const api = useApi()
    const [scans, setScans] = useState<SecurityScanResult[]>([])
    const [recs, setRecs] = useState<AIRecommendation[]>([])
    const [scanLoading, setScanLoading] = useState(true)
    const [recsLoading, setRecsLoading] = useState(true)
    const [scanning, setScanning] = useState(false)
    const [scanProgress, setScanProgress] = useState(0)
    const [visibleFindings, setVisibleFindings] = useState<SecurityFinding[]>([])
    const [visibleRecs, setVisibleRecs] = useState<AIRecommendation[]>([])
    const [selectedFinding, setSelectedFinding] = useState<string | null>(null)
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const streamTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)


    // Deduplicate findings across multiple scans by prefixing with projectId
    const dedupeFindings = (scanArr: SecurityScanResult[]) => {
        return scanArr.flatMap(sc =>
            (sc.findings || []).map((f, i) => ({
                ...f,
                id: `${sc.projectId}-${f.id}-${i}`,
            }))
        )
    }

    const fetchBoth = useCallback(async (stream = false) => {
        setScanLoading(true)
        setRecsLoading(true)

        // Fetch scans and recs INDEPENDENTLY — don't block on slow Gemini calls
        // Scans first (fast)
        api.get<SecurityScanResult[]>('/ai-ops/security/scan').then(scanData => {
            const s = Array.isArray(scanData) ? scanData : []
            setScans(s)
            const allFindings = dedupeFindings(s)
            if (stream) {
                setVisibleFindings([])
                // Stream findings in one by one
                allFindings.forEach((f, i) => {
                    setTimeout(() => {
                        setVisibleFindings(prev => [...prev, f])
                        setScanProgress(Math.round(((i + 1) / allFindings.length) * 60))
                    }, 200 * (i + 1))
                })
                if (allFindings.length === 0) setScanProgress(60)
            } else {
                setVisibleFindings(allFindings)
                setScanProgress(60)
            }
            setScanLoading(false)

            // Poll if still scanning
            const hasScanning = s.some((sc: any) => sc.scanStatus === 'scanning')
            if (hasScanning && !pollRef.current) {
                pollRef.current = setInterval(async () => {
                    try {
                        const fresh = await api.get<SecurityScanResult[]>('/ai-ops/security/scan')
                        if (Array.isArray(fresh)) {
                            setScans(fresh)
                            setVisibleFindings(dedupeFindings(fresh))
                            if (!fresh.some((sc: any) => sc.scanStatus === 'scanning') && pollRef.current) {
                                clearInterval(pollRef.current)
                                pollRef.current = null
                            }
                        }
                    } catch { }
                }, 4000)
            }
        }).catch(() => { setScanLoading(false) })

        // Recommendations in parallel (may be slow due to Gemini)
        api.get<AIRecommendation[]>('/ai-ops/recommendations').then(recsData => {
            const r = Array.isArray(recsData) ? recsData : []
            setRecs(r)
            if (stream) {
                setVisibleRecs([])
                r.forEach((rec, i) => {
                    setTimeout(() => {
                        setVisibleRecs(prev => [...prev, rec])
                        setScanProgress(prev => Math.min(prev + Math.round(40 / Math.max(r.length, 1)), 100))
                    }, 300 * (i + 1))
                })
                if (r.length === 0) setScanProgress(100)
            } else {
                setVisibleRecs(r)
                setScanProgress(100)
            }
            setRecsLoading(false)
            setScanning(false)
        }).catch(() => {
            setRecsLoading(false)
            setScanProgress(100)
            setScanning(false)
        })
    }, [api])

    const runScan = useCallback(async () => {
        setScanning(true)
        setScanProgress(0)
        setVisibleFindings([])
        setVisibleRecs([])
        await fetchBoth(true)
    }, [fetchBoth])

    useEffect(() => {
        fetchBoth(false)
        return () => {
            if (pollRef.current) clearInterval(pollRef.current)
            if (streamTimerRef.current) clearTimeout(streamTimerRef.current)
        }
    }, [])

    // Stats
    const totalFindings = visibleFindings.length
    const criticalCount = visibleFindings.filter(f => f.riskLevel === 'critical').length
    const highCount = visibleFindings.filter(f => f.riskLevel === 'high').length
    const mediumCount = visibleFindings.filter(f => f.riskLevel === 'medium').length
    const lowCount = visibleFindings.filter(f => f.riskLevel === 'low').length
    const overallRisk = criticalCount > 0 ? 'critical' : highCount > 0 ? 'high' : mediumCount > 0 ? 'medium' : 'low'
    const isLoading = scanLoading && recsLoading

    // Match findings to recommendations by risk level color tag
    const getMatchColor = (riskLevel: string) => {
        const r = riskLevel?.toLowerCase()
        return riskColors[r] || riskColors.low
    }

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto pb-1 space-y-5">
                {/* ── Header + Progress Bar ── */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="relative">
                                <span className="bg-gradient-to-br from-ai-accent to-purple-600 w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shadow-ai-accent/30">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </span>
                                {scanning && (
                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />
                                )}
                            </span>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">AI Ops Intelligence</h1>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {scanning ? 'Analyzing your infrastructure in real-time...' : 'Parallel security scanning & AI recommendations'}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={runScan}
                            disabled={isLoading || scanning}
                            className="gap-2 bg-gradient-to-r from-ai-accent to-purple-600 hover:from-ai-accent/90 hover:to-purple-600/90 text-white shadow-lg shadow-ai-accent/20 px-6"
                        >
                            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            {scanning ? 'Scanning...' : 'Run Scan'}
                        </Button>
                    </div>

                    {/* Live Progress Bar */}
                    <div className="relative h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                            style={{
                                width: `${scanProgress}%`,
                                background: scanning
                                    ? 'linear-gradient(90deg, oklch(0.55 0.20 280), oklch(0.65 0.25 290), oklch(0.70 0.15 195))'
                                    : scanProgress === 100 ? 'oklch(0.55 0.15 145)' : 'oklch(0.55 0.20 280)',
                            }}
                        />
                        {scanning && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]" />
                        )}
                    </div>
                </div>

                {/* ── Live Stats Bar ── */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <StatCard label="Total Issues" value={totalFindings} color={totalFindings > 0 ? riskColors[overallRisk].text : 'text-emerald-400'} icon={<Eye className="w-4 h-4" />} pulse={scanning} />
                    <StatCard label="Critical" value={criticalCount} color="text-red-400" icon={<ShieldAlert className="w-4 h-4" />} pulse={scanning && criticalCount > 0} />
                    <StatCard label="High" value={highCount} color="text-orange-400" icon={<AlertTriangle className="w-4 h-4" />} />
                    <StatCard label="Medium" value={mediumCount} color="text-amber-400" icon={<Info className="w-4 h-4" />} />
                    <StatCard label="AI Insights" value={visibleRecs.length} color="text-ai-accent" icon={<Sparkles className="w-4 h-4" />} pulse={scanning} />
                </div>

                {/* ── Split Screen: Security | Recommendations ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ minHeight: 500 }}>
                    {/* LEFT: Security Findings */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-5 h-5 text-ai-accent" />
                            <h2 className="text-lg font-bold">Security Insights</h2>
                            {scanning && <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium"><Radio className="w-3 h-3 animate-pulse" /> Live</span>}
                        </div>

                        <div className="space-y-3 h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
                            {isLoading && visibleFindings.length === 0 ? (
                                <ScanPlaceholder />
                            ) : visibleFindings.length === 0 && !scanning ? (
                                <Card className="border-dashed border-emerald-500/30 bg-emerald-500/5 h-full min-h-[400px] flex items-center justify-center">
                                    <CardContent className="flex flex-col items-center gap-4 p-8 text-emerald-400 text-center">
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">All Clear</h4>
                                            <p className="text-sm opacity-80 mt-1 max-w-xs mx-auto">No security issues detected across your deployments.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : visibleFindings.length === 0 && scanning ? (
                                <Card className="border-dashed border-emerald-500/30 bg-emerald-500/5 h-full min-h-[400px] flex items-center justify-center overflow-hidden">
                                    <CardContent className="flex flex-col items-center gap-4 p-8 text-emerald-400 text-center relative">
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center relative">
                                            <Shield className="w-8 h-8 relative z-10" />
                                            <div className="absolute inset-0 border border-emerald-500/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                            <div className="absolute inset-0 border border-emerald-500/50 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '500ms' }} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg flex items-center justify-center gap-2">
                                                Scanning Infrastructure
                                                <span className="flex items-center gap-1 ml-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </span>
                                            </h4>
                                            <p className="text-sm opacity-80 mt-1 max-w-xs mx-auto">Analyzing configurations, dependencies, and network rules.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                visibleFindings.map((f, idx) => {
                                    const c = getMatchColor(f.riskLevel)
                                    const Icon = riskIcons[f.riskLevel] || Shield
                                    const CatIcon = catIcons[f.category] || Server
                                    const isSelected = selectedFinding === f.id
                                    const uniqueKey = `finding-${f.id}-${idx}`
                                    return (
                                        <Card
                                            key={uniqueKey}
                                            className={`cursor-pointer transition-all duration-300 border-l-4 ${c.border} ${isSelected ? `ring-1 ring-offset-1 ring-offset-background ${c.border} shadow-lg ${c.glow}` : 'hover:shadow-md'} animate-in slide-in-from-left-4 fade-in`}
                                            style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
                                            onClick={() => setSelectedFinding(isSelected ? null : f.id)}
                                        >
                                            <CardContent className="p-4 space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                                                            <Icon className={`w-3.5 h-3.5 ${c.text}`} />
                                                        </div>
                                                        <h4 className="font-semibold text-sm truncate">{f.title}</h4>
                                                    </div>
                                                    <Badge variant="outline" className={`${c.bg} ${c.text} ${c.border} text-[10px] uppercase shrink-0`}>
                                                        {f.riskLevel}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Server className="w-3 h-3" />{f.affectedService}</span>
                                                    <span className="flex items-center gap-1 capitalize"><CatIcon className="w-3 h-3" />{f.category}</span>
                                                </div>
                                                {isSelected && (
                                                    <div className="pt-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                        <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                                            <div className="border-l-2 border-red-500/40 pl-2">
                                                                <span className="text-[10px] font-semibold uppercase text-muted-foreground block mb-0.5">Impact</span>
                                                                <p className="text-[11px] text-foreground/80 leading-relaxed">{f.impact}</p>
                                                            </div>
                                                            <div className="border-l-2 border-ai-accent/40 pl-2">
                                                                <span className="text-[10px] font-semibold uppercase text-ai-accent block mb-0.5">Fix</span>
                                                                <p className="text-[11px] text-foreground/80 leading-relaxed">{f.suggestion}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )
                                })
                            )}
                            {scanning && visibleFindings.length > 0 && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2 pl-2">
                                    <Loader2 className="w-3 h-3 animate-spin text-ai-accent" />
                                    Scanning for more issues...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: AI Recommendations */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Bot className="w-5 h-5 text-ai-accent" />
                            <h2 className="text-lg font-bold">AI Recommendations</h2>
                            {scanning && <span className="flex items-center gap-1.5 text-xs text-ai-accent font-medium"><Loader2 className="w-3 h-3 animate-spin" /> Analyzing</span>}
                        </div>

                        <div className="space-y-3 h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
                            {isLoading && visibleRecs.length === 0 ? (
                                <RecsPlaceholder />
                            ) : visibleRecs.length === 0 && !scanning ? (
                                <Card className="border-dashed border-ai-accent/30 bg-ai-accent/5 h-full min-h-[400px] flex items-center justify-center">
                                    <CardContent className="flex flex-col items-center gap-4 p-8 text-ai-accent text-center">
                                        <div className="w-16 h-16 rounded-full bg-ai-accent/10 flex items-center justify-center">
                                            <Lightbulb className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">No Recommendations</h4>
                                            <p className="text-sm opacity-80 mt-1 max-w-xs mx-auto">Run a scan to generate AI-powered insights for your infrastructure.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : visibleRecs.length === 0 && scanning ? (
                                <Card className="border-dashed border-ai-accent/30 bg-ai-accent/5 h-full min-h-[400px] flex items-center justify-center overflow-hidden">
                                    <CardContent className="flex flex-col items-center gap-4 p-8 text-ai-accent text-center relative">
                                        <div className="w-16 h-16 rounded-full bg-ai-accent/10 flex items-center justify-center relative">
                                            <Bot className="w-8 h-8 relative z-10" />
                                            <div className="absolute inset-0 border border-ai-accent/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                            <div className="absolute inset-0 border border-ai-accent/50 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '500ms' }} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg flex items-center justify-center gap-2">
                                                Generating Insights
                                                <span className="flex items-center gap-1 ml-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-ai-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-1.5 h-1.5 rounded-full bg-ai-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-1.5 h-1.5 rounded-full bg-ai-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </span>
                                            </h4>
                                            <p className="text-sm opacity-80 mt-1 max-w-xs mx-auto">Our AI engine is currently analyzing your infrastructure for optimization opportunities.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                visibleRecs.map((rec, idx) => {
                                    const c = getMatchColor(rec.riskLevel)
                                    const TypeIcon = typeIcons[rec.type] || Sparkles
                                    return (
                                        <Card
                                            key={rec.id}
                                            className={`transition-all duration-300 border-l-4 ${c.border} hover:shadow-md animate-in slide-in-from-right-4 fade-in`}
                                            style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
                                        >
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className={`w-7 h-7 rounded-lg bg-ai-accent/10 flex items-center justify-center shrink-0`}>
                                                            <TypeIcon className="w-3.5 h-3.5 text-ai-accent" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-semibold text-sm truncate">{rec.title}</h4>
                                                            <span className="text-[10px] text-muted-foreground">{rec.projectName || 'System'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <Badge variant="outline" className={`${c.bg} ${c.text} ${c.border} text-[10px] uppercase`}>
                                                            {rec.riskLevel}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Confidence bar */}
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-ai-accent to-purple-500 transition-all duration-700"
                                                            style={{ width: `${Math.round(rec.confidenceScore * 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
                                                        {Math.round(rec.confidenceScore * 100)}%
                                                    </span>
                                                </div>

                                                <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>

                                                <div className="bg-muted/20 border border-border/50 rounded-lg p-2.5">
                                                    <span className="text-[10px] font-semibold uppercase text-ai-accent flex items-center gap-1 mb-1">
                                                        <Sparkles className="w-3 h-3" /> AI Analysis
                                                    </span>
                                                    <p className="text-[11px] text-foreground/70 leading-relaxed">{rec.explanation}</p>
                                                </div>

                                                <div className="flex items-start gap-2 bg-ai-accent/5 border border-ai-accent/20 rounded-lg p-2.5">
                                                    <ArrowRight className="w-3.5 h-3.5 text-ai-accent shrink-0 mt-0.5" />
                                                    <p className="text-[11px] text-foreground/80 leading-relaxed">{rec.suggestedAction}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })
                            )}
                            {scanning && visibleRecs.length > 0 && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2 pl-2">
                                    <Loader2 className="w-3 h-3 animate-spin text-ai-accent" />
                                    Generating more insights...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── AI Summary Banner ── */}
                {scans.some(s => s.aiSummary) && !scanning && (
                    <Card className="bg-gradient-to-r from-ai-accent/5 to-purple-500/5 border-ai-accent/20">
                        <CardContent className="p-5 flex gap-4">
                            <Bot className="w-7 h-7 text-ai-accent shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold mb-1 flex items-center gap-2">
                                    AI Security Briefing
                                    <Badge variant="outline" className="text-[10px] bg-ai-accent/10 text-ai-accent border-ai-accent/30">Gemini</Badge>
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {scans.find(s => s.aiSummary)?.aiSummary}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: oklch(0.4 0.02 264); border-radius: 4px; }
            `}</style>
        </DashboardLayout>
    )
}

function StatCard({ label, value, color, icon, pulse }: { label: string; value: number; color: string; icon: React.ReactNode; pulse?: boolean }) {
    return (
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-medium text-muted-foreground mb-0.5">{label}</p>
                    <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
                </div>
                <div className={`w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center ${color} ${pulse ? 'animate-pulse' : ''}`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}

function ScanPlaceholder() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <Card key={i} className="border-border/30">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-muted/50 animate-pulse" />
                            <div className="h-4 w-40 bg-muted/50 rounded animate-pulse" />
                        </div>
                        <div className="h-3 w-full bg-muted/30 rounded animate-pulse" />
                        <div className="h-3 w-3/4 bg-muted/30 rounded animate-pulse" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function RecsPlaceholder() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <Card key={i} className="border-border/30">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-ai-accent/10 animate-pulse" />
                            <div className="h-4 w-48 bg-muted/50 rounded animate-pulse" />
                        </div>
                        <div className="h-1.5 w-full bg-muted/30 rounded-full animate-pulse" />
                        <div className="h-3 w-full bg-muted/30 rounded animate-pulse" />
                        <div className="h-16 w-full bg-muted/20 rounded-lg animate-pulse" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
