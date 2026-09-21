"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@supabase/supabase-js"
import {
    Trophy, Shield, AlertTriangle, Users, TrendingUp,
    BookOpen, Calendar, CheckCircle2, Loader2, Brain, ShieldAlert
} from "lucide-react"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface EmployeeStats {
    id: string
    name: string
    email: string
    role: string
    knowledgeItems: number
    meetingsLogged: number
    lastActive: string
    healthScore: number
}

interface RiskItem {
    topic: string
    employeeEmail: string
    riskLevel: "HIGH" | "MEDIUM"
}

export default function TeamControlPage() {
    const { user } = useUser()
    const [loading, setLoading] = useState(true)
    const [companyId, setCompanyId] = useState<string>("")
    const [teamStats, setTeamStats] = useState<EmployeeStats[]>([])
    const [riskRadar, setRiskRadar] = useState<RiskItem[]>([]) // 🧠 NEW STATE
    const [overallMetrics, setOverallMetrics] = useState({
        totalKnowledge: 0,
        totalMeetings: 0,
        activeMembers: 0,
        avgHealthScore: 0,
        knowledgeGaps: 0,
        highRisks: 0 // 🧠 NEW
    })

    useEffect(() => {
        if (user) {
            fetchTeamData()
        }
    }, [user])

    const fetchTeamData = async () => {
        setLoading(true)
        try {
            // 1. Get company_id
            const { data: profile, error: profileError } = await supabase
                .from("user_profiles")
                .select("company_id")
                .eq("id", user?.id)
                .single()

            if (profileError) console.error("Profile Error:", profileError)
            console.log("🔍 Current User ID:", user?.id)
            console.log(" Company ID:", profile?.company_id)

            if (profile?.company_id) {
                setCompanyId(profile.company_id)

                // 2. Fetch all employees in this company
                const { data: employees, error: empError } = await supabase
                    .from("user_profiles")
                    .select("id, email, role, created_at, company_id")
                    .eq("company_id", profile.company_id)

                if (empError) console.error("Employees Error:", empError)
                console.log("👥 Employees Found:", employees?.length)

                if (employees) {
                    // 🧠 FETCH ALL KNOWLEDGE ITEMS & ENTITIES FOR RISK RADAR
                    const { data: knowledgeItems } = await supabase
                        .from("employee_knowledge")
                        .select("id, employee_id, source_reference")
                        .eq("company_id", profile.company_id)

                    const { data: entities } = await supabase
                        .from("knowledge_entities")
                        .select("entity_value, knowledge_id")
                        .eq("entity_type", "topic")
                        .in("knowledge_id", knowledgeItems?.map(k => k.id) || [])

                    // 🧠 RISK RADAR LOGIC
                    const topicMap: Record<string, Set<string>> = {}
                    const employeeMap: Record<string, string> = {}

                    // Map employee IDs to emails
                    employees.forEach(emp => {
                        employeeMap[emp.id] = emp.email || "Unknown"
                    })

                    // Map Topics to Employees
                    entities?.forEach(entity => {
                        const topic = entity.entity_value.toLowerCase()
                        const knowledgeItem = knowledgeItems?.find(k => k.id === entity.knowledge_id)

                        if (knowledgeItem && employeeMap[knowledgeItem.employee_id]) {
                            if (!topicMap[topic]) topicMap[topic] = new Set()
                            topicMap[topic].add(knowledgeItem.employee_id)
                        }
                    })

                    // Find Risks (Topics known by only 1 person)
                    const risks: RiskItem[] = []
                    Object.entries(topicMap).forEach(([topic, employeesSet]) => {
                        if (employeesSet.size === 1) {
                            const empId = Array.from(employeesSet)[0]
                            risks.push({
                                topic: topic.charAt(0).toUpperCase() + topic.slice(1),
                                employeeEmail: employeeMap[empId],
                                riskLevel: "HIGH"
                            })
                        } else if (employeesSet.size === 2) {
                            risks.push({
                                topic: topic.charAt(0).toUpperCase() + topic.slice(1),
                                employeeEmail: `${employeesSet.size} employees`,
                                riskLevel: "MEDIUM"
                            })
                        }
                    })

                    setRiskRadar(risks)

                    // 3. Knowledge items count per employee
                    const statsPromises = employees.map(async (emp) => {
                        const { count: knowledgeCount, error: kError } = await supabase
                            .from("employee_knowledge")
                            .select("*", { count: "exact", head: true })
                            .eq("company_id", profile.company_id)
                            .eq("employee_id", emp.id)

                        if (kError) console.error("Knowledge Count Error:", kError)

                        console.log(`📄 Knowledge Count for ${emp.email}:`, knowledgeCount)

                        // 4. Meetings count
                        const { count: meetingsCount } = await supabase
                            .from("employee_knowledge")
                            .select("*", { count: "exact", head: true })
                            .eq("company_id", profile.company_id)
                            .eq("employee_id", emp.id)
                            .eq("source_type", "meeting")

                        // Calculate health score
                        const knowledgeScore = Math.min((knowledgeCount || 0) * 10, 60)
                        const meetingScore = Math.min((meetingsCount || 0) * 15, 30)
                        const activityScore = 10
                        const healthScore = knowledgeScore + meetingScore + activityScore

                        return {
                            id: emp.id,
                            name: emp.email?.split("@")[0] || "User",
                            email: emp.email || "",
                            role: emp.role || "Member",
                            knowledgeItems: knowledgeCount || 0,
                            meetingsLogged: meetingsCount || 0,
                            lastActive: emp.created_at,
                            healthScore: Math.min(healthScore, 100)
                        } as EmployeeStats
                    })

                    const stats = await Promise.all(statsPromises)
                    console.log("📊 Final Team Stats:", stats)

                    setTeamStats(stats)

                    const totalKnowledge = stats.reduce((sum, s) => sum + s.knowledgeItems, 0)
                    const totalMeetings = stats.reduce((sum, s) => sum + s.meetingsLogged, 0)
                    const avgHealthScore = Math.round(stats.reduce((sum, s) => sum + s.healthScore, 0) / stats.length) || 0
                    const knowledgeGaps = stats.filter(s => s.healthScore < 50).length
                    const highRisks = risks.filter(r => r.riskLevel === "HIGH").length

                    setOverallMetrics({
                        totalKnowledge,
                        totalMeetings,
                        activeMembers: stats.length,
                        avgHealthScore,
                        knowledgeGaps,
                        highRisks
                    })
                }
            }
        } catch (err) {
            console.error("Failed to fetch team data:", err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex items-center justify-center min-h-[60vh]">
                <div className="flex items-center gap-3 text-[#806B58]">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="font-mono text-sm">Loading team analytics...</span>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#806B58] mb-4">
                Workspace · Control Room
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic mb-4">
                Team Knowledge Health
            </h1>
            <p className="text-[#806B58] max-w-xl mb-12">
                A real-time overview of your team's knowledge contribution and collaboration.
            </p>

            {/* Overall Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className={`rounded-2xl border p-6 text-center ${overallMetrics.avgHealthScore >= 70 ? "border-green-200 bg-green-50" :
                    overallMetrics.avgHealthScore >= 40 ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50"
                    }`}>
                    <Trophy className="w-8 h-8 mx-auto mb-3 text-[#3A2418]" />
                    <p className="font-display text-4xl text-[#3A2418] italic mb-1">
                        {overallMetrics.avgHealthScore}
                    </p>
                    <p className="text-xs font-mono text-[#806B58] uppercase">Overall Score</p>
                </div>

                <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6 text-center">
                    <BookOpen className="w-8 h-8 mx-auto mb-3 text-[#3A2418]" />
                    <p className="font-display text-4xl text-[#3A2418] italic mb-1">
                        {overallMetrics.totalKnowledge}
                    </p>
                    <p className="text-xs font-mono text-[#806B58] uppercase">Knowledge Items</p>
                </div>

                <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6 text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-3 text-[#3A2418]" />
                    <p className="font-display text-4xl text-[#3A2418] italic mb-1">
                        {overallMetrics.totalMeetings}
                    </p>
                    <p className="text-xs font-mono text-[#806B58] uppercase">Meetings Logged</p>
                </div>

                <div className={`rounded-2xl border p-6 text-center ${overallMetrics.highRisks > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
                    }`}>
                    <ShieldAlert className={`w-8 h-8 mx-auto mb-3 ${overallMetrics.highRisks > 0 ? "text-red-600" : "text-green-600"}`} />
                    <p className={`font-display text-4xl italic mb-1 ${overallMetrics.highRisks > 0 ? "text-red-600" : "text-green-600"}`}>
                        {overallMetrics.highRisks}
                    </p>
                    <p className="text-xs font-mono text-[#806B58] uppercase">Critical Risks</p>
                </div>
            </div>

            {/* 🧠 KNOWLEDGE RISK RADAR SECTION */}
            {riskRadar.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Brain className="w-6 h-6 text-[#C6A15B]" />
                        <h2 className="font-display text-2xl text-[#3A2418] italic">Knowledge Risk Radar</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {riskRadar.map((risk, idx) => (
                            <div
                                key={idx}
                                className={`rounded-xl border p-4 flex flex-col gap-2 ${risk.riskLevel === "HIGH"
                                        ? "border-red-200 bg-red-50/50"
                                        : "border-yellow-200 bg-yellow-50/50"
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${risk.riskLevel === "HIGH" ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800"
                                        }`}>
                                        {risk.riskLevel} RISK
                                    </span>
                                    <AlertTriangle className={`w-4 h-4 ${risk.riskLevel === "HIGH" ? "text-red-600" : "text-yellow-600"}`} />
                                </div>

                                <h3 className="font-display text-lg text-[#3A2418] italic leading-tight">
                                    "{risk.topic}"
                                </h3>

                                <p className="text-xs text-[#806B58] font-mono mt-auto">
                                    Known only by: <span className="font-semibold text-[#3A2418]">{risk.employeeEmail}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Team Members Breakdown */}
            <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl text-[#3A2418] italic flex items-center gap-3">
                        <Users className="w-6 h-6 text-[#806B58]" />
                        Employee Breakdown ({teamStats.length})
                    </h2>
                    <button
                        onClick={fetchTeamData}
                        className="px-4 py-2 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-colors flex items-center gap-2 font-mono text-sm"
                    >
                        <TrendingUp className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                <div className="space-y-4">
                    {teamStats.map((employee) => (
                        <div
                            key={employee.id}
                            className="rounded-xl border border-[#E9DED0] bg-white/60 p-6 hover:border-[#C6A15B]/50 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-full bg-[#3A2418] text-[#F4EDE1] flex items-center justify-center font-semibold text-lg">
                                        {employee.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-display text-lg text-[#3A2418] italic">
                                            {employee.name}
                                        </h3>
                                        <p className="text-sm text-[#806B58]">{employee.email}</p>
                                        <p className="text-xs font-mono text-[#806B58] mt-1">{employee.role}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="font-display text-2xl text-[#3A2418] italic">
                                            {employee.knowledgeItems}
                                        </p>
                                        <p className="text-[10px] font-mono text-[#806B58] uppercase">Documents</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-display text-2xl text-[#3A2418] italic">
                                            {employee.meetingsLogged}
                                        </p>
                                        <p className="text-[10px] font-mono text-[#806B58] uppercase">Meetings</p>
                                    </div>

                                    <div className="text-right">
                                        <div className={`px-4 py-2 rounded-xl font-mono text-sm font-semibold ${employee.healthScore >= 70 ? "bg-green-100 text-green-800" :
                                            employee.healthScore >= 40 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                                            }`}>
                                            {employee.healthScore}/100
                                        </div>
                                        {employee.healthScore < 50 && (
                                            <span className="text-xs text-red-600 font-mono mt-1 flex items-center justify-end gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Knowledge Gap
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="w-full bg-[#E9DED0] rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${employee.healthScore >= 70 ? "bg-green-500" :
                                            employee.healthScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                                            }`}
                                        style={{ width: `${employee.healthScore}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}