'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface AdvancedConfirmModalProps {
    open: boolean
    onConfirm: () => void
    onCancel: () => void
}

export function AdvancedConfirmModal({
    open,
    onConfirm,
    onCancel,
}: AdvancedConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                            <AlertTriangle className="h-5 w-5 text-warning" />
                        </div>
                        <DialogTitle>Enable Advanced Mode</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm leading-relaxed">
                        Advanced Mode exposes manual infrastructure
                        configuration. Only enable if you understand YAML and
                        scaling settings.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg border border-warning/20 bg-warning/5 p-3 text-sm text-muted-foreground">
                    You will gain access to:
                    <ul className="mt-2 ml-4 list-disc space-y-1">
                        <li>YAML deployment configuration editor</li>
                        <li>Manual CPU, memory, and replica controls</li>
                        <li>Environment variable editor</li>
                        <li>Rollback diff viewer</li>
                    </ul>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="bg-warning text-warning-foreground hover:bg-warning/90"
                    >
                        Enable Advanced Mode
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
