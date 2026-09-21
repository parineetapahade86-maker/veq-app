"use client"

import Link from "next/link"
import { Download, CheckCircle2, ArrowRight, Brain, Mail } from "lucide-react"
import { useState } from "react"

export default function KnowledgeTransferPlanTemplate() {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
        setTimeout(() => {
            alert("Knowledge Transfer Plan sent to your email! 📧")
        }, 500)
    }

    return (
        <main className="min-h-screen bg-[#F4EDE1] text-[#3A2418]">
            {/* HERO */}
            <section className="px-6 py-20 md:py-28 max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C6A15B]/10 border border-[#C6A15B]/30 mb-6">
                    <Brain className="w-4 h-4 text-[#C6A15B]" />
                    <span className="text-xs font-mono font-semibold text-[#C6A15B] uppercase">Free Template + Guide</span>
                </div>

                <h1 className="font-display text-4xl md:text-6xl text-[#3A2418] italic mb-6">
                    Knowledge Transfer Plan Template
                </h1>

                <p className="text-lg text-[#806B58] mb-8 max-w-2xl mx-auto">
                    A step-by-step framework to capture and transfer critical knowledge before employees leave. Includes Excel template, timeline, and stakeholder matrix.
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
                            Get Free Template
                        </button>
                    </form>
                ) : (
                    <div className="p-6 bg-green-50 border border-green-200 rounded-xl max-w-md mx-auto">
                        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <p className="text-green-800 font-semibold">Template sent to {email}!</p>
                        <p className="text-green-700 text-sm mt-1">Includes: Excel template + PDF guide + Email scripts.</p>
                    </div>
                )}
            </section>

            {/* TEMPLATE CONTENTS */}
            <section className="px-6 py-16 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-display text-3xl text-[#3A2418] italic mb-8 text-center">What You'll Get:</h2>

                    <div className="space-y-4">
                        {[
                            { title: "Knowledge Transfer Plan Template (Excel)", desc: "Customizable spreadsheet with timeline, responsibilities, and progress tracking" },
                            { title: "Stakeholder Identification Matrix", desc: "Identify who needs to be involved and their specific knowledge areas" },
                            { title: "30-60-90 Day Transfer Timeline", desc: "Week-by-week breakdown of knowledge capture activities" },
                            { title: "Risk Assessment Framework", desc: "Identify single points of failure and critical knowledge gaps" },
                            { title: "Email Templates & Scripts", desc: "Pre-written communication for managers, HR, and departing employees" },
                            { title: "Video Tutorial", desc: "15-minute walkthrough on how to implement the plan effectively" }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-5 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30">
                                <div className="w-8 h-8 rounded-full bg-[#C6A15B]/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-5 h-5 text-[#C6A15B]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#3A2418] mb-1">{item.title}</h3>
                                    <p className="text-sm text-[#806B58]">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-20 bg-[#3A2418] text-[#F4EDE1] text-center">
                <h2 className="font-display text-3xl md:text-4xl italic mb-4">Tired of manual knowledge transfer?</h2>
                <p className="text-[#E9DED0] mb-8 max-w-2xl mx-auto">VEQ automates the entire process with AI-powered knowledge capture, making your plan 10x more effective.</p>
                <Link href="/dashboard" className="inline-flex px-8 py-4 bg-[#C6A15B] text-white rounded-xl hover:bg-[#b08d4b] transition-colors font-mono text-sm font-semibold items-center gap-2">
                    Automate Your Knowledge Transfer
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </section>
        </main>
    )
}