"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Activity, AlertTriangle, CheckCircle, XCircle, MinusCircle } from "lucide-react"

interface Indicator {
    label: string
    status: 'green' | 'yellow' | 'red' | 'gray'
    message: string
}

export default function KnowledgeHealthPage() {
    const { user } = useUser()
    const [loading, setLoading] = useState(true)
    const [score, setScore] = useState(0)
    const [totalItems, setTotalItems] = useState(0)
    const [indicators, setIndicators] = useState<Indicator[]>([])

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await fetch('/api/knowledge-health')
                const data = await res.json()
                if (data.success) {
                    setScore(data.readinessScore)
                    setTotalItems(data.totalItems)
                    setIndicators(data.indicators)
                }
            } catch (err) {
                console.error('Failed to fetch health metrics:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchHealth()
    }, [])

    // Dynamically assign the correct icon based on REAL backend status
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'green': return <CheckCircle className="w-5 h-5 text-green-600" />
            case 'yellow': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
            case 'red': return <XCircle className="w-5 h-5 text-red-600" />
            case 'gray': return <MinusCircle className="w-5 h-5 text-muted" /> // Shows when no data exists yet
            default: return <MinusCircle className="w-5 h-5 text-muted" />
        }
    }

    // Dynamically color the score based on REAL calculation
    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-600'
        if (score >= 40) return 'text-yellow-600'
        return 'text-red-600'
    }

    if (loading) {
        return (
            <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-brown animate-pulse mx-auto mb-4" />
                    <p className="text-brown font-display text-xl italic">Analyzing organizational memory...</p>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                Intelligence · Analytics
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                Knowledge Health & Agent Readiness
            </h1>
            <p className="text-muted max-w-xl mb-12">
                A real-time assessment of your company's organizational memory and how safely your AI agents can automate workflows.
            </p>

            {/* Overall Score Card (Calculated from REAL database rows) */}
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

            {/* Health Indicators Grid (The Exact 5 Requested, Driven by Real Data) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </section>
    )
}