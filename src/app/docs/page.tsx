'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import {
    Zap,
    GitBranch,
    Rocket,
    Container,
    Sparkles,
    Eye,
    Settings,
    ChevronRight,
    ArrowRight,
    Terminal,
    CheckCircle2,
    AlertCircle,
    Menu,
    X,
    Bell,
} from 'lucide-react'

// ─── Sidebar Navigation Data ────────────────────────────────────────────────

const NAV = [
    {
        group: 'Introduction',
        items: [
            { label: 'Overview', id: 'overview' },
            { label: 'How It Works', id: 'how-it-works' },
        ],
    },
    {
        group: 'Getting Started',
        items: [
            { label: 'Sign Up', id: 'sign-up' },
            { label: 'Connect Git Provider', id: 'connect-git' },
            { label: 'Import a Project', id: 'import-project' },
        ],
    },
    {
        group: 'Deployments',
        items: [
            { label: 'Configure & Build', id: 'configure' },
            { label: 'Deploy', id: 'deploy' },
            { label: 'Live URL & Logs', id: 'live-url' },
        ],
    },
    {
        group: 'AI Ops',
        items: [
            { label: 'Recommendations', id: 'ai-recommendations' },
            { label: 'Notification Settings', id: 'notifications' },
        ],
    },
    {
        group: 'Reference',
        items: [
            { label: 'Visual Infrastructure', id: 'infrastructure' },
            { label: 'Need Help?', id: 'need-help' },
        ],
    },
]

// Collect all anchor IDs in order for scroll-spy
const ALL_IDS = NAV.flatMap(g => g.items.map(i => i.id))

// ─── Code Block Component ────────────────────────────────────────────────────

function Code({ children }: { children: string }) {
    return (
        <code className="inline-block font-mono text-[13px] bg-muted text-foreground px-1.5 py-0.5 rounded border border-border">
            {children}
        </code>
    )
}

function CodeBlock({ children, lang = 'bash' }: { children: string; lang?: string }) {
    return (
        <div className="my-4 rounded-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{lang}</span>
                <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <pre className="p-4 overflow-x-auto bg-[hsl(var(--background))]">
                <code className="font-mono text-sm text-foreground leading-relaxed">{children}</code>
            </pre>
        </div>
    )
}

function Note({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'warning' }) {
    const isWarning = type === 'warning'
    return (
        <div className={`flex gap-3 my-4 p-4 rounded-lg border text-sm leading-relaxed ${isWarning
            ? 'bg-warning/5 border-warning/30 text-foreground'
            : 'bg-primary/5 border-primary/20 text-foreground'
            }`}>
            {isWarning
                ? <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                : <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            }
            <div>{children}</div>
        </div>
    )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
    return (
        <div className="flex gap-5 group">
            <div className="flex flex-col items-center shrink-0">
                <div className="w-8 h-8 rounded-full border-2 border-primary/40 bg-primary/8 flex items-center justify-center text-primary font-semibold text-sm group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all duration-200">
                    {n}
                </div>
                <div className="w-px flex-1 bg-border mt-2" />
            </div>
            <div className="pb-8 flex-1 min-w-0">
                <h4 className="font-semibold text-base text-foreground mb-2">{title}</h4>
                <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
            </div>
        </div>
    )
}

