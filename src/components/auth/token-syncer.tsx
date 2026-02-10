'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

const TOKEN_KEY = 'nexusops_auth_token'

/**
 * TokenSyncer is a headless component that keeps the nexusops_auth_token
 * in localStorage in sync with the current Clerk session.
 */
export function TokenSyncer() {
    const { getToken, isLoaded, isSignedIn } = useAuth()
    const { user } = useUser()

    useEffect(() => {
        const syncToken = async () => {
            if (isLoaded && isSignedIn) {
                try {
                    const token = await getToken()
                    if (token) {
                        localStorage.setItem(TOKEN_KEY, token)
                        console.log('🔑 Auth token synced to localStorage')
                    }
                } catch (error) {
                    console.error('❌ Failed to sync token to localStorage:', error)
                }
            } else if (isLoaded && !isSignedIn) {
                localStorage.removeItem(TOKEN_KEY)
                console.log('👋 Auth token removed from localStorage (signed out)')
            }
        }

        syncToken()

        // Periodically refresh the token (Clerk tokens expire in ~60s)
        let interval: NodeJS.Timeout | null = null
        if (isSignedIn) {
            interval = setInterval(syncToken, 40000) // Refresh every 40 seconds (leaving 20s buffer)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isLoaded, isSignedIn, getToken, user])

    return null
}
