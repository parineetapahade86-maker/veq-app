"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import {
    Brain, Zap, Users, Building2, TrendingUp, Activity,
    CheckCircle2, Clock, ShieldAlert, AlertCircle,
    BookOpen, Target, Lightbulb,
    RefreshCcw, ThumbsUp, ThumbsDown, Minus // 🔥 NEW: Added for Outcome Review Loop
} from "lucide-react"

interface Metrics {
    knowledgeHealth: {
        totalMemories: number
        currentMemories: number
        score: number
    }
    agentPerformance: Record<string, { total: number; completed: number; pending: number; denied: number }>
    teamEngagement: {
        activeUsers: number
        totalActions: number
    }
    departmentCoverage: {
        totalEmployees: number
        employeesWithHandover: number
        coveragePercentage: number
    }
}

interface WorkflowIntelligence {
    workflowName: string
    totalExecutions: number
    avgCompletionTime: string
    failureRate: string
    pendingCount: number
    status: 'green' | 'yellow' | 'red'
}

export default function CEODashboard() {
    const { user } = useUser()
    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState<Metrics | null>(null)
    const [workflowData, setWorkflowData] = useState<WorkflowIntelligence[]>([])
    const [companyIntelligence, setCompanyIntelligence] = useState<any>(null)

    // 🔥 NEW: Outcome Review Loop States
    const [pendingOutcomes, setPendingOutcomes] = useState<any[]>([])
    const [reviewingId, setReviewingId] = useState<string | null>(null)
    const [reviewNotes, setReviewNotes] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 🔥 Fetching from ALL APIs simultaneously for a complete real-time view
                const [metricsRes, workflowRes, intelligenceRes, outcomesRes] = await Promise.all([
                    fetch('/api/ceo-dashboard'),
                    fetch('/api/workflow-intelligence'),
                    fetch('/api/company-intelligence'),
                    fetch('/api/pending-outcomes') // 🔥 NEW: Fetch pending outcomes
                ])

                const metricsData = await metricsRes.json()
                const workflowDataRes = await workflowRes.json()
                const intelligenceData = await intelligenceRes.json()
                const outcomesData = await outcomesRes.json()

                if (metricsData.success) setMetrics(metricsData.metrics)
                if (workflowDataRes.success) setWorkflowData(workflowDataRes.intelligence)
                if (intelligenceData.success) setCompanyIntelligence(intelligenceData.intelligence)
                if (outcomesData.success) setPendingOutcomes(outcomesData.data)

            } catch (err) {
                console.error('Failed to fetch dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // 🔥 NEW: Handle Outcome Submission
    const handleOutcomeSubmit = async (memoryId: string, status: 'positive' | 'neutral' | 'negative') => {
        try {
            const res = await fetch('/api/outcome-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memoryId,
                    outcomeStatus: status,
                    outcomeNotes: reviewNotes
                })
            })
            const data = await res.json()
            if (data.success) {
                // Remove from pending list and show success
                setPendingOutcomes(prev => prev.filter((item: any) => item.id !== memoryId))
                setReviewingId(null)
                setReviewNotes("")
                alert(`✅ Outcome logged as ${status.toUpperCase()}! VEQ will learn from this.`)
            }
        } catch (err) {
            console.error('Failed to submit outcome:', err)
            alert('Failed to log outcome. Please try again.')
        }
    }

    if (loading || !metrics) {
        return (
            <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Brain className="w-12 h-12 text-brown animate-pulse mx-auto mb-4" />
                    <p className="text-brown font-display text-xl italic">Loading CEO Dashboard...</p>
                </div>
            </section>
        )
    }

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-600'
        if (score >= 40) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                Executive · Strategic Overview
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                CEO Dashboard
            </h1>
            <p className="text-muted max-w-2xl mb-12">
                A unified view of your company's AI readiness, agent performance, and organizational health — powered by real-time data from VEQ.
            </p>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
                {/* Knowledge Health */}
                <div className="rounded-xl border hairline bg-white/60 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-brown" />
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Knowledge</p>
                    </div>
                    <p className={`font-display text-4xl font-bold ${getScoreColor(metrics.knowledgeHealth.score)}`}>
                        {metrics.knowledgeHealth.score}%
                    </p>
                    <p className="text-xs text-muted mt-1">
                        {metrics.knowledgeHealth.currentMemories} / {metrics.knowledgeHealth.totalMemories} current
                    </p>
                </div>

                {/* Team Engagement */}
                <div className="rounded-xl border hairline bg-white/60 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-brown" />
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Active Users</p>
                    </div>
                    <p className="font-display text-4xl text-brown font-bold">
                        {metrics.teamEngagement.activeUsers}
                    </p>
                    <p className="text-xs text-muted mt-1">
                        {metrics.teamEngagement.totalActions} total actions
                    </p>
                </div>

                {/* Department Coverage */}
                <div className="rounded-xl border hairline bg-white/60 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-brown" />
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Coverage</p>
                    </div>
                    <p className={`font-display text-4xl font-bold ${getScoreColor(metrics.departmentCoverage.coveragePercentage)}`}>
                        {metrics.departmentCoverage.coveragePercentage}%
                    </p>
                    <p className="text-xs text-muted mt-1">
                        {metrics.departmentCoverage.employeesWithHandover} / {metrics.departmentCoverage.totalEmployees} employees
                    </p>
                </div>

                {/* Total Agents Active */}
                <div className="rounded-xl border hairline bg-white/60 p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-brown" />
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Agents</p>
                    </div>
                    <p className="font-display text-4xl text-brown font-bold">
                        {Object.keys(metrics.agentPerformance).length}
                    </p>
                    <p className="text-xs text-muted mt-1">
                        Active agent types
                    </p>
                </div>
            </div>

            {/* Agent Performance Breakdown */}
            <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-5 h-5 text-brown" />
                    <h2 className="font-display text-2xl text-brown italic">Agent Performance</h2>
                </div>

                {Object.keys(metrics.agentPerformance).length === 0 ? (
                    <p className="text-sm text-muted text-center py-8">No agent activity yet. Start using VEQ agents to see performance metrics.</p>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(metrics.agentPerformance).map(([agent, stats]) => (
                            <div key={agent} className="rounded-xl bg-white/60 border hairline p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-display text-lg text-brown italic capitalize">
                                        {agent.replace('_agent', ' Agent')}
                                    </h3>
                                    <span className="text-xs font-mono text-muted">{stats.total} total tasks</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-brown">{stats.completed} completed</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-yellow-600" />
                                        <span className="text-sm text-brown">{stats.pending} pending</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-red-600" />
                                        <span className="text-sm text-brown">{stats.denied} blocked</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 🔥 FULLY WIRED: Operational Intelligence Section */}
            <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-5 h-5 text-brown" />
                    <h2 className="font-display text-2xl text-brown italic">Workflow Operational Intelligence</h2>
                </div>

                {workflowData.length === 0 ? (
                    <p className="text-sm text-muted text-center py-8">No workflow data yet. As agents execute tasks, real operational metrics will appear here.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b hairline text-left">
                                    <th className="pb-3 font-mono text-[10px] uppercase tracking-widest text-muted">Workflow</th>
                                    <th className="pb-3 font-mono text-[10px] uppercase tracking-widest text-muted text-right">Executions</th>
                                    <th className="pb-3 font-mono text-[10px] uppercase tracking-widest text-muted text-right">Avg. Time</th>
                                    <th className="pb-3 font-mono text-[10px] uppercase tracking-widest text-muted text-right">Failure Rate</th>
                                    <th className="pb-3 font-mono text-[10px] uppercase tracking-widest text-muted text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y hairline">
                                {workflowData.map((wf, idx) => {
                                    const failureRateNum = parseFloat(wf.failureRate);
                                    const statusColor = failureRateNum > 15 ? 'text-red-600' : (failureRateNum > 5 ? 'text-yellow-600' : 'text-green-600');

                                    return (
                                        <tr key={idx} className="group hover:bg-white/40 transition-colors">
                                            <td className="py-4 font-display text-brown italic capitalize">
                                                {wf.workflowName}
                                            </td>
                                            <td className="py-4 text-right font-mono text-brown">
                                                {wf.totalExecutions}
                                            </td>
                                            <td className="py-4 text-right font-mono text-muted">
                                                {wf.avgCompletionTime}
                                            </td>
                                            <td className={`py-4 text-right font-mono font-bold ${statusColor}`}>
                                                {wf.failureRate}
                                            </td>
                                            <td className="py-4 text-center">
                                                {failureRateNum > 15 ? (
                                                    <AlertCircle className="w-4 h-4 text-red-600 mx-auto" />
                                                ) : failureRateNum > 5 ? (
                                                    <Clock className="w-4 h-4 text-yellow-600 mx-auto" />
                                                ) : (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <p className="text-xs text-muted mt-4 text-center font-mono">
                            * Failure rate represents tasks blocked by security or denied approval.
                            Calculated in real-time from VEQ audit logs.
                        </p>
                    </div>
                )}
            </div>

            {/* 🔥 Company-Specific Intelligence Section */}
            {companyIntelligence && (
                <div className="rounded-2xl border hairline bg-gradient-to-br from-gold/5 to-cream-deep/40 p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Target className="w-5 h-5 text-brown" />
                            <h2 className="font-display text-2xl text-brown italic">Company-Specific Intelligence</h2>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Uniqueness Score</p>
                            <p className="font-display text-3xl font-bold text-brown">{companyIntelligence.uniquenessScore}%</p>
                        </div>
                    </div>

                    {companyIntelligence.totalMemories === 0 && companyIntelligence.totalTasks === 0 ? (
                        <div className="text-center py-8">
                            <Lightbulb className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                            <p className="text-sm text-muted">No company-specific patterns detected yet.</p>
                            <p className="text-xs text-muted mt-2">As your team uses VEQ, unique terminology, workflows, and decisions will be automatically learned.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Company Terminology */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <BookOpen className="w-4 h-4 text-brown" />
                                    <h3 className="font-display text-lg text-brown italic">Terminology</h3>
                                </div>
                                {companyIntelligence.terminology.length > 0 ? (
                                    <div className="space-y-2">
                                        {companyIntelligence.terminology.slice(0, 5).map((term: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/60 border hairline">
                                                <span className="text-sm text-brown font-medium">{term.term}</span>
                                                <span className="text-xs font-mono text-muted">{term.usageCount}x</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted">No terminology patterns yet</p>
                                )}
                            </div>

                            {/* Most Used Workflows */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Activity className="w-4 h-4 text-brown" />
                                    <h3 className="font-display text-lg text-brown italic">Top Workflows</h3>
                                </div>
                                {companyIntelligence.workflows.length > 0 ? (
                                    <div className="space-y-2">
                                        {companyIntelligence.workflows.slice(0, 5).map((wf: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/60 border hairline">
                                                <span className="text-sm text-brown">{wf.name}</span>
                                                <span className="text-xs font-mono text-muted">{wf.executionCount}x</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted">No workflow patterns yet</p>
                                )}
                            </div>

                            {/* Historical Decisions */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Target className="w-4 h-4 text-brown" />
                                    <h3 className="font-display text-lg text-brown italic">Key Decisions</h3>
                                </div>
                                {companyIntelligence.decisions.length > 0 ? (
                                    <div className="space-y-3">
                                        {companyIntelligence.decisions.slice(0, 3).map((decision: any, idx: number) => (
                                            <div key={idx} className="p-3 rounded-lg bg-white/60 border hairline">
                                                <p className="text-sm font-medium text-brown mb-1">{decision.topic}</p>
                                                <p className="text-xs text-muted line-clamp-2">{decision.context}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted">No decisions recorded yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-muted mt-6 text-center font-mono">
                        * All intelligence is extracted from your company's real usage data.
                        The more VEQ is used, the more personalized it becomes.
                    </p>
                </div>
            )}

            {/* 🔥 NEW: Outcome Review Loop (Knowledge → Action → Outcome) */}
            {pendingOutcomes.length > 0 && (
                <div className="rounded-2xl border hairline bg-gradient-to-br from-blue-50/40 to-cream-deep/40 p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <RefreshCcw className="w-5 h-5 text-brown" />
                        <h2 className="font-display text-2xl text-brown italic">Learning Loop: Outcome Reviews</h2>
                    </div>
                    <p className="text-sm text-muted mb-6">
                        VEQ tracks decisions to learn from real-world results. Please review these past decisions and log their actual outcomes to improve future AI recommendations.
                    </p>

                    <div className="space-y-4">
                        {pendingOutcomes.map((item: any) => (
                            <div key={item.id} className="rounded-xl bg-white/80 border hairline p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-display text-lg text-brown italic">{item.topic}</h3>
                                        <p className="text-xs font-mono text-muted mt-1">
                                            Decision made on: {new Date(item.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-mono uppercase tracking-wider">
                                        Awaiting Outcome
                                    </span>
                                </div>

                                <p className="text-sm text-brown mb-4 line-clamp-2">{item.content}</p>

                                {reviewingId === item.id ? (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <textarea
                                            className="w-full p-3 rounded-lg border hairline bg-white text-sm text-brown focus:outline-none focus:border-brown"
                                            rows={2}
                                            placeholder="What was the real-world result? (e.g., 'Cost reduced by 15%, delivery was 2 days faster')"
                                            value={reviewNotes}
                                            onChange={(e) => setReviewNotes(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOutcomeSubmit(item.id, 'positive')}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-semibold"
                                            >
                                                <ThumbsUp className="w-4 h-4" /> Positive Outcome
                                            </button>
                                            <button
                                                onClick={() => handleOutcomeSubmit(item.id, 'neutral')}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold"
                                            >
                                                <Minus className="w-4 h-4" /> Neutral
                                            </button>
                                            <button
                                                onClick={() => handleOutcomeSubmit(item.id, 'negative')}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
                                            >
                                                <ThumbsDown className="w-4 h-4" /> Negative Outcome
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => { setReviewingId(null); setReviewNotes(""); }}
                                            className="text-xs text-muted hover:text-brown underline w-full text-center"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setReviewingId(item.id)}
                                        className="w-full px-4 py-2 bg-brown text-cream-deep rounded-lg hover:bg-brown/90 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                                    >
                                        <RefreshCcw className="w-4 h-4" /> Log Real-World Outcome
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Strategic Insights */}
            <div className="rounded-2xl border hairline bg-gradient-to-br from-brown/5 to-cream-deep/40 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-5 h-5 text-brown" />
                    <h2 className="font-display text-2xl text-brown italic">Strategic Insights</h2>
                </div>
                <div className="space-y-3 text-sm text-brown">
                    {metrics.knowledgeHealth.score < 50 && (
                        <p>• <strong>Knowledge Gap:</strong> Your knowledge health is below 50%. Focus on capturing undocumented workflows from departing employees.</p>
                    )}
                    {metrics.departmentCoverage.coveragePercentage < 70 && (
                        <p>• <strong>Coverage Opportunity:</strong> Only {metrics.departmentCoverage.coveragePercentage}% of employees have initiated handover. Target 100% coverage for complete organizational memory.</p>
                    )}
                    {metrics.teamEngagement.activeUsers < 5 && (
                        <p>• <strong>Engagement:</strong> Only {metrics.teamEngagement.activeUsers} team members are actively using VEQ. Consider training sessions to increase adoption.</p>
                    )}
                    {metrics.knowledgeHealth.score >= 70 && metrics.departmentCoverage.coveragePercentage >= 70 && (
                        <p>• <strong>Excellent Progress:</strong> Your company is building a strong organizational memory. Keep maintaining this momentum!</p>
                    )}
                </div>
            </div>

            <p className="text-xs text-muted text-center mt-8 font-mono">
                All metrics are calculated from real-time data in your company's secure VEQ database.
            </p>
        </section>
    )
}