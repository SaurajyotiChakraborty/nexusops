'use client'

import { useModeStore } from '@/stores/useModeStore'
import { Badge } from '@/components/ui/badge'
import { Zap } from 'lucide-react'

export function AdvancedBadge() {
    const { mode } = useModeStore()

    if (mode !== 'advanced') return null

    return (
        <Badge className="bg-warning/15 text-warning border-warning/30 gap-1 animate-pulse text-xs font-semibold">
            <Zap className="h-3 w-3" />
            ADVANCED MODE
        </Badge>
    )
}
