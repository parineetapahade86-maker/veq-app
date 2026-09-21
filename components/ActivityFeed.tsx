"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useUser } from "@clerk/nextjs"
import { Activity, FileText, MessageSquare, CheckCircle2, Loader2 } from "lucide-react"

export default function ActivityFeed() {
    const { user } = useUser()
    const supabase = createClient()
    const [activities, setActivities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) fetchActivities()
    }, [user])

    const fetchActivities = async () => {
        try {
            const { data: profile } = await supabase
                .from("user_profiles")
                .select("company_id")
                .eq("clerk_id", user?.id)
                .single()

            if (!profile?.company_id) return

            const { data } = await supabase
                .from("activity_logs")
                .select("*")
                .eq("company_id", profile.company_id)
                .order("created_at", { ascending: false })
                .limit(10)

            if (data) setActivities(data)
        } catch (error) {
            console.error("Error fetching activities:", error)
        } finally {
            setLoading(false)
        }
    }

    const getIcon = (action: string) => {
        if (action.includes("comment")) return <MessageSquare className="w-4 h-4 text-blue-600" />
        if (action.includes("task")) return <CheckCircle2 className="w-4 h-4 text-green-600" />
        return <FileText className="w-4 h-4 text-[#C6A15B]" />
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="w-5 h-5 animate-spin text-[#C6A15B]" /></div>

    return (
        <div className="rounded-2xl border border-[#E9DED0] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-[#C6A15B]" />
                <h3 className="font-display text-xl text-[#3A2418] italic">Recent Activity</h3>
            </div>

            {activities.length === 0 ? (
                <p className="text-sm text-[#806B58] text-center py-4">No recent activity. Start collaborating!</p>
            ) : (
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F4EDE1]/50 transition-colors">
                            <div className="mt-1 p-2 bg-[#F4EDE1] rounded-lg shrink-0">
                                {getIcon(activity.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#3A2418]">
                                    <span className="font-semibold">{activity.user_name}</span> {activity.action}
                                    {activity.target_title && <span className="italic text-[#806B58]"> "{activity.target_title}"</span>}
                                </p>
                                <p className="text-xs text-[#806B58] font-mono mt-1">{formatTime(activity.created_at)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}