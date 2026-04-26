import { Suspense } from 'react'
import { GitHubCallbackClient } from './GitHubCallbackClient'

export default function GitHubCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <GitHubCallbackClient />
        </Suspense>
    )
}
