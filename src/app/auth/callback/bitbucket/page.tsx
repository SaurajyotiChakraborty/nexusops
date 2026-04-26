import { Suspense } from 'react'
import { BitbucketCallbackClient } from './BitbucketCallbackClient'

export default function BitbucketCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <BitbucketCallbackClient />
        </Suspense>
    )
}