function Ul({ items }: { items: string[] }) {
    return (
        <ul className="mt-2 space-y-1.5">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    )
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

function Section({ id, title, subtitle, children }: {
    id: string; title: string; subtitle?: string; children: React.ReactNode
}) {
    return (
        <section id={id} className="scroll-mt-20 py-8 border-b border-border last:border-b-0">
            <h2 className="text-xl font-bold text-foreground mb-1">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{subtitle}</p>}
            <div className="text-sm text-muted-foreground leading-[1.8]">{children}</div>
        </section>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DocsPage() {
    const [activeId, setActiveId] = useState('overview')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const observerRef = useRef<IntersectionObserver | null>(null)

    // Scroll-spy via IntersectionObserver
    useEffect(() => {
        const sections = ALL_IDS.map(id => document.getElementById(id)).filter(Boolean)

        observerRef.current = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                        break
                    }
                }
            },
            { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
        )

        sections.forEach(s => observerRef.current!.observe(s!))
        return () => observerRef.current?.disconnect()
    }, [])

    const scrollTo = useCallback((id: string) => {
        setSidebarOpen(false)
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* ─── Top Navigation ─────────────────────────────────────────── */}
            <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur-sm">
                <div className="flex items-center justify-between h-full px-4 md:px-6 max-w-screen-2xl mx-auto">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 shrink-0">
                        <div className="w-7 h-7 rounded-md gradient-accent flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-base tracking-tight">NexusOps</span>
                        <span className="hidden sm:block text-muted-foreground/60 select-none mx-0.5">/</span>
                        <span className="hidden sm:block text-sm text-muted-foreground">Docs</span>
                    </Link>

                    {/* Right controls */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link
                            href="/dashboard"
                            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                            Dashboard
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        {/* Mobile sidebar toggle */}
                        <button
                            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
                            onClick={() => setSidebarOpen(o => !o)}
                        >
                            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* ─── Body: 3-Column Layout ──────────────────────────────────── */}
            <div className="pt-14 max-w-screen-2xl mx-auto flex">

                {/* ── Left Sidebar ─────────────────────────────────────────── */}
                <aside className={`
                    fixed md:sticky top-14 left-0 z-40 h-[calc(100vh-3.5rem)]
                    w-64 shrink-0 overflow-y-auto border-r border-border bg-background
                    transition-transform duration-200 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <nav className="py-6 px-4 space-y-6">
                        {NAV.map(group => (
                            <div key={group.group}>
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-2">
                                    {group.group}
                                </p>
                                <ul className="space-y-0.5">
                                    {group.items.map(item => (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => scrollTo(item.id)}
                                                className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-all duration-150 flex items-center gap-2 ${activeId === item.id
                                                    ? 'bg-primary/10 text-primary font-medium'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                                    }`}
                                            >
                                                {activeId === item.id && (
                                                    <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                                                )}
                                                {item.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/40 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* ── Main Content ──────────────────────────────────────────── */}
                <main className="flex-1 min-w-0 px-6 md:px-10 lg:px-16 py-6 max-w-3xl">

                    {/* Page header */}
                    <div className="mb-8 pb-6 border-b border-border">
                        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Documentation</p>
                        <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">NexusOps Docs</h1>
                        <p className="text-muted-foreground leading-relaxed">
                            Everything you need to deploy, manage, and monitor your applications on NexusOps—from your first commit to production-scale AI-optimized infrastructure.
                        </p>
                    </div>

                    {/* ── OVERVIEW ──────────────────────────────────────────── */}
                    <Section
                        id="overview"
                        title="Overview"
                        subtitle="NexusOps is an AI-powered cloud hosting platform that turns your Git repository into a live, containerized application in seconds."
                    >
                        <p className="mb-3">
                            Connect your GitHub or Bitbucket account, select a repository, and NexusOps automatically detects your framework, builds a Docker container, and deploys your app—no configuration files needed.
                        </p>
                        <p>
                            Once live, the AI Ops engine continuously monitors your services, generating cost-optimization recommendations and alerting you via the real-time notification system.
                        </p>

                        {/* Architecture pipeline */}
                        <div className="mt-6 flex items-center gap-2 flex-wrap">
                            {[
                                { icon: '📦', label: 'Git Push' },
                                { icon: '⚡', label: 'Auto Build' },
                                { icon: '🐳', label: 'Docker' },
                                { icon: '🚀', label: 'Deploy' },
                                { icon: '🤖', label: 'AI Monitor' },
                            ].map((item, i, arr) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground">
                                        <span className="text-base">{item.icon}</span>
                                        {item.label}
                                    </div>
                                    {i < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* ── HOW IT WORKS ─────────────────────────────────────── */}
                    <Section id="how-it-works" title="How It Works">
                        <div className="grid sm:grid-cols-2 gap-4 mt-2">
                            {[
                                {
                                    icon: Container,
                                    title: 'Containerized Deployments',
                                    desc: 'Every project runs in an isolated Docker container. NexusOps auto-detects your framework and generates an optimized Dockerfile.',
                                },
                                {
                                    icon: Sparkles,
                                    title: 'AI-Powered Intelligence',
                                    desc: 'The AI Ops engine analyzes running containers and produces actionable cost-optimization and performance recommendations.',
                                },
                                {
                                    icon: GitBranch,
                                    title: 'Git Integration',
                                    desc: 'Connect GitHub or Bitbucket via OAuth. NexusOps reads your default branch and repository metadata to configure the build.',
                                },
                                {
                                    icon: Eye,
                                    title: 'Visual Infrastructure',
                                    desc: 'The Dashboard renders a live graph of your projects, services, and integrations so you always have a clear picture of your environment.',
                                },
                            ].map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon className="w-4 h-4 text-primary" />
                                        <span className="font-semibold text-[13px] text-foreground">{title}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* ─────────────── GETTING STARTED ──────────────────────── */}
                    <div className="mt-2 mb-2">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest py-3">Getting Started</p>
                    </div>

                    {/* ── SIGN UP ───────────────────────────────────────────── */}
                    <Section id="sign-up" title="Sign Up">
                        <p className="mb-4">Create your NexusOps account using your email address and a secure password via our Clerk-powered authentication system.</p>
                        <ol className="space-y-1.5 ml-2">
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">1.</span> Visit <Code>nexusops.com</Code> and click <strong>Get Started</strong>.</li>
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">2.</span> Enter your email and choose a strong password.</li>
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">3.</span> Verify your email address via the confirmation link.</li>
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">4.</span> You will be redirected to your <strong>Dashboard</strong> automatically.</li>
                        </ol>
                    </Section>

                    {/* ── CONNECT GIT ───────────────────────────────────────── */}
                    <Section id="connect-git" title="Connect Git Provider">
                        <p className="mb-4">NexusOps supports GitHub and Bitbucket. Connect one or both to import repositories.</p>
                        <ol className="space-y-1.5 ml-2 mb-4">
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">1.</span> Open <strong>Settings</strong> from the left sidebar.</li>
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">2.</span> Scroll to <strong>Connected Accounts</strong>.</li>
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">3.</span> Click <strong>Connect GitHub</strong> or <strong>Connect Bitbucket</strong>.</li>
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">4.</span> Authorize NexusOps in the OAuth popup.</li>
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">5.</span> Your repositories are now accessible in the <strong>Deploy</strong> page.</li>
                        </ol>
                        <Note>
                            You can connect both providers simultaneously. Repositories from all connected accounts will be listed together.
                        </Note>
                    </Section>

                    {/* ── IMPORT PROJECT ────────────────────────────────────── */}
                    <Section id="import-project" title="Import a Project">
                        <p className="mb-4">Select a repository to import. NexusOps will inspect it to determine the framework and default branch.</p>
                        <ol className="space-y-1.5 ml-2 mb-4">
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">1.</span> Navigate to <strong>Deploy</strong> in the sidebar.</li>
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">2.</span> Choose <strong>GitHub</strong>, <strong>Bitbucket</strong>, or paste a <strong>Manual Git URL</strong>.</li>
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">3.</span> Select a repository from the list.</li>
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">4.</span> NexusOps auto-detects the framework (Next.js, React, Node, etc.) and branch.</li>
                        </ol>
                        <CodeBlock lang="example manual url">
{`https://github.com/your-org/your-repo.git`}
                        </CodeBlock>
                    </Section>

                    {/* ─────────────── DEPLOYMENTS ──────────────────────────── */}
                    <div className="mt-2 mb-2">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest py-3">Deployments</p>
                    </div>

                    {/* ── CONFIGURE ─────────────────────────────────────────── */}
                    <Section id="configure" title="Configure & Build">
                        <p className="mb-4">After importing, review the auto-detected configuration. Most projects require zero changes.</p>
                        <div className="space-y-3">
                            <div>
                                <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">Framework</p>
                                <p>Automatically detected from <Code>package.json</Code> or project structure. Override if needed.</p>
                            </div>
                            <div>
                                <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">Build Command</p>
                                <CodeBlock>{`npm run build`}</CodeBlock>
                            </div>
                            <div>
                                <p className="font-medium text-foreground text-xs uppercase tracking-wide mb-1">Environment Variables</p>
                                <p>Add key-value pairs for your app's runtime secrets. These are injected at build time and kept encrypted.</p>
                            </div>
                        </div>
                        <Note type="warning">
                            Never commit <Code>.env</Code> files with secrets to your repository. Use NexusOps environment variables instead.
                        </Note>
                    </Section>

                    {/* ── DEPLOY ────────────────────────────────────────────── */}
                    <Section id="deploy" title="Deploy">
                        <p className="mb-4">Once configuration looks correct, trigger the deployment.</p>
                        <ol className="space-y-1.5 ml-2 mb-4">
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">1.</span> Click the <strong>Deploy</strong> button.</li>
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">2.</span> Watch real-time build logs stream in the terminal panel.</li>
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">3.</span> NexusOps builds a Docker image and starts a container.</li>
                            <li className="flex gap-2"><span className="text-primary font-semibold shrink-0">4.</span> On success, a unique <Code>http://&lt;host&gt;:&lt;port&gt;</Code> URL is generated.</li>
                        </ol>
                        <p>Deployment typically completes in <strong>under 60 seconds</strong> for most Node.js projects.</p>
                    </Section>

                    {/* ── LIVE URL & LOGS ───────────────────────────────────── */}
                    <Section id="live-url" title="Live URL & Logs">
                        <p className="mb-3">After a successful deployment:</p>
                        <ul className="space-y-2 mb-4">
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> Your live URL appears on the <strong>Deployments</strong> and <strong>Projects</strong> pages.</li>
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> Build logs are preserved for debugging.</li>
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> A <Rocket className="inline w-3 h-3 text-success" /> <strong>Deployment Success</strong> notification appears in the bell icon (if enabled).</li>
                        </ul>
                        <Note>
                            Containers are assigned a random available port. This port is shown in the URL and the deployment details view.
                        </Note>
                    </Section>

                    {/* ─────────────── AI OPS ───────────────────────────────── */}
                    <div className="mt-2 mb-2">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest py-3">AI Ops</p>
                    </div>

                    {/* ── AI RECOMMENDATIONS ────────────────────────────────── */}
                    <Section id="ai-recommendations" title="Recommendations"
                        subtitle="After each deployment, the AI Ops engine automatically analyses the running container and generates a recommendation."
                    >
                        <p className="mb-3">Navigate to <strong>AI Ops</strong> in the sidebar to review all active recommendations. Each recommendation includes:</p>
                        <ul className="space-y-2 mb-4">
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> <strong>Type</strong> — e.g., <Code>COST_OPTIMIZATION</Code>, <Code>PERFORMANCE</Code></li>
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> <strong>Risk Level</strong> — <Code>LOW</Code>, <Code>MEDIUM</Code>, or <Code>HIGH</Code></li>
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> <strong>Confidence Score</strong> — a 0–1 probability the recommendation will improve performance</li>
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> <strong>Suggested Action</strong> — a precise instruction to apply the fix</li>
                        </ul>
                        <p className="mb-3">Example AI output for a newly deployed service:</p>
                        <CodeBlock lang="ai recommendation">
{`Title:            Right-size container resources
Type:             COST_OPTIMIZATION
Risk:             LOW
Confidence:       0.92

Explanation:
  Container is utilizing <10% of its 1.0 CPU limit.
  Downscaling to 250m will reduce cost by ~75%
  with no impact at current traffic levels.

Suggested Action:
  Set CPU limit → 250m
  Set Memory limit → 256Mi`}
                        </CodeBlock>
                    </Section>

                    {/* ── NOTIFICATIONS ─────────────────────────────────────── */}
                    <Section id="notifications" title="Notification Settings">
                        <p className="mb-3">
                            NexusOps generates two categories of real-time notifications, each independently togglable from <strong>Settings → Notifications</strong>.
                        </p>
                        <div className="space-y-3 mb-4">
                            <div className="flex gap-3 p-3 rounded-lg border border-border bg-card">
                                <Rocket className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[13px] font-semibold text-foreground">Deployment Notifications</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Fires when a deployment reaches <Code>SUCCESS</Code> state. Toggle: <Code>notifyDeployments</Code></p>
                                </div>
                            </div>
                            <div className="flex gap-3 p-3 rounded-lg border border-border bg-card">
                                <Bell className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[13px] font-semibold text-foreground">AI Ops Notifications</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Fires when an AI recommendation is generated post-deploy. Toggle: <Code>notifyAIOps</Code></p>
                                </div>
                            </div>
                        </div>
                        <p>Preferences are saved to the database and sync across all devices and sessions instantly.</p>
                    </Section>

                    {/* ─────────────── REFERENCE ────────────────────────────── */}
                    <div className="mt-2 mb-2">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest py-3">Reference</p>
                    </div>

                    {/* ── VISUAL INFRASTRUCTURE ─────────────────────────────── */}
                    <Section id="infrastructure" title="Visual Infrastructure">
                        <p className="mb-3">
                            The <strong>Dashboard</strong> page renders a live node-graph showing every project, service, and integration in your account.
                        </p>
                        <ul className="space-y-2">
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> <strong>Project nodes</strong> connect to <strong>Service nodes</strong> showing their live container status.</li>
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> <strong>Integration nodes</strong> represent GitHub / Bitbucket connections.</li>
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> Nodes are interactive—drag and zoom to explore large environments.</li>
                            <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> The graph updates in real-time as services are added or removed.</li>
                        </ul>
                    </Section>

                    {/* ── NEED HELP ─────────────────────────────────────────── */}
                    <Section id="need-help" title="Need Help?">
                        <p className="mb-4">If you can't find what you're looking for in this documentation, reach out directly.</p>
                        <a
                            href="mailto:support@nexusops.com"
                            className="inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                            Contact Support
                        </a>
                    </Section>

                </main>

                {/* ── Right Table of Contents ───────────────────────────────── */}
                <aside className="hidden xl:block w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 px-4 border-l border-border">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">On This Page</p>
                    <ul className="space-y-1">
                        {ALL_IDS.map(id => {
                            const label = NAV.flatMap(g => g.items).find(i => i.id === id)?.label ?? ''
                            return (
                                <li key={id}>
                                    <button
                                        onClick={() => scrollTo(id)}
                                        className={`w-full text-left text-xs py-1 px-2 rounded transition-colors ${activeId === id
                                            ? 'text-primary font-medium'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </aside>

            </div>

            {/* ─── Footer ─────────────────────────────────────────────────── */}
            <footer className="border-t border-border py-6 px-6">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
                    <span>© 2026 NexusOps Cloud. All rights reserved.</span>
                    <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard →</Link>
                </div>
            </footer>

        </div>
    )
}
