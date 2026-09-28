// app/dashboard/pricing/page.tsx
'use client';

import { useState } from 'react';
import { CheckCircle, Crown, Zap, Building2, Loader2 } from 'lucide-react';

export default function PricingPage() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleUpgrade = async (priceId: string, planName: string) => {
        setLoadingPlan(planName);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url; // Redirect to Stripe Checkout
            } else {
                alert('Error creating checkout session. Check console.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to initiate checkout.');
        } finally {
            setLoadingPlan(null);
        }
    };

    const plans = [
        {
            name: 'Free',
            price: '$0',
            period: '/forever',
            icon: <Zap className="w-6 h-6 text-[#806B58]" />,
            features: ['Up to 5 Team Members', 'Basic Knowledge Vault', '7-day Activity History', 'Community Support'],
            cta: 'Current Plan',
            highlighted: false,
            priceId: null
        },
        {
            name: 'Pro',
            price: '$29',
            period: '/month',
            icon: <Crown className="w-6 h-6 text-[#C6A15B]" />,
            features: [
                'Up to 25 Team Members',
                'Advanced AI Agent (Auto-Remediation)',
                'Meeting Intelligence (Audio/Text)',
                'Slack & Email Alerts',
                'Priority Support'
            ],
            cta: 'Upgrade to Pro',
            highlighted: true,
            priceId: 'price_TEST_PRO_ID' // ⚠️ Replace with your actual Stripe Test Price ID
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            icon: <Building2 className="w-6 h-6 text-[#3A2418]" />,
            features: [
                'Unlimited Team Members',
                'Custom AI Model Fine-tuning',
                'On-Premise Deployment (Docker)',
                'Dedicated Account Manager',
                '99.9% SLA Guarantee'
            ],
            cta: 'Contact Sales',
            highlighted: false,
            priceId: null
        }
    ];

    return (
        <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="text-center mb-16">
                <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic mb-4">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-[#806B58] max-w-2xl mx-auto text-lg">
                    Invest in your company's most valuable asset: its knowledge.
                    Start free, scale as you grow.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border ${plan.highlighted
                                ? 'bg-[#3A2418] text-[#F4EDE1] border-[#C6A15B] shadow-xl scale-105 z-10'
                                : 'bg-white/60 border-[#E9DED0] text-[#3A2418]'
                            }`}
                    >
                        {plan.highlighted && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#C6A15B] text-[#3A2418] px-4 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider">
                                Most Popular
                            </div>
                        )}

                        <div className="flex items-center gap-3 mb-6">
                            {plan.icon}
                            <h3 className="font-display text-2xl italic">{plan.name}</h3>
                        </div>

                        <div className="mb-8">
                            <span className="text-4xl font-bold font-mono">{plan.price}</span>
                            <span className={`text-sm ${plan.highlighted ? 'text-[#E9DED0]' : 'text-[#806B58]'}`}>
                                {plan.period}
                            </span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm">
                                    <CheckCircle className={`w-5 h-5 shrink-0 ${plan.highlighted ? 'text-[#C6A15B]' : 'text-[#3A2418]'}`} />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => plan.priceId ? handleUpgrade(plan.priceId, plan.name) : alert('Contact sales@veq.app for Enterprise!')}
                            disabled={loadingPlan === plan.name || !plan.priceId}
                            className={`w-full py-3 rounded-xl font-mono text-sm font-semibold transition-all flex items-center justify-center gap-2 ${plan.highlighted
                                    ? 'bg-[#C6A15B] text-[#3A2418] hover:bg-[#D4AF67] disabled:opacity-70'
                                    : 'bg-[#3A2418] text-[#F4EDE1] hover:bg-[#4A2F20] disabled:opacity-70'
                                }`}
                        >
                            {loadingPlan === plan.name ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
                            ) : (
                                plan.cta
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}