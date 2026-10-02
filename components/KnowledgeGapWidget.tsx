// components/KnowledgeGapWidget.tsx
"use client"

import { AlertTriangle, Plus, CheckCircle, Brain } from "lucide-react"
import { BUSINESS_PILLARS, detectKnowledgeGaps } from "@/lib/gap-scanner"
import Link from "next/link"

interface KnowledgeGapWidgetProps {
    knowledgeItems: any[]
}

export default function KnowledgeGapWidget({ knowledgeItems }: KnowledgeGapWidgetProps) {
    const missingPillars = detectKnowledgeGaps(knowledgeItems)
    const coverage = Math.round(((BUSINESS_PILLARS.length - missingPillars.length) / BUSINESS_PILLARS.length) * 100)

    return (
        <div className="rounded-2xl border border-[#E9DED0] bg-white/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#C6A15B]/20 rounded-xl">
                        <Brain className="w-5 h-5 text-[#3A2418]" />
                    </div>
                    <div>
                        <h3 className="font-display text-xl text-[#3A2418] italic">AI Knowledge Gap Detector</h3>
                        <p className="text-xs font-mono text-[#806B58]">Proactive Business Analysis</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold font-display text-[#3A2418]">{coverage}%</p>
                    <p className="text-[10px] font-mono text-[#806B58] uppercase">Coverage</p>
                </div>
            </div>

            {missingPillars.length === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800 font-medium">Excellent! Your knowledge vault covers all critical business pillars.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-[#C6A15B]" />
                        <p className="text-sm font-mono text-[#806B58] uppercase font-semibold">Missing Critical Areas:</p>
                    </div>

                    {missingPillars.map((pillar) => (
                        <div
                            key={pillar.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/50 hover:border-[#C6A15B]/50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#C6A15B]"></div>
                                <span className="text-sm font-medium text-[#3A2418]">{pillar.name}</span>
                            </div>
                            <Link
                                href="/dashboard/knowledge"
                                className="px-3 py-1.5 bg-[#3A2418] text-[#F4EDE1] rounded-lg text-xs font-mono flex items-center gap-1 hover:bg-[#4A2F20] transition-all active:scale-95"
                            >
                                <Plus className="w-3 h-3" /> Add
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}