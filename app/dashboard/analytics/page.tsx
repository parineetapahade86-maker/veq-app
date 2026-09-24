"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase"
import {
    Activity, Clock, Layers, AlertTriangle, TrendingUp,
    FileText, Sparkles, Loader2, CheckCircle2, DollarSign,
    ShieldAlert, Brain, ArrowUpRight, ArrowDownRight, MessageCircle,
    Users
} from "lucide-react"

interface HealthMetrics {
    freshness: number
    coverage: number
    aiEnrichment: number
    gaps: string[]
    totalItems: number
    uniqueTopicsList: string[]
}

interface EngagementMetrics {
    totalDocs: number
    approvedDocs: number
    totalComments: number
    totalVersions: number
}

export default function AnalyticsPage() {
    const { user } = useUser()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [healthScore, setHealthScore] = useState(0)
    const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null)

    // New States for Real-time Engagement & Risk
    const [engagement, setEngagement] = useState<EngagementMetrics>({ totalDocs: 0, approvedDocs: 0, totalComments: 0, totalVersions: 0 })
    const [riskEmployees, setRiskEmployees] = useState<any[]>([])
    const [employeeCount, setEmployeeCount] = useState(100)

    const roiSaved = (employeeCount / 1000) * 47000000;

    useEffect(() => {
        if (user) fetchAllData()
    }, [user])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            // 1. Fetch Existing Health API Data
            const res = await fetch('/api/knowledge/health')
            const data = await res.json()
            if (data.success) {
                setHealthScore(data.healthScore)
                setHealthMetrics(data.metrics)
            }

            // 2. Fetch New Real-time Supabase Data
            const [docsRes, approvedRes, commentsRes, versionsRes, riskRes] = await Promise.all([
                supabase.from('knowledge_items').select('id', { count: 'exact', head: true }),
                supabase.from('knowledge_items').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
                supabase.from('comments').select('id', { count: 'exact', head: true }),
                supabase.from('document_versions').select('id', { count: 'exact', head: true }),
                supabase.from('user_profiles').select('id, full_name, email, employment_status, offboarding_started_at').not('offboarding_started_at', 'is', null).limit(5)
            ])

            setEngagement({
                totalDocs: docsRes.count || 0,
                approvedDocs: approvedRes.count || 0,
                totalComments: commentsRes.count || 0,
                totalVersions: versionsRes.count || 0
            })
            setRiskEmployees(riskRes.data || [])

        } catch (err) {
            console.error('Failed to fetch analytics data:', err)
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
                    <span className="font-mono text-sm">Analyzing Knowledge Health & Risks...</span>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 space-y-8">
            {/* Header */}
            <div>
                <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#806B58] mb-4">
                    Workspace · Advanced Analytics
                </p>
                <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic mb-4">
                    Knowledge Health Intelligence
                </h1>
                <p className="text-[#806B58] max-w-xl">
                    Real-time insights into how organized, fresh, and useful your company's knowledge base is.
                </p>
            </div>

            {/* TOP ROW: Health Score & ROI Calculator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overall Health Score Card (Existing) */}
                <div className={`rounded-3xl border p-8 flex flex-col md:flex-row items-center justify-between gap-6 ${getScoreColor(healthScore)}`}>
                    <div className="text-center md:text-left">
                        <h2 className="font-display text-2xl text-[#3A2418] italic mb-2">Overall Health Score</h2>
                        <p className="text-[#806B58] text-sm">
                            Based on freshness, topic coverage, and AI enrichment.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-5xl font-display font-bold text-[#3A2418]">{healthScore}<span className="text-2xl text-[#806B58]">/100</span></p>
                            <p className="text-sm font-mono font-semibold mt-1">{getScoreLabel(healthScore)}</p>
                        </div>
                        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${healthScore >= 80 ? 'border-green-500' : healthScore >= 50 ? 'border-yellow-500' : 'border-red-500'}`}>
                            <Activity className={`w-8 h-8 ${healthScore >= 80 ? 'text-green-600' : healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`} />
                        </div>
                    </div>
                </div>

                {/* ROI Calculator (New - Themed to match) */}
                <div className="rounded-3xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-700" />
                        </div>
                        <h2 className="font-display text-2xl text-[#3A2418] italic">ROI Calculator</h2>
                    </div>
                    <p className="text-xs text-[#806B58] font-mono mb-4">Calculate how much capital VEQ protects from knowledge loss.</p>

                    <div className="flex items-end gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-xs font-mono text-[#806B58] mb-1">Number of Employees</label>
                            <input
                                type="number"
                                value={employeeCount}
                                onChange={(e) => setEmployeeCount(Number(e.target.value))}
                                className="w-full px-4 py-2 border border-[#E9DED0] rounded-xl bg-white/60 focus:ring-2 focus:ring-[#C6A15B] focus:outline-none text-[#3A2418] font-bold"
                            />
                        </div>
                        <div className="text-right pb-2">
                            <p className="text-xs text-[#806B58] font-mono">Protected Value</p>
                            <p className="text-3xl font-display font-bold text-green-700">
                                ${(roiSaved / 1000000).toFixed(1)}M
                            </p>
                        </div>
                    </div>
                    <p className="text-[10px] text-[#806B58] font-mono bg-white/40 p-2 rounded-lg">
                        Industry Avg: $47M risk per 1,000 employees annually.
                    </p>
                </div>
            </div>

            {/* MIDDLE ROW 1: Existing AI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Freshness */}
                <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg"><Clock className="w-5 h-5 text-blue-700" /></div>
                        <h3 className="font-display text-lg text-[#3A2418] italic">Freshness</h3>
                    </div>
                    <p className="text-3xl font-bold text-[#3A2418] mb-2">{healthMetrics?.freshness || 0}%</p>
                    <p className="text-xs text-[#806B58] font-mono">Documents updated in last 90 days</p>
                    <div className="w-full bg-[#E9DED0] rounded-full h-2 mt-4">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${healthMetrics?.freshness || 0}%` }}></div>
                    </div>
                </div>

                {/* Coverage */}
                <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg"><Layers className="w-5 h-5 text-purple-700" /></div>
                        <h3 className="font-display text-lg text-[#3A2418] italic">Coverage</h3>
                    </div>
                    <p className="text-3xl font-bold text-[#3A2418] mb-2">{healthMetrics?.coverage || 0}</p>
                    <p className="text-xs text-[#806B58] font-mono">Unique topics identified by AI</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {healthMetrics?.uniqueTopicsList.slice(0, 4).map((topic, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-[10px] font-mono">{topic}</span>
                        ))}
                        {(healthMetrics?.uniqueTopicsList.length || 0) > 4 && (
                            <span className="px-2 py-1 bg-[#E9DED0] text-[#806B58] rounded-md text-[10px] font-mono">+{(healthMetrics?.uniqueTopicsList.length || 0) - 4}</span>
                        )}
                    </div>
                </div>

                {/* AI Enrichment */}
                <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#C6A15B]/20 rounded-lg"><Sparkles className="w-5 h-5 text-[#8B6914]" /></div>
                        <h3 className="font-display text-lg text-[#3A2418] italic">AI Enriched</h3>
                    </div>
                    <p className="text-3xl font-bold text-[#3A2418] mb-2">{healthMetrics?.aiEnrichment || 0}%</p>
                    <p className="text-xs text-[#806B58] font-mono">Documents processed with AI extraction</p>
                    <div className="w-full bg-[#E9DED0] rounded-full h-2 mt-4">
                        <div className="bg-[#C6A15B] h-2 rounded-full transition-all duration-1000" style={{ width: `${healthMetrics?.aiEnrichment || 0}%` }}></div>
                    </div>
                </div>
            </div>

            {/* MIDDLE ROW 2: New Engagement Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-[#E9DED0] bg-white/60 p-5">
                    <FileText className="w-5 h-5 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-[#3A2418]">{engagement.totalDocs}</p>
                    <p className="text-[10px] text-[#806B58] font-mono uppercase">Total Knowledge</p>
                </div>
                <div className="rounded-xl border border-[#E9DED0] bg-white/60 p-5">
                    <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-[#3A2418]">{engagement.approvedDocs}</p>
                    <p className="text-[10px] text-[#806B58] font-mono uppercase">Approved</p>
                </div>
                <div className="rounded-xl border border-[#E9DED0] bg-white/60 p-5">
                    <MessageCircle className="w-5 h-5 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-[#3A2418]">{engagement.totalComments}</p>
                    <p className="text-[10px] text-[#806B58] font-mono uppercase">Discussions</p>
                </div>
                <div className="rounded-xl border border-[#E9DED0] bg-white/60 p-5">
                    <Activity className="w-5 h-5 text-[#C6A15B] mb-2" />
                    <p className="text-2xl font-bold text-[#3A2418]">{engagement.totalVersions}</p>
                    <p className="text-[10px] text-[#806B58] font-mono uppercase">Versions</p>
                </div>
            </div>

            {/* BOTTOM ROW: Risk & Predictive Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Assessment */}
                <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-100 rounded-lg"><ShieldAlert className="w-5 h-5 text-red-700" /></div>
                        <h3 className="font-display text-xl text-[#3A2418] italic">Risk Assessment</h3>
                    </div>

                    {riskEmployees.length === 0 ? (
                        <div className="text-center py-8 bg-green-50/50 rounded-xl border border-dashed border-green-200">
                            <ShieldAlert className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-green-800 font-medium text-sm">No immediate offboarding risks!</p>
                            <p className="text-[10px] text-green-700 font-mono mt-1">All critical knowledge is secure.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {riskEmployees.map((emp) => (
                                <div key={emp.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-800 font-bold">
                                            {emp.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#3A2418] text-sm">{emp.full_name || 'Unknown'}</p>
                                            <p className="text-[10px] text-[#806B58] font-mono">{emp.email}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-red-200 text-red-800 text-[10px] rounded-full font-bold font-mono">
                                        OFFBOARDING
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Predictive Insights */}
                <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg"><Brain className="w-5 h-5 text-purple-700" /></div>
                        <h3 className="font-display text-xl text-[#3A2418] italic">Predictive Insights</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                            <div className="flex items-start gap-3">
                                <ArrowUpRight className="w-5 h-5 text-purple-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-[#3A2418] text-sm">Documentation Velocity</p>
                                    <p className="text-xs text-[#806B58] mt-1 leading-relaxed">
                                        Your team created <span className="font-bold text-purple-700">{engagement.totalDocs}</span> knowledge items.
                                        {engagement.totalDocs > 10 ? " You are in the top 10% of knowledge-first companies!" : " Aim for at least 10 items to build a strong baseline."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-[#C6A15B]/10 rounded-xl border border-[#C6A15B]/20">
                            <div className="flex items-start gap-3">
                                <ArrowDownRight className="w-5 h-5 text-[#8B6914] mt-0.5" />
                                <div>
                                    <p className="font-semibold text-[#3A2418] text-sm">Collaboration Gap</p>
                                    <p className="text-xs text-[#806B58] mt-1 leading-relaxed">
                                        Only <span className="font-bold text-[#8B6914]">{engagement.totalComments}</span> discussions recorded.
                                        Encourage your team to use the "Team Discussions" feature to capture tribal knowledge.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER: Existing Insights & Recommendations (Gaps) */}
            <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-orange-700" />
                    </div>
                    <h3 className="font-display text-xl text-[#3A2418] italic">AI Detected Knowledge Gaps</h3>
                </div>

                <div className="space-y-3">
                    {healthMetrics?.gaps && healthMetrics.gaps.length > 0 ? healthMetrics.gaps.map((gap, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/60 border border-[#E9DED0]">
                            <CheckCircle2 className="w-5 h-5 text-[#C6A15B] mt-0.5 shrink-0" />
                            <p className="text-sm text-[#3A2418]/90 leading-relaxed">{gap}</p>
                        </div>
                    )) : (
                        <div className="text-center py-6 text-[#806B58] text-sm font-mono">
                            No critical gaps detected by AI. Great job!
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-[#E9DED0] flex justify-end">
                    <button
                        onClick={fetchAllData}
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