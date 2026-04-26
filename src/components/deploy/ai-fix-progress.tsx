'use client'

import { useEffect, useRef } from 'react'
import { CheckCircle2, Loader2, Search, Code2, Shield, Zap, XCircle } from 'lucide-react'

interface AIFixProgressProps {
    aiFixStatus: string | null
    retryCount: number
    maxRetries?: number
}

const stages = [
    {
        key: 'ANALYZING',
        icon: Search,
        label: 'Analyzing Logs',
        description: 'Reading build output and identifying error patterns',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        glow: 'shadow-blue-500/20',
    },
    {
        key: 'MODIFYING',
        icon: Code2,
        label: 'Modifying Files',
        description: 'Applying minimal targeted code fix',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        glow: 'shadow-purple-500/20',
    },
    {
        key: 'VALIDATING',
        icon: Shield,
        label: 'Validating Fix',
        description: 'Checking safety and correctness before redeployment',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        glow: 'shadow-amber-500/20',
    },
    {
        key: 'RESOLVED',
        icon: Zap,
        label: 'Redeploying',
        description: 'Triggering retry deployment with the applied fix',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        glow: 'shadow-emerald-500/20',
    },
]

function getStageIndex(status: string | null): number {
    if (!status) return -1
    const idx = stages.findIndex(s => s.key === status)
    return idx
}

export function AIFixProgressPanel({ aiFixStatus, retryCount, maxRetries = 3 }: AIFixProgressProps) {
    const currentIdx = getStageIndex(aiFixStatus)
    const isFailed = aiFixStatus === 'FAILED'
    const isPaused = aiFixStatus === 'PAUSED'

    if (!aiFixStatus || aiFixStatus === 'RESOLVED') return null

    return (
        <div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 via-slate-900/80 to-slate-900/80 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-lg shadow-purple-500/50" />
                        {!isFailed && !isPaused && (
                            <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-50" />
                        )}
                    </div>
                    <span className="text-sm font-semibold text-purple-200">
                        🤖 AI Auto-Fix Engine
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Attempt</span>
                    <span className="font-bold text-purple-300">{retryCount + 1}</span>
                    <span>/ {maxRetries}</span>
                </div>
            </div>

            {/* Status Message */}
            {isPaused && (
                <div className="mx-5 mt-4 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                    ⏸ Auto-fix paused — reviewing with AI assistant. Click Resume to continue.
                </div>
            )}
            {isFailed && (
                <div className="mx-5 mt-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" />
                    Auto-fix could not determine a safe resolution. Manual review required.
                </div>
            )}

            {/* Stage Steps */}
            <div className="p-5 space-y-3">
                {stages.map((stage, idx) => {
                    const Icon = stage.icon
                    const isDone = currentIdx > idx
                    const isActive = currentIdx === idx && !isFailed && !isPaused
                    const isPending = currentIdx < idx && !isFailed

                    return (
                        <div
                            key={stage.key}
                            className={`
                                flex items-center gap-4 px-4 py-3 rounded-lg border transition-all duration-500
                                ${isActive ? `${stage.bg} ${stage.border} shadow-lg ${stage.glow}` : ''}
                                ${isDone ? 'bg-emerald-500/5 border-emerald-500/10' : ''}
                                ${isPending || isFailed ? 'bg-slate-800/30 border-slate-700/20 opacity-40' : ''}
                                ${isPaused && currentIdx === idx ? `${stage.bg} ${stage.border} opacity-60` : ''}
                            `}
                        >
                            {/* Icon */}
                            <div className={`shrink-0 ${isDone ? 'text-emerald-400' : isActive ? stage.color : 'text-slate-600'}`}>
                                {isDone ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                ) : isActive ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${isDone ? 'text-emerald-300' : isActive ? stage.color : 'text-slate-500'}`}>
                                    {stage.label}
                                </p>
                                {isActive && (
                                    <p className="text-xs text-slate-400 mt-0.5 truncate">{stage.description}</p>
                                )}
                            </div>

                            {/* Active pulse bar */}
                            {isActive && (
                                <div className="w-16 h-1.5 rounded-full overflow-hidden bg-slate-700">
                                    <div
                                        className={`h-full rounded-full animate-pulse ${stage.color.replace('text-', 'bg-')}`}
                                        style={{ width: '60%' }}
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Retry progress bar */}
            <div className="px-5 pb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Retry attempts used</span>
                    <span>{retryCount} of {maxRetries}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-700"
                        style={{ width: `${(retryCount / maxRetries) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
