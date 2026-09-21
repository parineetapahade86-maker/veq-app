"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Mail, Loader2, Send, Sparkles, CheckCircle2 } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HREmailComposerPage() {
    const { user } = useUser()
    const [loading, setLoading] = useState(false)
    const [aiWriting, setAiWriting] = useState(false)
    const [sent, setSent] = useState(false)

    const [formData, setFormData] = useState({
        fromEmail: "",           // ✅ NEW: Sender's email
        recipientEmail: "",
        employeeName: "",
        simpleMessage: "",
        subject: "",
        professionalEmail: ""
    })

    const handleAIWrite = async () => {
        if (!formData.simpleMessage.trim()) {
            alert("Please enter what you want to say in simple words")
            return
        }

        setAiWriting(true)
        try {
            const response = await fetch('/api/ai-write-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: formData.simpleMessage,
                    employeeName: formData.employeeName
                })
            })

            const data = await response.json()

            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    subject: data.subject,
                    professionalEmail: data.content
                }))
            } else {
                alert("Failed to generate email")
            }
        } catch (err) {
            console.error(err)
            alert("Failed to generate email")
        } finally {
            setAiWriting(false)
        }
    }

    const handleSendEmail = async () => {
        // ✅ UPDATED: Check for fromEmail as well
        if (!formData.fromEmail || !formData.recipientEmail || !formData.professionalEmail) {
            alert("Please fill in your email, recipient email, and generate/write email content")
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: formData.fromEmail,          // ✅ NEW: Send sender's email to backend
                    to: formData.recipientEmail,
                    subject: formData.subject,
                    content: formData.professionalEmail,
                    employeeName: formData.employeeName
                })
            })

            const data = await response.json()

            if (data.success) {
                setSent(true)
                setTimeout(() => setSent(false), 3000)
                // Reset form
                setFormData({
                    fromEmail: "",                     // ✅ NEW: Reset sender email
                    recipientEmail: "",
                    employeeName: "",
                    simpleMessage: "",
                    subject: "",
                    professionalEmail: ""
                })
            } else {
                alert("Failed to send email")
            }
        } catch (err) {
            console.error(err)
            alert("Failed to send email")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                HR Operations · Email Composer
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                Compose Offboarding Email
            </h1>
            <p className="text-muted max-w-xl mb-12">
                Write in simple words, AI will craft a professional email. Then send it automatically from your company domain.
            </p>

            <div className="space-y-8">

                {/* ✅ NEW: SENDER EMAIL FIELD */}
                <div>
                    <label className="block text-sm font-mono text-[#806B58] mb-2">
                        Your Email (Sender) *
                    </label>
                    <input
                        type="email"
                        required
                        value={formData.fromEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, fromEmail: e.target.value }))}
                        placeholder="hr@yourcompany.com"
                        className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] text-[#3A2418]"
                    />
                    <p className="text-xs text-[#806B58] mt-1">
                        This will be the "From" address. Replies will come directly to this email.
                    </p>
                </div>

                {/* RECIPIENT & EMPLOYEE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-mono text-[#806B58] mb-2">
                            Recipient Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.recipientEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                            placeholder="employee@company.com"
                            className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] text-[#3A2418]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-mono text-[#806B58] mb-2">
                            Employee Name
                        </label>
                        <input
                            type="text"
                            value={formData.employeeName}
                            onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                            placeholder="e.g., Rohan Sharma"
                            className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] text-[#3A2418]"
                        />
                    </div>
                </div>

                {/* SIMPLE MESSAGE INPUT */}
                <div>
                    <label className="block text-sm font-mono text-[#806B58] mb-2">
                        What do you want to say? (Write in simple words)
                    </label>
                    <textarea
                        rows={4}
                        value={formData.simpleMessage}
                        onChange={(e) => setFormData(prev => ({ ...prev, simpleMessage: e.target.value }))}
                        placeholder="e.g., Please complete your exit brain dump by Friday. Record a 5-minute voice note about your work, processes, and pending tasks."
                        className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] text-[#3A2418] resize-none"
                    />
                    <button
                        onClick={handleAIWrite}
                        disabled={aiWriting || !formData.simpleMessage.trim()}
                        className="mt-3 px-6 py-2 bg-[#C6A15B] text-white rounded-xl hover:bg-[#D4B06A] transition-colors flex items-center gap-2 font-mono text-sm font-semibold disabled:opacity-50"
                    >
                        {aiWriting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> AI is Writing...</>
                        ) : (
                            <><Sparkles className="w-4 h-4" /> Let AI Write Professional Email</>
                        )}
                    </button>
                </div>

                {/* PROFESSIONAL EMAIL PREVIEW */}
                {formData.professionalEmail && (
                    <div>
                        <label className="block text-sm font-mono text-[#806B58] mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418] mb-4"
                        />

                        <label className="block text-sm font-mono text-[#806B58] mb-2">
                            Professional Email (Review & Edit)
                        </label>
                        <textarea
                            rows={8}
                            value={formData.professionalEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, professionalEmail: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418] resize-none"
                        />
                    </div>
                )}

                {/* SEND BUTTON */}
                <button
                    onClick={handleSendEmail}
                    disabled={loading || !formData.fromEmail || !formData.recipientEmail || !formData.professionalEmail}
                    className="w-full py-4 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-all flex items-center justify-center gap-2 font-mono text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    {sent ? (
                        <><CheckCircle2 className="w-5 h-5" /> Email Sent Successfully!</>
                    ) : loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                    ) : (
                        <><Send className="w-5 h-5" /> Send Email</>
                    )}
                </button>
            </div>
        </section>
    )
}