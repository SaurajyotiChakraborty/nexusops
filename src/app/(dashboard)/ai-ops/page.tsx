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
    Sparkles,
    TrendingDown,
    TrendingUp,
    AlertTriangle,
    Shield,
    Zap,
    Check,
    X,
    ChevronRight,
} from 'lucide-react'

const recommendations = [
    {
        id: '1',
        type: 'COST_OPTIMIZATION',
        title: 'Reduce Database Resources',
        description:
            'Your PostgreSQL instance is using only 23% of allocated resources. Consider downgrading to save costs.',
        explanation:
            'Based on 30-day usage analysis, your database rarely exceeds 2GB memory usage. Current allocation is 8GB.',
        suggestedAction: 'Downgrade to db.t3.medium (4GB)',
        savings: '$45/month',
        riskLevel: 'LOW',
        confidenceScore: 0.92,
        implemented: false,
    },
    {
        id: '2',
        type: 'PERFORMANCE',
        title: 'Enable Redis Caching',
        description:
            'API response times can be improved by 40% with Redis caching for frequently accessed endpoints.',
        explanation:
            'Analysis shows /api/users and /api/products endpoints are hit 10,000+ times daily with identical responses.',
        suggestedAction: 'Add Redis cache layer',
        improvement: '40% faster',
        riskLevel: 'LOW',
        confidenceScore: 0.88,
        implemented: false,
    },
    {
        id: '3',
        type: 'SECURITY',
        title: 'Update Dependencies',
        description: '3 packages have known security vulnerabilities that should be patched immediately.',
        explanation:
            'Critical: lodash@4.17.15, High: axios@0.21.0, Medium: moment@2.29.0',
        suggestedAction: 'Run npm audit fix',
        riskLevel: 'HIGH',
        confidenceScore: 0.99,
        implemented: false,
    },
    {
        id: '4',
        type: 'SCALING',
        title: 'Enable Auto-Scaling',
        description:
            'Traffic patterns suggest you could benefit from auto-scaling during peak hours.',
        explanation:
            'Peak traffic occurs between 9 AM - 12 PM EST. Current fixed resources cause 200ms latency spikes.',
        suggestedAction: 'Configure HPA with min:2, max:5 replicas',
        riskLevel: 'MEDIUM',
        confidenceScore: 0.85,
        implemented: true,
    },
]

function getTypeIcon(type: string) {
    switch (type) {
        case 'COST_OPTIMIZATION':
            return <TrendingDown className="w-5 h-5" />
        case 'PERFORMANCE':
            return <Zap className="w-5 h-5" />
        case 'SECURITY':
            return <Shield className="w-5 h-5" />
        case 'SCALING':
            return <TrendingUp className="w-5 h-5" />
        default:
            return <Sparkles className="w-5 h-5" />
    }
}

function getRiskColor(risk: string) {
    switch (risk) {
        case 'LOW':
            return 'success'
        case 'MEDIUM':
            return 'warning'
        case 'HIGH':
            return 'danger'
        default:
            return 'secondary'
    }
}

export default function AIOpsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <span className="gradient-ai w-10 h-10 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </span>
                            AI Ops
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Intelligent recommendations for your infrastructure
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="ai" className="gap-1">
                            <Sparkles className="w-3 h-3" />
                            4 Active Insights
                        </Badge>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-ai-accent/20 bg-ai-accent/5">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-ai-accent">
                                Total Savings Potential
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-bold text-gradient-ai">$127</span>
                            <span className="text-muted-foreground">/month</span>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Recommendations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold">12</span>
                            <span className="text-muted-foreground ml-2">total</span>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Implemented</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold text-success">8</span>
                            <span className="text-muted-foreground ml-2">(67%)</span>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Security Issues</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className="text-2xl font-bold text-danger">1</span>
                            <span className="text-muted-foreground ml-2">critical</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Recommendations */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Active Recommendations</h2>

                    {recommendations.map((rec) => (
                        <Card
                            key={rec.id}
                            className={`transition-all ${rec.implemented
                                    ? 'opacity-60'
                                    : rec.riskLevel === 'HIGH'
                                        ? 'border-danger/30'
                                        : ''
                                }`}
                        >
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                                    {/* Icon & Type */}
                                    <div
                                        className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${rec.type === 'SECURITY'
                                                ? 'bg-danger/10 text-danger'
                                                : rec.type === 'COST_OPTIMIZATION'
                                                    ? 'bg-success/10 text-success'
                                                    : rec.type === 'PERFORMANCE'
                                                        ? 'bg-warning/10 text-warning'
                                                        : 'bg-info/10 text-info'
                                            }`}
                                    >
                                        {getTypeIcon(rec.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-semibold">{rec.title}</h3>
                                            <Badge variant={getRiskColor(rec.riskLevel) as 'success' | 'warning' | 'danger'}>
                                                {rec.riskLevel} RISK
                                            </Badge>
                                            {rec.implemented && (
                                                <Badge variant="success" className="gap-1">
                                                    <Check className="w-3 h-3" />
                                                    Implemented
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-muted-foreground">{rec.description}</p>

                                        <div className="bg-muted/50 rounded-lg p-3 text-sm">
                                            <p className="font-medium mb-1">AI Analysis:</p>
                                            <p className="text-muted-foreground">{rec.explanation}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Action: </span>
                                                <span className="font-medium">{rec.suggestedAction}</span>
                                            </div>
                                            {'savings' in rec && (
                                                <div className="text-success font-medium">
                                                    Save {rec.savings}
                                                </div>
                                            )}
                                            {'improvement' in rec && (
                                                <div className="text-success font-medium">
                                                    {rec.improvement}
                                                </div>
                                            )}
                                            <div className="text-muted-foreground">
                                                Confidence: {Math.round(rec.confidenceScore * 100)}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {!rec.implemented && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button variant="ghost" size="icon">
                                                <X className="w-4 h-4" />
                                            </Button>
                                            <Button variant="accent" className="gap-1">
                                                Apply
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}
