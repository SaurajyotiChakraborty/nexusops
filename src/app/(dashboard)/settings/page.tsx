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
import { Input } from '@/components/ui/input'
import {
    User,
    Shield,
    Bell,
    Link,
    Github,
    Check,
} from 'lucide-react'

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="max-w-4xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account and preferences
                    </p>
                </div>

                {/* Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Profile
                        </CardTitle>
                        <CardDescription>Your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center text-white text-xl font-bold">
                                JD
                            </div>
                            <Button variant="outline">Change Avatar</Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Name</label>
                                <Input defaultValue="John Doe" />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Email</label>
                                <Input defaultValue="john@example.com" disabled />
                            </div>
                        </div>

                        <Button variant="accent">Save Changes</Button>
                    </CardContent>
                </Card>

                {/* Connected Accounts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Link className="w-5 h-5" />
                            Connected Accounts
                        </CardTitle>
                        <CardDescription>
                            Link your Git providers to import repositories
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { name: 'GitHub', icon: Github, connected: true, username: '@johndoe' },
                            { name: 'Bitbucket', icon: Github, connected: false, username: null },
                            { name: 'Google', icon: Github, connected: true, username: 'john@gmail.com' },
                        ].map((provider) => (
                            <div
                                key={provider.name}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <provider.icon className="w-5 h-5" />
                                    <div>
                                        <p className="font-medium">{provider.name}</p>
                                        {provider.connected && (
                                            <p className="text-sm text-muted-foreground">
                                                {provider.username}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {provider.connected ? (
                                    <Badge variant="success" className="gap-1">
                                        <Check className="w-3 h-3" />
                                        Connected
                                    </Badge>
                                ) : (
                                    <Button variant="outline" size="sm">
                                        Connect
                                    </Button>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Two-Factor Authentication</p>
                                <p className="text-sm text-muted-foreground">
                                    Add an extra layer of security
                                </p>
                            </div>
                            <Button variant="outline">Enable</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Active Sessions</p>
                                <p className="text-sm text-muted-foreground">
                                    Manage your active login sessions
                                </p>
                            </div>
                            <Button variant="outline">View Sessions</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { label: 'Deployment notifications', enabled: true },
                            { label: 'AI Ops recommendations', enabled: true },
                            { label: 'Weekly usage reports', enabled: false },
                            { label: 'Cost alerts', enabled: true },
                        ].map((setting) => (
                            <div
                                key={setting.label}
                                className="flex items-center justify-between"
                            >
                                <span>{setting.label}</span>
                                <button
                                    className={`w-12 h-6 rounded-full transition-colors ${setting.enabled ? 'bg-primary' : 'bg-muted'
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${setting.enabled ? 'translate-x-6' : 'translate-x-0.5'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-danger/30">
                    <CardHeader>
                        <CardTitle className="text-danger">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Delete Account</p>
                                <p className="text-sm text-muted-foreground">
                                    Permanently delete your account and all data
                                </p>
                            </div>
                            <Button variant="destructive">Delete Account</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
