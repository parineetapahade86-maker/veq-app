"use client"

import { useState, useEffect } from "react"
import { Activity, AlertTriangle, CheckCircle, Brain, Users, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface DepartmentScore {
    name: string
    score: number
    status: 'healthy' | 'warning' | 'critical'
}

interface AlertItem {
    name: string
    department: string
    reason: string
}

export default function BrainHealthPage() {
    const [overallScore, setOverallScore] = useState(0)
    const [departments, setDepartments] = useState<DepartmentScore[]>([])
    const [alerts, setAlerts] = useState<AlertItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const calculateHealth = async () => {
            // 1. Fetch all necessary data from Supabase
            const { data: employees } = await supabase.from('employees').select('*')
            const { data: brainMaps } = await supabase.from('brain_maps').select('employee_name')
            const { data: microTasks } = await supabase.from('micro_tasks').select('status, employee_name')

            if (!employees || employees.length === 0) {
                setIsLoading(false)
                return
            }

            // 2. Calculate Overall Score (Simple MVP Formula)
            const totalEmployees = employees.length
            const initiatedHandovers = employees.filter(e => e.is_handover_initiated).length
            const lockedVaults = employees.filter(e => e.is_locked).length

            const totalTasks = microTasks?.length || 0
            const completedTasks = microTasks?.filter(t => t.status === 'completed').length || 0

            // Formula: 40% Handover Initiation + 40% Task Completion + 20% Vault Locking
            const initiationScore = (initiatedHandovers / totalEmployees) * 40
            const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 40 : 0
            const lockScore = (lockedVaults / totalEmployees) * 20

            const finalScore = Math.round(initiationScore + taskScore + lockScore)
            setOverallScore(finalScore)

            // 3. Calculate Department-wise Scores
            const deptMap: Record<string, { total: number, score: number }> = {}

            employees.forEach(emp => {
                const dept = emp.department || 'Unassigned'
                if (!deptMap[dept]) deptMap[dept] = { total: 0, score: 0 }
                deptMap[dept].total += 1

                // Add points if they have a brain map or completed tasks
                const hasBrainMap = brainMaps?.some(b => b.employee_name === emp.name)
                const empCompletedTasks = microTasks?.filter(t => t.employee_name === emp.name && t.status === 'completed').length || 0

                if (hasBrainMap) deptMap[dept].score += 50
                if (empCompletedTasks > 0) deptMap[dept].score += 50
            })

            const deptScores: DepartmentScore[] = Object.entries(deptMap).map(([name, data]) => {
                const avgScore = Math.min(100, Math.round(data.score / data.total))
                let status: 'healthy' | 'warning' | 'critical' = 'healthy'
                if (avgScore < 50) status = 'critical'
                else if (avgScore < 80) status = 'warning'

                return { name, score: avgScore, status }
            })
            setDepartments(deptScores)

            // 4. Generate Red Alerts (Employees leaving but no Brain Map)
            const redAlerts: AlertItem[] = []
            employees.forEach(emp => {
                if (emp.is_handover_initiated && !emp.is_locked) {
                    const hasBrainMap = brainMaps?.some(b => b.employee_name === emp.name)
                    const pendingTasks = microTasks?.filter(t => t.employee_name === emp.name && t.status === 'pending').length || 0

                    if (!hasBrainMap || pendingTasks > 1) {
                        redAlerts.push({
                            name: emp.name,
                            department: emp.department || 'Unknown',
                            reason: hasBrainMap ? `${pendingTasks} pending micro-tasks` : 'Brain Map not generated yet'
                        })
                    }
                }
            })
            setAlerts(redAlerts)
            setIsLoading(false)
        }

        calculateHealth()
    }, [])

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 50) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            {/* 🏆 HEADER */}
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                Intelligence · CEO Dashboard
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                Company Brain Health
            </h1>
            <p className="text-muted max-w-xl mb-12">
                Real-time visibility into your organization's institutional memory.
                Identify knowledge gaps before they become critical risks.
            </p>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-brown animate-spin mb-4" />
                    <p className="text-muted font-mono text-sm">Analyzing company intelligence...</p>
                </div>
            ) : (
                <div className="space-y-10">

                    {/* 1. OVERALL SCORE */}
                    <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="font-mono text-xs tracking-widest uppercase text-muted mb-2">Overall Continuity Score</h2>
                            <p className="text-brown font-display text-2xl italic">How safe is your company's knowledge?</p>
                        </div>
                        <div className={`text-7xl font-display font-bold ${getScoreColor(overallScore)}`}>
                            {overallScore}%
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* 2. DEPARTMENT BREAKDOWN */}
                        <div className="rounded-2xl border hairline bg-cream-deep/40 p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <Activity className="w-5 h-5 text-brown" />
                                <h3 className="font-display text-xl text-brown italic">Department Health</h3>
                            </div>

                            {departments.length === 0 ? (
                                <p className="text-sm text-muted">No department data available yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {departments.map((dept, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-mono text-sm text-brown">{dept.name}</span>
                                                <span className={`font-mono text-sm font-bold ${getScoreColor(dept.score)}`}>
                                                    {dept.score}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-white/50 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${dept.score >= 80 ? 'bg-green-500' : dept.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${dept.score}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 3. RED ALERTS (CRITICAL RISKS) */}
                        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <h3 className="font-display text-xl text-red-800 italic">Critical Knowledge Risks</h3>
                            </div>

                            {alerts.length === 0 ? (
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="w-4 h-4" />
                                    <p className="text-sm font-mono">No critical risks detected. Great job!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {alerts.map((alert, idx) => (
                                        <div key={idx} className="bg-white/60 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-display text-brown italic">{alert.name} <span className="text-xs font-mono text-muted">({alert.department})</span></p>
                                                <p className="text-xs text-red-700 mt-1">⚠️ {alert.reason}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </section>
    )
}