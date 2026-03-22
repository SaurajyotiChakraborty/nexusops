'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useApi } from '@/lib/api'
import {
    Sparkles,
    Shield,
    ShieldAlert,
    AlertTriangle,
    Info,
    CheckCircle2,
    RefreshCw,
    Server,
    Container,
    Globe,
    Settings,
    Clock,
    Bot,
    Loader2
} from 'lucide-react'

// Types based on the backend interfaces
interface SecurityFinding {
    id: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    category: 'container' | 'network' | 'dependencies' | 'configuration' | 'runtime';
    title: string;
    description: string;
    impact: string;
    suggestion: string;
    affectedService: string;
    detectedAt: string;
}

interface SecurityScanResult {
    projectId: string;
    projectName?: string;
    deploymentStatus?: string;
    scannedAt: string;
    totalFindings: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    findings: SecurityFinding[];
    aiSummary?: string;
    error?: string;
}

export default function AIOpsPage() {
    const api = useApi()
    const [scans, setScans] = useState<SecurityScanResult[]>([])
    const [loading, setLoading] = useState(true)
    const [scanning, setScanning] = useState(false)

    const fetchScans = async () => {
        setLoading(true)
        try {
            const data = await api.get<SecurityScanResult[]>('/ai-ops/security/scan')
            if (Array.isArray(data)) {
                setScans(data)
            }
        } catch (error) {
            console.error('Failed to fetch security scans:', error)
        } finally {
            setLoading(false)
        }
    }

    const runFullScan = async () => {
        setScanning(true)
        try {
            // Trigger a fresh scan by ignoring cache or using a specific trigger endpoint if one existed
            // For now, calling the standard GET endpoint which inherently scans live containers
            const data = await api.get<SecurityScanResult[]>('/ai-ops/security/scan')
            if (Array.isArray(data)) {
                setScans(data)
            }
        } catch (error) {
            console.error('Scan failed:', error)
        } finally {
            setScanning(false)
        }
    }

    useEffect(() => {
        fetchScans()
    }, [api])

    const getRiskConfig = (risk: string) => {
        switch (risk) {
            case 'critical': return { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: ShieldAlert, label: 'Critical Risk' }
            case 'high': return { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: AlertTriangle, label: 'High Risk' }
            case 'medium': return { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: Info, label: 'Medium Risk' }
            case 'low': return { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: Shield, label: 'Low Risk' }
            default: return { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2, label: 'Secure' }
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'container': return <Container className="w-4 h-4" />
            case 'network': return <Globe className="w-4 h-4" />
            case 'configuration': return <Settings className="w-4 h-4" />
            case 'runtime': return <Clock className="w-4 h-4" />
            default: return <Server className="w-4 h-4" />
        }
    }

    // Aggregate stats
    const totalProjects = scans.length
    const totalFindings = scans.reduce((acc, scan) => acc + (scan.totalFindings || 0), 0)
    const totalCritical = scans.reduce((acc, scan) => acc + (scan.criticalCount || 0), 0)
    const overallRiskLevel = totalCritical > 0 ? 'critical' : scans.some(s => s.overallRisk === 'high') ? 'high' : 'low'
    const OverviewIcon = getRiskConfig(overallRiskLevel).icon

    return (
        <DashboardLayout>
            <div className="space-y-6 max-w-6xl mx-auto pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <span className="gradient-ai w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-ai-accent/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </span>
                            AI Ops Intelligence
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Proactive security scanning and vulnerability detection.
                        </p>
                    </div>
                </div>


                    <div className="space-y-6 mt-4 animate-in fade-in duration-500">
                        {/* Security Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="md:col-span-2 bg-gradient-to-br from-card to-card/50 border-border/50">
                                <CardContent className="p-6 flex items-center justify-between h-full">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Fleet Security Status</p>
                                        <div className="flex items-center gap-3">
                                            <h2 className={`text-2xl font-bold ${getRiskConfig(overallRiskLevel).color}`}>
                                                {totalFindings === 0 ? 'Secure' : `${totalFindings} Issues Found`}
                                            </h2>
                                            {totalFindings > 0 && (
                                                <Badge variant="outline" className={`${getRiskConfig(overallRiskLevel).bg} ${getRiskConfig(overallRiskLevel).color}`}>
                                                    {getRiskConfig(overallRiskLevel).label}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${getRiskConfig(overallRiskLevel).bg}`}>
                                        <OverviewIcon className={`w-7 h-7 ${getRiskConfig(overallRiskLevel).color}`} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
                                <CardContent className="p-6 flex flex-col justify-center h-full">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Critical Risks</p>
                                    <h2 className="text-3xl font-bold text-red-400">{totalCritical}</h2>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
                                <CardContent className="p-6 flex flex-col justify-center h-full relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-sm font-medium text-muted-foreground mb-3">Action</p>
                                        <Button
                                            onClick={runFullScan}
                                            disabled={loading || scanning}
                                            className="w-full gap-2 bg-ai-accent hover:bg-ai-accent/90 text-white"
                                        >
                                            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                            {scanning ? 'Scanning Fleet...' : 'Run Full Scan'}
                                        </Button>
                                    </div>
                                    <Shield className="absolute -bottom-4 -right-4 w-24 h-24 text-ai-accent/10 -rotate-12" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Project Scans */}
                        {loading && !scanning ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin mb-4 text-ai-accent" />
                                <p>Running deep container inspection...</p>
                            </div>
                        ) : scans.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <Shield className="w-12 h-12 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-semibold mb-1">No Deployments Found</h3>
                                    <p className="text-muted-foreground text-sm max-w-sm">
                                        Deploy a project first to enable proactive security scanning and vulnerability detection.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-8">
                                {scans.map((scan) => (
                                    <div key={scan.projectId} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold">{scan.projectName || 'Unknown Project'}</h3>
                                            {scan.error ? (
                                                <Badge variant="outline" className="text-red-400 border-red-500/30">Scan Failed</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground">
                                                    {scan.totalFindings} findings
                                                </Badge>
                                            )}
                                        </div>

                                        {scan.error ? (
                                            <Card className="bg-red-500/5 border-red-500/20">
                                                <CardContent className="p-4 text-sm text-red-400 flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    {scan.error}
                                                </CardContent>
                                            </Card>
                                        ) : scan.totalFindings === 0 ? (
                                            <Card className="bg-emerald-500/5 border-emerald-500/20">
                                                <CardContent className="p-6 flex items-center gap-4 text-emerald-400">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">Clean Bill of Health</h4>
                                                        <p className="text-sm opacity-80">No misconfigurations or vulnerabilities detected in this project's containers.</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <>
                                                {/* AI Summary Banner */}
                                                {scan.aiSummary && (
                                                    <Card className="bg-ai-accent/5 border-ai-accent/20 border-l-4 border-l-ai-accent">
                                                        <CardContent className="p-4 flex gap-4">
                                                            <Bot className="w-6 h-6 text-ai-accent shrink-0 mt-0.5" />
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-foreground mb-1">AI Security Briefing</h4>
                                                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                                    {scan.aiSummary}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}

                                                {/* Findings List */}
                                                <div className="grid gap-4">
                                                    {scan.findings?.map((finding) => {
                                                        const conf = getRiskConfig(finding.riskLevel)
                                                        const Icon = conf.icon
                                                        return (
                                                            <Card key={finding.id} className={`border-l-4 border-l-${conf.color.split('-')[1]}-500 overflow-hidden`}>
                                                                <div className="p-5 flex flex-col md:flex-row gap-5">
                                                                    <div className="flex-1 min-w-0 space-y-3">
                                                                        <div className="flex items-start justify-between gap-4">
                                                                            <div className="space-y-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <h4 className="font-semibold text-base">{finding.title}</h4>
                                                                                    <Badge variant="outline" className={`${conf.bg} ${conf.color} border gap-1 uppercase tracking-wider text-[10px]`}>
                                                                                        <Icon className="w-3 h-3" />
                                                                                        {finding.riskLevel}
                                                                                    </Badge>
                                                                                </div>
                                                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                                                    <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md">
                                                                                        <Server className="w-3 h-3" /> {finding.affectedService}
                                                                                    </span>
                                                                                    <span className="flex items-center gap-1.5 capitalize">
                                                                                        {getCategoryIcon(finding.category)} {finding.category}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-4">
                                                                            <div>
                                                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                                                    {finding.description}
                                                                                </p>
                                                                            </div>

                                                                            <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-border/40">
                                                                                <div>
                                                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Potential Impact</span>
                                                                                    <p className="text-xs text-foreground/80 leading-relaxed border-l-2 border-red-500/30 pl-2">
                                                                                        {finding.impact}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ai-accent mb-1.5 block">AI Suggested Fix</span>
                                                                                    <p className="text-xs text-foreground/80 leading-relaxed border-l-2 border-ai-accent/30 pl-2">
                                                                                        {finding.suggestion}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        )
                                                    })}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
            </div>
        </DashboardLayout>
    )
}
