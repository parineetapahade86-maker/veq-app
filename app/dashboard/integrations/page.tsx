"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { useUser } from "@clerk/nextjs"
import {
    MessageSquare, Mail, Users, CheckCircle2, Loader2,
    Copy, ExternalLink, AlertCircle
} from "lucide-react"
import Link from "next/link"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function IntegrationsPage() {
    const { user } = useUser()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [companyId, setCompanyId] = useState<string | null>(null)

    // Integration States
    const [slackWebhook, setSlackWebhook] = useState("")
    const [isSlackEnabled, setIsSlackEnabled] = useState(false)

    const [uniqueEmail, setUniqueEmail] = useState("")
    const [isEmailEnabled, setIsEmailEnabled] = useState(false)

    useEffect(() => {
        if (user) fetchIntegrations()
    }, [user])

    const fetchIntegrations = async () => {
        try {
            // Get Company ID
            const { data: profile } = await supabase
                .from("user_profiles")
                .select("company_id")
                .eq("clerk_id", user?.id)
                .single()

            if (!profile?.company_id) return
            setCompanyId(profile.company_id)

            // Fetch existing integrations
            const { data } = await supabase
                .from("company_integrations")
                .select("*")
                .eq("company_id", profile.company_id)

            if (data) {
                const slack = data.find(i => i.integration_type === 'slack')
                if (slack) {
                    setIsSlackEnabled(slack.is_enabled)
                    setSlackWebhook(slack.config?.webhook_url || "")
                }

                const email = data.find(i => i.integration_type === 'email')
                if (email) {
                    setIsEmailEnabled(email.is_enabled)
                    setUniqueEmail(email.config?.forwarding_address || `company-${profile.company_id.slice(0, 8)}@veq.inbound.com`)
                } else {
                    setUniqueEmail(`company-${profile.company_id.slice(0, 8)}@veq.inbound.com`)
                }
            }
        } catch (error) {
            console.error("Error fetching integrations:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveSlack = async () => {
        if (!companyId || !slackWebhook) return
        setSaving(true)
        try {
            const { error } = await supabase
                .from("company_integrations")
                .upsert({
                    company_id: companyId,
                    integration_type: 'slack',
                    is_enabled: true,
                    config: { webhook_url: slackWebhook }
                }, { onConflict: 'company_id, integration_type' })

            if (error) throw error
            setIsSlackEnabled(true)
            alert("Slack Webhook saved successfully! VEQ will now send notifications to your channel.")
        } catch (err: any) {
            alert(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleSaveEmail = async () => {
        if (!companyId) return
        setSaving(true)
        try {
            const { error } = await supabase
                .from("company_integrations")
                .upsert({
                    company_id: companyId,
                    integration_type: 'email',
                    is_enabled: true,
                    config: { forwarding_address: uniqueEmail }
                }, { onConflict: 'company_id, integration_type' })

            if (error) throw error
            setIsEmailEnabled(true)
            alert("Email forwarding enabled! Forward any email to this address to save it to your Knowledge Base.")
        } catch (err: any) {
            alert(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-[#C6A15B]" />
            </div>
        )
    }

    return (
        <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
            {/* Header */}
            <div className="mb-12">
                <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#806B58] mb-2">
                    Workspace · Integrations
                </p>
                <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic mb-2">
                    Connect Your Tools
                </h1>
                <p className="text-[#806B58] max-w-xl">
                    Seamlessly integrate VEQ with the tools your team uses every day. Capture knowledge automatically.
                </p>
            </div>

            <div className="space-y-8">

                {/* SLACK INTEGRATION */}
                <div className="bg-white rounded-2xl border border-[#E9DED0] p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="font-display text-2xl text-[#3A2418] italic">Slack</h2>
                                <p className="text-sm text-[#806B58]">Get notified when new knowledge is added.</p>
                            </div>
                        </div>
                        {isSlackEnabled && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-mono font-semibold">
                                <CheckCircle2 className="w-3 h-3" /> Connected
                            </span>
                        )}
                    </div>

                    <div className="bg-[#F4EDE1]/50 p-6 rounded-xl border border-[#E9DED0]">
                        <label className="block text-sm font-mono text-[#806B58] mb-2">
                            Slack Incoming Webhook URL
                        </label>
                        <input
                            type="url"
                            value={slackWebhook}
                            onChange={(e) => setSlackWebhook(e.target.value)}
                            placeholder="Paste your Slack webhook URL here"
                            className="w-full px-4 py-3 rounded-lg border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418] mb-4"
                        />
                        <div className="flex items-center justify-between">
                            <Link
                                href="https://api.slack.com/messaging/webhooks"
                                target="_blank"
                                className="text-xs font-mono text-[#C6A15B] hover:underline flex items-center gap-1"
                            >
                                How to get a Webhook URL? <ExternalLink className="w-3 h-3" />
                            </Link>
                            <button
                                onClick={handleSaveSlack}
                                disabled={saving || !slackWebhook}
                                className="px-6 py-2 bg-[#3A2418] text-[#F4EDE1] rounded-lg hover:bg-[#4A2F20] transition-colors text-sm font-mono font-semibold disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                {isSlackEnabled ? "Update Webhook" : "Connect Slack"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* EMAIL INTEGRATION */}
                <div className="bg-white rounded-2xl border border-[#E9DED0] p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="font-display text-2xl text-[#3A2418] italic">Email Forwarding</h2>
                                <p className="text-sm text-[#806B58]">Forward emails to automatically save them to your Knowledge Base.</p>
                            </div>
                        </div>
                        {isEmailEnabled && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-mono font-semibold">
                                <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                        )}
                    </div>

                    <div className="bg-[#F4EDE1]/50 p-6 rounded-xl border border-[#E9DED0]">
                        <label className="block text-sm font-mono text-[#806B58] mb-2">
                            Your Unique VEQ Email Address
                        </label>
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="text"
                                value={uniqueEmail}
                                readOnly
                                className="flex-1 px-4 py-3 rounded-lg border border-[#E9DED0] bg-[#F4EDE1] text-[#3A2418] font-mono text-sm"
                            />
                            <button
                                onClick={() => navigator.clipboard.writeText(uniqueEmail)}
                                className="p-3 bg-white border border-[#E9DED0] rounded-lg hover:bg-[#C6A15B]/10 transition-colors"
                                title="Copy Email"
                            >
                                <Copy className="w-4 h-4 text-[#806B58]" />
                            </button>
                        </div>
                        <div className="flex items-start gap-2 mb-4 text-xs text-[#806B58]">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>Forward any important email to this address. VEQ's AI will extract the key information and save it to your company's Knowledge Base automatically.</p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveEmail}
                                disabled={saving}
                                className="px-6 py-2 bg-[#3A2418] text-[#F4EDE1] rounded-lg hover:bg-[#4A2F20] transition-colors text-sm font-mono font-semibold disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                {isEmailEnabled ? "Email Forwarding Active" : "Enable Email Forwarding"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* MICROSOFT TEAMS (COMING SOON) */}
                <div className="bg-white rounded-2xl border border-[#E9DED0] p-8 shadow-sm opacity-75">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="font-display text-2xl text-[#3A2418] italic">Microsoft Teams</h2>
                            <p className="text-sm text-[#806B58]">Sync knowledge and get updates directly in Teams.</p>
                        </div>
                    </div>
                    <div className="bg-[#F4EDE1]/50 p-6 rounded-xl border border-[#E9DED0] text-center">
                        <span className="inline-block px-4 py-1 bg-[#C6A15B]/20 text-[#C6A15B] rounded-full text-xs font-mono font-semibold mb-2">
                            Coming Soon
                        </span>
                        <p className="text-sm text-[#806B58]">We are currently building the OAuth integration for Microsoft Teams. Stay tuned!</p>
                    </div>
                </div>

            </div>
        </section>
    )
}