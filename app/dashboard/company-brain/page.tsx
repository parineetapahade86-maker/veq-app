"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Brain, FileText, Scale, AlertTriangle, Loader2, BookOpen } from "lucide-react"

export default function CompanyBrainPage() {
    const { user } = useUser()
    const [loading, setLoading] = useState(true)
    const [context, setContext] = useState<any>({ sops: [], decisions: [], rules: [] })

    useEffect(() => {
        const fetchContext = async () => {
            try {
                const res = await fetch('/api/company-context')
                const data = await res.json()
                if (data.success) setContext(data.context)
            } catch (err) {
                console.error('Failed to fetch company context:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchContext()
    }, [])

    if (loading) {
        return (
            <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Brain className="w-12 h-12 text-brown animate-pulse mx-auto mb-4" />
                    <p className="text-brown font-display text-xl italic">Scanning Company DNA...</p>
                </div>
            </section>
        )
    }

    const totalKnowledge = context.sops.length + context.decisions.length + context.rules.length;

    return (
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                Intelligence · Company-Specific AI
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                The Company Brain
            </h1>
            <p className="text-muted max-w-2xl mb-12">
                This is what VEQ knows about how <strong>YOUR</strong> company works. The more you use VEQ, the smarter and more personalized this brain becomes.
            </p>

            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                <div className="rounded-xl border hairline bg-white/60 p-6 text-center">
                    <BookOpen className="w-6 h-6 text-brown mx-auto mb-2" />
                    <p className="font-display text-3xl text-brown font-bold">{context.sops.length}</p>
                    <p className="text-xs text-muted uppercase tracking-wider">Active SOPs</p>
                </div>
                <div className="rounded-xl border hairline bg-white/60 p-6 text-center">
                    <Scale className="w-6 h-6 text-brown mx-auto mb-2" />
                    <p className="font-display text-3xl text-brown font-bold">{context.decisions.length}</p>
                    <p className="text-xs text-muted uppercase tracking-wider">Historical Decisions</p>
                </div>
                <div className="rounded-xl border hairline bg-white/60 p-6 text-center">
                    <AlertTriangle className="w-6 h-6 text-brown mx-auto mb-2" />
                    <p className="font-display text-3xl text-brown font-bold">{context.rules.length}</p>
                    <p className="text-xs text-muted uppercase tracking-wider">Custom Rules</p>
                </div>
            </div>

            {totalKnowledge === 0 ? (
                <div className="rounded-2xl border hairline bg-cream-deep/40 p-12 text-center">
                    <Brain className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                    <h2 className="font-display text-2xl text-brown italic mb-2">The Brain is Empty</h2>
                    <p className="text-muted max-w-md mx-auto">
                        VEQ doesn't know how your company works yet. Use the <strong>Exit Brain Dump</strong> or <strong>Meeting Intelligence</strong> to start teaching the AI your specific processes and decisions.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* SOPs Section */}
                    {context.sops.length > 0 && (
                        <div>
                            <h2 className="font-display text-2xl text-brown italic mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" /> How We Work (SOPs)
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {context.sops.map((sop: any, idx: number) => (
                                    <div key={idx} className="rounded-xl bg-white/80 border hairline p-5 shadow-sm">
                                        <h3 className="font-display text-lg text-brown italic mb-2">{sop.topic.replace('SOP: ', '')}</h3>
                                        <p className="text-sm text-muted line-clamp-3">{sop.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Decisions Section */}
                    {context.decisions.length > 0 && (
                        <div>
                            <h2 className="font-display text-2xl text-brown italic mb-4 flex items-center gap-2">
                                <Scale className="w-5 h-5" /> Why We Do It (Decisions)
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {context.decisions.map((dec: any, idx: number) => (
                                    <div key={idx} className="rounded-xl bg-white/80 border hairline p-5 shadow-sm">
                                        <h3 className="font-display text-lg text-brown italic mb-2">{dec.topic.replace('Decision: ', '')}</h3>
                                        <p className="text-sm text-muted line-clamp-3">{dec.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rules Section */}
                    {context.rules.length > 0 && (
                        <div>
                            <h2 className="font-display text-2xl text-brown italic mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Strict Company Rules
                            </h2>
                            <div className="space-y-3">
                                {context.rules.map((rule: any, idx: number) => (
                                    <div key={idx} className="rounded-xl bg-red-50/50 border border-red-200 p-5">
                                        <h3 className="font-display text-lg text-red-800 italic mb-1">{rule.topic.replace('Rule: ', '')}</h3>
                                        <p className="text-sm text-red-700">{rule.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}