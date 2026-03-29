'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

const TOKEN_KEY = 'nexusops_auth_token'

/**
 * TokenSyncer is a headless component that keeps the nexusops_auth_token
 * in localStorage in sync with the current Clerk session.
 * Refreshes every 45 seconds to stay ahead of Clerk's ~60s token expiry.
 */
export function TokenSyncer() {
    const { getToken, isLoaded, isSignedIn } = useAuth()
    const { user } = useUser()

    useEffect(() => {
        const syncToken = async () => {
            if (isLoaded && isSignedIn) {
                try {
                    // Always request a fresh token to keep localStorage up to date
                    const token = await getToken({ skipCache: true } as any)
                    if (token) {
                        localStorage.setItem(TOKEN_KEY, token)
                    }
                } catch (error) {
                    console.error('Failed to sync token to localStorage:', error)
                }
            } else if (isLoaded && !isSignedIn) {
                localStorage.removeItem(TOKEN_KEY)
            }
        }

        syncToken()

        // Refresh every 45 seconds (leaving 15s buffer before 60s expiry)
        let interval: NodeJS.Timeout | null = null
        if (isSignedIn) {
            interval = setInterval(syncToken, 45000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isLoaded, isSignedIn, getToken, user])

    return null
}
