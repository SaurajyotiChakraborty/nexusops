'use client'

import { useAuth } from '@clerk/nextjs'
import { useCallback, useMemo } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const TOKEN_KEY = 'nexusops_auth_token'

/**
 * React hook that provides API methods with automatic token management.
 * Always fetches a fresh token from Clerk first (fast, internally cached),
 * falling back to localStorage only if Clerk isn't ready.
 */
export function useApi() {
    const { getToken } = useAuth()

    const authFetch = useCallback(
        async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
            const getHeaders = (t: string) => ({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${t}`,
                ...(options.headers as Record<string, string>),
            })

            // Strategy: Always try Clerk first (returns a fresh or cached-but-valid token),
            // then fall back to localStorage if Clerk SDK isn't ready yet.
            let token: string | null = null

            try {
                token = await getToken()
            } catch {
                // Clerk SDK not ready yet, ignore
            }

            // Fallback to localStorage if Clerk returned nothing
            if (!token) {
                token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
            }

            if (!token) {
                throw new Error('Not authenticated')
            }

            // Keep localStorage in sync with the latest valid token
            if (typeof window !== 'undefined') {
                localStorage.setItem(TOKEN_KEY, token)
            }

            let response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: getHeaders(token),
            })

            // If 401 Unauthorized, force a completely fresh token from Clerk (skip internal cache).
            if (response.status === 401) {
                try {
                    // @ts-ignore - skipCache ensures we bypass any SDK-side caching
                    const freshToken = await getToken({ skipCache: true })
                    if (freshToken) {
                        if (typeof window !== 'undefined') {
                            localStorage.setItem(TOKEN_KEY, freshToken)
                        }
                        response = await fetch(`${API_URL}${endpoint}`, {
                            ...options,
                            headers: getHeaders(freshToken),
                        })
                    }
                } catch (retryError) {
                    console.error('Retry token fetch failed:', retryError)
                }
            }

            if (!response.ok) {
                const errorBody = await response.text()
                let msg = `Request failed (${response.status})`
                try {
                    const errorJson = JSON.parse(errorBody)
                    msg = errorJson.message || msg
                } catch {
                    // keep default message
                }
                throw new Error(msg)
            }

            return response.json()
        },
        [getToken],
    )

    return useMemo(
        () => ({
            get: <T>(endpoint: string) =>
                authFetch<T>(endpoint, { method: 'GET' }),
            post: <T>(endpoint: string, body: any) =>
                authFetch<T>(endpoint, {
                    method: 'POST',
                    body: JSON.stringify(body),
                }),
            put: <T>(endpoint: string, body: any) =>
                authFetch<T>(endpoint, {
                    method: 'PUT',
                    body: JSON.stringify(body),
                }),
            patch: <T>(endpoint: string, body: any) =>
                authFetch<T>(endpoint, {
                    method: 'PATCH',
                    body: JSON.stringify(body),
                }),
            delete: <T>(endpoint: string) =>
                authFetch<T>(endpoint, { method: 'DELETE' }),
        }),
        [authFetch],
    )
}

/**
 * Standalone fetch for use in OAuth callback pages where you already have a token.
 */
export async function fetchWithToken<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {},
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers as Record<string, string>),
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    })

    if (!response.ok) {
        const errorBody = await response.text()
        let msg = `Request failed (${response.status})`
        try {
            const errorJson = JSON.parse(errorBody)
            msg = errorJson.message || msg
        } catch {
            // keep default
        }
        throw new Error(msg)
    }

    return response.json()
}
