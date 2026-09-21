// components/ChecklistCaptureForm.tsx (Client Component — the interactive part)
"use client"

import { useState } from "react"
import { Download, CheckCircle2, Loader2 } from "lucide-react"

export default function ChecklistCaptureForm() {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrorMsg("")

        try {
            const res = await fetch("/api/checklist-leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(data.error || "Something went wrong. Please try again.")
            }

            setSubmitted(true)
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Something went wrong.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl max-w-md mx-auto">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-green-800 font-semibold">Checklist sent to {email}!</p>
                <p className="text-green-700 text-sm mt-1">Check your inbox (and spam folder).</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email"
                    className="flex-1 px-5 py-4 rounded-xl bg-white border border-[#E9DED0] focus:outline-none focus:ring-2 focus:ring-[#C6A15B] font-mono text-sm"
                    required
                    disabled={isSubmitting}
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-4 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-colors font-mono text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4" /> Get Free Checklist
                        </>
                    )}
                </button>
            </div>
            {errorMsg && <p className="text-red-600 text-sm mt-2">{errorMsg}</p>}
        </form>
    )
}