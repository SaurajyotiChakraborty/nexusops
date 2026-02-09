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
import {
    Server,
    Database,
    Globe,
    Box,
    Activity,
    ArrowRight,
} from 'lucide-react'

// Visual Infrastructure Mock Data
const services = [
    {
        id: 'web-1',
        name: 'Frontend',
        type: 'WEB',
        status: 'running',
        cpu: 45,
        memory: 62,
        requests: '2.3k/min',
        x: 100,
        y: 100,
    },
    {
        id: 'api-1',
        name: 'API Gateway',
        type: 'API',
        status: 'running',
        cpu: 32,
        memory: 48,
        requests: '1.8k/min',
        x: 350,
        y: 100,
    },
    {
        id: 'worker-1',
        name: 'Background Worker',
        type: 'WORKER',
        status: 'running',
        cpu: 78,
        memory: 55,
        requests: '500/min',
        x: 350,
        y: 280,
    },
    {
        id: 'db-1',
        name: 'PostgreSQL',
        type: 'DATABASE',
        status: 'running',
        cpu: 25,
        memory: 72,
        x: 600,
        y: 180,
    },
    {
        id: 'cache-1',
        name: 'Redis Cache',
        type: 'CACHE',
        status: 'running',
        cpu: 12,
        memory: 35,
        x: 600,
        y: 60,
    },
]

const connections = [
    { from: 'web-1', to: 'api-1' },
    { from: 'api-1', to: 'db-1' },
    { from: 'api-1', to: 'cache-1' },
    { from: 'api-1', to: 'worker-1' },
    { from: 'worker-1', to: 'db-1' },
]

function getServiceIcon(type: string) {
    switch (type) {
        case 'WEB':
            return <Globe className="w-5 h-5" />
        case 'API':
            return <Server className="w-5 h-5" />
        case 'DATABASE':
            return <Database className="w-5 h-5" />
        case 'WORKER':
            return <Box className="w-5 h-5" />
        case 'CACHE':
            return <Activity className="w-5 h-5" />
        default:
            return <Server className="w-5 h-5" />
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'running':
            return 'bg-success'
        case 'stopped':
            return 'bg-muted'
        case 'error':
            return 'bg-danger'
        default:
            return 'bg-warning'
    }
}

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
                    <Badge variant="success" className="gap-1">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        All Systems Operational
                    </Badge>
                </div>

                {/* Visual Graph */}
                <Card>
                    <CardHeader>
                        <CardTitle>Service Topology</CardTitle>
                        <CardDescription>
                            Real-time view of your infrastructure components and connections
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative bg-muted/20 rounded-lg p-6 min-h-[400px] overflow-x-auto">
                            {/* SVG Connections */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                {connections.map((conn, i) => {
                                    const fromService = services.find((s) => s.id === conn.from)
                                    const toService = services.find((s) => s.id === conn.to)
                                    if (!fromService || !toService) return null

                                    return (
                                        <g key={i}>
                                            <line
                                                x1={fromService.x + 80}
                                                y1={fromService.y + 40}
                                                x2={toService.x}
                                                y2={toService.y + 40}
                                                stroke="currentColor"
                                                strokeOpacity={0.2}
                                                strokeWidth={2}
                                                strokeDasharray="4 4"
                                            />
                                            <circle
                                                cx={(fromService.x + 80 + toService.x) / 2}
                                                cy={(fromService.y + 40 + toService.y + 40) / 2}
                                                r="4"
                                                fill="currentColor"
                                                opacity={0.3}
                                                className="animate-pulse"
                                            />
                                        </g>
                                    )
                                })}
                            </svg>

                            {/* Service Nodes */}
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    className="absolute bg-card border rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:border-primary/50 w-40"
                                    style={{
                                        left: service.x,
                                        top: service.y,
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            {getServiceIcon(service.type)}
                                        </div>
                                        <div
                                            className={`w-2 h-2 rounded-full ${getStatusColor(
                                                service.status
                                            )} animate-pulse`}
                                        />
                                    </div>
                                    <p className="font-medium text-sm">{service.name}</p>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {service.type}
                                    </p>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">CPU</span>
                                            <span>{service.cpu}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-1">
                                            <div
                                                className="bg-primary rounded-full h-1"
                                                style={{ width: `${service.cpu}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Mem</span>
                                            <span>{service.memory}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-1">
                                            <div
                                                className="bg-accent rounded-full h-1"
                                                style={{ width: `${service.memory}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Legend */}
                            <div className="absolute bottom-4 right-4 flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <ArrowRight className="w-4 h-4" />
                                    Data Flow
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-success" />
                                    Healthy
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Service List */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                        <Card key={service.id} className="hover:border-primary/30 transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            {getServiceIcon(service.type)}
                                        </div>
                                        <CardTitle className="text-base">{service.name}</CardTitle>
                                    </div>
                                    <Badge variant="success">{service.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">CPU Usage</p>
                                        <p className="font-semibold">{service.cpu}%</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Memory</p>
                                        <p className="font-semibold">{service.memory}%</p>
                                    </div>
                                    {'requests' in service && (
                                        <div className="col-span-2">
                                            <p className="text-muted-foreground">Requests</p>
                                            <p className="font-semibold">{service.requests}</p>
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
