'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Mode = 'basic' | 'advanced'

interface ModeState {
    mode: Mode
    setMode: (mode: Mode) => void
    toggleMode: () => void
}

export const useModeStore = create<ModeState>()(
    persist(
        (set) => ({
            mode: 'basic',
            setMode: (mode) => set({ mode }),
            toggleMode: () =>
                set((state) => ({
                    mode: state.mode === 'basic' ? 'advanced' : 'basic',
                })),
        }),
        {
            name: 'nexusops-mode',
        }
    )
)
