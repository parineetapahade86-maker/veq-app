"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Brain, Save, Loader2, CheckCircle2, FileText, GitBranch, AlertTriangle, Lock } from "lucide-react"

export default function PublicExitBrainDumpPage() {
    const params = useParams()
    const router = useRouter()
    const token = params.token as string

    const [loading, setLoading] = useState(true)
    const [employee, setEmployee] = useState<any>(null)
    const [invalidToken, setInvalidToken] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        responsibilities: "",
        processes: "",
        decisions: "",
        unresolved: "",
        dependencies: ""
    })

    useEffect(() => {
        const validateToken = async () => {
            try {
                const res = await fetch(`/api/offboard/validate?token=${token}`)
                const data = await res.json()

                if (data.success) {
                    setEmployee(data.employee)
                } else {
                    setInvalidToken(true)
                }
            } catch (err) {
                setInvalidToken(true)
            } finally {
                setLoading(false)
            }
        }
        validateToken()
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch('/api/offboard/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    employeeName: employee.name,
                    companyId: employee.company_id,
                    ...formData
                })
            })
            const data = await res.json()
            if (data.success) {
                setSuccess(true)
            } else {
                alert("Failed to save. Please try again.")
            }
        } catch (err) {
            console.error(err)
            alert("An error occurred.")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <section className="min-h-screen flex items-center justify-center bg-cream-deep/20">
                <Loader2 className="w-10 h-10 text-brown animate-spin" />
            </section>
        )
    }

    if (invalidToken) {
        return (
            <section className="min-h-screen flex items-center justify-center bg-cream-deep/20 px-6">
                <div className="text-center max-w-md">
                    <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="font-display text-3xl text-brown italic mb-2">Invalid or Expired Link</h1>
                    <p className="text-muted">This secure handover link has expired or is invalid. Please contact your HR department for a new link.</p>
                </div>
            </section>
        )
    }

    if (success) {
        return (
            <section className="min-h-screen flex items-center justify-center bg-cream-deep/20 px-6">
                <div className="text-center max-w-lg">
                    <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-6" />
                    <h1 className="font-display text-4xl text-brown italic mb-4">Knowledge Captured!</h1>
                    <p className="text-muted mb-8">
                        Thank you, {employee.name}. Your insights have been securely saved to the company's memory graph. Wishing you the absolute best in your next chapter!
                    </p>
                    <button onClick={() => router.push('/')} className="px-6 py-3 bg-brown text-cream-deep rounded-xl font-mono text-sm font-semibold">
                        Return Home
                    </button>
                </div>
            </section>
        )
    }

    return (
        <section className="min-h-screen bg-cream-deep/20 px-6 py-16 md:py-24">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <Brain className="w-12 h-12 text-brown mx-auto mb-4" />
                    <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                        Your Knowledge Handover
                    </h1>
                    <p className="text-muted max-w-xl mx-auto">
                        Hello <strong>{employee.name}</strong>. Please share your key processes, decisions, and hidden dependencies. This will take about 10 minutes and ensures your legacy remains intact.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white/60 p-8 rounded-2xl border hairline">
                    <div>
                        <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Key Responsibilities & Daily Work</label>
                        <textarea required rows={4} value={formData.responsibilities} onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown text-sm"
                            placeholder="What did you do on a daily/weekly basis?" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Hidden Processes & SOPs</label>
                            <textarea rows={4} value={formData.processes} onChange={(e) => setFormData({ ...formData, processes: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown text-sm"
                                placeholder="Anything not in official docs but you know how it works?" />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Key Decisions & Context</label>
                            <textarea rows={4} value={formData.decisions} onChange={(e) => setFormData({ ...formData, decisions: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown text-sm"
                                placeholder="Why were certain vendors or strategies chosen?" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" /> Unresolved / Pending Items
                            </label>
                            <textarea rows={4} value={formData.unresolved} onChange={(e) => setFormData({ ...formData, unresolved: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown text-sm"
                                placeholder="What is left unfinished?" />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest flex items-center gap-2">
                                <GitBranch className="w-3 h-3" /> Hidden Dependencies
                            </label>
                            <textarea rows={4} value={formData.dependencies} onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown text-sm"
                                placeholder="Who do they talk to? Any undocumented quirks?" />
                        </div>
                    </div>

                    <button type="submit" disabled={submitting}
                        className="w-full px-8 py-4 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold disabled:opacity-50">
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Securing Your Legacy...</> : <><Save className="w-4 h-4" /> Submit Knowledge Handover</>}
                    </button>
                </form>
            </div>
        </section>
    )
}