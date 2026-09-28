// app/dashboard/badge/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@supabase/supabase-js"
import { Copy, Check, ShieldCheck, Loader2 } from "lucide-react"
import { triggerVEQConfetti } from "@/lib/confetti"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BadgePage() {
    const { user } = useUser()
    const [companyId, setCompanyId] = useState<string | null>(null)
    const [realScore, setRealScore] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (user) fetchRealScore()
    }, [user])

    const fetchRealScore = async () => {
        setLoading(true)
        try {
            const { data: profile } = await supabase.from("user_profiles").select("company_id").eq("id", user?.id).single()
            if (profile?.company_id) {
                setCompanyId(profile.company_id)

                // Fetch REAL counts
                const [knowledgeResult, meetingResult] = await Promise.all([
                    supabase.from('employee_knowledge').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id),
                    supabase.from('employee_knowledge').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id).eq('source_type', 'meeting')
                ])

                const docCount = knowledgeResult.count ?? 0
                const meetingCount = meetingResult.count ?? 0

                // Calculate REAL Score
                let knowledgeScore = Math.min(docCount * 10, 60)
                let meetingScore = Math.min(meetingCount * 15, 30)
                let activityScore = docCount > 0 || meetingCount > 0 ? 10 : 0
                let score = Math.min(knowledgeScore + meetingScore + activityScore, 100)

                setRealScore(score)
            }
        } catch (err) {
            console.error("Error fetching real score", err)
        } finally {
            setLoading(false)
        }
    }

    const embedCode = `<a href="https://veq.app" target="_blank"><img src="${window.location.origin}/api/badge?companyId=${companyId}" alt="Powered by VEQ" /></a>`

    const handleCopy = async () => {
        await navigator.clipboard.writeText(embedCode)
        setCopied(true)
        triggerVEQConfetti() //  MAGIC!
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-24 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#3A2418] mb-4" />
                <p className="font-mono text-[#806B58]">Calculating your REAL Knowledge Health Score...</p>
            </div>
        )
    }

    return (
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#806B58] mb-4">
                Growth · Viral Badge
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic mb-4">
                Public Knowledge Badge
            </h1>
            <p className="text-[#806B58] max-w-xl mb-12">
                Show the world your company's knowledge health. This badge displays your <strong>REAL-TIME</strong> score calculated from your actual activity.
            </p>

            {/* Live Preview Card */}
            <div className="rounded-2xl border border-[#E9DED0] bg-white/60 p-8 shadow-sm mb-8">
                <h2 className="font-display text-xl text-[#3A2418] italic mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#C6A15B]" /> Live Preview
                </h2>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* The Actual Real SVG Badge */}
                    <div className="p-4 bg-[#F4EDE1] rounded-xl border border-[#E9DED0]">
                        <img
                            src={`/api/badge?companyId=${companyId}`}
                            alt="VEQ Badge"
                            className="h-8"
                        />
                    </div>

                    <div className="text-center md:text-left">
                        <p className="text-sm font-mono text-[#806B58] mb-1">Current Real Score</p>
                        <p className={`text-4xl font-display italic font-bold ${realScore >= 70 ? 'text-[#C6A15B]' : realScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {realScore}%
                        </p>
                        <p className="text-xs text-[#806B58] mt-2">
                            {realScore >= 70 ? "🏆 Excellent! Your knowledge vault is strong." :
                                realScore >= 40 ? "⚠️ Good start. Add more docs to reach Gold." :
                                    "🚨 Critical. Start uploading documents!"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Embed Code Section */}
            <div className="rounded-2xl border border-[#E9DED0] bg-[#3A2418] p-8 text-[#F4EDE1]">
                <h2 className="font-display text-xl italic mb-4">Embed on your Website / LinkedIn</h2>
                <p className="text-sm text-[#E9DED0]/80 mb-6">
                    Copy this HTML code and paste it into your company website's footer or LinkedIn 'About' section.
                </p>

                <div className="relative">
                    <pre className="bg-[#0F0D0B] p-4 rounded-xl overflow-x-auto text-xs font-mono text-[#C6A15B] border border-[#4A2F20]">
                        {embedCode}
                    </pre>
                    <button
                        onClick={handleCopy}
                        className="absolute top-3 right-3 p-2 bg-[#C6A15B] text-[#3A2418] rounded-lg hover:bg-[#D4AF67] transition-all active:scale-95 flex items-center gap-2 font-mono text-xs font-bold"
                    >
                        {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy Code</>}
                    </button>
                </div>
            </div>
        </section>
    )
}