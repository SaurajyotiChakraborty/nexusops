'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Server, Database, Globe, Box, Network, Container } from 'lucide-react'

export default function InfrastructurePage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Infrastructure</h1>
                        <p className="text-muted-foreground">
                            Visual overview of your deployed services
                        </p>
                    </div>
                </div>

                {/* Coming Soon Placeholder */}
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="grid grid-cols-3 gap-4 mb-6 opacity-30">
                            <Server className="w-16 h-16" />
                            <Database className="w-16 h-16" />
                            <Globe className="w-16 h-16" />
                            <Box className="w-16 h-16" />
                            <Network className="w-16 h-16" />
                            <Container className="w-16 h-16" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Infrastructure View Coming Soon</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            We're building a visual topology view of your infrastructure.
                            See service connections, health status, and resource usage at a glance.
                        </p>
                    </CardContent>
                </Card>

                {/* Feature Preview */}
                <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Network className="w-5 h-5" />
                                Service Topology
                            </CardTitle>
                            <CardDescription>
                                Visualize connections between your services and databases
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Container className="w-5 h-5" />
                                Container Status
                            </CardTitle>
                            <CardDescription>
                                Monitor container health, CPU, and memory usage in real-time
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Database className="w-5 h-5" />
                                Resource Management
                            </CardTitle>
                            <CardDescription>
                                Scale resources up or down based on demand
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
