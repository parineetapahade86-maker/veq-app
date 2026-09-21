// app/knowledge-management-system/page.tsx (Server Component — no "use client")
import Link from "next/link"
import type { Metadata } from "next"
import {
    ArrowRight, Download, FileText,
    Brain, ShieldAlert, Search, CheckCircle2, Zap
} from "lucide-react"
import KmsNavbar from "@/components/KmsNavbar"

export const metadata: Metadata = {
    title: "AI Knowledge Management System | VEQ",
    description:
        "VEQ is an AI-powered knowledge management system that captures both tacit and explicit knowledge before employees leave, so new hires never start from zero.",
}

const faqs = [
    { q: "What is a Knowledge Management System (KMS)?", a: "A KMS is a software tool used by organizations to collect, store, and distribute knowledge. It helps teams access information quickly and prevents knowledge loss when employees leave." },
    { q: "What is the difference between Tacit and Explicit Knowledge?", a: "Explicit knowledge is documented (like manuals and files). Tacit knowledge is unwritten, experiential knowledge (like troubleshooting hacks). VEQ captures both." },
    { q: "How does VEQ help with employee offboarding?", a: "VEQ uses an 'Exit Brain Dump' feature that guides departing employees through a structured process to document their critical tasks and unwritten processes." },
]

export default function KnowledgeManagementSystemPage() {
    return (
        <main className="min-h-screen bg-[#F4EDE1] text-[#3A2418]">

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: faqs.map((faq) => ({
                            "@type": "Question",
                            name: faq.q,
                            acceptedAnswer: { "@type": "Answer", text: faq.a },
                        })),
                    }),
                }}
            />

            <KmsNavbar />

            {/* HERO SECTION */}
            <section className="relative px-6 py-20 md:py-32 text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C6A15B]/10 border border-[#C6A15B]/30 mb-8">
                    <Zap className="w-4 h-4 text-[#C6A15B]" />
                    <span className="text-xs font-mono font-semibold text-[#C6A15B] uppercase tracking-wider">
                        Next-Gen Knowledge Management System
                    </span>
                </div>

                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-[#3A2418] italic mb-6 leading-tight">
                    The AI-Powered <br className="hidden md:block" />
                    <span className="text-[#C6A15B]">Knowledge Management System</span> for Modern Teams.
                </h1>

                <p className="text-lg md:text-xl text-[#806B58] max-w-2xl mx-auto mb-10 leading-relaxed">
                    Stop losing critical company knowledge. VEQ captures both <strong>Tacit</strong> and <strong>Explicit Knowledge</strong>, making it instantly searchable for your entire team.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/dashboard"
                        className="px-8 py-4 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-all flex items-center gap-2 font-mono text-sm font-semibold shadow-lg hover:shadow-xl"
                    >
                        Try VEQ Free
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/offboarding-checklist-template"
                        className="px-8 py-4 border border-[#3A2418]/20 text-[#3A2418] rounded-xl hover:bg-[#3A2418]/5 transition-all flex items-center gap-2 font-mono text-sm font-semibold"
                    >
                        <Download className="w-4 h-4" />
                        Free KMS Checklist
                    </Link>
                </div>
            </section>

            {/* LIVE DASHBOARD PREVIEW */}
            <section className="px-6 py-12 bg-[#F4EDE1]">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="font-display text-3xl md:text-5xl text-[#3A2418] italic mb-4">
                        See Your Knowledge Gaps in Real-Time
                    </h2>
                    <p className="text-[#806B58] max-w-2xl mx-auto mb-12">
                        Don't just guess where your critical knowledge is hiding. VEQ's dashboard instantly highlights single points of failure before they become a crisis.
                    </p>

                    <div className="relative mx-auto max-w-5xl rounded-2xl border border-[#3A2418]/10 bg-white shadow-2xl overflow-hidden group">
                        <div className="flex items-center gap-2 px-4 py-3 bg-[#E9DED0]/50 border-b border-[#3A2418]/10">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="flex-1 text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-[#3A2418]/10 text-xs font-mono text-[#806B58]">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    app.veq.com/dashboard/team
                                </div>
                            </div>
                        </div>

                        <div className="flex h-[400px] md:h-[500px]">
                            <div className="hidden md:flex w-56 flex-col border-r border-[#3A2418]/10 bg-[#F4EDE1]/30 p-4 gap-3">
                                <div className="h-8 w-24 bg-[#3A2418]/10 rounded-md mb-4" />
                                <div className="h-8 w-full bg-[#C6A15B]/20 rounded-md border border-[#C6A15B]/30" />
                                <div className="h-8 w-full bg-[#3A2418]/5 rounded-md" />
                                <div className="h-8 w-full bg-[#3A2418]/5 rounded-md" />
                                <div className="h-8 w-full bg-[#3A2418]/5 rounded-md" />
                            </div>

                            <div className="flex-1 p-6 md:p-8 bg-[#F4EDE1]/20 overflow-y-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="h-8 w-48 bg-[#3A2418]/20 rounded-md" />
                                    <div className="h-10 w-32 bg-[#3A2418] rounded-lg" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-red-200 bg-red-50/50">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-2 py-1 rounded bg-red-200 text-red-800 text-[10px] font-mono font-bold">HIGH RISK</span>
                                        </div>
                                        <div className="h-5 w-3/4 bg-red-900/20 rounded mb-2" />
                                        <div className="h-4 w-1/2 bg-red-900/10 rounded" />
                                    </div>
                                    <div className="p-4 rounded-xl border border-red-200 bg-red-50/50">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-2 py-1 rounded bg-red-200 text-red-800 text-[10px] font-mono font-bold">HIGH RISK</span>
                                        </div>
                                        <div className="h-5 w-2/3 bg-red-900/20 rounded mb-2" />
                                        <div className="h-4 w-1/3 bg-red-900/10 rounded" />
                                    </div>
                                    <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50/50">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-2 py-1 rounded bg-yellow-200 text-yellow-800 text-[10px] font-mono font-bold">MEDIUM RISK</span>
                                        </div>
                                        <div className="h-5 w-3/4 bg-yellow-900/20 rounded mb-2" />
                                        <div className="h-4 w-1/2 bg-yellow-900/10 rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/dashboard"
                            className="absolute inset-0 bg-[#3A2418]/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center hover:bg-[#3A2418]/60 transition-all duration-300"
                        >
                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300 max-w-md border border-[#C6A15B]/30">
                                <div className="w-12 h-12 bg-[#C6A15B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Zap className="w-6 h-6 text-[#C6A15B]" />
                                </div>
                                <h3 className="font-display text-2xl text-[#3A2418] italic mb-2">Experience it Live</h3>
                                <p className="text-[#806B58] text-sm mb-6">See your own company's Knowledge Risk Radar instantly. No credit card required.</p>
                                <button className="px-8 py-3 bg-[#3A2418] text-[#F4EDE1] rounded-xl font-mono text-sm font-semibold flex items-center gap-2 mx-auto hover:bg-[#4A2F20] transition-colors shadow-lg">
                                    Open VEQ Dashboard
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* TACIT VS EXPLICIT KNOWLEDGE */}
            <section className="px-6 py-20 bg-[#E9DED0]/50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-3xl md:text-5xl text-[#3A2418] italic mb-4">
                            Why Traditional Knowledge Management Fails
                        </h2>
                        <p className="text-[#806B58] max-w-2xl mx-auto">
                            Most systems only capture documents. They miss the real gold: the unwritten knowledge in your employees' heads.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-2xl border border-[#E9DED0] bg-white shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-display text-2xl text-[#3A2418] italic mb-3">Explicit Knowledge</h3>
                            <p className="text-[#806B58] mb-4">Documented, codified, and easy to share. SOPs, manuals, databases, and files.</p>
                            <ul className="space-y-2">
                                {["Employee Handbooks", "Process Documents", "Training Videos"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-[#3A2418]">
                                        <CheckCircle2 className="w-4 h-4 text-blue-600" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-8 rounded-2xl border-2 border-[#C6A15B] bg-[#C6A15B]/5 shadow-md relative">
                            <div className="absolute -top-3 right-6 px-3 py-1 bg-[#C6A15B] text-white text-xs font-mono font-bold rounded-full">
                                THE MISSING PIECE
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/20 flex items-center justify-center mb-6">
                                <Brain className="w-6 h-6 text-[#C6A15B]" />
                            </div>
                            <h3 className="font-display text-2xl text-[#3A2418] italic mb-3">Tacit Knowledge</h3>
                            <p className="text-[#806B58] mb-4">Unwritten, experiential, and personal. The "how" and "why" behind daily operations.</p>
                            <ul className="space-y-2">
                                {["Troubleshooting hacks", "Client relationship nuances", "Hidden process shortcuts"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-[#3A2418]">
                                        <CheckCircle2 className="w-4 h-4 text-[#C6A15B]" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="px-6 py-24 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="font-display text-3xl md:text-5xl text-[#3A2418] italic mb-4">
                        How VEQ Captures It All
                    </h2>
                    <p className="text-[#806B58] max-w-2xl mx-auto">
                        A complete Knowledge Management System that bridges the gap between leaving employees and new hires.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-2xl border border-[#E9DED0] bg-white hover:border-[#C6A15B]/50 transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-6">
                            <FileText className="w-6 h-6 text-[#C6A15B]" />
                        </div>
                        <h3 className="font-display text-xl text-[#3A2418] italic mb-3">Exit Brain Dump</h3>
                        <p className="text-sm text-[#806B58]">Guided workflows that prompt departing employees to document both their files and unwritten tricks.</p>
                    </div>

                    <div className="p-8 rounded-2xl border border-[#E9DED0] bg-white hover:border-[#C6A15B]/50 transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-6">
                            <Search className="w-6 h-6 text-[#C6A15B]" />
                        </div>
                        <h3 className="font-display text-xl text-[#3A2418] italic mb-3">AI Knowledge Search</h3>
                        <p className="text-sm text-[#806B58]">New hires can ask natural language questions and get instant answers sourced from past employees' notes.</p>
                    </div>

                    <div className="p-8 rounded-2xl border border-[#E9DED0] bg-white hover:border-[#C6A15B]/50 transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-6">
                            <ShieldAlert className="w-6 h-6 text-[#C6A15B]" />
                        </div>
                        <h3 className="font-display text-xl text-[#3A2418] italic mb-3">Knowledge Risk Radar</h3>
                        <p className="text-sm text-[#806B58]">Proactively identify single points of failure. Get alerts when critical knowledge is known by only one person.</p>
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section className="px-6 py-20 bg-[#E9DED0]/50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-display text-3xl md:text-4xl text-[#3A2418] italic mb-12 text-center">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl border border-[#E9DED0]">
                                <h3 className="font-display text-lg text-[#3A2418] italic mb-2">{faq.q}</h3>
                                <p className="text-sm text-[#806B58] leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="px-6 py-24 bg-[#3A2418] text-[#F4EDE1] text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="font-display text-3xl md:text-5xl italic mb-6">
                        Ready to build your Knowledge Management System?
                    </h2>
                    <p className="text-[#E9DED0] mb-10 text-lg">
                        Built by a solo founder who's still shaping VEQ with early users — try it and help set the direction.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex px-8 py-4 bg-[#C6A15B] text-white rounded-xl hover:bg-[#b08d4b] transition-all items-center gap-2 font-mono text-sm font-semibold shadow-lg"
                    >
                        Get Started for Free
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            <footer className="px-6 py-12 border-t border-[#3A2418]/10 bg-[#F4EDE1]">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#C6A15B]" />
                        <span className="font-display text-lg tracking-tight text-[#3A2418]">VEQ</span>
                    </div>
                    <p className="text-xs font-mono text-[#806B58]">
                        © {new Date().getFullYear()} VEQ Knowledge Management. All rights reserved.
                    </p>
                </div>
            </footer>
        </main>
    )
}