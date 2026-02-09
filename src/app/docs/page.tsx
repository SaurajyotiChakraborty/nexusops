import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
    Zap,
    Search,
    Rocket,
    Book,
    Code,
    Terminal,
    Settings,
    Shield,
    Sparkles,
    ChevronRight,
} from 'lucide-react'

const categories = [
    {
        title: 'Getting Started',
        icon: Rocket,
        description: 'Learn the basics of deploying with NexusOps',
        articles: [
            'Quick Start Guide',
            'Creating Your First Project',
            'Connecting Git Providers',
            'Understanding Deployments',
        ],
    },
    {
        title: 'Projects',
        icon: Code,
        description: 'Manage and configure your projects',
        articles: [
            'Project Settings',
            'Environment Variables',
            'Framework Detection',
            'Build Configuration',
        ],
    },
    {
        title: 'Deployments',
        icon: Terminal,
        description: 'Deploy, monitor, and rollback',
        articles: [
            'Deployment Process',
            'Build Logs',
            'Rollback Deployments',
            'Preview Deployments',
        ],
    },
    {
        title: 'AI Ops',
        icon: Sparkles,
        description: 'Intelligent recommendations and automation',
        articles: [
            'Understanding AI Ops',
            'Cost Optimization',
            'Performance Insights',
            'Applying Recommendations',
        ],
    },
    {
        title: 'Infrastructure',
        icon: Settings,
        description: 'Visual infrastructure management',
        articles: [
            'Service Topology',
            'Resource Monitoring',
            'Scaling Services',
            'Container Management',
        ],
    },
    {
        title: 'Security',
        icon: Shield,
        description: 'Secure your applications',
        articles: [
            'SSL Certificates',
            'Access Controls',
            'Security Best Practices',
            'Compliance',
        ],
    },
]

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl">NexusOps</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-6">
                            <Link
                                href="/pricing"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Pricing
                            </Link>
                            <Link
                                href="/docs"
                                className="text-primary font-medium"
                            >
                                Docs
                            </Link>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href="/sign-in">
                                <Button variant="ghost">Sign In</Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button variant="accent">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-primary/5 to-transparent">
                <div className="max-w-4xl mx-auto text-center">
                    <Badge variant="secondary" className="mb-4 gap-1">
                        <Book className="w-3 h-3" />
                        Documentation
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        How can we <span className="text-gradient-primary">help?</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        Everything you need to deploy, manage, and scale your applications
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search documentation..."
                            className="pl-12 h-14 text-lg"
                        />
                    </div>
                </div>
            </section>

            {/* Quick Links */}
            <section className="py-8 px-4 border-b">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-3">
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                            Quick Start
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                            CLI Reference
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                            API Docs
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                            Changelog
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                            Examples
                        </Badge>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => {
                            const Icon = category.icon
                            return (
                                <div
                                    key={category.title}
                                    className="group border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:gradient-accent group-hover:text-white transition-all">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-semibold text-lg">{category.title}</h3>
                                    </div>
                                    <p className="text-muted-foreground text-sm mb-4">
                                        {category.description}
                                    </p>
                                    <ul className="space-y-2">
                                        {category.articles.map((article) => (
                                            <li key={article}>
                                                <a
                                                    href="#"
                                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <ChevronRight className="w-3 h-3" />
                                                    {article}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Popular Articles */}
            <section className="py-16 px-4 bg-muted/30">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8 text-center">
                        Popular Articles
                    </h2>

                    <div className="space-y-4">
                        {[
                            'How to deploy a Next.js application in 30 seconds',
                            'Understanding AI Ops cost optimization recommendations',
                            'Setting up custom domains with SSL',
                            'Configuring environment variables for different stages',
                            'Best practices for zero-downtime deployments',
                        ].map((article, i) => (
                            <a
                                key={i}
                                href="#"
                                className="flex items-center justify-between p-4 bg-card border rounded-lg hover:border-primary/50 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-muted-foreground">0{i + 1}</span>
                                    <span className="font-medium">{article}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Need Help CTA */}
            <section className="py-16 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                    <p className="text-muted-foreground mb-6">
                        Can't find what you're looking for? Our support team is here to
                        help.
                    </p>
                    <Button variant="accent" size="lg">
                        Contact Support
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t">
                <div className="max-w-7xl mx-auto text-center text-muted-foreground">
                    <p>© 2026 NexusOps Cloud. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
