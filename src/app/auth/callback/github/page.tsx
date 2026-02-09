'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { api, setAuthToken } from '@/lib/api'
import { useAuth } from '@clerk/nextjs'

export default function GitHubCallbackPage() {
    const searchParams = useSearchParams()
    const { getToken } = useAuth()
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
    const [message, setMessage] = useState('Connecting your GitHub account...')

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code')
            const state = searchParams.get('state')

            if (!code || !state) {
                setStatus('error')
                setMessage('Invalid callback parameters')
                return
            }

            try {
                const token = await getToken()
                if (token) setAuthToken(token)

                await api.get(`/auth/callback/github?code=${code}&state=${state}`)

                setStatus('success')
                setMessage('GitHub account connected successfully!')

                // Close popup after 1 second
                setTimeout(() => {
                    window.close()
                }, 1000)
            } catch (error: any) {
                console.error('GitHub callback error:', error)
                setStatus('error')
                setMessage(error.message || 'Failed to connect GitHub account')
            }
        }

        handleCallback()
    }, [searchParams, getToken])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                {status === 'processing' && (
                    <>
                        <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-lg">{message}</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-lg text-green-600">{message}</p>
                        <p className="text-sm text-muted-foreground">This window will close automatically...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-lg text-red-600">{message}</p>
                        <button
                            onClick={() => window.close()}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                            Close Window
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
