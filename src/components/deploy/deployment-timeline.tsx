'use client'

import { CheckCircle2, XCircle, Loader2, Clock, Bot, ChevronRight } from 'lucide-react'

interface DeploymentAttempt {
    id: string
    status: string
    retryCount: number
    buildLogs: string | null
    aiFixStatus: string | null
    aiPatchData: any | null
    createdAt: string
    buildTime: number | null
    url: string | null
}

interface DeploymentTimelineProps {
    chain: DeploymentAttempt[]
    currentId: string
    onSelectAttempt: (id: string) => void
}

const statusConfig: Record<string, { icon: any; color: string; label: string; dotColor: string }> = {
    PENDING: { icon: Clock, color: 'text-slate-400', label: 'Pending', dotColor: 'bg-slate-500' },
    QUEUED: { icon: Clock, color: 'text-blue-400', label: 'Queued', dotColor: 'bg-blue-500' },
    BUILDING: { icon: Loader2, color: 'text-yellow-400', label: 'Building', dotColor: 'bg-yellow-500' },
    DEPLOYING: { icon: Loader2, color: 'text-purple-400', label: 'Deploying', dotColor: 'bg-purple-500' },
    SUCCESS: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Success', dotColor: 'bg-emerald-500' },
    FAILED: { icon: XCircle, color: 'text-red-400', label: 'Failed', dotColor: 'bg-red-500' },
    CANCELLED: { icon: XCircle, color: 'text-slate-400', label: 'Cancelled', dotColor: 'bg-slate-500' },
    ANALYZING: { icon: Loader2, color: 'text-blue-400', label: 'AI Analyzing', dotColor: 'bg-blue-500' },
    FIXING: { icon: Loader2, color: 'text-purple-400', label: 'AI Fixing', dotColor: 'bg-purple-500' },
    RETRYING: { icon: Loader2, color: 'text-amber-400', label: 'Retrying', dotColor: 'bg-amber-500' },
}

const AI_STATUS_LABELS: Record<string, string> = {
    ANALYZING: '🔍 Analyzing logs',
    MODIFYING: '✍️ Modifying files',
    VALIDATING: '🛡️ Validating fix',
    PAUSED: '⏸ Paused (user review)',
    RESOLVED: '✅ Fix applied',
    FAILED: '❌ Auto-fix failed',
}

function formatDuration(seconds: number | null): string {
    if (!seconds) return '-'
    if (seconds < 60) return `${seconds}s`
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

function formatRelative(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    return `${Math.floor(mins / 60)}h ago`
}

export function DeploymentTimeline({ chain, currentId, onSelectAttempt }: DeploymentTimelineProps) {
    if (!chain || chain.length === 0) return null

    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
                Attempt Timeline
            </p>
            <div className="relative">
                {/* Vertical connector line */}
                {chain.length > 1 && (
                    <div className="absolute left-[1.35rem] top-6 bottom-6 w-px bg-gradient-to-b from-slate-700 via-slate-700 to-transparent" />
                )}

                <div className="space-y-2">
                    {chain.map((attempt, idx) => {
                        const cfg = statusConfig[attempt.status] || statusConfig.PENDING
                        const Icon = cfg.icon
                        const isActive = attempt.id === currentId
                        const isSpinning = ['BUILDING', 'DEPLOYING', 'ANALYZING', 'FIXING', 'RETRYING'].includes(attempt.status)

                        return (
                            <button
                                key={attempt.id}
                                onClick={() => onSelectAttempt(attempt.id)}
                                className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left group ${
                                    isActive
                                        ? 'bg-slate-800/80 border border-slate-700/60 shadow-sm'
                                        : 'hover:bg-slate-800/40 border border-transparent'
                                }`}
                            >
                                {/* Status dot + icon */}
                                <div className="relative shrink-0 mt-0.5">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                        attempt.status === 'SUCCESS'
                                            ? 'bg-emerald-500/15 border border-emerald-500/30'
                                            : attempt.status === 'FAILED'
                                            ? 'bg-red-500/15 border border-red-500/30'
                                            : isActive
                                            ? 'bg-slate-700 border border-slate-600'
                                            : 'bg-slate-800/60 border border-slate-700/30'
                                    }`}>
                                        <Icon className={`w-3.5 h-3.5 ${cfg.color} ${isSpinning && isActive ? 'animate-spin' : ''}`} />
                                    </div>
                                    {/* AI badge */}
                                    {attempt.retryCount > 0 && (
                                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-purple-500 flex items-center justify-center">
                                            <Bot className="w-2 h-2 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                            {attempt.retryCount === 0 ? 'Initial Deploy' : `AI Retry #${attempt.retryCount}`}
                                        </span>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                                            {isActive && <ChevronRight className="w-3 h-3 text-slate-500" />}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-slate-500">{formatRelative(attempt.createdAt)}</span>
                                        {attempt.buildTime && (
                                            <span className="text-xs text-slate-600">⏱ {formatDuration(attempt.buildTime)}</span>
                                        )}
                                    </div>

                                    {/* AI Status tag */}
                                    {attempt.aiFixStatus && AI_STATUS_LABELS[attempt.aiFixStatus] && (
                                        <div className="mt-1.5">
                                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/15 text-purple-400">
                                                {AI_STATUS_LABELS[attempt.aiFixStatus]}
                                            </span>
                                        </div>
                                    )}

                                    {/* Success URL */}
                                    {attempt.status === 'SUCCESS' && attempt.url && (
                                        <a
                                            href={attempt.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className="mt-1 text-[10px] text-emerald-400 hover:text-emerald-300 truncate block"
                                        >
                                            🌐 {attempt.url}
                                        </a>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
