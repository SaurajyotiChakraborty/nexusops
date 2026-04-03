'use client'

import Link from 'next/link'
import { useRef, useEffect, useCallback, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Mote {
    x: number
    y: number
    vx: number
    vy: number
    r: number
    alpha: number
    phase: number
}

// ─── Embossed Sculpture Canvas ────────────────────────────────────────────────

function SculptureCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseRef = useRef({ x: 0.42, y: 0.38 })
    const smoothRef = useRef({ x: 0.42, y: 0.38 })
    const imgRef = useRef<HTMLImageElement | null>(null)
    const motesRef = useRef<Mote[]>([])

    const onMouseMove = useCallback((e: MouseEvent) => {
        mouseRef.current = {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
        }
    }, [])

    const onTouchMove = useCallback((e: TouchEvent) => {
        if (e.touches.length) {
            mouseRef.current = {
                x: e.touches[0].clientX / window.innerWidth,
                y: e.touches[0].clientY / window.innerHeight,
            }
        }
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        let w = 0, h = 0, animId = 0

        // ── motes ─────────────────────────────────────────────────────────────
        const spawnMotes = (W: number, H: number) => {
            motesRef.current = Array.from({ length: 28 }, () => ({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.18,
                vy: -0.05 - Math.random() * 0.12,
                r: 0.8 + Math.random() * 1.2,
                alpha: 0.06 + Math.random() * 0.14,
                phase: Math.random() * Math.PI * 2,
            }))
        }

        const resize = () => {
            w = window.innerWidth
            h = window.innerHeight
            canvas.width = w * dpr
            canvas.height = h * dpr
            canvas.style.width = `${w}px`
            canvas.style.height = `${h}px`
            spawnMotes(w, h)
        }

        // ── load sculpture image ───────────────────────────────────────────────
        const img = new Image()
        img.src = '/hero-bg.png'
        imgRef.current = img

        resize()
        window.addEventListener('resize', resize)
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('touchmove', onTouchMove, { passive: true })

        // ── draw loop ──────────────────────────────────────────────────────────
        const draw = (t: number) => {
            ctx.save()
            ctx.scale(dpr, dpr)

            // background
            ctx.fillStyle = '#f7f5f2'
            ctx.fillRect(0, 0, w, h)

            // ── sculpture image ──────────────────────────────────────────────
            if (img.complete && img.naturalWidth) {
                const mx = smoothRef.current.x
                const my = smoothRef.current.y

                // cover-fit
                const iR = img.naturalWidth / img.naturalHeight
                const cR = w / h
                let iW, iH, iX, iY
                if (cR > iR) {
                    iW = w; iH = w / iR; iX = 0; iY = (h - iH) / 2
                } else {
                    iH = h; iW = h * iR; iX = (w - iW) / 2; iY = 0
                }

                // subtle parallax shift
                const parallax = 12
                const px = (mx - 0.5) * -parallax
                const py = (my - 0.5) * -parallax

                ctx.save()
                ctx.globalAlpha = 0.55          // soft, not harsh
                ctx.filter = 'saturate(0.6) brightness(1.08)'
                ctx.drawImage(img, iX + px, iY + py, iW, iH)
                ctx.restore()

                // ── directional light layer ──────────────────────────────────
                // Simulates a single soft light source tracking the cursor, 
                // casting the shadow/highlight of the sculpture in real-time.
                const lightX = mx * w
                const lightY = my * h
                const maxR = Math.hypot(w, h) * 0.85

                // Shadow side (opposite of light)
                const shadowGrad = ctx.createRadialGradient(
                    lightX, lightY, 0,
                    lightX, lightY, maxR
                )
                shadowGrad.addColorStop(0, 'rgba(247,245,242, 0)')
                shadowGrad.addColorStop(0.4, 'rgba(210,204,196, 0.08)')
                shadowGrad.addColorStop(1, 'rgba(150,140,128, 0.28)')
                ctx.fillStyle = shadowGrad
                ctx.fillRect(0, 0, w, h)

                // Highlight (on light side)
                const hlGrad = ctx.createRadialGradient(
                    lightX, lightY, 0,
                    lightX, lightY, maxR * 0.55
                )
                hlGrad.addColorStop(0, 'rgba(255,253,249, 0.55)')
                hlGrad.addColorStop(0.35, 'rgba(255,253,249, 0.18)')
                hlGrad.addColorStop(1, 'rgba(247,245,242, 0)')
                ctx.fillStyle = hlGrad
                ctx.fillRect(0, 0, w, h)

                // Subtle vignette always-on
                const vigGrad = ctx.createRadialGradient(
                    w / 2, h / 2, h * 0.3,
                    w / 2, h / 2, h * 0.9
                )
                vigGrad.addColorStop(0, 'rgba(247,245,242, 0)')
                vigGrad.addColorStop(1, 'rgba(220,215,208, 0.38)')
                ctx.fillStyle = vigGrad
                ctx.fillRect(0, 0, w, h)
            } else {
                // fallback while loading
                ctx.fillStyle = '#f0ede8'
                ctx.fillRect(0, 0, w, h)
            }

            // ── floating motes ──────────────────────────────────────────────
            motesRef.current.forEach(m => {
                const breathe = Math.sin(t / 4200 + m.phase) * 0.4
                ctx.beginPath()
                ctx.arc(m.x, m.y, m.r + breathe * 0.3, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(180,170,158,${m.alpha + breathe * 0.03})`
                ctx.fill()

                m.x += m.vx + Math.sin(t / 8000 + m.phase) * 0.08
                m.y += m.vy
                m.alpha += Math.sin(t / 3500 + m.phase) * 0.001

                if (m.y < -4) m.y = h + 4
                if (m.x < -4) m.x = w + 4
                if (m.x > w + 4) m.x = -4
            })

            ctx.restore()
            animId = requestAnimationFrame(draw)
        }

        animId = requestAnimationFrame(draw)

        // mouse smoothing (separate rAF)
        let smoothId: number
        const smooth = () => {
            const lerp = 0.04
            smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * lerp
            smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * lerp
            smoothId = requestAnimationFrame(smooth)
        }
        smoothId = requestAnimationFrame(smooth)

        return () => {
            cancelAnimationFrame(animId)
            cancelAnimationFrame(smoothId)
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('touchmove', onTouchMove)
        }
    }, [onMouseMove, onTouchMove])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full"
            style={{ zIndex: 0 }}
        />
    )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 120)
        return () => clearTimeout(t)
    }, [])

    const fade = (delay = 0) =>
        `transition-all duration-1000 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`
    const fadeD = (ms: number) => ({
        transitionDelay: `${ms}ms`,
    })

    return (
        <div
            className="relative min-h-screen overflow-x-hidden select-none"
            style={{ background: '#f7f5f2', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
            <SculptureCanvas />

            {/* ── Nav ──────────────────────────────────────────────────────── */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 md:px-16 h-16 ${fade()}`}
                style={fadeD(0)}
            >
                <Link href="/" className="flex items-center gap-2.5 group">
                    <span
                        className="text-[13px] tracking-[0.22em] uppercase font-light"
                        style={{ color: '#1a1816', letterSpacing: '0.22em' }}
                    >
                        NexusOps
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {['Docs', 'Sign In'].map(label => (
                        <Link
                            key={label}
                            href={label === 'Docs' ? '/docs' : '/sign-in'}
                            className="text-[12px] tracking-[0.18em] uppercase font-light transition-opacity duration-300 hover:opacity-60"
                            style={{ color: '#4a4744' }}
                        >
                            {label}
                        </Link>
                    ))}
                    <Link
                        href="/sign-up"
                        className="text-[12px] tracking-[0.18em] uppercase font-light px-5 py-2 border transition-all duration-300 hover:bg-[#1a1816] hover:text-[#f7f5f2]"
                        style={{ color: '#1a1816', borderColor: 'rgba(26,24,22,0.28)' }}
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <main className="relative z-10 flex flex-col min-h-screen">
                {/* Primary content block — vertically centered, left-biased */}
                <div className="flex-1 flex items-center px-10 md:px-16 lg:px-24">
                    <div className="max-w-xl">

                        {/* Eyebrow */}
                        <p
                            className={`text-[11px] tracking-[0.35em] uppercase mb-8 ${fade()}`}
                            style={{ ...fadeD(200), color: '#9e9890' }}
                        >
                            Cloud Infrastructure · AI Ops ·  2026
                        </p>

                        {/* Main headline */}
                        <h1
                            className={`leading-[1.08] mb-6 ${fade()}`}
                            style={{
                                ...fadeD(350),
                                fontSize: 'clamp(2.6rem, 5.5vw, 5rem)',
                                fontWeight: 200,
                                color: '#1a1816',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Innovative
                            <br />
                            <span style={{ fontStyle: 'italic', fontWeight: 300 }}>digital</span>
                            <br />
                            experience studio
                        </h1>

                        {/* Sub-line */}
                        <p
                            className={`mb-12 ${fade()}`}
                            style={{
                                ...fadeD(520),
                                fontSize: '0.95rem',
                                fontWeight: 300,
                                color: '#8a847c',
                                lineHeight: 1.75,
                                letterSpacing: '0.01em',
                                maxWidth: '34ch',
                            }}
                        >
                            Deploy with one click. Observe with clarity.
                            Let AI handle the architecture while you focus on what matters.
                        </p>

                        {/* Actions */}
                        <div
                            className={`flex items-center gap-6 ${fade()}`}
                            style={fadeD(680)}
                        >
                            <Link
                                href="/sign-up"
                                className="text-[12px] tracking-[0.18em] uppercase font-light px-8 py-3 transition-all duration-400 hover:opacity-80"
                                style={{ background: '#1a1816', color: '#f7f5f2', letterSpacing: '0.18em' }}
                            >
                                Begin
                            </Link>
                            <Link
                                href="/docs"
                                className="text-[12px] tracking-[0.18em] uppercase font-light transition-opacity duration-300 hover:opacity-50"
                                style={{ color: '#4a4744' }}
                            >
                                Read the docs →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── Bottom strip ─────────────────────────────────────────── */}
                <div
                    className={`flex items-end justify-between px-10 md:px-16 lg:px-24 pb-10 ${fade()}`}
                    style={fadeD(900)}
                >
                    {/* Stats */}
                    <div className="flex items-center gap-10">
                        {[
                            { v: '99.9%', l: 'Uptime' },
                            { v: '<30s', l: 'Deploy' },
                            { v: '50+', l: 'Frameworks' },
                        ].map(s => (
                            <div key={s.l}>
                                <div
                                    className="text-lg font-light"
                                    style={{ color: '#1a1816', letterSpacing: '-0.01em' }}
                                >
                                    {s.v}
                                </div>
                                <div
                                    className="text-[10px] tracking-[0.22em] uppercase mt-0.5"
                                    style={{ color: '#a09890' }}
                                >
                                    {s.l}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Scroll indicator */}
                    <div
                        className="flex flex-col items-center gap-2"
                        style={{ color: '#bab4ac' }}
                    >
                        <span className="text-[9px] tracking-[0.3em] uppercase">Scroll</span>
                        <div
                            className="w-px bg-current animate-pulse"
                            style={{ height: 32, opacity: 0.5 }}
                        />
                    </div>
                </div>
            </main>

            {/* ── Features — minimal, text-first ───────────────────────────── */}
            <section
                className="relative z-10 px-10 md:px-16 lg:px-24 py-24"
                style={{ borderTop: '1px solid rgba(26,24,22,0.08)' }}
            >
                {/* ── section label */}
                <p
                    className="text-[10px] tracking-[0.35em] uppercase mb-16"
                    style={{ color: '#a09890' }}
                >
                    Platform Capabilities
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14 max-w-5xl">
                    {[
                        {
                            n: '01',
                            title: 'Container Deployments',
                            desc: 'Every project runs in an isolated Docker container. Framework auto-detected and containerised — no config required.',
                        },
                        {
                            n: '02',
                            title: 'AI Ops Intelligence',
                            desc: 'Post-deployment, an AI engine analyses your services and surfaces cost-optimisation recommendations with confidence scores.',
                        },
                        {
                            n: '03',
                            title: 'Git Integration',
                            desc: 'Connect GitHub or Bitbucket via OAuth. Repositories are read, branch detected and build configured automatically.',
                        },
                        {
                            n: '04',
                            title: 'Visual Infrastructure',
                            desc: 'A live node-graph on your dashboard maps every project, service, and integration in real-time.',
                        },
                        {
                            n: '05',
                            title: 'Real-Time Notifications',
                            desc: 'Deployment and AI insight alerts are delivered instantly and persist per-device via database-backed preferences.',
                        },
                        {
                            n: '06',
                            title: 'Zero-Config Builds',
                            desc: 'Next.js, React, Node.js, and 50+ frameworks detected and built automatically. From push to production in under 30 seconds.',
                        },
                    ].map(f => (
                        <div key={f.n} className="group">
                            <p
                                className="text-[10px] tracking-[0.3em] mb-4"
                                style={{ color: '#c0b8b0' }}
                            >
                                {f.n}
                            </p>
                            <h3
                                className="mb-3 font-light"
                                style={{ fontSize: '1.05rem', color: '#1a1816', letterSpacing: '-0.01em' }}
                            >
                                {f.title}
                            </h3>
                            <p
                                className="font-light leading-relaxed"
                                style={{ fontSize: '0.85rem', color: '#8a847c' }}
                            >
                                {f.desc}
                            </p>
                            {/* Underline accent */}
                            <div
                                className="mt-5 h-px transition-all duration-500 ease-out"
                                style={{
                                    background: 'rgba(26,24,22,0.1)',
                                    width: '2rem',
                                }}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────────────────── */}
            <section
                className="relative z-10 px-10 md:px-16 lg:px-24 py-24"
                style={{ borderTop: '1px solid rgba(26,24,22,0.08)' }}
            >
                <div className="max-w-lg">
                    <h2
                        className="mb-6 font-light"
                        style={{
                            fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                            color: '#1a1816',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.15,
                        }}
                    >
                        Ready to build something worth deploying?
                    </h2>
                    <p
                        className="mb-10 font-light"
                        style={{ fontSize: '0.9rem', color: '#8a847c', lineHeight: 1.75 }}
                    >
                        Join developers who ship with clarity and confidence. No configuration. No noise. Just craft.
                    </p>
                    <Link
                        href="/sign-up"
                        className="inline-block text-[12px] tracking-[0.2em] uppercase font-light px-10 py-4 transition-all duration-300 hover:opacity-75"
                        style={{ background: '#1a1816', color: '#f7f5f2' }}
                    >
                        Start for free
                    </Link>
                </div>
            </section>

            {/* ── Footer ────────────────────────────────────────────────────── */}
            <footer
                className="relative z-10 flex items-center justify-between px-10 md:px-16 lg:px-24 py-8"
                style={{ borderTop: '1px solid rgba(26,24,22,0.08)' }}
            >
                <span
                    className="text-[11px] tracking-[0.2em] uppercase font-light"
                    style={{ color: '#bab4ac' }}
                >
                    © 2026 NexusOps Cloud
                </span>
                <div className="flex items-center gap-6">
                    {[
                        { l: 'Docs', h: '/docs' },
                        { l: 'Dashboard', h: '/dashboard' },
                    ].map(item => (
                        <Link
                            key={item.l}
                            href={item.h}
                            className="text-[11px] tracking-[0.18em] uppercase font-light transition-opacity duration-300 hover:opacity-50"
                            style={{ color: '#9e9890' }}
                        >
                            {item.l}
                        </Link>
                    ))}
                </div>
            </footer>
        </div>
    )
}
