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
    TrendingUp,
    TrendingDown,
    Users,
    Globe,
    Clock,
    ArrowUpRight,
} from 'lucide-react'

// Mock analytics data
const stats = [
    {
        title: 'Total Requests',
        value: '2.4M',
        change: '+12.5%',
        trend: 'up',
    },
    {
        title: 'Avg Response Time',
        value: '145ms',
        change: '-8.2%',
        trend: 'down',
    },
    {
        title: 'Error Rate',
        value: '0.12%',
        change: '-2.1%',
        trend: 'down',
    },
    {
        title: 'Active Users',
        value: '12.5K',
        change: '+18.3%',
        trend: 'up',
    },
]

const topEndpoints = [
    { path: '/api/users', requests: '450K', avgTime: '120ms' },
    { path: '/api/products', requests: '380K', avgTime: '95ms' },
    { path: '/api/auth/login', requests: '210K', avgTime: '180ms' },
    { path: '/api/orders', requests: '185K', avgTime: '210ms' },
    { path: '/api/search', requests: '120K', avgTime: '340ms' },
]

const topCountries = [
    { country: 'United States', requests: '850K', percentage: 35 },
    { country: 'United Kingdom', requests: '420K', percentage: 18 },
    { country: 'Germany', requests: '310K', percentage: 13 },
    { country: 'India', requests: '280K', percentage: 12 },
    { country: 'Japan', requests: '195K', percentage: 8 },
]

export default function AnalyticsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Analytics</h1>
                        <p className="text-muted-foreground">
                            Traffic and performance insights
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                            <Clock className="w-3 h-3" />
                            Last 30 days
                        </Badge>
                        <Button variant="outline" size="sm">
                            Export
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <Card key={stat.title}>
                            <CardHeader className="pb-2">
                                <CardDescription>{stat.title}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end justify-between">
                                    <span className="text-3xl font-bold">{stat.value}</span>
                                    <div
                                        className={`flex items-center gap-1 text-sm ${stat.trend === 'up' && stat.title !== 'Error Rate'
                                                ? 'text-success'
                                                : stat.trend === 'down' && stat.title === 'Error Rate'
                                                    ? 'text-success'
                                                    : stat.trend === 'down'
                                                        ? 'text-success'
                                                        : 'text-danger'
                                            }`}
                                    >
                                        {stat.trend === 'up' ? (
                                            <TrendingUp className="w-4 h-4" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4" />
                                        )}
                                        {stat.change}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle>Traffic Overview</CardTitle>
                        <CardDescription>Request volume over the past 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                            <div className="text-center text-muted-foreground">
                                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Chart visualization would go here</p>
                                <p className="text-sm">(Recharts / D3 integration)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Top Endpoints */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Endpoints</CardTitle>
                            <CardDescription>Most requested API endpoints</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topEndpoints.map((endpoint, i) => (
                                    <div
                                        key={endpoint.path}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-muted-foreground w-6">{i + 1}.</span>
                                            <code className="text-sm bg-muted px-2 py-1 rounded">
                                                {endpoint.path}
                                            </code>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span>{endpoint.requests}</span>
                                            <span className="text-muted-foreground">
                                                {endpoint.avgTime}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Countries */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                Traffic by Country
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topCountries.map((country) => (
                                    <div key={country.country} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>{country.country}</span>
                                            <span className="text-muted-foreground">
                                                {country.requests} ({country.percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="gradient-accent rounded-full h-2 transition-all"
                                                style={{ width: `${country.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
