"use client"

import Link from "next/link"
import {
    Brain, ShieldAlert, FileText, Download, CheckCircle2,
    ArrowRight, Zap, Users, Lock
} from "lucide-react"

export default function KnowledgeTransferLandingPage() {
    return (
        <main className="min-h-screen bg-[#F4EDE1] text-[#3A2418]">

            {/* 1. HERO SECTION */}
            <section className="relative px-6 py-20 md:py-32 text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C6A15B]/10 border border-[#C6A15B]/30 mb-8">
                    <Zap className="w-4 h-4 text-[#C6A15B]" />
                    <span className="text-xs font-mono font-semibold text-[#C6A15B] uppercase tracking-wider">
                        #1 Rated Knowledge Transfer Software
                    </span>
                </div>

                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-[#3A2418] italic mb-6 leading-tight">
                    Never Lose Critical <br className="hidden md:block" />
                    <span className="text-[#C6A15B]">Employee Knowledge</span> Again.
                </h1>

                <p className="text-lg md:text-xl text-[#806B58] max-w-2xl mx-auto mb-10 leading-relaxed">
                    The all-in-one knowledge transfer software for modern teams. Capture, preserve, and transfer institutional knowledge before employees leave.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/dashboard"
                        className="px-8 py-4 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-all flex items-center gap-2 font-mono text-sm font-semibold shadow-lg hover:shadow-xl"
                    >
                        Start Free Trial
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/offboarding-checklist-template"
                        className="px-8 py-4 border border-[#3A2418]/20 text-[#3A2418] rounded-xl hover:bg-[#3A2418]/5 transition-all flex items-center gap-2 font-mono text-sm font-semibold"
                    >
                        <Download className="w-4 h-4" />
                        Get Free Offboarding Checklist
                    </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-16 pt-8 border-t border-[#3A2418]/10">
                    <p className="text-xs font-mono text-[#806B58] uppercase tracking-widest mb-4">Trusted by forward-thinking teams</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
                        <span className="font-display text-2xl italic">Acme Corp</span>
                        <span className="font-display text-2xl italic">GlobalTech</span>
                        <span className="font-display text-2xl italic">Nexus Inc</span>
                        <span className="font-display text-2xl italic">Stellar AI</span>
                    </div>
                </div>
            </section>

            {/* 2. PROBLEM / SOLUTION SECTION */}
            <section className="px-6 py-20 bg-[#E9DED0]/50">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="font-display text-3xl md:text-4xl text-[#3A2418] italic mb-6">
                            When an employee leaves, <span className="text-red-600">their knowledge leaves with them.</span>
                        </h2>
                        <ul className="space-y-4">
                            {[
                                "Critical processes known only to one person.",
                                "New hires take months to reach full productivity.",
                                "Manual offboarding checklists get lost or ignored.",
                                "Institutional memory disappears forever."
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-red-600 text-xs font-bold"></span>
                                    </div>
                                    <span className="text-[#806B58] font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-[#F4EDE1] p-8 rounded-2xl border border-[#3A2418]/10 shadow-xl">
                        <h3 className="font-display text-2xl text-[#3A2418] italic mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            The VEQ Solution
                        </h3>
                        <p className="text-[#806B58] mb-6">
                            VEQ automatically captures, structures, and preserves your team's tacit knowledge, making it instantly searchable for the next person.
                        </p>
                        <div className="space-y-3">
                            {["Automated Exit Brain Dumps", "AI-Powered Knowledge Search", "Real-time Risk Radar"].map((feat, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E9DED0]">
                                    <CheckCircle2 className="w-5 h-5 text-[#C6A15B]" />
                                    <span className="font-mono text-sm font-semibold text-[#3A2418]">{feat}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. CORE FEATURES SECTION */}
            <section className="px-6 py-24 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="font-display text-3xl md:text-5xl text-[#3A2418] italic mb-4">
                        Everything you need for seamless transitions.
                    </h2>
                    <p className="text-[#806B58] max-w-2xl mx-auto">
                        Built specifically for HR managers, team leads, and founders who refuse to let valuable knowledge walk out the door.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="p-8 rounded-2xl border border-[#E9DED0] bg-white hover:border-[#C6A15B]/50 transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-6 group-hover:bg-[#C6A15B]/20 transition-colors">
                            <FileText className="w-6 h-6 text-[#C6A15B]" />
                        </div>
                        <h3 className="font-display text-xl text-[#3A2418] italic mb-3">Exit Brain Dump</h3>
                        <p className="text-sm text-[#806B58] leading-relaxed">
                            A guided, 5-step interactive workflow that prompts departing employees to document projects, contacts, hidden processes, and advice before they leave.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-8 rounded-2xl border border-[#E9DED0] bg-white hover:border-[#C6A15B]/50 transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-6 group-hover:bg-[#C6A15B]/20 transition-colors">
                            <Brain className="w-6 h-6 text-[#C6A15B]" />
                        </div>
                        <h3 className="font-display text-xl text-[#3A2418] italic mb-3">AI Knowledge Base</h3>
                        <p className="text-sm text-[#806B58] leading-relaxed">
                            All captured knowledge is instantly indexed. New hires can ask natural language questions and get answers sourced directly from past employees' notes.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-8 rounded-2xl border border-[#E9DED0] bg-white hover:border-[#C6A15B]/50 transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-6 group-hover:bg-[#C6A15B]/20 transition-colors">
                            <ShieldAlert className="w-6 h-6 text-[#C6A15B]" />
                        </div>
                        <h3 className="font-display text-xl text-[#3A2418] italic mb-3">Knowledge Risk Radar</h3>
                        <p className="text-sm text-[#806B58] leading-relaxed">
                            Proactively identify single points of failure. Get instant alerts when critical processes are known by only one person in your organization.
                        </p>
                    </div>
                </div>
            </section>

            {/* 4. FREE RESOURCES SECTION - NEW ADDITION */}
            <section className="px-6 py-20 bg-[#E9DED0]/50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C6A15B]/10 border border-[#C6A15B]/30 mb-4">
                            <Download className="w-4 h-4 text-[#C6A15B]" />
                            <span className="text-xs font-mono font-semibold text-[#C6A15B] uppercase tracking-wider">
                                Free Resources
                            </span>
                        </div>
                        <h2 className="font-display text-3xl md:text-4xl text-[#3A2418] italic mb-4">
                            Download Our Professional Templates
                        </h2>
                        <p className="text-[#806B58] max-w-2xl mx-auto">
                            Start improving your offboarding process today with our free, HR-approved resources. No credit card required.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <Link
                            href="/offboarding-checklist-template"
                            className="p-6 rounded-2xl border border-[#E9DED0] bg-white hover:border-[#C6A15B] hover:shadow-lg transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-4 group-hover:bg-[#C6A15B]/20 transition-colors">
                                <CheckCircle2 className="w-6 h-6 text-[#C6A15B]" />
                            </div>
                            <h3 className="font-display text-lg text-[#3A2418] italic mb-2">Offboarding Checklist</h3>
                            <p className="text-sm text-[#806B58] mb-4">Complete 4-phase checklist with 40+ actionable items for seamless employee transitions.</p>
                            <span className="text-xs font-mono text-[#C6A15B] font-semibold flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                Free Download
                            </span>
                        </Link>

                        <Link
                            href="/knowledge-transfer-plan-template"
                            className="p-6 rounded-2xl border border-[#E9DED0] bg-white hover:border-[#C6A15B] hover:shadow-lg transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-4 group-hover:bg-[#C6A15B]/20 transition-colors">
                                <FileText className="w-6 h-6 text-[#C6A15B]" />
                            </div>
                            <h3 className="font-display text-lg text-[#3A2418] italic mb-2">Knowledge Transfer Plan</h3>
                            <p className="text-sm text-[#806B58] mb-4">Excel template with timeline, stakeholder matrix, and risk assessment framework.</p>
                            <span className="text-xs font-mono text-[#C6A15B] font-semibold flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                Free Template
                            </span>
                        </Link>

                        <Link
                            href="/employee-offboarding-process-guide"
                            className="p-6 rounded-2xl border border-[#E9DED0] bg-white hover:border-[#C6A15B] hover:shadow-lg transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-4 group-hover:bg-[#C6A15B]/20 transition-colors">
                                <Users className="w-6 h-6 text-[#C6A15B]" />
                            </div>
                            <h3 className="font-display text-lg text-[#3A2418] italic mb-2">Complete Offboarding Guide</h3>
                            <p className="text-sm text-[#806B58] mb-4">47-page PDF covering legal compliance, IT protocols, and best practices.</p>
                            <span className="text-xs font-mono text-[#C6A15B] font-semibold flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                Free Guide
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 5. LEAD MAGNET EMAIL CAPTURE */}
            <section id="free-template" className="px-6 py-24 bg-[#3A2418] text-[#F4EDE1]">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F4EDE1]/10 border border-[#F4EDE1]/20 mb-6">
                        <Download className="w-4 h-4 text-[#C6A15B]" />
                        <span className="text-xs font-mono font-semibold text-[#C6A15B] uppercase tracking-wider">
                            Instant Access
                        </span>
                    </div>

                    <h2 className="font-display text-3xl md:text-5xl italic mb-6">
                        Get All Templates in One Place
                    </h2>
                    <p className="text-[#E9DED0] max-w-2xl mx-auto mb-10 text-lg">
                        Enter your email to receive instant access to our complete offboarding toolkit — checklist, plan template, and comprehensive guide.
                    </p>

                    <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3" onSubmit={(e) => { e.preventDefault(); alert("Thanks! Check your email for all resources."); }}>
                        <input
                            type="email"
                            placeholder="Enter your work email"
                            className="flex-1 px-5 py-4 rounded-xl bg-[#F4EDE1] text-[#3A2418] placeholder:text-[#806B58] focus:outline-none focus:ring-2 focus:ring-[#C6A15B] font-mono text-sm"
                            required
                        />
                        <button
                            type="submit"
                            className="px-8 py-4 bg-[#C6A15B] text-white rounded-xl hover:bg-[#b08d4b] transition-colors font-mono text-sm font-semibold whitespace-nowrap flex items-center justify-center gap-2"
                        >
                            Send Me Everything
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                    <p className="text-xs text-[#E9DED0]/60 mt-4 font-mono">No spam. Unsubscribe anytime. We respect your privacy.</p>
                </div>
            </section>

            {/* 6. PRICING SECTION */}
            <section className="px-6 py-24 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="font-display text-3xl md:text-5xl text-[#3A2418] italic mb-4">
                        Simple, transparent pricing.
                    </h2>
                    <p className="text-[#806B58] max-w-2xl mx-auto">
                        Start protecting your company's knowledge today. No hidden fees.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Starter */}
                    <div className="p-8 rounded-2xl border border-[#E9DED0] bg-white flex flex-col">
                        <h3 className="font-display text-xl text-[#3A2418] italic mb-2">Starter</h3>
                        <p className="text-sm text-[#806B58] mb-6">For small teams getting started.</p>
                        <div className="mb-6">
                            <span className="font-display text-4xl text-[#3A2418] italic">$29</span>
                            <span className="text-[#806B58] font-mono text-sm">/month</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            {["Up to 10 employees", "Basic Exit Brain Dump", "7-day knowledge retention", "Email support"].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-[#3A2418]">
                                    <CheckCircle2 className="w-4 h-4 text-[#C6A15B]" /> {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/dashboard" className="w-full py-3 border border-[#3A2418] text-[#3A2418] rounded-xl hover:bg-[#3A2418]/5 transition-colors font-mono text-sm font-semibold text-center">
                            Start Free Trial
                        </Link>
                    </div>

                    {/* Pro (Highlighted) */}
                    <div className="p-8 rounded-2xl border-2 border-[#C6A15B] bg-[#F4EDE1] flex flex-col relative shadow-xl">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#C6A15B] text-white text-xs font-mono font-bold rounded-full">
                            MOST POPULAR
                        </div>
                        <h3 className="font-display text-xl text-[#3A2418] italic mb-2">Pro</h3>
                        <p className="text-sm text-[#806B58] mb-6">For growing companies that need AI.</p>
                        <div className="mb-6">
                            <span className="font-display text-4xl text-[#3A2418] italic">$79</span>
                            <span className="text-[#806B58] font-mono text-sm">/month</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            {["Up to 50 employees", "Advanced Exit Brain Dump", "AI Knowledge Search", "Knowledge Risk Radar", "Priority support"].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-[#3A2418] font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-[#C6A15B]" /> {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/dashboard" className="w-full py-3 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-colors font-mono text-sm font-semibold shadow-md text-center">
                            Start Free Trial
                        </Link>
                    </div>

                    {/* Enterprise */}
                    <div className="p-8 rounded-2xl border border-[#E9DED0] bg-white flex flex-col">
                        <h3 className="font-display text-xl text-[#3A2418] italic mb-2">Enterprise</h3>
                        <p className="text-sm text-[#806B58] mb-6">For large organizations with custom needs.</p>
                        <div className="mb-6">
                            <span className="font-display text-4xl text-[#3A2418] italic">Custom</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            {["Unlimited employees", "Custom AI training", "SSO & Advanced Security", "Dedicated account manager", "SLA guarantee"].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-[#3A2418]">
                                    <CheckCircle2 className="w-4 h-4 text-[#C6A15B]" /> {item}
                                </li>
                            ))}
                        </ul>
                        <button className="w-full py-3 border border-[#3A2418] text-[#3A2418] rounded-xl hover:bg-[#3A2418]/5 transition-colors font-mono text-sm font-semibold">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>

            {/* 7. FINAL CTA */}
            <section className="px-6 py-24 bg-[#E9DED0]/50 text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="font-display text-3xl md:text-5xl text-[#3A2418] italic mb-6">
                        Ready to stop knowledge loss?
                    </h2>
                    <p className="text-[#806B58] mb-10 text-lg">
                        Join hundreds of teams using VEQ to preserve their most valuable asset: their people's knowledge.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex px-8 py-4 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-all items-center gap-2 font-mono text-sm font-semibold shadow-lg"
                    >
                        Get Started for Free
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* UPDATED FOOTER WITH RESOURCES LINKS */}
            <footer className="px-6 py-12 border-t border-[#3A2418]/10 bg-[#F4EDE1]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        {/* Brand */}
                        <div className="col-span-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-2 h-2 rounded-full bg-[#C6A15B]" />
                                <span className="font-display text-lg tracking-tight text-[#3A2418]">VEQ</span>
                            </div>
                            <p className="text-xs text-[#806B58]">Knowledge transfer software for modern teams.</p>
                        </div>

                        {/* Resources Links */}
                        <div>
                            <h4 className="font-mono text-xs font-semibold text-[#3A2418] uppercase tracking-wider mb-3">Free Resources</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/offboarding-checklist-template" className="text-xs text-[#806B58] hover:text-[#3A2418] transition-colors">
                                        Offboarding Checklist
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/knowledge-transfer-plan-template" className="text-xs text-[#806B58] hover:text-[#3A2418] transition-colors">
                                        Knowledge Transfer Plan
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/employee-offboarding-process-guide" className="text-xs text-[#806B58] hover:text-[#3A2418] transition-colors">
                                        Offboarding Guide
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h4 className="font-mono text-xs font-semibold text-[#3A2418] uppercase tracking-wider mb-3">Product</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/dashboard" className="text-xs text-[#806B58] hover:text-[#3A2418] transition-colors">
                                        Features
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#pricing" className="text-xs text-[#806B58] hover:text-[#3A2418] transition-colors">
                                        Pricing
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/dashboard" className="text-xs text-[#806B58] hover:text-[#3A2418] transition-colors">
                                        Sign In
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="font-mono text-xs font-semibold text-[#3A2418] uppercase tracking-wider mb-3">Legal</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/privacy" className="text-xs text-[#806B58] hover:text-[#3A2418]">
                                        Privacy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className="text-xs text-[#806B58] hover:text-[#3A2418]">
                                        Terms
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[#3A2418]/10 text-center">
                        <p className="text-xs font-mono text-[#806B58]">
                            © {new Date().getFullYear()} VEQ Knowledge Management. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </main>
    )
}