"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import {
    Activity, Clock, Layers, AlertTriangle, TrendingUp,
    FileText, Sparkles, Loader2, CheckCircle2
} from "lucide-react"

interface HealthMetrics {
    freshness: number
    coverage: number
    aiEnrichment: number
    gaps: string[]
    totalItems: number
    uniqueTopicsList: string[]
}

export default function AnalyticsPage() {
    const { user } = useUser()
    const [loading, setLoading] = useState(true)
    const [healthScore, setHealthScore] = useState(0)
    const [metrics, setMetrics] = useState<HealthMetrics | null>(null)

    useEffect(() => {
        if (user) fetchHealthData()
    }, [user])

    const fetchHealthData = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/knowledge/health')
            const data = await res.json()
            if (data.success) {
                setHealthScore(data.healthScore)
                setMetrics(data.metrics)
            }
        } catch (err) {
            console.error('Failed to fetch health data:', err)
        } finally {
            setLoading(false)
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
        if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        return 'text-red-600 bg-red-50 border-red-200'
    }

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent'
        if (score >= 50) return 'Good'
        return 'Needs Attention'
    }

    if (loading) {
        return (
            <section className="max-w-5xl mx-auto px-6 py-16 md:py-24 flex items-center justify-center min-h-[60vh]">
                <div className="flex items-center gap-3 text-[#806B58]">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="font-mono text-sm">Analyzing Knowledge Health...</span>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
            {/* Header */}
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#806B58] mb-4">
                Workspace · Analytics
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic mb-4">
                Knowledge Health Intelligence
            </h1>
            <p className="text-[#806B58] max-w-xl mb-12">
                Real-time insights into how organized, fresh, and useful your company's knowledge base is.
            </p>

            {/* Overall Health Score Card */}
            <div className={`rounded-3xl border p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 ${getScoreColor(healthScore)}`}>
                <div className="text-center md:text-left">
                    <h2 className="font-display text-3xl text-[#3A2418] italic mb-2">Overall Health Score</h2>
                    <p className="text-[#806B58] text-sm">
                        Based on freshness, topic coverage, and AI enrichment of {metrics?.totalItems || 0} documents.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-5xl font-display font-bold text-[#3A2418]">{healthScore}<span className="text-2xl text-[#806B58]">/100</span></p>
                        <p className="text-sm font-mono font-semibold mt-1">{getScoreLabel(healthScore)}</p>
                    </div>
                    <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${healthScore >= 80 ? 'border-green-500' : healthScore >= 50 ? 'border-yellow-500' : 'border-red-500'
                        }`}>
                        <Activity className={`w-8 h-8 ${healthScore >= 80 ? 'text-green-600' : healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Freshness */}
                <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-700" />
                        </div>
                        <h3 className="font-display text-lg text-[#3A2418] italic">Freshness</h3>
                    </div>
                    <p className="text-3xl font-bold text-[#3A2418] mb-2">{metrics?.freshness || 0}%</p>
                    <p className="text-xs text-[#806B58] font-mono">Documents updated in the last 90 days</p>
                    <div className="w-full bg-[#E9DED0] rounded-full h-2 mt-4">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${metrics?.freshness || 0}%` }}></div>
                    </div>
                </div>

                {/* Coverage */}
                <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Layers className="w-5 h-5 text-purple-700" />
                        </div>
                        <h3 className="font-display text-lg text-[#3A2418] italic">Coverage</h3>
                    </div>
                    <p className="text-3xl font-bold text-[#3A2418] mb-2">{metrics?.coverage || 0}</p>
                    <p className="text-xs text-[#806B58] font-mono">Unique topics identified by AI</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {metrics?.uniqueTopicsList.slice(0, 5).map((topic, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-[10px] font-mono">
                                {topic}
                            </span>
                        ))}
                        {(metrics?.uniqueTopicsList.length || 0) > 5 && (
                            <span className="px-2 py-1 bg-[#E9DED0] text-[#806B58] rounded-md text-[10px] font-mono">
                                +{(metrics?.uniqueTopicsList.length || 0) - 5} more
                            </span>
                        )}
                    </div>
                </div>

                {/* AI Enrichment */}
                <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#C6A15B]/20 rounded-lg">
                            <Sparkles className="w-5 h-5 text-[#8B6914]" />
                        </div>
                        <h3 className="font-display text-lg text-[#3A2418] italic">AI Enriched</h3>
                    </div>
                    <p className="text-3xl font-bold text-[#3A2418] mb-2">{metrics?.aiEnrichment || 0}%</p>
                    <p className="text-xs text-[#806B58] font-mono">Documents processed with AI extraction</p>
                    <div className="w-full bg-[#E9DED0] rounded-full h-2 mt-4">
                        <div className="bg-[#C6A15B] h-2 rounded-full transition-all duration-1000" style={{ width: `${metrics?.aiEnrichment || 0}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Knowledge Gaps & Recommendations */}
            <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-orange-700" />
                    </div>
                    <h3 className="font-display text-xl text-[#3A2418] italic">Insights & Recommendations</h3>
                </div>

                <div className="space-y-3">
                    {metrics?.gaps.map((gap, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/60 border border-[#E9DED0]">
                            <CheckCircle2 className="w-5 h-5 text-[#C6A15B] mt-0.5 shrink-0" />
                            <p className="text-sm text-[#3A2418]/90 leading-relaxed">{gap}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-[#E9DED0] flex justify-end">
                    <button
                        onClick={fetchHealthData}
                        className="px-6 py-3 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
                    >
                        <TrendingUp className="w-4 h-4" />
                        Refresh Analysis
                    </button>
                </div>
            </div>
        </section>
    )
}