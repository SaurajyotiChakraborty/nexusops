import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Rocket,
  Sparkles,
  Network,
  Zap,
  Shield,
  TrendingUp,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="font-bold text-xl text-gradient-primary">
              NexusOps Cloud
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Docs
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="accent" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-ai-accent/20 mb-6">
            <Sparkles className="w-4 h-4 text-ai-accent" />
            <span className="text-sm font-medium text-ai-accent">
              AI-Powered Infrastructure
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Deploy Faster.
            <br />
            <span className="text-gradient-primary">Observe Smarter.</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Next-generation hosting platform with AI Ops, visual infrastructure
            intelligence, and developer-first automation. Build once, observe
            everything. Let AI handle the rest.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button variant="accent" size="xl" className="gap-2">
                <Rocket className="w-5 h-5" />
                Start Deploying
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="xl">
                View Documentation
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-gradient-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient-primary">
                &lt;30s
              </div>
              <div className="text-sm text-muted-foreground">Deploy Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient-primary">50+</div>
              <div className="text-sm text-muted-foreground">Frameworks</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Why Choose <span className="text-gradient-primary">NexusOps</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Built for developers who demand excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">One-Click Deploy</h3>
                <p className="text-muted-foreground">
                  Deploy any framework with zero configuration. We detect, build,
                  and deploy automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg gradient-ai flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Ops</h3>
                <p className="text-muted-foreground">
                  Intelligent recommendations for scaling, cost optimization, and
                  downtime prevention.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Visual Infrastructure</h3>
                <p className="text-muted-foreground">
                  See your entire infrastructure in real-time with graph-based
                  visualization.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
                <p className="text-muted-foreground">
                  Bank-grade encryption, isolated containers, and automatic
                  security updates.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-info" />
                </div>
                <h3 className="text-xl font-bold mb-2">Auto Scaling</h3>
                <p className="text-muted-foreground">
                  Intelligent auto-scaling based on traffic patterns and AI
                  predictions.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-warning" />
                </div>
                <h3 className="text-xl font-bold mb-2">Global CDN</h3>
                <p className="text-muted-foreground">
                  Deploy to the edge with our global CDN network for lightning-fast
                  performance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Infrastructure?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers already using NexusOps
          </p>
          <Link href="/sign-up">
            <Button variant="accent" size="xl" className="gap-2">
              <Rocket className="w-5 h-5" />
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2026 NexusOps Cloud. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
