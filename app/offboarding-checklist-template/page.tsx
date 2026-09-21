// app/offboarding-checklist-template/page.tsx (Server Component — no "use client")
import Link from "next/link"
import type { Metadata } from "next"
import { CheckCircle2, ArrowRight } from "lucide-react"
import ChecklistCaptureForm from "@/components/ChecklistCaptureForm"

export const metadata: Metadata = {
    title: "Free Employee Offboarding Checklist Template | VEQ",
    description:
        "Download a free employee offboarding checklist covering pre-departure, knowledge transfer, final week, and post-departure steps.",
}

export default function OffboardingChecklistTemplate() {
    return (
        <main className="min-h-screen bg-[#F4EDE1] text-[#3A2418]">
            {/* HERO */}
            <section className="px-6 py-20 md:py-28 max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C6A15B]/10 border border-[#C6A15B]/30 mb-6">
                    <CheckCircle2 className="w-4 h-4 text-[#C6A15B]" />
                    <span className="text-xs font-mono font-semibold text-[#C6A15B] uppercase">Free Template</span>
                </div>

                <h1 className="font-display text-4xl md:text-6xl text-[#3A2418] italic mb-6">
                    Employee Offboarding Checklist Template
                </h1>

                <p className="text-lg text-[#806B58] mb-8 max-w-2xl mx-auto">
                    A comprehensive checklist to help reduce knowledge loss when employees leave. Get your free template.
                </p>

                <ChecklistCaptureForm />

                <p className="text-xs text-[#806B58] mt-4 font-mono">✓ Free forever  ✓ No credit card  ✓ Instant download</p>
            </section>

            {/* CHECKLIST PREVIEW */}
            <section className="px-6 py-16 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-display text-3xl text-[#3A2418] italic mb-8 text-center">What's Inside the Checklist?</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { phase: "Pre-Departure (Week 1-2)", tasks: ["Exit interview scheduling", "Knowledge transfer planning", "Access audit preparation", "Equipment inventory list"] },
                            { phase: "Knowledge Transfer (Week 2-3)", tasks: ["Document critical processes", "Record video handovers", "Share login credentials securely", "Introduce successor to key contacts"] },
                            { phase: "Final Week", tasks: ["Return company equipment", "Revoke system access", "Forward emails to manager", "Update team documentation"] },
                            { phase: "Post-Departure", tasks: ["Final payroll processing", "Benefits continuation info", "Alumni network invitation", "30-day knowledge audit"] },
                        ].map((item, idx) => (
                            <div key={idx} className="p-6 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30">
                                <h3 className="font-display text-lg text-[#3A2418] italic mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-[#C6A15B]" />
                                    {item.phase}
                                </h3>
                                <ul className="space-y-2">
                                    {item.tasks.map((task, tidx) => (
                                        <li key={tidx} className="text-sm text-[#806B58] flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B] mt-1.5 shrink-0" />
                                            {task}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 py-20 bg-[#3A2418] text-[#F4EDE1] text-center">
                <h2 className="font-display text-3xl md:text-4xl italic mb-4">Want to automate your offboarding?</h2>
                <p className="text-[#E9DED0] mb-8 max-w-2xl mx-auto">
                    VEQ's Exit Brain Dump helps capture knowledge from departing employees, so critical information isn't lost.
                </p>
                <Link href="/dashboard" className="inline-flex px-8 py-4 bg-[#C6A15B] text-white rounded-xl hover:bg-[#b08d4b] transition-colors font-mono text-sm font-semibold items-center gap-2">
                    Try VEQ Free
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </section>
        </main>
    )
}