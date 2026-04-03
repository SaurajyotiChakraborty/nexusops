'use client'

import Link from 'next/link'
import { useRef, useEffect, useCallback, useState } from 'react'

// ─── Hero Reveal Canvas ───────────────────────────────────────────────────────

function SculptureCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseRef = useRef({ x: -1, y: -1 })   // -1 = off-screen / not yet moved
    const smoothRef = useRef({ x: -1, y: -1 })
    const imgRef = useRef<HTMLImageElement | null>(null)
    const isMobileRef = useRef(false)

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
        isMobileRef.current = /Mobi|Android/i.test(navigator.userAgent)
        const isMobile = isMobileRef.current

        const canvas = canvasRef.current
        if (!canvas) return

        // ── Three-canvas architecture ────────────────────────────────────────
        // imgCanvas    → hero image (base layer)
        // overlayCanvas → white sheet with holes (destination-out masking)
        // main canvas  → composites both, then draws water-ripple rings on top
        const imgCanvas = document.createElement('canvas')
        const imgCtx = imgCanvas.getContext('2d')!
        const overlayCanvas = document.createElement('canvas')
        const overlayCtx = overlayCanvas.getContext('2d')!
        const ctx = canvas.getContext('2d')!

        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        let w = 0, h = 0, animId = 0
        const startTime = performance.now()
        let lastFrameTime = startTime

        // ── Swirl spot type ───────────────────────────────────────────────────
        // Each spot orbits an ellipse around a pivot point and auto-changes
        // direction after a random interval, creating the swirl effect.
        interface SwirlSpot {
            pivotX: number    // orbit centre (normalised 0–1)
            pivotY: number
            angle: number     // current orbit angle (radians)
            orbitRX: number   // ellipse half-width (px)
            orbitRY: number   // ellipse half-height (px)
            tiltAngle: number // rotate the whole ellipse for variety
            angV: number      // angular velocity (rad / ms) — sign = direction
            revealR: number   // reveal gradient radius (px)
            alpha: number     // peak erase alpha
            birth: number
            life: number
            nextTurn: number  // timestamp when direction/speed changes
        }

        const spots: SwirlSpot[] = []

        const resize = () => {
            w = window.innerWidth
            h = window.innerHeight
            for (const c of [canvas, imgCanvas, overlayCanvas]) {
                c.width  = w * dpr
                c.height = h * dpr
                c.style.width  = `${w}px`
                c.style.height = `${h}px`
            }
        }

        const img = new Image()
        img.src = '/hero-bg.png'
        imgRef.current = img

        resize()
        window.addEventListener('resize', resize)
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('touchmove', onTouchMove, { passive: true })

        // ─── Spawn a swirl spot ───────────────────────────────────────────────
        const spawnSpot = () => {
            const now = performance.now()
            const minR = Math.min(w, h) * (isMobile ? 0.14 : 0.19)
            const maxR = Math.min(w, h) * (isMobile ? 0.28 : 0.40)
            // orbit radii — large enough to make the swirl visible
            const baseOrbit = Math.min(w, h) * (isMobile ? 0.07 : 0.11)
            spots.push({
                pivotX:    0.08 + Math.random() * 0.84,
                pivotY:    0.08 + Math.random() * 0.84,
                angle:     Math.random() * Math.PI * 2,
                orbitRX:   baseOrbit * (0.5 + Math.random() * 1.0),
                orbitRY:   baseOrbit * (0.3 + Math.random() * 0.8),
                tiltAngle: Math.random() * Math.PI,
                // random direction (sign) + speed in range ~0.22–0.45 °/frame @60fps
                angV:      (0.00022 + Math.random() * 0.00028) * (Math.random() < 0.5 ? 1 : -1),
                revealR:   minR + Math.random() * (maxR - minR),
                alpha:     0.44 + Math.random() * 0.38,
                birth:     now,
                life:      8500 + Math.random() * 6000,
                nextTurn:  now + 2200 + Math.random() * 2800,
            })
        }

        const spotInterval = setInterval(spawnSpot, isMobile ? 1900 : 1050)
        for (let i = 0; i < (isMobile ? 2 : 5); i++) spawnSpot()

        // ─── Draw hero image layer ───────────────────────────────────────────
        const drawImage = (mx: number, my: number) => {
            imgCtx.save()
            imgCtx.scale(dpr, dpr)
            imgCtx.clearRect(0, 0, w, h)

            if (img.complete && img.naturalWidth) {
                const iR = img.naturalWidth / img.naturalHeight
                const cR = w / h
                let iW, iH, iX, iY
                if (cR > iR) { iW = w;  iH = w / iR; iX = 0;          iY = (h - iH) / 2 }
                else          { iH = h;  iW = h * iR; iX = (w - iW) / 2; iY = 0 }

                const parallax = isMobile ? 0 : 10
                imgCtx.filter = 'saturate(0.75) brightness(1.05)'
                imgCtx.drawImage(img, iX + (mx - 0.5) * -parallax, iY + (my - 0.5) * -parallax, iW, iH)
                imgCtx.filter = 'none'

                // soft vignette
                const vig = imgCtx.createRadialGradient(w / 2, h / 2, h * 0.20, w / 2, h / 2, h * 0.92)
                vig.addColorStop(0, 'rgba(0,0,0,0)')
                vig.addColorStop(1, 'rgba(4,3,2,0.48)')
                imgCtx.fillStyle = vig
                imgCtx.fillRect(0, 0, w, h)
            } else {
                imgCtx.fillStyle = '#18161400'
                imgCtx.fillRect(0, 0, w, h)
            }
            imgCtx.restore()
        }

        // ─── Draw overlay (white sheet + swirl holes + cursor reveal) ─────────
        // IMPORTANT: we always use fillRect (never arc/ellipse fill) so there is
        // NO clipping boundary — the gradient falls to 0 naturally and the edge
        // is invisible. This removes all harsh circular lines.
        const drawOverlay = (now: number, rp: number) => {
            overlayCtx.save()
            overlayCtx.scale(dpr, dpr)

            // --- white base ---
            overlayCtx.globalCompositeOperation = 'source-over'
            overlayCtx.fillStyle = 'rgba(248,246,243,1)'
            overlayCtx.fillRect(0, 0, w, h)

            // --- erase mode: punch transparent holes ---
            overlayCtx.globalCompositeOperation = 'destination-out'

            // ── SWIRL SPOTS ─────────────────────────────────────────────────
            for (let i = spots.length - 1; i >= 0; i--) {
                const s = spots[i]
                const age = now - s.birth
                if (age >= s.life) { spots.splice(i, 1); continue }

                // life envelope: ease-in 18%, hold, ease-out 28%
                const tLife = age / s.life
                let lifeEase: number
                if      (tLife < 0.18) lifeEase = tLife / 0.18
                else if (tLife < 0.72) lifeEase = 1
                else                   lifeEase = 1 - (tLife - 0.72) / 0.28
                lifeEase = lifeEase * lifeEase * (3 - 2 * lifeEase)

                const peak = s.alpha * lifeEase * rp
                if (peak < 0.008) continue

                // compute position on the swirl orbit (tilted ellipse)
                const cosT = Math.cos(s.tiltAngle)
                const sinT = Math.sin(s.tiltAngle)
                const ex   = Math.cos(s.angle) * s.orbitRX
                const ey   = Math.sin(s.angle) * s.orbitRY
                const cx   = s.pivotX * w + (ex * cosT - ey * sinT)
                const cy   = s.pivotY * h + (ex * sinT + ey * cosT)

                const r = s.revealR

                // SOFT gradient (NO arc clip — fillRect lets gradient edge = 0)
                const g = overlayCtx.createRadialGradient(cx, cy, 0, cx, cy, r)
                g.addColorStop(0,    `rgba(0,0,0,${peak})`)
                g.addColorStop(0.30, `rgba(0,0,0,${peak * 0.80})`)
                g.addColorStop(0.55, `rgba(0,0,0,${peak * 0.42})`)
                g.addColorStop(0.75, `rgba(0,0,0,${peak * 0.14})`)
                g.addColorStop(0.90, `rgba(0,0,0,${peak * 0.03})`)
                g.addColorStop(1,    'rgba(0,0,0,0)')
                overlayCtx.fillStyle = g
                overlayCtx.fillRect(cx - r, cy - r, r * 2, r * 2)   // ← NO hard edge
            }

            // ── CURSOR REVEAL (soft base — also fillRect, no arc clip) ───────
            const mx = smoothRef.current.x
            const my = smoothRef.current.y
            if (!isMobile && mx >= 0 && my >= 0) {
                const cx   = mx * w
                const cy   = my * h
                const gR   = Math.min(w, h) * 0.21

                // base soft reveal
                overlayCtx.globalCompositeOperation = 'destination-out'
                const cg = overlayCtx.createRadialGradient(cx, cy, 0, cx, cy, gR)
                cg.addColorStop(0,    `rgba(0,0,0,${0.88 * rp})`)
                cg.addColorStop(0.28, `rgba(0,0,0,${0.72 * rp})`)
                cg.addColorStop(0.56, `rgba(0,0,0,${0.30 * rp})`)
                cg.addColorStop(0.80, `rgba(0,0,0,${0.07 * rp})`)
                cg.addColorStop(1,    'rgba(0,0,0,0)')
                overlayCtx.fillStyle = cg
                overlayCtx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2)   // ← fillRect, no clip


            }

            overlayCtx.restore()
        }

        // ─── Main rAF loop ───────────────────────────────────────────────────
        const draw = (now: number) => {
            const dt = Math.min(now - lastFrameTime, 50)   // cap at 50 ms (tab unfocus)
            lastFrameTime = now

            // Global reveal ramp: 0 → 1 over 2.5 s, smoothstep
            const elapsed = now - startTime
            const rawRP   = Math.min(1, elapsed / 2500)
            const rp      = rawRP * rawRP * (3 - 2 * rawRP)

            // advance each spot's orbit angle (frame-rate independent)
            for (const s of spots) {
                s.angle += s.angV * dt
                // smooth direction / speed change every 2–5 s
                if (now >= s.nextTurn) {
                    // small random perturbation — keep same general direction half the time
                    const flip  = Math.random() < 0.45 ? -1 : 1
                    s.angV      = Math.abs(s.angV) * flip *
                                  (0.7 + Math.random() * 0.6)              // ±30 % speed tweak
                    s.angV      = Math.sign(s.angV) *
                                  Math.max(0.00015, Math.min(0.00055, Math.abs(s.angV)))
                    s.nextTurn  = now + 2200 + Math.random() * 2800
                }
            }

            const mx = smoothRef.current.x >= 0 ? smoothRef.current.x : 0.5
            const my = smoothRef.current.y >= 0 ? smoothRef.current.y : 0.5

            drawImage(mx, my)
            drawOverlay(now, rp)

            ctx.save()
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(imgCanvas,   0, 0)    // hero image below
            ctx.drawImage(overlayCanvas, 0, 0)  // white + holes on top
            ctx.restore()

            animId = requestAnimationFrame(draw)
        }

        animId = requestAnimationFrame(draw)

        // ─── Mouse smoothing (independent rAF) ──────────────────────────────
        let smoothId: number
        const smooth = () => {
            const lerpF = isMobile ? 0.07 : 0.052
            const mx = mouseRef.current.x
            const my = mouseRef.current.y
            if (mx >= 0) {
                smoothRef.current.x += (mx - smoothRef.current.x) * lerpF
                smoothRef.current.y += (my - smoothRef.current.y) * lerpF
            }
            smoothId = requestAnimationFrame(smooth)
        }
        smoothId = requestAnimationFrame(smooth)

        return () => {
            cancelAnimationFrame(animId)
            cancelAnimationFrame(smoothId)
            clearInterval(spotInterval)
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
            style={{ background: '#ffffff', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
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
                            style={{ ...fadeD(200), color: '#9e9890', textShadow: '0 1px 8px rgba(255,255,255,0.7)' }}
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
                                textShadow: '0 2px 16px rgba(255,255,255,0.6), 0 1px 4px rgba(255,255,255,0.4)',
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
                                textShadow: '0 1px 10px rgba(255,255,255,0.65)',
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
