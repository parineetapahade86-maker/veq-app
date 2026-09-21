"use client"

import Link from "next/link"
import { Download, CheckCircle2, ArrowRight, Users, Mail } from "lucide-react"
import { useState } from "react"

export default function EmployeeOffboardingProcessGuide() {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
        setTimeout(() => {
            alert("Complete guide sent to your email! 📧")
        }, 500)
    }

    return (
        <main className="min-h-screen bg-[#F4EDE1] text-[#3A2418]">
            {/* HERO */}
            <section className="px-6 py-20 md:py-28 max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C6A15B]/10 border border-[#C6A15B]/30 mb-6">
                    <Users className="w-4 h-4 text-[#C6A15B]" />
                    <span className="text-xs font-mono font-semibold text-[#C6A15B] uppercase">Complete HR Guide</span>
                </div>

                <h1 className="font-display text-4xl md:text-6xl text-[#3A2418] italic mb-6">
                    Employee Offboarding Process Guide
                </h1>

                <p className="text-lg text-[#806B58] mb-8 max-w-2xl mx-auto">
                    The complete HR manager's guide to creating a smooth, compliant, and knowledge-preserving offboarding process. 47-page downloadable PDF.
                </p>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your work email"
                            className="flex-1 px-5 py-4 rounded-xl bg-white border border-[#E9DED0] focus:outline-none focus:ring-2 focus:ring-[#C6A15B] font-mono text-sm"
                            required
                        />
                        <button
                            type="submit"
                            className="px-8 py-4 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-colors font-mono text-sm font-semibold flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Get Free Guide
                        </button>
                    </form>
                ) : (
                    <div className="p-6 bg-green-50 border border-green-200 rounded-xl max-w-md mx-auto">
                        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <p className="text-green-800 font-semibold">Guide sent to {email}!</p>
                        <p className="text-green-700 text-sm mt-1">47 pages of best practices, checklists, and templates.</p>
                    </div>
                )}
            </section>

            {/* GUIDE CONTENTS */}
            <section className="px-6 py-16 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-display text-3xl text-[#3A2418] italic mb-8 text-center">What's Covered:</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { chapter: "Chapter 1", title: "Legal & Compliance Requirements", desc: "GDPR, labor laws, final pay, benefits continuation" },
                            { chapter: "Chapter 2", title: "Knowledge Capture Strategies", desc: "Interview techniques, documentation standards, video recording" },
                            { chapter: "Chapter 3", title: "IT & Security Protocols", desc: "Access revocation timeline, data backup, equipment return" },
                            { chapter: "Chapter 4", title: "Team Communication Plan", desc: "Announcement timing, transition messaging, client handovers" },
                            { chapter: "Chapter 5", title: "Exit Interview Best Practices", desc: "Questions that uncover institutional knowledge" },
                            { chapter: "Chapter 6", title: "Successor Onboarding", desc: "Ramp-up strategies, shadowing programs, mentorship" },
                            { chapter: "Chapter 7", title: "Metrics & Continuous Improvement", desc: "Track knowledge loss, measure transition success" },
                            { chapter: "Bonus", title: "Industry-Specific Templates", desc: "Tech, healthcare, finance, consulting variations" }
                        ].map((item, idx) => (
                            <div key={idx} className="p-5 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 hover:border-[#C6A15B]/50 transition-colors">
                                <span className="text-xs font-mono text-[#C6A15B] font-semibold uppercase">{item.chapter}</span>
                                <h3 className="font-display text-lg text-[#3A2418] italic mt-1 mb-2">{item.title}</h3>
                                <p className="text-sm text-[#806B58]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-20 bg-[#3A2418] text-[#F4EDE1] text-center">
                <h2 className="font-display text-3xl md:text-4xl italic mb-4">Ready to modernize your offboarding?</h2>
                <p className="text-[#E9DED0] mb-8 max-w-2xl mx-auto">Join 500+ companies using VEQ to automate knowledge transfer and preserve institutional memory.</p>
                <Link href="/dashboard" className="inline-flex px-8 py-4 bg-[#C6A15B] text-white rounded-xl hover:bg-[#b08d4b] transition-colors font-mono text-sm font-semibold items-center gap-2">
                    Start Your Free Trial
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </section>
        </main>
    )
}