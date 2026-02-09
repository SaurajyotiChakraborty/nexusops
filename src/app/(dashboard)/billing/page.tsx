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
    CreditCard,
    Download,
    AlertCircle,
    TrendingUp,
    Server,
    Database,
    Globe,
    Sparkles,
} from 'lucide-react'

const currentPlan = {
    name: 'Pro Plan',
    price: '$49',
    period: '/month',
    nextBilling: 'March 1, 2026',
}

const usageBreakdown = [
    { name: 'Compute', usage: '$32.50', percentage: 65, icon: Server },
    { name: 'Database', usage: '$12.00', percentage: 24, icon: Database },
    { name: 'Bandwidth', usage: '$4.50', percentage: 9, icon: Globe },
    { name: 'AI Ops', usage: '$1.00', percentage: 2, icon: Sparkles },
]

const invoices = [
    { date: 'Feb 1, 2026', amount: '$49.00', status: 'Paid' },
    { date: 'Jan 1, 2026', amount: '$47.50', status: 'Paid' },
    { date: 'Dec 1, 2025', amount: '$52.00', status: 'Paid' },
    { date: 'Nov 1, 2025', amount: '$45.00', status: 'Paid' },
]

export default function BillingPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Billing</h1>
                    <p className="text-muted-foreground">
                        Manage your subscription and billing
                    </p>
                </div>

                {/* Current Plan */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <Badge variant="secondary" className="mb-2">
                                    Current Plan
                                </Badge>
                                <h2 className="text-2xl font-bold">{currentPlan.name}</h2>
                                <p className="text-muted-foreground">
                                    Next billing date: {currentPlan.nextBilling}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-bold">
                                    {currentPlan.price}
                                    <span className="text-lg text-muted-foreground">
                                        {currentPlan.period}
                                    </span>
                                </p>
                                <Button variant="outline" className="mt-2">
                                    Change Plan
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Usage This Month */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Usage This Month
                            </CardTitle>
                            <CardDescription>
                                Breakdown of your current billing cycle
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {usageBreakdown.map((item) => {
                                const Icon = item.icon
                                return (
                                    <div key={item.name} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-4 h-4 text-muted-foreground" />
                                                <span>{item.name}</span>
                                            </div>
                                            <span className="font-medium">{item.usage}</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="gradient-accent rounded-full h-2"
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}

                            <div className="pt-4 border-t flex items-center justify-between font-semibold">
                                <span>Total (Estimated)</span>
                                <span className="text-xl">$50.00</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Payment Method
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                                    VISA
                                </div>
                                <div>
                                    <p className="font-medium">•••• •••• •••• 4242</p>
                                    <p className="text-sm text-muted-foreground">Expires 12/27</p>
                                </div>
                                <Badge variant="success" className="ml-auto">
                                    Default
                                </Badge>
                            </div>

                            <Button variant="outline" className="w-full">
                                Add Payment Method
                            </Button>

                            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg flex gap-3">
                                <AlertCircle className="w-5 h-5 text-warning shrink-0" />
                                <div>
                                    <p className="font-medium text-warning">Cost Alert Active</p>
                                    <p className="text-sm text-muted-foreground">
                                        You'll be notified when spending exceeds $100/month
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Invoice History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {invoices.map((invoice, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-muted-foreground">{invoice.date}</span>
                                        <Badge variant="success">{invoice.status}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-medium">{invoice.amount}</span>
                                        <Button variant="ghost" size="icon">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
