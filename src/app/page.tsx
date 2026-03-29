'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Card, CardContent } from '@/components/ui/card'
import { useRef, useCallback, useEffect, useState } from 'react'
import {
    Rocket,
    Sparkles,
    Network,
    Zap,
    Shield,
    TrendingUp,
} from 'lucide-react'

function HeroBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseRef = useRef({ x: -1000, y: -1000 })

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animId: number
        let width = 0
        let height = 0

        const resize = () => {
            const parent = canvas.parentElement
            if (!parent) return
            width = parent.clientWidth
            height = parent.clientHeight
            canvas.width = width * window.devicePixelRatio
            canvas.height = height * window.devicePixelRatio
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        }
        resize()
        window.addEventListener('resize', resize)
        window.addEventListener('mousemove', handleMouseMove)

        // Generate sculptural pattern points
        const points: { x: number; y: number; r: number; phase: number }[] = []
        for (let i = 0; i < 120; i++) {
            points.push({
                x: Math.random() * 2000,
                y: Math.random() * 1200,
                r: 20 + Math.random() * 80,
                phase: Math.random() * Math.PI * 2,
            })
        }

        const draw = (time: number) => {
            ctx.clearRect(0, 0, width, height)

            // Base background — light concrete texture
            const isDark = document.documentElement.classList.contains('dark')
            ctx.fillStyle = isDark ? 'hsl(222, 47%, 8%)' : 'hsl(0, 0%, 95%)'
            ctx.fillRect(0, 0, width, height)

            const mx = mouseRef.current.x
            const my = mouseRef.current.y

            // Draw sculptural relief elements
            points.forEach((p) => {
                const px = (p.x / 2000) * width
                const py = (p.y / 1200) * height
                const r = (p.r / 2000) * width

                // Distance from mouse
                const dx = mx - px
                const dy = my - py
                const dist = Math.sqrt(dx * dx + dy * dy)
                const maxDist = 200
                const influence = Math.max(0, 1 - dist / maxDist)

                // Breathing animation
                const breathe = Math.sin(time / 2000 + p.phase) * 0.1

                // Base relief (subtle embossed circles)
                const baseAlpha = isDark ? 0.03 : 0.04
                const hoverAlpha = influence * (isDark ? 0.15 : 0.12)
                const alpha = baseAlpha + hoverAlpha + breathe * 0.01

                // Light shadow for embossed effect
                const shadowOffset = 2 + influence * 4
                ctx.beginPath()
                ctx.arc(px + shadowOffset, py + shadowOffset, r, 0, Math.PI * 2)
                ctx.fillStyle = isDark
                    ? `rgba(0, 0, 0, ${alpha * 1.5})`
                    : `rgba(0, 0, 0, ${alpha * 0.8})`
                ctx.fill()

                // Highlight for embossed effect
                ctx.beginPath()
                ctx.arc(px - shadowOffset * 0.5, py - shadowOffset * 0.5, r, 0, Math.PI * 2)
                ctx.fillStyle = isDark
                    ? `rgba(120, 140, 255, ${alpha * 0.8})`
                    : `rgba(255, 255, 255, ${alpha * 3})`
                ctx.fill()

                // Main sculptural element
                ctx.beginPath()
                ctx.arc(px, py, r * (1 + influence * 0.3), 0, Math.PI * 2)
                const grad = ctx.createRadialGradient(px, py, 0, px, py, r)
                if (isDark) {
                    grad.addColorStop(0, `rgba(100, 120, 255, ${influence * 0.2})`)
                    grad.addColorStop(1, `rgba(60, 80, 180, ${alpha * 0.5})`)
                } else {
                    grad.addColorStop(0, `rgba(200, 200, 220, ${alpha * 2 + influence * 0.15})`)
                    grad.addColorStop(1, `rgba(180, 180, 200, ${alpha})`)
                }
                ctx.fillStyle = grad
                ctx.fill()
            })

            // Mouse spotlight reveal
            if (mx > 0 && my > 0) {
                const spotGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 180)
                if (isDark) {
                    spotGrad.addColorStop(0, 'rgba(100, 130, 255, 0.06)')
                    spotGrad.addColorStop(0.5, 'rgba(80, 100, 200, 0.03)')
                    spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
                } else {
                    spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
                    spotGrad.addColorStop(0.5, 'rgba(240, 240, 250, 0.15)')
                    spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
                }
                ctx.fillStyle = spotGrad
                ctx.fillRect(0, 0, width, height)
            }

            animId = requestAnimationFrame(draw)
        }
        animId = requestAnimationFrame(draw)

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [handleMouseMove])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
        />
    )
}

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
                            href="/docs"
                            className="text-sm font-medium hover:text-primary transition-colors"
                        >
                            Docs
                        </Link>
                        <ThemeToggle />
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

            {/* Hero Section with Sculptural Background */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden min-h-[90vh] flex items-center">
                {/* The embossed sculptural canvas background with mouse-hover reveal */}
                <HeroBackground />

                <div className="container mx-auto text-center max-w-5xl relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
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
                        <Card className="glass-card group hover:scale-[1.02] transition-transform">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">One-Click Deploy</h3>
                                <p className="text-muted-foreground">
                                    Deploy any framework with zero configuration. We detect, build,
                                    and deploy automatically.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass-card group hover:scale-[1.02] transition-transform">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">AI Ops</h3>
                                <p className="text-muted-foreground">
                                    Intelligent recommendations for scaling, cost optimization, and
                                    downtime prevention.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass-card group hover:scale-[1.02] transition-transform">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow">
                                    <Network className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Visual Infrastructure</h3>
                                <p className="text-muted-foreground">
                                    See your entire infrastructure in real-time with graph-based
                                    visualization.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass-card group hover:scale-[1.02] transition-transform">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow">
                                    <Shield className="w-6 h-6 text-success" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
                                <p className="text-muted-foreground">
                                    Bank-grade encryption, isolated containers, and automatic
                                    security updates.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass-card group hover:scale-[1.02] transition-transform">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow">
                                    <TrendingUp className="w-6 h-6 text-info" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Auto Scaling</h3>
                                <p className="text-muted-foreground">
                                    Intelligent auto-scaling based on traffic patterns and AI
                                    predictions.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass-card group hover:scale-[1.02] transition-transform">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow">
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
