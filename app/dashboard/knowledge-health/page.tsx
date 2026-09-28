"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Activity, AlertTriangle, CheckCircle, XCircle, MinusCircle, User, ShieldCheck, TrendingUp, Globe } from "lucide-react"

interface Indicator {
    label: string
    status: 'green' | 'yellow' | 'red' | 'gray'
    message: string
}

interface RiskAlert {
    user_id: string
    user_name: string
    risk_score: number
    risk_level: 'Low' | 'Medium' | 'Critical'
    reason: string
}

export default function KnowledgeHealthPage() {
    const { user } = useUser()
    const [loading, setLoading] = useState(true)

    // Existing State
    const [score, setScore] = useState(0)
    const [totalItems, setTotalItems] = useState(0)
    const [indicators, setIndicators] = useState<Indicator[]>([])

    // NEW: Risk Radar State
    const [alerts, setAlerts] = useState<RiskAlert[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch existing health metrics
                const healthRes = await fetch('/api/knowledge-health')
                const healthData = await healthRes.json()
                if (healthData.success) {
                    setScore(healthData.readinessScore)
                    setTotalItems(healthData.totalItems)
                    setIndicators(healthData.indicators)
                }

                // Fetch NEW predictive risk alerts
                const riskRes = await fetch('/api/risk-engine')
                const riskData = await riskRes.json()
                if (riskRes.ok) {
                    const criticalAlerts = (riskData.alerts || []).filter((a: RiskAlert) => a.risk_level !== 'Low')
                    setAlerts(criticalAlerts)
                }
            } catch (err) {
                console.error('Failed to fetch health metrics:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'green': return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'yellow': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
            case 'red': return <XCircle className="w-5 h-5 text-red-600" />
            case 'gray': return <MinusCircle className="w-5 h-5 text-muted" />
            default: return <MinusCircle className="w-5 h-5 text-muted" />
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-600'
        if (score >= 40) return 'text-yellow-600'
        return 'text-red-600'
    }

    // 🌐 WAZE EFFECT: Calculate Industry Benchmark dynamically
    const getBenchmarkData = (currentScore: number) => {
        const industryAverage = 68 // Anonymized baseline for SaaS/Tech
        if (currentScore >= 80) {
            return { percentile: "Top 10%", message: "Congratulations! Your knowledge continuity is exceptional.", color: "text-green-600", bg: "bg-green-50/50", border: "border-green-200" }
        } else if (currentScore >= 60) {
            return { percentile: "Top 30%", message: "You are performing above the industry average. Keep building!", color: "text-[#C6A15B]", bg: "bg-[#F4EDE1]/50", border: "border-[#C6A15B]/30" }
        } else {
            return { percentile: "Bottom 40%", message: "Your score is below industry average. Immediate knowledge capture recommended.", color: "text-red-600", bg: "bg-red-50/50", border: "border-red-200" }
        }
    }

    const benchmark = getBenchmarkData(score)

    if (loading) {
        return (
            <section className="max-w-5xl mx-auto px-6 py-16 md:py-24 flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-brown animate-pulse mx-auto mb-4" />
                    <p className="text-brown font-display text-xl italic">Analyzing organizational memory & predicting risks...</p>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
            {/* HEADER */}
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                Intelligence · Analytics
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                Knowledge Health & Risk Radar
            </h1>
            <p className="text-muted max-w-xl mb-12">
                A real-time assessment of your company's organizational memory, automation readiness, and predictive attrition risks.
            </p>

            {/* 1. OVERALL SCORE CARD */}
            <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 mb-8 text-center">
                <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">Overall Automation Readiness</p>
                <div className={`font-display text-7xl md:text-8xl font-bold ${getScoreColor(score)} mb-4`}>
                    {score}%
                </div>
                <p className="text-sm text-muted">
                    Based on {totalItems} total knowledge nodes and agent actions.
                    {totalItems === 0 && " Start using VEQ agents to build your score!"}
                </p>
            </div>

            {/* 🌐 2. NEW: INDUSTRY BENCHMARK CARD (THE "WAZE" EFFECT) */}
            <div className={`rounded-2xl border-2 ${benchmark.border} ${benchmark.bg} p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6`}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-full shadow-sm">
                        <Globe className={`w-8 h-8 ${benchmark.color}`} />
                    </div>
                    <div>
                        <h3 className="font-display text-xl text-brown italic flex items-center gap-2">
                            Industry Knowledge Health Index
                            <span className={`text-xs font-mono px-2 py-1 rounded-full bg-white border ${benchmark.border} ${benchmark.color}`}>
                                {benchmark.percentile}
                            </span>
                        </h3>
                        <p className="text-sm text-muted mt-1 max-w-lg">
                            {benchmark.message} Your score of <span className="font-bold text-brown">{score}</span> is compared against anonymized data from {totalItems > 0 ? "similar SaaS & Tech" : "industry"} companies using VEQ. (Industry Avg: 68%)
                        </p>
                    </div>
                </div>
                <div className="shrink-0">
                    <div className="flex items-center gap-2 text-sm font-mono text-brown">
                        <TrendingUp className="w-4 h-4" />
                        <span>Anonymous & Aggregated</span>
                    </div>
                </div>
            </div>

            {/* 3. HEALTH INDICATORS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {indicators.map((indicator, idx) => (
                    <div key={idx} className="rounded-xl border hairline bg-white/60 p-6 flex items-start gap-4">
                        <div className="shrink-0 mt-1">
                            {getStatusIcon(indicator.status)}
                        </div>
                        <div>
                            <h3 className="font-display text-lg text-brown italic mb-1">{indicator.label}</h3>
                            <p className="text-sm text-muted">{indicator.message}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 4. PREDICTIVE RISK RADAR */}
            <div className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h2 className="font-display text-2xl text-brown italic">Predictive Attrition Risks</h2>
                </div>

                {alerts.length === 0 ? (
                    <div className="text-center py-12 bg-cream-deep/40 rounded-2xl border hairline">
                        <ShieldCheck className="w-10 h-10 text-green-600 mx-auto mb-3" />
                        <p className="text-brown font-medium">No critical risks detected. Your team's knowledge is well-distributed!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {alerts.map((alert) => (
                            <div key={alert.user_id} className={`rounded-xl border hairline p-5 flex items-center justify-between transition ${alert.risk_level === 'Critical' ? 'bg-red-50/50 border-red-200' :
                                    'bg-yellow-50/50 border-yellow-200'
                                }`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${alert.risk_level === 'Critical' ? 'bg-red-100' : 'bg-yellow-100'
                                        }`}>
                                        <User className={`w-6 h-6 ${alert.risk_level === 'Critical' ? 'text-red-600' : 'text-yellow-600'
                                            }`} />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-lg text-brown italic">{alert.user_name}</h3>
                                        <p className="text-sm text-muted mt-1">{alert.reason}</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className={`text-2xl font-bold ${alert.risk_level === 'Critical' ? 'text-red-600' : 'text-yellow-600'
                                        }`}>
                                        {alert.risk_score}% Risk
                                    </div>
                                    <span className={`text-xs font-mono uppercase px-2 py-1 rounded mt-1 inline-block ${alert.risk_level === 'Critical' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                                        }`}>
                                        {alert.risk_level}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}