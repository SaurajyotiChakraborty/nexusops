import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/5">
            <SignUp
                appearance={{
                    elements: {
                        rootBox: 'mx-auto',
                        card: 'shadow-2xl border-primary/10',
                    },
                }}
            />
        </div>
    )
}
