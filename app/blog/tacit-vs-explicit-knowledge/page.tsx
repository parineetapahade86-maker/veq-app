import Link from "next/link"
import type { Metadata } from "next"
import LandingNavbar from "@/components/LandingNavbar"
import { ArrowLeft, Calendar, Clock, CheckCircle2, Brain, FileText, ArrowRight, Lightbulb, Download } from "lucide-react"

export const metadata: Metadata = {
    title: "Tacit vs Explicit Knowledge: Real Examples & How to Capture Both | VEQ",
    description:
        "Learn the difference between tacit and explicit knowledge with real workplace examples, and how VEQ's Exit Brain Dump captures the unwritten knowledge companies usually lose.",
}

export default function TacitVsExplicitKnowledgeBlog() {
    return (
        <>
            <LandingNavbar />

            <main className="min-h-screen bg-[#F4EDE1] text-[#3A2418]">

                {/* BLOG HEADER */}
                <header className="border-b border-[#3A2418]/10 bg-[#F4EDE1]">
                    <div className="max-w-3xl mx-auto px-6 py-8">
                        <Link href="/knowledge-management-system" className="inline-flex items-center gap-2 text-sm font-mono text-[#806B58] hover:text-[#3A2418] mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Product
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-[#C6A15B]/10 text-[#C6A15B] rounded-full text-xs font-mono font-semibold uppercase tracking-wider">Knowledge Management</span>
                            <span className="flex items-center gap-1 text-xs font-mono text-[#806B58]"><Calendar className="w-3 h-3" /> Sept 2026</span>
                            <span className="flex items-center gap-1 text-xs font-mono text-[#806B58]"><Clock className="w-3 h-3" /> 8 min read</span>
                        </div>

                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#3A2418] italic mb-6 leading-tight">
                            Tacit vs Explicit Knowledge: <br className="hidden md:block" />
                            <span className="text-[#C6A15B]">Real Examples & How to Capture Both</span>
                        </h1>

                        <p className="text-lg md:text-xl text-[#806B58] leading-relaxed">
                            When a key employee leaves, they don't just take their laptop. They take years of unwritten "Tacit Knowledge" with them. Here is how modern companies are solving this silent crisis with real examples.
                        </p>
                    </div>
                </header>

                {/* BLOG CONTENT */}
                <article className="max-w-3xl mx-auto px-6 py-16 md:py-24">

                    <div className="prose prose-lg max-w-none text-[#3A2418] space-y-8 font-sans leading-relaxed">

                        <div className="p-6 bg-red-50 border-l-4 border-red-400 rounded-r-xl my-8">
                            <p className="text-lg text-red-900 font-display italic m-0">
                                "We lost our lead engineer last month. The code is still there, but we have no idea how to fix the bugs he used to solve in 5 minutes."
                            </p>
                        </div>

                        <p>
                            If this sounds familiar, your company is suffering from <strong>Tacit Knowledge loss</strong>. Most organizations focus heavily on documenting processes, manuals, and files. But they completely miss the most valuable asset: the unwritten knowledge inside their employees' heads.
                        </p>

                        <h2 className="font-display text-3xl text-[#3A2418] italic mt-12 mb-4">What is Explicit Knowledge? (With Examples)</h2>
                        <p>
                            Explicit knowledge is the easy part. It is codified, documented, and easily transferable. You can write it down, put it in a PDF, and email it to someone.
                        </p>

                        <div className="p-6 rounded-2xl border border-[#E9DED0] bg-white shadow-sm my-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-display text-xl text-[#3A2418] italic m-0">Explicit Knowledge Examples</h3>
                            </div>
                            <ul className="space-y-3 m-0">
                                <li className="flex items-start gap-3 text-[#806B58]">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-[#3A2418]">Employee Handbook:</strong> Company policies, vacation rules, code of conduct
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 text-[#806B58]">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-[#3A2418]">SOPs (Standard Operating Procedures):</strong> Step-by-step guides for common tasks
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 text-[#806B58]">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-[#3A2418]">Training Videos:</strong> Recorded webinars, onboarding tutorials
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 text-[#806B58]">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-[#3A2418]">Database Documentation:</strong> API docs, schema diagrams, credential lists
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <h2 className="font-display text-3xl text-[#3A2418] italic mt-12 mb-4">What is Tacit Knowledge? (The Real Gold)</h2>
                        <p>
                            Tacit knowledge is personal, context-specific, and hard to formalize. It is the "gut feeling", the "shortcut", and the "unwritten rule" that experienced employees use every day. <strong>You cannot simply write Tacit Knowledge in a manual.</strong>
                        </p>

                        <div className="p-6 rounded-2xl border-2 border-[#C6A15B] bg-[#C6A15B]/5 shadow-md my-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-[#C6A15B]/20 flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-[#C6A15B]" />
                                </div>
                                <h3 className="font-display text-xl text-[#3A2418] italic m-0">Tacit Knowledge Real-World Examples</h3>
                            </div>
                            <ul className="space-y-3 m-0">
                                <li className="flex items-start gap-3 text-[#806B58]">
                                    <CheckCircle2 className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-[#3A2418]">The Friday Server Issue:</strong> "I know the server acts up on Fridays around 3 PM, so I always restart the cache manually before the weekly report runs."
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 text-[#806B58]">
                                    <CheckCircle2 className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-[#3A2418]">Client Relationship Nuances:</strong> "Client X gets annoyed if we send emails after 4 PM. But Client Y prefers evening communication."
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 text-[#806B58]">
                                    <CheckCircle2 className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-[#3A2418]">Debugging Shortcut:</strong> "When you see Error 503, don't check the main logs first. Check the legacy payment gateway logs — that's where the real issue always is."
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 text-[#806B58]">
                                    <CheckCircle2 className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-[#3A2418]">The Unwritten Approval Process:</strong> "Technically you need CFO approval for expenses over $5K, but if it's a marketing tool, just get Sarah from Finance to sign off — she's faster."
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <h2 className="font-display text-3xl text-[#3A2418] italic mt-12 mb-4">Why Traditional Offboarding Fails</h2>
                        <p>
                            When an employee resigns, HR usually hands them a 20-page "Exit Checklist". The employee is busy wrapping up their work, so they rush through it. They document their files (Explicit), but they forget to document their hacks, relationships, and shortcuts (Tacit).
                        </p>
                        <p>
                            Two months later, a new hire faces the exact same bug, and the whole team wastes days figuring out what the old employee knew in minutes.
                        </p>

                        <h2 className="font-display text-3xl text-[#3A2418] italic mt-12 mb-4">How VEQ Captures Tacit Knowledge (The Solution)</h2>
                        <p>
                            You cannot force Tacit knowledge into a spreadsheet. You need a guided, interactive process. Here is how VEQ approaches this problem:
                        </p>

                        <div className="space-y-6 my-8">
                            <div className="p-6 rounded-2xl border border-[#E9DED0] bg-white shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-[#C6A15B] text-white flex items-center justify-center font-bold text-sm">1</div>
                                    <h3 className="font-display text-xl text-[#3A2418] italic m-0">The "Exit Brain Dump" Workflow</h3>
                                </div>
                                <p className="text-[#806B58] mb-3">Instead of a boring checklist, VEQ uses a guided workflow that asks specific questions like:</p>
                                <ul className="space-y-2 text-[#806B58] text-sm">
                                    <li className="flex items-start gap-2">• "What is the one thing that always breaks, and how do you fix it?"</li>
                                    <li className="flex items-start gap-2">• "Who are the 3 people you rely on most, and why?"</li>
                                    <li className="flex items-start gap-2">• "What's your best productivity hack that nobody knows about?"</li>
                                </ul>
                                <Link href="/dashboard/exit-brain-dump" className="inline-flex items-center gap-2 mt-4 text-sm font-mono text-[#C6A15B] hover:text-[#3A2418] font-semibold">
                                    Try Exit Brain Dump →
                                </Link>
                            </div>

                            <div className="p-6 rounded-2xl border border-[#E9DED0] bg-white shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-[#C6A15B] text-white flex items-center justify-center font-bold text-sm">2</div>
                                    <h3 className="font-display text-xl text-[#3A2418] italic m-0">AI-Powered Knowledge Indexing</h3>
                                </div>
                                <p className="text-[#806B58]">Once the employee answers, VEQ's AI indexes their unwritten knowledge. New hires can search it using natural language: <em>"How do I fix the Friday server issue?"</em> and get instant answers.</p>
                                <Link href="/knowledge-management-system" className="inline-flex items-center gap-2 mt-4 text-sm font-mono text-[#C6A15B] hover:text-[#3A2418] font-semibold">
                                    See How AI Search Works →
                                </Link>
                            </div>

                            <div className="p-6 rounded-2xl border border-[#E9DED0] bg-white shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-[#C6A15B] text-white flex items-center justify-center font-bold text-sm">3</div>
                                    <h3 className="font-display text-xl text-[#3A2418] italic m-0">Knowledge Risk Radar</h3>
                                </div>
                                <p className="text-[#806B58]">VEQ helps identify which critical processes are known by only one person in your company, so you can start a knowledge transfer session before it becomes urgent.</p>
                                <Link href="/dashboard/team" className="inline-flex items-center gap-2 mt-4 text-sm font-mono text-[#C6A15B] hover:text-[#3A2418] font-semibold">
                                    View Knowledge Risk Radar →
                                </Link>
                            </div>
                        </div>

                    </div>

                    {/* CALL TO ACTION (CTA) BOX */}
                    <div className="mt-20 p-8 md:p-12 bg-[#3A2418] text-[#F4EDE1] rounded-3xl text-center">
                        <div className="w-16 h-16 bg-[#C6A15B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lightbulb className="w-8 h-8 text-[#C6A15B]" />
                        </div>
                        <h3 className="font-display text-3xl italic mb-4">Stop Losing Your Company's Brain</h3>
                        <p className="text-[#E9DED0] mb-8 max-w-xl mx-auto">
                            VEQ is a Knowledge Management System designed to capture both Explicit documents and unwritten Tacit knowledge.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/knowledge-management-system"
                                className="inline-flex px-8 py-4 bg-[#C6A15B] text-white rounded-xl hover:bg-[#b08d4b] transition-colors font-mono text-sm font-semibold items-center gap-2 justify-center"
                            >
                                Explore VEQ Knowledge Management
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            {/* Note: /offboarding-checklist-template doesn't exist yet — build
                  it, or remove this button until it does */}
                            <Link
                                href="/offboarding-checklist-template"
                                className="inline-flex px-8 py-4 border border-[#C6A15B] text-[#C6A15B] rounded-xl hover:bg-[#C6A15B]/10 transition-colors font-mono text-sm font-semibold items-center gap-2 justify-center"
                            >
                                <Download className="w-4 h-4" />
                                Get Free Checklist
                            </Link>
                        </div>
                    </div>

                </article>

                <footer className="border-t border-[#3A2418]/10 bg-[#F4EDE1] py-12">
                    <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
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
        </>
    )
}