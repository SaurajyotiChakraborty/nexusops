import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Check, Sparkles, Zap, Building } from 'lucide-react'

const plans = [
    {
        name: 'Starter',
        description: 'Perfect for hobby projects and learning',
        price: '$0',
        period: '/month',
        features: [
            '3 Projects',
            '100 Deployments/month',
            'Basic analytics',
            'Community support',
            '1 Team member',
        ],
        cta: 'Get Started Free',
        variant: 'outline' as const,
        popular: false,
    },
    {
        name: 'Pro',
        description: 'For professionals and growing teams',
        price: '$49',
        period: '/month',
        features: [
            'Unlimited Projects',
            'Unlimited Deployments',
            'Advanced analytics',
            'Priority support',
            'Up to 10 team members',
            'AI Ops recommendations',
            'Custom domains',
            '99.9% uptime SLA',
        ],
        cta: 'Start Free Trial',
        variant: 'accent' as const,
        popular: true,
    },
    {
        name: 'Enterprise',
        description: 'For large organizations with custom needs',
        price: 'Custom',
        period: '',
        features: [
            'Everything in Pro',
            'Unlimited team members',
            'SSO & SAML',
            'Dedicated support',
            'Custom contracts',
            'On-premise option',
            'Advanced security',
            'SLA customization',
        ],
        cta: 'Contact Sales',
        variant: 'outline' as const,
        popular: false,
    },
]

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl">NexusOps</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-6">
                            <Link
                                href="/pricing"
                                className="text-primary font-medium"
                            >
                                Pricing
                            </Link>
                            <Link
                                href="/docs"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Docs
                            </Link>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href="/sign-in">
                                <Button variant="ghost">Sign In</Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button variant="accent">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <Badge variant="secondary" className="mb-4">
                        Simple, transparent pricing
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Choose Your <span className="text-gradient-primary">Plan</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Start free and scale as you grow. No hidden fees, no surprises.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative rounded-2xl border p-8 transition-all hover:shadow-xl ${plan.popular
                                        ? 'border-primary bg-gradient-to-b from-primary/5 to-transparent shadow-lg scale-105'
                                        : 'bg-card'
                                    }`}
                            >
                                {plan.popular && (
                                    <Badge
                                        variant="accent"
                                        className="absolute -top-3 left-1/2 -translate-x-1/2"
                                    >
                                        Most Popular
                                    </Badge>
                                )}

                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        {plan.name === 'Starter' && (
                                            <Zap className="w-5 h-5 text-primary" />
                                        )}
                                        {plan.name === 'Pro' && (
                                            <Sparkles className="w-5 h-5 text-primary" />
                                        )}
                                        {plan.name === 'Enterprise' && (
                                            <Building className="w-5 h-5 text-primary" />
                                        )}
                                        <h3 className="text-xl font-bold">{plan.name}</h3>
                                    </div>
                                    <p className="text-muted-foreground text-sm">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground">{plan.period}</span>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-success shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/sign-up">
                                    <Button variant={plan.variant} className="w-full">
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4 bg-muted/30">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        {[
                            {
                                q: 'Can I switch plans later?',
                                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated.',
                            },
                            {
                                q: 'What payment methods do you accept?',
                                a: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. Enterprise customers can pay via invoice.',
                            },
                            {
                                q: 'Is there a free trial for Pro?',
                                a: 'Yes! Pro plan comes with a 14-day free trial. No credit card required to start.',
                            },
                            {
                                q: 'What happens if I exceed my limits?',
                                a: "We'll notify you when you're approaching your limits. You can upgrade anytime or we'll gracefully handle overages.",
                            },
                        ].map((faq, i) => (
                            <div key={i} className="bg-card border rounded-lg p-6">
                                <h3 className="font-semibold mb-2">{faq.q}</h3>
                                <p className="text-muted-foreground">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t">
                <div className="max-w-7xl mx-auto text-center text-muted-foreground">
                    <p>© 2026 NexusOps Cloud. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
