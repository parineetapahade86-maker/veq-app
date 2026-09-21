"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { ShieldAlert, AlertTriangle, FileX, Brain, Loader2, Users, GitBranch } from "lucide-react"

export default function KnowledgeRiskPage() {
    const { user } = useUser()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>({ riskScore: 100, criticalDependencies: [], knowledgeGaps: [] })

    useEffect(() => {
        const fetchRisk = async () => {
            try {
                const res = await fetch('/api/knowledge-risk-scan')
                const result = await res.json()
                if (result.success) setData(result)
            } catch (err) {
                console.error('Failed to fetch risk scan:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchRisk()
    }, [])

    if (loading) {
        return (
            <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <ShieldAlert className="w-12 h-12 text-brown animate-pulse mx-auto mb-4" />
                    <p className="text-brown font-display text-xl italic">Scanning Organizational Fragility...</p>
                </div>
            </section>
        )
    }

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-600'
        if (score >= 40) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreBg = (score: number) => {
        if (score >= 70) return 'bg-green-50 border-green-200'
        if (score >= 40) return 'bg-yellow-50 border-yellow-200'
        return 'bg-red-50 border-red-200'
    }

    return (
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                Intelligence · Risk Detection
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                Knowledge Risk & Gap Engine
            </h1>
            <p className="text-muted max-w-2xl mb-12">
                VEQ continuously scans your company's memory graph to detect fragile knowledge, hidden dependencies, and missing SOPs.
            </p>

            {/* 🔥 THE KILLER METRIC: KNOWLEDGE RISK SCORE */}
            <div className={`rounded-2xl border p-8 mb-12 flex flex-col md:flex-row items-center justify-between ${getScoreBg(data.riskScore)}`}>
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <ShieldAlert className={`w-12 h-12 ${getScoreColor(data.riskScore)}`} />
                    <div>
                        <h2 className="font-display text-2xl text-brown italic">Overall Knowledge Risk Score</h2>
                        <p className="text-sm text-muted mt-1">
                            {data.riskScore >= 70
                                ? "Your organizational memory is resilient and well-distributed."
                                : "Critical vulnerabilities detected. Immediate action recommended."}
                        </p>
                    </div>
                </div>
                <div className="text-center">
                    <p className={`font-display text-6xl font-bold ${getScoreColor(data.riskScore)}`}>
                        {data.riskScore}%
                    </p>
                    <p className="text-xs font-mono text-muted uppercase tracking-widest mt-1">Health Index</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* 🔴 SECTION 1: CRITICAL DEPENDENCIES (Single Point of Failure) */}
                <div className="rounded-2xl border hairline bg-cream-deep/40 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="w-5 h-5 text-red-600" />
                        <h2 className="font-display text-2xl text-brown italic">Single Points of Failure</h2>
                    </div>

                    {data.criticalDependencies.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted text-sm">No critical single points of failure detected. Knowledge is well distributed!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.criticalDependencies.map((dep: any, idx: number) => (
                                <div key={idx} className={`rounded-xl border p-4 ${dep.riskLevel === 'high' ? 'bg-red-50/50 border-red-200' : 'bg-yellow-50/50 border-yellow-200'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-display text-lg text-brown italic">{dep.personName}</h3>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold ${dep.riskLevel === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {dep.riskLevel} Risk
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted">
                                        Holds <strong>{dep.criticalConnections} critical connections</strong> in the memory graph.
                                    </p>
                                    <p className="text-xs text-red-700 mt-2 font-mono">
                                        ️ If {dep.personName} leaves, {dep.criticalConnections} processes/decisions lose their primary context.
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 🟡 SECTION 2: KNOWLEDGE GAPS (Missing SOPs) */}
                <div className="rounded-2xl border hairline bg-cream-deep/40 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <FileX className="w-5 h-5 text-yellow-600" />
                        <h2 className="font-display text-2xl text-brown italic">Missing SOPs & Gaps</h2>
                    </div>

                    {data.knowledgeGaps.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted text-sm">All frequently executed processes have documented SOPs. Great job!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.knowledgeGaps.map((gap: any, idx: number) => (
                                <div key={idx} className={`rounded-xl border p-4 ${gap.riskLevel === 'high' ? 'bg-red-50/50 border-red-200' : 'bg-yellow-50/50 border-yellow-200'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-display text-lg text-brown italic">{gap.processName}</h3>
                                        <span className="px-2 py-1 rounded-full bg-brown text-cream-deep text-[10px] font-mono uppercase tracking-wider font-bold">
                                            {gap.executionCount}x Executed
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted">
                                        Executed frequently, but <strong>no formal SOP exists</strong> in the Vault.
                                    </p>
                                    <p className="text-xs text-yellow-700 mt-2 font-mono">
                                        ⚠️ High risk of inconsistent execution. Recommend running an Exit Brain Dump or Meeting Intelligence for this process.
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <p className="text-xs text-muted text-center mt-12 font-mono">
                * Risk score is calculated dynamically using real-time graph mathematics on your company's actual memory nodes and edges.
            </p>
        </section>
    )
}