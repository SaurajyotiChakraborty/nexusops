'use client'

import { useState } from 'react'
import { useModeStore } from '@/stores/useModeStore'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AdvancedConfirmModal } from './AdvancedConfirmModal'

export function ModeToggle() {
    const { mode, setMode } = useModeStore()
    const [showConfirm, setShowConfirm] = useState(false)

    const handleToggle = (checked: boolean) => {
        if (checked) {
            // Switching to Advanced → show confirmation
            setShowConfirm(true)
        } else {
            // Switching back to Basic → immediate
            setMode('basic')
        }
    }

    const handleConfirm = () => {
        setMode('advanced')
        setShowConfirm(false)
    }

    const handleCancel = () => {
        setShowConfirm(false)
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <Label
                    htmlFor="mode-toggle"
                    className={`text-xs font-medium transition-colors ${mode === 'basic'
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}
                >
                    Basic
                </Label>
                <Switch
                    id="mode-toggle"
                    checked={mode === 'advanced'}
                    onCheckedChange={handleToggle}
                />
                <Label
                    htmlFor="mode-toggle"
                    className={`text-xs font-medium transition-colors ${mode === 'advanced'
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}
                >
                    Advanced
                </Label>
            </div>

            <AdvancedConfirmModal
                open={showConfirm}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </>
    )
}
