"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Activity, CheckCircle2, Clock, ShieldAlert, Zap, Ghost, User, AlertTriangle, XCircle } from "lucide-react"

interface Stats {
    totalMonitored: number
    runningSuccessfully: number
    awaitingApproval: number
    blocked: number
}

interface ActivityEntry {
    timestamp: string
    message: string
    agentType: string
    status: 'completed' | 'pending_approval' | 'denied'
}

export default function AutopilotPage() {
    const { user } = useUser()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<Stats>({ totalMonitored: 0, runningSuccessfully: 0, awaitingApproval: 0, blocked: 0 })
    const [activityFeed, setActivityFeed] = useState<ActivityEntry[]>([])
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    // Fetch data and set up auto-refresh every 30 seconds for the "live" feel
    useEffect(() => {
        const fetchAutopilot = async () => {
            try {
                const res = await fetch('/api/autopilot')
                const data = await res.json()
                if (data.success) {
                    setStats(data.stats)
                    setActivityFeed(data.activityFeed)
                    setLastUpdated(new Date())
                }
            } catch (err) {
                console.error('Failed to fetch autopilot data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchAutopilot()
        const interval = setInterval(fetchAutopilot, 30000) // Auto-refresh every 30s
        return () => clearInterval(interval)
    }, [])

    const formatTime = (isoString: string) => {
        const date = new Date(isoString)
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />
            case 'pending_approval': return <Clock className="w-4 h-4 text-yellow-600" />
            case 'denied': return <XCircle className="w-4 h-4 text-red-600" />
            default: return <Activity className="w-4 h-4 text-muted" />
        }
    }

    if (loading) {
        return (
            <section className="max-w-5xl mx-auto px-6 py-16 md:py-24 flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Zap className="w-12 h-12 text-brown animate-pulse mx-auto mb-4" />
                    <p className="text-brown font-display text-xl italic">Initializing VEQ Autopilot...</p>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-2">
                        Intelligence · Live Operations
                    </p>
                    <h1 className="font-display text-4xl md:text-5xl text-brown italic">
                        VEQ Autopilot
                    </h1>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-300">
                    <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                    <span className="text-xs font-mono text-green-800 font-semibold">LIVE</span>
                </div>
            </div>

            <p className="text-muted max-w-2xl mb-12">
                A real-time view of your company's autonomous workflows. VEQ continuously monitors, executes, and escalates tasks across your organization — safely and transparently.
            </p>

            {/* Workflow Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="rounded-xl border hairline bg-white/60 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-brown" />
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Monitored</p>
                    </div>
                    <p className="font-display text-4xl text-brown font-bold">{stats.totalMonitored}</p>
                    <p className="text-xs text-muted mt-1">Total workflows</p>
                </div>

                <div className="rounded-xl border hairline bg-green-50/60 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <p className="font-mono text-[10px] uppercase tracking-widest text-green-700">Running</p>
                    </div>
                    <p className="font-display text-4xl text-green-700 font-bold">{stats.runningSuccessfully}</p>
                    <p className="text-xs text-muted mt-1">Completed successfully</p>
                </div>

                <div className="rounded-xl border hairline bg-yellow-50/60 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <p className="font-mono text-[10px] uppercase tracking-widest text-yellow-700">Awaiting</p>
                    </div>
                    <p className="font-display text-4xl text-yellow-700 font-bold">{stats.awaitingApproval}</p>
                    <p className="text-xs text-muted mt-1">Pending approval</p>
                </div>

                <div className="rounded-xl border hairline bg-red-50/60 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                        <p className="font-mono text-[10px] uppercase tracking-widest text-red-700">Blocked</p>
                    </div>
                    <p className="font-display text-4xl text-red-700 font-bold">{stats.blocked}</p>
                    <p className="text-xs text-muted mt-1">Security blocks</p>
                </div>
            </div>

            {/* Live Activity Feed */}
            <div className="rounded-2xl border hairline bg-cream-deep/40">
                <div className="p-6 border-b hairline flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-brown" />
                        <h2 className="font-display text-2xl text-brown italic">Live Activity</h2>
                    </div>
                    <p className="text-xs font-mono text-muted">
                        Updated {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>

                <div className="p-6">
                    {activityFeed.length === 0 ? (
                        <div className="text-center py-12">
                            <Ghost className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                            <p className="text-brown font-display text-xl italic mb-2">Autopilot is idle.</p>
                            <p className="text-sm text-muted">No workflows have been triggered yet. Start using VEQ agents to see live activity here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activityFeed.map((entry, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white/60 border hairline hover:bg-white/80 transition-colors">
                                    <div className="shrink-0 w-16 text-center">
                                        <span className="font-mono text-sm font-bold text-brown">{formatTime(entry.timestamp)}</span>
                                    </div>
                                    <div className="shrink-0 mt-0.5">
                                        {getStatusIcon(entry.status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-brown leading-relaxed">{entry.message}</p>
                                        <p className="text-[10px] font-mono text-muted mt-1 uppercase tracking-wider">
                                            {entry.agentType.replace('_agent', ' Agent')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <p className="text-xs text-muted text-center mt-8 font-mono">
                Autopilot refreshes automatically every 30 seconds. All data is sourced from your company's secure audit trail.
            </p>
        </section>
    )
}