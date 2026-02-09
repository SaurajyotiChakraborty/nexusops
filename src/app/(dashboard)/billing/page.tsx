'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Receipt, Wallet, Shield } from 'lucide-react'

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

                {/* Coming Soon Placeholder */}
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="grid grid-cols-2 gap-4 mb-6 opacity-30">
                            <CreditCard className="w-16 h-16" />
                            <Receipt className="w-16 h-16" />
                            <Wallet className="w-16 h-16" />
                            <Shield className="w-16 h-16" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Billing Coming Soon</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            We're building a comprehensive billing system.
                            Manage subscriptions, view invoices, and track usage.
                        </p>
                    </CardContent>
                </Card>

                {/* Feature Preview */}
                <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Subscription Plans</CardTitle>
                            <CardDescription>
                                Choose from flexible plans that scale with your needs
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Usage Tracking</CardTitle>
                            <CardDescription>
                                Monitor compute, storage, and bandwidth usage in real-time
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Invoice History</CardTitle>
                            <CardDescription>
                                Access and download all your past invoices
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
