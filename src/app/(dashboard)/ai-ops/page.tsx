'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Brain, Zap, Shield } from 'lucide-react'

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
                </div>

                {/* Coming Soon Placeholder */}
                <Card className="border-dashed border-ai-accent/30">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="grid grid-cols-2 gap-4 mb-6 opacity-30">
                            <Sparkles className="w-16 h-16 text-ai-accent" />
                            <Brain className="w-16 h-16 text-ai-accent" />
                            <Zap className="w-16 h-16 text-ai-accent" />
                            <Shield className="w-16 h-16 text-ai-accent" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">AI Ops Coming Soon</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            We're building AI-powered infrastructure insights.
                            Get intelligent recommendations for cost optimization,
                            performance improvements, and security alerts.
                        </p>
                    </CardContent>
                </Card>

                {/* Feature Preview */}
                <div className="grid md:grid-cols-3 gap-4">
                    <Card className="border-ai-accent/20">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="w-5 h-5 text-ai-accent" />
                                Cost Optimization
                            </CardTitle>
                            <CardDescription>
                                AI analyzes resource usage and suggests ways to reduce costs
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="border-ai-accent/20">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Brain className="w-5 h-5 text-ai-accent" />
                                Performance Insights
                            </CardTitle>
                            <CardDescription>
                                Automatic detection of bottlenecks and optimization opportunities
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="border-ai-accent/20">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Shield className="w-5 h-5 text-ai-accent" />
                                Security Alerts
                            </CardTitle>
                            <CardDescription>
                                Proactive security scanning and vulnerability detection
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
