"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { FileText, Video, CheckSquare, Users, Calendar, ArrowRight, Activity } from "lucide-react"

export default function OverviewPage() {
    // Get real user data from Clerk
    const { user } = useUser()
    const name = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "there"

    // Real state. Starts at 0. No fake numbers!
    const [stats, setStats] = useState({
        documents: 0,
        videos: 0,
        employees: 0,
        meetings: 0
    })

    const [recentActivity, setRecentActivity] = useState<any[]>([])

    useEffect(() => {
        // THIS IS WHERE WE FETCH REAL DATA
        // For now, we check LocalStorage to see if you have added anything.
        // In the next step, we will connect this to Supabase for permanent storage.

        try {
            const savedEmployees = JSON.parse(localStorage.getItem('veq_employees') || '[]')
            const savedMeetings = JSON.parse(localStorage.getItem('veq_meetings') || '[]')
            const savedDocs = JSON.parse(localStorage.getItem('veq_documents') || '[]')

            setStats({
                documents: savedDocs.length,
                videos: 0, // Videos page needs localStorage update
                employees: savedEmployees.length,
                meetings: savedMeetings.length
            })

            // Create a real activity feed based on what you actually added
            const activity = []
            if (savedEmployees.length > 0) activity.push({ type: 'Employee', text: `Added new team member: ${savedEmployees[savedEmployees.length - 1].name}`, time: 'Just now' })
            if (savedMeetings.length > 0) activity.push({ type: 'Meeting', text: `Scheduled meeting: ${savedMeetings[savedMeetings.length - 1].title}`, time: 'Just now' })

            setRecentActivity(activity)
        } catch (error) {
            console.error("Error loading dashboard data", error)
        }
    }, [])

    return (
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            {/* Header */}
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                Workspace · Overview
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                Welcome, {name}.
            </h1>
            <p className="text-muted max-w-xl mb-12">
                Here's what's happening in your workspace today.
            </p>

            {/* Stats Grid - REAL NUMBERS */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="rounded-2xl border hairline bg-cream-deep/40 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <FileText className="w-5 h-5 text-brown" />
                        <p className="text-xs text-muted">Documents</p>
                    </div>
                    <p className="font-display text-3xl text-brown italic">{stats.documents}</p>
                </div>

                <div className="rounded-2xl border hairline bg-cream-deep/40 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Video className="w-5 h-5 text-brown" />
                        <p className="text-xs text-muted">Videos</p>
                    </div>
                    <p className="font-display text-3xl text-brown italic">{stats.videos}</p>
                </div>

                <div className="rounded-2xl border hairline bg-cream-deep/40 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Users className="w-5 h-5 text-brown" />
                        <p className="text-xs text-muted">Team Members</p>
                    </div>
                    <p className="font-display text-3xl text-brown italic">{stats.employees}</p>
                </div>

                <div className="rounded-2xl border hairline bg-cream-deep/40 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-5 h-5 text-brown" />
                        <p className="text-xs text-muted">Meetings</p>
                    </div>
                    <p className="font-display text-3xl text-brown italic">{stats.meetings}</p>
                </div>
            </div>

            {/* Recent Activity - REAL DATA */}
            <div className="rounded-2xl border hairline bg-cream-deep/40 p-8">
                <h2 className="font-display text-2xl text-brown italic mb-6">Recent Activity</h2>

                {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                        {recentActivity.map((item, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 bg-white/50 rounded-lg">
                                <div className="w-2 h-2 bg-brown rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="font-semibold text-brown">{item.text}</p>
                                    <p className="text-xs text-muted mt-1 font-mono">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Honest Empty State */
                    <div className="text-center py-8">
                        <Activity className="w-10 h-10 text-muted mx-auto mb-3" />
                        <p className="text-brown font-display text-lg italic mb-2">No activity yet.</p>
                        <p className="text-sm text-muted">
                            Add your first employee or schedule a meeting to see updates here.
                        </p>
                    </div>
                )}
            </div>
        </section>
    )
}