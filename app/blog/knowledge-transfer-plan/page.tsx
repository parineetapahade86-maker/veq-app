import Link from "next/link"
import { ArrowLeft, Calendar, Clock, User, CheckCircle2, Download } from "lucide-react"

export default function KnowledgeTransferPlanBlog() {
    return (
        <main className="min-h-screen bg-[#F4EDE1] text-[#3A2418]">

            {/* HEADER / NAVIGATION */}
            <header className="border-b border-[#3A2418]/10 bg-[#F4EDE1] sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/knowledge-transfer-software" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <ArrowLeft className="w-4 h-4 text-[#806B58]" />
                        <span className="font-mono text-sm text-[#806B58]">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#C6A15B]" />
                        <span className="font-display text-lg tracking-tight text-[#3A2418]">VEQ Blog</span>
                    </div>
                </div>
            </header>

            {/* BLOG CONTENT */}
            <article className="max-w-3xl mx-auto px-6 py-16 md:py-24">

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-xs font-mono text-[#806B58] uppercase tracking-wider">
                    <span className="px-3 py-1 bg-[#C6A15B]/10 text-[#C6A15B] rounded-full font-semibold">Knowledge Management</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Sept 8, 2026</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 8 min read</span>
                </div>

                {/* Title */}
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#3A2418] italic mb-8 leading-tight">
                    How to Create a Knowledge Transfer Plan (Step-by-Step Guide)
                </h1>

                {/* Author */}
                <div className="flex items-center gap-3 mb-12 pb-8 border-b border-[#3A2418]/10">
                    <div className="w-10 h-10 rounded-full bg-[#3A2418] flex items-center justify-center text-[#F4EDE1] font-bold">V</div>
                    <div>
                        <p className="font-semibold text-[#3A2418] text-sm">VEQ Editorial Team</p>
                        <p className="text-xs text-[#806B58]">Helping teams preserve institutional knowledge.</p>
                    </div>
                </div>

                {/* Introduction */}
                <div className="prose prose-lg max-w-none text-[#3A2418] space-y-6 font-sans leading-relaxed">
                    <p className="text-xl text-[#806B58] font-display italic border-l-4 border-[#C6A15B] pl-6">
                        When a key employee leaves, they don't just take their laptop—they take years of institutional knowledge with them. A solid Knowledge Transfer Plan is your only defense against this silent productivity killer.
                    </p>

                    <p>
                        Creating a knowledge transfer plan might seem like a daunting HR task, but it doesn't have to be. In this guide, we'll break down exactly how to create a comprehensive, actionable plan that ensures zero knowledge loss when team members transition out of your organization.
                    </p>

                    <h2 className="font-display text-3xl text-[#3A2418] italic mt-12 mb-4">What is a Knowledge Transfer Plan?</h2>
                    <p>
                        A Knowledge Transfer Plan is a structured document that outlines the process of capturing and sharing critical information from a departing employee to their successor or team. It goes beyond simple task lists; it captures the "how" and "why" behind daily operations.
                    </p>

                    <h2 className="font-display text-3xl text-[#3A2418] italic mt-12 mb-4">The 5 Essential Steps to Create Your Plan</h2>

                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-2xl border border-[#E9DED0] shadow-sm">
                            <h3 className="font-display text-xl text-[#3A2418] italic mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-[#C6A15B] text-white flex items-center justify-center text-sm font-bold">1</span>
                                Identify Critical Knowledge Areas
                            </h3>
                            <p className="text-[#806B58] text-sm">Before the employee leaves, sit down and map out what they know that nobody else does. Focus on client relationships, undocumented processes, and critical system access.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-[#E9DED0] shadow-sm">
                            <h3 className="font-display text-xl text-[#3A2418] italic mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-[#C6A15B] text-white flex items-center justify-center text-sm font-bold">2</span>
                                Choose the Right Transfer Methods
                            </h3>
                            <p className="text-[#806B58] text-sm">Don't rely on just one method. Combine written documentation (SOPs), video recordings (Loom/Zoom), and live shadowing sessions for the best results.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-[#E9DED0] shadow-sm">
                            <h3 className="font-display text-xl text-[#3A2418] italic mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-[#C6A15B] text-white flex items-center justify-center text-sm font-bold">3</span>
                                Create a Realistic Timeline
                            </h3>
                            <p className="text-[#806B58] text-sm">Knowledge transfer takes time. Start the process at least 3-4 weeks before the employee's last day. Break it down week-by-week to avoid overwhelming them.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-[#E9DED0] shadow-sm">
                            <h3 className="font-display text-xl text-[#3A2418] italic mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-[#C6A15B] text-white flex items-center justify-center text-sm font-bold">4</span>
                                Assign a Successor or Shadow
                            </h3>
                            <p className="text-[#806B58] text-sm">Identify who will take over these responsibilities. If a permanent hire isn't ready, assign an interim owner to ensure nothing falls through the cracks.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-[#E9DED0] shadow-sm">
                            <h3 className="font-display text-xl text-[#3A2418] italic mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-[#C6A15B] text-white flex items-center justify-center text-sm font-bold">5</span>
                                Review and Sign-off
                            </h3>
                            <p className="text-[#806B58] text-sm">In the final week, the successor should review all documentation and sign off that they feel confident taking over. This protects both the company and the departing employee.</p>
                        </div>
                    </div>

                    <h2 className="font-display text-3xl text-[#3A2418] italic mt-12 mb-4">Why Manual Plans Fail (And What to Do Instead)</h2>
                    <p>
                        The biggest problem with traditional knowledge transfer plans is that they are <strong>manual, static, and easily ignored</strong>. Employees are busy wrapping up their work, and filling out a 20-page Word document is the last thing on their mind.
                    </p>
                    <p>
                        This is where modern <strong>Knowledge Transfer Software</strong> comes in. Tools like VEQ automate this process by guiding departing employees through interactive, bite-sized workflows (like our famous "Exit Brain Dump") and instantly indexing their knowledge for future hires.
                    </p>
                </div>

                {/* CALL TO ACTION (CTA) BOX */}
                <div className="mt-16 p-8 md:p-12 bg-[#3A2418] text-[#F4EDE1] rounded-3xl text-center">
                    <h3 className="font-display text-3xl italic mb-4">Don't Start From Scratch</h3>
                    <p className="text-[#E9DED0] mb-8 max-w-xl mx-auto">
                        We've compiled all these steps into a ready-to-use Excel template. Just fill in the blanks and you're good to go.
                    </p>
                    <Link
                        href="/knowledge-transfer-plan-template"
                        className="inline-flex px-8 py-4 bg-[#C6A15B] text-white rounded-xl hover:bg-[#b08d4b] transition-colors font-mono text-sm font-semibold items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download Free Plan Template
                    </Link>
                </div>

            </article>

            {/* FOOTER */}
            <footer className="border-t border-[#3A2418]/10 bg-[#F4EDE1] py-8 text-center">
                <p className="text-xs font-mono text-[#806B58]">
                    © {new Date().getFullYear()} VEQ Knowledge Management. All rights reserved.
                </p>
            </footer>
        </main>
    )
}