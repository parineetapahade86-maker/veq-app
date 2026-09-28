// app/dashboard/team/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@supabase/supabase-js"
import { Users, Mail, Plus, ShieldCheck, Loader2, CheckCircle, Clock, Trophy, AlertTriangle, TrendingUp, TrendingDown, BookOpen, Calendar } from "lucide-react"
import { triggerVEQConfetti } from "@/lib/confetti"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface TeamMember {
    id: string
    name?: string
    email: string
    role: string
    status: string
    knowledge_score: number
    created_at: string
    // Real score calculation fields
    score: number
    knowledgeCount: number
    meetingCount: number
    taskCount: number
    statusColor: 'green' | 'yellow' | 'red'
    statusLabel: string
}

export default function TeamPage() {
    const { user } = useUser()
    const [members, setMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [sending, setSending] = useState(false)
    const [companyId, setCompanyId] = useState<string | null>(null)

    const [newMember, setNewMember] = useState({ name: "", email: "", role: "member" })

    useEffect(() => {
        if (user) fetchTeamAndScores()
    }, [user])

    const fetchTeamAndScores = async () => {
        setLoading(true)
        try {
            // 1. Get Company ID
            const { data: profile } = await supabase.from("user_profiles").select("company_id").eq("id", user?.id).single()
            if (!profile?.company_id) {
                setLoading(false)
                return
            }
            setCompanyId(profile.company_id)

            // 2. Fetch team members
            const { data: teamData } = await supabase
                .from("team_members")
                .select("*")
                .eq("company_id", profile.company_id)
                .order("created_at", { ascending: false })

            if (!teamData || teamData.length === 0) {
                setMembers([])
                setLoading(false)
                return
            }

            // 3. Calculate Real Scores for each member (The Magic Formula!)
            const enrichedMembers = await Promise.all(
                teamData.map(async (member: any) => {
                    // Try to find linked user profile by email to get accurate activity counts
                    const { data: userProfile } = await supabase
                        .from("user_profiles")
                        .select("id")
                        .eq("email", member.email)
                        .eq("company_id", profile.company_id)
                        .single()

                    const userId = userProfile?.id || member.id

                    const [knowledgeResult, taskResult, meetingResult] = await Promise.all([
                        supabase.from("employee_knowledge").select("*", { count: "exact", head: true }).eq("company_id", profile.company_id).eq("employee_id", userId),
                        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("assigned_to", userId),
                        supabase.from("employee_knowledge").select("*", { count: "exact", head: true }).eq("company_id", profile.company_id).eq("employee_id", userId).eq("source_type", "meeting")
                    ])

                    const knowledgeCount = knowledgeResult.count ?? 0
                    const meetingCount = meetingResult.count ?? 0
                    const taskCount = taskResult.count ?? 0

                    // 🧠 SCORE FORMULA: Knowledge (max 60) + Meetings (max 30) + Base Activity (10)
                    let knowledgeScore = Math.min(knowledgeCount * 10, 60)
                    let meetingScore = Math.min(meetingCount * 15, 30)
                    let activityScore = 10
                    let score = Math.min(knowledgeScore + meetingScore + activityScore, 100)

                    let statusColor: 'green' | 'yellow' | 'red' = 'red'
                    let statusLabel = 'Knowledge Gap'

                    if (score >= 70) {
                        statusColor = 'green'
                        statusLabel = 'Fully Synced'
                    } else if (score >= 40) {
                        statusColor = 'yellow'
                        statusLabel = 'Needs Attention'
                    }

                    return {
                        ...member,
                        score,
                        knowledgeCount,
                        meetingCount,
                        taskCount,
                        statusColor,
                        statusLabel
                    }
                })
            )

            setMembers(enrichedMembers)
        } catch (err) {
            console.error("Failed to fetch team", err)
        } finally {
            setLoading(false)
        }
    }

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)
        try {
            const res = await fetch("/api/team/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMember),
            })
            const data = await res.json()
            if (res.ok && data.success) {
                setNewMember({ name: "", email: "", role: "member" })
                setIsInviteOpen(false)
                triggerVEQConfetti() // 🎉 MAGIC!
                fetchTeamAndScores() // Refresh list
            } else {
                alert(data.error || "Failed to send invite")
            }
        } catch (err) {
            alert("Network error")
        } finally {
            setSending(false)
        }
    }

    // Calculate aggregate stats
    const totalScore = members.reduce((acc, m) => acc + (m.score || 0), 0)
    const overallScore = members.length > 0 ? Math.round(totalScore / members.length) : 0
    const fullySynced = members.filter(m => m.statusColor === 'green').length
    const needsAttention = members.filter(m => m.statusColor === 'yellow').length
    const knowledgeGap = members.filter(m => m.statusColor === 'red').length
    const pendingInvites = members.filter(m => m.status === 'pending').length

    if (!companyId && !loading) {
        return (
            <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 text-center">
                <h3 className="font-display text-2xl text-[#3A2418] italic mb-2">No Company Found</h3>
                <p className="text-[#806B58]">Please create your company profile first.</p>
            </section>
        )
    }

    return (
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#806B58] mb-4">
                Workspace · Team Control Room
            </p>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic mb-2">
                        Team Knowledge Health
                    </h1>
                    <p className="text-[#806B58] max-w-xl">
                        A real-time overview of your team's knowledge contribution and collaboration.
                    </p>
                </div>
                <button
                    onClick={() => setIsInviteOpen(true)}
                    className="px-6 py-3 bg-[#3A2418] text-[#F4EDE1] rounded-2xl hover:bg-[#4A2F20] transition-all active:scale-95 duration-200 flex items-center justify-center gap-2 font-mono text-sm font-semibold shadow-lg"
                >
                    <Plus className="w-4 h-4" /> Invite Member
                </button>
            </div>

            {/* Top Stats Cards (Real Data) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/60 p-6 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-all duration-300">
                    <Trophy className="w-8 h-8 text-[#3A2418] mb-2" />
                    <p className="font-display text-5xl text-[#3A2418] italic">{overallScore}</p>
                    <p className="text-xs text-[#806B58] mt-2 font-mono uppercase tracking-wider">Overall Score</p>
                </div>
                <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/60 p-6 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-all duration-300">
                    <ShieldCheck className="w-8 h-8 text-green-600 mb-2" />
                    <p className="font-display text-5xl text-green-700 italic">{fullySynced}</p>
                    <p className="text-xs text-[#806B58] mt-2 font-mono uppercase tracking-wider">Fully Synced</p>
                </div>
                <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/60 p-6 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-all duration-300">
                    <AlertTriangle className="w-8 h-8 text-yellow-600 mb-2" />
                    <p className="font-display text-5xl text-yellow-700 italic">{needsAttention}</p>
                    <p className="text-xs text-[#806B58] mt-2 font-mono uppercase tracking-wider">Needs Attention</p>
                </div>
                <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/60 p-6 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-all duration-300">
                    <Users className="w-8 h-8 text-red-600 mb-2" />
                    <p className="font-display text-5xl text-red-700 italic">{knowledgeGap}</p>
                    <p className="text-xs text-[#806B58] mt-2 font-mono uppercase tracking-wider">Knowledge Gap</p>
                </div>
            </div>

            {/* Invite Form Modal */}
            {isInviteOpen && (
                <div className="fixed inset-0 bg-[#3A2418]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#F4EDE1] rounded-2xl border border-[#E9DED0] p-8 max-w-md w-full shadow-2xl">
                        <h2 className="font-display text-2xl text-[#3A2418] italic mb-6">Invite to VEQ</h2>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-[#806B58] mb-2">FULL NAME *</label>
                                <input required type="text" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418]" placeholder="e.g. Priya Sharma" />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-[#806B58] mb-2">WORK EMAIL *</label>
                                <input required type="email" value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418]" placeholder="priya@company.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-[#806B58] mb-2">ROLE</label>
                                <select value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418]">
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsInviteOpen(false)} className="flex-1 px-4 py-3 text-sm font-mono text-[#806B58] hover:text-[#3A2418]">Cancel</button>
                                <button type="submit" disabled={sending} className="flex-1 px-4 py-3 bg-[#C6A15B] text-white rounded-xl hover:bg-[#b08d4b] disabled:opacity-50 flex items-center justify-center gap-2 font-mono text-sm font-semibold active:scale-95 transition-all duration-200">
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} {sending ? "Sending..." : "Send Invite"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Employee Breakdown List */}
            <div className="rounded-2xl border border-[#E9DED0] bg-white/60 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl text-[#3A2418] italic">
                        Employee Breakdown ({members.length})
                    </h2>
                    <span className="text-xs font-mono text-[#806B58] bg-[#C6A15B]/20 px-3 py-1 rounded-full">
                        {pendingInvites} Pending Invites
                    </span>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-[#806B58]">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Calculating team knowledge scores...
                        </div>
                    ) : members.length === 0 ? (
                        <div className="rounded-2xl border-2 border-dashed border-[#E9DED0] p-12 text-center">
                            <Users className="w-12 h-12 text-[#806B58] mx-auto mb-4" />
                            <p className="text-[#3A2418] font-display text-xl italic mb-2">Your team is empty.</p>
                            <p className="text-sm text-[#806B58]">Invite your first member to start building the network!</p>
                        </div>
                    ) : (
                        members.map((member) => (
                            <div
                                key={member.id}
                                className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/40 hover:bg-[#F4EDE1]/80 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 mb-3 md:mb-0 flex-1">
                                    <div className="w-12 h-12 rounded-full bg-[#3A2418] text-[#F4EDE1] flex items-center justify-center font-display text-xl italic shrink-0">
                                        {member.name ? member.name.charAt(0).toUpperCase() : (member.email ? member.email.charAt(0).toUpperCase() : "?")}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#3A2418] text-lg">{member.name || member.email || "Unknown User"}</h3>
                                        <p className="text-xs text-[#806B58] capitalize font-mono">{member.role || "Member"}</p>
                                        <div className="flex gap-4 mt-2 text-xs font-mono text-[#806B58]">
                                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {member.knowledgeCount} Docs</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {member.meetingCount} Meetings</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        {member.score >= 70 ? (
                                            <TrendingUp className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <TrendingDown className="w-5 h-5 text-yellow-600" />
                                        )}
                                        <span className="font-mono text-xl text-[#3A2418] font-bold">{member.score}/100</span>
                                    </div>

                                    <span
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1 ${member.statusColor === "green"
                                            ? "bg-green-100 text-green-800 border-green-200"
                                            : member.statusColor === "yellow"
                                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                : "bg-red-100 text-red-800 border-red-200"
                                            }`}
                                    >
                                        {member.status === 'pending' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                        {member.status === 'pending' ? 'Pending Invite' : member.statusLabel}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}