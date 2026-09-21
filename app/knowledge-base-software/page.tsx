"use client"

import Link from "next/link"
import { useState } from "react"
import {
    Search, BookOpen, Users, Zap, CheckCircle2,
    ArrowRight, Database, Shield, Sparkles, Menu, X
} from "lucide-react"

export default function KnowledgeBaseSoftwarePage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <main className="min-h-screen bg-[#F4EDE1] text-[#3A2418] font-sans">

            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 w-full border-b border-[#3A2418]/10 bg-[#F4EDE1]/95 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C6A15B]" />
                        <span className="font-display text-xl tracking-tight text-[#3A2418] font-bold italic">VEQ</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/knowledge-management-system" className="text-sm font-mono font-medium text-[#806B58] hover:text-[#3A2418]">Product</Link>
                        <Link href="/knowledge-base-software" className="text-sm font-mono font-medium text-[#C6A15B]">Knowledge Base</Link>
                        <Link href="/employee-onboarding-software" className="text-sm font-mono font-medium text-[#806B58] hover:text-[#3A2418]">Onboarding</Link>
                        <Link href="/dashboard" className="px-5 py-2.5 bg-[#3A2418] text-[#F4EDE1] rounded-lg hover:bg-[#4A2F20] text-sm font-mono font-semibold transition-colors">
                            Get Started
                        </Link>
                    </div>

                    <button className="md:hidden text-[#3A2418]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 w-full bg-[#F4EDE1] border-b border-[#3A2418]/10 p-6 flex flex-col gap-4 shadow-lg">
                        <Link href="/knowledge-management-system" className="text-base font-mono font-medium text-[#3A2418]" onClick={() => setIsMenuOpen(false)}>Product</Link>
                        <Link href="/knowledge-base-software" className="text-base font-mono font-medium text-[#C6A15B]" onClick={() => setIsMenuOpen(false)}>Knowledge Base</Link>
                        <Link href="/dashboard" className="text-center px-5 py-3 bg-[#3A2418] text-[#F4EDE1] rounded-lg font-mono font-semibold" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                    </div>
                )}
            </nav>

            {/* HERO SECTION */}
            <section className="px-6 py-20 md:py-32 text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C6A15B]/10 border border-[#C6A15B]/30 mb-8">
                    <BookOpen className="w-4 h-4 text-[#C6A15B]" />
                    <span className="text-xs font-mono font-semibold text-[#C6A15B] uppercase tracking-wider">
                        Knowledge Base Software
                    </span>
                </div>

                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-[#3A2418] italic mb-6 leading-tight">
                    The Best <span className="text-[#C6A15B]">Knowledge Base Software</span> for Modern Teams
                </h1>

                <p className="text-lg md:text-xl text-[#806B58] max-w-3xl mx-auto mb-10 leading-relaxed">
                    Create, organize, and share company knowledge in one place. VEQ combines <strong>documentation</strong>, <strong>AI search</strong>, and <strong>onboarding</strong> to make knowledge accessible to everyone.
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
                        href="/knowledge-management-system"
                        className="px-8 py-4 border border-[#3A2418]/20 text-[#3A2418] rounded-xl hover:bg-[#3A2418]/5 transition-all flex items-center gap-2 font-mono text-sm font-semibold"
                    >
                        See How It Works
                    </Link>
                </div>
            </section>

            {/* FEATURES GRID */}
            <section className="px-6 py-20 bg-[#E9DED0]/50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="font-display text-3xl md:text-5xl text-[#3A2418] italic mb-4 text-center">
                        Everything You Need in a Knowledge Base
                    </h2>
                    <p className="text-[#806B58] max-w-2xl mx-auto mb-16 text-center">
                        VEQ provides all the tools to create, manage, and share knowledge effectively.
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-2xl border border-[#E9DED0] bg-white shadow-sm hover:border-[#C6A15B]/50 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-6">
                                <BookOpen className="w-6 h-6 text-[#C6A15B]" />
                            </div>
                            <h3 className="font-display text-xl text-[#3A2418] italic mb-3">Centralized Documentation</h3>
                            <p className="text-sm text-[#806B58]">Store all company policies, SOPs, guides, and FAQs in one organized place. Easy to update, easy to find.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-2xl border border-[#E9DED0] bg-white shadow-sm hover:border-[#C6A15B]/50 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-6">
                                <Search className="w-6 h-6 text-[#C6A15B]" />
                            </div>
                            <h3 className="font-display text-xl text-[#3A2418] italic mb-3">AI-Powered Search</h3>
                            <p className="text-sm text-[#806B58]">Find anything instantly with natural language search. Ask questions like "How do I request time off?" and get instant answers.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-2xl border border-[#E9DED0] bg-white shadow-sm hover:border-[#C6A15B]/50 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-6">
                                <Users className="w-6 h-6 text-[#C6A15B]" />
                            </div>
                            <h3 className="font-display text-xl text-[#3A2418] italic mb-3">Team Collaboration</h3>
                            <p className="text-sm text-[#806B58]">Multiple team members can contribute, edit, and maintain knowledge. Version control keeps everything organized.</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="p-8 rounded-2xl border border-[#E9DED0] bg-white shadow-sm hover:border-[#C6A15B]/50 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-6">
                                <Zap className="w-6 h-6 text-[#C6A15B]" />
                            </div>
                            <h3 className="font-display text-xl text-[#3A2418] italic mb-3">Onboarding Integration</h3>
                            <p className="text-sm text-[#806B58]">New hires automatically get access to relevant knowledge. Link knowledge base articles to onboarding tasks.</p>
                        </div>

                        {/* Feature 5 */}
                        <div className="p-8 rounded-2xl border border-[#E9DED0] bg-white shadow-sm hover:border-[#C6A15B]/50 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-6">
                                <Shield className="w-6 h-6 text-[#C6A15B]" />
                            </div>
                            <h3 className="font-display text-xl text-[#3A2418] italic mb-3">Access Control</h3>
                            <p className="text-sm text-[#806B58]">Control who sees what. Public knowledge base for customers, private for internal teams, or mixed access.</p>
                        </div>

                        {/* Feature 6 */}
                        <div className="p-8 rounded-2xl border border-[#E9DED0] bg-white shadow-sm hover:border-[#C6A15B]/50 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-6">
                                <Database className="w-6 h-6 text-[#C6A15B]" />
                            </div>
                            <h3 className="font-display text-xl text-[#3A2418] italic mb-3">Knowledge Capture</h3>
                            <p className="text-sm text-[#806B58]">Exit Brain Dump feature captures tacit knowledge from departing employees before it's lost forever.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHY VEQ SECTION */}
            <section className="px-6 py-24 max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="font-display text-3xl md:text-4xl text-[#3A2418] italic mb-6">
                            Why Choose VEQ as Your Knowledge Base?
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="w-6 h-6 text-[#C6A15B] shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-display text-lg text-[#3A2418] italic mb-1">More Than Just Documentation</h3>
                                    <p className="text-sm text-[#806B58]">VEQ captures both explicit knowledge (documents) and tacit knowledge (unwritten expertise).</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="w-6 h-6 text-[#C6A15B] shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-display text-lg text-[#3A2418] italic mb-1">Built for Employee Lifecycle</h3>
                                    <p className="text-sm text-[#806B58]">From onboarding to offboarding, VEQ manages knowledge throughout the employee journey.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="w-6 h-6 text-[#C6A15B] shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-display text-lg text-[#3A2418] italic mb-1">AI-Powered Intelligence</h3>
                                    <p className="text-sm text-[#806B58]">Smart search, auto-categorization, and knowledge gap detection.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="w-6 h-6 text-[#C6A15B] shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-display text-lg text-[#3A2418] italic mb-1">Prevents Knowledge Loss</h3>
                                    <p className="text-sm text-[#806B58]">When employees leave, their knowledge stays. Exit Brain Dump ensures nothing is lost.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#E9DED0]/50 p-8 rounded-2xl border border-[#E9DED0]">
                        <div className="space-y-6">
                            <div className="p-6 bg-white rounded-xl border border-[#C6A15B]/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <Sparkles className="w-5 h-5 text-[#C6A15B]" />
                                    <h4 className="font-display text-lg text-[#3A2418] italic">AI Search</h4>
                                </div>
                                <p className="text-sm text-[#806B58]">"How do I set up VPN?" → Instant answer from documentation</p>
                            </div>

                            <div className="p-6 bg-white rounded-xl border border-[#C6A15B]/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <BookOpen className="w-5 h-5 text-[#C6A15B]" />
                                    <h4 className="font-display text-lg text-[#3A2418] italic">Organized Categories</h4>
                                </div>
                                <p className="text-sm text-[#806B58]">HR, IT, Sales, Engineering - all organized and easy to navigate</p>
                            </div>

                            <div className="p-6 bg-white rounded-xl border border-[#C6A15B]/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <Users className="w-5 h-5 text-[#C6A15B]" />
                                    <h4 className="font-display text-lg text-[#3A2418] italic">Team Collaboration</h4>
                                </div>
                                <p className="text-sm text-[#806B58]">Multiple contributors, version history, and approval workflows</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="px-6 py-24 bg-[#3A2418] text-[#F4EDE1] text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="font-display text-3xl md:text-5xl italic mb-6">
                        Ready to Build Your Knowledge Base?
                    </h2>
                    <p className="text-[#E9DED0] mb-10 text-lg">
                        Join companies Built by a solo founder, still shaping VEQ with early users.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/dashboard"
                            className="inline-flex px-8 py-4 bg-[#C6A15B] text-white rounded-xl hover:bg-[#b08d4b] transition-all items-center gap-2 font-mono text-sm font-semibold shadow-lg"
                        >
                            Start Free Trial
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/knowledge-management-system"
                            className="inline-flex px-8 py-4 border border-[#C6A15B] text-[#C6A15B] rounded-xl hover:bg-[#C6A15B]/10 transition-all items-center gap-2 font-mono text-sm font-semibold"
                        >
                            Learn More
                        </Link>
                    </div>
                    <p className="text-sm text-[#806B58] mt-6">No credit card required · </p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="px-6 py-12 border-t border-[#3A2418]/10 bg-[#F4EDE1]">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#C6A15B]" />
                        <span className="font-display text-lg tracking-tight text-[#3A2418]">VEQ</span>
                    </div>
                    <div className="flex gap-6 text-sm text-[#806B58]">
                        <Link href="/knowledge-management-system" className="hover:text-[#3A2418]">Knowledge Management</Link>
                        <Link href="/employee-onboarding-software" className="hover:text-[#3A2418]">Onboarding Software</Link>
                        <Link href="/dashboard" className="hover:text-[#3A2418]">Get Started</Link>
                    </div>
                    <p className="text-xs font-mono text-[#806B58]">
                        © {new Date().getFullYear()} VEQ. All rights reserved.
                    </p>
                </div>
            </footer>
        </main>
    )
}