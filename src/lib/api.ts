'use client'

import { useAuth } from '@clerk/nextjs'
import { useCallback, useMemo } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

const TOKEN_KEY = 'nexusops_auth_token'

/**
 * React hook that provides API methods with automatic token management.
 * Prioritizes nexusops_auth_token from localStorage, with a fallback
 * to fetching a fresh token from Clerk if missing.
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

            // First, try to get from localStorage
            let token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

            // Fallback: If no token in storage, always get a fresh one to be safe
            if (!token) {
                token = await getToken()
            }

            if (!token) {
                throw new Error('Not authenticated')
            }

            let response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: getHeaders(token),
            })

            // If 401 Unauthorized, the token in localStorage might be stale.
            // Retry once with a fresh token from Clerk, forcing skipCache.
            if (response.status === 401) {
                // console.log('Unauthorized (401), retrying with fresh token (skipCache: true)...')
                try {
                    // @ts-ignore - skipCache is available in some versions/templates, 
                    // or we use it to ensure any SDK-side caching is bypassed if possible.
                    const newToken = await getToken({ skipCache: true })
                    if (newToken) {
                        if (typeof window !== 'undefined') {
                            localStorage.setItem(TOKEN_KEY, newToken)
                        }
                        response = await fetch(`${API_URL}${endpoint}`, {
                            ...options,
                            headers: getHeaders(newToken),
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
